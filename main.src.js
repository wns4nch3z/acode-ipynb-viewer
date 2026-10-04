'use strict';

const PLUGIN_ID = 'com.wnsanchez.ipynb-viewer';
const PLUGIN_BUILD = 'b6.3';

// Rutas locales dentro del zip del plugin (se resuelven con el baseUrl que entrega Acode).
// Las URLs del CDN de abajo quedan solo como respaldo.
const LOCAL = {
  marked: 'lib/marked.min.js',
  hljs: 'lib/highlight.min.js',
  katex: 'lib/katex/katex.min.js',
  katexAuto: 'lib/katex/auto-render.min.js',
  katexCss: 'lib/katex/katex.min.css',
  purify: 'lib/purify.min.js'
};
var PLUGIN_BASE = '';

// CSS incrustado al empaquetar (build.py). Acode solo trata una hoja de estilos como URL si empieza
// por "http" o "/"; cualquier otra cosa se toma como texto CSS, así que el CSS local va como texto.
// Si estos valores quedan vacíos (se ejecuta el código fuente sin empaquetar) se usa el CDN.
const KATEX_CSS_INLINE = /*__KATEX_CSS__*/'';
const HLJS_CSS_INLINE = /*__HLJS_CSS__*/'';

const MARKED_URL = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js';
const HLJS_URL = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js';
const HLJS_CSS = ''; // sin respaldo CDN: el tema de resaltado va incrustado (build.py); sin él el código se ve sin colores
const KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
const KATEX_URL = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
const KATEX_AUTO_URL = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
const PURIFY_URL = 'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js';

// ─────────────────────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────────────────────

