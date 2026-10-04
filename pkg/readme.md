# IPYNB Viewer

A simple viewer (with basic editing) for Jupyter notebooks (`.ipynb`) in Acode.

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
