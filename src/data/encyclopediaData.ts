/**
 * VECTORA Master Encyclopedia Knowledge Base
 * Authoritative reference dataset covering SVG Geometry Math, Filter Pipelines,
 * Color Science & Harmonies, and Engineering Standards.
 */

export interface EncyclopediaEntry {
  id: string;
  name: string;
  domain: 'vectorization' | 'animation' | 'geometry' | 'filters' | 'color' | 'standards';
  category: string;
  tagline: string;
  description: string;
  mathFormula?: string;
  complexity?: string;
  bestFor: string;
  tier: 'TIER 1' | 'TIER 2' | 'TIER 3' | 'TIER 4';
  gpu: 'YES' | 'OPTIONAL' | 'NO';
  fidelity: number; // 1-5
  editability: number; // 1-5
  codeSnippet: string;
  liveSvgPreview?: string;
  tags: string[];
}

export const GEOMETRY_ENTRIES: EncyclopediaEntry[] = [
  {
    id: 'geom-bezier',
    name: 'Bézier Curves & de Casteljau Math',
    domain: 'geometry',
    category: 'Path Primitives',
    tagline: 'Parametric polynomial curve interpolation',
    description: 'Cubic Bézier curves defined by start point P0, control points P1 and P2, and endpoint P3. Evaluated via de Casteljau recursive linear interpolation: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3 for t ∈ [0, 1]. Derivatives yield exact tangent velocities and normal curvature vectors.',
    mathFormula: 'B(t) = \\sum_{i=0}^n \\binom{n}{i} (1-t)^{n-i} t^i P_i',
    complexity: 'O(1) evaluation, O(N) subdivision',
    bestFor: 'Organic glyph contours, letterforms, smooth contour outlines and mechanical curves',
    tier: 'TIER 1',
    gpu: 'OPTIONAL',
    fidelity: 5,
    editability: 5,
    tags: ['Cubic Bezier', 'Path Math', 'de Casteljau', 'Curvature', 'Splines'],
    codeSnippet: `<path d="M 50 150 C 70 30, 230 30, 250 150 S 430 270, 450 150" fill="none" stroke="#00FF00" stroke-width="3" stroke-linecap="round"/>`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bez-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00FF00" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Tangent line helpers -->
  <line x1="30" y1="160" x2="80" y2="40" stroke="#FF0055" stroke-dasharray="3,3" stroke-width="1.5"/>
  <line x1="270" y1="160" x2="220" y2="40" stroke="#FFB800" stroke-dasharray="3,3" stroke-width="1.5"/>
  <circle cx="80" cy="40" r="4" fill="#FF0055"/>
  <circle cx="220" cy="40" r="4" fill="#FFB800"/>
  <!-- Cubic Curve -->
  <path d="M 30 160 C 80 40, 220 40, 270 160" fill="none" stroke="#00FF00" stroke-width="3.5" filter="drop-shadow(0 0 8px rgba(0,255,0,0.8))"/>
  <!-- Anchors -->
  <circle cx="30" cy="160" r="5" fill="#FFFFFF"/>
  <circle cx="270" cy="160" r="5" fill="#FFFFFF"/>
  <text x="150" y="185" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">Cubic Bezier: C (80,40) (220,40) (270,160)</text>
</svg>`,
  },
  {
    id: 'geom-arc',
    name: 'Elliptical Arc Parameterization',
    domain: 'geometry',
    category: 'Path Primitives',
    tagline: 'Endpoint to center coordinate conversion algebra',
    description: 'SVG elliptical arcs A rx ry x-axis-rotation large-arc-flag sweep-flag x y map an ellipse between two points. Transforming from SVG endpoint representation (x1, y1) → (x2, y2) to center representation (cx, cy, θ1, Δθ) requires solving quadratic root equations with radius scale corrections when radii are insufficient.',
    mathFormula: '(\\frac{x\'}{r_x})^2 + (\\frac{y\'}{r_y})^2 = 1, \\quad \\Delta\\theta = \\text{sweep} \\cdot |\\theta_2 - \\theta_1|',
    complexity: 'O(1) analytic conversion',
    bestFor: 'Precision dial gauges, circular rounded corners, planetary orbits and technical scales',
    tier: 'TIER 1',
    gpu: 'NO',
    fidelity: 5,
    editability: 4,
    tags: ['Elliptical Arc', 'Endpoint Parameterization', 'Gauge Dials', 'Geometry'],
    codeSnippet: `<path d="M 100 200 A 100 100 0 1 1 300 200 L 250 200 A 50 50 0 1 0 150 200 Z" fill="#00FF00" fill-opacity="0.2" stroke="#00FF00" stroke-width="2"/>`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Arc Gauge -->
  <path d="M 50 160 A 110 110 0 0 1 250 160" fill="none" stroke="#222222" stroke-width="12" stroke-linecap="round"/>
  <path d="M 50 160 A 110 110 0 0 1 200 65" fill="none" stroke="#00FF00" stroke-width="12" stroke-linecap="round" filter="drop-shadow(0 0 10px rgba(0,255,0,0.6))"/>
  <circle cx="150" cy="160" r="6" fill="#00FF00"/>
  <line x1="150" y1="160" x2="200" y2="65" stroke="#FFFFFF" stroke-width="2.5"/>
  <text x="150" y="190" fill="#00FF00" font-family="monospace" font-size="11" text-anchor="middle">A 110 110 0 0 1 [x, y]</text>
</svg>`,
  },
  {
    id: 'geom-affine',
    name: '2D Affine Matrix Transforms',
    domain: 'geometry',
    category: 'Spatial Transforms',
    tagline: 'Homogeneous coordinates & matrix composition',
    description: 'SVG transform="matrix(a,b,c,d,e,f)" represents linear transformation combined with translation using 3x3 augmented homogeneous matrices. Multiplications combine scale, rotate, skew, and translate into a single compact transform pipeline without loss of vector resolution.',
    mathFormula: '\\begin{bmatrix} x\' \\\\ y\' \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} a & c & e \\\\ b & d & f \\\\ 0 & 0 & 1 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\\\ 1 \\end{bmatrix}',
    complexity: 'O(1) matrix multiplication',
    bestFor: 'Isometric projections, shear effects, composite pivot armatures and camera viewports',
    tier: 'TIER 1',
    gpu: 'YES',
    fidelity: 5,
    editability: 5,
    tags: ['Affine Transformation', 'Matrix', 'Homogeneous Coordinates', 'Projection'],
    codeSnippet: `<g transform="matrix(0.866, 0.5, -0.5, 0.866, 50, 20)">
  <rect x="0" y="0" width="80" height="80" fill="#00F0FF" stroke="#FFFFFF" stroke-width="2"/>
</g>`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Original Box -->
  <rect x="50" y="70" width="60" height="60" fill="none" stroke="#444444" stroke-width="1.5" stroke-dasharray="4,4"/>
  <!-- Affine Transformed Box -->
  <g transform="matrix(0.866, 0.5, -0.5, 0.866, 120, -10)">
    <rect x="50" y="70" width="60" height="60" fill="#00FF00" fill-opacity="0.15" stroke="#00FF00" stroke-width="2.5" filter="drop-shadow(0 0 8px rgba(0,255,0,0.5))"/>
    <circle cx="80" cy="100" r="4" fill="#FFFFFF"/>
  </g>
  <text x="150" y="185" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">matrix(cos θ, sin θ, -sin θ, cos θ, dx, dy)</text>
</svg>`,
  },
  {
    id: 'geom-viewbox',
    name: 'ViewBox & preserveAspectRatio Algebra',
    domain: 'geometry',
    category: 'Spatial Transforms',
    tagline: 'Infinite resolution responsive coordinate mapping',
    description: 'The viewBox attribute defines the logical aspect ratio and coordinate space (min-x, min-y, width, height). Combined with preserveAspectRatio (meet, slice, none), it dictates how vector coordinates project onto physical display viewports without subpixel raster degradation.',
    mathFormula: 'scale = \\min(\\frac{W_{box}}{W_{vB}}, \\frac{H_{box}}{H_{vB}}), \\quad dx = (W_{box} - W_{vB} \\cdot scale) / 2',
    complexity: 'O(1) viewport fitting',
    bestFor: 'Responsive SVG scaling, full-bleed backgrounds, icon sets and dynamic artboards',
    tier: 'TIER 1',
    gpu: 'NO',
    fidelity: 5,
    editability: 5,
    tags: ['ViewBox', 'Responsive SVG', 'Coordinate Systems', 'Aspect Ratio'],
    codeSnippet: `<svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
  <!-- Scalable artwork inside -->
</svg>`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Outer Frame -->
  <rect x="20" y="20" width="260" height="140" fill="none" stroke="#333333" stroke-width="1"/>
  <!-- Inner Viewbox Boundary -->
  <rect x="70" y="20" width="160" height="140" fill="#00FF00" fill-opacity="0.05" stroke="#00FF00" stroke-width="2" stroke-dasharray="6,4"/>
  <circle cx="150" cy="90" r="45" fill="none" stroke="#00FF00" stroke-width="2"/>
  <text x="150" y="95" fill="#00FF00" font-family="monospace" font-size="11" text-anchor="middle">xMidYMid meet</text>
  <text x="150" y="185" fill="#888888" font-family="monospace" font-size="9" text-anchor="middle">ViewBox: 0 0 160 140 → Viewport: 260 140</text>
</svg>`,
  },
];