const STYLES = [
  '.ipynb-page * { box-sizing: border-box; margin: 0; padding: 0; }',
  // Paleta: se apoya en las variables REALES del tema de Acode (con respaldo oscuro) y en dos clases
  // (.ipynb-dark / .ipynb-light) que el plugin pone según la luminosidad del color primario del tema.
  '.ipynb-page { --nb-bg: var(--primary-color, #0d1117); --nb-fg: var(--primary-text-color, #e6edf3); --nb-muted: var(--secondary-text-color, #8b949e); --nb-border: var(--border-color, #30363d); --nb-link: var(--link-text-color, #58a6ff); --nb-err: var(--error-text-color, #f85149); --nb-ok: var(--success-text-color, #3fb950); --nb-accent: var(--active-color, #1f6feb); --nb-t1: rgba(255,255,255,0.05); --nb-t2: rgba(255,255,255,0.12); --nb-t3: rgba(255,255,255,0.03); --nb-codefg: #79c0ff; --nb-warn: #f0883e; }',
  '.ipynb-page.ipynb-light { --nb-t1: rgba(0,0,0,0.05); --nb-t2: rgba(0,0,0,0.09); --nb-t3: rgba(0,0,0,0.025); --nb-codefg: #0550ae; --nb-warn: #bc4c00; }',
  // La página rellena la pestaña de forma explícita (en vez de height:100%) y es el ÚNICO contenedor con scroll:
  // así la barra sticky funciona y no sobra espacio vacío al final.
  '.ipynb-page { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--nb-bg); color: var(--nb-fg); padding-left: 2px !important; padding-right: 2px !important; display: block; position: absolute; top: 0; right: 0; bottom: 0; left: 0; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }',
  '.ipynb-toolbar { position: sticky; top: 0; z-index: 999; background: var(--secondary-color, #1e2227); border-bottom: 2px solid var(--nb-border); padding: 5px; display: flex; align-items: center; justify-content: center; gap: 6px; height: 45px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); width: 100%; box-sizing: border-box; }',
  '.ipynb-toolbar-title { color: var(--nb-muted); font-size: 12px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
  '.ipynb-btn { border: none; border-radius: 6px; padding: 2px 8px; font-size: 10px !important; cursor: pointer; color: #fff; font-weight: bold; margin: 0 2px; }',
  '.ipynb-btn-edit { background: var(--nb-accent); color: var(--active-text-color, #fff); }',
  '.ipynb-btn-done { background: #6e7681; }',
  '.ipynb-btn-save { background: #1f6feb; border: 1px solid rgba(255,255,255,0.1); }',
  '.ipynb-btn-add { background: #1f6feb; }',
  '.ipynb-btn-del { background: #b91c1c; font-size: 11px; padding: 3px 8px; border-radius: 4px; }',
  '.ipynb-btn-type { background: #6e7681; font-size: 11px; padding: 3px 8px; border-radius: 4px; }',
  '.ipynb-btn-ins-code { background: #1f6feb; font-size: 10px; padding: 2px 6px; border-radius: 4px; border: none; color: #fff; cursor: pointer; margin: 0 1px; }',
  '.ipynb-btn-ins-md { background: #238636; font-size: 10px; padding: 2px 6px; border-radius: 4px; border: none; color: #fff; cursor: pointer; margin: 0 1px; }',
  '.ipynb-status { color: var(--nb-ok); font-size: 12px; padding: 0 6px; }',
  '.ipynb-cells { padding: 6px 4px; display: flex; flex-direction: column; gap: 14px; }',
  '.ipynb-cell { border-radius: 8px; overflow: hidden; border: 1px solid var(--nb-border); background: transparent; }',
  '.ipynb-cell-header { display: none; justify-content: flex-end; gap: 6px; padding: 4px 8px; background: var(--secondary-color, #21262d); }',
  '.ipynb-cells.edit-mode .ipynb-cell-header { display: flex; }',
  '.ipynb-badge { display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: bold; color: #fff; background: #1f6feb; }',
  '.ipynb-cell-num { display: inline-block; padding: 3px 8px; font-size: 11px; color: var(--nb-codefg); font-family: monospace; background: rgba(31,111,235,0.15); border: 1px solid rgba(31,111,235,0.3); border-radius: 4px; }',
  // Estilo Jupyter: la celda de código es un recuadro gris suave sobre el fondo del tema, con la franja de acento
  '.ipynb-source { margin: 0; padding: 12px; font-family: monospace; font-size: 13px; white-space: pre-wrap; color: var(--nb-fg); background: var(--nb-t1); border-left: 3px solid var(--nb-accent); overflow-x: auto; }',
  '.ipynb-page .hljs { background: transparent !important; }',
  '.ipynb-editor { display: none; margin: 0; padding: 12px; font-family: monospace; font-size: 13px; color: var(--nb-fg); background: var(--nb-t1); border: none; width: 100%; min-height: 80px; resize: none; outline: none; overflow: hidden; }',
  '.ipynb-cells.edit-mode .ipynb-editor { display: block; }',
  '.ipynb-cells.edit-mode .ipynb-view { display: none; }',
  '.ipynb-md { padding: 12px 16px; color: var(--nb-fg); line-height: 1.6; }',
  '.ipynb-md h1 { font-size: 1.8em; font-weight: bold; border-bottom: 2px solid var(--nb-border); padding-bottom: 8px; margin: 8px 0; }',
  '.ipynb-md h2 { font-size: 1.4em; font-weight: bold; border-bottom: 2px solid var(--nb-border); padding-bottom: 6px; margin: 8px 0; }',
  '.ipynb-md h3 { font-size: 1.1em; font-weight: bold; margin: 8px 0; }',
  '.ipynb-md p { margin: 6px 0; }',
  '.ipynb-md code { background: var(--nb-t2); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: var(--nb-codefg); }',
  '.ipynb-md pre { background: var(--nb-t1); border: 1px solid var(--nb-border); border-radius: 6px; padding: 12px; margin: 8px 0; overflow-x: auto; max-width: 100%; }',
  '.ipynb-md pre code { background: none; padding: 0; color: var(--nb-fg); white-space: pre; display: block; }',
  '.ipynb-md blockquote { border-left: 3px solid var(--nb-accent); margin: 8px 0; padding: 4px 12px; color: var(--nb-muted); background: var(--nb-t1); }',
  '.ipynb-md strong { font-weight: bold; }',
  '.ipynb-md em { font-style: italic; }',
  '.ipynb-md ul, .ipynb-md ol { padding-left: 24px; margin: 6px 0; list-style: revert; }',
  '.ipynb-md li { margin: 3px 0; display: list-item; }',
  '.ipynb-md a { color: var(--nb-link); }',
  '.ipynb-md table { border-collapse: collapse; width: 100%; margin: 8px 0; }',
  '.ipynb-md th, .ipynb-md td { border: 1px solid var(--nb-border); padding: 6px 12px; }',
  '.ipynb-md th { background: var(--nb-t2); }',
  '.ipynb-outputs { border-top: 1px solid var(--nb-border); background: var(--nb-t3); }',
  '.ipynb-output-item { margin: 0; padding: 10px 12px; font-size: 12px; font-family: monospace; white-space: pre-wrap; color: var(--nb-fg); overflow-x: auto; }',
  // Imágenes y HTML (pandas, gráficos) siguen sobre blanco, como en Jupyter: su contenido está pensado para fondo claro
  '.ipynb-output-image { padding: 8px; background: #fff; text-align: center; overflow-x: auto; }',
  '.ipynb-output-image img { max-width: 100%; height: auto; display: block; margin: 0 auto; }',
  '.ipynb-output-html { padding: 10px 12px; background: #fff; color: #000; overflow-x: auto; }',
  '.ipynb-output-error { color: var(--nb-err); }',
  '.ipynb-empty { text-align: center; padding: 40px; color: var(--nb-muted); }',
  '.ipynb-copy-btn { position: absolute; top: 6px; right: 6px; background: var(--nb-t2); border: 1px solid var(--nb-border); border-radius: 4px; color: var(--nb-muted); font-size: 10px; padding: 2px 6px; cursor: pointer; opacity: 0; transition: opacity 0.2s; }',
  '.ipynb-cell:hover .ipynb-copy-btn { opacity: 1; }',
  '.ipynb-source-wrap { position: relative; }',
  '.ipynb-img-missing { display: block; font-size: 11px; color: var(--nb-warn); font-family: monospace; padding: 4px 0; word-break: break-all; }',
  '.ipynb-output-html table { border-collapse: collapse; margin: 4px 0; }',
  '.ipynb-output-html th, .ipynb-output-html td { border: 1px solid #d0d7de; padding: 4px 8px; text-align: right; }',
  '.ipynb-unsafe-text { white-space: pre-wrap; }',
  '.ipynb-page .katex-display { overflow-x: auto; overflow-y: hidden; padding: 4px 0; }'
].join('\n');

