/**
 * VECTORA README assets — core system diagrams.
 * Builders return { name, svg } — pure functions, deterministic output.
 */

import {
  C, T, Tlines, R, L, P, CIRC, ticks, chip, chipRow, arrowBank,
  header, doc, fit, textWidth, inBounds, check,
} from './kit.mjs';

const W = 948;

/* ═══════════════════════════════ 1 · hero ═══════════════════════════════ */

export function hero() {
  const H = 420;

  // Right panel — live vector scene.
  const px = 470, py = 48, pw = 442, ph = 324;

  // Main swoosh path + its anchor/control points.
  const swoosh = 'M608 262C668 238 746 250 828 208';
  const arc = 'M636 148C700 88 812 108 826 192C836 258 742 300 664 256';
  const nodes = [
    [636, 148, 0], [826, 192, 0.5], [664, 256, 1.0], [828, 208, 1.5], [608, 262, 2.0],
  ];
  const ctrl = [[700, 88], [812, 108]];

  const pulse = (cx, cy, delay) =>
    CIRC(cx, cy, 4, {
      fill: C.cyan, stroke: C.bg, sw: 1,
      inner: `<animate attributeName="opacity" values="0.25;1;0.25" dur="2.6s" begin="${delay}s" repeatCount="indefinite"/>`,
    });

  const scan = L(px + 14, py + 52, px + pw - 14, py + 52, {
    stroke: C.cyan, sw: 1, opacity: 0.5,
    inner: `<animateTransform attributeName="transform" type="translate" values="0 0; 0 246; 0 0" dur="7.5s" repeatCount="indefinite"/>`,
  });

  // Raster motif: 5x5 pixel grid fragmenting into vector geometry.
  const raster = [];
  const rx0 = px + 26, ry0 = 196, cell = 11;
  const fills = [
    [1, 0, 0, 1, 0], [0, 1, 1, 0, 0], [1, 1, 0, 0, 1], [0, 0, 1, 1, 0], [0, 1, 0, 0, 0],
  ];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (fills[r][c]) {
        raster.push(R(rx0 + c * cell, ry0 + r * cell, cell, cell, { fill: C.violet, opacity: 0.8 }));
      } else {
        raster.push(R(rx0 + c * cell, ry0 + r * cell, cell, cell, { stroke: C.edgeHi, sw: 0.6 }));
      }
    }
  }

  const body = [
    // ── left column ──
    T(36, 118, 'VECTORA', { size: 54, weight: 700, spacing: 6, fill: C.ink, cls: 'glow' }),
    L(38, 138, 214, 138, { stroke: C.cyan, sw: 2.5 }),
    T(36, 168, 'SEMANTIC VECTOR ENGINEERING SYSTEM', { size: 12.5, fill: C.cyan, spacing: 2, weight: 700 }),
    T(36, 196, 'Intent in — editable vector structure out.', { size: 11, fill: C.dim }),
    T(36, 228, '> "neon isometric city, six-layer scene"', { size: 11, fill: C.violet }),
    (() => {
      const tw = textWidth('> "neon isometric city, six-layer scene"', 11);
      return R(36 + tw + 7, 219, 8, 12, {
        fill: C.violet,
        inner: `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/>`,
      });
    })(),
    (() => {
      const stages = ['PROMPT', 'CONSTRUCT', 'EDIT', 'ANIMATE', 'EXPORT'];
      const colors = [C.cyan, C.cyan, C.cyan, C.cyan, C.lime];
      let x = 36, out = '';
      stages.forEach((s, i) => {
        const w = textWidth(s, 9) + 18;
        out += R(x, 258, w, 22, { fill: C.well, stroke: C.edgeHi, rx: 3 }) +
          T(x + w / 2, 273, s, { size: 9, fill: colors[i], anchor: 'middle', spacing: 1 });
        x += w + 8;
        if (i < stages.length - 1) {
          out += T(x - 6, 273, '→', { size: 9, fill: C.faint });
          x += 8;
        }
      });
      inBounds(W, H, 36, 258, x - 36, 22, 'hero stage chips');
      return out;
    })(),
    L(36, 318, 424, 318, { stroke: C.edge, sw: 1 }),
    T(36, 344, 'PIXELS ARE OUTPUT — STRUCTURE IS THE PRODUCT', { size: 10, fill: C.faint, spacing: 1 }),
    T(36, 366, 'every node has identity · every mutation has history', { size: 9.5, fill: C.faint, opacity: 0.8 }),

    // ── right panel ──
    R(px, py, pw, ph, { fill: C.panel, stroke: C.edge, rx: 4 }),
    ticks(px, py, pw, ph, C.cyan),
    T(px + 16, py + 24, 'DOCUMENT VIEWPORT', { size: 9, fill: C.faint, spacing: 2 }),
    T(px + pw - 16, py + 24, '0 0 1024 1024', { size: 9, fill: C.faint, anchor: 'end' }),

    // orbit ring + satellite
    CIRC(716, 200, 96, {
      stroke: C.edgeHi, sw: 1, dash: '3 5',
      inner: `<animateTransform attributeName="transform" type="rotate" values="0 716 200; 360 716 200" dur="26s" repeatCount="indefinite"/>`,
    }),
    CIRC(716, 104, 4, {
      fill: C.amber,
      inner: `<animateTransform attributeName="transform" type="rotate" values="0 716 200; 360 716 200" dur="9s" repeatCount="indefinite"/>`,
    }),

    // drawing paths
    P(arc, {
      stroke: C.cyan, sw: 2.4, dash: '640 640',
      inner: `<animate attributeName="stroke-dashoffset" values="640;0;0;640" keyTimes="0;0.45;0.8;1" dur="6.5s" repeatCount="indefinite"/>`,
    }),
    P(swoosh, {
      stroke: C.violet, sw: 2, dash: '300 300',
      inner: `<animate attributeName="stroke-dashoffset" values="300;0;0;300" keyTimes="0;0.5;0.85;1" dur="6.5s" begin="0.8s" repeatCount="indefinite"/>`,
    }),

    // control points
    ...ctrl.map(([cx, cy]) =>
      P(`M${cx - 4} ${cy}H${cx + 4}M${cx} ${cy - 4}V${cy + 4}`, { stroke: C.faint, sw: 1 }),
    ),

    // anchor nodes
    ...nodes.map(([nx, ny, d]) => pulse(nx, ny, d)),

    // raster → vector motif
    ...raster,
    T(rx0, ry0 + 68, 'RASTER', { size: 8, fill: C.faint, spacing: 2 }),
    L(rx0 + 74, ry0 + 28, rx0 + 108, ry0 + 28, { stroke: C.faint, sw: 1.2 }),
    P(`M${rx0 + 104} ${ry0 + 23}l7 5-7 5`, { stroke: C.faint, sw: 1.2 }),
    P(`M${rx0 + 116} ${ry0 + 4}l34 12-8 18-20-4-10-14z`, { stroke: C.lime, sw: 1.6 }),
    CIRC(rx0 + 116, ry0 + 4, 2.4, { fill: C.lime }),
    T(rx0 + 112, ry0 + 68, 'VECTOR', { size: 8, fill: C.faint, spacing: 2 }),
    scan,

    // panel footer chips
    chipRow(px + 16, py + ph - 32, ['NODES 5', 'PATHS 2', 'LAYERS 2', 'REVERSIBLE'], {
      size: 8.5, color: C.dim, stroke: C.edge, fill: C.well,
    }).el,
  ].join('');

  const style = '.glow{filter:url(#softglow)}';

  return { name: 'hero.svg', svg: doc(W, H, { body, style, title: 'VECTORA — semantic vector engineering system' }) };
}

