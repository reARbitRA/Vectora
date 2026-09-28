/**
 * VECTORA README assets — production flow diagrams.
 * Builders return { name, svg } — pure functions, deterministic output.
 */

import {
  C, T, Tlines, R, L, P, CIRC, ticks, chip, chipRow, arrowBank,
  header, doc, fit, textWidth, inBounds, check, assert,
} from './kit.mjs';

const W = 948;

/* ═════════════════════════ 6 · vectorization matrix ═════════════════════════ */

const FAM = {
  contour: { color: C.cyan, label: 'CONTOUR & LINE ART' },
  color: { color: C.violet, label: 'COLOR & LOW-POLY' },
  pattern: { color: C.amber, label: 'PATTERN & ENGRAVING' },
  lab: { color: C.rose, label: 'EXPERIMENTAL & 3D' },
};

const ENGINES = [
  { n: '01', name: ['Centerline', 'Skeletonization'], tag: 'Otsu · Zhang-Suen · Beziers', fam: 'contour', best: 'signatures · line art' },
  { n: '02', name: ['Region Outline', '(Potrace)'], tag: 'Moore-neighbor boundary', fam: 'contour', best: 'logos · silhouettes' },
  { n: '03', name: ['Topographic', 'Contours'], tag: '16-case iso-luminance', fam: 'contour', best: 'maps · waves' },
  { n: '04', name: ['Marching Squares', 'Isolines'], tag: 'multi-level scalar field', fam: 'contour', best: 'data-viz · terrain' },
  { n: '05', name: ['Canny Edge', 'Blueprint'], tag: 'Sobel + hysteresis links', fam: 'contour', best: 'HUDs · schematics' },
  { n: '06', name: ['Cross-Hatch', 'Etching'], tag: '4-angle intaglio layers', fam: 'contour', best: 'engraving · sketches' },
  { n: '07', name: ['Single-Stroke', 'TSP Art'], tag: 'one unbroken tour', fam: 'contour', best: 'plotters · CNC' },
  { n: '08', name: ['Sobel Gradient', 'Field'], tag: 'directional micro-strokes', fam: 'contour', best: 'etched textures' },
  { n: '09', name: ['Color-Quantized', 'Layers'], tag: 'k-means posterization', fam: 'color', best: 'posters · cartoons' },
  { n: '10', name: ['Delaunay', 'Low-Poly Mesh'], tag: 'Bowyer-Watson triangles', fam: 'color', best: 'portraits · abstract' },
  { n: '11', name: ['Halftone', 'Dot Matrix'], tag: 'tonal radius grid', fam: 'pattern', best: 'newsprint · pop art' },
  { n: '12', name: ['Voronoi', 'Stippling'], tag: 'Lloyd-relaxed dots', fam: 'pattern', best: 'engraved portraits' },
  { n: '13', name: ['Isometric', 'Voxel 3D'], tag: '2.5D shaded cubes', fam: 'lab', best: 'pixel dioramas' },
  { n: '14', name: ['ASCII Vector', 'Typography'], tag: 'glyph density grid', fam: 'lab', best: 'terminal aesthetics' },
];

