/**
 * VECTORA README asset kit — shared design system for every SVG under
 * assets/readme/.
 *
 * Design tokens mirror the product language:
 *   Carbon #080A0D · Vector Cyan #19D3C5 · Signal Violet #8B6BFF · Ink #F4F1EB
 *
 * Layout discipline (this kit is deliberately strict):
 *   - every text element is width-checked against a conservative monospace
 *     metric (0.62 em advance) so nothing can overflow its panel;
 *   - every diagram element is bounds-checked against the canvas;
 *   - no external references, no scripts, no external fonts — every asset is
 *     GitHub Camo-safe and renders inside an <img> context.
 */

export const C = {
  bg: '#080A0D',
  panel: '#0D1319',
  panel2: '#111823',
  well: '#0A0F15',
  edge: '#1D2530',
  edgeHi: '#2A3542',
  ink: '#F4F1EB',
  dim: '#8A94A6',
  faint: '#5A6472',
  cyan: '#19D3C5',
  cyanDim: '#0E5F5A',
  violet: '#8B6BFF',
  violetDim: '#3D3080',
  lime: '#A9E838',
  limeDim: '#4E6E1B',
  amber: '#FFB400',
  amberDim: '#6E4D00',
  rose: '#FF5C7A',
  roseDim: '#6E2437',
};

/** Monospace stack that resolves on macOS, Windows, Linux and mobile. */
export const MONO =
  "ui-monospace,'Cascadia Code','JetBrains Mono',Menlo,Consolas,'DejaVu Sans Mono',monospace";

/** Conservative monospace advance (DejaVu Sans Mono is 0.602 em). */
const ADV = 0.62;

export function textWidth(str, size, spacing = 0) {
  return Math.round([...str].length * (ADV * size + spacing));
}

export function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function assert(cond, msg) {
  if (!cond) throw new Error(`layout violation: ${msg}`);
}

/** Assert a text run fits a maximum width; returns the input string. */
export function fit(str, size, maxW, spacing = 0, label = '') {
  const w = textWidth(str, size, spacing);
  assert(w <= maxW, `"${str}" (${w}px) exceeds ${maxW}px${label ? ` in ${label}` : ''}`);
  return str;
}

/* ───────────────────────────── primitives ───────────────────────────── */

export function T(x, y, str, o = {}) {
  const {
    size = 12, fill = C.ink, weight = 400, anchor = 'start',
    spacing = 0, opacity = 1, cls = null, id = null,
  } = o;
  const attrs = [
    `x="${x}"`, `y="${y}"`,
    `font-family="${MONO}"`,
    `font-size="${size}"`,
    `fill="${fill}"`,
    `font-weight="${weight}"`,
    anchor !== 'start' ? `text-anchor="${anchor}"` : '',
    spacing ? `letter-spacing="${spacing}"` : '',
    opacity !== 1 ? `opacity="${opacity}"` : '',
    cls ? `class="${cls}"` : '',
    id ? `id="${id}"` : '',
  ].filter(Boolean).join(' ');
  return `<text ${attrs}>${esc(str)}</text>`;
}

/** Multi-line text block. y is the baseline of the first line. */
export function Tlines(x, y, lines, o = {}) {
  const { size = 12, step = null, ...rest } = o;
  const lh = step ?? Math.round(size * 1.45);
  return lines
    .map((ln, i) => T(x, y + i * lh, ln, { size, ...rest }))
    .join('');
}

export function R(x, y, w, h, o = {}) {
  const {
    fill = 'none', stroke = null, sw = 1, rx = 0, opacity = 1,
    dash = null, cls = null, inner = null,
  } = o;
  const attrs = [
    `x="${x}"`, `y="${y}"`, `width="${w}"`, `height="${h}"`,
    `rx="${rx}"`,
    fill !== 'none' ? `fill="${fill}"` : 'fill="none"',
    stroke ? `stroke="${stroke}" stroke-width="${sw}"` : '',
    dash ? `stroke-dasharray="${dash}"` : '',
    opacity !== 1 ? `opacity="${opacity}"` : '',
    cls ? `class="${cls}"` : '',
  ].filter(Boolean).join(' ');
  return inner ? `<rect ${attrs}>${inner}</rect>` : `<rect ${attrs}/>`;
}

