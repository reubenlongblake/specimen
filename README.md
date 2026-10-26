# Specimen

A Font Book style web app for the font folder on MISCHA. Browse every family as a tile, single-click for the inspector (download, delete, licence, project IDs), double-click to open a family page where you can type your own text, try variable axes, browse glyphs and read embedded licence info.

## Install on TrueNAS SCALE

Every push to `main` builds a Docker image with GitHub Actions and publishes it to `ghcr.io/<you>/specimen`.

1. **Create the data dataset.** Add a child dataset `APPS/SPECIMEN` with the Apps preset (or give the `apps` user, UID 568, Modify on it). This holds tags, settings, the scan index and the preview cache.
2. **Font folder permissions.** On `MISCHA/DECADE_STUDIOS`, give `apps` Read/Traverse, and Modify on `02_SHARED_ASSETS/02_FONTS` (needed for adding fonts and Recently Deleted). For Last Used to work, set Access Time to On for that dataset.
3. **Install.** Apps > Discover Apps > Custom App > Install via YAML, paste `compose.yaml` and save.
4. **Open** `http://mischa-nas:8095`. After the first index finishes, import `specimen-licences.json` from Settings > Import Tags.

To update, push to GitHub, wait for the build, then in TrueNAS open the app and choose Update (or stop and start it with "pull image" ticked). Your data in `APPS/SPECIMEN` is untouched.

## Running elsewhere

```sh
docker build -t specimen .
docker run -p 8095:8095 -v /path/to/fonts-parent:/library -v /path/to/data:/data -e FONTS_SUBDIR=fonts specimen
```

### Homepage dashboard entry

```yaml
- Specimen:
    href: http://mischa-nas:8095
    description: Font library
    icon: mdi-format-font
```

## Using it

- **Select:** click, Shift-click for a range, Cmd/Ctrl-click to add. Cmd/Ctrl+A selects all. The inspector on the right shows actions for whatever's selected. Right-click for the same options.
- **Open:** double-click or press Enter. The Preview tab syncs your text across every style; you can type straight into any sample. Esc goes back.
- **Download:** a whole family (zip) from the tile, inspector or family page, a single subfamily (e.g. Panton Narrow Demo only) from its section header, individual styles from each row, or tick several styles and use *Download* in the bar at the bottom.
- **Delete:** moves files into a hidden `.specimen-trash` folder inside the font folder. Undo from the toast, or restore later from *Recently Deleted*.
- **Add fonts:** drag font files or `.zip` archives onto the window, or use the + button. Zips are unpacked into a folder named after the zip.
- **Project IDs:** add them in the inspector (Enter to add, suggestions from IDs you've used before), select several families to tag them all at once, or drag tiles onto a project in the sidebar. Search finds fonts by project ID too.
- **Licence:** Open (green), Closed (red) or Unknown, plus a free-text note. Dragging tiles onto a licence in the sidebar sets it in bulk. The Info tab shows the licence text embedded in the font file itself, which is handy for checking.
- **Rename:** pencil next to the name in the inspector, right-click > Rename Family, the family page's ... menu, or F2. Display only: tags stay attached and the font files aren't changed. Reset to Automatic Name undoes it.
- **Merge:** if two tiles are clearly the same family, select both and choose *Merge into One Family* in the inspector (or right-click). Pick which name to keep; tags are combined. Nothing on disk changes, and *Split Merged Family* undoes it.
- **Sort:** Name, Project ID, Date Added, Last Downloaded or Last Used. Pick the same option again to reverse it.
- **Appearance:** the button in the bottom-left toggles Match System, Light or Dark.
- **Settings** (gear, bottom-left): change the font folder to anything inside `DECADE_STUDIOS`, switch theme, import/export tags, rescan.

### Smart grouping

Families are grouped using the names stored inside the font files (typographic family names first), and repaired when a font bakes its weight into the family name, as many demo and free fonts do. Width and optical-size cuts are then nested under one parent: Panton Demo and Panton Narrow Demo become one tile with two sections, as do things like "Inter" and "Inter Display", or "DejaVu Sans" and "DejaVu Sans Condensed". Font files can live in any subfolder structure.

### Last Used

"Last Used" comes from each file's access time, so opening a font straight from the SMB share in Windows counts. Specimen itself never bumps access times when it reads a file. For this to work:

- **Access Time must be On** for the dataset holding the fonts (Datasets > Edit > Advanced Options > Access Time). If it's Off, Last Used will just say Never.
- ZFS may only update access times about once a day per file (`relatime`), so treat it as "used on this day" rather than to the minute.
- Windows Explorer can read font files to draw thumbnails, so simply browsing the folder in Explorer can count as a use.

### Tag import format

Settings > Import Tags accepts JSON like this. Families are matched by name, and project IDs are added to any existing ones:

```json
[
  {"family": "Panton", "licence": "closed", "note": "Fontfabric demo, personal use only", "projects": ["HOME-2026"]},
  {"family": "Lora", "licence": "open", "note": "SIL OFL 1.1"}
]
```

## Files

- `app/main.py`: the server (FastAPI + fontTools)
- `Dockerfile`, `.github/workflows/docker.yml`: the image and its automatic build
- `compose.yaml`: the TrueNAS custom app
- `app/static/`: the web interface (plain HTML, CSS and JS, no build step)
- `data/` (created on first run): `index.json` (scan cache), `tags.json` (your licences and project IDs, worth keeping in your backups), `activity.json`, `trash.json`, `settings.json` and `cache/` (preview fonts, safe to delete)

Settings that can be changed in `compose.yaml` environment: `FONTS_SUBDIR` (first-run default folder), `RESCAN_SECONDS` (default 60), `UPLOAD_SUBDIR` (subfolder for uploads, default the font folder itself).