/* ═════════════════════════════ 2 · status bar ═════════════════════════════ */

export function statusBar() {
  const H = 88;
  const segments = [
    ['VERIFICATION', '147 TESTS GREEN', C.lime],
    ['DOCUMENT ENGINE', 'TYPED SCENE GRAPH', C.cyan],
    ['VECTORIZATION', '14 ENGINES', C.violet],
    ['MOTION', '33 PRESETS', C.amber],
    ['EXPORT', '6 FORMATS', C.ink],
  ];
  const pw = 180, gap = 3;
  const x0 = Math.round((W - (segments.length * pw + (segments.length - 1) * gap)) / 2);

  const body = segments.map(([label, value, color], i) => {
    const x = x0 + i * (pw + gap);
    inBounds(W, H, x, 18, pw, 52, `status segment ${label}`);
    fit(value, 13, pw - 12, 0, 'status value');
    fit(label, 8.5, pw - 12, 1.5, 'status label');
    return (
      R(x, 18, pw, 52, { fill: C.panel, stroke: C.edge, rx: 3 }) +
      L(x + 14, 30, x + 50, 30, { stroke: color, sw: 2 }) +
      T(x + 14, 46, label, { size: 8.5, fill: C.faint, spacing: 1.5 }) +
      T(x + 14, 62, value, { size: 13, fill: color, weight: 700 })
    );
  }).join('');

  return { name: 'status-bar.svg', svg: doc(W, H, { body, title: 'VECTORA status strip — verification, engine, vectorization, motion, export' }) };
}

