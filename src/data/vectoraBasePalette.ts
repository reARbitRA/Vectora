export interface BaseColorToken {
  name: string;
  role: 'primary' | 'secondary' | 'accent' | 'neutral-dark' | 'neutral-light';
  hex: string;
  rgb: string;
  cssVariable: string;
  semanticClass: string;
  description: string;
}

export const VECTORA_BASE_PALETTE: BaseColorToken[] = [
  // Primary
  {
    name: 'Electric Acid Green',
    role: 'primary',
    hex: '#00FF00',
    rgb: 'rgb(0, 255, 0)',
    cssVariable: '--vectora-primary',
    semanticClass: '.vectora-primary',
    description: 'High-visibility visual focal point, key active states, and glowing edge strokes.',
  },
  {
    name: 'Signal Orange',
    role: 'primary',
    hex: '#FF5500',
    rgb: 'rgb(255, 85, 0)',
    cssVariable: '--vectora-primary-warm',
    semanticClass: '.vectora-primary-warm',
    description: 'Warm primary brand mark, imperative triggers, and attention anchors.',
  },

  // Secondary
  {
    name: 'Cyber Amber',
    role: 'secondary',
    hex: '#FFB800',
    rgb: 'rgb(255, 184, 0)',
    cssVariable: '--vectora-secondary',
    semanticClass: '.vectora-secondary',
    description: 'Secondary geometric fills, dial rings, status warnings, and warm highlights.',
  },
  {
    name: 'Ultra Cyan',
    role: 'secondary',
    hex: '#00F0FF',
    rgb: 'rgb(0, 240, 255)',
    cssVariable: '--vectora-secondary-alt',
    semanticClass: '.vectora-secondary-alt',
    description: 'Precision wireframe coordinates, secondary telemetry vectors, and sub-dials.',
  },

  // Accent
  {
    name: 'Hot Magenta',
    role: 'accent',
    hex: '#FF0055',
    rgb: 'rgb(255, 0, 85)',
    cssVariable: '--vectora-accent',
    semanticClass: '.vectora-accent',
    description: 'Dynamic focal emphasis, secondary lasers, and critical data nodes.',
  },
  {
    name: 'Laser Violet',
    role: 'accent',
    hex: '#8B5CF6',
    rgb: 'rgb(139, 92, 246)',
    cssVariable: '--vectora-accent-alt',
    semanticClass: '.vectora-accent-alt',
    description: 'Atmospheric depth lighting, mystical or celestial energy nodes, and secondary glow.',
  },

  // Neutral Dark
  {
    name: 'Jet Obsidian Canvas',
    role: 'neutral-dark',
    hex: '#000000',
    rgb: 'rgb(0, 0, 0)',
    cssVariable: '--vectora-bg',
    semanticClass: '.vectora-bg',
    description: 'Absolute deep canvas backdrop for high-contrast contrast vector optics.',
  },
  {
    name: 'Carbon Surface',
    role: 'neutral-dark',
    hex: '#0A0A0A',
    rgb: 'rgb(10, 10, 10)',
    cssVariable: '--vectora-surface',
    semanticClass: '.vectora-surface',
    description: 'Primary structural card background and recessed vector planes.',
  },
  {
    name: 'Steel Matrix Border',
    role: 'neutral-dark',
    hex: '#333333',
    rgb: 'rgb(51, 51, 51)',
    cssVariable: '--vectora-border',
    semanticClass: '.vectora-border',
    description: 'Geometric coordinate grid lines, bounding box strokes, and panel separators.',
  },

  // Neutral Light / Ink
  {
    name: 'Pure White Ink',
    role: 'neutral-light',
    hex: '#FFFFFF',
    rgb: 'rgb(255, 255, 255)',
    cssVariable: '--vectora-text-primary',
    semanticClass: '.vectora-text-primary',
    description: 'Primary typography, vector glyphs, and maximum-contrast vector shapes.',
  },
  {
    name: 'Platinum Muted Text',
    role: 'neutral-light',
    hex: '#E5E5E5',
    rgb: 'rgb(229, 229, 229)',
    cssVariable: '--vectora-text-secondary',
    semanticClass: '.vectora-text-secondary',
    description: 'Secondary technical labels, captions, and micro-grid notations.',
  },
  {
    name: 'Muted Slate Grid',
    role: 'neutral-light',
    hex: '#888888',
    rgb: 'rgb(136, 136, 136)',
    cssVariable: '--vectora-text-muted',
    semanticClass: '.vectora-text-muted',
    description: 'Dimensional ticks, inactive toggles, and neutral wireframe lines.',
  },
];