/** 40x40 mini-glyph per engine, stroked in its family color. */
function engineGlyph(gx, gy, idx, color) {
  const g = [];
  const push = (d, o = {}) => g.push(P(d, { stroke: color, sw: 1.4, ...o }));
  switch (idx) {
    case 0: // centerline skeleton
      push(`M${gx + 20} ${gy + 2}V${gy + 14}`);
      push(`M${gx + 20} ${gy + 14}L${gx + 7} ${gy + 32}`);
      push(`M${gx + 20} ${gy + 14}L${gx + 33} ${gy + 30}`);
      push(`M${gx + 20} ${gy + 14}V${gy + 38}`);
      break;
    case 1: // region blob
      push(`M${gx + 9} ${gy + 20}C${gx + 9} ${gy + 6},${gx + 31} ${gy + 6},${gx + 31} ${gy + 20}C${gx + 31} ${gy + 34},${gx + 9} ${gy + 34},${gx + 9} ${gy + 20}Z`);
      break;
    case 2: // contour lines
      push(`M${gx + 2} ${gy + 12}C${gx + 12} ${gy + 4},${gx + 28} ${gy + 20},${gx + 38} ${gy + 12}`);
      push(`M${gx + 2} ${gy + 22}C${gx + 12} ${gy + 14},${gx + 28} ${gy + 30},${gx + 38} ${gy + 22}`);
      push(`M${gx + 2} ${gy + 32}C${gx + 12} ${gy + 24},${gx + 28} ${gy + 40},${gx + 38} ${gy + 32}`);
      break;
    case 3: // marching squares steps
      push(`M${gx + 4} ${gy + 34}H${gx + 14}V${gy + 22}H${gx + 26}V${gy + 10}H${gx + 38}`);
      push(`M${gx + 4} ${gy + 22}H${gy + 10}`);
      push(`M${gx + 14} ${gy + 34}V${gy + 40}`, {});
      break;
    case 4: // canny wireframe
      push(`M${gx + 6} ${gy + 30}L${gx + 20} ${gy + 6}L${gx + 34} ${gy + 30}Z`);
      push(`M${gx + 13} ${gy + 18}H${gx + 27}`);
      break;
    case 5: // cross-hatch
      for (let i = 0; i < 4; i++) {
        push(`M${gx + 3 + i * 10} ${gy + 4}L${gx + 11 + i * 10} ${gy + 12}`);
        push(`M${gx + 11 + i * 10} ${gy + 4}L${gx + 3 + i * 10} ${gy + 12}`);
        push(`M${gx + 3 + i * 10} ${gy + 24}L${gx + 11 + i * 10} ${gy + 32}`);
        push(`M${gx + 11 + i * 10} ${gy + 24}L${gx + 3 + i * 10} ${gy + 32}`);
      }
      break;
    case 6: // TSP single line
      push(`M${gx + 4} ${gy + 36}L${gx + 16} ${gy + 8}L${gx + 30} ${gy + 26}L${gx + 36} ${gy + 4}L${gx + 10} ${gy + 30}L${gx + 24} ${gy + 36}`);
      break;
    case 7: // sobel strokes
      push(`M${gx + 6} ${gy + 8}L${gx + 12} ${gy + 14}`);
      push(`M${gx + 20} ${gy + 4}V${gy + 12}`);
      push(`M${gx + 30} ${gy + 8}L${gx + 36} ${gy + 14}`);
      push(`M${gx + 6} ${gy + 26}L${gx + 14} ${gy + 30}`);
      push(`M${gx + 24} ${gy + 22}L${gx + 30} ${gy + 32}`);
      push(`M${gx + 34} ${gy + 24}L${gx + 38} ${gy + 32}`);
      break;
    case 8: // color quantize blobs
      g.push(CIRC(gx + 14, gy + 14, 9, { stroke: color, sw: 1.4 }));
      g.push(CIRC(gx + 27, gy + 18, 9, { stroke: C.cyan, sw: 1.4 }));
      g.push(CIRC(gx + 20, gy + 29, 9, { stroke: C.amber, sw: 1.4 }));
      break;
    case 9: // delaunay mesh
      push(`M${gx + 4} ${gy + 34}L${gx + 14} ${gy + 8}L${gx + 26} ${gy + 30}Z`);
      push(`M${gx + 14} ${gy + 8}L${gx + 34} ${gy + 12}L${gx + 26} ${gy + 30}`);
      push(`M${gx + 26} ${gy + 30}L${gx + 36} ${gy + 38}`);
      break;
    case 10: // halftone dots
      [[8, 8, 3], [20, 8, 5], [32, 8, 2], [8, 20, 5], [20, 20, 2.5], [32, 20, 4], [8, 32, 2], [20, 32, 4], [32, 32, 5.5]]
        .forEach(([dx, dy, r]) => g.push(CIRC(gx + dx, gy + dy, r, { fill: color, opacity: 0.85 })));
      break;
    case 11: // voronoi stipples
      [[6, 6, 1.4], [14, 10, 2], [24, 6, 1.6], [34, 12, 2.2], [8, 20, 2.4], [18, 22, 1.5],
       [30, 24, 2.6], [12, 32, 2], [24, 34, 1.7], [36, 34, 2.2], [38, 4, 1.3], [4, 30, 1.2]]
        .forEach(([dx, dy, r]) => g.push(CIRC(gx + dx, gy + dy, r, { fill: color })));
      break;
    case 12: // isometric cubes
      push(`M${gx + 4} ${gy + 22}L${gx + 14} ${gy + 16}L${gx + 24} ${gy + 22}L${gx + 24} ${gy + 34}L${gx + 14} ${gy + 40}L${gx + 4} ${gy + 34}Z`);
      push(`M${gx + 14} ${gy + 16}V${gy + 28}M${gx + 14} ${gy + 28}L${gx + 24} ${gy + 22}M${gx + 14} ${gy + 28}L${gx + 4} ${gy + 22}`);
      break;
    case 13: // ascii glyphs
      g.push(T(gx + 2, gy + 12, ':.#:', { size: 8, fill: color }));
      g.push(T(gx + 2, gy + 22, '#:·+', { size: 8, fill: color }));
      g.push(T(gx + 2, gy + 32, '·+#:', { size: 8, fill: color }));
      break;
    default:
      push(`M${gx + 4} ${gy + 4}H${gx + 36}V${gy + 36}H${gx + 4}Z`);
  }
  return g.join('');
}

export function vectorizationMatrix() {
  const H = 648;
  const cw = 168, chh = 132, gap = 12;
  const rows = [ENGINES.slice(0, 5), ENGINES.slice(5, 10), ENGINES.slice(10, 14)];
  const rowY = [96, 244, 392];

  const cards = rows.map((row, r) => {
    const rowW = row.length * cw + (row.length - 1) * gap;
    const x0 = Math.round((W - rowW) / 2);
    return row.map((e, i) => {
      const x = x0 + i * (cw + gap), y = rowY[r];
      inBounds(W, H, x, y, cw, chh, `engine card ${e.n}`);
      const fam = FAM[e.fam];
      e.name.forEach((ln) => fit(ln, 11, cw - 16, 0, `engine ${e.n} name`));
      fit(e.tag, 8.5, cw - 16, 0, `engine ${e.n} tag`);
      fit(e.best, 8, cw - 16, 0, `engine ${e.n} best`);
      return (
        R(x, y, cw, chh, { fill: C.panel, stroke: C.edge, rx: 4 }) +
        L(x, y, x + cw, y, { stroke: fam.color, sw: 2.5 }) +
        T(x + cw - 10, y + 18, e.n, { size: 9, fill: C.faint, anchor: 'end', spacing: 1 }) +
        engineGlyph(x + 12, y + 22, ENGINES.indexOf(e), fam.color) +
        T(x + 12, y + 88, e.name[0], { size: 11, fill: C.ink, weight: 700 }) +
        T(x + 12, y + 102, e.name[1], { size: 11, fill: C.ink, weight: 700 }) +
        T(x + 12, y + 118, e.tag, { size: 8.5, fill: C.dim })
      );
    }).join('');
  }).join('');

  const legend = chipRow(
    Math.round((W - (textWidth(FAM.contour.label, 9) + 18 + textWidth(FAM.color.label, 9) + 18 +
      textWidth(FAM.pattern.label, 9) + 18 + textWidth(FAM.lab.label, 9) + 18 + 3 * 10)) / 2),
    60,
    [FAM.contour.label, FAM.color.label, FAM.pattern.label, FAM.lab.label],
    { size: 9, color: C.dim, stroke: C.edge, fill: C.well },
  );

  const body =
    header(W, 'VECTORIZATION MATRIX — 14 CLIENT-SIDE ENGINES', 'src/utils/vectorization/') +
    legend.el +
    cards +
    R(30, 540, 888, 44, { fill: C.well, stroke: C.edge, rx: 4 }) +
    T(48, 559, '+ 3 experimental registry primitives — SLIC superpixels · Harris corner field · Fourier epicycles', { size: 9.5, fill: C.dim }) +
    T(48, 575, 'every engine emits semantic SVG — layer groups · palette · metadata — with 0 external dependencies', { size: 9.5, fill: C.faint }) +
    T(902, 567, '17 TECHNIQUES', { size: 9.5, fill: C.violet, anchor: 'end', weight: 700, spacing: 1 }) +
    T(48, 616, 'raster in — editable structure out. no network calls, no server round-trip, no "trace image" black box.', { size: 10, fill: C.faint, anchor: 'start' });

  fit('+ 3 experimental registry primitives — SLIC superpixels · Harris corner field · Fourier epicycles', 9.5, 700);
  return { name: 'vectorization-matrix.svg', svg: doc(W, H, { body, title: 'VECTORA vectorization matrix — 14 client-side raster-to-vector engines' }) };
}

