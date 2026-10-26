/* Specimen — Font Book style viewer for a folder of fonts. Vanilla JS, no build step. */
(() => {
"use strict";

// ------------------------------------------------------------------ icons
const P = {
  sidebar: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M9.5 4.5v15M5.5 8h1.5M5.5 11h1.5"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r=".9"/><circle cx="4.8" cy="12" r=".9"/><circle cx="4.8" cy="17.5" r=".9"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.2"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  trash: '<path d="M4.5 7h15M9.5 7V5.2c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2V7M6.5 7l.8 11.6c.1 1 .9 1.9 2 1.9h5.4c1.1 0 1.9-.9 2-1.9L17.5 7M10 10.5v6.5M14 10.5v6.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 4.5 4.5"/>',
  sort: '<path d="M7.5 5v14M4 15.5 7.5 19l3.5-3.5M16.5 19V5M13 8.5 16.5 5 20 8.5"/>',
  back: '<path d="M14.5 5 7.5 12l7 7"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  fonts: '<path d="M3.5 19 8.7 5h1.1L15 19M5.6 14h7.3"/><path d="M15.5 13.2c.5-1.2 1.5-1.8 2.8-1.8 1.7 0 2.7 1 2.7 2.8V19m0-3.2c-.6 1.9-1.8 3.2-3.5 3.2-1.4 0-2.3-.8-2.3-2 0-1.5 1.4-2.2 5.8-2.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  tag: '<path d="M4 12.6V5.5C4 4.7 4.7 4 5.5 4h7.1l7.3 7.3a1.5 1.5 0 0 1 0 2.1l-6.5 6.5a1.5 1.5 0 0 1-2.1 0Z"/><circle cx="8.5" cy="8.5" r="1.3"/>',
  folder: '<path d="M3.5 7.5c0-1.1.9-2 2-2h4l2 2h7c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-13c-1.1 0-2-.9-2-2Z"/>',
  gear: '<path d="M10.3 3.7a1.8 1.8 0 0 1 3.4 0l.3.9a1.8 1.8 0 0 0 2.4 1l.9-.4a1.8 1.8 0 0 1 2.4 2.4l-.4.9a1.8 1.8 0 0 0 1 2.4l.9.3a1.8 1.8 0 0 1 0 3.4l-.9.3a1.8 1.8 0 0 0-1 2.4l.4.9a1.8 1.8 0 0 1-2.4 2.4l-.9-.4a1.8 1.8 0 0 0-2.4 1l-.3.9a1.8 1.8 0 0 1-3.4 0l-.3-.9a1.8 1.8 0 0 0-2.4-1l-.9.4a1.8 1.8 0 0 1-2.4-2.4l.4-.9a1.8 1.8 0 0 0-1-2.4l-.9-.3a1.8 1.8 0 0 1 0-3.4l.9-.3a1.8 1.8 0 0 0 1-2.4l-.4-.9a1.8 1.8 0 0 1 2.4-2.4l.9.4a1.8 1.8 0 0 0 2.4-1Z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',
  slider: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  mono: '<path d="m8.5 7.5-5 4.5 5 4.5M15.5 7.5l5 4.5-5 4.5M13.5 5l-3 14"/>',
  shapes: '<circle cx="8" cy="8" r="4"/><rect x="13" y="13" width="7.5" height="7.5" rx="1.5"/><path d="M16.5 3.5 21 11h-9Z"/>',
  sparkle: '<path d="M12 3.5c.6 4.4 2.4 6.3 7 7-4.6.7-6.4 2.6-7 7-.6-4.4-2.4-6.3-7-7 4.6-.7 6.4-2.6 7-7Z"/>',
  more: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
  upload: '<path d="M12 15.5V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14"/>',
  copy: '<rect x="8" y="8" width="11.5" height="11.5" rx="2"/><path d="M5.5 15.5h-.3c-.9 0-1.7-.8-1.7-1.7V5.2c0-.9.8-1.7 1.7-1.7h8.6c.9 0 1.7.8 1.7 1.7v.3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3"/>',
  moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z"/>',
  auto: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17Z" fill="currentColor" stroke="none"/>',
  merge: '<path d="M6 4v4.5c0 2 1.2 3.4 3 4.2l3 1.3 3-1.3c1.8-.8 3-2.2 3-4.2V4M12 14v6M9 17.5l3 3 3-3"/>',
  split: '<path d="M12 20v-6M6 4v4.5c0 2 1.2 3.4 3 4.2l3 1.3 3-1.3c1.8-.8 3-2.2 3-4.2V4M3.5 6.5 6 4l2.5 2.5M15.5 6.5 18 4l2.5 2.5"/>',
  open: '<path d="M13.5 4.5h6v6M19.5 4.5 11 13M18 14v4.5c0 .8-.7 1.5-1.5 1.5h-11c-.8 0-1.5-.7-1.5-1.5v-11C4 6.7 4.7 6 5.5 6H10"/>',
};
const icon = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;

// ------------------------------------------------------------------ utils
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const plural = (n, w, pl) => `${n} ${n === 1 ? w : (pl || w + "s")}`;
const fmtSize = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
function ago(ts) {
  if (!ts) return "Never";
  const s = (ts * 1000 - Date.now()) / 1000, a = Math.abs(s);
  if (a < 60) return "Just now";
  if (a < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (a < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (a < 86400 * 7) return rtf.format(Math.round(s / 86400), "day");
  return new Date(ts * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short", year: a > 86400 * 300 ? "numeric" : undefined });
}
const fullDate = (ts) => ts ? new Date(ts * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Never";
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

async function api(path, opts = {}) {
  const o = { ...opts };
  if (o.json !== undefined) { o.body = JSON.stringify(o.json); o.headers = { "Content-Type": "application/json" }; delete o.json; }
  const r = await fetch(path, o);
  if (!r.ok) {
    let msg = r.statusText;
    try { msg = (await r.json()).detail || msg; } catch {}
    throw new Error(msg);
  }
  return r.headers.get("content-type")?.includes("json") ? r.json() : r;
}

// ------------------------------------------------------------------ prefs + state
const PREF_KEY = "specimen.prefs";
const prefs = Object.assign({
  theme: "auto", view: "grid", sort: "name", dir: 1, tileMode: "decade", tileSize: 168, inspector: true, sidebar: true,
  listText: "", listSize: 28, pageText: "The quick brown fox jumps over the lazy dog", pageSize: 56,
}, (() => { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; } })());
const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch {} };
function applyTheme() {
  if (prefs.theme === "light" || prefs.theme === "dark") document.documentElement.dataset.theme = prefs.theme;
  else delete document.documentElement.dataset.theme;
}
applyTheme();
const THEMES = { auto: "Match System", light: "Light", dark: "Dark" };
function setTheme(t) { prefs.theme = t; savePrefs(); applyTheme(); renderFootOnly(); }

const S = {
  groups: [], byId: new Map(), scanning: false, progress: [0, 0], errors: 0, trashCount: 0, fontsDir: "",
  filter: { type: "all" }, q: "", sel: new Set(), anchor: null, order: [],
  route: { name: "home" }, homeScroll: 0, detail: null, loaded: false,
};

const SORTS = {
  name: { label: "Name", dir: 1 },
  project: { label: "Project ID", dir: 1 },
  added: { label: "Date Added", dir: -1 },
  downloaded: { label: "Last Downloaded", dir: -1 },
  used: { label: "Last Used", dir: -1 },
};

// ------------------------------------------------------------------ font loading
const fontPromises = new Map();
const fontLoaded = new Map();  // key -> CSS family name, for fonts already in the page
function loadFont(kind, faceId, version) {
  const key = `${kind}-${faceId}`;
  if (fontPromises.has(key)) return fontPromises.get(key);
  const url = `/api/face/${faceId}/${kind === "p" ? "preview" : "font"}?v=${version || 0}`;
  const fam = `sp-${key}`;
  const p = new FontFace(fam, `url(${url})`).load().then((ff) => { document.fonts.add(ff); fontLoaded.set(key, fam); return fam; })
    .catch(() => { fontPromises.delete(key); return null; });
  fontPromises.set(key, p);
  return p;
}
const faceStack = (fam) => `"${fam}", "Adobe Blank", sans-serif`;
// Attributes for a preview element: if its font is already loaded, paint it straight away (no fade).
function previewAttrs(faceId, v) {
  const fam = fontLoaded.get(`p-${faceId}`);
  return fam ? { cls: "ready instant", attr: `data-face="${faceId}" data-v="${v}" data-loaded="1" style='font-family:${faceStack(fam).replace(/'/g, "")}'` }
             : { cls: "", attr: `data-face="${faceId}" data-v="${v}"` };
}

const DECADE_HTML = `<span>DECADE</span><span>studios</span>`;
// Shrink the two-line sample until both words fit inside the card, so wide fonts don't clip.
function fitDecade(el) {
  el.style.fontSize = "";
  const box = el.classList.contains("ins-preview") ? el : el.parentElement;
  const avail = box.clientWidth - 28;
  const widest = Math.max(...[...el.children].map((c) => c.scrollWidth));
  if (avail > 0 && widest > avail) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) * avail / widest}px`;
}
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    const el = e.target;
    io.unobserve(el);
    const fid = el.dataset.face;
    loadFont("p", fid, el.dataset.v).then((fam) => {
      if (fam) { el.style.fontFamily = faceStack(fam); el.classList.add("ready"); if (el.classList.contains("decade")) fitDecade(el); }
      else { el.textContent = "Preview failed"; el.classList.add("na"); }
    });
  }
}, { rootMargin: "300px" });

// ------------------------------------------------------------------ data
let librarySig = "";
async function loadLibrary() {
  const data = await api("/api/library");
  const sig = JSON.stringify([data.groups, data.trash, data.fonts_dir, data.errors]);
  S.changed = sig !== librarySig;
  librarySig = sig;
  S.groups = data.groups;
  S.byId = new Map(data.groups.map((g) => [g.id, g]));
  S.scanning = data.scanning; S.progress = data.progress; S.errors = data.errors;
  S.trashCount = data.trash; S.fontsDir = data.fonts_dir; S.loaded = true;
  for (const id of [...S.sel]) if (!S.byId.has(id)) S.sel.delete(id);
}

let pollTimer;
async function refresh(full = true) {
  try { await loadLibrary(); } catch (e) { toast(`Couldn't reach Specimen: ${e.message}`); }
  if (S.changed) renderSidebar(); else renderFootOnly();
  if (S.route.name === "home" && full && S.changed) renderHome(true);
  clearTimeout(pollTimer);
  pollTimer = setTimeout(() => refresh(true), S.scanning ? 1500 : 60000);
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && S.route.name === "home") refresh(); });