export const FILTER_ENTRIES: EncyclopediaEntry[] = [
  {
    id: 'filter-turbulence',
    name: 'feTurbulence Procedural Noise',
    domain: 'filters',
    category: 'Shader & Filter FX',
    tagline: 'Perlin & Simplex vector texture synthesis',
    description: 'Generates organic Perlin noise directly in the SVG rendering engine using pseudorandom grid gradients. Produces synthetic textures like grain, water caustics, marble, cloud vapor, and topographic noise without external raster bitmaps.',
    mathFormula: 'Noise(x, y) = \\sum_{i=0}^{octaves-1} \\frac{1}{2^i} P(2^i \\cdot f_x \\cdot x, 2^i \\cdot f_y \\cdot y)',
    complexity: 'O(W · H · octaves) pixel rasterization',
    bestFor: 'Brutalist grain, paper textures, smoke, organic liquid masks and tactile surfaces',
    tier: 'TIER 1',
    gpu: 'YES',
    fidelity: 5,
    editability: 4,
    tags: ['feTurbulence', 'Perlin Noise', 'Texture Synthesis', 'Grain', 'Shaders'],
    codeSnippet: `<filter id="noiseFilter">
  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
  <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 1  0 0 0 0 0  0 0 0 0.8 0"/>
</filter>`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="demo-turb" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0   0 1 0 0 0   0 0 0 0 0.4   1 0 0 0 0" in="noise" result="colored"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <rect x="25" y="25" width="250" height="130" rx="10" filter="url(#demo-turb)"/>
  <rect x="25" y="25" width="250" height="130" rx="10" fill="none" stroke="#00FF00" stroke-width="1.5"/>
  <text x="150" y="180" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">type="fractalNoise" baseFrequency="0.04"</text>
</svg>`,
  },
  {
    id: 'filter-displacement',
    name: 'feDisplacementMap Coordinate Warping',
    domain: 'filters',
    category: 'Shader & Filter FX',
    tagline: 'Pixel vector distortion using luminance channels',
    description: 'Uses the pixel values of an input texture (like feTurbulence) to displace the spatial coordinates of the target graphic. Generates liquid refraction, chromatic glitch aberration, glass ripple effects, and molten vector boundaries.',
    mathFormula: 'P\'(x, y) = P(x + \\text{scale} \\cdot (XC(x,y) - 0.5), y + \\text{scale} \\cdot (YC(x,y) - 0.5))',
    complexity: 'O(W · H) coordinate displacement lookup',
    bestFor: 'Liquid glass, cyber glitching, chromatic distortion and underwater caustics',
    tier: 'TIER 2',
    gpu: 'YES',
    fidelity: 5,
    editability: 3,
    tags: ['feDisplacementMap', 'Distortion', 'Glitch', 'Glass Refraction', 'Warping'],
    codeSnippet: `<filter id="glitchDisplace">
  <feTurbulence type="turbulence" baseFrequency="0.05 0.95" numOctaves="2" result="turb"/>
  <feDisplacementMap in="SourceGraphic" in2="turb" scale="25" xChannelSelector="R" yChannelSelector="G"/>
</filter>`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="demo-disp">
      <feTurbulence type="turbulence" baseFrequency="0.05 0.5" numOctaves="2" result="turb"/>
      <feDisplacementMap in="SourceGraphic" in2="turb" scale="18" xChannelSelector="R" yChannelSelector="B"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <g filter="url(#demo-disp)">
    <text x="150" y="105" fill="#00FF00" font-family="monospace" font-weight="900" font-size="38" text-anchor="middle" letter-spacing="4">VECTORA</text>
    <line x1="40" y1="125" x2="260" y2="125" stroke="#FF0055" stroke-width="4"/>
  </g>
  <text x="150" y="180" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">feDisplacementMap: scale="18" xChannel="R"</text>
</svg>`,
  },
  {
    id: 'filter-colormatrix',
    name: 'feColorMatrix RGBA Transformations',
    domain: 'filters',
    category: 'Color Manipulation',
    tagline: '5x4 channel linear transformation matrix',
    description: 'Multiplies every RGBA vector pixel by a 5x4 matrix. Enables instantaneous duotone recoloring, hue rotation, luminance-to-alpha conversion, contrast boosting, and brutalist color inversion without touching the underlying vector path markup.',
    mathFormula: '\\begin{bmatrix} R\' \\\\ G\' \\\\ B\' \\\\ A\' \\end{bmatrix} = \\begin{bmatrix} a_{00} & a_{01} & a_{02} & a_{03} & a_{04} \\\\ a_{10} & a_{11} & a_{12} & a_{13} & a_{14} \\\\ a_{20} & a_{21} & a_{22} & a_{23} & a_{24} \\\\ a_{30} & a_{31} & a_{32} & a_{33} & a_{34} \\end{bmatrix} \\begin{bmatrix} R \\\\ G \\\\ B \\\\ A \\\\ 1 \\end{bmatrix}',
    complexity: 'O(W · H) SIMD matrix transformation',
    bestFor: 'Duotone posterization, night vision LUTs, alpha thresholding and holographic color shifts',
    tier: 'TIER 1',
    gpu: 'YES',
    fidelity: 5,
    editability: 5,
    tags: ['feColorMatrix', 'Color Matrix', 'Duotone', 'Channel Arithmetic'],
    codeSnippet: `<filter id="acidDuotone">
  <feColorMatrix type="matrix" values="
    0.2  0.5  0.1  0  0
    0.9  0.9  0.2  0  0
    0.1  0.2  0.8  0  0
    0    0    0    1  0"/>
</filter>`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="demo-matrix">
      <feColorMatrix type="matrix" values="0.1 0.7 0.2 0 0   0.8 1.0 0.1 0 0   0.1 0.1 0.8 0 0   0 0 0 1 0"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Target shape with duotone matrix -->
  <g filter="url(#demo-matrix)">
    <circle cx="110" cy="90" r="50" fill="#FF5500"/>
    <rect x="130" y="50" width="80" height="80" fill="#00F0FF" fill-opacity="0.8"/>
  </g>
  <text x="150" y="180" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">5x4 Color Space Transformation Applied</text>
</svg>`,
  },
];

export const COLOR_ENTRIES: EncyclopediaEntry[] = [
  {
    id: 'color-oklab',
    name: 'Oklab & OKLCH Perceptual Uniformity',
    domain: 'color',
    category: 'Color Theory & Spaces',
    tagline: 'Perceptually linear lightness and chroma geometry',
    description: 'Designed by Björn Ottosson, Oklab models human visual perception with strict perceptual uniformity. Unlike sRGB or HSL, equal geometric steps in OKLCH space correspond to equal perceived color differences, avoiding the muddy yellows and desaturated purples of naive interpolation.',
    mathFormula: 'L = \\sqrt[3]{l_0}, \\quad a = 500(L - M), \\quad \\Delta E = \\sqrt{\\Delta L^2 + \\Delta a^2 + \\Delta b^2}',
    complexity: 'O(1) nonlinear color space conversion',
    bestFor: 'Harmonic gradient generation, procedural palette mutation, automated theme creation',
    tier: 'TIER 1',
    gpu: 'NO',
    fidelity: 5,
    editability: 5,
    tags: ['Oklab', 'OKLCH', 'Perceptual Color', 'Gradients', 'Color Science'],
    codeSnippet: `/* OKLCH Color Variable in CSS / SVG */
:root {
  --accent-light: oklch(0.85 0.28 142);
  --accent-deep:  oklch(0.35 0.22 142);
}`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="oklab-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00FF00"/>
      <stop offset="50%" stop-color="#00F0FF"/>
      <stop offset="100%" stop-color="#FF0055"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <rect x="25" y="45" width="250" height="50" rx="8" fill="url(#oklab-grad)"/>
  <!-- Color Step swatches -->
  <circle cx="50" cy="130" r="14" fill="#00FF00" stroke="#FFFFFF" stroke-width="1.5"/>
  <circle cx="100" cy="130" r="14" fill="#00FFAA" stroke="#FFFFFF" stroke-width="1.5"/>
  <circle cx="150" cy="130" r="14" fill="#00F0FF" stroke="#FFFFFF" stroke-width="1.5"/>
  <circle cx="200" cy="130" r="14" fill="#8800FF" stroke="#FFFFFF" stroke-width="1.5"/>
  <circle cx="250" cy="130" r="14" fill="#FF0055" stroke="#FFFFFF" stroke-width="1.5"/>
  <text x="150" y="180" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">OKLCH: Uniform Perceptual Lightness L=0.75</text>
</svg>`,
  },
  {
    id: 'color-wcag',
    name: 'WCAG 2.1 Contrast Ratio Algorithms',
    domain: 'color',
    category: 'Color Theory & Spaces',
    tagline: 'Mathematical accessibility & relative luminance',
    description: 'Calculates perceived contrast ratio (L1 + 0.05) / (L2 + 0.05) where L is relative luminance computed from linearized sRGB gamma curves. Ensures vector typography and iconography meet AA (4.5:1) and AAA (7:1) readability thresholds on dark terminals.',
    mathFormula: 'CR = \\frac{L_1 + 0.05}{L_2 + 0.05}, \\quad L = 0.2126 R_{lin} + 0.7152 G_{lin} + 0.0722 B_{lin}',
    complexity: 'O(1) luminance arithmetic',
    bestFor: 'Terminal text legibility, UI controls, high-contrast print, compliance auditing',
    tier: 'TIER 1',
    gpu: 'NO',
    fidelity: 5,
    editability: 5,
    tags: ['WCAG', 'Contrast Ratio', 'Luminance', 'Accessibility', 'Color Science'],
    codeSnippet: `// Relative Luminance formula (sRGB)
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [R, G, B] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- AAA Block -->
  <rect x="30" y="40" width="110" height="90" rx="8" fill="#141414" stroke="#00FF00" stroke-width="1.5"/>
  <text x="85" y="75" fill="#00FF00" font-family="monospace" font-weight="bold" font-size="14" text-anchor="middle">AAA PASS</text>
  <text x="85" y="105" fill="#00FF00" font-family="monospace" font-size="11" text-anchor="middle">14.2:1 Ratio</text>
  <!-- AA Block -->
  <rect x="160" y="40" width="110" height="90" rx="8" fill="#141414" stroke="#FFB800" stroke-width="1.5"/>
  <text x="215" y="75" fill="#FFB800" font-family="monospace" font-weight="bold" font-size="14" text-anchor="middle">AA PASS</text>
  <text x="215" y="105" fill="#FFB800" font-family="monospace" font-size="11" text-anchor="middle">6.8:1 Ratio</text>
  <text x="150" y="175" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">Calculated via IEC 61966-2-1 Gamma Linearization</text>
</svg>`,
  },
];

export const STANDARDS_ENTRIES: EncyclopediaEntry[] = [
  {
    id: 'std-inkscape',
    name: 'Inkscape Layer Specification Doctrine',
    domain: 'standards',
    category: 'Engineering Standards',
    tagline: 'Standardized XML grouping & layer preservation',
    description: 'VECTORA enforces standardized Inkscape XML namespaces (xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape") with <g inkscape:groupmode="layer" inkscape:label="NN_Name">. Enables bi-directional interchange between Figma, Illustrator, Inkscape, and web DOM editors without layer flattening.',
    bestFor: 'CAD schematics, architectural drawings, modular character rigs and professional vector design',
    tier: 'TIER 1',
    gpu: 'NO',
    fidelity: 5,
    editability: 5,
    tags: ['Inkscape', 'Layers', 'XML Namespaces', 'Architecture', 'Standards'],
    codeSnippet: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
  <g inkscape:groupmode="layer" inkscape:label="01_Background" id="layer-bg">
    <!-- Background vector elements -->
  </g>
  <g inkscape:groupmode="layer" inkscape:label="02_Foreground" id="layer-fg">
    <!-- Foreground vector elements -->
  </g>
</svg>`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Stacked layer representation -->
  <g transform="translate(40, 20)">
    <polygon points="110,20 200,50 110,80 20,50" fill="#181818" stroke="#00FF00" stroke-width="1.5"/>
    <text x="110" y="55" fill="#00FF00" font-family="monospace" font-size="9" text-anchor="middle">03_FOREGROUND</text>
  </g>
  <g transform="translate(40, 50)">
    <polygon points="110,20 200,50 110,80 20,50" fill="#141414" stroke="#00F0FF" stroke-width="1.5"/>
    <text x="110" y="55" fill="#00F0FF" font-family="monospace" font-size="9" text-anchor="middle">02_MIDDLEGROUND</text>
  </g>
  <g transform="translate(40, 80)">
    <polygon points="110,20 200,50 110,80 20,50" fill="#101010" stroke="#FFB800" stroke-width="1.5"/>
    <text x="110" y="55" fill="#FFB800" font-family="monospace" font-size="9" text-anchor="middle">01_BACKGROUND</text>
  </g>
  <text x="150" y="180" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">inkscape:groupmode="layer" inkscape:label="..."</text>
</svg>`,
  },
  {
    id: 'std-security',
    name: 'SVG Sanitization & Defense Gate',
    domain: 'standards',
    category: 'Engineering Standards',
    tagline: 'DOMParser AST cleansing & XSS vector immunization',
    description: 'Rigorous multi-stage client and server defense gate. Strips dangerous elements (<script>, <iframe>, <foreignObject>, <object>, <embed>), neutralizes event handler attributes (onload, onerror, onclick), disallows external URL xlink/href targets, and prevents XML External Entity (XXE) expansion while preserving all vector geometry, filters, clipPaths, and CSS keyframe animations.',
    bestFor: 'Secure preview rendering, multi-user asset sharing, zero-trust importing and safe exports',
    tier: 'TIER 1',
    gpu: 'NO',
    fidelity: 5,
    editability: 5,
    tags: ['Security', 'Sanitization', 'XSS Prevention', 'XXE Defense', 'DOMPurify'],
    codeSnippet: `// VECTORA Authoritative Sanitizer Schema
const BLOCKED_TAGS = ['script', 'iframe', 'object', 'embed', 'foreignObject'];
const BLOCKED_ATTRS_PREFIX = ['on']; // onerror, onload, etc.
// Cleaned safely through DOMParser AST transformation`,
    liveSvgPreview: `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Shield Icon Graphic -->
  <path d="M 150 35 L 210 65 L 210 115 C 210 145 150 165 150 165 C 150 165 90 145 90 115 L 90 65 Z" fill="#00FF00" fill-opacity="0.1" stroke="#00FF00" stroke-width="2.5" filter="drop-shadow(0 0 10px rgba(0,255,0,0.5))"/>
  <path d="M 130 100 L 145 115 L 175 80" fill="none" stroke="#00FF00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="150" y="185" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">100% SECURE VECTOR AST PIPELINE</text>
</svg>`,
  },
];