/* ═════════════════════════ 7 · raster pipeline ═════════════════════════ */

export function rasterPipeline() {
  const H = 312;
  const ar = arrowBank();
  const stages = [
    ['RASTER', 'INPUT', 'png · jpg · webp', C.violet],
    ['DECODE', 'CANVAS', 'canvas → ImageData RGBA', C.cyan],
    ['PREPROCESS', 'PIXELS', 'luminance · threshold · quantize', C.cyan],
    ['ENGINE', 'TRANSFORM', 'one of 14 algorithms', C.amber],
    ['VECTOR', 'PRIMITIVES', 'path · polyline · polygon · circle', C.cyan],
    ['SEMANTIC', 'SVG', 'groups · palette · metadata', C.lime],
  ];
  const bw = 134, bh = 128, gap = 17;
  const x0 = Math.round((W - (6 * bw + 5 * gap)) / 2);
  const y0 = 64;

  const boxes = stages.map(([l1, l2, sub, color], i) => {
    const x = x0 + i * (bw + gap);
    inBounds(W, H, x, y0, bw, bh, `stage ${l1}`);
    const glyphX = x + bw / 2 - 16, glyphY = y0 + 14;
    let glyph = '';
    if (i === 0) { // pixel grid
      glyph = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) =>
        R(glyphX + c * 8, glyphY + r * 8, 8, 8, { fill: (r + c) % 2 ? color : C.well, stroke: C.edgeHi, sw: 0.5 }))).join('');
    } else if (i === 1) { // canvas frame
      glyph = R(glyphX, glyphY, 32, 32, { stroke: color, sw: 1.4 }) + L(glyphX, glyphY, glyphX + 32, glyphY + 32, { stroke: C.edgeHi, sw: 1 });
    } else if (i === 2) { // sliders
      glyph = L(glyphX, glyphY + 8, glyphX + 32, glyphY + 8, { stroke: C.edgeHi, sw: 1.4 }) + CIRC(glyphX + 10, glyphY + 8, 3, { fill: color }) +
        L(glyphX, glyphY + 20, glyphX + 32, glyphY + 20, { stroke: C.edgeHi, sw: 1.4 }) + CIRC(glyphX + 22, glyphY + 20, 3, { fill: color }) +
        L(glyphX, glyphY + 32, glyphX + 32, glyphY + 32, { stroke: C.edgeHi, sw: 1.4 }) + CIRC(glyphX + 14, glyphY + 32, 3, { fill: color });
    } else if (i === 3) { // engine core
      glyph = R(glyphX + 6, glyphY + 6, 20, 20, { stroke: color, sw: 1.4 }) +
        P(`M${glyphX + 11} ${glyphY + 16}l4 4 8-9`, { stroke: color, sw: 1.6 });
    } else if (i === 4) { // path node
      glyph = P(`M${glyphX + 2} ${glyphY + 28}C${glyphX + 10} ${glyphY + 2},${glyphX + 24} ${glyphY + 2},${glyphX + 30} ${glyphY + 28}`, { stroke: color, sw: 1.5 }) +
        CIRC(glyphX + 2, glyphY + 28, 2.4, { fill: color }) + CIRC(glyphX + 30, glyphY + 28, 2.4, { fill: color });
    } else { // layers
      glyph = [0, 1, 2].map((k) => R(glyphX + k * 5, glyphY + 6 + k * 7, 32 - k * 5, 8, { stroke: color, sw: 1.2, opacity: 1 - k * 0.25 })).join('');
    }
    return (
      R(x, y0, bw, bh, { fill: C.panel, stroke: C.edge, rx: 4 }) +
      L(x, y0, x + 34, y0, { stroke: color, sw: 2.5 }) +
      glyph +
      T(x + 12, y0 + 76, l1, { size: 10.5, fill: C.ink, weight: 700 }) +
      T(x + 12, y0 + 90, l2, { size: 10.5, fill: C.ink, weight: 700 }) +
      (() => {
        const words = sub.split(' ');
        const lines = [];
        let cur = '';
        for (const wd of words) {
          const t = cur ? `${cur} ${wd}` : wd;
          if (textWidth(t, 7.8) > bw - 20) { lines.push(cur); cur = wd; } else cur = t;
        }
        lines.push(cur);
        assert(lines.length <= 2, `stage sub-label needs > 2 lines: ${sub}`);
        lines.forEach((ln, k) => fit(ln, 7.8, bw - 20, 0, 'stage sub'));
        return Tlines(x + 12, y0 + 104, lines, { size: 7.8, fill: C.dim, step: 11 });
      })() +
      (i < 5 ? ar.line(x + bw + 3, y0 + bh / 2, x + bw + gap - 3, y0 + bh / 2, C.edgeHi, { sw: 1.5 }) : '')
    );
  }).join('');

  const impX = x0, impW = 6 * bw + 5 * gap;
  const importBar =
    R(impX, 216, impW, 48, { fill: C.well, stroke: C.limeDim, rx: 4 }) +
    L(impX, 216, impX + 34, 216, { stroke: C.lime, sw: 2.5 }) +
    T(impX + 16, 236, 'IMPORT ADAPTER', { size: 9.5, fill: C.lime, weight: 700, spacing: 1 }) +
    T(impX + 150, 236, 'stable uids assigned', { size: 10.5, fill: C.ink }) +
    T(impX + 150, 252, '→ canonical document → one undoable history entry', { size: 10.5, fill: C.dim }) +
    ar.line(impX + impW - 90, 212, impX + impW - 90, 216, C.lime, { sw: 1.2 });

  const body =
    header(W, 'RASTER → SEMANTIC SVG — THE CLIENT-SIDE PIPELINE', 'src/utils/vectorization/engine.ts') +
    boxes + importBar +
    T(474, 292, '0 network calls — the pixel pipeline never leaves the browser', { size: 10, fill: C.faint, anchor: 'middle' });

  return { name: 'raster-pipeline.svg', svg: doc(W, H, { body, defs: ar.defsXml(), title: 'VECTORA raster to semantic SVG pipeline' }) };
}