// ─────────────────────────────────────────────────────────────
// TEMA DE ACODE: claro u oscuro
// ─────────────────────────────────────────────────────────────
// Acode no publica el tipo de tema ni avisa de cambios; se deduce de la luminosidad de --primary-color
// (el fondo del editor) y se vuelve a comprobar al abrir, al volver a la pestaña y cada pocos segundos.

function parseCssColor(value) {
  if (!value) return null;
  var probe = document.createElement('span');
  probe.style.color = '';
  probe.style.color = value.trim();
  if (!probe.style.color) return null;
  (document.body || document.documentElement).appendChild(probe);
  var rgb = getComputedStyle(probe).color;
  probe.remove();
  var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(rgb || '');
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function themeKind() {
  try {
    var host = document.body || document.documentElement;
    var raw = getComputedStyle(host).getPropertyValue('--primary-color') ||
      getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
    var c = parseCssColor(raw);
    if (!c) return 'dark';
    // luminosidad relativa aproximada (0 = negro, 1 = blanco)
    var lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
    return lum > 0.5 ? 'light' : 'dark';
  } catch (e) {
    return 'dark';
  }
}

function applyTheme(container) {
  var kind = themeKind();
  if (container.dataset.theme !== kind) {
    container.dataset.theme = kind;
    container.classList.remove('ipynb-light', 'ipynb-dark');
    container.classList.add('ipynb-' + kind);
  }
  return kind;
}

// Mantiene la paleta al día mientras la pestaña exista
function watchTheme(container) {
  var seen = false;
  var timer = null;
  function tick() {
    if (container.isConnected) seen = true;
    else if (seen) { stop(); return; }
    applyTheme(container);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    window.removeEventListener('focus', tick);
    document.removeEventListener('visibilitychange', tick);
  }
  window.addEventListener('focus', tick);
  document.addEventListener('visibilitychange', tick);
  container.addEventListener('pointerdown', tick, true);
  timer = setInterval(tick, 2500);
  return { refresh: tick, stop: stop };
}

// ─────────────────────────────────────────────────────────────
// CARGA DE LIBRERÍAS
// ─────────────────────────────────────────────────────────────

function loadScript(src) {
  return new Promise(function (resolve) {
    var done = false;
    function finish() { if (!done) { done = true; resolve(); } }
    var s = document.createElement('script');
    s.src = src;
    s.onload = finish;
    s.onerror = finish;
    // Red lenta o colgada: el visor abre igual, solo que sin esa librería
    setTimeout(finish, 8000);
    document.head.appendChild(s);
  });
}

function normalizeBase(base) {
  if (!base || typeof base !== 'string') return '';
  return base.charAt(base.length - 1) === '/' ? base : base + '/';
}

// Intenta primero el archivo local del plugin y, si falla, el CDN.
// libReport recuerda de dónde salió cada librería ('local', 'cdn' o 'missing').
var libReport = {};

function loadLib(name, localRel, cdnUrl, isReady) {
  if (isReady()) return Promise.resolve();
  if (libReport[name] === 'missing') return Promise.resolve(); // ya falló antes: no insistir en cada notebook
  var sources = [];
  if (PLUGIN_BASE) sources.push({ url: PLUGIN_BASE + localRel, from: 'local' });
  sources.push({ url: cdnUrl, from: 'cdn' });
  return sources.reduce(function (chain, s) {
    return chain.then(function () {
      if (isReady()) return null;
      return loadScript(s.url).then(function () {
        if (isReady()) libReport[name] = s.from;
      });
    });
  }, Promise.resolve()).then(function () {
    if (!isReady()) libReport[name] = 'missing';
  });
}

// Texto para la barra: vacío si todo salió de lib/, o la lista de lo que vino del CDN / faltó
function libNote() {
  var odd = Object.keys(libReport).filter(function (k) { return libReport[k] !== 'local'; });
  return odd.length ? ' · ' + odd.map(function (k) { return k + ':' + libReport[k]; }).join(',') : '';
}

function viewTitle() {
  return 'View mode' + libNote();
}

// <link> a nivel de documento: sirve para que las @font-face de KaTeX queden registradas
// (dentro del shadow DOM de la pestaña no se registran fuentes).
function addHeadStylesheet(id, localRel, cdnUrl) {
  if (document.getElementById(id)) return;
  var link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = PLUGIN_BASE ? PLUGIN_BASE + localRel : cdnUrl;
  if (PLUGIN_BASE) link.onerror = function () { link.onerror = null; link.href = cdnUrl; };
  document.head.appendChild(link);
}

function loadMarked() {
  return loadLib('marked', LOCAL.marked, MARKED_URL, function () { return !!window.marked; });
}

function loadHighlight() {
  return loadLib('hljs', LOCAL.hljs, HLJS_URL, function () { return !!window.hljs; });
}

function loadKatex() {
  addHeadStylesheet(PLUGIN_ID + '-katex-css', LOCAL.katexCss, KATEX_CSS);
  return loadLib('katex', LOCAL.katex, KATEX_URL, function () { return !!window.katex; })
    .then(function () {
      if (!window.katex) return null; // auto-render necesita katex
      return loadLib('katex-auto', LOCAL.katexAuto, KATEX_AUTO_URL, function () { return !!window.renderMathInElement; });
    });
}

// ─────────────────────────────────────────────────────────────
// SEGURIDAD: SANITIZADO DE HTML
// ─────────────────────────────────────────────────────────────
// Un notebook ajeno puede traer HTML malicioso (<img onerror>, javascript:, <iframe>, etc.)
// y el WebView de Acode tiene acceso a las APIs de la app. Todo HTML de terceros pasa por
// DOMPurify; si no está disponible se muestra como texto plano (falla cerrado, nunca abierto).

var PURIFY_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'option', 'link', 'meta',
    'base', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet'],
  FORBID_ATTR: ['srcset', 'formaction', 'ping', 'autofocus'],
  ALLOW_DATA_ATTR: false
};