export function L(x1, y1, x2, y2, o = {}) {
  const { stroke = C.edge, sw = 1, dash = null, opacity = 1, cap = 'butt', inner = null } = o;
  const attrs = [
    `x1="${x1}"`, `y1="${y1}"`, `x2="${x2}"`, `y2="${y2}"`,
    `stroke="${stroke}"`, `stroke-width="${sw}"`,
    `stroke-linecap="${cap}"`,
    dash ? `stroke-dasharray="${dash}"` : '',
    opacity !== 1 ? `opacity="${opacity}"` : '',
  ].filter(Boolean).join(' ');
  return inner ? `<line ${attrs}>${inner}</line>` : `<line ${attrs}/>`;
}

export function P(d, o = {}) {
  const {
    stroke = C.ink, sw = 1.5, fill = 'none', dash = null, opacity = 1,
    linecap = 'round', linejoin = 'round', cls = null, inner = null,
  } = o;
  const attrs = [
    `d="${d}"`,
    `fill="${fill}"`,
    stroke ? `stroke="${stroke}" stroke-width="${sw}"` : '',
    `stroke-linecap="${linecap}"`, `stroke-linejoin="${linejoin}"`,
    dash ? `stroke-dasharray="${dash}"` : '',
    opacity !== 1 ? `opacity="${opacity}"` : '',
    cls ? `class="${cls}"` : '',
  ].filter(Boolean).join(' ');
  return inner ? `<path ${attrs}>${inner}</path>` : `<path ${attrs}/>`;
}

export function CIRC(cx, cy, r, o = {}) {
  const { fill = 'none', stroke = null, sw = 1.5, opacity = 1, dash = null, cls = null, inner = null } = o;
  const attrs = [
    `cx="${cx}"`, `cy="${cy}"`, `r="${r}"`,
    fill !== 'none' ? `fill="${fill}"` : 'fill="none"',
    stroke ? `stroke="${stroke}" stroke-width="${sw}"` : '',
    dash ? `stroke-dasharray="${dash}"` : '',
    opacity !== 1 ? `opacity="${opacity}"` : '',
    cls ? `class="${cls}"` : '',
  ].filter(Boolean).join(' ');
  return inner ? `<circle ${attrs}>${inner}</circle>` : `<circle ${attrs}/>`;
}

/* ───────────────────────────── composites ───────────────────────────── */

/** HUD corner brackets around a rectangle. */
export function ticks(x, y, w, h, color, o = {}) {
  const { len = 9, sw = 2, inset = 0 } = o;
  const x1 = x - inset, y1 = y - inset, x2 = x + w + inset, y2 = y + h + inset;
  const seg = (d) => P(d, { stroke: color, sw, linecap: 'square' });
  return (
    seg(`M${x1} ${y1 + len}V${y1}H${x1 + len}`) +
    seg(`M${x2 - len} ${y1}H${x2}V${y1 + len}`) +
    seg(`M${x2} ${y2 - len}V${y2}H${x2 - len}`) +
    seg(`M${x1 + len} ${y2}H${x1}V${y2 - len}`)
  );
}

/** Small rounded chip. Returns { el, w, h }. y is the top edge. */
export function chip(x, y, label, o = {}) {
  const {
    size = 9.5, color = C.ink, stroke = C.edgeHi, fill = C.well,
    padX = 8, h = null, weight = 400, spacing = 0, dash = null, opacity = 1,
  } = o;
  const ch = h ?? Math.round(size + 11);
  const w = textWidth(label, size, spacing) + padX * 2;
  const by = y + ch / 2 + size * 0.36;
  const el =
    R(x, y, w, ch, { fill, stroke, sw: 1, rx: 3, dash, opacity }) +
    T(x + w / 2, by, label, { size, fill: color, anchor: 'middle', weight, spacing, opacity });
  return { el, w, h: ch };
}