/* ═════════════════════════ 8 · AI pipeline ═════════════════════════ */

export function aiPipeline() {
  const H = 470;
  const ar = arrowBank();
  const x0 = 30, cw = 888;
  const rows = [];
  const rowY = (i) => 56 + i * 66;
  const RH = 52;

  const band = (i, label, labelColor, inner) => {
    const y = rowY(i);
    return (
      R(x0, y, cw, RH, { fill: C.panel, stroke: C.edge, rx: 4 }) +
      L(x0, y, x0, y + RH, { stroke: labelColor, sw: 3 }) +
      T(x0 + 16, y + 21, `0${i + 1}`, { size: 9, fill: labelColor, weight: 700 }) +
      T(x0 + 16, y + 38, label, { size: 9, fill: C.faint, spacing: 1.5 }) +
      inner +
      (i < 5 ? ar.line(x0 + cw / 2, y + RH + 3, x0 + cw / 2, y + RH + 11, C.edgeHi, { sw: 1.5 }) : '')
    );
  };

  const contentX = x0 + 130;

  rows.push(band(0, 'INTENT', C.cyan,
    chipRow(contentX, rowY(0) + 14, ['text prompt', 'reference image', 'style + palette constraints', 'output dimensions'],
      { size: 9.5, color: C.ink, stroke: C.edgeHi, fill: C.well }).el));

  rows.push(band(1, 'API ROUTE', C.cyan,
    T(contentX, rowY(1) + 22, 'POST /api/generate-unified', { size: 11, fill: C.ink, weight: 700 }) +
    T(contentX, rowY(1) + 40, 'unified entry — also /generate-svg · /refine-svg · /animate-svg · /import-vectorize', { size: 8.5, fill: C.dim }) +
    chip(x0 + cw - 190, rowY(1) + 10, 'validateApiKey', { size: 9, color: C.amber, stroke: C.edge, fill: C.well }).el +
    chip(x0 + cw - 190, rowY(1) + 30, 'rate limit 20/min', { size: 9, color: C.amber, stroke: C.edge, fill: C.well }).el));

  const modelChips = [
    ['gemini-3.8-flash', 'default', C.cyan],
    ['gemini-3.1-flash-lite', null, C.dim],
    ['gemini-2.5-flash', null, C.dim],
    ['gemini-flash-latest', null, C.dim],
  ];
  let mcx = contentX;
  const modelRow = modelChips.map(([m, tag, color]) => {
    const w = textWidth(m, 9.5) + 16 + (tag ? textWidth(tag, 8) + 10 : 0);
    const el =
      R(mcx, rowY(2) + 12, w, 20, { fill: C.well, stroke: color === C.cyan ? C.cyanDim : C.edge, rx: 3 }) +
      T(mcx + 8, rowY(2) + 26, m, { size: 9.5, fill: color }) +
      (tag ? T(mcx + textWidth(m, 9.5) + 18, rowY(2) + 26, tag, { size: 8, fill: C.faint }) : '');
    mcx += w + 8;
    return el;
  }).join('');
  rows.push(band(2, 'ORCHESTRATOR', C.violet,
    modelRow +
    T(contentX, rowY(2) + 46, 'fail-forward rotation · thinking levels cycled by complexity · 10s backoff on 429', { size: 8.5, fill: C.dim })));

  rows.push(band(3, 'REPAIR + CONTRACT', C.violet,
    T(contentX, rowY(3) + 22, 'sanitized JSON engine', { size: 10.5, fill: C.ink, weight: 700 }) +
    T(contentX, rowY(3) + 40, 'strips markdown noise · repairs fragments', { size: 8.5, fill: C.dim }) +
    ar.line(contentX + 260, rowY(3) + 26, contentX + 290, rowY(3) + 26, C.edgeHi, { sw: 1.5 }) +
    T(contentX + 300, rowY(3) + 22, 'runtime response contract', { size: 10.5, fill: C.ink, weight: 700 }) +
    T(contentX + 300, rowY(3) + 40, 'schema + bounds validated', { size: 8.5, fill: C.dim })));

  rows.push(band(4, 'DUAL GATE', C.amber,
    R(contentX, rowY(4) + 10, 350, 32, { fill: C.well, stroke: C.cyanDim, rx: 3 }) +
    T(contentX + 12, rowY(4) + 24, 'GATE 1 — server svgGuard', { size: 9.5, fill: C.cyan, weight: 700 }) +
    T(contentX + 12, rowY(4) + 38, 'deny patterns · ≤ 2 MB · ≤ 20 k elements', { size: 8.5, fill: C.dim }) +
    ar.line(contentX + 360, rowY(4) + 26, contentX + 390, rowY(4) + 26, C.edgeHi, { sw: 1.5 }) +
    R(contentX + 400, rowY(4) + 10, 350, 32, { fill: C.well, stroke: C.violetDim, rx: 3 }) +
    T(contentX + 412, rowY(4) + 24, 'GATE 2 — client sanitizeSvg', { size: 9.5, fill: C.violet, weight: 700 }) +
    T(contentX + 412, rowY(4) + 38, 'DOM allowlist — the render gate', { size: 8.5, fill: C.dim })));

  rows.push(band(5, 'IMPORT', C.lime,
    T(contentX, rowY(5) + 22, 'stable uids → canonical document', { size: 11, fill: C.ink, weight: 700 }) +
    T(contentX, rowY(5) + 40, 'one undoable history entry — the AI result is just another editable transaction', { size: 8.5, fill: C.dim })));

  const body =
    header(W, 'AI VECTOR SYNTHESIS — SERVER-ORCHESTRATED', 'server.ts · server/ai/contracts.ts') +
    rows.join('') +
    T(474, 452, 'the API key never reaches the client — every model call is made server-side', { size: 10, fill: C.faint, anchor: 'middle' });

  return { name: 'ai-pipeline.svg', svg: doc(W, H, { body, defs: ar.defsXml(), title: 'VECTORA AI generation pipeline — Gemini orchestration with dual SVG gates' }) };
}