// Estilos en línea: se conservan los inofensivos (color, padding…) y se descartan los que
// pueden tapar la interfaz (position/z-index), cargar recursos (url, @import) o usar escapes.
var UNSAFE_STYLE = /url\s*\(|expression\s*\(|@import|behavior\s*:|-moz-binding|position\s*:\s*(fixed|sticky|absolute)|z-index|\\/i;

var purifier; // undefined = todavía no se intentó crear

function loadPurify() {
  return loadLib('purify', LOCAL.purify, PURIFY_URL, function () { return !!window.DOMPurify; });
}

function getPurifier() {
  if (purifier !== undefined) return purifier;
  purifier = null;
  try {
    if (typeof window.DOMPurify === 'function') {
      // Instancia propia: el hook de abajo no afecta a otros plugins que usen DOMPurify
      var inst = window.DOMPurify(window);
      if (inst && inst.isSupported) {
        inst.addHook('uponSanitizeAttribute', function (node, data) {
          if (data.attrName === 'style' && UNSAFE_STYLE.test(data.attrValue)) data.keepAttr = false;
        });
        purifier = inst;
      }
    }
  } catch (e) {
    console.warn('[ipynb-viewer] DOMPurify no disponible:', e);
  }
  return purifier;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Inserta HTML ya sanitizado. Sin sanitizador: muestra fallbackText como texto plano.
function setSafeHtml(el, html, fallbackText) {
  var p = getPurifier();
  if (!p) {
    el.textContent = fallbackText !== undefined ? fallbackText : html;
    el.classList.add('ipynb-unsafe-text');
    return false;
  }
  el.innerHTML = p.sanitize(html, PURIFY_CONFIG);
  return true;
}

var fsRef = null;
var imgCache = {};
var IMG_MIME = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp', bmp: 'image/bmp'
};

function joinUri(baseDir, rel) {
  rel = rel.split('?')[0].split('#')[0];
  try { rel = decodeURIComponent(rel); } catch (e) { /* se deja tal cual */ }
  while (rel.indexOf('./') === 0) rel = rel.slice(2);
  var base = baseDir.replace(/\/$/, '');
  while (rel.indexOf('../') === 0) {
    rel = rel.slice(3);
    base = base.substring(0, base.lastIndexOf('/'));
  }
  return base + '/' + rel;
}

function bufToBase64(buf) {
  if (typeof buf === 'string') throw new Error('readFile returned text, not bytes');
  var bytes = new Uint8Array(buf);
  var bin = '';
  var chunk = 0x8000;
  for (var i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

// Devuelve una URL data: (igual que las salidas del notebook, que sí se ven bien)
function loadLocalImage(uri) {
  if (!imgCache[uri]) {
    var timeout = new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error('timed out (8 s) reading the file')); }, 8000);
    });
    var read = Promise.resolve().then(function () {
      return fsRef(uri).readFile();
    }).then(function (buf) {
      var ext = uri.split('.').pop().toLowerCase();
      var mime = IMG_MIME[ext] || 'application/octet-stream';
      return 'data:' + mime + ';base64,' + bufToBase64(buf);
    });
    imgCache[uri] = Promise.race([read, timeout]).catch(function (err) {
      delete imgCache[uri];
      throw err;
    });
  }
  return imgCache[uri];
}

function showImgProblem(img, text) {
  var ph = document.createElement('span');
  ph.className = 'ipynb-img-missing';
  ph.textContent = text;
  if (img.parentNode) img.parentNode.replaceChild(ph, img);
}

function describeUri(uri) {
  var shown = uri.replace(/^.*::/, '');
  try { shown = decodeURIComponent(shown); } catch (e) { /* se deja tal cual */ }
  return shown;
}

function resolveImgSrcs(container, notebookUri) {
  try {
    if (!fsRef) throw new Error('fs not available');
    var baseDir = notebookUri.substring(0, notebookUri.lastIndexOf('/') + 1);
    container.querySelectorAll('img').forEach(function (img) {
      var src = img.getAttribute('src');
      // Solo rutas relativas: se ignoran http(s), data:, blob: y las que empiezan con /
      if (!src || /^(https?:|data:|blob:|\/)/i.test(src)) return;
      var fullUri = joinUri(baseDir, src);
      loadLocalImage(fullUri).then(function (dataUrl) {
        img.onerror = function () {
          showImgProblem(img, '⚠ Read ' + describeUri(fullUri) + ' but it is not a valid image');
        };
        img.src = dataUrl;
      }).catch(function (err) {
        console.warn('[ipynb-viewer] Could not load image:', fullUri, err);
        showImgProblem(img, '⚠ Could not read: ' + describeUri(fullUri) +
          ' (' + (err && err.message ? err.message : err) + ')');
      });
    });
  } catch (e) {
    console.warn('[ipynb-viewer] resolveImgSrcs failed:', e);
    var first = container.querySelector('img');
    if (first) showImgProblem(first, '⚠ Internal error resolving images: ' + (e && e.message ? e.message : e));
  }
}