// ------------------------------------------------------------------ filtering + sorting
const RECENT_DAYS = 30;
function matchesFilter(g, f = S.filter) {
  switch (f.type) {
    case "recent": return g.added * 1000 > Date.now() - RECENT_DAYS * 86400000;
    case "lic": return f.v === "none" ? !g.tags.licence : g.tags.licence === f.v;
    case "proj": return g.tags.projects.some((p) => p.toUpperCase() === f.v.toUpperCase());
    case "cat": return g.category === f.v;
    case "variable": return g.variable;
    case "mono": return g.mono;
    case "untagged": return !g.tags.projects.length;
    case "dup": return g.dup;
    default: return true;
  }
}
function haystack(g) {
  if (!g._hay) {
    g._hay = [g.name, ...g.families.map((f) => f.name), ...g.faces.map((f) => f.style), ...g.faces.map((f) => f.path),
      ...g.tags.projects, g.tags.licence ? `${g.tags.licence} licence license` : "unlicensed unknown", g.tags.note, g.category,
      g.variable ? "variable" : "", g.mono ? "monospaced mono" : "", ...g.formats].join(" \n ").toLowerCase();
  }
  return g._hay;
}
function visibleGroups() {
  const terms = S.q.toLowerCase().split(/\s+/).filter(Boolean);
  let list = S.groups.filter((g) => matchesFilter(g) && terms.every((t) => haystack(g).includes(t)));
  const d = prefs.dir, byName = (a, b) => collator.compare(a.name, b.name);
  const byTime = (k) => (a, b) => {
    if (!a[k] !== !b[k]) return a[k] ? -1 : 1;
    return (a[k] - b[k]) * d || byName(a, b);
  };
  const cmp = {
    name: (a, b) => byName(a, b) * d,
    project: (a, b) => {
      const pa = [...a.tags.projects].sort(collator.compare), pb = [...b.tags.projects].sort(collator.compare);
      if (!pa.length !== !pb.length) return pa.length ? -1 : 1;
      if (!pa.length) return byName(a, b);
      const ka = d > 0 ? pa[0] : pa[pa.length - 1], kb = d > 0 ? pb[0] : pb[pb.length - 1];
      return collator.compare(ka, kb) * d || byName(a, b);
    },
    added: byTime("added"), downloaded: byTime("downloaded"), used: byTime("used"),
  }[prefs.sort] || ((a, b) => byName(a, b));
  return list.sort(cmp);
}
function captionFor(g) {
  switch (prefs.sort) {
    case "project": return g.tags.projects.length ? [...g.tags.projects].sort(collator.compare).join(", ") : "No project";
    case "added": return `Added ${ago(g.added)}`;
    case "downloaded": return g.downloaded ? `Downloaded ${ago(g.downloaded).toLowerCase()}` : "Never downloaded";
    case "used": return g.used ? `Used ${ago(g.used).toLowerCase()}` : "No recent use";
    default:
      return g.families.length > 1 ? `${plural(g.styles, "style")} · ${g.families.length} families` : plural(g.styles, "style");
  }
}
function filterTitle() {
  const f = S.filter;
  return { all: "All Fonts", recent: "Recently Added", variable: "Variable Fonts", mono: "Monospaced", untagged: "No Project", dup: "Duplicates",
    lic: { open: "Open Licence", closed: "Closed Licence", none: "Licence Unknown" }[f.v], proj: f.v, cat: f.v }[f.type] || "All Fonts";
}

// ------------------------------------------------------------------ sidebar
function sbItem({ key, ic, dot, label, count, active, drop }) {
  return `<button class="sb-item ${active ? "active" : ""}" data-filter='${esc(JSON.stringify(key))}' ${drop ? `data-drop='${esc(JSON.stringify(drop))}'` : ""}>
    ${dot ? `<span class="dot ${dot}"></span>` : icon(ic)}<span class="lbl">${esc(label)}</span>${count != null ? `<span class="count">${count}</span>` : ""}</button>`;
}
function renderSidebar() {
  const g = S.groups, f = S.filter, home = S.route.name !== "trash";
  const is = (t, v) => home && f.type === t && (v === undefined || f.v === v);
  const count = (fl) => g.filter((x) => matchesFilter(x, fl)).length;
  const projects = new Map();
  for (const x of g) for (const p of x.tags.projects) {
    const k = p.toUpperCase();
    projects.set(k, { label: projects.get(k)?.label || p, n: (projects.get(k)?.n || 0) + 1 });
  }
  const cats = ["Serif", "Sans Serif", "Script", "Decorative", "Symbol"].map((c) => [c, count({ type: "cat", v: c })]).filter(([, n]) => n);
  const variable = count({ type: "variable" }), mono = count({ type: "mono" }), dups = count({ type: "dup" });
  let h = `<div class="sb-section">
    ${sbItem({ key: { type: "all" }, ic: "fonts", label: "All Fonts", count: g.length, active: is("all") })}
    ${sbItem({ key: { type: "recent" }, ic: "sparkle", label: "Recently Added", count: count({ type: "recent" }), active: is("recent") })}
    <button class="sb-item ${S.route.name === "trash" ? "active" : ""}" data-trash>${icon("trash")}<span class="lbl">Recently Deleted</span>${S.trashCount ? `<span class="count">${S.trashCount}</span>` : ""}</button>
  </div>
  <div class="sb-section"><div class="sb-head">Licence</div>
    ${sbItem({ key: { type: "lic", v: "open" }, dot: "open", label: "Open Licence", count: count({ type: "lic", v: "open" }), active: is("lic", "open"), drop: { licence: "open" } })}
    ${sbItem({ key: { type: "lic", v: "closed" }, dot: "closed", label: "Closed Licence", count: count({ type: "lic", v: "closed" }), active: is("lic", "closed"), drop: { licence: "closed" } })}
    ${sbItem({ key: { type: "lic", v: "none" }, dot: "none", label: "Unknown", count: count({ type: "lic", v: "none" }), active: is("lic", "none"), drop: { licence: null } })}
  </div>
  <div class="sb-section"><div class="sb-head">Projects <button class="icon-btn" style="height:20px;min-width:20px;padding:0" id="addProjectBtn" title="Tag selected fonts with a project ID">${icon("plus")}</button></div>
    ${[...projects.values()].sort((a, b) => collator.compare(a.label, b.label)).map((p) =>
      sbItem({ key: { type: "proj", v: p.label }, ic: "tag", label: p.label, count: p.n, active: is("proj") && f.v.toUpperCase() === p.label.toUpperCase(), drop: { add: [p.label] } })).join("")}
    ${projects.size ? sbItem({ key: { type: "untagged" }, ic: "tag", label: "No Project", count: count({ type: "untagged" }), active: is("untagged") })
      : `<div style="padding:4px 8px;color:var(--text-3);font-size:12px">Tag fonts with project IDs from the inspector, or drag fonts here.</div>`}
  </div>`;
  if (variable || mono || cats.length || dups) {
    h += `<div class="sb-section"><div class="sb-head">Collections</div>
      ${dups ? sbItem({ key: { type: "dup" }, ic: "copy", label: "Duplicates", count: dups, active: is("dup") }) : ""}
      ${variable ? sbItem({ key: { type: "variable" }, ic: "slider", label: "Variable", count: variable, active: is("variable") }) : ""}
      ${mono ? sbItem({ key: { type: "mono" }, ic: "mono", label: "Monospaced", count: mono, active: is("mono") }) : ""}
      ${cats.map(([c, n]) => sbItem({ key: { type: "cat", v: c }, ic: "shapes", label: c, count: n, active: is("cat", c) })).join("")}
    </div>`;
  }
  $("#sbNav").innerHTML = h;
  renderFootOnly();
}
function renderFootOnly() {
  const foot = $("#sbFoot");
  const scanning = S.scanning ? `<span class="spinner"></span><span class="grow">Indexing ${S.progress[0]} of ${S.progress[1]}…</span>`
    : `${icon("folder")}<span class="grow" title="${esc(S.fontsDir)}">${esc(S.fontsDir.split("/").filter(Boolean).pop() || "Fonts")}${S.errors ? ` · ${plural(S.errors, "unreadable file")}` : ""}</span>`;
  foot.innerHTML = `${scanning}<button class="icon-btn" id="rescanBtn" title="Rescan folder">${icon("refresh")}</button><button class="icon-btn" id="themeBtn" title="Appearance: ${THEMES[prefs.theme]}">${icon(prefs.theme === "auto" ? "auto" : prefs.theme === "dark" ? "moon" : "sun")}</button><button class="icon-btn" id="settingsBtn" title="Settings">${icon("gear")}</button>`;
}

$("#sidebar").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.id === "rescanBtn") { api("/api/rescan", { method: "POST" }).then(() => { S.scanning = true; renderFootOnly(); setTimeout(refresh, 800); }); return; }
  if (b.id === "settingsBtn") return openSettings();
  if (b.id === "themeBtn") return showMenu(b, [{ head: "Appearance" }, ...Object.entries(THEMES).map(([k, l]) => ({ label: l, check: prefs.theme === k, act: () => setTheme(k) }))]);
  if (b.id === "addProjectBtn") return promptProject([...S.sel]);
  if (b.id === "sbClose") return toggleSidebar(false);
  if (b.dataset.trash !== undefined) { location.hash = "#/trash"; return; }
  if (b.dataset.filter) {
    S.filter = JSON.parse(b.dataset.filter);
    S.sel.clear();
    if (S.route.name !== "home") { S.homeScroll = 0; location.hash = "#/"; }
    else { renderSidebar(); renderHome(); $("#content").scrollTop = 0; }
    if (innerWidth < 640) toggleSidebar(false);
  }
});
// drag families from the grid onto a project / licence in the sidebar
$("#sidebar").addEventListener("dragover", (e) => {
  const b = e.target.closest("[data-drop]");
  if (!b || !e.dataTransfer.types.includes("text/x-specimen")) return;
  e.preventDefault(); $$(".drop-hover").forEach((x) => x.classList.remove("drop-hover")); b.classList.add("drop-hover");
});
$("#sidebar").addEventListener("dragleave", (e) => e.target.closest?.("[data-drop]")?.classList.remove("drop-hover"));
$("#sidebar").addEventListener("drop", async (e) => {
  const b = e.target.closest("[data-drop]");
  if (!b) return;
  e.preventDefault(); b.classList.remove("drop-hover");
  const ids = JSON.parse(e.dataTransfer.getData("text/x-specimen") || "[]");
  const body = { groups: ids, ...JSON.parse(b.dataset.drop) };
  await bulkTag(body);
});

function toggleSidebar(on) {
  prefs.sidebar = on ?? !prefs.sidebar; savePrefs();
  $(".window").classList.toggle("no-sidebar", !prefs.sidebar);
}
$("#sbOpen").innerHTML = icon("sidebar");
$("#sbClose").innerHTML = icon("sidebar");
$("#sbOpen").onclick = () => toggleSidebar(true);
$("#backBtn").innerHTML = icon("back");
$("#backBtn").onclick = () => goHome();
function goHome() { if (history.length > 1 && S.cameFromHome) history.back(); else location.hash = "#/"; }

// ------------------------------------------------------------------ toolbar
function setTitle(t, sub = "") { $("#title").textContent = t; $("#subtitle").textContent = sub; document.title = `${t} · Specimen`; }

function renderHomeToolbar() {
  $("#backBtn").hidden = true;
  const sortLbl = SORTS[prefs.sort]?.label || "Name";
  $("#tbCenter").innerHTML = "";
  $("#tbRight").innerHTML = `
    ${prefs.view === "list" ? `<div class="slider" title="Sample size"><input type="range" id="listSize" min="12" max="72" value="${prefs.listSize}"></div>` : ""}
    <div class="seg" role="group" aria-label="View">
      <button data-view="grid" class="${prefs.view === "grid" ? "on" : ""}" title="Grid">${icon("grid")}</button>
      <button data-view="list" class="${prefs.view === "list" ? "on" : ""}" title="List">${icon("list")}</button>
    </div>
    <button class="icon-btn" id="sortBtn" title="Sort by ${sortLbl}">${icon("sort")}<span style="font-size:12px">${sortLbl}</span>${icon("chev", "chev")}</button>
    <button class="icon-btn" id="viewOpts" title="View options">${icon("slider")}</button>
    <button class="icon-btn" id="dlBtn" title="Download selected" ${S.sel.size ? "" : "disabled"}>${icon("download")}</button>
    <button class="icon-btn" id="delBtn" title="Delete selected" ${S.sel.size ? "" : "disabled"}>${icon("trash")}</button>
    <button class="icon-btn" id="addBtn" title="Add fonts">${icon("plus")}</button>
    <button class="icon-btn ${prefs.inspector ? "on" : ""}" id="insBtn" title="Show inspector">${icon("info")}</button>
    <label class="search">${icon("search")}<input id="q" placeholder="${prefs.view === "list" ? "Search, or project ID" : "Search"}" value="${esc(S.q)}" spellcheck="false" autocomplete="off">${S.q ? `<button class="x" id="qx" aria-label="Clear">✕</button>` : ""}</label>`;
  const q = $("#q");
  q.oninput = debounce(() => { S.q = q.value; renderHome(); renderQx(); }, 120);
  q.onkeydown = (e) => { if (e.key === "Escape") { q.value = ""; S.q = ""; renderHome(); renderQx(); q.blur(); } if (e.key === "Enter") $("#content").focus(); };
  $("#qx")?.addEventListener("click", clearSearch);
  if ($("#listSize")) $("#listSize").oninput = (e) => { prefs.listSize = +e.target.value; savePrefs(); $("#content").style.setProperty("--list-size", prefs.listSize + "px"); };
  $$("[data-view]").forEach((b) => b.onclick = () => { prefs.view = b.dataset.view; savePrefs(); renderHome(true); });
  $("#sortBtn").onclick = (e) => sortMenu(e.currentTarget);
  $("#viewOpts").onclick = (e) => viewMenu(e.currentTarget);
  $("#dlBtn").onclick = () => downloadGroups([...S.sel]);
  $("#delBtn").onclick = () => confirmDeleteGroups([...S.sel]);
  $("#addBtn").onclick = () => $("#filePick").click();
  $("#insBtn").onclick = () => { prefs.inspector = !prefs.inspector; savePrefs(); renderHomeToolbar(); renderInspector(); };
}
function renderQx() {
  const lbl = $(".search"); const x = $("#qx");
  if (S.q && !x) { lbl.insertAdjacentHTML("beforeend", `<button class="x" id="qx" aria-label="Clear">✕</button>`); $("#qx").onclick = clearSearch; }
  if (!S.q && x) x.remove();
}
function clearSearch() { S.q = ""; const q = $("#q"); if (q) q.value = ""; renderHome(); renderQx(); }
function updateToolbarSel() {
  const on = S.sel.size > 0;
  if ($("#dlBtn")) $("#dlBtn").disabled = !on;
  if ($("#delBtn")) $("#delBtn").disabled = !on;
}