/* ═════════════════════════ 9 · security gate ═════════════════════════ */

export function securityGate() {
  const H = 478;
  const ar = arrowBank();

  const sources = ['AI output', 'file import', 'session history', 'showcase samples'];
  const srcEls = sources.map((s, i) => {
    const y = 64 + i * 54;
    return (
      R(36, y, 170, 42, { fill: C.panel, stroke: C.edge, rx: 3 }) +
      T(48, y + 25, s, { size: 10.5, fill: C.ink }) +
      ar.line(210, y + 21, 244, y + 21, C.edgeHi, { sw: 1.5 })
    );
  }).join('');

  const denyList = [
    '<script>', 'on*=', 'javascript:', 'vbscript:', 'foreignObject',
    'embed · iframe · object', '<!ENTITY', 'xml-stylesheet',
  ];
  const g1x = 248, g1w = 330;
  const denyChips = [];
  let dx = g1x + 16, dy = 100;
  for (const d of denyList) {
    const w = textWidth(d, 9) + 16;
    if (dx + w > g1x + g1w - 12) { dx = g1x + 16; dy += 26; }
    denyChips.push(chip(dx, dy, d, { size: 9, color: C.rose, stroke: C.roseDim, fill: C.well, h: 20, padX: 8 }));
    dx += w + 6;
  }
  const gate1 =
    R(g1x, 64, g1w, 208, { fill: C.panel, stroke: C.cyanDim, rx: 4 }) +
    ticks(g1x, 64, g1w, 208, C.cyan) +
    T(g1x + 16, 88, 'GATE 1 — SERVER', { size: 10, fill: C.cyan, weight: 700, spacing: 1 }) +
    T(g1x + 16, 104, 'svgGuard.ts — pattern deny-list', { size: 8.5, fill: C.dim }) +
    denyChips.map((c) => c.el).join('') +
    L(g1x + 16, 236, g1x + g1w - 16, 236, { stroke: C.edge, sw: 1 }) +
    T(g1x + 16, 252, 'budgets — ≤ 2,000,000 bytes · ≤ 20,000 elements', { size: 9, fill: C.ink }) +
    T(g1x + 16, 266, 'rejects carry a reason; violations are logged redacted', { size: 8, fill: C.faint });

  const g2x = 614, g2w = 298;
  const gate2rows = [
    'element removal — script · foreignObject · media',
    'on* event attribute scrub',
    'URL policy — #fragment + data:image only',
    'SMIL target safety — no animating href/on*',
    'style scrub — @import + unsafe url()',
  ];
  const gate2 =
    R(g2x, 64, g2w, 208, { fill: C.panel, stroke: C.violetDim, rx: 4 }) +
    ticks(g2x, 64, g2w, 208, C.violet) +
    T(g2x + 16, 88, 'GATE 2 — CLIENT', { size: 10, fill: C.violet, weight: 700, spacing: 1 }) +
    T(g2x + 16, 104, 'sanitizeSvg.ts — DOM allowlist', { size: 8.5, fill: C.dim }) +
    gate2rows.map((r, i) =>
      check(g2x + 16, 124 + i * 24, C.violet, { sw: 1.6 }) +
      T(g2x + 34, 130 + i * 24, r, { size: 8.8, fill: C.dim })).join('') +
    L(g2x + 16, 236, g2x + g2w - 16, 236, { stroke: C.edge, sw: 1 }) +
    T(g2x + 16, 252, 'authoritative — every render path', { size: 9, fill: C.ink }) +
    T(g2x + 16, 266, 'passes through SafeSvg, no exceptions', { size: 8, fill: C.faint });

  const reject =
    R(g1x, 300, g1w, 42, { fill: C.well, stroke: C.roseDim, rx: 3, dash: '4 3' }) +
    P(`M${g1x + 14} ${310}l7 7M${g1x + 21} ${310}l-7 7`, { stroke: C.rose, sw: 1.8, linecap: 'round' }) +
    T(g1x + 34, 326, 'REJECT — 4xx with reason, before it reaches a DOM', { size: 9, fill: C.rose });

  const safe =
    R(g2x, 300, g2w, 42, { fill: C.well, stroke: C.limeDim, rx: 3 }) +
    check(g2x + 14, 312, C.lime, { sw: 1.8 }) +
    T(g2x + 34, 326, 'SAFE RENDER — SafeSvg component', { size: 9, fill: C.lime, weight: 700 });

  const railChips = ['AI 20/min', 'GITHUB 10/min', 'LIGHT 120/min', 'OAuth state TTL 10 min', 'server sessions 12 h'];
  const rail = chipRow(
    Math.round((W - (railChips.reduce((a, c) => a + textWidth(c, 9) + 16, 0) + 4 * 8)) / 2),
    372, railChips, { size: 9, color: C.dim, stroke: C.edge, fill: C.well });

  const body =
    header(W, 'SECURITY RAIL — EVERY SVG CROSSES THE GATE', 'server/security/ · src/utils/sanitizeSvg.ts') +
    srcEls + gate1 + gate2 +
    ar.line(g1x + g1w + 6, 168, g2x - 6, 168, C.edgeHi, { sw: 1.5 }) +
    reject + safe +
    ar.line(g2x + g2w / 2, 272 + 6, g2x + g2w / 2, 300, C.lime, { sw: 1.5 }) +
    ar.line(g1x + g1w / 2, 278, g1x + g1w / 2, 300, C.rose, { sw: 1.5, dash: '3 3' }) +
    T(474, 362, 'CAPACITY & SESSION RAIL', { size: 8.5, fill: C.faint, anchor: 'middle', spacing: 2 }) +
    rail.el +
    T(474, 452, 'the client never trusts the network path — the DOM sanitizer is the authoritative render gate', { size: 10, fill: C.faint, anchor: 'middle' });

  return { name: 'security-gate.svg', svg: doc(W, H, { body, defs: ar.defsXml(), title: 'VECTORA SVG security gate — server guard and client sanitizer' }) };
}

/* ═════════════════════════ 10 · export rail ═════════════════════════ */