export const VECTORA_SVG_STYLE_BLOCK = `/* ==========================================================================
   VECTORA DESIGN SYSTEM - PRODUCTION SVG STYLE BLOCK
   Semantic CSS tokens for resolution-independent vector objects
   ========================================================================== */
:root {
  --vectora-bg: #000000;
  --vectora-surface: #0A0A0A;
  --vectora-border: #333333;
  --vectora-primary: #00FF00;
  --vectora-primary-warm: #FF5500;
  --vectora-secondary: #FFB800;
  --vectora-secondary-alt: #00F0FF;
  --vectora-accent: #FF0055;
  --vectora-accent-alt: #8B5CF6;
  --vectora-text-primary: #FFFFFF;
  --vectora-text-secondary: #E5E5E5;
  --vectora-text-muted: #888888;
}

/* Background & Structural Surfaces */
.vectora-bg { fill: var(--vectora-bg); }
.vectora-surface { fill: var(--vectora-surface); stroke: var(--vectora-border); stroke-width: 1.5; }
.vectora-border { stroke: var(--vectora-border); fill: none; }
.vectora-grid-line { stroke: var(--vectora-border); stroke-width: 1; stroke-dasharray: 4,4; opacity: 0.6; }

/* Primary Accents */
.vectora-primary { fill: var(--vectora-primary); }
.vectora-primary-stroke { stroke: var(--vectora-primary); fill: none; stroke-linecap: round; stroke-linejoin: round; }
.vectora-primary-glow { stroke: var(--vectora-primary); filter: drop-shadow(0 0 6px rgba(0, 255, 0, 0.7)); }

/* Secondary Accents */
.vectora-secondary { fill: var(--vectora-secondary); }
.vectora-secondary-stroke { stroke: var(--vectora-secondary); fill: none; }
.vectora-secondary-alt { fill: var(--vectora-secondary-alt); }
.vectora-secondary-alt-stroke { stroke: var(--vectora-secondary-alt); fill: none; }

/* Dynamic Focal Accents */
.vectora-accent { fill: var(--vectora-accent); }
.vectora-accent-stroke { stroke: var(--vectora-accent); fill: none; }

/* Typography & Semantic Labels */
.vectora-text-primary { fill: var(--vectora-text-primary); font-family: 'JetBrains Mono', 'Fira Code', monospace; font-weight: 700; }
.vectora-text-secondary { fill: var(--vectora-text-secondary); font-family: 'JetBrains Mono', 'Fira Code', monospace; font-weight: 500; }
.vectora-text-muted { fill: var(--vectora-text-muted); font-family: 'JetBrains Mono', 'Fira Code', monospace; font-weight: 400; }`;

export interface LayerNamingRule {
  prefix: string;
  category: string;
  standardName: string;
  drawOrderRank: number; // 0 = lowest/bottom, 100 = highest/top
  description: string;
  exampleElements: string[];
}

export const VECTORA_LAYER_CONVENTION: LayerNamingRule[] = [
  {
    prefix: '00',
    category: 'Defs & Assets',
    standardName: '00_Defs_Resources',
    drawOrderRank: 0,
    description: 'Non-rendered resource definitions (gradients, clipPaths, filters, reusable symbols).',
    exampleElements: ['<defs>', '<linearGradient>', '<filter>', '<pattern>', '<clipPath>', '<symbol>'],
  },
  {
    prefix: '01',
    category: 'Background & Grid',
    standardName: '01_Background',
    drawOrderRank: 1,
    description: 'Foundational canvas fill, cartesian / isometric grid lines, base coordinate markers.',
    exampleElements: ['Backdrop <rect>', 'Grid <line>', 'Sub-grid dots', 'Marginal crop marks'],
  },
  {
    prefix: '02',
    category: 'Structural Geometry',
    standardName: '02_Shapes_Primary',
    drawOrderRank: 2,
    description: 'Major silhouette planes, outer bezels, dials, housing containers, and base frames.',
    exampleElements: ['Outer dial rings', 'Main structural polygons', 'Silhouettes', 'Bevel contours'],
  },
  {
    prefix: '03',
    category: 'Core Artwork',
    standardName: '03_Artwork_Core',
    drawOrderRank: 3,
    description: 'Central vector illustration elements, focal subjects, complex bezier curves.',
    exampleElements: ['Focal figures', 'Mechanical gears', 'Planetary bodies', 'Architectural facades'],
  },
  {
    prefix: '04',
    category: 'Secondary Details',
    standardName: '04_Details_Secondary',
    drawOrderRank: 4,
    description: 'Tick marks, sub-dials, precision crosshairs, technical needles, micro-screws.',
    exampleElements: ['Degree markers', 'Sub-dial needles', 'Circuit traces', 'Hatch lines'],
  },
  {
    prefix: '05',
    category: 'Typography & Text',
    standardName: '05_Text_Headlines',
    drawOrderRank: 5,
    description: 'Vector typography, numerals, telemetry readouts, typographic callouts, brand logos.',
    exampleElements: ['<text> titles', 'Coordinate readout labels', 'Scale indicators', 'Numerals'],
  },
  {
    prefix: '06',
    category: 'Accents & Highlights',
    standardName: '06_Accents_Highlights',
    drawOrderRank: 6,
    description: 'High-contrast focal pips, vivid LED status indicators, edge reflections, neon glows.',
    exampleElements: ['Status dots', 'Specular highlight strokes', 'Bright corner rivets'],
  },
  {
    prefix: '07',
    category: 'FX & Overlays',
    standardName: '07_FX_Overlays',
    drawOrderRank: 7,
    description: 'Topmost atmospheric effects: scanlines, chromatic aberrations, vignettes, dust/noise.',
    exampleElements: ['Scanline matrices', 'Glow filters', 'Vignette gradients', 'CRT overlays'],
  },
];