function sortMenu(anchor) {
  const items = Object.entries(SORTS).map(([k, s]) => ({ label: s.label, check: prefs.sort === k, act: () => {
    if (prefs.sort === k) prefs.dir = -prefs.dir; else { prefs.sort = k; prefs.dir = s.dir; }
    savePrefs(); renderHomeToolbar(); renderHome(true);
  } }));
  const asc = prefs.dir > 0;
  const words = prefs.sort === "name" || prefs.sort === "project" ? ["A to Z", "Z to A"] : ["Oldest first", "Newest first"];
  showMenu(anchor, [{ head: "Sort By" }, ...items, "-",
    { label: words[0], check: asc, act: () => { prefs.dir = 1; savePrefs(); renderHome(true); } },
    { label: words[1], check: !asc, act: () => { prefs.dir = -1; savePrefs(); renderHome(true); } }]);
}
function viewMenu(anchor) {
  const set = (k, v) => () => { prefs[k] = v; savePrefs(); renderHome(true); };
  showMenu(anchor, [{ head: "Tile Preview" },
    { label: "DECADE / studios", check: prefs.tileMode === "decade", act: set("tileMode", "decade") },
    { label: "Aa", check: prefs.tileMode === "aa", act: set("tileMode", "aa") },
    { label: "Family Name", check: prefs.tileMode === "name", act: set("tileMode", "name") },
    "-", { head: "Tile Size" },
    { label: "Small", check: prefs.tileSize === 132, act: set("tileSize", 132) },
    { label: "Medium", check: prefs.tileSize === 168, act: set("tileSize", 168) },
    { label: "Large", check: prefs.tileSize === 220, act: set("tileSize", 220) }]);
}

// ------------------------------------------------------------------ home (grid / list)
function previewText(g, mode) {
  if (!g.latin && g.sample) return g.sample.slice(0, mode === "list" ? 24 : 2);
  if (mode === "list") return prefs.listText || g.name;
  return prefs.tileMode === "name" ? g.name : prefs.tileMode === "decade" ? "DECADE studios" : "Aa";
}
function licPill(g) {
  return g.tags.licence === "open" ? `<span class="pill open">Open</span>` : g.tags.licence === "closed" ? `<span class="pill closed">Closed</span>` : "";
}
function tileHTML(g) {
  const txt = previewText(g, "grid");
  const def = g.faces.find((f) => f.id === g.default);
  const decade = prefs.tileMode === "decade" && g.latin;
  const pa = previewAttrs(g.default, def?.mtime || 0);
  const glyph = g.previewable
    ? `<div class="glyph ${prefs.tileMode === "name" && g.latin ? "name" : ""} ${decade ? "decade" : ""} ${pa.cls}" ${pa.attr}>${decade ? DECADE_HTML : esc(txt)}</div>`
    : `<div class="glyph na">${esc(g.formats.join(", ").toUpperCase())}<br>No preview</div>`;
  return `<div class="tile ${S.sel.has(g.id) ? "sel" : ""}" data-id="${g.id}" draggable="true">
    <div class="card">${glyph}<div class="badges">${licPill(g)}</div>${g.variable ? `<div class="badges left"><span class="pill var">Variable</span></div>` : ""}</div>
    <div class="cap"><span class="nm">${esc(g.name)}</span><div class="meta">${esc(captionFor(g))}</div></div></div>`;
}
function rowHTML(g) {
  const def = g.faces.find((f) => f.id === g.default);
  const when = { added: g.added, downloaded: g.downloaded, used: g.used }[prefs.sort] ?? g.used;
  const pa = previewAttrs(g.default, def?.mtime || 0);
  const sample = g.previewable
    ? `<div class="sample ${pa.cls}" ${pa.attr}>${esc(previewText(g, "list"))}</div>`
    : `<div class="sample na">No preview for ${esc(g.formats.join(", ").toUpperCase())}</div>`;
  return `<div class="row ${S.sel.has(g.id) ? "sel" : ""}" data-id="${g.id}" draggable="true">
    <div class="nmcol"><b>${esc(g.name)}</b><span class="sub">${esc(plural(g.styles, "style"))}${g.families.length > 1 ? ` · ${g.families.length} families` : ""}</span></div>
    ${sample}
    <div>${licPill(g) || `<span class="sub">Unknown</span>`}</div>
    <div class="when">${esc(ago(when))}</div>
    <div class="projs">${g.tags.projects.map((p) => `<span class="pill proj">${esc(p)}</span>`).join("")}</div>
    <div class="sub">${esc(g.category || "")}</div></div>`;
}
function renderHome(keepScroll = false) {
  const c = $("#content");
  const top = c.scrollTop;
  const list = visibleGroups();
  S.order = list.map((g) => g.id);
  setTitle(filterTitle(), S.loaded ? `${plural(list.length, "family", "families")}${S.q ? " found" : ""}` : "");
  c.style.setProperty("--tile-w", prefs.tileSize + "px");
  c.style.setProperty("--list-size", prefs.listSize + "px");
  if (!S.loaded) { c.innerHTML = `<div class="empty"><span class="spinner"></span></div>`; return; }
  if (!S.groups.length) {
    c.innerHTML = `<div class="empty">${icon("fonts", "big")}<h2>${S.scanning ? "Indexing your fonts…" : "No fonts here yet"}</h2>
      <p>${S.scanning ? `Read ${S.progress[0]} of ${S.progress[1]} files. Fonts appear as they're indexed.` : `Specimen is looking in <b>${esc(S.fontsDir)}</b>. Drop font files or .zip archives onto this window, or change the folder in Settings.`}</p>
      ${S.scanning ? "" : `<div style="display:flex;gap:8px;margin-top:8px"><button class="btn primary" id="emptyAdd">${icon("plus")}Add Fonts</button><button class="btn" id="emptySettings">${icon("gear")}Settings</button></div>`}</div>`;
    $("#emptyAdd")?.addEventListener("click", () => $("#filePick").click());
    $("#emptySettings")?.addEventListener("click", openSettings);
    renderInspector();
    return;
  }
  if (!list.length) {
    c.innerHTML = `<div class="empty">${icon("search", "big")}<h2>No matches</h2><p>${S.q ? `Nothing matches “${esc(S.q)}” in ${esc(filterTitle())}.` : "Nothing in this collection yet."}</p>
      ${S.q ? `<button class="btn" id="emptyClear">Clear Search</button>` : ""}</div>`;
    $("#emptyClear")?.addEventListener("click", clearSearch);
    renderInspector();
    return;
  }
  if (prefs.view === "list") {
    const col = (k, l) => `<button data-sort="${k}" class="${prefs.sort === k ? "on" : ""}">${l}${prefs.sort === k ? (prefs.dir > 0 ? " ↑" : " ↓") : ""}</button>`;
    const whenLabel = { added: "Added", downloaded: "Downloaded", used: "Last Used" }[prefs.sort] || "Last Used";
    const whenKey = ["added", "downloaded", "used"].includes(prefs.sort) ? prefs.sort : "used";
    c.innerHTML = `<div class="list"><div class="list-head">${col("name", "Name")}
      <div class="list-tools"><label class="textfield" style="height:22px;min-width:160px;max-width:340px;background:transparent;padding:0"><input id="listText" placeholder="Type to preview all fonts…" value="${esc(prefs.listText)}"></label></div>
      <span>Licence</span>${col(whenKey, whenLabel)}${col("project", "Projects")}<span>Category</span></div>
      ${list.map(rowHTML).join("")}</div>`;
    $$(".list-head [data-sort]").forEach((b) => b.onclick = () => {
      const k = b.dataset.sort;
      if (prefs.sort === k) prefs.dir = -prefs.dir; else { prefs.sort = k; prefs.dir = SORTS[k].dir; }
      savePrefs(); renderHomeToolbar(); renderHome(true);
    });
    const lt = $("#listText");
    lt.oninput = () => {
      prefs.listText = lt.value; savePrefs();
      $$(".row .sample[data-face]").forEach((el) => { const g = S.byId.get(el.closest(".row").dataset.id); el.textContent = previewText(g, "list"); });
    };
  } else {
    c.innerHTML = `<div class="grid">${list.map(tileHTML).join("")}</div>`;
  }
  observePreviews(c);
  if (keepScroll) c.scrollTop = top;
  renderInspector();
  updateToolbarSel();
}

function observePreviews(root) {
  $$("[data-face]", root).forEach((el) => {
    if (!el.dataset.loaded) io.observe(el);
    else if (el.classList.contains("decade")) fitDecade(el);
  });
}

function updateSelection() {
  $$("#content [data-id]").forEach((el) => el.classList.toggle("sel", S.sel.has(el.dataset.id)));
  updateToolbarSel();
  renderInspector();
}
function selectOnly(id) { S.sel = new Set(id ? [id] : []); S.anchor = id; updateSelection(); }

// Home interactions are delegated from the stable wrapper, so re-rendering #content never drops them.
const wrap = $(".content-wrap");
const inHome = (e) => S.route.name === "home" && e.target.closest("#content");
wrap.addEventListener("click", (e) => {
  if (!inHome(e)) return;
  const el = e.target.closest("[data-id]");
  if (!el) { if (!e.target.closest(".list-head")) selectOnly(null); return; }
  const id = el.dataset.id;
  if (e.shiftKey && S.anchor) {
    const a = S.order.indexOf(S.anchor), b = S.order.indexOf(id);
    const [lo, hi] = a < b ? [a, b] : [b, a];
    if (!(e.metaKey || e.ctrlKey)) S.sel.clear();
    S.order.slice(lo, hi + 1).forEach((x) => S.sel.add(x));
  } else if (e.metaKey || e.ctrlKey) {
    S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); S.anchor = id;
  } else { S.sel = new Set([id]); S.anchor = id; }
  updateSelection();
});
wrap.addEventListener("dblclick", (e) => {
  if (!inHome(e)) return;
  const el = e.target.closest("[data-id]");
  if (el) openFamily(el.dataset.id);
});
wrap.addEventListener("contextmenu", (e) => {
  if (!inHome(e)) return;
  const el = e.target.closest("[data-id]");
  if (!el) return;
  e.preventDefault();
  if (!S.sel.has(el.dataset.id)) selectOnly(el.dataset.id);
  groupMenu({ x: e.clientX, y: e.clientY }, [...S.sel]);
});
wrap.addEventListener("dragstart", (e) => {
  const el = e.target.closest("[data-id]");
  if (!el || !inHome(e)) return;
  if (!S.sel.has(el.dataset.id)) selectOnly(el.dataset.id);
  e.dataTransfer.setData("text/x-specimen", JSON.stringify([...S.sel]));
  e.dataTransfer.effectAllowed = "copy";
});

function groupMenu(pos, ids) {
  const one = ids.length === 1 ? S.byId.get(ids[0]) : null;
  const lic = one?.tags.licence;
  showMenu(pos, [
    one && { label: "Open", kbd: "↵", act: () => openFamily(one.id) },
    { label: one ? "Download Family" : `Download ${ids.length} Families`, act: () => downloadGroups(ids) },
    "-",
    !one && { label: `Merge ${ids.length} Families…`, act: () => confirmMerge(ids) },
    one?.merged && { label: "Split Merged Family…", act: () => confirmSplit(one) },
    { label: "Add Project ID…", act: () => promptProject(ids) },
    { head: "Licence" },
    { label: "Open Licence", check: lic === "open", act: () => bulkTag({ groups: ids, licence: "open" }) },
    { label: "Closed Licence", check: lic === "closed", act: () => bulkTag({ groups: ids, licence: "closed" }) },
    { label: "Unknown", check: one && !lic, act: () => bulkTag({ groups: ids, licence: null }) },
    "-",
    one && { label: "Copy File Path", act: () => copyText(`${S.fontsDir}/${one.faces[0].path}`) },
    { label: one ? "Delete Family…" : `Delete ${ids.length} Families…`, danger: true, kbd: "⌫", act: () => confirmDeleteGroups(ids) },
  ].filter(Boolean));
}

// keyboard
document.addEventListener("keydown", (e) => {
  const typing = e.target.closest("input, textarea, [contenteditable=true]");
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === "f") { e.preventDefault(); if (S.route.name !== "home") location.hash = "#/"; setTimeout(() => $("#q")?.focus(), 30); return; }
  if (e.key === "Escape") {
    if (!$("#menu").hidden) return hideMenu();
    if (!$("#sheetBack").hidden) return closeSheet();
  }
  if (typing || !$("#sheetBack").hidden) return;
  if (S.route.name === "family") {
    if (e.key === "Escape" || (mod && e.key === "ArrowUp") || (e.key === "Backspace" && !mod)) { e.preventDefault(); goHome(); }
    return;
  }
  if (S.route.name !== "home") return;
  if (e.key === "/") { e.preventDefault(); $("#q")?.focus(); return; }
  if (mod && e.key.toLowerCase() === "a") { e.preventDefault(); S.sel = new Set(S.order); updateSelection(); return; }
  if (e.key === "Escape") { selectOnly(null); return; }
  if (e.key === "Enter" && S.sel.size === 1) { openFamily([...S.sel][0]); return; }
  if ((e.key === "Delete" || (e.key === "Backspace" && mod) || e.key === "Backspace") && S.sel.size) { e.preventDefault(); confirmDeleteGroups([...S.sel]); return; }
  const arrows = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: "down", ArrowUp: "up" };
  if (e.key in arrows && S.order.length) {
    e.preventDefault();
    let cols = 1;
    if (prefs.view === "grid") {
      const tiles = $$("#content .tile");
      if (tiles.length) { const t0 = tiles[0].offsetTop; cols = tiles.findIndex((t) => t.offsetTop !== t0); if (cols < 1) cols = tiles.length; }
    }
    const step = arrows[e.key] === "down" ? cols : arrows[e.key] === "up" ? -cols : arrows[e.key];
    const cur = S.anchor ? S.order.indexOf(S.anchor) : -1;
    const next = Math.max(0, Math.min(S.order.length - 1, cur < 0 ? 0 : cur + step));
    const id = S.order[next];
    if (e.shiftKey) { S.sel.add(id); S.anchor = id; updateSelection(); } else selectOnly(id);
    $(`#content [data-id="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "nearest" });
  }
});

