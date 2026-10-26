"""Specimen: a self-hosted, Font Book style viewer for a folder of fonts."""
import hashlib
import io
import json
import logging
import os
import re
import shutil
import threading
import time
import unicodedata
import zipfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fontTools import subset as ftsubset
from fontTools.ttLib import TTCollection, TTFont

log = logging.getLogger("specimen")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logging.getLogger("fontTools").setLevel(logging.WARNING)
logging.getLogger("fontTools.subset").setLevel(logging.ERROR)

# LIBRARY_ROOT is the folder mounted into the container. The font folder is a subfolder of it,
# chosen in Settings (FONTS_SUBDIR is only the first-run default).
LIBRARY_ROOT = Path(os.environ.get("LIBRARY_ROOT", os.environ.get("FONTS_DIR", "/library"))).resolve()
DATA_DIR = Path(os.environ.get("DATA_DIR", "/data")).resolve()
CACHE_DIR = DATA_DIR / "cache"
TRASH_NAME = ".specimen-trash"
DATA_DIR.mkdir(parents=True, exist_ok=True)
_settings_path = DATA_DIR / "settings.json"
try:
    SETTINGS = json.loads(_settings_path.read_text("utf-8"))
except Exception:
    SETTINGS = {"fonts_subdir": os.environ.get("FONTS_SUBDIR", "").strip("/")}


def _resolve_fonts_dir(sub: str) -> Path:
    p = (LIBRARY_ROOT / sub).resolve() if sub else LIBRARY_ROOT
    if p != LIBRARY_ROOT and LIBRARY_ROOT not in p.parents:
        raise ValueError("Folder must be inside the library root")
    return p


FONTS_DIR = _resolve_fonts_dir(SETTINGS.get("fonts_subdir", ""))
TRASH_DIR = FONTS_DIR / TRASH_NAME
UPLOAD_SUBDIR = os.environ.get("UPLOAD_SUBDIR", "").strip("/")
RESCAN_SECONDS = int(os.environ.get("RESCAN_SECONDS", "60"))
INDEX_VERSION = 6

WEB_EXTS = {".otf", ".ttf", ".ttc", ".otc", ".woff", ".woff2"}
OTHER_EXTS = {".pfb", ".pfa", ".dfont"}
SCAN_EXTS = WEB_EXTS | OTHER_EXTS
SKIP_DIRS = {TRASH_NAME, "@eaDir", "#recycle", "__MACOSX", "$RECYCLE.BIN", ".zfs"}
MEDIA = {".otf": "font/otf", ".ttf": "font/ttf", ".woff": "font/woff", ".woff2": "font/woff2"}

for d in (DATA_DIR, CACHE_DIR):
    d.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------------------------------- storage

class JsonStore:
    def __init__(self, path, default):
        self.path = path
        self.lock = threading.RLock()
        try:
            self.data = json.loads(path.read_text("utf-8"))
        except Exception:
            self.data = default

    def save(self):
        with self.lock:
            tmp = self.path.with_suffix(".tmp")
            tmp.write_text(json.dumps(self.data, ensure_ascii=False, indent=1), "utf-8")
            os.replace(tmp, self.path)


INDEX = JsonStore(DATA_DIR / "index.json", {})
if INDEX.data.get("_v") != INDEX_VERSION:
    INDEX.data = {"_v": INDEX_VERSION, "files": {}}
TAGS = JsonStore(DATA_DIR / "tags.json", {})          # group id -> {licence, note, projects, name}
ACTIVITY = JsonStore(DATA_DIR / "activity.json", {"downloads": {}})
TRASH = JsonStore(DATA_DIR / "trash.json", {"batches": []})
# Manual merges: {"into": {source_key: target_key}, "names": {target_key: display name}}
MERGES = JsonStore(DATA_DIR / "merges.json", {"into": {}, "names": {}})


# --------------------------------------------------------------------------- atime-safe reads
# Font files may be opened directly over SMB, so their access time is a useful "last used"
# signal. Specimen must never bump it itself: it opens with O_NOATIME where allowed, puts the
# old atime back where it can, and otherwise remembers the atime its own read produced.

_O_NOATIME = getattr(os, "O_NOATIME", 0)


def read_preserving_atime(path: Path) -> bytes:
    st = path.stat()
    fd = None
    if _O_NOATIME:
        try:
            fd = os.open(path, os.O_RDONLY | _O_NOATIME)
        except OSError:
            fd = None
    if fd is None:
        fd = os.open(path, os.O_RDONLY)
    try:
        chunks = []
        while True:
            b = os.read(fd, 1 << 20)
            if not b:
                break
            chunks.append(b)
    finally:
        os.close(fd)
    data = b"".join(chunks)
    try:
        after = path.stat()
        if after.st_atime_ns != st.st_atime_ns:
            try:
                os.utime(path, ns=(st.st_atime_ns, st.st_mtime_ns))
            except OSError:
                try:
                    rel = relpath(path)
                except ValueError:  # staged upload outside the font folder
                    return data
                entry = INDEX.data["files"].get(rel)
                if entry is not None:
                    entry["self_atime"] = after.st_atime_ns
    except OSError:
        pass
    return data


# --------------------------------------------------------------------------- helpers

def relpath(p: Path) -> str:
    return p.resolve().relative_to(FONTS_DIR).as_posix()


def safe_abs(rel: str) -> Path:
    p = (FONTS_DIR / rel).resolve()
    if p != FONTS_DIR and FONTS_DIR not in p.parents:
        raise HTTPException(400, "Bad path")
    return p


def face_id(rel: str, index) -> str:
    return hashlib.sha1(f"{rel}#{index}".encode()).hexdigest()[:16]


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or "font"


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", unicodedata.normalize("NFKD", s or "").lower())


def split_camel(s: str) -> str:
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", s)
    s = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", s)
    return re.sub(r"[_\s]+", " ", s).strip()


# --------------------------------------------------------------------------- parsing