function renderLatex(el) {
  if (!window.renderMathInElement) return;
  try {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  } catch (e) {
    console.warn('[katex]', e);
  }
}

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────

function cleanAnsi(str) {
  if (!str) return '';
  return String(str)
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');
}

function normalizeText(value) {
  if (Array.isArray(value)) return value.join('');
  if (value === null || value === undefined) return '';
  return String(value);
}

function cleanBase64(value) {
  return normalizeText(value).replace(/\s/g, '');
}

function createImageOutput(data, mimeType) {
  var container = document.createElement('div');
  container.className = 'ipynb-output-image';
  var base64 = cleanBase64(data);
  if (!base64) return null;
  var img = document.createElement('img');
  img.alt = 'Notebook image output';
  img.src = 'data:' + mimeType + ';base64,' + base64;
  img.onerror = function () {
    container.innerHTML = '';
    var error = document.createElement('div');
    error.style.color = '#b91c1c';
    error.style.padding = '10px';
    error.textContent = 'Could not display the image (' + mimeType + ')';
    container.appendChild(error);
  };
  container.appendChild(img);
  return container;
}

// ─────────────────────────────────────────────────────────────
// OUTPUTS
// ─────────────────────────────────────────────────────────────

function renderOutput(output) {
  if (!output) return null;

  if (output.data && output.data['image/png'])
    return createImageOutput(output.data['image/png'], 'image/png');

  if (output.data && output.data['image/jpeg'])
    return createImageOutput(output.data['image/jpeg'], 'image/jpeg');

  if (output.data && output.data['image/svg+xml']) {
    // Como <img data:…>: dentro de un <img> el SVG no puede ejecutar scripts ni cargar nada
    try {
      var svgText = normalizeText(output.data['image/svg+xml']);
      var svgOut = createImageOutput(btoa(unescape(encodeURIComponent(svgText))), 'image/svg+xml');
      if (svgOut) return svgOut;
    } catch (e) {
      console.warn('[ipynb-viewer] Invalid SVG:', e);
    }
  }

  if (output.data && output.data['text/html']) {
    var htmlContainer = document.createElement('div');
    htmlContainer.className = 'ipynb-output-html';
    setSafeHtml(htmlContainer, normalizeText(output.data['text/html']));
    return htmlContainer;
  }

  if (output.data && output.data['text/plain']) {
    var textEl = document.createElement('pre');
    textEl.className = 'ipynb-output-item';
    textEl.textContent = cleanAnsi(normalizeText(output.data['text/plain']));
    return textEl;
  }

  if (output.output_type === 'stream') {
    var streamEl = document.createElement('pre');
    streamEl.className = 'ipynb-output-item';
    if (output.name === 'stderr') streamEl.classList.add('ipynb-output-error');
    streamEl.textContent = cleanAnsi(normalizeText(output.text));
    return streamEl;
  }

  if (output.output_type === 'error') {
    var errorEl = document.createElement('pre');
    errorEl.className = 'ipynb-output-item ipynb-output-error';
    errorEl.textContent = output.traceback
      ? cleanAnsi(normalizeText(output.traceback))
      : (output.ename || 'Error') + ': ' + (output.evalue || '');
    return errorEl;
  }

  if (output.text) {
    var genericEl = document.createElement('pre');
    genericEl.className = 'ipynb-output-item';
    genericEl.textContent = cleanAnsi(normalizeText(output.text));
    return genericEl;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────
// RENDERIZAR CELDA EN VISTA
// ─────────────────────────────────────────────────────────────

function renderCellView(cell, cellIndex, uri) {
  var source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');

  if (cell.cell_type === 'markdown') {
    var md = document.createElement('div');
    md.className = 'ipynb-md ipynb-view';
    if (window.marked) {
      try {
        var latexBlocks = [];
        var src = source
          .replace(/\$\$([\s\S]+?)\$\$/g, function(m) {
            var ph = 'LTXB' + latexBlocks.length + 'LTXE';
            latexBlocks.push({ ph: ph, val: m });
            return ph;
          })
          .replace(/\$([^\$\n]+?)\$/g, function(m) {
            var ph = 'LTXI' + latexBlocks.length + 'LTXE';
            latexBlocks.push({ ph: ph, val: m });
            return ph;
          });
        var html = window.marked.parse(src, { breaks: true });
        latexBlocks.forEach(function(t) {
          // Escapado: el LaTeX puede contener < > & y no debe interpretarse como HTML
          html = html.split(t.ph).join(escapeHtml(t.val));
        });
        setSafeHtml(md, html, source);
      } catch (e) { md.textContent = source; }
    } else {
      md.textContent = source;
    }
    setTimeout(function () { renderLatex(md); if (uri) resolveImgSrcs(md, uri); }, 200);
    return md;
  }

  var wrap = document.createElement('div');
  wrap.className = 'ipynb-view';

  if (cell.cell_type === 'code') {
    var badgeWrap = document.createElement('div');
    badgeWrap.style.display = 'flex';
    badgeWrap.style.alignItems = 'center';
    badgeWrap.style.gap = '6px';
    var badge = document.createElement('span');
    badge.className = 'ipynb-badge';
    badge.textContent = 'code';
    badgeWrap.appendChild(badge);
    if (cellIndex !== undefined && cellIndex >= 0) {
      var numEl = document.createElement('span');
      numEl.className = 'ipynb-cell-num';
      numEl.textContent = 'In [' + (cellIndex + 1) + ']';
      badgeWrap.appendChild(numEl);
    }
    wrap.appendChild(badgeWrap);
  }

  var sourceWrap = document.createElement('div');
  sourceWrap.className = 'ipynb-source-wrap';
  var copyBtn = document.createElement('button');
  copyBtn.className = 'ipynb-copy-btn';
  copyBtn.textContent = '⎘ Copy';
  copyBtn.onclick = function() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(source).then(function() {
        copyBtn.textContent = '✓ Copied';
        setTimeout(function() { copyBtn.textContent = '⎘ Copy'; }, 1500);
      });
    }
  };
  var pre = document.createElement('pre');
  pre.className = 'ipynb-source';
  var code = document.createElement('code');
  code.className = 'language-python';
  code.textContent = source;
  if (window.hljs) {
    try { window.hljs.highlightElement(code); }
    catch (e) { console.warn('[ipynb-viewer] Highlight error:', e); }
  }
  pre.appendChild(code);
  sourceWrap.appendChild(copyBtn);
  sourceWrap.appendChild(pre);
  wrap.appendChild(sourceWrap);

  if (cell.cell_type === 'code' && cell.outputs && cell.outputs.length > 0) {
    var outputBox = document.createElement('div');
    outputBox.className = 'ipynb-outputs';
    cell.outputs.forEach(function (output) {
      var outputElement = renderOutput(output);
      if (outputElement) outputBox.appendChild(outputElement);
    });
    if (outputBox.children.length > 0) wrap.appendChild(outputBox);
  }

  return wrap;
}