// ------------------------------------------------------------------ inspector + tag editor
function renderInspector() {
  const ins = $("#inspector");
  if (S.route.name !== "home" || !prefs.inspector) { ins.hidden = true; return; }
  ins.hidden = false;
  if (!S.sel.size) {
    // Stays docked when nothing is selected, so selecting never reflows the grid under the cursor.
    const vis = S.order.length;
    ins.innerHTML = `<div class="empty" style="height:auto;padding:60px 10px 20px">${icon("info", "big")}<h2>No Selection</h2>
      <p>Click a font to see its details, licence and projects. Double-click to open it.</p></div>
      <dl class="kv"><dt>Showing</dt><dd>${plural(vis, "family", "families")}</dd>
      <dt>Styles</dt><dd>${S.groups.filter((g) => S.order.includes(g.id)).reduce((n, g) => n + g.styles, 0)}</dd>
      <dt>Open licence</dt><dd>${S.groups.filter((g) => g.tags.licence === "open").length}</dd>
      <dt>Closed licence</dt><dd>${S.groups.filter((g) => g.tags.licence === "closed").length}</dd>
      <dt>Licence unknown</dt><dd>${S.groups.filter((g) => !g.tags.licence).length}</dd></dl>`;
    return;
  }
  const ids = [...S.sel];
  if (ids.length > 1) {
    const gs = ids.map((id) => S.byId.get(id)).filter(Boolean);
    const common = gs.reduce((acc, g) => acc.filter((p) => g.tags.projects.some((q) => q.toUpperCase() === p.toUpperCase())), gs[0]?.tags.projects || []);
    const lics = new Set(gs.map((g) => g.tags.licence || null));
    const lic = lics.size === 1 ? [...lics][0] : "mixed";
    ins.innerHTML = `<div><h2 class="ins-name">${plural(gs.length, "family", "families")} selected</h2>
      <div class="ins-sub">${plural(gs.reduce((n, g) => n + g.styles, 0), "style")} · ${fmtSize(gs.reduce((n, g) => n + g.size, 0))}</div></div>
      <div class="multi-stack">${gs.slice(0, 24).map((g) => `<span>${esc(g.name)}</span>`).join("")}${gs.length > 24 ? `<span>+${gs.length - 24} more</span>` : ""}</div>
      <div class="ins-actions"><button class="btn primary" data-act="dl">${icon("download")}Download All</button><button class="btn danger-text" data-act="del">${icon("trash")}Delete</button></div>
      <button class="btn" data-act="merge" style="width:100%">${icon("merge")}Merge into One Family</button>
      <div class="ins-block"><label>Licence${lic === "mixed" ? " (mixed)" : ""}</label>${licControl(lic)}</div>
      <div class="ins-block"><label>Projects in common</label><div id="chipHost"></div>
      <div style="font-size:11px;color:var(--text-3)">IDs you add here are applied to every selected family.</div></div>`;
    ins.querySelector('[data-act="dl"]').onclick = () => downloadGroups(ids);
    ins.querySelector('[data-act="del"]').onclick = () => confirmDeleteGroups(ids);
    ins.querySelector('[data-act="merge"]').onclick = () => confirmMerge(ids);
    bindLic(ins, (v) => bulkTag({ groups: ids, licence: v }));
    chipEditor($("#chipHost", ins), common, {
      onAdd: (p) => bulkTag({ groups: ids, add: [p] }, false),
      onRemove: (p) => bulkTag({ groups: ids, remove: [p] }, false),
    });
    return;
  }
  const g = S.byId.get(ids[0]);
  if (!g) { ins.hidden = true; return; }
  const def = g.faces.find((f) => f.id === g.default);
  ins.innerHTML = `
    <div class="ins-preview ${prefs.tileMode === "decade" && g.latin ? "decade" : ""}" data-face="${g.previewable ? g.default : ""}" data-v="${def?.mtime || 0}">${g.previewable ? (prefs.tileMode === "decade" && g.latin ? DECADE_HTML : esc(g.latin ? "Aa" : g.sample.slice(0, 2))) : `<span style="font:12px var(--font-ui);color:var(--text-3)">No preview</span>`}</div>
    <div><h2 class="ins-name">${esc(g.name)}</h2><div class="ins-sub">${esc(plural(g.styles, "style"))}${g.variable ? " · Variable" : ""}${g.dup ? ` · <span class="pill warn">Duplicates</span>` : ""}</div></div>
    <div class="ins-actions">
      <button class="btn primary" data-act="dl">${icon("download")}Download</button>
      <button class="btn" data-act="open">Open</button>
      <button class="btn danger-text" data-act="del" title="Delete family">${icon("trash")}</button>
    </div>
    ${g.merged ? `<button class="btn" data-act="split" title="Undo the manual merge">${icon("split")}Split Merged Family</button>` : ""}
    ${g.families.length > 1 ? `<div class="ins-block"><label>Families</label><div class="ins-fams">${g.families.map((f) => `<div><b>${esc(f.name)}</b><span>${plural(f.faces.length, "style")}</span></div>`).join("")}</div></div>` : ""}
    <div class="ins-block"><label>Licence</label>${licControl(g.tags.licence)}
      <textarea class="note" id="insNote" placeholder="Licence notes (e.g. SIL OFL, demo only, bought for Decade Studios)">${esc(g.tags.note)}</textarea></div>
    <div class="ins-block"><label>Project IDs</label><div id="chipHost"></div></div>
    <dl class="kv">
      <dt>Formats</dt><dd>${esc(g.formats.join(", ").toUpperCase())}</dd>
      <dt>Size</dt><dd>${fmtSize(g.size)}</dd>
      ${g.category ? `<dt>Category</dt><dd>${esc(g.category)}</dd>` : ""}
      <dt>Added</dt><dd>${esc(ago(g.added))}</dd>
      <dt>Last used</dt><dd title="Last time a file in this family was opened, including over SMB">${esc(ago(g.used))}</dd>
      <dt>Downloaded</dt><dd>${esc(ago(g.downloaded))}</dd>
    </dl>`;
  if (g.previewable) {
    const el = $(".ins-preview", ins), fam = fontLoaded.get(`p-${g.default}`);
    if (fam) { el.style.fontFamily = faceStack(fam); el.classList.add("ready"); if (el.classList.contains("decade")) fitDecade(el); }
    else io.observe(el);
  }
  ins.querySelector('[data-act="dl"]').onclick = () => downloadGroups([g.id]);
  ins.querySelector('[data-act="open"]').onclick = () => openFamily(g.id);
  ins.querySelector('[data-act="del"]').onclick = () => confirmDeleteGroups([g.id]);
  ins.querySelector('[data-act="split"]')?.addEventListener("click", () => confirmSplit(g));
  bindTagEditor(ins, g);
}

function licControl(v) {
  return `<div class="lic">
    <button data-lic="open" class="open ${v === "open" ? "on" : ""}"><span class="dot open" style="margin:0"></span>Open</button>
    <button data-lic="closed" class="closed ${v === "closed" ? "on" : ""}"><span class="dot closed" style="margin:0"></span>Closed</button>
    <button data-lic="" class="${v === null || v === undefined ? "on" : ""}">Unknown</button></div>`;
}
function bindLic(root, fn) {
  $$("[data-lic]", root).forEach((b) => b.onclick = () => {
    $$("[data-lic]", root).forEach((x) => x.classList.toggle("on", x === b));
    fn(b.dataset.lic || null);
  });
}
function bindTagEditor(root, g) {
  bindLic(root, (v) => saveTags(g, { licence: v }));
  const note = $(".note", root);
  if (note) {
    const save = debounce(() => saveTags(g, { note: note.value }, false), 600);
    note.oninput = save;
    note.onblur = () => { if (note.value !== g.tags.note) saveTags(g, { note: note.value }, false); };
  }
  chipEditor($("#chipHost", root), g.tags.projects, {
    onChange: (list) => saveTags(g, { projects: list }, false),
  });
}
function allProjects() {
  const m = new Map();
  for (const g of S.groups) for (const p of g.tags.projects) m.set(p.toUpperCase(), p);
  return [...m.values()].sort(collator.compare);
}
function chipEditor(host, initial, { onChange, onAdd, onRemove }) {
  let list = [...initial];
  host.innerHTML = `<div class="chips"><input placeholder="Add ID and press Enter" spellcheck="false" autocomplete="off"></div>`;
  const box = $(".chips", host), input = $("input", box);
  let hl = -1, sug = [];
  const draw = () => {
    $$(".chip", box).forEach((c) => c.remove());
    input.insertAdjacentHTML("beforebegin", list.map((p) => `<span class="chip">${esc(p)}<button data-rm="${esc(p)}" aria-label="Remove ${esc(p)}">✕</button></span>`).join(""));
  };
  const closeSug = () => { $(".suggest", box)?.remove(); sug = []; hl = -1; };
  const showSug = () => {
    const v = input.value.trim().toUpperCase();
    sug = allProjects().filter((p) => !list.some((q) => q.toUpperCase() === p.toUpperCase()) && (!v || p.toUpperCase().includes(v))).slice(0, 8);
    $(".suggest", box)?.remove();
    if (!sug.length || document.activeElement !== input) return;
    box.insertAdjacentHTML("beforeend", `<div class="suggest">${sug.map((p, i) => `<div data-s="${esc(p)}" class="${i === hl ? "hl" : ""}">${esc(p)}</div>`).join("")}</div>`);
  };
  const add = (p) => {
    p = p.trim().replace(/\s+/g, " ");
    if (!p || list.some((q) => q.toUpperCase() === p.toUpperCase())) { input.value = ""; return; }
    list.push(p); draw(); input.value = ""; closeSug();
    onAdd ? onAdd(p) : onChange(list);
  };
  draw();
  box.addEventListener("mousedown", (e) => {
    const s = e.target.closest("[data-s]");
    if (s) { e.preventDefault(); add(s.dataset.s); return; }
    const rm = e.target.closest("[data-rm]");
    if (rm) { e.preventDefault(); const p = rm.dataset.rm; list = list.filter((q) => q !== p); draw(); onRemove ? onRemove(p) : onChange(list); return; }
    if (e.target === box) { e.preventDefault(); input.focus(); }
  });
  input.addEventListener("focus", showSug);
  input.addEventListener("blur", () => { setTimeout(closeSug, 100); if (input.value.trim()) add(input.value); });
  input.addEventListener("input", () => { hl = -1; showSug(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && sug.length) { e.preventDefault(); hl = (hl + 1) % sug.length; showSug(); }
    else if (e.key === "ArrowUp" && sug.length) { e.preventDefault(); hl = (hl - 1 + sug.length) % sug.length; showSug(); }
    else if (e.key === "Enter" || e.key === "," || e.key === "Tab" && input.value.trim()) {
      e.preventDefault(); add(hl >= 0 ? sug[hl] : input.value);
    } else if (e.key === "Backspace" && !input.value && list.length) {
      const p = list.pop(); draw(); onRemove ? onRemove(p) : onChange(list);
    } else if (e.key === "Escape") { closeSug(); input.blur(); }
  });
}

