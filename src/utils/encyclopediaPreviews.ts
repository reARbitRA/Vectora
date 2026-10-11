/**
 * Live SVG Generators and Code Snippets for Encyclopedia Entries
 */

import { injectExtendedAnimation } from './animations';

const SAMPLE_DIAL_SVG = `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <g id="demo-glyph" transform="translate(150, 100)">
    <!-- Base Rings -->
    <circle cx="0" cy="0" r="65" fill="none" stroke="#222222" stroke-width="2"/>
    <circle cx="0" cy="0" r="50" fill="none" stroke="#00FF00" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="0" cy="0" r="35" fill="#00FF00" fill-opacity="0.1" stroke="#00FF00" stroke-width="2"/>
    <!-- Core Crosshairs & Glyphs -->
    <line x1="-70" y1="0" x2="70" y2="0" stroke="#00FF00" stroke-width="1" stroke-opacity="0.5"/>
    <line x1="0" y1="-70" x2="0" y2="70" stroke="#00FF00" stroke-width="1" stroke-opacity="0.5"/>
    <polygon points="0,-25 22,12 -22,12" fill="#00F0FF" fill-opacity="0.2" stroke="#00F0FF" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="5" fill="#FF0055"/>
  </g>
</svg>`;

export function getAnimationLiveSvg(presetId: string): string {
  try {
    return injectExtendedAnimation(SAMPLE_DIAL_SVG, {
      enabled: true,
      preset: presetId as any,
      duration: 3.5,
      speed: 1,
      easing: 'ease-in-out',
      direction: 'normal',
      iterationCount: 'infinite',
      loopMode: 'infinite',
      motionTrail: false,
      motionTrailCount: 3,
      motionTrailOpacity: 0.35,
      autoBake: false,
      isPaused: false,
      layerOverrides: {},
    });
  } catch (e) {
    return SAMPLE_DIAL_SVG;
  }
}