/* ═══════════════════════════ 3 · scene graph ═══════════════════════════ */

export function sceneGraph() {
  const H = 600;
  const rows = [
    { lvl: 0, type: 'VectorDocument', kind: 'root', attrs: 'schema v1 · metadata · revisions', uid: 'doc' },
    { lvl: 1, type: 'metadata', kind: 'meta', attrs: 'title · source · createdAt', uid: null },
    { lvl: 1, type: 'PageNode', kind: 'root', attrs: '"artboard" · viewBox 0 0 1024 1024', uid: 'page_0' },
    { lvl: 2, type: 'g', kind: 'group', attrs: 'inkscape:label="Sky Layer"', uid: 'n_01' },
    { lvl: 3, type: 'path', kind: 'geom', attrs: 'id="wing-left" · fill url(#gradA)', uid: 'n_02' },
    { lvl: 3, type: 'rect', kind: 'geom', attrs: '512×288 · fill #19D3C5', uid: 'n_03' },
    { lvl: 2, type: 'g', kind: 'group', attrs: 'inkscape:label="Constellation"', uid: 'n_04' },
    { lvl: 3, type: 'circle', kind: 'geom', attrs: 'r=6 · stroke #F4F1EB', uid: 'n_05' },
    { lvl: 3, type: 'text', kind: 'txt', attrs: '"VECTORA" · font-family mono', uid: 'n_06' },
    { lvl: 2, type: 'defs', kind: 'def', attrs: 'paint + geometry definitions', uid: null },
    { lvl: 3, type: 'linearGradient', kind: 'def', attrs: 'id="gradA" · 3 stops', uid: 'n_07' },
    { lvl: 3, type: 'clipPath', kind: 'def', attrs: 'id="frame" · clip to artboard', uid: 'n_08' },
  ];
  const kindColor = {
    root: C.cyan, meta: C.dim, group: C.violet, geom: C.amber, txt: C.ink, def: C.rose,
  };
  const x0 = 44, right = 628, step = 38, bh = 30, y0 = 64;
  const boxX = (lvl) => x0 + lvl * 26;

  const rowEls = rows.map((r, i) => {
    const bx = boxX(r.lvl), bw = right - bx, by = y0 + i * step;
    inBounds(W, H, bx, by, bw, bh, `tree row ${r.type}`);
    const color = kindColor[r.kind];
    const chipW = textWidth(r.type, 9.5) + 14;
    const out = [
      R(bx, by, bw, bh, { fill: i === 0 ? C.panel2 : C.panel, stroke: r.kind === 'root' ? color : C.edge, rx: 3 }),
      L(bx, by, bx + 3, by, { stroke: color, sw: 3 }),
      chip(bx + 10, by + 6, r.type, { size: 9.5, color, stroke: C.edgeHi, fill: C.well, h: 18, padX: 7 }).el,
      fit(r.attrs, 10, bw - chipW - 24 - (r.uid ? 96 : 12), 0, `attrs ${r.type}`) &&
        T(bx + 10 + chipW + 8, by + 20, r.attrs, { size: 10, fill: C.dim }),
      r.uid
        ? (() => {
            const uw = textWidth(r.uid, 9) + 14;
            return R(bx + bw - uw - 8, by + 6, uw, 18, { fill: C.well, stroke: C.edge, rx: 3, dash: '2 2' }) +
              T(bx + bw - uw / 2 - 8, by + 19, r.uid, { size: 9, fill: C.faint, anchor: 'middle' });
          })()
        : '',
    ];
    // connector elbow to parent
    if (i > 0) {
      const parent = [...rows.slice(0, i)].reverse().find((p) => p.lvl === r.lvl - 1);
      if (parent) {
        const pi = rows.indexOf(parent);
        const pxx = boxX(parent.lvl) + 14;
        const pyBottom = y0 + pi * step + bh;
        const my = by + bh / 2;
        out.unshift(L(pxx, pyBottom, pxx, my, { stroke: C.edgeHi, sw: 1 }) + L(pxx, my, bx, my, { stroke: C.edgeHi, sw: 1 }));
      }
    }
    return out.join('');
  }).join('');

  // right annotation column
  const notes = [
    ['STABLE IDENTITY', ['the uid survives renames, id edits', 'and re-imports — ids are reference', 'targets, not identity'], C.cyan],
    ['FOREIGN NAMESPACES', ['inkscape: and sodipodi: metadata', 'round-trips untouched through', 'import → edit → export'], C.violet],
    ['ADDRESSABLE NODES', ['every node can be selected, animated,', 'diffed and persisted by uid —', 'AI edits target exact nodes'], C.amber],
  ];
  const notesEl = notes.map(([title, lines, color], i) => {
    const ny = 64 + i * 136;
    return (
      R(656, ny, 268, 108, { fill: C.panel, stroke: C.edge, rx: 4 }) +
      L(656, ny, 656, ny + 108, { stroke: color, sw: 3 }) +
      L(632, ny + 54, 656, ny + 54, { stroke: C.edgeHi, sw: 1, dash: '3 3' }) +
      T(672, ny + 24, title, { size: 10, fill: color, weight: 700, spacing: 1 }) +
      Tlines(672, ny + 44, lines, { size: 9.5, fill: C.dim, step: 15 })
    );
  }).join('');

  const body =
    header(W, 'TYPED SCENE GRAPH — THE CANONICAL DOCUMENT', 'src/document/') +
    rowEls +
    notesEl +
    R(44, 524, 880, 48, { fill: C.well, stroke: C.edge, rx: 4 }) +
    T(64, 553, 'SVG is an import and export format — the typed document is the editing source of truth.', { size: 11, fill: C.ink }) +
    T(908, 553, 'SCHEMA v1 → MIGRATIONS', { size: 9, fill: C.faint, anchor: 'end', spacing: 1 });

  fit('SVG is an import and export format — the typed document is the editing source of truth.', 11, 880 - 36 - 180);
  return { name: 'scene-graph.svg', svg: doc(W, H, { body, title: 'VECTORA typed scene graph — canonical vector document' }) };
}