async function saveTags(g, patch, rerender = true) {
  try {
    const t = await api(`/api/group/${g.id}/tags`, { method: "PUT", json: patch });
    const live = S.byId.get(g.id);
    for (const x of [g, live, S.detail?.id === g.id ? S.detail : null]) if (x) { x.tags = t; delete x._hay; }
    renderSidebar();
    if (S.route.name === "home") refreshTiles([g.id], rerender);
  } catch (e) { toast(`Couldn't save: ${e.message}`); }
}
async function bulkTag(body, rerenderInspector = true) {
  if (!body.groups?.length) { toast("Select some fonts first"); return; }
  try {
    await api("/api/tags/bulk", { method: "POST", json: body });
    await loadLibrary();
    renderSidebar();
    if (S.route.name === "home") { refreshTiles(body.groups, rerenderInspector); }
    const what = body.add ? `Tagged with ${body.add.join(", ")}` : body.remove ? `Removed ${body.remove.join(", ")}` :
      body.licence === "open" ? "Marked as open licence" : body.licence === "closed" ? "Marked as closed licence" : "Licence cleared";
    toast(`${what} · ${plural(body.groups.length, "family", "families")}`);
  } catch (e) { toast(`Couldn't save: ${e.message}`); }
}
function refreshTiles(ids, rerenderInspector = true) {
  for (const id of ids) {
    const g = S.byId.get(id), el = $(`#content [data-id="${CSS.escape(id)}"]`);
    if (!g || !el) continue;
    if (!matchesFilter(g) || (S.q && !haystack(g).includes(S.q.toLowerCase()))) { renderHome(true); return; }
    const tmp = document.createElement("div");
    tmp.innerHTML = prefs.view === "list" ? rowHTML(g) : tileHTML(g);
    const fresh = tmp.firstElementChild;
    el.replaceWith(fresh);
    observePreviews(fresh);
  }
  if (rerenderInspector) renderInspector();
}

// ------------------------------------------------------------------ downloads + delete
function triggerDownload(url) {
  const a = document.createElement("a");
  a.href = url; a.download = ""; document.body.appendChild(a); a.click(); a.remove();
}
function downloadGroups(ids) {
  if (!ids.length) return;
  triggerDownload(`/api/download?groups=${ids.map(encodeURIComponent).join(",")}`);
  const now = Date.now() / 1000;
  ids.forEach((id) => { const g = S.byId.get(id); if (g) g.downloaded = now; });
  toast(ids.length === 1 ? `Downloading ${S.byId.get(ids[0])?.name}` : `Downloading ${ids.length} families as one zip`);
}
function downloadFaces(fids, name) {
  if (!fids.length) return;
  triggerDownload(`/api/download?faces=${fids.join(",")}${name ? `&name=${encodeURIComponent(name)}` : ""}`);
  if (S.detail) S.detail.downloaded = Date.now() / 1000;
}

function confirmDeleteGroups(ids) {
  const gs = ids.map((id) => S.byId.get(id)).filter(Boolean);
  if (!gs.length) return;
  const files = new Set(gs.flatMap((g) => g.faces.map((f) => f.path)));
  const title = gs.length === 1 ? `Delete “${gs[0].name}”?` : `Delete ${gs.length} families?`;
  confirmSheet(title, `${plural(files.size, "file")} will move to Recently Deleted (a hidden <code>.specimen-trash</code> folder inside your font folder). You can restore ${gs.length === 1 && files.size === 1 ? "it" : "them"} from there.`,
    "Move to Recently Deleted", async () => {
      const r = await api("/api/delete", { method: "POST", json: { groups: ids } });
      afterDelete(r, gs.length === 1 ? gs[0].name : `${gs.length} families`);
    });
}
function confirmMerge(ids) {
  const gs = ids.map((id) => S.byId.get(id)).filter(Boolean);
  if (gs.length < 2) return;
  const best = [...gs].sort((a, b) => b.styles - a.styles || a.name.length - b.name.length)[0];
  const names = gs.length === 2 ? `“${gs[0].name}” and “${gs[1].name}”` : `these ${gs.length} families`;
  const lics = new Set(gs.map((g) => g.tags.licence).filter(Boolean));
  openSheet(`<h3>Are you sure you want to merge ${esc(names)}?</h3>
    <p>They'll show as one family, with each original kept as its own section on the family page. Files aren't renamed or moved, and you can split them again any time.</p>
    <div class="field-label">Keep the name</div>
    <div class="merge-list">${gs.map((g) => `<label class="merge-opt"><input type="radio" name="keep" value="${esc(g.id)}" ${g === best ? "checked" : ""}>
      <span class="grow"><b>${esc(g.name)}</b><span>${esc(plural(g.styles, "style"))}</span></span>${licPill(g)}</label>`).join("")}</div>
    ${lics.size > 1 ? `<p style="color:var(--warn-text)">These have different licence tags. The merged family keeps the licence of the name you choose; project IDs from all of them are combined.</p>` : `<p>Project IDs and licence notes from all of them are combined.</p>`}
    <div class="acts"><button class="btn" id="mNo">Cancel</button><button class="btn primary" id="mYes">${icon("merge")}Merge</button></div>`, "wide");
  $("#mNo").onclick = closeSheet;
  $("#mYes").onclick = async () => {
    const keep = $('input[name="keep"]:checked').value;
    $("#mYes").disabled = true;
    try {
      const r = await api("/api/merge", { method: "POST", json: { groups: ids, keep } });
      closeSheet();
      S.sel = new Set([r.id]); S.anchor = r.id;
      await refreshAfterChange();
      toast(`Merged into ${S.byId.get(r.id)?.name || "one family"}`);
    } catch (e) { closeSheet(); toast(e.message); }
  };
}
function confirmSplit(g) {
  confirmSheet(`Split “${g.name}” back into separate families?`, "This undoes the merge. Each family gets its own tile again, starting with a copy of this family's tags.", "Split", async () => {
    const r = await api(`/api/group/${encodeURIComponent(g.id)}/split`, { method: "POST" });
    S.sel = new Set(r.groups);
    if (S.route.name === "family") { S.homeScroll = 0; location.hash = "#/"; }
    await refreshAfterChange();
    toast(`Split into ${plural(r.groups.length, "family", "families")}`);
  });
}
function confirmDeleteFaces(faces, label) {
  const files = new Set(faces.map((f) => f.path));
  const shared = faces.some((f) => f.index !== null && f.index !== undefined);
  confirmSheet(`Delete ${label}?`, `${plural(files.size, "file")} will move to Recently Deleted.${shared ? " This style lives inside a font collection (.ttc), so the whole collection file moves with it." : ""}`,
    "Move to Recently Deleted", async () => {
      const r = await api("/api/delete", { method: "POST", json: { faces: faces.map((f) => f.id) } });
      afterDelete(r, label);
    });
}
async function afterDelete(r, label) {
  S.sel.clear();
  toast(`Moved ${label} to Recently Deleted`, { label: "Undo", fn: async () => {
    await api(`/api/trash/${r.batch}/restore`, { method: "POST" });
    toast(`Restored ${label}`);
    await refreshAfterChange();
  } });
  await refreshAfterChange();
}
async function refreshAfterChange() {
  await loadLibrary();
  renderSidebar();
  if (S.route.name === "home") renderHome(true);
  else if (S.route.name === "family") {
    if (!S.byId.has(S.route.id)) location.hash = "#/";
    else renderFamily(true);
  } else if (S.route.name === "trash") renderTrash();
}