def _sample_for(cmap: dict) -> tuple[bool, str]:
    latin = all(ord(c) in cmap for c in "AaBbGg")
    if latin:
        return True, ""
    letters = [c for c in sorted(cmap) if c > 0x20 and unicodedata.category(chr(c))[0] in "LNS"]
    pick = letters[:: max(1, len(letters) // 12)][:12] if letters else sorted(cmap)[:12]
    return False, "".join(chr(c) for c in pick)


def _category(f, family: str, mono: bool) -> str:
    n = family.lower()
    if mono or re.search(r"\b(mono|code)\b", n):
        return "Monospaced"
    try:
        p = f["OS/2"].panose
        if p.bFamilyType == 3:
            return "Script"
        if p.bFamilyType == 4:
            return "Decorative"
        if p.bFamilyType == 5:
            return "Symbol"
        if p.bFamilyType == 2:
            if p.bSerifStyle in (11, 12, 13, 14, 15):
                return "Sans Serif"
            if 2 <= p.bSerifStyle <= 10:
                return "Serif"
    except Exception:
        pass
    if re.search(r"\bsans\b|grotesk|grotesque|gothic", n):
        return "Sans Serif"
    if re.search(r"serif|roman|antiqua|garamond|caslon", n):
        return "Serif"
    if re.search(r"script|hand|brush|signature", n):
        return "Script"
    return ""


def _extract(f, rel, index, fmt):
    name = f["name"] if "name" in f else None

    def nm(i):
        # Prefer the Windows English record (what design apps use), then any Windows record,
        # then whatever else exists. Old fonts often carry stale Mac-platform names.
        if not name or i is None:
            return ""
        try:
            rec = (name.getName(i, 3, 1, 0x409) or name.getName(i, 3, 0, 0x409)
                   or next((r for r in name.names if r.nameID == i and r.platformID == 3), None))
            v = rec.toUnicode() if rec else name.getDebugName(i)
            return (v or "").strip()
        except Exception:
            return ""

    os2 = f["OS/2"] if "OS/2" in f else None
    weight = int(getattr(os2, "usWeightClass", 400) or 400)
    if weight < 10:
        weight *= 100
    weight = max(1, min(1000, weight))
    width = int(getattr(os2, "usWidthClass", 5) or 5)
    style_raw = nm(2)
    typo_style = nm(17)
    italic = bool(getattr(os2, "fsSelection", 0) & 1)
    try:
        italic = italic or bool(f["head"].macStyle & 2)
    except Exception:
        pass
    if re.search(r"italic|oblique|slanted", f"{style_raw} {typo_style}", re.I):
        italic = True
    try:
        cmap = f.getBestCmap() or {}
    except Exception:
        cmap = {}
    try:
        mono = bool(f["post"].isFixedPitch)
    except Exception:
        mono = False
    latin, sample = _sample_for(cmap)
    axes, instances = [], []
    if "fvar" in f:
        for a in f["fvar"].axes:
            axes.append({"tag": a.axisTag, "name": nm(a.axisNameID) or a.axisTag,
                         "min": a.minValue, "default": a.defaultValue, "max": a.maxValue})
        for inst in f["fvar"].instances:
            instances.append({"name": nm(inst.subfamilyNameID), "coords": dict(inst.coordinates)})
    family_raw = nm(1)
    return {
        "index": index, "format": fmt, "web": True,
        "family_raw": family_raw, "style_raw": style_raw,
        "typo_family": nm(16) or nm(21), "typo_style": typo_style or nm(22),
        "full": nm(4), "ps": nm(6), "version": nm(5), "copyright": nm(0), "trademark": nm(7),
        "manufacturer": nm(8), "designer": nm(9), "description": nm(10), "vendor_url": nm(11),
        "designer_url": nm(12), "license": nm(13), "license_url": nm(14),
        "weight": weight, "width": width, "italic": italic, "mono": mono,
        "glyphs": int(f["maxp"].numGlyphs) if "maxp" in f else 0, "chars": len(cmap),
        "latin": latin, "sample": sample, "axes": axes, "instances": instances,
        "category": _category(f, nm(16) or family_raw, mono),
        "outlines": "CFF" if ("CFF " in f or "CFF2" in f) else "TrueType",
    }


def parse_file(abs_path: Path, rel: str, data: bytes | None = None) -> list[dict]:
    ext = abs_path.suffix.lower()
    if ext in (".pfb", ".pfa"):
        return [_parse_type1(abs_path, ext, data)]
    if ext == ".dfont":
        fam, _, sty = abs_path.stem.partition("-")
        return [{"index": None, "format": "dfont", "web": False, "family_raw": split_camel(fam),
                 "style_raw": split_camel(sty) or "Regular", "weight": 400, "width": 5,
                 "italic": "italic" in sty.lower(), "latin": True, "sample": "", "axes": [], "instances": []}]
    if data is None:
        data = read_preserving_atime(abs_path)
    fmt = ext.lstrip(".")
    if ext in (".ttc", ".otc"):
        coll = TTCollection(io.BytesIO(data), lazy=True)
        return [_extract(f, rel, i, fmt) for i, f in enumerate(coll.fonts)]
    f = TTFont(io.BytesIO(data), lazy=True)
    face = _extract(f, rel, None, fmt)
    return [face]


def _parse_type1(abs_path, ext, data=None):
    from fontTools import t1Lib
    info = {}
    try:
        # t1Lib only reads from a path, so parse a scratch copy to keep the original's atime intact
        tmp = CACHE_DIR / f"t1-{os.getpid()}-{threading.get_ident()}{ext}"
        tmp.write_bytes(data if data is not None else read_preserving_atime(abs_path))
        try:
            t = t1Lib.T1Font(str(tmp))
        finally:
            tmp.unlink(missing_ok=True)
        t.parse()
        info = t.font.get("FontInfo", {})
        ps = t.font.get("FontName", "")
    except Exception:
        ps = abs_path.stem
    fam = info.get("FamilyName") or split_camel(abs_path.stem)
    full = info.get("FullName") or fam
    style = full[len(fam):].strip() if full.startswith(fam) else (info.get("Weight") or "Regular")
    italic = bool(info.get("ItalicAngle", 0)) or "italic" in full.lower() or "oblique" in full.lower()
    wmap = {"thin": 100, "light": 300, "book": 400, "regular": 400, "medium": 500, "semibold": 600,
            "demibold": 600, "demi": 600, "bold": 700, "extrabold": 800, "heavy": 800, "black": 900}
    return {"index": None, "format": ext.lstrip("."), "web": False, "family_raw": fam,
            "style_raw": style or "Regular", "full": full, "ps": ps, "version": info.get("version", ""),
            "copyright": info.get("Copyright", "") or info.get("Notice", ""),
            "weight": wmap.get(str(info.get("Weight", "regular")).lower().replace(" ", ""), 400),
            "width": 5, "italic": italic, "latin": True, "sample": "", "axes": [], "instances": [],
            "outlines": "PostScript Type 1"}


# --------------------------------------------------------------------------- grouping

STYLE_WORDS = {
    "thin", "hairline", "extralight", "ultralight", "light", "book", "regular", "normal", "medium",
    "semibold", "demibold", "demi", "bold", "extrabold", "ultrabold", "heavy", "black", "extrablack",
    "ultrablack", "fat", "italic", "oblique", "ita", "it", "extra", "ultra", "semi", "slanted",
}
WIDTH_WORDS = {
    "narrow", "condensed", "cond", "cn", "compressed", "comp", "extended", "expanded", "wide",
    "semicondensed", "extracondensed", "ultracondensed", "semiexpanded", "extraexpanded",
    "ultraexpanded", "semiextended", "xcondensed", "xnarrow", "display", "text", "caption",
    "micro", "deck", "headline", "poster", "subhead", "banner", "titling",
    "jp", "kr", "sc", "tc", "hk",  # regional / small-caps cuts of the same design
}
WIDTH_PREFIX = {"semi", "extra", "ultra", "x", "xx"}


def derive_names(face: dict, rel: str) -> tuple[str, str]:
    """Return (family, style) for a face, repairing fonts that bake the style into the family."""
    typo = face.get("typo_family") or ""
    if typo:
        fam, style = typo, face.get("typo_style") or face.get("style_raw") or ""
    elif face.get("family_raw"):
        fam, style = face["family_raw"], face.get("style_raw") or ""
    else:
        stem = Path(rel).stem
        a, _, b = stem.partition("-")
        fam, style = split_camel(a), split_camel(b)
    if not typo:
        fam, stripped = strip_style_suffix(fam)
        if stripped:
            st = " ".join(stripped)
            if style and style.lower() not in ("regular", "normal", "roman") and style.lower() not in st.lower():
                st = f"{st} {style}"
            style = st
    return " ".join(fam.split()) or Path(rel).stem, style or "Regular"


def strip_style_suffix(fam: str) -> tuple[str, list[str]]:
    """Peel weight/style words off the end of a family name, whether they're joined by spaces,
    hyphens, underscores or camelCase: "Colaborate-Bold", "ColaborateLight", "Neusa ExtraBold"."""
    removed = []
    while True:
        m = re.search(r"[\s\-_]+([A-Za-z]+)$", fam)
        if m and m.start() > 0 and m.group(1).lower() in STYLE_WORDS:
            removed.insert(0, m.group(1))
            fam = fam[:m.start()]
            continue
        m = re.search(r"(?<=[a-z0-9])([A-Z][a-z]+(?:[A-Z][a-z]+)?)$", fam)
        if m and len(m.group(1)) > 3 and m.group(1).lower() in STYLE_WORDS:
            removed.insert(0, m.group(1))
            fam = fam[:m.start()]
            continue
        return fam.strip(" -_"), removed


def super_tokens(family: str) -> list[str]:
    toks = family.split()
    keep = toks[:1]
    i = 1
    while i < len(toks):
        t = toks[i].lower()
        nxt = toks[i + 1].lower() if i + 1 < len(toks) else ""
        if t in WIDTH_PREFIX and nxt in WIDTH_WORDS:
            i += 2
            continue
        if t in WIDTH_WORDS or re.fullmatch(r"\d{1,3}(pt)?", t):
            i += 1
            continue
        keep.append(toks[i])
        i += 1
    return keep


NAME_WEIGHTS = [("hairline", 50), ("thin", 100), ("extralight", 200), ("ultralight", 200), ("light", 300),
                ("book", 400), ("regular", 400), ("medium", 500), ("semibold", 600), ("demibold", 600),
                ("demi", 600), ("extrabold", 800), ("ultrabold", 800), ("bold", 700), ("heavy", 800),
                ("extrablack", 950), ("ultrablack", 950), ("black", 900), ("fat", 900)]


def sort_weight(f):
    """usWeightClass, unless it's the generic 400 and the style name clearly says otherwise."""
    w = f.get("weight", 400)
    if w == 400:
        st = re.sub(r"[\s\-_]", "", (f.get("style") or "").lower())
        for word, nw in sorted(NAME_WEIGHTS, key=lambda x: -len(x[0])):
            if word in st:
                return nw
    return w


def build_library(files: dict) -> dict:
    faces = {}
    ps_count = {}
    for rel, entry in files.items():
        for face in entry.get("faces", []):
            fid = face_id(rel, face.get("index"))
            fam, style = derive_names(face, rel)
            f = dict(face, id=fid, path=rel, family=fam, style=style, size=entry["size"],
                     mtime=entry["mtime"], seen=entry.get("seen", entry["mtime"]),
                     used=entry.get("used") or 0)
            faces[fid] = f
            if f.get("ps"):
                ps_count[f["ps"]] = ps_count.get(f["ps"], 0) + 1
    for f in faces.values():
        f["dup"] = bool(f.get("ps")) and ps_count.get(f["ps"], 0) > 1

    supers = {}
    for f in faces.values():
        toks = super_tokens(f["family"])
        key = norm(" ".join(toks))
        s = supers.setdefault(key, {"tokens": toks, "families": {}})
        s["families"].setdefault(norm(f["family"]), {"name": f["family"], "faces": []})["faces"].append(f)

    # apply manual merges (following chains, ignoring loops)
    into = MERGES.data.get("into", {})
    merged_keys = set()

    def resolve(k):
        seen = set()
        while k in into and k not in seen:
            seen.add(k)
            k = into[k]
        return k
    for k in list(supers):
        t = resolve(k)
        if t != k and t in supers and k in supers:
            for fk, fam in supers.pop(k)["families"].items():
                supers[t]["families"].setdefault(fk, {"name": fam["name"], "faces": []})["faces"] += fam["faces"]
            merged_keys.add(t)

    groups, used_ids = {}, set()
    for key, s in supers.items():
        fams = list(s["families"].values())
        base = s["families"].get(key)
        if MERGES.data.get("names", {}).get(key):
            name = MERGES.data["names"][key]
        elif len(fams) == 1:
            name = fams[0]["name"]
        elif base:
            name = base["name"]
        else:
            name = " ".join(s["tokens"])
        for fam in fams:
            fam["faces"].sort(key=lambda f: (sort_weight(f), f["italic"], f["style"]))
            fam["width"] = sum(f["width"] for f in fam["faces"]) / len(fam["faces"])
        fams.sort(key=lambda fm: (fm is not base, abs(fm["width"] - 5), fm["width"], fm["name"].lower()))
        all_faces = [f for fm in fams for f in fm["faces"]]
        web = [f for f in all_faces if f.get("web")]
        pool = [f for f in (fams[0]["faces"]) if f.get("web")] or web
        default = min(pool, key=lambda f: (f["italic"], abs(f["weight"] - 400))) if pool else all_faces[0]
        gid = slug(name)
        n = 2
        while gid in used_ids:
            gid = f"{slug(name)}-{n}"
            n += 1
        used_ids.add(gid)
        for f in all_faces:
            f["group"] = gid
        cats = [f.get("category") for f in all_faces if f.get("category")]
        groups[gid] = {
            "id": gid, "name": name, "key": key, "merged": key in merged_keys,
            "families": [{"name": fm["name"], "faces": [f["id"] for f in fm["faces"]]} for fm in fams],
            "styles": len(all_faces), "default": default["id"],
            "latin": default.get("latin", True), "sample": default.get("sample", ""),
            "mono": any(f.get("mono") for f in all_faces),
            "variable": any(f.get("axes") for f in all_faces),
            "category": max(set(cats), key=cats.count) if cats else "",
            "added": max(f["seen"] for f in all_faces),
            "used": max(f["used"] for f in all_faces),
            "size": sum({f["path"]: f["size"] for f in all_faces}.values()),
            "formats": sorted({f["format"] for f in all_faces}),
            "previewable": bool(web), "dup": any(f["dup"] for f in all_faces),
        }
    return {"faces": faces, "groups": groups}


# --------------------------------------------------------------------------- scanner

def migrate_tags(state):
    """Keep tags attached to their fonts when grouping changes a family's id.
    Each tag entry remembers which files it covers; an entry whose id no longer exists moves to the
    family that now holds those files (or, for entries saved before files were tracked, the family
    whose name matches once style words are stripped)."""
    groups, faces = state["groups"], state["faces"]
    if not groups:
        return
    group_files = {gid: sorted({faces[fid]["path"] for fam in g["families"] for fid in fam["faces"]})
                   for gid, g in groups.items()}
    by_path = {p: gid for gid, ps in group_files.items() for p in ps}
    by_name = {norm(g["name"]): gid for gid, g in groups.items()}
    changed = False
    for old in [k for k in TAGS.data if k not in groups]:
        t = TAGS.data[old]
        targets = {by_path[p] for p in t.get("files", []) if p in by_path}
        if not targets and t.get("name"):
            for candidate in (t["name"], strip_style_suffix(t["name"])[0]):
                if norm(candidate) in by_name:
                    targets = {by_name[norm(candidate)]}
                    break
        if not targets:
            continue  # its fonts aren't here right now (e.g. a different folder); keep it for later
        for gid in targets:
            d = TAGS.data.setdefault(gid, {})
            d["projects"] = _clean_projects(d.get("projects", []) + t.get("projects", []))
            if not d.get("licence") and t.get("licence"):
                d["licence"] = t["licence"]
            if t.get("note") and t["note"] not in (d.get("note") or ""):
                d["note"] = "\n".join(filter(None, [d.get("note", ""), t["note"]]))
        del TAGS.data[old]
        changed = True
    for gid, t in TAGS.data.items():
        if gid in groups and (t.get("files") != group_files[gid] or t.get("name") != groups[gid]["name"]):
            t["files"], t["name"] = group_files[gid], groups[gid]["name"]
            changed = True
    if changed:
        TAGS.save()


class Scanner:
    def __init__(self):
        self.lock = threading.Lock()
        self.state = {"faces": {}, "groups": {}}
        self.scanning = False
        self.progress = [0, 0]
        self.errors = {}
        self.last_scan = 0.0

    def walk(self):
        out = {}
        if not FONTS_DIR.exists():
            return out
        for root, dirs, files in os.walk(FONTS_DIR):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
            for fn in files:
                if fn.startswith("."):
                    continue
                p = Path(root) / fn
                if p.suffix.lower() not in SCAN_EXTS:
                    continue
                try:
                    out[relpath(p)] = p.stat()
                except OSError:
                    pass
        return out

    def scan(self, force=False):
        if not self.lock.acquire(blocking=False):
            return
        try:
            self.scanning = True
            files = INDEX.data["files"]
            found = self.walk()
            todo = [r for r, st in found.items()
                    if force or r not in files or files[r]["mtime"] != st.st_mtime_ns or files[r]["size"] != st.st_size]
            self.progress = [0, len(todo)]
            changed = bool(todo) or any(r not in found for r in files)
            for r in list(files):
                if r not in found:
                    del files[r]
            now = time.time()
            for i, rel in enumerate(todo):
                st = found[rel]
                prev = files.get(rel, {})
                sha = ""
                try:
                    data = read_preserving_atime(FONTS_DIR / rel)
                    sha = hashlib.sha256(data).hexdigest()
                    faces = parse_file(FONTS_DIR / rel, rel, data)
                    self.errors.pop(rel, None)
                except Exception as e:  # unreadable or corrupt font
                    log.warning("Could not read %s: %s", rel, e)
                    self.errors[rel] = str(e)[:200]
                    faces = []
                try:
                    atime_after = (FONTS_DIR / rel).stat().st_atime_ns
                except OSError:
                    atime_after = st.st_atime_ns
                # First sighting: the existing atime is real history from before Specimen ran.
                first_used = st.st_atime_ns / 1e9 if st.st_atime_ns > st.st_mtime_ns else 0
                files[rel] = {"mtime": st.st_mtime_ns, "size": st.st_size, "faces": faces, "sha": sha,
                              "seen": prev.get("seen", now), "used": prev.get("used", first_used),
                              "atime": atime_after, "self_atime": atime_after}
                found[rel] = None  # already reconciled; skip in the atime pass below
                self.progress = [i + 1, len(todo)]
                if i % 100 == 99:
                    self.state = build_library(files)
                    INDEX.save()
            # last used: an atime newer than the one we last saw, and not caused by Specimen
            for rel, st in found.items():
                e = files.get(rel)
                if not e or st is None:
                    continue
                a = st.st_atime_ns
                if a != e.get("atime"):
                    if a != e.get("self_atime") and a > (e.get("atime") or 0):
                        e["used"] = a / 1e9
                        changed = True
                    e["atime"] = a
            if changed or not self.state["faces"]:
                self.state = build_library(files)
                migrate_tags(self.state)
            INDEX.save()
            self.last_scan = time.time()
            self.prune_cache()
            self.scanning = False  # index is ready; preview warming below is just background work
            self.warm_previews()
        finally:
            self.scanning = False
            self.lock.release()

    def scan_async(self, force=False):
        threading.Thread(target=self.scan, kwargs={"force": force}, daemon=True).start()

    def maybe_rescan(self):
        if time.time() - self.last_scan > RESCAN_SECONDS and not self.scanning:
            self.scan_async()

    def warm_previews(self):
        """Build grid previews ahead of time so a big library opens instantly."""
        for g in list(self.state["groups"].values()):
            f = self.state["faces"].get(g["default"])
            if not f or not f.get("web"):
                continue
            if (CACHE_DIR / f"p-{f['id']}-{f['mtime']}.woff2").exists():
                continue
            try:
                preview_bytes(f)
            except Exception as e:
                log.warning("Preview failed for %s: %s", f["path"], e)

    def prune_cache(self):
        valid = {f"{f['id']}-{f['mtime']}" for f in self.state["faces"].values()}
        for p in CACHE_DIR.iterdir():
            parts = p.stem.split("-", 1)
            if len(parts) == 2 and parts[1] not in valid:
                p.unlink(missing_ok=True)


SCANNER = Scanner()


# --------------------------------------------------------------------------- font bytes

def face_or_404(fid):
    f = SCANNER.state["faces"].get(fid)
    if not f:
        raise HTTPException(404, "Font not found")
    return f


def face_font_bytes(f) -> tuple[bytes, str]:
    """Bytes the browser can load for one face (extracts faces out of collections)."""
    p = safe_abs(f["path"])
    if f.get("index") is None:
        return read_preserving_atime(p), MEDIA.get(p.suffix.lower(), "application/octet-stream")
    ext = ".otf" if f.get("outlines") == "CFF" else ".ttf"
    out = CACHE_DIR / f"x-{f['id']}-{f['mtime']}{ext}"
    if not out.exists():
        font = TTFont(io.BytesIO(read_preserving_atime(p)), fontNumber=f["index"])
        tmp = out.with_suffix(".part")
        font.save(tmp)
        os.replace(tmp, out)
    return out.read_bytes(), MEDIA[ext]


def preview_bytes(f) -> tuple[bytes, str]:
    out = CACHE_DIR / f"p-{f['id']}-{f['mtime']}.woff2"
    if out.exists():
        return out.read_bytes(), "font/woff2"
    data, media = face_font_bytes(f)
    try:
        font = TTFont(io.BytesIO(data))
        cmap = font.getBestCmap() or {}
        wanted = set(range(0x20, 0x7F)) | set(range(0xA0, 0x180)) | {ord(c) for c in f.get("sample", "")}
        have = wanted & set(cmap)
        if len(have) < 40:
            have |= set(sorted(cmap)[:400])
        opts = ftsubset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.name_languages = ["*"]
        opts.notdef_outline = True
        opts.hinting = False
        sub = ftsubset.Subsetter(opts)
        sub.populate(unicodes=have)
        sub.subset(font)
        font.flavor = "woff2"
        tmp = out.with_suffix(".part")
        font.save(tmp)
        os.replace(tmp, out)
        return out.read_bytes(), "font/woff2"
    except Exception as e:
        log.warning("Preview subset failed for %s: %s", f["path"], e)
        return data, media


# --------------------------------------------------------------------------- API

app = FastAPI(title="Specimen")
app.add_middleware(GZipMiddleware, minimum_size=1024)
STATIC = Path(__file__).parent / "static"
LONG_CACHE = {"Cache-Control": "public, max-age=31536000, immutable"}

PUBLIC_FACE = ("id", "family", "style", "weight", "width", "italic", "format", "web", "axes",
               "instances", "path", "size", "dup", "index", "mtime", "latin", "sample")


def tags_for(gid):
    t = TAGS.data.get(gid) or {}
    return {"licence": t.get("licence"), "note": t.get("note", ""), "projects": t.get("projects", [])}


@app.on_event("startup")
def _startup():
    if INDEX.data["files"]:
        SCANNER.state = build_library(INDEX.data["files"])
        migrate_tags(SCANNER.state)
    SCANNER.scan_async()


@app.get("/api/library")
def library():
    SCANNER.maybe_rescan()
    st = SCANNER.state
    downloads = ACTIVITY.data["downloads"]
    groups = []
    for g in st["groups"].values():
        g = dict(g, tags=tags_for(g["id"]), downloaded=downloads.get(g["id"], 0))
        g["faces"] = [{k: st["faces"][fid].get(k) for k in PUBLIC_FACE}
                      for fam in g["families"] for fid in fam["faces"]]
        groups.append(g)
    groups.sort(key=lambda g: g["name"].lower())
    return {"groups": groups, "scanning": SCANNER.scanning, "progress": SCANNER.progress,
            "errors": len(SCANNER.errors), "trash": len(TRASH.data["batches"]),
            "fonts_dir": str(FONTS_DIR)}


@app.get("/api/status")
def status():
    return {"scanning": SCANNER.scanning, "progress": SCANNER.progress, "errors": SCANNER.errors}


@app.get("/api/settings")
def get_settings():
    return {"root": str(LIBRARY_ROOT), "subdir": SETTINGS.get("fonts_subdir", ""),
            "fonts_dir": str(FONTS_DIR), "exists": FONTS_DIR.is_dir(),
            "writable": os.access(FONTS_DIR, os.W_OK), "rescan_seconds": RESCAN_SECONDS}


@app.get("/api/browse")
def browse(path: str = ""):
    """List subfolders of a folder inside the library root, for the folder picker."""
    try:
        p = _resolve_fonts_dir(path.strip("/"))
    except ValueError:
        raise HTTPException(400, "Outside library root")
    if not p.is_dir():
        raise HTTPException(404, "Folder not found")
    dirs, fonts = [], 0
    try:
        for e in sorted(os.scandir(p), key=lambda e: e.name.lower()):
            if e.is_dir(follow_symlinks=False) and e.name not in SKIP_DIRS and not e.name.startswith("."):
                dirs.append(e.name)
            elif e.is_file() and Path(e.name).suffix.lower() in SCAN_EXTS:
                fonts += 1
    except PermissionError:
        raise HTTPException(403, "No permission to read this folder")
    rel = "" if p == LIBRARY_ROOT else p.relative_to(LIBRARY_ROOT).as_posix()
    return {"path": rel, "dirs": dirs, "fonts_here": fonts}


@app.put("/api/settings")
async def put_settings(request: Request):
    global FONTS_DIR, TRASH_DIR
    body = await request.json()
    sub = str(body.get("subdir", "")).strip("/")
    try:
        new = _resolve_fonts_dir(sub)
    except ValueError:
        raise HTTPException(400, "Folder must be inside the library root")
    if not new.is_dir():
        raise HTTPException(404, "That folder doesn't exist")
    if new != FONTS_DIR:
        with SCANNER.lock:
            FONTS_DIR, TRASH_DIR = new, new / TRASH_NAME
            SETTINGS["fonts_subdir"] = sub
            _settings_path.write_text(json.dumps(SETTINGS, indent=1), "utf-8")
            INDEX.data = {"_v": INDEX_VERSION, "files": {}}
            INDEX.save()
            SCANNER.state = {"faces": {}, "groups": {}}
            SCANNER.errors = {}
        SCANNER.scan_async()
    return get_settings()


@app.post("/api/rescan")
def rescan():
    SCANNER.scan_async(force=False)
    return {"ok": True}


@app.get("/api/group/{gid}")
def group_detail(gid: str):
    st = SCANNER.state
    g = st["groups"].get(gid)
    if not g:
        raise HTTPException(404, "Family not found")
    faces = {fid: st["faces"][fid] for fam in g["families"] for fid in fam["faces"]}
    return dict(g, tags=tags_for(gid), faces=faces, downloaded=ACTIVITY.data["downloads"].get(gid, 0))


@app.get("/api/face/{fid}/preview")
def face_preview(fid: str):
    data, media = preview_bytes(face_or_404(fid))
    return Response(data, media_type=media, headers=LONG_CACHE)


@app.get("/api/face/{fid}/font")
def face_font(fid: str):
    f = face_or_404(fid)
    if not f.get("web"):
        raise HTTPException(415, "This format can't be previewed in a browser")
    data, media = face_font_bytes(f)
    return Response(data, media_type=media, headers=LONG_CACHE)


@app.get("/api/face/{fid}/chars")
def face_chars(fid: str):
    f = face_or_404(fid)
    data, _ = face_font_bytes(f)
    font = TTFont(io.BytesIO(data), lazy=True)
    cmap = font.getBestCmap() or {}
    return {"chars": sorted(cmap)}


@app.get("/api/face/{fid}/char/{cp}")
def face_char(fid: str, cp: int):
    f = face_or_404(fid)
    data, _ = face_font_bytes(f)
    cmap = TTFont(io.BytesIO(data), lazy=True).getBestCmap() or {}
    ch = chr(cp)
    return {"cp": cp, "name": unicodedata.name(ch, ""), "category": unicodedata.category(ch),
            "glyph": cmap.get(cp, "")}


def _record_download(gids):
    now = time.time()
    for gid in gids:
        ACTIVITY.data["downloads"][gid] = now
    ACTIVITY.save()


def _zip_response(paths: list[str], folder: str, filename: str):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        names = set()
        for rel in dict.fromkeys(paths):
            p = safe_abs(rel)
            arc = f"{folder}/{p.name}"
            n = 2
            while arc in names:
                arc = f"{folder}/{p.stem} ({n}){p.suffix}"
                n += 1
            names.add(arc)
            z.writestr(arc, read_preserving_atime(p))
    return Response(buf.getvalue(), media_type="application/zip",
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@app.get("/api/face/{fid}/download")
def face_download(fid: str):
    f = face_or_404(fid)
    p = safe_abs(f["path"])
    _record_download([f["group"]])
    return Response(read_preserving_atime(p), media_type="application/octet-stream",
                    headers={"Content-Disposition": f'attachment; filename="{p.name}"'})


@app.get("/api/download")
def download(groups: str = "", faces: str = "", name: str = ""):
    st = SCANNER.state
    paths, gids = [], []
    for gid in filter(None, groups.split(",")):
        g = st["groups"].get(gid)
        if g:
            gids.append(gid)
            paths += [st["faces"][fid]["path"] for fam in g["families"] for fid in fam["faces"]]
    for fid in filter(None, faces.split(",")):
        f = st["faces"].get(fid)
        if f:
            gids.append(f["group"])
            paths.append(f["path"])
    if not paths:
        raise HTTPException(404, "Nothing to download")
    gids = list(dict.fromkeys(gids))
    if len(dict.fromkeys(paths)) == 1 and not groups:
        return face_download(next(fid for fid in faces.split(",") if fid in st["faces"]))
    label = name or (st["groups"][gids[0]]["name"] if len(gids) == 1 else "Fonts")
    _record_download(gids)
    safe = re.sub(r'[\\/:*?"<>|]+', "", label).strip() or "Fonts"
    return _zip_response(paths, safe, f"{safe}.zip")


# ---- tags

def _clean_projects(items):
    out = []
    for p in items or []:
        p = re.sub(r"\s+", " ", str(p)).strip()
        if p and p.upper() not in (x.upper() for x in out):
            out.append(p)
    return out


def _set_tags(gid, licence=..., note=..., projects=..., add=None, remove=None):
    g = SCANNER.state["groups"].get(gid)
    t = TAGS.data.setdefault(gid, {})
    if g:
        t["name"] = g["name"]
    if licence is not ...:
        t["licence"] = licence if licence in ("open", "closed") else None
    if note is not ...:
        t["note"] = (note or "").strip()[:500]
    if projects is not ...:
        t["projects"] = _clean_projects(projects)
    if add:
        t["projects"] = _clean_projects(t.get("projects", []) + add)
    if remove:
        rm = {x.upper() for x in remove}
        t["projects"] = [p for p in t.get("projects", []) if p.upper() not in rm]


@app.put("/api/group/{gid}/tags")
async def put_tags(gid: str, request: Request):
    body = await request.json()
    _set_tags(gid, **{k: body[k] for k in ("licence", "note", "projects") if k in body})
    TAGS.save()
    return tags_for(gid)


@app.post("/api/tags/bulk")
async def bulk_tags(request: Request):
    body = await request.json()
    for gid in body.get("groups", []):
        kw = {}
        if "licence" in body:
            kw["licence"] = body["licence"]
        _set_tags(gid, add=body.get("add"), remove=body.get("remove"), **kw)
    TAGS.save()
    return {"ok": True}


# ---- manual family merges

def _rebuild():
    SCANNER.state = build_library(INDEX.data["files"])
    migrate_tags(SCANNER.state)


@app.post("/api/merge")
async def merge_groups(request: Request):
    """Combine several families into one tile. Display only: no files are renamed or moved."""
    body = await request.json()
    groups = SCANNER.state["groups"]
    ids = [g for g in dict.fromkeys(body.get("groups", [])) if g in groups]
    keep = body.get("keep") if body.get("keep") in ids else (ids[0] if ids else None)
    if len(ids) < 2:
        raise HTTPException(400, "Select at least two families to merge")
    target = groups[keep]
    into, names = MERGES.data.setdefault("into", {}), MERGES.data.setdefault("names", {})
    for gid in ids:
        if gid == keep:
            continue
        src = groups[gid]["key"]
        into[src] = target["key"]
        for k, v in list(into.items()):  # anything merged into the source now goes to the target
            if v == src:
                into[k] = target["key"]
        names.pop(src, None)
    names[target["key"]] = target["name"]
    # combine tags onto the kept family
    t = TAGS.data.setdefault(keep, {})
    t["name"] = target["name"]
    for gid in ids:
        if gid == keep:
            continue
        o = TAGS.data.pop(gid, None) or {}
        t["projects"] = _clean_projects(t.get("projects", []) + o.get("projects", []))
        if not t.get("licence") and o.get("licence"):
            t["licence"] = o["licence"]
        if o.get("note") and o["note"] not in (t.get("note") or ""):
            t["note"] = "\n".join(filter(None, [t.get("note", ""), o["note"]]))
    MERGES.save()
    TAGS.save()
    _rebuild()
    new_id = next((g["id"] for g in SCANNER.state["groups"].values() if g["key"] == target["key"]), keep)
    return {"ok": True, "id": new_id}


@app.post("/api/group/{gid}/split")
def split_group(gid: str):
    """Undo manual merges into this family. Each restored family starts with a copy of its tags."""
    g = SCANNER.state["groups"].get(gid)
    if not g:
        raise HTTPException(404, "Family not found")
    into = MERGES.data.setdefault("into", {})
    sources = [k for k, v in into.items() if v == g["key"]]
    if not sources:
        raise HTTPException(400, "This family wasn't merged by hand")
    for k in sources:
        into.pop(k)
    MERGES.data.setdefault("names", {}).pop(g["key"], None)
    MERGES.save()
    tags = dict(TAGS.data.get(gid) or {})
    _rebuild()
    restored = [x for x in SCANNER.state["groups"].values() if x["key"] in sources or x["key"] == g["key"]]
    for x in restored:
        if x["id"] not in TAGS.data and tags:
            TAGS.data[x["id"]] = dict(tags, name=x["name"])
    TAGS.save()
    return {"ok": True, "groups": [x["id"] for x in restored]}


@app.get("/api/tags/export")
def export_tags():
    out = []
    for gid, g in SCANNER.state["groups"].items():
        t = tags_for(gid)
        if t["licence"] or t["note"] or t["projects"]:
            out.append({"family": g["name"], "id": gid, **t})
    return JSONResponse(out, headers={"Content-Disposition": 'attachment; filename="specimen-tags.json"'})


@app.post("/api/tags/import")
async def import_tags(request: Request):
    """Accepts a list of {family|id|files, licence, note, projects}.
    Matches by id, then by any listed file name (case-insensitive, any subfolder), then by family name."""
    items = await request.json()
    if isinstance(items, dict):
        items = [dict(v, id=k) for k, v in items.items()]
    st = SCANNER.state
    groups = st["groups"]
    by_name, by_file = {}, {}
    for gid, g in groups.items():
        by_name.setdefault(norm(g["name"]), gid)
        by_name.setdefault(g["key"], gid)
        for fam in g["families"]:
            by_name.setdefault(norm(fam["name"]), gid)
    for f in st["faces"].values():
        by_file.setdefault(Path(f["path"]).name.lower(), set()).add(f["group"])
    matched, unmatched, tagged = 0, [], set()
    for it in items:
        gids = set()
        if it.get("id") in groups:
            gids.add(it["id"])
        for fn in it.get("files") or []:
            gids |= by_file.get(Path(str(fn)).name.lower(), set())
        if not gids and by_name.get(norm(it.get("family", ""))):
            gids.add(by_name[norm(it["family"])])
        if not gids:
            unmatched.append(it.get("family") or it.get("id") or ", ".join(it.get("files", [])[:2]))
            continue
        kw = {}
        if "licence" in it:
            kw["licence"] = it["licence"]
        if "note" in it:
            kw["note"] = it["note"]
        for gid in gids:
            _set_tags(gid, add=_clean_projects(it.get("projects")), **kw)
            tagged.add(gid)
        matched += 1
    TAGS.save()
    return {"matched": matched, "families": len(tagged), "unmatched": unmatched}


# ---- delete / trash / restore

def _unique_target(p: Path) -> Path:
    if not p.exists():
        return p
    n = 2
    while True:
        c = p.with_name(f"{p.stem} ({n}){p.suffix}")
        if not c.exists():
            return c
        n += 1


@app.post("/api/delete")
async def delete(request: Request):
    body = await request.json()
    st = SCANNER.state
    paths, names = [], []
    for gid in body.get("groups", []):
        g = st["groups"].get(gid)
        if g:
            names.append(g["name"])
            paths += [st["faces"][fid]["path"] for fam in g["families"] for fid in fam["faces"]]
    for fid in body.get("faces", []):
        f = st["faces"].get(fid)
        if f:
            names.append(f"{f['family']} {f['style']}")
            paths.append(f["path"])
    paths = list(dict.fromkeys(paths))
    if not paths:
        raise HTTPException(404, "Nothing to delete")
    batch, moved = _trash_paths(paths, names)
    SCANNER.scan()
    return {"ok": True, "batch": batch, "files": len(moved)}


def _trash_paths(paths, names):
    """Move files (relative to the font folder) into a restorable Recently Deleted batch."""
    batch = time.strftime("%Y%m%d-%H%M%S") + "-" + hashlib.sha1("".join(paths).encode()).hexdigest()[:6]
    moved = []
    for rel in paths:
        src = safe_abs(rel)
        if not src.exists():
            continue
        dst = TRASH_DIR / batch / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dst))
        moved.append(rel)
    TRASH.data["batches"].insert(0, {"id": batch, "time": time.time(), "names": names, "files": moved,
                                     "dir": str(FONTS_DIR)})
    TRASH.save()
    return batch, moved


@app.get("/api/trash")
def trash():
    return TRASH.data["batches"]


@app.post("/api/trash/{batch}/restore")
def restore(batch: str):
    b = next((b for b in TRASH.data["batches"] if b["id"] == batch), None)
    if not b:
        raise HTTPException(404, "Not in Recently Deleted")
    home = Path(b.get("dir") or FONTS_DIR)
    root = home / TRASH_NAME / batch
    for rel in b["files"]:
        src = (root / rel).resolve()
        if root.resolve() not in src.parents or not src.exists():
            continue
        dst = (home / rel).resolve()
        if home.resolve() not in dst.parents:
            continue
        dst = _unique_target(dst)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dst))
    shutil.rmtree(root, ignore_errors=True)
    TRASH.data["batches"].remove(b)
    TRASH.save()
    SCANNER.scan()
    return {"ok": True}