// ─────────────────────────────────────────────────────────────
// CONSTRUIR CELDA EDITABLE
// ─────────────────────────────────────────────────────────────

function buildCell(cell, notebook, cellsEl) {
  var source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');

  var wrapper = document.createElement('div');
  wrapper.className = 'ipynb-cell ipynb-cell--' + cell.cell_type;

  var header = document.createElement('div');
  header.className = 'ipynb-cell-header';

  var typeBtn = document.createElement('button');
  typeBtn.className = 'ipynb-btn ipynb-btn-type';
  typeBtn.textContent = cell.cell_type === 'code' ? '→ md' : '→ code';

  var delBtn = document.createElement('button');
  delBtn.className = 'ipynb-btn ipynb-btn-del';
  delBtn.textContent = 'Delete';

  var insCodeBtn = document.createElement('button');
  insCodeBtn.className = 'ipynb-btn-ins-code';
  insCodeBtn.textContent = '+Code';

  var insMdBtn = document.createElement('button');
  insMdBtn.className = 'ipynb-btn-ins-md';
  insMdBtn.textContent = '+MD';

  header.appendChild(typeBtn);
  header.appendChild(delBtn);
  header.appendChild(insCodeBtn);
  header.appendChild(insMdBtn);
  wrapper.appendChild(header);

  var cellIdx = notebook ? notebook.cells.indexOf(cell) : -1;
  var viewEl = renderCellView(cell, cellIdx, cellsEl && cellsEl.dataset ? cellsEl.dataset.uri : '');
  wrapper.appendChild(viewEl);

  var editor = document.createElement('textarea');
  editor.className = 'ipynb-editor';
  editor.value = source;

  function resizeEditor() {
    editor.style.height = 'auto';
    editor.style.height = editor.scrollHeight + 'px';
  }
  editor.addEventListener('input', resizeEditor);
  editor.addEventListener('focus', resizeEditor);
  setTimeout(resizeEditor, 200);
  wrapper.appendChild(editor);

  typeBtn.onclick = function () {
    cell.source = editor.value;
    cell.cell_type = cell.cell_type === 'code' ? 'markdown' : 'code';
    if (cell.cell_type === 'code') cell.outputs = [];
    cellsEl.replaceChild(buildCell(cell, notebook, cellsEl), wrapper);
  };

  delBtn.onclick = function () {
    var idx = notebook.cells.indexOf(cell);
    if (idx > -1) notebook.cells.splice(idx, 1);
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  };

  insCodeBtn.onclick = function () {
    var newCell = { cell_type: 'code', source: '', outputs: [], metadata: {} };
    var idx = notebook.cells.indexOf(cell);
    notebook.cells.splice(idx + 1, 0, newCell);
    var newWrapper = buildCell(newCell, notebook, cellsEl);
    if (wrapper.nextSibling) cellsEl.insertBefore(newWrapper, wrapper.nextSibling);
    else cellsEl.appendChild(newWrapper);
    setTimeout(function () {
      var ed = newWrapper.querySelector('.ipynb-editor');
      if (ed) ed.focus();
    }, 100);
  };

  insMdBtn.onclick = function () {
    var newCell = { cell_type: 'markdown', source: '', metadata: {} };
    var idx = notebook.cells.indexOf(cell);
    notebook.cells.splice(idx + 1, 0, newCell);
    var newWrapper = buildCell(newCell, notebook, cellsEl);
    if (wrapper.nextSibling) cellsEl.insertBefore(newWrapper, wrapper.nextSibling);
    else cellsEl.appendChild(newWrapper);
    setTimeout(function () {
      var ed = newWrapper.querySelector('.ipynb-editor');
      if (ed) ed.focus();
    }, 100);
  };

  return wrapper;
}