export function exportRail() {
  const H = 434;
  const lanes = [
    ['SVG', 'semantic source · layer groups · pretty-printed', C.cyan],
    ['PNG', '1× / 2× retina raster · transparency', C.violet],
    ['REACT', 'typed TSX component · Next.js / Vite ready', C.cyan],
    ['CSS', 'data-URI background · drop-in snippet', C.amber],
    ['GIF', 'motion capture · 18 fps · up to 120 frames', C.violet],
    ['SPRITE SHEET', 'SVG + PNG grid · CSS steps() playback', C.amber],
  ];

  const docX = 48, docY = 152, docW = 176, docH = 116;
  const docNode =
    R(docX, docY, docW, docH, { fill: C.panel2, stroke: C.cyanDim, rx: 5 }) +
    ticks(docX, docY, docW, docH, C.cyan) +
    R(docX + 66, docY + 16, 44, 34, { stroke: C.ink, sw: 1.5, rx: 3 }) +
    P(`M${docX + 72} ${docY + 38}c0-14 32-14 32 0s-32 14-32 0`, { stroke: C.ink, sw: 1 }) +
    T(docX + docW / 2, docY + 70, 'VectorDocument', { size: 10.5, fill: C.ink, anchor: 'middle', weight: 700 }) +
    T(docX + docW / 2, docY + 86, 'typed · versioned', { size: 8.5, fill: C.faint, anchor: 'middle' }) +
    T(docX + docW / 2, docY + 102, 'one source of truth', { size: 8.5, fill: C.faint, anchor: 'middle' });

  const busX = 288;
  const bus =
    L(busX, 68, busX, 352, { stroke: C.cyan, sw: 2.5, opacity: 0.8 }) +
    L(docX + docW + 6, docY + docH / 2, busX, docY + docH / 2, { stroke: C.cyanDim, sw: 2 });

  const laneEls = lanes.map(([name, desc, color], i) => {
    const y = 64 + i * 56, x = 318, w = 596, h = 46;
    inBounds(W, H, x, y, w, h, `export lane ${name}`);
    fit(desc, 9.5, w - 190, 0, `export lane ${name}`);
    const iconX = x + 12, iconY = y + 11;
    let icon = '';
    if (i === 0) icon = R(iconX, iconY, 24, 24, { stroke: color, sw: 1.4 }) + P(`M${iconX + 5} ${iconY + 17}l7-9 4 5 3-3 5 7`, { stroke: color, sw: 1.3 });
    else if (i === 1) icon = R(iconX, iconY, 24, 24, { stroke: color, sw: 1.4 }) + R(iconX + 6, iconY + 6, 12, 12, { fill: color, opacity: 0.5 });
    else if (i === 2) icon = P(`M${iconX + 7} ${iconY + 3}L${iconX + 1} ${iconY + 21}h6l-1 5-5-5h5z`, { stroke: color, sw: 1.2, fill: color, opacity: 0.85 });
    else if (i === 3) icon = P(`M${iconX + 2} ${iconY + 8}h20M${iconX + 2} ${iconY + 16}h14M${iconX + 2} ${iconY + 24}h17`, { stroke: color, sw: 2.4, linecap: 'round' });
    else if (i === 4) icon = R(iconX + 3, iconY + 2, 18, 20, { stroke: color, sw: 1.4, rx: 2 }) + P(`M${iconX + 7} ${iconY + 14}l2-4 3 6 2-3h3`, { stroke: color, sw: 1.2 });
    else icon = [0, 1, 2].map((c) => [0, 1].map((r) => R(iconX + c * 9, iconY + r * 9 + 3, 8, 8, { stroke: color, sw: 1.1 }))).join('');
    return (
      L(busX, y + h / 2, x, y + h / 2, { stroke: C.edgeHi, sw: 1.5 }) +
      CIRC(busX, y + h / 2, 3.2, { fill: C.cyan }) +
      R(x, y, w, h, { fill: C.panel, stroke: C.edge, rx: 3 }) +
      L(x, y, x, y + h, { stroke: color, sw: 3 }) +
      icon +
      T(x + 48, y + 20, name, { size: 11.5, fill: color, weight: 700, spacing: 0.5 }) +
      T(x + 48, y + 36, desc, { size: 9.5, fill: C.dim })
    );
  }).join('');

  const body =
    header(W, 'EXPORT RAIL — ONE DOCUMENT, SIX DELIVERY SURFACES', 'src/components/ExportModal.tsx') +
    docNode + bus + laneEls +
    T(474, 412, 'every export derives from the document — never from a screenshot', { size: 10, fill: C.faint, anchor: 'middle' });

  return { name: 'export-rail.svg', svg: doc(W, H, { body, title: 'VECTORA export rail — SVG, PNG, React, CSS, GIF and sprite sheets' }) };
}

/* ═══════════════════════ 11 · verification console ═══════════════════════ */

const SUITES = [
  ['src/document/__tests__/commands.test.ts', 16, 'DOCUMENT', C.cyan],
  ['src/document/__tests__/history.test.ts', 8, 'DOCUMENT', C.cyan],
  ['src/document/__tests__/importer.exporter.test.ts', 12, 'DOCUMENT', C.cyan],
  ['src/document/__tests__/migrations.test.ts', 5, 'DOCUMENT', C.cyan],
  ['src/document/__tests__/persistence.test.ts', 8, 'DOCUMENT', C.cyan],
  ['src/document/__tests__/selectors.test.ts', 8, 'DOCUMENT', C.cyan],
  ['src/document/__tests__/tree.test.ts', 9, 'DOCUMENT', C.cyan],
  ['src/utils/__tests__/sanitizeSvg.test.ts', 19, 'SANITIZE + PARSE', C.violet],
  ['src/utils/__tests__/svgParser.layers.test.ts', 12, 'SANITIZE + PARSE', C.violet],
  ['server/security/__tests__/svgGuard.test.ts', 9, 'SECURITY', C.amber],
  ['server/security/__tests__/rateLimit.test.ts', 6, 'SECURITY', C.amber],
  ['server/security/__tests__/sessions.test.ts', 11, 'SECURITY', C.amber],
  ['server/security/__tests__/oauthState.test.ts', 4, 'SECURITY', C.amber],
  ['server/__tests__/api.integration.test.ts', 10, 'SERVER + AI', C.rose],
  ['server/ai/__tests__/contracts.test.ts', 10, 'SERVER + AI', C.rose],
];

