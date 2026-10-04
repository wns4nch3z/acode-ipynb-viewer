# Acode IPYNB Viewer

A simple Jupyter notebook (`.ipynb`) viewer, with basic editing, for the [Acode](https://github.com/Acode-Foundation/Acode) editor.
Plugin id: `com.wnsanchez.ipynb-viewer`. License: MIT.

Features: code cells with syntax highlighting, markdown, LaTeX (KaTeX), saved outputs (text, images, HTML, errors),
light/dark theme following Acode, relative images and links, sanitized HTML (DOMPurify), fully offline.
See [`pkg/readme.md`](pkg/readme.md) (the store description) and [`pkg/changelogs.md`](pkg/changelogs.md).

## Install
Download `ipynb-viewer-plugin.zip` from the Releases page, then in Acode: Settings → Plugins → Local, and pick the zip.

## Build
Requirements: Python 3 and `zip`.

1. Edit `main.src.js` (source). Do **not** edit `pkg/main.js`; it is generated.
2. `python3 build.py` → generates `pkg/main.js` (inlines the KaTeX and highlight.js CSS).
3. Optional syntax check: `node --check pkg/main.js`
4. `cd pkg && zip -qr -X ../ipynb-viewer-plugin.zip plugin.json main.js readme.md icon.png changelogs.md lib`
5. For a release: bump `PLUGIN_BUILD` in `main.src.js` and `version` in `pkg/plugin.json`, update `pkg/changelogs.md`, then upload the zip to [acode.app](https://acode.app).

## Notes
- Libraries are vendored in `pkg/lib/` (versions and SHA-256 sums in `pkg/lib/VERSIONS.txt`).
- Acode does not emit theme-change events, so the plugin infers light/dark from the luminance of `--primary-color`.
- Tested on Acode 1.13.5 (1011).
