#!/usr/bin/env python3
"""Genera pkg/main.js a partir de main.src.js incrustando el CSS de KaTeX y highlight.js.

Acode solo trata una hoja de estilos de la pestaña como URL si empieza por "http" o "/";
cualquier otra cosa se toma como texto CSS. Por eso el CSS local se incrusta como texto.
Del CSS de KaTeX se quitan las @font-face: las fuentes se declaran a nivel de documento
con un <link> (dentro del shadow DOM de la pestaña no se registran fuentes).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / 'main.src.js'
OUT = ROOT / 'pkg' / 'main.js'


def js_string(text: str) -> str:
    # Empieza con salto de línea: nunca arranca con "http" ni "/" (ver docstring)
    s = json.dumps('\n' + text.strip(), ensure_ascii=False)
    return s.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')


katex_css = (ROOT / 'pkg/lib/katex/katex.min.css').read_text(encoding='utf-8')
katex_css = re.sub(r'@font-face\{[^}]*\}', '', katex_css)
assert '@font-face' not in katex_css and len(katex_css) > 5000, 'CSS de KaTeX inesperado'

def scope_hljs(css: str, prefix: str) -> str:
    """Antepone prefix a cada selector y quita el fondo (lo pone el visor)."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out = []
    for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', css):
        sels = ','.join(f'{prefix} {x.strip()}' for x in sel.split(','))
        body = re.sub(r'background:[^;}]*;?', '', body)
        out.append(f'{sels}{{{body}}}')
    return ''.join(out)


hljs_dark = scope_hljs((ROOT / 'pkg/lib/github-dark.min.css').read_text(encoding='utf-8'), '.ipynb-dark')
hljs_light = scope_hljs((ROOT / 'pkg/lib/github.min.css').read_text(encoding='utf-8'), '.ipynb-light')
hljs_css = hljs_dark + hljs_light
assert len(hljs_dark) > 300 and len(hljs_light) > 300, 'CSS de highlight.js inesperado'

code = SRC.read_text(encoding='utf-8')
for marker, css in (("/*__KATEX_CSS__*/''", katex_css), ("/*__HLJS_CSS__*/''", hljs_css)):
    assert code.count(marker) == 1, f'marcador {marker} debe aparecer una vez'
    code = code.replace(marker, js_string(css))

OUT.write_text(code, encoding='utf-8')
print(f'{OUT} -> {len(code):,} bytes (KaTeX inline {len(katex_css):,} B, hljs inline {len(hljs_css):,} B)')