@app.delete("/api/trash/{batch}")
def purge(batch: str):
    b = next((b for b in TRASH.data["batches"] if b["id"] == batch), None)
    if not b:
        raise HTTPException(404, "Not in Recently Deleted")
    if re.fullmatch(r"[\w-]+", batch):
        shutil.rmtree(Path(b.get("dir") or FONTS_DIR) / TRASH_NAME / batch, ignore_errors=True)
    TRASH.data["batches"].remove(b)
    TRASH.save()
    return {"ok": True}


@app.delete("/api/trash")
def empty_trash():
    for b in list(TRASH.data["batches"]):
        if re.fullmatch(r"[\w-]+", b["id"]):
            shutil.rmtree(Path(b.get("dir") or FONTS_DIR) / TRASH_NAME / b["id"], ignore_errors=True)
    TRASH.data["batches"] = []
    TRASH.save()
    return {"ok": True}


# ---- upload

def _safe_name(name: str) -> str:
    name = Path(name.replace("\\", "/")).name
    return re.sub(r'[<>:"|?*\x00-\x1f]', "", name).strip() or "font"


STAGING_DIR = DATA_DIR / "staging"
shutil.rmtree(STAGING_DIR, ignore_errors=True)  # leftovers from an interrupted upload


def _check_against_library(items):
    """Label each staged font: new, identical (same bytes), same (same font, other file) or repeat."""
    st = SCANNER.state
    by_sha, by_ps = {}, {}
    for rel, e in INDEX.data["files"].items():
        if e.get("sha"):
            by_sha.setdefault(e["sha"], rel)
    for f in st["faces"].values():
        if f.get("ps"):
            by_ps.setdefault(f["ps"], []).append(f)
    seen = {}
    for it in items:
        it["matches"] = []
        if it["sha"] in seen:
            it["status"], it["matches"] = "repeat", [seen[it["sha"]]]
            continue
        seen[it["sha"]] = it["name"]
        if it["sha"] in by_sha:
            it["status"], it["matches"] = "identical", [by_sha[it["sha"]]]
            continue
        hits = {}
        for face in it["faces"]:
            for f in by_ps.get(face.get("ps") or "\0", []):
                hits[f["path"]] = f.get("version", "")
        if hits:
            it["status"] = "same"
            it["matches"] = sorted(hits)
            it["existing_version"] = next(iter(hits.values()), "")
        else:
            it["status"] = "new"