/* ═══════════════════════════ 4 · document engine ═══════════════════════════ */

export function documentEngine() {
  const H = 430;
  const ar = arrowBank();

  const surfaces = ['Studio Canvas', 'Layer Rack', 'Code Editor', 'AI Route', 'Import Adapter', 'Plugin Gallery'];
  const engineRows = [
    'typed scene graph',
    'immutable tree operations',
    'command layer — apply / undo',
    'transactional history',
    'schema migrations',
    'IndexedDB autosave + recovery',
  ];
  const views = [['SafeSvg render', 'sanitized inline SVG'], ['layer specs', 'ordered layer model'], ['canonical SVG export', 'pretty-printed source'], ['persisted revisions', 'IndexedDB projects']];

  const colL = { x: 36, w: 200 };
  const colC = { x: 272, w: 400 };
  const colR = { x: 708, w: 204 };

  const surf = surfaces.map((s, i) => {
    const y = 88 + i * 50;
    return (
      R(colL.x, y, colL.w, 40, { fill: C.panel, stroke: C.edge, rx: 3 }) +
      T(colL.x + 12, y + 25, s, { size: 10.5, fill: C.ink }) +
      ar.line(colL.x + colL.w + 6, y + 20, colC.x - 6, y + 20, C.edgeHi)
    );
  }).join('');

  const eng = [
    R(colC.x, 88, colC.w, 280, { fill: C.panel2, stroke: C.cyanDim, rx: 4 }) +
    ticks(colC.x, 88, colC.w, 280, C.cyan) +
    T(colC.x + 20, 116, 'DOCUMENT ENGINE', { size: 12, fill: C.cyan, weight: 700, spacing: 2 }) +
    T(colC.x + colC.w - 20, 116, 'SOURCE OF TRUTH', { size: 8.5, fill: C.faint, anchor: 'end', spacing: 1.5 }),
    ...engineRows.map((r, i) => {
      const y = 146 + i * 36;
      return (
        CIRC(colC.x + 26, y - 4, 2.4, { fill: C.cyan }) +
        T(colC.x + 42, y, r, { size: 11, fill: C.ink })
      );
    }),
  ].join('');

  const vw = views.map(([name, sub], i) => {
    const y = 88 + i * 70;
    return (
      R(colR.x, y, colR.w, 54, { fill: C.panel, stroke: C.edge, rx: 3 }) +
      T(colR.x + 12, y + 22, name, { size: 10.5, fill: C.ink }) +
      T(colR.x + 12, y + 40, sub, { size: 8.5, fill: C.faint }) +
      ar.line(colC.x + colC.w + 6, y + 27, colR.x - 6, y + 27, C.edgeHi)
    );
  }).join('');

  const body =
    header(W, 'ONE DOCUMENT — EVERY SURFACE DERIVES FROM IT', 'src/document/') +
    T(colL.x, 78, 'EDIT SURFACES', { size: 9, fill: C.faint, spacing: 2 }) +
    T(colC.x, 78, '', { size: 9 }) +
    T(colR.x, 78, 'DERIVED VIEWS', { size: 9, fill: C.faint, spacing: 2 }) +
    surf + eng + vw +
    R(36, 392, 876, 0, { fill: 'none' }) +
    T(474, 404, 'surfaces never hold private copies — they derive from the graph and write back through commands', { size: 10.5, fill: C.dim, anchor: 'middle' });

  return { name: 'document-engine.svg', svg: doc(W, H, { body, defs: ar.defsXml(), title: 'VECTORA document engine — one source of truth, derived surfaces' }) };
}