export function getVectorizationLiveSvg(techId: string): string {
  switch (techId) {
    case 'centerline':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Original ghost silhouette -->
  <path d="M 60 140 Q 150 40 240 140 Q 150 110 60 140 Z" fill="#222222" opacity="0.4"/>
  <!-- 1px Topological Medial Axis Skeleton -->
  <path d="M 60 140 Q 150 40 240 140" fill="none" stroke="#00FF00" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="60" cy="140" r="4" fill="#00FF00"/>
  <circle cx="150" cy="90" r="3.5" fill="#FFFFFF"/>
  <circle cx="240" cy="140" r="4" fill="#00FF00"/>
  <text x="150" y="175" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">Otsu → Zhang-Suen 8-Connectivity → RDP</text>
</svg>`;

    case 'region':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Crisp Closed Boundary with Hole (Even-Odd) -->
  <path d="M 80 50 L 220 50 L 220 150 L 80 150 Z M 120 80 L 180 80 L 180 120 L 120 120 Z" fill="#00FF00" fill-rule="evenodd" stroke="#FFFFFF" stroke-width="1.5" filter="drop-shadow(0 0 10px rgba(0,255,0,0.4))"/>
  <text x="150" y="180" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">Moore-Neighbor Contour with Hole Detection</text>
</svg>`;

    case 'color-quantize':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- K-Means 4 Dominant Color Layers -->
  <circle cx="150" cy="100" r="65" fill="#181818" stroke="#333333" stroke-width="1"/>
  <path d="M 150 40 A 60 60 0 0 1 210 100 L 150 100 Z" fill="#00FF00"/>
  <path d="M 210 100 A 60 60 0 0 1 150 160 L 150 100 Z" fill="#00F0FF"/>
  <path d="M 150 160 A 60 60 0 0 1 90 100 L 150 100 Z" fill="#FF0055"/>
  <path d="M 90 100 A 60 60 0 0 1 150 40 L 150 100 Z" fill="#FFB800"/>
  <text x="150" y="180" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">K-Means Cluster Posterization (4 Palette Layers)</text>
</svg>`;

    case 'delaunay':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Triangulation faces -->
  <polygon points="50,150 150,30 250,150" fill="#00FF00" fill-opacity="0.15" stroke="#00FF00" stroke-width="1.5"/>
  <polygon points="50,150 150,110 150,30" fill="#00F0FF" fill-opacity="0.2" stroke="#00F0FF" stroke-width="1.5"/>
  <polygon points="150,30 150,110 250,150" fill="#FFB800" fill-opacity="0.2" stroke="#FFB800" stroke-width="1.5"/>
  <polygon points="50,150 150,110 150,170" fill="#FF0055" fill-opacity="0.25" stroke="#FF0055" stroke-width="1.5"/>
  <polygon points="250,150 150,110 150,170" fill="#00FF00" fill-opacity="0.3" stroke="#00FF00" stroke-width="1.5"/>
  <!-- Vertices -->
  <circle cx="50" cy="150" r="3" fill="#FFFFFF"/>
  <circle cx="150" cy="30" r="3" fill="#FFFFFF"/>
  <circle cx="250" cy="150" r="3" fill="#FFFFFF"/>
  <circle cx="150" cy="110" r="3" fill="#FFFFFF"/>
  <circle cx="150" cy="170" r="3" fill="#FFFFFF"/>
  <text x="150" y="190" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">Bowyer-Watson Circumcircle Triangulation</text>
</svg>`;

    case 'halftone':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Halftone Dot Grid with variable radii -->
  <g fill="#00FF00">
    <!-- Row 1 -->
    <circle cx="60" cy="40" r="2"/> <circle cx="90" cy="40" r="3"/> <circle cx="120" cy="40" r="5"/> <circle cx="150" cy="40" r="7"/> <circle cx="180" cy="40" r="5"/> <circle cx="210" cy="40" r="3"/> <circle cx="240" cy="40" r="2"/>
    <!-- Row 2 -->
    <circle cx="60" cy="70" r="3"/> <circle cx="90" cy="70" r="6"/> <circle cx="120" cy="70" r="9"/> <circle cx="150" cy="70" r="12"/> <circle cx="180" cy="70" r="9"/> <circle cx="210" cy="70" r="6"/> <circle cx="240" cy="70" r="3"/>
    <!-- Row 3 -->
    <circle cx="60" cy="100" r="4"/> <circle cx="90" cy="100" r="8"/> <circle cx="120" cy="100" r="13"/> <circle cx="150" cy="100" r="16"/> <circle cx="180" cy="100" r="13"/> <circle cx="210" cy="100" r="8"/> <circle cx="240" cy="100" r="4"/>
    <!-- Row 4 -->
    <circle cx="60" cy="130" r="3"/> <circle cx="90" cy="130" r="6"/> <circle cx="120" cy="130" r="9"/> <circle cx="150" cy="130" r="12"/> <circle cx="180" cy="130" r="9"/> <circle cx="210" cy="130" r="6"/> <circle cx="240" cy="130" r="3"/>
    <!-- Row 5 -->
    <circle cx="60" cy="160" r="2"/> <circle cx="90" cy="160" r="3"/> <circle cx="120" cy="160" r="5"/> <circle cx="150" cy="160" r="7"/> <circle cx="180" cy="160" r="5"/> <circle cx="210" cy="160" r="3"/> <circle cx="240" cy="160" r="2"/>
  </g>
  <text x="150" y="190" fill="#888888" font-family="monospace" font-size="9" text-anchor="middle">Luminance-Sampled Cartesian Dot Matrix</text>
</svg>`;

    case 'voronoi-stipple':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Stipple Points (Simulated Lloyd relaxation) -->
  <g fill="#00FF00">
    <circle cx="150" cy="100" r="1.5"/><circle cx="154" cy="98" r="1.5"/><circle cx="147" cy="104" r="1.5"/><circle cx="152" cy="106" r="1.5"/><circle cx="145" cy="95" r="1.5"/>
    <circle cx="158" cy="103" r="1.5"/><circle cx="142" cy="102" r="1.5"/><circle cx="151" cy="92" r="1.5"/><circle cx="160" cy="95" r="1.5"/><circle cx="140" cy="97" r="1.5"/>
    <circle cx="163" cy="108" r="1.5"/><circle cx="137" cy="105" r="1.5"/><circle cx="155" cy="112" r="1.5"/><circle cx="145" cy="110" r="1.5"/><circle cx="150" cy="85" r="1.5"/>
    <circle cx="135" cy="90" r="1.5"/><circle cx="165" cy="90" r="1.5"/><circle cx="170" cy="102" r="1.5"/><circle cx="130" cy="100" r="1.5"/><circle cx="150" cy="118" r="1.5"/>
    <!-- Outer sparser ring -->
    <circle cx="120" cy="85" r="1.2"/><circle cx="180" cy="85" r="1.2"/><circle cx="120" cy="115" r="1.2"/><circle cx="180" cy="115" r="1.2"/>
    <circle cx="100" cy="100" r="1"/><circle cx="200" cy="100" r="1"/><circle cx="150" cy="65" r="1"/><circle cx="150" cy="135" r="1"/>
  </g>
  <circle cx="150" cy="100" r="50" fill="none" stroke="#222222" stroke-dasharray="2,4"/>
  <text x="150" y="175" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">Weighted Lloyd Relaxation Stippling</text>
</svg>`;

    case 'contour':
    case 'marching-squares':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Topographic Isolines -->
  <path d="M 50 100 Q 150 20 250 100 Q 150 180 50 100 Z" fill="none" stroke="#00FF00" stroke-width="1" stroke-opacity="0.3"/>
  <path d="M 75 100 Q 150 40 225 100 Q 150 160 75 100 Z" fill="none" stroke="#00FF00" stroke-width="1.2" stroke-opacity="0.5"/>
  <path d="M 100 100 Q 150 60 200 100 Q 150 140 100 100 Z" fill="none" stroke="#00FF00" stroke-width="1.5" stroke-opacity="0.75"/>
  <path d="M 125 100 Q 150 80 175 100 Q 150 120 125 100 Z" fill="#00FF00" fill-opacity="0.15" stroke="#00FF00" stroke-width="2"/>
  <text x="150" y="180" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">16-Case Marching Squares Iso-Luminance</text>
</svg>`;

    case 'cross-hatch':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Crosshatch 45 deg -->
  <g stroke="#00FF00" stroke-width="1.2" opacity="0.8">
    <line x1="80" y1="120" x2="140" y2="60"/>
    <line x1="90" y1="130" x2="160" y2="60"/>
    <line x1="100" y1="140" x2="180" y2="60"/>
    <line x1="120" y1="140" x2="200" y2="60"/>
    <line x1="140" y1="140" x2="220" y2="60"/>
  </g>
  <!-- Crosshatch -45 deg (shadow layer) -->
  <g stroke="#00FF00" stroke-width="1.2" opacity="0.6">
    <line x1="110" y1="60" x2="170" y2="120"/>
    <line x1="125" y1="60" x2="185" y2="120"/>
    <line x1="140" y1="60" x2="200" y2="120"/>
    <line x1="155" y1="60" x2="215" y2="120"/>
  </g>
  <rect x="90" y="60" width="120" height="80" fill="none" stroke="#FFFFFF" stroke-width="1"/>
  <text x="150" y="175" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">4-Layer Intaglio Etching (45°, -45°, 0°, 90°)</text>
</svg>`;

    case 'tsp-single-line':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- Continuous unbroken path -->
  <path d="M 60 100 L 90 60 L 120 130 L 150 50 L 180 140 L 210 70 L 240 100 L 210 130 L 180 80 L 150 150 L 120 70 L 90 140 Z" fill="none" stroke="#00FF00" stroke-width="2" stroke-linejoin="round" filter="drop-shadow(0 0 8px rgba(0,255,0,0.5))"/>
  <text x="150" y="180" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">Unbroken Traveling Salesperson Tour (1 Continuous Path)</text>
</svg>`;

    case 'canny-blueprint':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#050D1A"/>
  <!-- Grid -->
  <line x1="30" y1="100" x2="270" y2="100" stroke="#00F0FF" stroke-width="0.5" stroke-opacity="0.3"/>
  <line x1="150" y1="20" x2="150" y2="180" stroke="#00F0FF" stroke-width="0.5" stroke-opacity="0.3"/>
  <!-- Edges -->
  <rect x="70" y="45" width="160" height="90" fill="none" stroke="#00F0FF" stroke-width="1.5" stroke-dasharray="8,4"/>
  <circle cx="150" cy="90" r="30" fill="none" stroke="#00F0FF" stroke-width="1.5"/>
  <text x="75" y="40" fill="#00F0FF" font-family="monospace" font-size="9">[CANNY_EDGE: 0x88F2]</text>
  <text x="150" y="170" fill="#00F0FF" font-family="monospace" font-size="10" text-anchor="middle">Sobel Gradient + Non-Maximum Suppression Hysteresis</text>
</svg>`;

    case 'isometric-voxel':
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <!-- 3D Isometric Voxel Cube -->
  <g transform="translate(150, 90)">
    <!-- Top face -->
    <polygon points="0,-40 35,-20 0,0 -35,-20" fill="#00FF00" stroke="#FFFFFF" stroke-width="1"/>
    <!-- Left face -->
    <polygon points="-35,-20 0,0 0,40 -35,20" fill="#00AA00" stroke="#FFFFFF" stroke-width="1"/>
    <!-- Right face -->
    <polygon points="0,0 35,-20 35,20 0,40" fill="#006600" stroke="#FFFFFF" stroke-width="1"/>
  </g>
  <text x="150" y="175" fill="#00FF00" font-family="monospace" font-size="10" text-anchor="middle">2.5D Isometric Shaded Orthogonal Cube Projection</text>
</svg>`;

    default:
      return `<svg viewBox="0 0 300 200" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <circle cx="150" cy="90" r="45" fill="none" stroke="#00FF00" stroke-width="2"/>
  <text x="150" y="95" fill="#00FF00" font-family="monospace" font-size="11" text-anchor="middle">VECTORA</text>
  <text x="150" y="175" fill="#888888" font-family="monospace" font-size="10" text-anchor="middle">Algorithmic Vector Engine</text>
</svg>`;
  }
}