def _public_item(it):
    face = it["faces"][0] if it["faces"] else {}
    fam, style = derive_names(face, it["dest"]) if face else (Path(it["name"]).stem, "")
    return {"name": it["name"], "dest": it["dest"], "status": it["status"], "matches": it["matches"],
            "family": fam, "style": style, "version": face.get("version", ""),
            "existing_version": it.get("existing_version", ""), "error": it.get("error", "")}


def _commit(token, mode):
    """mode: skip (only new fonts), keep (also keep other versions alongside), replace (swap them)."""
    stage = STAGING_DIR / token
    manifest = json.loads((stage / "manifest.json").read_text("utf-8"))
    keep, skipped, replaced, to_trash = [], [], [], []
    for it in manifest:
        status = it["status"]
        if status in ("identical", "repeat", "invalid") or (status == "same" and mode == "skip"):
            skipped.append(it["name"])
            continue
        dest = it["dest"]
        if status == "same" and mode == "replace":
            # the new version goes where the old one lived; the old one moves to Recently Deleted
            dest = str(Path(it["matches"][0]).parent / Path(it["dest"]).name)
            to_trash += it["matches"]
            replaced.append(it["name"])
        keep.append((it, dest))
    if to_trash:
        _trash_paths(list(dict.fromkeys(to_trash)), [f"{n} (replaced by upload)" for n in replaced])
    saved = []
    for it, dest in keep:
        target = _unique_target(safe_abs(dest))
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(stage / it["staged"]), str(target))
        saved.append(relpath(target))
    shutil.rmtree(stage, ignore_errors=True)
    SCANNER.scan()
    return {"committed": True, "saved": saved, "skipped": skipped, "replaced": replaced}