/* ═════════════════════════ 5 · command history ═══════════════════════════ */

export function commandHistory() {
  const H = 470;
  const ar = arrowBank();

  const actions = [
    ['CANVAS', 'set fill · #19D3C5', C.cyan],
    ['LAYERS', 'rename layer', C.cyan],
    ['AI ROUTE', 'refine → 4 commands', C.violet],
    ['CODE EDITOR', 'keystroke burst ×12', C.amber],
  ];

  const pastEntries = [
    ["rename layer → 'Wing'", C.cyan],
    ['set fill → #19D3C5', C.cyan],
    ['AI refine — 4 cmds, 1 entry', C.violet],
    ['code burst ×12 — coalesced', C.amber],
  ];

  const acts = actions.map(([src, label, color], i) => {
    const x = 36 + i * 228, y = 56, w = 212, h = 44;
    inBounds(W, H, x, y, w, h, 'action chip');
    return (
      R(x, y, w, h, { fill: C.panel, stroke: C.edge, rx: 3 }) +
      L(x, y, x + 3, y, { stroke: color, sw: 3 }) +
      T(x + 12, y + 19, src, { size: 8.5, fill: C.faint, spacing: 1.5 }) +
      T(x + 12, y + 35, label, { size: 10, fill: C.ink }) +
      ar.line(x + w / 2, y + h + 4, x + w / 2, 122, C.edgeHi)
    );
  }).join('');

  const applyBar =
    R(36, 126, 876, 34, { fill: C.well, stroke: C.edgeHi, rx: 3 }) +
    T(474, 147, 'HistoryManager.apply(commands, { label }) — one transaction, one history entry', { size: 11, fill: C.ink, anchor: 'middle' });

  // stacks
  const stackY = 186, stackH = 176;
  const pastPanel =
    R(36, stackY, 300, stackH, { fill: C.panel, stroke: C.edge, rx: 4 }) +
    T(52, stackY + 22, 'PAST — undo stack', { size: 10, fill: C.cyan, weight: 700, spacing: 1 }) +
    pastEntries.map(([label, color], i) => {
      const ey = stackY + 38 + i * 30;
      const edgeTag = i === 0 ? 'popped first by undo'
        : i === pastEntries.length - 1 ? 'oldest' : '';
      return (
        R(52, ey, 268, 24, { fill: C.well, stroke: C.edge, rx: 2 }) +
        L(52, ey, 52, ey + 24, { stroke: color, sw: 2.5 }) +
        T(62, ey + 16, label, { size: 9.5, fill: C.ink }) +
        (edgeTag ? T(312, ey + 16, edgeTag, { size: 8, fill: C.faint, anchor: 'end' }) : '')
      );
    }).join('');

  const curPanel =
    R(372, stackY, 204, stackH, { fill: C.panel2, stroke: C.cyanDim, rx: 4 }) +
    ticks(372, stackY, 204, stackH, C.cyan) +
    T(474, stackY + 26, 'CURRENT DOC', { size: 10, fill: C.cyan, weight: 700, anchor: 'middle', spacing: 1.5 }) +
    R(452, stackY + 44, 44, 34, { stroke: C.ink, sw: 1.5, rx: 3 }) +
    P(`M458 ${stackY + 66}c0-14 32-14 32 0s-32 14-32 0`, { stroke: C.ink, sw: 1 }) +
    T(474, stackY + 96, 'VectorDocument', { size: 10.5, fill: C.ink, anchor: 'middle' }) +
    T(474, stackY + 114, 'live state', { size: 9, fill: C.faint, anchor: 'middle' }) +
    R(390, stackY + 130, 74, 26, { fill: C.well, stroke: C.edge, rx: 3 }) +
    T(427, stackY + 147, 'undo ⌘Z', { size: 9.5, fill: C.dim, anchor: 'middle' }) +
    R(484, stackY + 130, 74, 26, { fill: C.well, stroke: C.edge, rx: 3 }) +
    T(521, stackY + 147, 'redo ⌘⇧Z', { size: 9.5, fill: C.dim, anchor: 'middle' });

  const futurePanel =
    R(712, stackY, 200, stackH, { fill: C.panel, stroke: C.edge, rx: 4, dash: '5 4' }) +
    T(728, stackY + 22, 'FUTURE — redo stack', { size: 10, fill: C.violet, weight: 700, spacing: 1 }) +
    R(728, stackY + 42, 168, 24, { fill: C.well, stroke: C.edge, rx: 2, dash: '3 3' }) +
    T(738, stackY + 58, 'pending redo entry', { size: 9.5, fill: C.faint }) +
    T(812, stackY + 96, 'cleared by any', { size: 9, fill: C.faint, anchor: 'middle' }) +
    T(812, stackY + 110, 'new command', { size: 9, fill: C.faint, anchor: 'middle' });

  const undoArrow =
    ar.line(344, stackY + 148, 366, stackY + 148, C.cyan, { sw: 2 }) +
    T(355, stackY + 136, 'UNDO', { size: 8.5, fill: C.cyan, anchor: 'middle' }) +
    T(355, stackY + 168, 'invert', { size: 8, fill: C.faint, anchor: 'middle' });
  const redoArrow =
    ar.line(584, stackY + 148, 606, stackY + 148, C.violet, { sw: 2 }) +
    T(595, stackY + 136, 'REDO', { size: 8.5, fill: C.violet, anchor: 'middle' }) +
    T(595, stackY + 168, 'replay', { size: 8, fill: C.faint, anchor: 'middle' });
  // entry travel path: undo moves an entry from PAST over CURRENT into FUTURE
  const travel =
    P(`M336 ${stackY + 158}H600`, { stroke: C.cyan, sw: 1, dash: '2 3', opacity: 0.55 }) +
    T(474, stackY + 172, 'entry travels: PAST → FUTURE (undo) · FUTURE → PAST (redo)', { size: 8, fill: C.faint, anchor: 'middle' });

  const foot = [
    ['TRANSACTIONS', 'an AI operation folds 4 commands — replace node, add gradient, add filter, rename layer — into ONE history entry', C.violet],
    ['COALESCING', 'rapid keystrokes merge into one entry by coalesceKey — undo restores the pre-burst document', C.amber],
    ['PRECISE INVERSE', 'commands capture minimal inverse state (old attr value, removed node + position) — undo is exact, not snapshot-based', C.cyan],
  ].map(([title, text, color], i) => {
    const x = 36 + i * 300, y = 384, w = 276, h = 72;
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    for (const wd of words) {
      const tryLine = cur ? `${cur} ${wd}` : wd;
      if (textWidth(tryLine, 8.5) > w - 24) { lines.push(cur); cur = wd; } else cur = tryLine;
    }
    lines.push(cur);
    return (
      R(x, y, w, h, { fill: C.panel, stroke: C.edge, rx: 4 }) +
      L(x, y, x, y + h, { stroke: color, sw: 3 }) +
      T(x + 12, y + 18, title, { size: 9.5, fill: color, weight: 700, spacing: 1 }) +
      Tlines(x + 12, y + 34, lines, { size: 8.5, fill: C.dim, step: 12 })
    );
  }).join('');

  const body =
    header(W, 'COMMAND HISTORY — EVERY MUTATION IS REVERSIBLE', 'src/document/commands.ts · history.ts') +
    acts + applyBar + pastPanel + curPanel + futurePanel + undoArrow + redoArrow + travel + foot;

  return { name: 'command-history.svg', svg: doc(W, H, { body, defs: ar.defsXml(), title: 'VECTORA command history — transactional undo and redo' }) };
}