export function verificationConsole() {
  const H = 646;
  const px = 30, py = 24, pw = 888, ph = 566;
  const tx = px + 24;
  let ty = py + 62;
  const LH = 19.5;

  const titlebar =
    R(px, py, pw, ph, { fill: C.panel, stroke: C.edge, rx: 6 }) +
    R(px, py, pw, 34, { fill: C.panel2, stroke: C.edge, rx: 6 }) +
    R(px, py + 20, pw, 14, { fill: C.panel2 }) +
    CIRC(px + 20, py + 17, 5, { fill: C.rose }) +
    CIRC(px + 38, py + 17, 5, { fill: C.amber }) +
    CIRC(px + 56, py + 17, 5, { fill: C.lime }) +
    T(px + pw / 2, py + 21, 'vectora — verification console', { size: 10, fill: C.dim, anchor: 'middle' }) +
    T(px + pw - 18, py + 21, 'vitest · tsc · vite · esbuild', { size: 9, fill: C.faint, anchor: 'end' });

  const line = (str, o = {}) => { const out = T(tx, ty, str, { size: 10.5, fill: C.dim, ...o }); ty += LH; return out; };

  let out = '';
  out += line('$ npm test', { fill: C.ink });

  for (const [name, count, domain, color] of SUITES) {
    fit(name, 10.5, 430, 0, 'suite name');
    const dots = '.'.repeat(20);
    out += check(tx, ty - 8.5, C.lime, { sw: 1.8 }) +
      T(tx + 18, ty, name, { size: 10.5, fill: C.ink }) +
      T(tx + 18 + 436, ty, dots, { size: 10.5, fill: C.faint }) +
      T(tx + 18 + 620, ty, String(count), { size: 10.5, fill: C.dim, anchor: 'end' }) +
      T(px + pw - 22, ty, domain, { size: 8.5, fill: color, anchor: 'end', spacing: 1 });
    ty += LH;
  }

  ty += 4;
  out += T(tx, ty, 'Test Files', { size: 11, fill: C.dim, weight: 700 }) +
    T(tx + 120, ty, '15 passed (15)', { size: 11, fill: C.lime, weight: 700 }); ty += LH;
  out += T(tx, ty, 'Tests', { size: 11, fill: C.dim, weight: 700 }) +
    T(tx + 120, ty, '147 passed (147)', { size: 11, fill: C.lime, weight: 700 }) +
    T(px + pw - 22, ty, 'DURATION 9.8s', { size: 8.5, fill: C.faint, anchor: 'end', spacing: 1 }); ty += LH + 10;

  out += T(tx, ty, '$', { size: 10.5, fill: C.cyan }) + T(tx + 16, ty, 'npm run lint && npm run build', { size: 10.5, fill: C.ink }); ty += LH;
  const buildLines = [
    ['tsc --noEmit', '0 errors'],
    ['vite build', 'client bundle'],
    ['esbuild server.ts', 'dist/server.cjs'],
  ];
  for (const [cmd, res] of buildLines) {
    const dots = '.'.repeat(20);
    out += T(tx + 16, ty, cmd, { size: 10.5, fill: C.ink }) +
      T(tx + 16 + 380, ty, dots, { size: 10.5, fill: C.faint }) +
      T(tx + 16 + 620, ty, res, { size: 10.5, fill: C.dim, anchor: 'end' }) +
      check(tx + 16 + 634, ty - 8.5, C.lime, { sw: 1.8 });
    ty += LH;
  }

  out += R(tx, ty + 2, 8, 13, {
    fill: C.cyan,
    inner: `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>`,
  });

  // domain summary column (right side of suite list)
  const groups = [['DOCUMENT ENGINE', 66, C.cyan], ['SANITIZER + PARSER', 31, C.violet], ['SECURITY', 30, C.amber], ['SERVER + AI CONTRACTS', 20, C.rose]];
  let gy = py + 96;
  out += L(660, py + 76, 660, py + 76 + 15 * LH, { stroke: C.edge, sw: 1, dash: '3 4' });
  out += T(890, py + 66, 'DOMAINS', { size: 8.5, fill: C.faint, anchor: 'end', spacing: 2 });
  for (const [label, count, color] of groups) {
    out += T(890, gy, `${count}`, { size: 13, fill: color, anchor: 'end', weight: 700 }) +
      T(890, gy + 14, label, { size: 7.5, fill: C.faint, anchor: 'end', spacing: 1 });
    gy += 52;
  }

  const body = titlebar + out;
  assert(ty + 20 < py + ph, `console content overflows: ${ty} vs ${py + ph}`);
  return { name: 'verification-console.svg', svg: doc(W, H, { body, title: 'VECTORA verification console — 147 tests passing' }) };
}

/* ═════════════════════════ 12 · deployment ═════════════════════════ */