// ─────────────────────────────────────────────────────────────
// PLUGIN
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// ENLACES Y NAVEGACIÓN ENTRE ARCHIVOS
// ─────────────────────────────────────────────────────────────

var openNotebookRef = null;

function toastMsg(msg, ms) {
  try {
    var t = acode.require('toast');
    if (t) { t(msg, ms || 3000); return; }
  } catch (e) { /* cae al log */ }
  console.log('[ipynb-viewer]', msg);
}

function fileNameFromUri(uri) {
  var last = uri.substring(uri.lastIndexOf('/') + 1);
  try { return decodeURIComponent(last); } catch (e) { return last; }
}

// Abre un archivo del proyecto en una pestaña: .ipynb con este visor, el resto como texto.
async function openProjectFile(uri) {
  var name = fileNameFromUri(uri);
  var em = window.editorManager;
  var existing = em && typeof em.getFile === 'function' ? em.getFile(uri, 'uri') : null;
  if (existing) { existing.makeActive(); return; }

  if (/\.ipynb$/i.test(name)) {
    if (!openNotebookRef) throw new Error('the viewer is not started yet');
    await openNotebookRef({ name: name, uri: uri });
    return;
  }
  if (/\.(png|jpe?g|gif|webp|bmp|pdf|zip|gz|tar|mp3|mp4)$/i.test(name)) {
    throw new Error('file type not supported by the viewer');
  }
  var text = await fsRef(uri).readFile('utf-8');
  var EditorFile = acode.require('editorFile');
  new EditorFile(name, { uri: uri, text: text, render: true });
}

function onLinkClick(e, notebookUri) {
  var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
  if (!a) return;
  // Siempre se cancela la navegación: si no, el WebView de Acode sale de la app (ERR_CONNECTION_REFUSED)
  e.preventDefault();
  e.stopPropagation();

  var href = a.getAttribute('href') || '';
  if (!href || href.charAt(0) === '#') return;

  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    try {
      if (window.system && typeof window.system.openInBrowser === 'function') window.system.openInBrowser(href);
      else window.open(href, '_system');
    } catch (err) {
      toastMsg('Could not open the link');
    }
    return;
  }
  if (href.charAt(0) === '/' || /^[a-z][a-z0-9+.-]*:/i.test(href)) {
    toastMsg('Unsupported link: ' + href, 4000);
    return;
  }

  var baseDir = notebookUri.substring(0, notebookUri.lastIndexOf('/') + 1);
  var target = joinUri(baseDir, href);
  openProjectFile(target).catch(function (err) {
    console.warn('[ipynb-viewer] Could not open link:', target, err);
    toastMsg('Could not open ' + describeUri(target) + ': ' + (err && err.message ? err.message : err), 5000);
  });
}