// ------------------------------------------------------------------ family page
function openFamily(id) {
  S.homeScroll = $("#content").scrollTop;
  S.cameFromHome = true;
  location.hash = `#/family/${encodeURIComponent(id)}`;
}
const PRESETS = [
  ["Pangram", "The quick brown fox jumps over the lazy dog"],
  ["Family Name", null],
  ["Uppercase", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
  ["Lowercase", "abcdefghijklmnopqrstuvwxyz"],
  ["Numerals", "0123456789 £$€%&@#(){}[]?!*/"],
  ["Paragraph", "Every typeface carries a voice. Set a few lines at reading size to see how the spacing, rhythm and colour hold up before it goes anywhere near a project."],
  ["Headline", "Decade Studios"],
];

async function renderFamily(reload = false) {
  const id = S.route.id;
  const c = $("#content");
  $("#inspector").hidden = true;
  $("#backBtn").hidden = false;
  if (reload || !S.detail || S.detail.id !== id) {
    const g0 = S.byId.get(id);
    setTitle(g0?.name || "Loading…", "");
    $("#tbCenter").innerHTML = ""; $("#tbRight").innerHTML = "";
    if (!reload) c.innerHTML = `<div class="empty"><span class="spinner"></span></div>`;
    try { S.detail = await api(`/api/group/${encodeURIComponent(id)}`); }
    catch { c.innerHTML = `<div class="empty"><h2>Family not found</h2><p>It may have been deleted or renamed.</p><button class="btn" id="goBack">Back to All Fonts</button></div>`; $("#goBack").onclick = () => location.hash = "#/"; return; }
    S.pageChecked = new Set();
    S.glyphFace = null;
  }
  const g = S.detail;
  const tab = S.route.tab || "preview";
  setTitle(g.name, `${plural(g.styles, "style")}${g.families.length > 1 ? ` · ${g.families.length} families` : ""}`);
  $("#tbCenter").innerHTML = `<div class="seg">${["preview", "glyphs", "info"].map((t) =>
    `<button data-tab="${t}" class="${tab === t ? "on" : ""}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div>`;
  $("#tbRight").innerHTML = `${licPill(g)}
    <button class="btn" id="famDl">${icon("download")}Download Family</button>
    <button class="icon-btn" id="famMore" title="More">${icon("more")}</button>`;
  $$("[data-tab]").forEach((b) => b.onclick = () => { location.replace(`#/family/${encodeURIComponent(id)}${b.dataset.tab === "preview" ? "" : "/" + b.dataset.tab}`); });
  $("#famDl").onclick = () => { downloadGroups([g.id]); };
  $("#famMore").onclick = (e) => showMenu(e.currentTarget, [
    { label: "Add Project ID…", act: () => promptProject([g.id], () => renderFamily(true)) },
    g.merged && { label: "Split Merged Family…", act: () => confirmSplit(g) },
    { label: "Copy Folder Path", act: () => copyText(`${S.fontsDir}/${g.faces[g.default].path.split("/").slice(0, -1).join("/")}`.replace(/\/$/, "")) },
    "-",
    { label: "Delete Family…", danger: true, act: () => confirmDeleteGroups([g.id]) },
  ].filter(Boolean));
  if (tab === "glyphs") return renderGlyphs(g);
  if (tab === "info") return renderInfo(g);
  renderPreview(g);
}

function renderPreview(g) {
  const c = $("#content");
  const text = prefs.pageText;
  c.innerHTML = `<div class="page">
    <div class="controls">
      <label class="textfield">${icon("fonts")}<input id="pText" value="${esc(text)}" placeholder="Type something to test…" spellcheck="false">
        <button class="icon-btn" id="presetBtn" title="Sample text presets">${icon("chev", "chev")}</button></label>
      <div class="slider"><span>Size</span><input type="range" id="pSize" min="8" max="240" value="${prefs.pageSize}"><span class="size-val" id="pSizeVal">${prefs.pageSize}pt</span></div>
    </div>
    ${g.families.map((fam) => `<section class="fam-section">
      <div class="fam-head">${g.families.length > 1 || fam.faces.length > 1 ? `<input type="checkbox" class="check" data-famcheck="${esc(fam.name)}" title="Select all ${esc(fam.name)} styles">` : ""}
        <h2>${esc(fam.name)}<span class="count">${plural(fam.faces.length, "style")}</span></h2>
        <button class="btn sm" data-famdl="${esc(fam.name)}">${icon("download")}Download${g.families.length > 1 ? ` ${esc(fam.name)}` : " All"}</button></div>
      ${fam.faces.map((fid) => styleRowHTML(g.faces[fid], text)).join("")}</section>`).join("")}
    <div id="selBarHost"></div></div>`;
  c.style.setProperty("--size", prefs.pageSize + "px");
  c.scrollTop = 0;

  // load full fonts for each style
  $$(".sample-edit[data-face]", c).forEach((el) => {
    const f = g.faces[el.dataset.face];
    loadFont("f", f.id, f.mtime).then((fam) => { if (fam) { el.style.fontFamily = faceStack(fam); el.classList.remove("loading"); } else el.textContent = "Couldn't load this font"; });
  });
  const pg = $(".page", c);
  const input = $("#pText");
  const applyText = (t, except) => {
    prefs.pageText = t; savePrefs();
    $$(".sample-edit[data-face]", c).forEach((el) => { if (el !== except) el.textContent = t; });
  };
  input.oninput = () => applyText(input.value);
  pg.addEventListener("input", (e) => {
    const el = e.target.closest(".sample-edit");
    if (!el) return;
    input.value = el.textContent;
    applyText(el.textContent, el);
  });
  pg.addEventListener("paste", (e) => {
    if (!e.target.closest(".sample-edit")) return;
    e.preventDefault();
    document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text"));
  });
  $("#presetBtn").onclick = (e) => { e.preventDefault(); showMenu(e.currentTarget, PRESETS.map(([l, t]) => ({ label: l, act: () => { input.value = t ?? g.name; applyText(input.value); } }))); };
  $("#pSize").oninput = (e) => { prefs.pageSize = +e.target.value; savePrefs(); $("#pSizeVal").textContent = prefs.pageSize + "pt"; c.style.setProperty("--size", prefs.pageSize + "px"); };

  // variable axes
  $$(".axes", c).forEach((box) => {
    const row = box.closest(".style-row"), el = $(".sample-edit", row);
    const update = () => {
      const s = $$("input[type=range]", box).map((r) => { r.nextElementSibling.textContent = (+r.value).toFixed(r.step < 1 ? 1 : 0); return `"${r.dataset.axis}" ${r.value}`; }).join(", ");
      el.style.fontVariationSettings = s;
    };
    box.addEventListener("input", update);
    $(".inst-select", row)?.addEventListener("change", (e) => {
      const coords = JSON.parse(e.target.value || "{}");
      $$("input[type=range]", box).forEach((r) => { if (r.dataset.axis in coords) r.value = coords[r.dataset.axis]; });
      update();
    });
  });

  pg.addEventListener("click", (e) => {
    const dl = e.target.closest("[data-dl]");
    if (dl) { const f = g.faces[dl.dataset.dl]; downloadFaces([f.id]); toast(`Downloading ${f.family} ${f.style}`); return; }
    const del = e.target.closest("[data-delface]");
    if (del) { const f = g.faces[del.dataset.delface]; confirmDeleteFaces([f], `${f.family} ${f.style}`); return; }
    const fdl = e.target.closest("[data-famdl]");
    if (fdl) { const fam = g.families.find((x) => x.name === fdl.dataset.famdl); downloadFaces(fam.faces, fam.name); toast(`Downloading ${fam.name}`); return; }
  });
  pg.addEventListener("change", (e) => {
    const ck = e.target.closest("[data-check]");
    if (ck) { ck.checked ? S.pageChecked.add(ck.dataset.check) : S.pageChecked.delete(ck.dataset.check); ck.closest(".style-row").classList.toggle("checked", ck.checked); syncChecks(g); return; }
    const fc = e.target.closest("[data-famcheck]");
    if (fc) {
      const fam = g.families.find((x) => x.name === fc.dataset.famcheck);
      fam.faces.forEach((fid) => fc.checked ? S.pageChecked.add(fid) : S.pageChecked.delete(fid));
      $$("[data-check]", c).forEach((x) => { x.checked = S.pageChecked.has(x.dataset.check); x.closest(".style-row").classList.toggle("checked", x.checked); });
      syncChecks(g);
    }
  });
  syncChecks(g);
}
function styleRowHTML(f, text) {
  const fmt = f.format.toUpperCase();
  const axes = f.axes?.length ? `<div class="axes">${f.axes.map((a) => {
    const step = a.max - a.min <= 2 ? 0.1 : 1;
    return `<label class="axis"><span title="${esc(a.tag)}">${esc(a.name)}</span><input type="range" data-axis="${esc(a.tag)}" min="${a.min}" max="${a.max}" step="${step}" value="${a.default}"><span>${a.default}</span></label>`;
  }).join("")}</div>` : "";
  const inst = f.instances?.length ? `<select class="inst-select" title="Named instance"><option value="">Instances</option>${f.instances.map((i) => `<option value='${esc(JSON.stringify(i.coords))}'>${esc(i.name)}</option>`).join("")}</select>` : "";
  return `<div class="style-row ${S.pageChecked.has(f.id) ? "checked" : ""}">
    <div class="style-meta">
      <input type="checkbox" class="check" data-check="${f.id}" ${S.pageChecked.has(f.id) ? "checked" : ""} aria-label="Select ${esc(f.style)}">
      <span class="sname">${esc(f.style)}</span>
      <span>${f.axes?.length ? "Variable" : `Weight ${f.weight}`} · ${fmt}</span>
      ${f.dup ? `<span class="pill warn" title="Another file has the same PostScript name">Duplicate</span>` : ""}
      ${inst}
      <span class="grow"></span>
      <span class="acts">
        <button class="icon-btn" data-dl="${f.id}" title="Download ${esc(f.style)}">${icon("download")}</button>
        <button class="icon-btn" data-delface="${f.id}" title="Delete ${esc(f.style)}">${icon("trash")}</button>
      </span>
    </div>
    ${f.web ? `<div class="sample-edit loading" contenteditable="true" spellcheck="false" data-face="${f.id}" data-ph="Type here">${esc(text)}</div>`
      : `<div class="sample-edit" style="font:13px var(--font-ui);color:var(--text-3)">Browsers can't render ${fmt} fonts, but you can still download it.</div>`}
    ${axes}
  </div>`;
}
function syncChecks(g) {
  const n = S.pageChecked.size;
  $$("[data-famcheck]").forEach((fc) => {
    const fam = g.families.find((x) => x.name === fc.dataset.famcheck);
    const k = fam.faces.filter((fid) => S.pageChecked.has(fid)).length;
    fc.checked = k === fam.faces.length; fc.indeterminate = k > 0 && k < fam.faces.length;
  });
  const host = $("#selBarHost");
  if (!host) return;
  host.innerHTML = n ? `<div class="sel-bar">${plural(n, "style")} selected
    <button class="btn primary sm" id="selDl">${icon("download")}Download</button>
    <button class="btn sm danger-text" id="selDel">${icon("trash")}Delete</button>
    <button class="btn sm" id="selClear">Clear</button></div>` : "";
  if (!n) return;
  const faces = [...S.pageChecked].map((id) => g.faces[id]).filter(Boolean);
  $("#selDl").onclick = () => { downloadFaces(faces.map((f) => f.id), `${g.name} (selection)`); toast(`Downloading ${plural(n, "style")}`); };
  $("#selDel").onclick = () => confirmDeleteFaces(faces, plural(n, "style"));
  $("#selClear").onclick = () => { S.pageChecked.clear(); $$("[data-check]").forEach((x) => { x.checked = false; x.closest(".style-row").classList.remove("checked"); }); syncChecks(g); };
}

// glyphs tab
async function renderGlyphs(g) {
  const c = $("#content");
  const webFaces = g.families.flatMap((fam) => fam.faces.map((id) => g.faces[id])).filter((f) => f.web);
  if (!webFaces.length) { c.innerHTML = `<div class="empty"><h2>No glyph view</h2><p>Browsers can't render ${esc(g.formats.join(", ").toUpperCase())} fonts.</p></div>`; return; }
  const face = g.faces[S.glyphFace] || g.faces[g.default] || webFaces[0];
  S.glyphFace = face.id;
  c.innerHTML = `<div class="page"><div class="controls">
      <select class="inst-select" id="gFace" style="height:28px">${g.families.map((fam) => `<optgroup label="${esc(fam.name)}">${fam.faces.map((id) => g.faces[id]).filter((f) => f.web).map((f) => `<option value="${f.id}" ${f.id === face.id ? "selected" : ""}>${esc(f.style)}</option>`).join("")}</optgroup>`).join("")}</select>
      <span id="gCount" style="color:var(--text-2);font-size:12px">Loading characters…</span>
      <label class="search" style="margin-left:auto">${icon("search")}<input id="gFind" placeholder="Find character or U+code" spellcheck="false"></label>
    </div><div class="glyph-wrap"><div class="glyph-grid" id="gGrid"></div><aside class="glyph-detail" id="gDetail"></aside></div></div>`;
  $("#gFace").onchange = (e) => { S.glyphFace = e.target.value; renderGlyphs(g); };
  const [fam, data] = await Promise.all([loadFont("f", face.id, face.mtime), api(`/api/face/${face.id}/chars`)]);
  const grid = $("#gGrid");
  if (!grid) return;
  grid.style.fontFamily = faceStack(fam);
  $("#gDetail").style.fontFamily = faceStack(fam);
  let chars = data.chars.filter((cp) => cp > 0x20 && !(cp >= 0x7f && cp < 0xa0));
  const all = chars;
  $("#gCount").textContent = `${chars.length.toLocaleString()} characters · ${face.glyphs ? face.glyphs.toLocaleString() + " glyphs" : ""}`;
  let shown = 0;
  const STEP = 1200;
  const cell = (cp) => `<div class="gcell" data-cp="${cp}">${esc(String.fromCodePoint(cp))}<small>${cp.toString(16).toUpperCase().padStart(4, "0")}</small></div>`;
  const more = () => {
    $("#gMore")?.remove();
    grid.insertAdjacentHTML("beforeend", chars.slice(shown, shown + STEP).map(cell).join(""));
    shown += STEP;
    if (shown < chars.length) grid.insertAdjacentHTML("afterend", `<div class="more" id="gMore"><button class="btn">Show ${Math.min(STEP * 4, chars.length - shown).toLocaleString()} more</button></div>`);
    $("#gMore button")?.addEventListener("click", () => { for (let i = 0; i < 4; i++) if (shown < chars.length) { grid.insertAdjacentHTML("beforeend", chars.slice(shown, shown + STEP).map(cell).join("")); shown += STEP; } $("#gMore")?.remove(); if (shown < chars.length) more(); });
  };
  const reset = (list) => { chars = list; shown = 0; grid.innerHTML = ""; more(); };
  reset(all);
  const showDetail = async (cp) => {
    $$(".gcell.sel", grid).forEach((x) => x.classList.remove("sel"));
    $(`.gcell[data-cp="${cp}"]`, grid)?.classList.add("sel");
    const hex = cp.toString(16).toUpperCase().padStart(4, "0");
    const d = $("#gDetail");
    d.innerHTML = `<div class="glyph-big">${esc(String.fromCodePoint(cp))}</div>
      <div><div style="font:600 14px var(--font-ui)" id="gName">…</div><div style="font:12px var(--font-ui);color:var(--text-2)">U+${hex}</div></div>
      <dl class="kv" style="font-family:var(--font-ui)"><dt>Glyph name</dt><dd id="gGlyph">…</dd><dt>Decimal</dt><dd>${cp}</dd><dt>HTML</dt><dd>&amp;#x${hex};</dd></dl>
      <button class="btn" id="gCopy" style="font-family:var(--font-ui)">${icon("copy")}Copy Character</button>`;
    $("#gCopy").onclick = () => copyText(String.fromCodePoint(cp));
    try {
      const info = await api(`/api/face/${face.id}/char/${cp}`);
      if ($("#gName")) { $("#gName").textContent = info.name ? info.name.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase()) : "Unnamed"; $("#gGlyph").textContent = info.glyph || "—"; }
    } catch {}
  };
  grid.addEventListener("click", (e) => { const el = e.target.closest(".gcell"); if (el) showDetail(+el.dataset.cp); });
  $("#gFind").addEventListener("input", debounce((e) => {
    const v = e.target.value.trim();
    if (!v) return reset(all);
    const m = v.match(/^(?:u\+|0x)?([0-9a-f]{2,6})$/i);
    const set = new Set([...v].map((ch) => ch.codePointAt(0)));
    reset(all.filter((cp) => set.has(cp) || (m && cp.toString(16).includes(m[1].toLowerCase()))));
  }, 150));
  showDetail(all.find((cp) => cp === 0x41) || all[0]);
}