@app.post("/api/upload")
async def upload(files: list[UploadFile] = File(...)):
    """Stage uploads, compare them with the library, and only save straight away if none are duplicates."""
    base = FONTS_DIR / UPLOAD_SUBDIR if UPLOAD_SUBDIR else FONTS_DIR
    base_rel = "" if base == FONTS_DIR else relpath(safe_abs(UPLOAD_SUBDIR))
    token = hashlib.sha1(f"{time.time()}{os.getpid()}".encode()).hexdigest()[:16]
    stage = STAGING_DIR / token
    stage.mkdir(parents=True, exist_ok=True)
    items, rejected = [], []

    def add(name, data, dest):
        staged = f"{len(items):04d}{Path(name).suffix.lower()}"
        (stage / staged).write_bytes(data)
        it = {"name": name, "dest": dest, "staged": staged, "sha": hashlib.sha256(data).hexdigest()}
        try:
            it["faces"] = parse_file(stage / staged, dest, data)
        except Exception as e:
            it["faces"], it["error"] = [], str(e)[:200]
        items.append(it)

    for up in files:
        data = await up.read()
        name = _safe_name(up.filename or "font")
        ext = Path(name).suffix.lower()
        if ext == ".zip":
            folder = "/".join(filter(None, [base_rel, _safe_name(Path(name).stem)]))
            try:
                with zipfile.ZipFile(io.BytesIO(data)) as z:
                    for info in z.infolist():
                        inner = info.filename
                        if info.is_dir() or "__MACOSX" in inner or Path(inner).name.startswith("."):
                            continue
                        if Path(inner).suffix.lower() not in SCAN_EXTS:
                            continue
                        n = _safe_name(inner)
                        add(n, z.read(info), f"{folder}/{n}")
            except zipfile.BadZipFile:
                rejected.append(name)
        elif ext in SCAN_EXTS:
            add(name, data, "/".join(filter(None, [base_rel, name])))
        else:
            rejected.append(name)

    _check_against_library(items)
    for it in items:
        if it.get("error") and it["status"] == "new":
            it["status"] = "invalid"
    (stage / "manifest.json").write_text(json.dumps(items), "utf-8")
    if not any(it["status"] in ("identical", "same", "repeat", "invalid") for it in items):
        r = _commit(token, "skip")
        r["rejected"] = rejected
        return r
    return {"committed": False, "token": token, "rejected": rejected, "items": [_public_item(it) for it in items]}


@app.post("/api/upload/{token}/commit")
async def upload_commit(token: str, request: Request):
    if not re.fullmatch(r"[0-9a-f]{16}", token) or not (STAGING_DIR / token).is_dir():
        raise HTTPException(404, "That upload has expired. Add the fonts again.")
    mode = (await request.json()).get("mode", "skip")
    if mode not in ("skip", "keep", "replace"):
        raise HTTPException(400, "Unknown mode")
    return _commit(token, mode)


@app.delete("/api/upload/{token}")
def upload_cancel(token: str):
    if re.fullmatch(r"[0-9a-f]{16}", token):
        shutil.rmtree(STAGING_DIR / token, ignore_errors=True)
    return {"ok": True}


# ---- static

app.mount("/static", StaticFiles(directory=STATIC), name="static")


@app.get("/")
def index():
    return FileResponse(STATIC / "index.html", headers={"Cache-Control": "no-cache"})
