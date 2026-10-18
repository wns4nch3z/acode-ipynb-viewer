# IPYNB Viewer

A simple viewer (with basic editing) for Jupyter notebooks (`.ipynb`) in Acode.

## How to use

1. Install the plugin. A demo notebook opens by itself the first time, so you can see how it looks right away.
2. Open any `.ipynb` file from the file browser. It opens in its own tab.
3. To see the demo again: tap the menu (⋮) → **Command palette** → **IPYNB Viewer: open demo notebook**.
4. Tap **Edit** to change cells, then **Save**.

After that first demo, the plugin stays quiet until you open a `.ipynb` file.

## Features

- Renders code cells (with syntax highlighting), markdown, LaTeX formulas and saved outputs: text, images, HTML and errors.
- Follows the Acode theme: light and dark themes, Jupyter-style cells.
- Edit mode: change cell text, add, delete and convert cells, then save the file.
- Relative images (`figures/...`) are read from the project.
- Links to other project files open in a new tab.
- All notebook HTML is sanitized (DOMPurify) before it is displayed.
- Works offline: libraries are bundled in `lib/`.

## Bundled libraries (`lib/`)

| Library | Version | License |
|---|---|---|
| marked | 12.0.2 | MIT |
| highlight.js | 11.9.0 | BSD-3-Clause |
| KaTeX | 0.16.9 | MIT |
| DOMPurify | 3.1.6 | Apache-2.0 / MPL-2.0 |

Licenses are in `lib/licenses/` and SHA-256 sums in `lib/VERSIONS.txt`.

## Toolbar indicator

The toolbar shows `View mode`. If a library could not be loaded from `lib/` and the CDN was used as a
fallback (or it is missing), the library names are appended, e.g. `· katex:cdn`.