// info tab
function renderInfo(g) {
  const c = $("#content");
  const faces = g.families.flatMap((fam) => fam.faces.map((id) => g.faces[id]));
  const face = g.faces[S.infoFace] || g.faces[g.default] || faces[0];
  S.infoFace = face.id;
  const link = (u) => /^https?:\/\//i.test(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>` : esc(u);
  const rows = [
    ["Full name", face.full], ["PostScript name", face.ps], ["Family", face.family], ["Style", face.style],
    ["Version", face.version], ["Designer", face.designer], ["Designer URL", face.designer_url, link],
    ["Manufacturer", face.manufacturer], ["Vendor URL", face.vendor_url, link],
    ["Licence (embedded)", face.license], ["Licence URL", face.license_url, link],
    ["Copyright", face.copyright], ["Trademark", face.trademark], ["Description", face.description],
    ["Format", `${face.format.toUpperCase()}${face.outlines ? ` · ${face.outlines} outlines` : ""}`],
    ["Weight / width", `${face.weight} / ${face.width}${face.italic ? " · Italic" : ""}`],
    ["Glyphs", face.glyphs ? `${face.glyphs.toLocaleString()} glyphs · ${(face.chars || 0).toLocaleString()} characters` : ""],
    ["Variable axes", (face.axes || []).map((a) => `${a.name} (${a.tag}) ${a.min}–${a.max}`).join("\n")],
    ["File", `${face.path}${face.index !== null && face.index !== undefined ? ` (face ${face.index + 1} of collection)` : ""}`],
    ["File size", fmtSize(face.size)], ["Added", fullDate(face.seen)], ["Last used", fullDate(face.used)],
  ].filter(([, v]) => v);
  c.innerHTML = `<div class="info-wrap"><div>
      <div class="info-top"><select class="inst-select" id="iFace" style="height:28px">${g.families.map((fam) => `<optgroup label="${esc(fam.name)}">${fam.faces.map((id) => g.faces[id]).map((f) => `<option value="${f.id}" ${f.id === face.id ? "selected" : ""}>${esc(f.style)}</option>`).join("")}</optgroup>`).join("")}</select>
        <span class="grow" style="flex:1"></span><button class="btn sm" id="iDl">${icon("download")}Download This Style</button></div>
      <div class="info-card">${rows.map(([k, v, fmt]) => `<dl class="kv"><dt>${esc(k)}</dt><dd>${fmt ? fmt(v) : esc(v)}</dd></dl>`).join("")}</div>
    </div>
    <aside class="info-side">
      <div class="ins-block"><label>Licence</label>${licControl(g.tags.licence)}
        <textarea class="note" placeholder="Licence notes">${esc(g.tags.note)}</textarea></div>
      <div class="ins-block"><label>Project IDs</label><div id="chipHost"></div></div>
      <dl class="kv"><dt>Family size</dt><dd>${fmtSize(g.size)}</dd><dt>Last downloaded</dt><dd>${esc(fullDate(g.downloaded))}</dd></dl>
    </aside></div>`;
  $("#iFace").onchange = (e) => { S.infoFace = e.target.value; renderInfo(g); };
  $("#iDl").onclick = () => { downloadFaces([face.id]); toast(`Downloading ${face.family} ${face.style}`); };
  bindTagEditor($(".info-side", c), g);
  $$("[data-lic]", c).forEach((b) => b.addEventListener("click", () => setTimeout(() => { $("#tbRight .pill")?.remove(); $("#tbRight").insertAdjacentHTML("afterbegin", licPill(g)); }, 300)));
}

// ------------------------------------------------------------------ trash
async function renderTrash() {
  $("#inspector").hidden = true; $("#backBtn").hidden = true; $("#tbCenter").innerHTML = "";
  setTitle("Recently Deleted", "");
  const batches = await api("/api/trash");
  S.trashCount = batches.length; renderSidebar();
  setTitle("Recently Deleted", plural(batches.length, "item"));
  $("#tbRight").innerHTML = `<button class="btn danger-text" id="emptyTrash" ${batches.length ? "" : "disabled"}>${icon("trash")}Empty</button>`;
  $("#emptyTrash").onclick = () => confirmSheet("Permanently delete everything in Recently Deleted?", "These files will be erased from the server. This can't be undone.", "Delete Permanently", async () => {
    await api("/api/trash", { method: "DELETE" }); toast("Recently Deleted emptied"); renderTrash();
  }, true);
  const c = $("#content");
  if (!batches.length) { c.innerHTML = `<div class="empty">${icon("trash", "big")}<h2>Nothing here</h2><p>Fonts you delete land here first, so you can restore them.</p></div>`; return; }
  c.innerHTML = `<div class="trash">${batches.map((b) => `<div class="trow">
      <div class="grow"><b>${esc(b.names.slice(0, 3).join(", "))}${b.names.length > 3 ? ` and ${b.names.length - 3} more` : ""}</b>
      <span>${plural(b.files.length, "file")} · deleted ${esc(ago(b.time).toLowerCase())}</span></div>
      <button class="btn sm" data-restore="${esc(b.id)}">Restore</button>
      <button class="btn sm danger-text" data-purge="${esc(b.id)}">Delete Now</button></div>`).join("")}</div>`;
  c.onclick = async (e) => {
    const r = e.target.closest("[data-restore]"), p = e.target.closest("[data-purge]");
    if (r) { await api(`/api/trash/${r.dataset.restore}/restore`, { method: "POST" }); toast("Restored"); await loadLibrary(); renderTrash(); }
    if (p) confirmSheet("Delete permanently?", "These files will be erased from the server. This can't be undone.", "Delete Permanently", async () => {
      await api(`/api/trash/${p.dataset.purge}`, { method: "DELETE" }); renderTrash();
    }, true);
  };
}