const plugin = {
  async init(baseUrl) {
    PLUGIN_BASE = normalizeBase(baseUrl);
    var oldStyle = document.getElementById(PLUGIN_ID + '-styles');
    if (oldStyle) oldStyle.remove();
    var styleEl = document.createElement('style');
    styleEl.id = PLUGIN_ID + '-styles';
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);

    var fileHandler = {
      extensions: ['ipynb'],
      handleFile: async function (fileInfo) {
        var page = acode.require('page');
        var fs = acode.require('fs');
        fsRef = fs;
        var actionStack = acode.require('actionStack');

        await loadMarked();
        await loadHighlight();
        await loadKatex();
        await loadPurify();

        var EditorFile = acode.require('editorFile');

        var notebook;

        var toolbar = document.createElement('div');
        toolbar.className = 'ipynb-toolbar';
        var toolbarTitle = document.createElement('span');
        toolbarTitle.className = 'ipynb-toolbar-title';
        toolbarTitle.textContent = viewTitle();
        var editBtn = document.createElement('button');
        editBtn.className = 'ipynb-btn ipynb-btn-edit';
        editBtn.textContent = '✏ Edit';
        var doneBtn = document.createElement('button');
        doneBtn.className = 'ipynb-btn ipynb-btn-done';
        doneBtn.textContent = '✓ Done';
        doneBtn.style.display = 'none';
        var saveBtn = document.createElement('button');
        saveBtn.className = 'ipynb-btn ipynb-btn-save';
        saveBtn.textContent = 'Save';
        saveBtn.style.display = 'none';
        var addCodeBtn = document.createElement('button');
        addCodeBtn.className = 'ipynb-btn ipynb-btn-add';
        addCodeBtn.textContent = '+ Code';
        addCodeBtn.style.display = 'none';
        var addMdBtn = document.createElement('button');
        addMdBtn.className = 'ipynb-btn ipynb-btn-add';
        addMdBtn.textContent = '+ MD';
        addMdBtn.style.display = 'none';
        var status = document.createElement('span');
        status.className = 'ipynb-status';

        toolbar.appendChild(toolbarTitle);
        toolbar.appendChild(editBtn);
        toolbar.appendChild(doneBtn);
        toolbar.appendChild(saveBtn);
        toolbar.appendChild(addCodeBtn);
        toolbar.appendChild(addMdBtn);
        toolbar.appendChild(status);

        var cellsEl = document.createElement('div');
        cellsEl.className = 'ipynb-cells';
        cellsEl.dataset.uri = fileInfo.uri;
        var container = document.createElement('div');
        container.className = 'ipynb-page';
        container.appendChild(cellsEl);
        applyTheme(container);
        watchTheme(container);

        container.insertBefore(toolbar, cellsEl);
        container.addEventListener('click', function (e) { onLinkClick(e, fileInfo.uri); });

        function enterEdit() {
          cellsEl.classList.add('edit-mode');
          toolbarTitle.textContent = 'Edit mode';
          editBtn.style.display = 'none';
          doneBtn.style.display = '';
          saveBtn.style.display = '';
          addCodeBtn.style.display = '';
          addMdBtn.style.display = '';
          setTimeout(function () {
            cellsEl.querySelectorAll('.ipynb-editor').forEach(function (ed) {
              ed.style.height = 'auto';
              ed.style.height = ed.scrollHeight + 'px';
            });
          }, 100);
        }

        function exitEdit() {
          notebook.cells.forEach(function (cell, i) {
            var w = cellsEl.querySelectorAll('.ipynb-cell')[i];
            if (w) {
              var ed = w.querySelector('.ipynb-editor');
              if (ed) cell.source = ed.value;
            }
          });
          cellsEl.innerHTML = '';
          cellsEl.classList.remove('edit-mode');
          notebook.cells.forEach(function (cell) {
            cellsEl.appendChild(buildCell(cell, notebook, cellsEl));
          });
          toolbarTitle.textContent = viewTitle();
          editBtn.style.display = '';
          doneBtn.style.display = 'none';
          saveBtn.style.display = 'none';
          addCodeBtn.style.display = 'none';
          addMdBtn.style.display = 'none';
        }

        editBtn.onclick = enterEdit;
        doneBtn.onclick = exitEdit;

        saveBtn.onclick = async function () {
          notebook.cells.forEach(function (cell, i) {
            var w = cellsEl.querySelectorAll('.ipynb-cell')[i];
            if (w) {
              var ed = w.querySelector('.ipynb-editor');
              if (ed) cell.source = ed.value;
            }
          });
          if (saveBtn.disabled) return;
          saveBtn.disabled = true;
          status.style.color = '';
          status.textContent = 'Saving…';
          try {
            // indent 1 + salto final: mismo formato que escribe Jupyter (menos cambios en git)
            await fs(fileInfo.uri).writeFile(JSON.stringify(notebook, null, 1) + '\n');
            status.textContent = '✓ Saved';
            setTimeout(function () { status.textContent = ''; }, 2000);
          } catch (e) {
            console.error('[ipynb-viewer] Error saving:', e);
            status.style.color = 'var(--nb-err)';
            status.textContent = '✗ Save failed';
            toastMsg('Could not save: ' + (e && e.message ? e.message : e), 4000);
          } finally {
            saveBtn.disabled = false;
          }
        };

        addCodeBtn.onclick = function () {
          var newCell = { cell_type: 'code', source: '', outputs: [], metadata: {} };
          notebook.cells.push(newCell);
          cellsEl.appendChild(buildCell(newCell, notebook, cellsEl));
        };

        addMdBtn.onclick = function () {
          var newCell = { cell_type: 'markdown', source: '', metadata: {} };
          notebook.cells.push(newCell);
          cellsEl.appendChild(buildCell(newCell, notebook, cellsEl));
        };

        try {
          var text = await fs(fileInfo.uri).readFile('utf-8');
          notebook = JSON.parse(text);
          notebook.cells = notebook.cells || [];
          if (notebook.cells.length === 0) {
            var empty = document.createElement('p');
            empty.className = 'ipynb-empty';
            empty.textContent = 'Empty notebook. Tap Edit to add cells.';
            cellsEl.appendChild(empty);
          } else {
            notebook.cells.forEach(function (cell) {
              cellsEl.appendChild(buildCell(cell, notebook, cellsEl));
            });
          }
        } catch (err) {
          console.error('[ipynb-viewer] Error:', err);
          var errEl = document.createElement('p');
          errEl.className = 'ipynb-empty';
          errEl.textContent = 'Error: ' + err.message;
          cellsEl.appendChild(errEl);
        }

        // Crear tab custom con el contenido
        var customFile = new EditorFile(fileInfo.name || 'notebook.ipynb', {
          type: 'custom',
          content: container,
          uri: fileInfo.uri,
          hideQuickTools: true,
          render: true,
          stylesheets: [
            STYLES,
            KATEX_CSS_INLINE || KATEX_CSS,
            HLJS_CSS_INLINE || '/* sin resaltado */',
          ],
          tabIcon: 'file file_type_default',
        });
      }
    };
    acode.registerFileHandler(PLUGIN_ID, fileHandler);
    openNotebookRef = fileHandler.handleFile;
  },

  destroy() {
    acode.unregisterFileHandler(PLUGIN_ID);
    var styleEl = document.getElementById(PLUGIN_ID + '-styles');
    if (styleEl) styleEl.remove();
  }
};

// ─────────────────────────────────────────────────────────────
// REGISTRO EN ACODE
// ─────────────────────────────────────────────────────────────

if (window.acode) {
  acode.setPluginInit(PLUGIN_ID, function (baseUrl, page, options) {
    plugin.init(baseUrl);
  });
  acode.setPluginUnmount(PLUGIN_ID, function () {
    plugin.destroy();
  });
}