export function deployment() {
  const H = 478;
  const ar = arrowBank();

  const colA = { x: 36, w: 280 };
  const colB = { x: 372, w: 280 };
  const colC = { x: 708, w: 204 };
  const py = 64, phh = 288;

  const clientRows = [
    'React 19 studio — Vite 6 bundle',
    'IndexedDB projects + autosave',
    'crash recovery on reload',
    'SafeSvg render gate (DOM sanitizer)',
    '0 API keys in the client',
  ];
  const serverRows = [
    '/api/generate-unified · generate-svg',
    '/api/refine-svg · animate-svg',
    '/api/import-vectorize',
    '/api/auth/github · github/sync',
    '/api/health · diagnostics/models',
    'static dist/ serving in production',
  ];

  const client =
    R(colA.x, py, colA.w, phh, { fill: C.panel, stroke: C.edge, rx: 4 }) +
    L(colA.x, py, colA.x + colA.w, py, { stroke: C.cyan, sw: 2.5 }) +
    T(colA.x + 16, py + 26, 'CLIENT — BROWSER', { size: 10.5, fill: C.cyan, weight: 700, spacing: 1 }) +
    clientRows.map((r, i) =>
      CIRC(colA.x + 22, py + 48 + i * 32, 2.2, { fill: C.cyan }) +
      fit(r, 9.5, colA.w - 44) && T(colA.x + 34, py + 52 + i * 32, r, { size: 9.5, fill: C.dim })).join('');

  const server =
    R(colB.x, py, colB.w, phh, { fill: C.panel, stroke: C.edge, rx: 4 }) +
    L(colB.x, py, colB.x + colB.w, py, { stroke: C.violet, sw: 2.5 }) +
    T(colB.x + 16, py + 26, 'SERVER — NODE + EXPRESS', { size: 10.5, fill: C.violet, weight: 700, spacing: 1 }) +
    serverRows.map((r, i) =>
      CIRC(colB.x + 22, py + 48 + i * 28, 2.2, { fill: C.violet }) +
      fit(r, 9.5, colB.w - 44) && T(colB.x + 34, py + 52 + i * 28, r, { size: 9.5, fill: C.dim })).join('');

  const ext =
    R(colC.x, py, colC.w, phh, { fill: C.panel, stroke: C.edge, rx: 4 }) +
    L(colC.x, py, colC.x + colC.w, py, { stroke: C.amber, sw: 2.5 }) +
    T(colC.x + 16, py + 26, 'EXTERNAL', { size: 10.5, fill: C.amber, weight: 700, spacing: 1 }) +
    R(colC.x + 14, py + 42, colC.w - 28, 108, { fill: C.well, stroke: C.edge, rx: 3 }) +
    T(colC.x + 26, py + 64, 'Google Gemini', { size: 10, fill: C.ink, weight: 700 }) +
    Tlines(colC.x + 26, py + 82, ['generation · refinement ·', 'vision · animation'], { size: 8.5, fill: C.dim, step: 13 }) +
    T(colC.x + 26, py + 122, 'GEMINI_API_KEY', { size: 8, fill: C.amber }) +
    T(colC.x + 26, py + 136, 'server-side only', { size: 8, fill: C.faint }) +
    R(colC.x + 14, py + 164, colC.w - 28, 108, { fill: C.well, stroke: C.edge, rx: 3 }) +
    T(colC.x + 26, py + 186, 'GitHub', { size: 10, fill: C.ink, weight: 700 }) +
    Tlines(colC.x + 26, py + 204, ['OAuth code flow ·', 'artifact sync'], { size: 8.5, fill: C.dim, step: 13 }) +
    T(colC.x + 26, py + 244, 'server sessions', { size: 8, fill: C.amber }) +
    T(colC.x + 26, py + 258, '12 h TTL', { size: 8, fill: C.faint });

  const midX = (colA.x + colA.w + colB.x) / 2;
  const midX2 = (colB.x + colB.w + colC.x) / 2;
  const links =
    ar.line(midX - 26, py + 120, midX + 26, py + 120, C.edgeHi, { sw: 2 }) +
    ar.line(midX + 26, py + 140, midX - 26, py + 140, C.edgeHi, { sw: 2 }) +
    T(midX, py + 108, 'HTTPS · JSON', { size: 8.5, fill: C.faint, anchor: 'middle' }) +
    ar.line(midX2 - 22, py + 90, midX2 + 22, py + 90, C.edgeHi, { sw: 2 }) +
    ar.line(midX2 + 22, py + 110, midX2 - 22, py + 110, C.edgeHi, { sw: 2 }) +
    T(midX2, py + 78, 'OAuth + sync', { size: 8.5, fill: C.faint, anchor: 'middle' }) +
    ar.line(midX2 - 10, py + 210, midX2 + 10, py + 210, C.amber, { sw: 2 }) +
    T(midX2, py + 198, 'model calls', { size: 8.5, fill: C.faint, anchor: 'middle' });

  const modes = [
    ['DEV', 'tsx server.ts + Vite middleware', C.cyan],
    ['PROD', 'node dist/server.cjs · serves dist/', C.violet],
    ['PORT', 'default 3000 · env override', C.amber],
  ];
  const modeEls = modes.map(([tag, txt, color], i) => {
    const x = 36 + i * 296, w = 272;
    return (
      R(x, 380, w, 44, { fill: C.well, stroke: C.edge, rx: 3 }) +
      chip(x + 10, 392, tag, { size: 8.5, color, stroke: C.edgeHi, fill: C.panel, h: 20 }).el +
      T(x + 74, 406, txt, { size: 9.5, fill: C.dim })
    );
  }).join('');

  const body =
    header(W, 'DEPLOYMENT — ONE PROCESS, THREE PLANES', 'server.ts · server/config.ts') +
    client + server + ext + links + modeEls +
    T(474, 456, 'environment-driven config — PORT · body limits · SVG budgets · rate limits · session TTLs', { size: 10, fill: C.faint, anchor: 'middle' });

  return { name: 'deployment.svg', svg: doc(W, H, { body, defs: ar.defsXml(), title: 'VECTORA deployment architecture — client, server and external planes' }) };
}

/* ═════════════════════════ 13 · footer ═══════════════════════════ */

export function footer() {
  const H = 208;
  const body =
    T(474, 72, 'VECTORA', { size: 30, fill: C.ink, weight: 700, anchor: 'middle', spacing: 8 }) +
    T(474, 96, 'SEMANTIC VECTOR ENGINEERING SYSTEM', { size: 10, fill: C.dim, anchor: 'middle', spacing: 3 }) +
    L(324, 116, 624, 116, { stroke: C.edgeHi, sw: 1 }) +
    CIRC(474, 116, 2.6, { fill: C.cyan }) +
    T(474, 140, 'PIXELS ARE OUTPUT · STRUCTURE IS THE PRODUCT', { size: 9.5, fill: C.faint, anchor: 'middle', spacing: 1.5 }) +
    T(474, 158, 'EVERY NODE HAS IDENTITY · EVERY MUTATION HAS HISTORY', { size: 9.5, fill: C.faint, anchor: 'middle', spacing: 1.5 }) +
    T(474, 182, 'VECTORA v2.6.0 — React 19 · TypeScript 5.8 · Vite 6 · Express 4 · Vitest 147/147', { size: 9, fill: C.faint, opacity: 0.75, anchor: 'middle' }) +
    T(474, 200, '© 2026 VECTORA', { size: 8.5, fill: C.faint, opacity: 0.55, anchor: 'middle' }) +
    ticks(20, 16, W - 40, H - 32, C.edgeHi, { len: 14, sw: 1.2 });

  return { name: 'footer.svg', svg: doc(W, H, { body, title: 'VECTORA footer' }) };
}