// ------------------------------------------------------------------ settings
async function openSettings() {
  const st = await api("/api/settings");
  let browsePath = st.subdir;
  openSheet(`<h3>Settings</h3>
    <div class="scroll" style="display:flex;flex-direction:column;gap:14px">
    <div class="setting"><span class="field-label">Font folder</span>
      <div class="row2"><div class="path-box" id="curPath">${esc(st.fonts_dir)}</div><button class="btn" id="chgFolder">Change…</button></div>
      ${!st.exists ? `<span style="color:var(--red);font-size:12px">This folder doesn't exist inside the container. Check the app's storage mount.</span>` :
        !st.writable ? `<span style="color:var(--warn-text);font-size:12px">Read-only: uploads and deleting won't work until the app user (568) has write access.</span>` : ""}
      <div id="pickerHost"></div>
      <span style="font-size:11px;color:var(--text-3)">You can pick any folder inside <b>${esc(st.root)}</b>, which is what's mounted into the app. To go outside it, change the storage mount in TrueNAS.</span></div>
    <div class="setting"><span class="field-label">Appearance</span>
      <div class="seg" id="themeSeg" style="align-self:flex-start">${Object.entries(THEMES).map(([k, l]) => `<button data-theme-opt="${k}" class="${prefs.theme === k ? "on" : ""}">${icon(k === "auto" ? "auto" : k === "dark" ? "moon" : "sun")}${l}</button>`).join("")}</div></div>
    <div class="setting"><span class="field-label">Tags</span>
      <div class="row2"><button class="btn" id="expTags">${icon("download")}Export Tags</button><button class="btn" id="impTags">${icon("upload")}Import Tags…</button></div>
      <span style="font-size:11px;color:var(--text-3)">JSON list of {"family", "files": [..], "licence": "open" | "closed", "note", "projects": [..]}. Matches by file name or family name, and adds to existing tags.</span></div>
    <div class="setting"><span class="field-label">Library</span>
      <div class="row2"><button class="btn" id="setRescan">${icon("refresh")}Rescan Now</button><span style="font-size:12px;color:var(--text-2)">Also rescans automatically every ${st.rescan_seconds}s while open.</span></div></div>
    </div>
    <div class="acts"><button class="btn primary" id="closeSet">Done</button></div>`, "wide");
  $("#closeSet").onclick = closeSheet;
  $$("[data-theme-opt]").forEach((b) => b.onclick = () => { setTheme(b.dataset.themeOpt); $$("[data-theme-opt]").forEach((x) => x.classList.toggle("on", x === b)); });
  $("#expTags").onclick = () => triggerDownload("/api/tags/export");
  $("#impTags").onclick = () => $("#importPick").click();
  $("#setRescan").onclick = () => { api("/api/rescan", { method: "POST" }); closeSheet(); toast("Rescanning folder"); setTimeout(refresh, 900); };
  $("#chgFolder").onclick = () => picker();
  async function picker() {
    let d;
    try { d = await api(`/api/browse?path=${encodeURIComponent(browsePath)}`); }
    catch (e) { browsePath = ""; d = await api("/api/browse?path="); }
    browsePath = d.path;
    const crumbs = ["", ...d.path.split("/").filter(Boolean)];
    $("#pickerHost").innerHTML = `<div class="picker">
      <div class="picker-crumbs">${crumbs.map((p, i) => `<button data-crumb="${esc(crumbs.slice(1, i + 1).join("/"))}">${esc(i === 0 ? st.root.split("/").pop() || "/" : p)}</button>${i < crumbs.length - 1 ? "<span>›</span>" : ""}`).join("")}</div>
      <div class="picker-list">${d.dirs.map((x) => `<div data-dir="${esc(x)}">${icon("folder")}${esc(x)}</div>`).join("") || `<div style="color:var(--text-3)">No subfolders</div>`}</div>
      <div class="picker-foot" style="display:flex;align-items:center;gap:8px"><span style="flex:1">${plural(d.fonts_here, "font file")} directly in this folder</span>
        <button class="btn sm" id="pickCancel">Cancel</button><button class="btn sm primary" id="pickUse">Use This Folder</button></div></div>`;
    $$("[data-crumb]").forEach((b) => b.onclick = () => { browsePath = b.dataset.crumb; picker(); });
    $$("[data-dir]").forEach((b) => b.onclick = () => { browsePath = (browsePath ? browsePath + "/" : "") + b.dataset.dir; picker(); });
    $("#pickCancel").onclick = () => { $("#pickerHost").innerHTML = ""; };
    $("#pickUse").onclick = async () => {
      try {
        const r = await api("/api/settings", { method: "PUT", json: { subdir: browsePath } });
        $("#curPath").textContent = r.fonts_dir; $("#pickerHost").innerHTML = "";
        toast("Font folder changed. Re-indexing…");
        S.sel.clear(); S.loaded = false;
        setTimeout(refresh, 600);
      } catch (e) { toast(e.message); }
    };
  }
}
$("#importPick").onchange = async (e) => {
  const file = e.target.files[0]; e.target.value = "";
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const r = await api("/api/tags/import", { method: "POST", json: data });
    await refreshAfterChange();
    openSheet(`<h3>Tags imported</h3><p>Applied ${plural(r.matched, "entry", "entries")} to ${plural(r.families ?? r.matched, "family", "families")}.</p>
      ${r.unmatched.length ? `<p>${plural(r.unmatched.length, "entry", "entries")} didn't match a family in your library:</p><div class="scroll" style="max-height:200px"><div class="multi-stack">${r.unmatched.map((u) => `<span>${esc(u)}</span>`).join("")}</div></div>` : ""}
      <div class="acts"><button class="btn primary" id="ok">OK</button></div>`);
    $("#ok").onclick = closeSheet;
  } catch (err) { toast(`Import failed: ${err.message}`); }
};

// ------------------------------------------------------------------ upload
async function uploadFiles(files) {
  files = [...files].filter((f) => /\.(otf|ttf|ttc|otc|woff2?|pfb|pfa|dfont|zip)$/i.test(f.name));
  if (!files.length) { toast("Those don't look like font files"); return; }
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  toast(`Checking ${plural(files.length, "file")}…`);
  try {
    const r = await api("/api/upload", { method: "POST", body: fd });
    if (r.committed) return afterUpload(r);
    duplicateSheet(r);
  } catch (e) { toast(`Upload failed: ${e.message}`); }
}
async function afterUpload(r) {
  const parts = [];
  if (r.saved.length) parts.push(`Added ${plural(r.saved.length, "font file")}`);
  if (r.replaced?.length) parts.push(`replaced ${r.replaced.length}`);
  if (r.skipped?.length) parts.push(`skipped ${plural(r.skipped.length, "duplicate")}`);
  toast(parts.length ? parts.join(", ").replace(/^./, (c) => c.toUpperCase()) : "Nothing new to add");
  if (r.saved.length) {
    S.filter = { type: "recent" };
    if (S.route.name !== "home") location.hash = "#/";
  }
  await refreshAfterChange();
}
function duplicateSheet(r) {
  const items = r.items;
  const n = (st) => items.filter((i) => i.status === st).length;
  const nNew = n("new"), nSame = n("same"), nInLib = n("identical"), nRepeat = n("repeat"), nIdent = nInLib + nRepeat, nBad = n("invalid");
  const STAT = {
    identical: ["Already installed", "proj"], repeat: ["Repeated in this upload", "proj"],
    same: ["Different version installed", "warn"], new: ["New", "open"], invalid: ["Can't read this file", "closed"],
  };
  const order = { same: 0, identical: 1, repeat: 2, invalid: 3, new: 4 };
  const rows = [...items].sort((a, b) => order[a.status] - order[b.status] || collator.compare(a.name, b.name)).map((i) => {
    let detail = "";
    if (i.status === "identical") detail = `Identical file at ${i.matches[0]}`;
    if (i.status === "repeat") detail = `Same file as ${i.matches[0]}`;
    if (i.status === "same") detail = `${i.version ? `Uploading ${esc(i.version)}` : "Uploading"}${i.existing_version ? `, library has ${esc(i.existing_version)}` : ""}${i.version && i.version === i.existing_version ? " (same version number, different file)" : ""}<br>${i.matches.map(esc).join("<br>")}`;
    if (i.status === "invalid") detail = esc(i.error);
    return `<div class="dup-row"><div class="grow"><b>${esc(i.family ? `${i.family} ${i.style}` : i.name)}</b><span>${esc(i.name)}</span>${detail ? `<span>${i.status === "same" ? detail : esc(detail)}</span>` : ""}</div><span class="pill ${STAT[i.status][1]}">${STAT[i.status][0]}</span></div>`;
  }).join("");
  const title = !nNew && !nSame ? (nIdent ? (items.length === 1 ? "This font is already installed" : "These fonts are already installed") : "Nothing to add")
    : nSame + nInLib ? `${plural(nSame + nInLib, "font")} ${nSame + nInLib === 1 ? "is" : "are"} already in your library` : "Some files appear twice in this upload";
  const summary = [nNew && `${nNew} new`, nInLib && `${nInLib} already installed`, nRepeat && `${nRepeat} repeated in this upload`, nSame && `${nSame} with a different version installed`, nBad && `${nBad} unreadable`].filter(Boolean).join(" · ");
  const acts = [];
  acts.push(`<button class="btn" id="dupCancel">Cancel</button>`);
  if (nSame) {
    acts.push(`<button class="btn" data-mode="keep" title="Add the other versions alongside the ones you have">Keep Both</button>`);
    acts.push(`<button class="btn" data-mode="replace" title="Move the installed versions to Recently Deleted and add these">Replace Installed</button>`);
  }
  if (nNew || nSame) acts.push(`<button class="btn primary" data-mode="skip">${nNew ? `Add ${nNew} New, Skip Duplicates` : "Skip Duplicates"}</button>`);
  else acts[0] = `<button class="btn primary" id="dupCancel">OK</button>`;
  openSheet(`<h3>${esc(title)}</h3><p>${esc(summary)}${nIdent ? ". Identical copies are always skipped." : ""}</p>
    <div class="scroll dup-list">${rows}</div>
    <div class="acts" style="flex-wrap:wrap">${acts.join("")}</div>`, "wide");
  const cancel = () => { closeSheet(); if (!nNew && !nSame) toast("Nothing added"); };
  $("#dupCancel").onclick = cancel;
  $$("[data-mode]").forEach((b) => b.onclick = async () => {
    $$("#sheet .btn").forEach((x) => x.disabled = true);
    try {
      S.pendingUpload = null;
      const res = await api(`/api/upload/${r.token}/commit`, { method: "POST", json: { mode: b.dataset.mode } });
      closeSheet(); afterUpload(res);
    } catch (e) { closeSheet(); toast(e.message); }
  });
  S.pendingUpload = r.token;
}
$("#filePick").onchange = (e) => { uploadFiles(e.target.files); e.target.value = ""; };
let dragDepth = 0;
const isFileDrag = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
window.addEventListener("dragenter", (e) => { if (!isFileDrag(e)) return; dragDepth++; $("#dropOverlay").classList.add("on"); });
window.addEventListener("dragleave", (e) => { if (!isFileDrag(e)) return; if (--dragDepth <= 0) { dragDepth = 0; $("#dropOverlay").classList.remove("on"); } });
window.addEventListener("dragover", (e) => { if (isFileDrag(e)) e.preventDefault(); });
window.addEventListener("drop", (e) => {
  if (!isFileDrag(e)) return;
  e.preventDefault(); dragDepth = 0; $("#dropOverlay").classList.remove("on");
  uploadFiles(e.dataTransfer.files);
});
$(".drop-icon").innerHTML = icon("upload");

// ------------------------------------------------------------------ menus, sheets, toasts
function showMenu(anchor, items) {
  const m = $("#menu");
  m.innerHTML = items.map((it, i) => it === "-" ? `<div class="sep"></div>` : it.head ? `<div class="mh">${esc(it.head)}</div>` :
    `<div class="mi ${it.danger ? "danger" : ""} ${it.disabled ? "disabled" : ""}" data-i="${i}"><span class="ck">${it.check ? "✓" : ""}</span>${esc(it.label)}${it.kbd ? `<span class="kbd">${it.kbd}</span>` : ""}</div>`).join("");
  m.hidden = false;
  let x, y;
  if (anchor instanceof Element) { const r = anchor.getBoundingClientRect(); x = r.left; y = r.bottom + 4; }
  else ({ x, y } = anchor);
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(6, Math.min(x, innerWidth - w - 6)) + "px";
  m.style.top = (y + h > innerHeight - 6 ? Math.max(6, y - h - 8) : y) + "px";
  m.onclick = (e) => { const el = e.target.closest(".mi"); if (!el || el.classList.contains("disabled")) return; hideMenu(); items[+el.dataset.i].act?.(); };
}
function hideMenu() { $("#menu").hidden = true; }
document.addEventListener("mousedown", (e) => { if (!$("#menu").hidden && !e.target.closest("#menu")) hideMenu(); }, true);
window.addEventListener("blur", hideMenu);
window.addEventListener("resize", hideMenu);

function openSheet(html, cls = "") {
  const s = $("#sheet");
  s.className = `sheet ${cls}`; s.innerHTML = html; $("#sheetBack").hidden = false;
  setTimeout(() => (s.querySelector("input") || s.querySelector(".btn.primary, .btn.danger"))?.focus(), 30);
}
function closeSheet() {
  $("#sheetBack").hidden = true; $("#sheet").innerHTML = "";
  if (S.pendingUpload) { api(`/api/upload/${S.pendingUpload}`, { method: "DELETE" }).catch(() => {}); S.pendingUpload = null; }
}
$("#sheetBack").addEventListener("mousedown", (e) => { if (e.target.id === "sheetBack") closeSheet(); });
function confirmSheet(title, body, okLabel, fn, destructive = false) {
  openSheet(`<h3>${esc(title)}</h3><p>${body}</p><div class="acts"><button class="btn" id="cNo">Cancel</button><button class="btn ${destructive ? "danger" : "primary"}" id="cYes">${esc(okLabel)}</button></div>`);
  $("#cNo").onclick = closeSheet;
  $("#cYes").onclick = async () => { $("#cYes").disabled = true; try { await fn(); closeSheet(); } catch (e) { toast(e.message); closeSheet(); } };
}
function promptProject(ids, after) {
  if (!ids.length) { toast("Select one or more fonts first, then add a project ID"); return; }
  const names = ids.map((id) => S.byId.get(id)?.name).filter(Boolean);
  openSheet(`<h3>Add Project ID</h3><p>Tag ${names.length === 1 ? `<b>${esc(names[0])}</b>` : plural(names.length, "family", "families")} with a project ID.</p>
    <input class="input" id="pid" placeholder="e.g. HOME-2026" list="pidList" spellcheck="false" autocomplete="off">
    <datalist id="pidList">${allProjects().map((p) => `<option value="${esc(p)}">`).join("")}</datalist>
    <div class="acts"><button class="btn" id="pNo">Cancel</button><button class="btn primary" id="pYes">Add</button></div>`);
  const go = async () => { const v = $("#pid").value.trim(); if (!v) return; closeSheet(); await bulkTag({ groups: ids, add: [v] }); after?.(); };
  $("#pNo").onclick = closeSheet; $("#pYes").onclick = go;
  $("#pid").onkeydown = (e) => { if (e.key === "Enter") go(); };
}
function toast(msg, action) {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span>${esc(msg)}</span>${action ? `<button>${esc(action.label)}</button>` : ""}`;
  if (action) t.querySelector("button").onclick = () => { t.remove(); action.fn(); };
  $("#toasts").appendChild(t);
  const all = $$("#toasts .toast"); if (all.length > 3) all[0].remove();
  setTimeout(() => t.remove(), action ? 7000 : 3200);
}
function copyText(s) {
  (navigator.clipboard?.writeText(s) || Promise.reject()).then(() => toast("Copied"), () => {
    const ta = document.createElement("textarea"); ta.value = s; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); toast("Copied");
  });
}

// ------------------------------------------------------------------ routing
function parseRoute() {
  const h = location.hash.replace(/^#\/?/, "");
  const parts = h.split("/").map(decodeURIComponent);
  if (parts[0] === "family" && parts[1]) return { name: "family", id: parts[1], tab: parts[2] || "preview" };
  if (parts[0] === "trash") return { name: "trash" };
  return { name: "home" };
}
async function route() {
  S.route = parseRoute();
  hideMenu();
  $("#content").onclick = null;
  if (S.route.name === "family") return renderFamily();
  if (S.route.name === "trash") return renderTrash();
  S.cameFromHome = false;
  renderSidebar();
  renderHomeToolbar();
  renderHome();
  $("#content").scrollTop = S.homeScroll || 0;
}
window.addEventListener("hashchange", route);

// ------------------------------------------------------------------ boot
if (!prefs.sidebar) $(".window").classList.add("no-sidebar");
(async () => {
  route();
  await refresh(true);
})();
})();