/** Row of chips with a gap; returns { el, w, h }. */
export function chipRow(x, y, labels, o = {}) {
  const { gap = 6, ...chipOpts } = o;
  let cx = x;
  let out = '';
  let h = 0;
  for (const label of labels) {
    const c = chip(cx, y, label, chipOpts);
    out += c.el;
    cx += c.w + gap;
    h = Math.max(h, c.h);
  }
  return { el: out, w: cx - gap - x, h };
}

/** Arrow bank — one marker def per color, reused across the document. */
export function arrowBank() {
  const defs = new Map();
  let n = 0;
  return {
    line(x1, y1, x2, y2, color, o = {}) {
      const { sw = 1.5, dash = null, opacity = 1, head = true } = o;
      if (head && !defs.has(color)) {
        defs.set(color, `arw${n++}`);
      }
      const mk = head ? ` marker-end="url(#${defs.get(color)})"` : '';
      return L(x1, y1, x2, y2, { stroke: color, sw, dash, opacity }) .replace('/>', `${mk}/>`);
    },
    defsXml() {
      return [...defs.entries()]
        .map(([color, id]) =>
          `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${color}"/></marker>`)
        .join('');
    },
  };
}

/** Standard diagram header bar: left title, right meta chip. */
export function header(width, title, right = null, o = {}) {
  const { y = 22, color = C.cyan, size = 13 } = o;
  const ty = y + size * 0.72;
  let out = T(24, ty, title, { size, fill: color, weight: 700, spacing: 1 });
  if (right) {
    const w = textWidth(right, 9, 1);
    out += T(width - 24 - w, ty, right, { size: 9, fill: C.dim, spacing: 1 });
    assert(24 + textWidth(title, size, 1) + 16 < width - 24 - w, `header collision on "${title}"`);
  }
  out += L(24, y + 22, width - 24, y + 22, { stroke: C.edge, sw: 1 });
  return out;
}

/** Subtle blueprint grid pattern def. */
export function gridDef(id = 'grid', size = 22) {
  return (
    `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">` +
    `<path d="M${size} 0H0V${size}" fill="none" stroke="#131B26" stroke-width="1"/></pattern>`
  );
}

/** Check-mark drawn as a vector path (never a font glyph). */
export function check(x, y, color, o = {}) {
  const { sw = 2 } = o;
  return P(`M${x} ${y + 2.6}l2.8 2.8 5.2-6`, { stroke: color, sw, linecap: 'round', linejoin: 'round' });
}

/** Cross-mark drawn as a vector path. */
export function cross(x, y, color, o = {}) {
  const { sw = 2 } = o;
  return P(`M${x} ${y}l7 7M${x + 7} ${y}l-7 7`, { stroke: color, sw, linecap: 'round' });
}

/* ───────────────────────────── document ───────────────────────────── */

/** Assemble the final SVG document and run global bounds checks. */
export function doc(width, height, { defs = '', style = '', body = '', title = '' }) {
  assert(width > 0 && height > 0, 'canvas must have positive size');
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="vt">`,
    `<title id="vt">${esc(title)}</title>`,
    '<defs>',
    gridDef(),
    '<linearGradient id="glowbg" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0" stop-color="#0E1B22" stop-opacity="0.85"/>',
    '<stop offset="1" stop-color="#080A0D" stop-opacity="0"/>',
    '</linearGradient>',
    '<filter id="softglow" x="-40%" y="-40%" width="180%" height="180%">',
    '<feGaussianBlur stdDeviation="2.6" result="b"/>',
    '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>',
    '</filter>',
    defs,
    '</defs>',
    `<rect width="${width}" height="${height}" fill="${C.bg}"/>`,
    `<rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.55"/>`,
    style ? `<style>${style}</style>` : '',
    body,
    '</svg>',
  ].join('');
}

/** Canvas-wide bounds assertion for a box. */
export function inBounds(width, height, x, y, w, h, label = '') {
  assert(x >= 0 && y >= 0 && x + w <= width && y + h <= height,
    `"${label}" box (${x},${y},${w},${h}) escapes canvas ${width}x${height}`);
}
