import { VectorArtwork } from '../types';

export const MASTERPIECES: VectorArtwork[] = [
  {
    id: 'swiss-chrono-1968',
    title: 'The Swiss Chrono 1968',
    subtitle: 'International Typographic Movement & Precision Horology',
    concept: 'A modernist celebration of Swiss grid discipline and horological precision. Built with strict mathematical radius intervals, concentric vernier scales, high-contrast Swiss Red accents, and balanced negative space.',
    style: 'Swiss / International',
    viewBox: '0 0 1000 1000',
    palette: [
      { name: 'Onyx Carbon', hex: '#0f1115', role: 'background' },
      { name: 'Swiss Vermilion', hex: '#e63946', role: 'accent' },
      { name: 'Graphite Gauge', hex: '#242833', role: 'surface' },
      { name: 'Pure Titanium', hex: '#f1faee', role: 'ink' },
      { name: 'Cool Slate 400', hex: '#94a3b8', role: 'secondary' },
    ],
    layers: [
      { name: '01_Background', description: 'Deep slate matte surface with technical micro-grid lines' },
      { name: '02_Base_Dial', description: 'Beveled concentric tachymeter rings and calibration tracks' },
      { name: '03_Chronograph_Gauges', description: 'Sub-dial dual accumulators at 120-degree intervals' },
      { name: '04_Hands_and_Accents', description: 'Precision vermilion indicator needles, hour markers, and center pivot' },
      { name: '05_Typography_and_HUD', description: 'High-contrast Swiss typography and geometric registration marks' },
      { name: '06_Optical_Glass_FX', description: 'Specular gradient sheen simulating sapphire crystal dome' },
    ],
    evolutionIdeas: [
      'Animate the chronograph second hand with a continuous 60-second linear rotation loop',
      'Swap to a Bauhaus tri-color palette with cobalt blue and cadmium yellow sub-dials',
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 1000 1000" role="img" aria-label="The Swiss Chrono 1968 Vector Poster">
  <title>The Swiss Chrono 1968</title>
  <desc>Precision Swiss International horological vector illustration with technical vernier dials and vermilion accents.</desc>
  <defs>
    <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1f2430" />
      <stop offset="85%" stop-color="#0e1117" />
      <stop offset="100%" stop-color="#080a0f" />
    </radialGradient>
    <linearGradient id="bezelMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a5568" />
      <stop offset="35%" stop-color="#1a202c" />
      <stop offset="70%" stop-color="#718096" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="redAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff4b5c" />
      <stop offset="100%" stop-color="#d90429" />
    </linearGradient>
    <linearGradient id="glassRefract" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.02" />
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0.0" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.1" />
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.75" />
    </filter>
    <filter id="needleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ff4b5c" flood-opacity="0.6" />
    </filter>
    <pattern id="microGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#242b3b" stroke-width="0.75" stroke-opacity="0.4" />
    </pattern>
  </defs>
  <style>
    .brand-primary { fill: #e63946; stroke: none; }
    .brand-ink { fill: #f1faee; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
    .sub-tech { fill: #94a3b8; font-family: 'Fira Code', monospace; font-size: 11px; letter-spacing: 2px; }
    .gauge-ring { fill: none; stroke: #334155; stroke-width: 1.5; }
    .major-tick { stroke: #f1faee; stroke-width: 3.5; stroke-linecap: round; }
    .minor-tick { stroke: #64748b; stroke-width: 1.5; }
  </style>

  <!-- 01_Background -->
  <g id="layer-01-bg" inkscape:groupmode="layer" inkscape:label="01_Background">
    <rect width="1000" height="1000" fill="#0b0d13" />
    <rect width="1000" height="1000" fill="url(#microGrid)" />
    <!-- Poster Swiss Framing Lines -->
    <line x1="80" y1="80" x2="920" y2="80" stroke="#242b3b" stroke-width="1.5" />
    <line x1="80" y1="920" x2="920" y2="920" stroke="#242b3b" stroke-width="1.5" />
    <line x1="80" y1="80" x2="80" y2="920" stroke="#242b3b" stroke-width="1.5" />
    <line x1="920" y1="80" x2="920" y2="920" stroke="#242b3b" stroke-width="1.5" />
    <!-- Swiss Cross Registration Marks -->
    <path d="M 80 500 L 920 500 M 500 80 L 500 920" stroke="#1e2533" stroke-width="1" stroke-dasharray="4 8" />
  </g>

  <!-- 02_Base_Dial -->
  <g id="layer-02-dial" inkscape:groupmode="layer" inkscape:label="02_Base_Dial">
    <!-- Outer Bezel Ring -->
    <circle cx="500" cy="500" r="380" fill="url(#bezelMetal)" filter="url(#softShadow)" />
    <circle cx="500" cy="500" r="365" fill="#0e1117" stroke="#334155" stroke-width="2" />
    <circle cx="500" cy="500" r="345" fill="url(#dialGlow)" />
    <circle cx="500" cy="500" r="330" class="gauge-ring" stroke-dasharray="2 4" />
    
    <!-- Tachymeter Scale Ring -->
    <circle cx="500" cy="500" r="290" fill="none" stroke="#1e293b" stroke-width="45" />
    <circle cx="500" cy="500" r="268" class="gauge-ring" />
    <circle cx="500" cy="500" r="312" class="gauge-ring" />

    <!-- 60 Minute Hour Calibration Ticks -->
    <!-- 12 Hours Large Ticks -->
    <g transform="translate(500,500)">
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(30)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(60)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(90)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(120)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(150)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(180)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(210)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(240)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(270)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(300)" />
      <line x1="0" y1="-312" x2="0" y2="-268" class="major-tick" transform="rotate(330)" />
      
      <!-- Sub-Minute Fine Ticks -->
      <g stroke="#64748b" stroke-width="1.2">
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(6)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(12)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(18)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(24)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(36)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(42)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(48)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(54)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(66)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(72)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(78)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(84)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(96)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(102)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(108)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(114)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(126)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(132)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(138)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(144)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(156)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(162)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(168)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(174)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(186)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(192)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(198)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(204)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(216)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(222)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(228)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(234)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(246)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(252)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(258)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(264)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(276)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(282)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(288)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(294)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(306)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(312)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(318)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(324)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(336)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(342)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(348)" />
        <line x1="0" y1="-300" x2="0" y2="-280" transform="rotate(354)" />
      </g>
    </g>
  </g>

  <!-- 03_Sub_Dials -->
  <g id="layer-03-subdials" inkscape:groupmode="layer" inkscape:label="03_Sub_Dials">
    <!-- Subdial Left: 9 o'clock -->
    <g transform="translate(360, 500)">
      <circle cx="0" cy="0" r="75" fill="#131722" stroke="#2a3346" stroke-width="1.5" />
      <circle cx="0" cy="0" r="62" fill="none" stroke="#1f2637" stroke-dasharray="1 3" />
      <line x1="0" y1="-62" x2="0" y2="-52" stroke="#94a3b8" stroke-width="2" />
      <line x1="62" y1="0" x2="52" y2="0" stroke="#94a3b8" stroke-width="2" />
      <line x1="0" y1="62" x2="0" y2="52" stroke="#94a3b8" stroke-width="2" />
      <line x1="-62" y1="0" x2="-52" y2="0" stroke="#94a3b8" stroke-width="2" />
      <text x="0" y="-30" class="sub-tech" text-anchor="middle" font-size="9">60</text>
      <text x="0" y="42" class="sub-tech" text-anchor="middle" font-size="9">30</text>
      <!-- Subdial Needle -->
      <line x1="0" y1="8" x2="-38" y2="-38" stroke="#f1faee" stroke-width="2" stroke-linecap="round" />
      <circle cx="0" cy="0" r="4" fill="#ff4b5c" />
    </g>

    <!-- Subdial Right: 3 o'clock -->
    <g transform="translate(640, 500)">
      <circle cx="0" cy="0" r="75" fill="#131722" stroke="#2a3346" stroke-width="1.5" />
      <circle cx="0" cy="0" r="62" fill="none" stroke="#1f2637" stroke-dasharray="1 3" />
      <line x1="0" y1="-62" x2="0" y2="-52" stroke="#94a3b8" stroke-width="2" />
      <line x1="62" y1="0" x2="52" y2="0" stroke="#94a3b8" stroke-width="2" />
      <line x1="0" y1="62" x2="0" y2="52" stroke="#94a3b8" stroke-width="2" />
      <line x1="-62" y1="0" x2="-52" y2="0" stroke="#94a3b8" stroke-width="2" />
      <text x="0" y="-30" class="sub-tech" text-anchor="middle" font-size="9">12</text>
      <text x="0" y="42" class="sub-tech" text-anchor="middle" font-size="9">06</text>
      <!-- Subdial Needle -->
      <line x1="0" y1="8" x2="42" y2="-20" stroke="#f1faee" stroke-width="2" stroke-linecap="round" />
      <circle cx="0" cy="0" r="4" fill="#ff4b5c" />
    </g>
  </g>

  <!-- 04_Hands_and_Accents -->
  <g id="layer-04-hands" inkscape:groupmode="layer" inkscape:label="04_Hands_and_Accents">
    <g transform="translate(500,500)">
      <!-- Hour Hand (Geometric Modernist Skeleton) -->
      <g transform="rotate(78)">
        <polygon points="-8,18 8,18 6,-160 0,-180 -6,-160" fill="#f1faee" />
        <polygon points="-3,-20 3,-20 2,-145 0,-155 -2,-145" fill="#0f1115" />
        <circle cx="0" cy="-110" r="4" fill="#ff4b5c" />
      </g>
      
      <!-- Minute Hand (Long Tapered Lance) -->
      <g transform="rotate(320)">
        <polygon points="-6,24 6,24 4,-240 0,-265 -4,-240" fill="#f1faee" filter="url(#softShadow)" />
        <line x1="0" y1="-40" x2="0" y2="-220" stroke="#0e1117" stroke-width="2" />
        <rect x="-2" y="-190" width="4" height="25" fill="#ff4b5c" />
      </g>

      <!-- Chronograph Master Seconds Vector (Vermilion) -->
      <g transform="rotate(212)" filter="url(#needleGlow)">
        <line x1="0" y1="65" x2="0" y2="-290" stroke="url(#redAccent)" stroke-width="2.5" stroke-linecap="round" />
        <!-- Counter-Weight Geometry -->
        <circle cx="0" cy="38" r="9" fill="none" stroke="#e63946" stroke-width="2" />
        <rect x="-2.5" y="47" width="5" height="20" fill="#e63946" />
        <!-- Arrowhead -->
        <polygon points="-5,-275 5,-275 0,-295" fill="#e63946" />
      </g>

      <!-- Center Collet / Cap -->
      <circle cx="0" cy="0" r="14" fill="#0e1117" stroke="#4a5568" stroke-width="2" />
      <circle cx="0" cy="0" r="7" fill="#ff4b5c" />
      <circle cx="0" cy="0" r="2.5" fill="#f1faee" />
    </g>
  </g>

  <!-- 05_Typography_and_HUD -->
  <g id="layer-05-typography" inkscape:groupmode="layer" inkscape:label="05_Typography_and_HUD">
    <!-- Dial Typography -->
    <text x="500" y="380" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20" fill="#f1faee" letter-spacing="4">HELVETIA</text>
    <text x="500" y="405" text-anchor="middle" class="sub-tech" font-size="10">AUTOMATIC CHRONO // 28,800 A/h</text>
    <text x="500" y="625" text-anchor="middle" class="sub-tech" fill="#e63946" font-weight="700">SWISS MADE</text>

    <!-- Poster Frame Editorial Data -->
    <text x="100" y="125" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="28" fill="#f1faee" letter-spacing="-0.5">CHRONOGRAPH 1968</text>
    <text x="100" y="148" class="sub-tech">PRECISION HOROLOGY // REF. 09-SW-CH</text>
    
    <text x="900" y="125" text-anchor="end" class="sub-tech" font-size="14" fill="#f1faee">MOD. GRID 01</text>
    <text x="900" y="148" text-anchor="end" class="sub-tech">CALIBRE 11-V</text>

    <!-- Footer Specs -->
    <text x="100" y="875" class="sub-tech">COORDINATES 47°08'N 06°55'E</text>
    <text x="100" y="895" class="sub-tech">INTERNATIONAL TYPOGRAPHIC STYLE</text>
    
    <text x="900" y="875" text-anchor="end" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="14" fill="#e63946">VECTORA STUDIO</text>
    <text x="900" y="895" text-anchor="end" class="sub-tech">EDITION 01/50 // STANDARDS VERIFIED</text>
  </g>

  <!-- 06_Optical_Glass_FX -->
  <g id="layer-06-fx" inkscape:groupmode="layer" inkscape:label="06_Optical_Glass_FX" pointer-events="none">
    <ellipse cx="440" cy="420" rx="310" ry="260" fill="url(#glassRefract)" transform="rotate(-25 440 420)" />
  </g>
</svg>`,
  },
  {
    id: 'metropolis-deco-1928',
    title: 'Metropolis Deco Empire',
    subtitle: 'Art Deco Geometric Monogram & Sunburst Architecture',
    concept: 'A luxurious tribute to 1920s Art Deco and machine-age optimism. Symmetrical stepped chevron towers, multi-stop gold leaf gradients, radiant sunburst rays, and polished geometric arches.',
    style: 'Art Deco',
    viewBox: '0 0 1000 1000',
    palette: [
      { name: 'Onyx Midnight', hex: '#0a0d14', role: 'background' },
      { name: 'Imperial Gold', hex: '#d4af37', role: 'primary' },
      { name: 'Pale Champagne', hex: '#f9f1d8', role: 'accent' },
      { name: 'Bronze Antique', hex: '#8c6d32', role: 'surface' },
      { name: 'Obsidian Sheen', hex: '#161c28', role: 'secondary' },
    ],
    layers: [
      { name: '01_Background', description: 'Deep obsidian backdrop with radial sunburst flare rays' },
      { name: '02_Stepped_Portals', description: 'Concentric chevron arches and graduated architectural towers' },
      { name: '03_Geometric_Monogram', description: 'Central interlaced faceted diamond emblem with gold filigree' },
      { name: '04_Filigree_and_Ornaments', description: 'Micro-scalloped art deco crests, border medallions, and chevron pillars' },
      { name: '05_Gilded_Typography', description: 'High-luxury geometric serif typography and framing filigree' },
    ],
    evolutionIdeas: [
      'Generate a silver-platinum duotone variation for a Gotham moonlight aesthetic',
      'Add animated shimmer along the gold gradients using an SVG linearGradient x1/x2 sweep',
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 1000 1000" role="img" aria-label="Metropolis Deco Empire Vector Emblem">
  <title>Metropolis Deco Empire</title>
  <desc>Gilded Art Deco vector emblem featuring stepped chevron architecture, radiant sunburst rays, and diamond filigree.</desc>
  <defs>
    <linearGradient id="goldPure" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8c6d32" />
      <stop offset="30%" stop-color="#d4af37" />
      <stop offset="50%" stop-color="#fdf6e2" />
      <stop offset="70%" stop-color="#d4af37" />
      <stop offset="100%" stop-color="#694f1c" />
    </linearGradient>
    <linearGradient id="goldVertical" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fdf6e2" />
      <stop offset="40%" stop-color="#d4af37" />
      <stop offset="80%" stop-color="#735622" />
      <stop offset="100%" stop-color="#3b2b10" />
    </linearGradient>
    <radialGradient id="sunburstCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.35" />
      <stop offset="40%" stop-color="#8c6d32" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#0a0d14" stop-opacity="0" />
    </radialGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>
  <style>
    .gold-stroke { stroke: url(#goldPure); fill: none; }
    .gold-fill { fill: url(#goldPure); }
    .deco-text { font-family: 'Cinzel', serif; fill: url(#goldPure); letter-spacing: 6px; }
  </style>

  <!-- 01_Background -->
  <g id="layer-01-bg" inkscape:groupmode="layer" inkscape:label="01_Background">
    <rect width="1000" height="1000" fill="#080a10" />
    <circle cx="500" cy="500" r="420" fill="url(#sunburstCore)" />
    
    <!-- Sunburst Radiance Rays (24 Symmetrical Geometric Cones) -->
    <g transform="translate(500,500)" opacity="0.35" stroke="url(#goldPure)" stroke-width="0.8">
      <line x1="0" y1="0" x2="0" y2="-440" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(15)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(30)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(45)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(60)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(75)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(90)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(105)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(120)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(135)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(150)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(165)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(180)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(195)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(210)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(225)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(240)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(255)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(270)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(285)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(300)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(315)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(330)" />
      <line x1="0" y1="0" x2="0" y2="-440" transform="rotate(345)" />
    </g>

    <!-- Outer Double Border with Corner Insets -->
    <rect x="70" y="70" width="860" height="860" class="gold-stroke" stroke-width="2" />
    <rect x="85" y="85" width="830" height="830" class="gold-stroke" stroke-width="1" stroke-dasharray="8 4" />
    <rect x="100" y="100" width="800" height="800" class="gold-stroke" stroke-width="1.5" />
    
    <!-- Corner Chevron Ornaments -->
    <g stroke="url(#goldPure)" stroke-width="2" fill="none">
      <!-- Top Left -->
      <path d="M 70 140 L 140 140 L 140 70 M 85 155 L 155 155 L 155 85" />
      <!-- Top Right -->
      <path d="M 930 140 L 860 140 L 860 70 M 915 155 L 845 155 L 845 85" />
      <!-- Bottom Left -->
      <path d="M 70 860 L 140 860 L 140 930 M 85 845 L 155 845 L 155 915" />
      <!-- Bottom Right -->
      <path d="M 930 860 L 860 860 L 860 930 M 915 845 L 845 845 L 845 915" />
    </g>
  </g>

  <!-- 02_Stepped_Portals -->
  <g id="layer-02-portals" inkscape:groupmode="layer" inkscape:label="02_Stepped_Portals" filter="url(#goldGlow)">
    <!-- Main Center Deco Arch -->
    <path d="M 320 740 L 320 420 A 180 180 0 0 1 680 420 L 680 740 Z" fill="#101520" stroke="url(#goldPure)" stroke-width="3" />
    <!-- Nested Arch 2 -->
    <path d="M 350 740 L 350 430 A 150 150 0 0 1 650 430 L 650 740 Z" fill="none" stroke="url(#goldPure)" stroke-width="1.5" />
    <!-- Nested Arch 3 -->
    <path d="M 380 740 L 380 440 A 120 120 0 0 1 620 440 L 620 740 Z" fill="#141b2b" stroke="url(#goldPure)" stroke-width="2" />

    <!-- Stepped Architectural Spire Rising -->
    <polygon points="500,160 520,240 540,240 540,310 560,310 560,400 440,400 440,310 460,310 460,240 480,240" fill="url(#goldVertical)" stroke="#fdf6e2" stroke-width="1" />
    
    <!-- Lateral Stepped Pillars -->
    <!-- Left Wing -->
    <path d="M 180 740 L 180 500 L 220 500 L 220 460 L 260 460 L 260 420 L 300 420 L 300 740 Z" fill="#0f1420" stroke="url(#goldPure)" stroke-width="2" />
    <line x1="220" y1="740" x2="220" y2="500" class="gold-stroke" stroke-width="1" />
    <line x1="260" y1="740" x2="260" y2="460" class="gold-stroke" stroke-width="1" />
    <!-- Right Wing -->
    <path d="M 820 740 L 820 500 L 780 500 L 780 460 L 740 460 L 740 420 L 700 420 L 700 740 Z" fill="#0f1420" stroke="url(#goldPure)" stroke-width="2" />
    <line x1="780" y1="740" x2="780" y2="500" class="gold-stroke" stroke-width="1" />
    <line x1="740" y1="740" x2="740" y2="460" class="gold-stroke" stroke-width="1" />
  </g>

  <!-- 03_Geometric_Monogram -->
  <g id="layer-03-emblem" inkscape:groupmode="layer" inkscape:label="03_Geometric_Monogram">
    <!-- Center Concentric Faceted Diamonds -->
    <g transform="translate(500, 520)">
      <polygon points="0,-120 120,0 0,120 -120,0" fill="#0d111a" stroke="url(#goldPure)" stroke-width="3.5" />
      <polygon points="0,-100 100,0 0,100 -100,0" fill="none" stroke="url(#goldPure)" stroke-width="1" stroke-dasharray="4 2" />
      <polygon points="0,-80 80,0 0,80 -80,0" fill="url(#goldVertical)" opacity="0.85" />
      <polygon points="0,-55 55,0 0,55 -55,0" fill="#0a0d14" stroke="#fdf6e2" stroke-width="2" />

      <!-- Interlocked Art Deco Letter 'V' Crest -->
      <path d="M -32 -32 L -12 32 L 12 32 L 32 -32 L 18 -32 L 0 16 L -18 -32 Z" fill="url(#goldPure)" filter="url(#goldGlow)" />
      <!-- Starburst Sparkle Point -->
      <circle cx="0" cy="-55" r="3" fill="#ffffff" />
      <circle cx="0" cy="55" r="3" fill="#ffffff" />
      <circle cx="-55" cy="0" r="3" fill="#ffffff" />
      <circle cx="55" cy="0" r="3" fill="#ffffff" />
    </g>
  </g>

  <!-- 04_Filigree_and_Ornaments -->
  <g id="layer-04-filigree" inkscape:groupmode="layer" inkscape:label="04_Filigree_and_Ornaments">
    <!-- Fan Palm Motif at the Base -->
    <g transform="translate(500, 740)" stroke="url(#goldPure)" stroke-width="1.8" fill="none">
      <path d="M 0 0 C -40 -30 -90 -30 -140 0" />
      <path d="M 0 0 C -30 -50 -70 -60 -110 -20" />
      <path d="M 0 0 C -20 -70 -40 -80 -70 -40" />
      <path d="M 0 0 L 0 -80" />
      <path d="M 0 0 C 20 -70 40 -80 70 -40" />
      <path d="M 0 0 C 30 -50 70 -60 110 -20" />
      <path d="M 0 0 C 40 -30 90 -30 140 0" />
      <circle cx="0" cy="0" r="6" fill="url(#goldPure)" />
    </g>
  </g>

  <!-- 05_Gilded_Typography -->
  <g id="layer-05-typography" inkscape:groupmode="layer" inkscape:label="05_Gilded_Typography">
    <text x="500" y="210" text-anchor="middle" class="deco-text" font-size="28" font-weight="700">M E T R O P O L I S</text>
    <text x="500" y="240" text-anchor="middle" font-family="'Cinzel', serif" font-size="12" fill="#d4af37" letter-spacing="8">G R A N D  E M P I R E</text>
    
    <line x1="280" y1="225" x2="380" y2="225" class="gold-stroke" stroke-width="1.5" />
    <line x1="620" y1="225" x2="720" y2="225" class="gold-stroke" stroke-width="1.5" />

    <text x="500" y="820" text-anchor="middle" class="deco-text" font-size="18">V E C T O R A  ·  A E S T H E T I C A</text>
    <text x="500" y="845" text-anchor="middle" font-family="'Cinzel', serif" font-size="10" fill="#8c6d32" letter-spacing="5">ANNO MCMXXVIII  ·  PERPETUAL VECTOR</text>
  </g>
</svg>`,
  },
  {
    id: 'neural-core-09',
    title: 'Neural Core 09 // Subsurface',
    subtitle: 'Isometric Cyber-Brutalist Architecture & Optical Conduits',
    concept: 'A deep-dive into isometric cyber-architecture and data reactor cores. Built using true 30-degree isometric projections, ambient occlusion drop-shadows, bioluminescent fiber optic channels, and floating translucent UI glyphs.',
    style: 'Cyberpunk / Brutalist',
    viewBox: '0 0 1000 1000',
    palette: [
      { name: 'Abyssal Black', hex: '#06080f', role: 'background' },
      { name: 'Hyper Cyan', hex: '#00f2fe', role: 'primary' },
      { name: 'Neon Magenta', hex: '#ff007f', role: 'accent' },
      { name: 'Electric Violet', hex: '#7928ca', role: 'glow' },
      { name: 'Titanium Slate', hex: '#1e2638', role: 'surface' },
      { name: 'Cold White', hex: '#e0f7fa', role: 'ink' },
    ],
    layers: [
      { name: '01_Background', description: 'Dark grid matrix with isometric guide lines' },
      { name: '02_Isometric_Foundations', description: 'Monolithic stepped concrete server blocks and coolant trenches' },
      { name: '03_Energy_Conduits', description: 'Bioluminescent cyan and magenta plasma lines with soft glow' },
      { name: '04_Reactor_Monolith', description: 'Central faceted neural processor cube with glowing heatsink fins' },
      { name: '05_Holographic_HUD', description: 'Floating telemetry diagnostics, node markers, and hex status labels' },
    ],
    evolutionIdeas: [
      'Inject a pulsing stroke-dashoffset animation to simulate real-time packet data flow along the isometric conduits',
      'Remap to a Toxic Hazard palette (Acid Lime and Signal Amber)',
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 1000 1000" role="img" aria-label="Neural Core 09 Isometric Vector Artwork">
  <title>Neural Core 09 // Subsurface</title>
  <desc>Isometric cyberpunk vector artwork depicting a futuristic quantum server core with luminous energy conduits.</desc>
  <defs>
    <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" />
      <stop offset="100%" stop-color="#4facfe" />
    </linearGradient>
    <linearGradient id="magentaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff007f" />
      <stop offset="100%" stop-color="#7928ca" />
    </linearGradient>
    <linearGradient id="topFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2d3748" />
      <stop offset="100%" stop-color="#1a202c" />
    </linearGradient>
    <linearGradient id="leftFace" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#161e2e" />
      <stop offset="100%" stop-color="#0b0f19" />
    </linearGradient>
    <linearGradient id="rightFace" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="neonBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <pattern id="isoDotGrid" width="60" height="34.64" patternUnits="userSpaceOnUse">
      <circle cx="0" cy="0" r="1" fill="#1e293b" />
      <circle cx="30" cy="17.32" r="1" fill="#1e293b" />
      <circle cx="60" cy="0" r="1" fill="#1e293b" />
      <circle cx="60" cy="34.64" r="1" fill="#1e293b" />
      <circle cx="0" cy="34.64" r="1" fill="#1e293b" />
    </pattern>
  </defs>
  <style>
    .hud-text { font-family: 'Fira Code', monospace; fill: #00f2fe; font-size: 11px; letter-spacing: 1.5px; }
    .neon-cyan { stroke: #00f2fe; stroke-width: 2.5; fill: none; filter: url(#neonBlur); }
    .neon-mag { stroke: #ff007f; stroke-width: 2.5; fill: none; filter: url(#neonBlur); }
    .iso-edge { stroke: #334155; stroke-width: 1.2; stroke-linejoin: round; }
  </style>

  <!-- 01_Background -->
  <g id="layer-01-bg" inkscape:groupmode="layer" inkscape:label="01_Background">
    <rect width="1000" height="1000" fill="#06080f" />
    <rect width="1000" height="1000" fill="url(#isoDotGrid)" opacity="0.6" />
    <!-- Background Radial Energy Burst -->
    <circle cx="500" cy="500" r="350" fill="#7928ca" opacity="0.12" filter="url(#neonBlur)" />
    <!-- Isometric Grid Horizon Lines -->
    <path d="M 0 500 L 500 788 L 1000 500 M 0 350 L 500 638 L 1000 350 M 0 650 L 500 938 L 1000 650" stroke="#141c2e" stroke-width="1.5" fill="none" />
  </g>

  <!-- 02_Isometric_Foundations -->
  <g id="layer-02-foundations" inkscape:groupmode="layer" inkscape:label="02_Isometric_Foundations">
    <!-- Base Platform Monolith -->
    <!-- Center (500, 680) -->
    <!-- Top Face -->
    <polygon points="500,520 760,670 500,820 240,670" fill="url(#topFace)" class="iso-edge" />
    <!-- Left Face -->
    <polygon points="240,670 500,820 500,910 240,760" fill="url(#leftFace)" class="iso-edge" />
    <!-- Right Face -->
    <polygon points="500,820 760,670 760,760 500,910" fill="url(#rightFace)" class="iso-edge" />

    <!-- Sub-levels Steps Left -->
    <polygon points="160,560 300,640 300,700 160,620" fill="url(#leftFace)" class="iso-edge" />
    <polygon points="160,560 300,640 400,580 260,500" fill="url(#topFace)" class="iso-edge" />
    <!-- Sub-levels Steps Right -->
    <polygon points="840,560 700,640 700,700 840,620" fill="url(#rightFace)" class="iso-edge" />
    <polygon points="840,560 700,640 600,580 740,500" fill="url(#topFace)" class="iso-edge" />
  </g>

  <!-- 03_Energy_Conduits -->
  <g id="layer-03-conduits" inkscape:groupmode="layer" inkscape:label="03_Energy_Conduits">
    <!-- Cyan Energy Circuit Buses -->
    <path d="M 240 670 L 380 590 L 380 480 L 440 445" class="neon-cyan" />
    <path d="M 760 670 L 620 590 L 620 480 L 560 445" class="neon-cyan" />
    <path d="M 500 820 L 500 700" class="neon-cyan" />
    <path d="M 300 750 L 440 670 L 440 610" class="neon-mag" />
    <path d="M 700 750 L 560 670 L 560 610" class="neon-mag" />

    <!-- Circuit Junction Terminals -->
    <circle cx="380" cy="590" r="4" fill="#00f2fe" filter="url(#neonBlur)" />
    <circle cx="620" cy="590" r="4" fill="#00f2fe" filter="url(#neonBlur)" />
    <circle cx="500" cy="700" r="5" fill="#ff007f" filter="url(#neonBlur)" />
  </g>

  <!-- 04_Reactor_Monolith -->
  <g id="layer-04-reactor" inkscape:groupmode="layer" inkscape:label="04_Reactor_Monolith">
    <!-- Floating Primary Quantum Cube: Center (500, 360) -->
    <!-- Top Face -->
    <polygon points="500,200 660,290 500,380 340,290" fill="#1e293b" stroke="#00f2fe" stroke-width="2" />
    <!-- Core Glow Window on Top -->
    <polygon points="500,240 600,295 500,350 400,295" fill="url(#cyanGlow)" opacity="0.8" filter="url(#neonBlur)" />
    
    <!-- Left Face -->
    <polygon points="340,290 500,380 500,560 340,470" fill="url(#leftFace)" stroke="#00f2fe" stroke-width="1.5" />
    <!-- Horizontal Heatsink Slits Left -->
    <line x1="360" y1="330" x2="480" y2="400" stroke="#00f2fe" stroke-width="2" />
    <line x1="360" y1="360" x2="480" y2="430" stroke="#00f2fe" stroke-width="2" />
    <line x1="360" y1="390" x2="480" y2="460" stroke="#00f2fe" stroke-width="2" />
    <line x1="360" y1="420" x2="480" y2="490" stroke="#ff007f" stroke-width="2" />

    <!-- Right Face -->
    <polygon points="500,380 660,290 660,470 500,560" fill="url(#rightFace)" stroke="#00f2fe" stroke-width="1.5" />
    <!-- Horizontal Heatsink Slits Right -->
    <line x1="520" y1="400" x2="640" y2="330" stroke="#00f2fe" stroke-width="2" />
    <line x1="520" y1="430" x2="640" y2="360" stroke="#00f2fe" stroke-width="2" />
    <line x1="520" y1="460" x2="640" y2="390" stroke="#00f2fe" stroke-width="2" />
    <line x1="520" y1="490" x2="640" y2="420" stroke="#ff007f" stroke-width="2" />

    <!-- Floating Hex Shield Rings -->
    <g transform="translate(500, 380)" stroke="#ff007f" stroke-width="1.5" fill="none" opacity="0.75">
      <polygon points="0,-160 140,-80 140,80 0,160 -140,80 -140,-80" stroke-dasharray="8 4" />
      <circle cx="0" cy="0" r="180" stroke="#00f2fe" stroke-width="1" stroke-dasharray="2 6" />
    </g>
  </g>

  <!-- 05_Holographic_HUD -->
  <g id="layer-05-hud" inkscape:groupmode="layer" inkscape:label="05_Holographic_HUD">
    <!-- Top HUD Banner -->
    <text x="80" y="110" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="24" fill="#e0f7fa" letter-spacing="3">NEURAL CORE // 09</text>
    <text x="80" y="135" class="hud-text">QUANTUM STATE: COHERENT [99.98%]</text>
    <text x="80" y="155" class="hud-text">SYS_CLK: 4.88 THz // BUS_LOAD: 34%</text>

    <!-- Top Right Telemetry -->
    <g transform="translate(740, 95)">
      <rect x="0" y="0" width="180" height="60" fill="#0e1726" stroke="#00f2fe" stroke-width="1" />
      <text x="15" y="25" class="hud-text" font-size="9" fill="#94a3b8">DIAGNOSTIC CORE</text>
      <text x="15" y="45" class="hud-text" font-size="12" fill="#00f2fe">FLUX STABLE</text>
      <circle cx="155" cy="30" r="6" fill="#ff007f" filter="url(#neonBlur)" />
    </g>

    <!-- Floating Callout Nodes -->
    <g stroke="#00f2fe" stroke-width="1" fill="none">
      <polyline points="280,310 210,260 140,260" />
      <circle cx="280" cy="310" r="3" fill="#00f2fe" />
      <text x="140" y="250" class="hud-text">NODE_A // FLUX</text>
      
      <polyline points="720,310 790,260 860,260" />
      <circle cx="720" cy="310" r="3" fill="#ff007f" />
      <text x="790" y="250" class="hud-text" fill="#ff007f">BUS_09 // 100GbE</text>
    </g>

    <!-- Footer System Specs -->
    <text x="80" y="910" class="hud-text" fill="#64748b">VECTORA GENERATIVE CYBERGRAPHICS // SPEC 2.4</text>
    <text x="920" y="910" text-anchor="end" class="hud-text" fill="#00f2fe">SECURE VECTOR NODE</text>
  </g>
</svg>`,
  },
  {
    id: 'solstice-astrolabe',
    title: 'Solstice Celestial Astrolabe',
    subtitle: 'Antique Celestial Mechanics & Constellation Geometry',
    concept: 'An intricate astronomical astrolabe calculating equinoxes and planetary orbits. Modeled with concentric ecliptic coordinate rings, zodiac constellation lines, lunar phase crescents, and radiant golden stippling.',
    style: 'Generative Parametric / Celestial',
    viewBox: '0 0 1000 1000',
    palette: [
      { name: 'Cosmic Indigo', hex: '#050714', role: 'background' },
      { name: 'Solar Aurum', hex: '#f0c75e', role: 'primary' },
      { name: 'Celestial Periwinkle', hex: '#8ba4f9', role: 'secondary' },
      { name: 'Lunar Starlight', hex: '#fbfcfd', role: 'ink' },
      { name: 'Deep Nebula', hex: '#161d3b', role: 'surface' },
    ],
    layers: [
      { name: '01_Background', description: 'Cosmic void with subtle celestial coordinate crosshairs and starfield' },
      { name: '02_Ecliptic_Rings', description: 'Concentric brass astrolabe scales and calibrated degree markings' },
      { name: '03_Constellations_Map', description: 'Major zodiac star clusters with interconnected vector lines' },
      { name: '04_Lunar_Phases', description: 'Orbital moon crescents and solar flare vector points' },
      { name: '05_Rete_and_Alidade', description: 'Ornamental pointer rete arm and central celestial axis pivot' },
      { name: '06_Typography', description: 'Latin astronomical nomenclature and equinox coordinates' },
    ],
    evolutionIdeas: [
      'Implement interactive hover tooltips identifying each zodiac constellation point',
      'Add an orbital rotation mode simulating night sky progression',
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 1000 1000" role="img" aria-label="Solstice Celestial Astrolabe Vector Map">
  <title>Solstice Celestial Astrolabe</title>
  <desc>Intricate antique astronomical vector map with calibrated celestial coordinate rings, zodiac constellations, and solar pointers.</desc>
  <defs>
    <radialGradient id="nebulaCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e2752" />
      <stop offset="60%" stop-color="#0a0e24" />
      <stop offset="100%" stop-color="#04060f" />
    </radialGradient>
    <linearGradient id="goldBrass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0b8" />
      <stop offset="40%" stop-color="#e5b842" />
      <stop offset="80%" stop-color="#996e1b" />
      <stop offset="100%" stop-color="#f5d77f" />
    </linearGradient>
    <filter id="starGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#f0c75e" flood-opacity="0.8" />
    </filter>
  </defs>
  <style>
    .gold-line { stroke: url(#goldBrass); fill: none; }
    .star-point { fill: #ffffff; filter: url(#starGlow); }
    .const-line { stroke: #8ba4f9; stroke-width: 0.9; stroke-dasharray: 2 3; fill: none; opacity: 0.65; }
    .astro-text { font-family: 'Cinzel', serif; fill: #f0c75e; letter-spacing: 3px; }
  </style>

  <!-- 01_Background -->
  <g id="layer-01-bg" inkscape:groupmode="layer" inkscape:label="01_Background">
    <rect width="1000" height="1000" fill="#04060f" />
    <circle cx="500" cy="500" r="460" fill="url(#nebulaCore)" />
    
    <!-- Micro Starfield Points (Hand Placed Coordinate Array) -->
    <g fill="#8ba4f9" opacity="0.6">
      <circle cx="210" cy="180" r="1.2" /><circle cx="290" cy="220" r="1.5" /><circle cx="150" cy="340" r="1" />
      <circle cx="820" cy="190" r="1.5" /><circle cx="750" cy="280" r="1.2" /><circle cx="870" cy="380" r="1" />
      <circle cx="180" cy="720" r="1.2" /><circle cx="250" cy="830" r="1.5" /><circle cx="340" cy="880" r="1" />
      <circle cx="780" cy="740" r="1.5" /><circle cx="850" cy="810" r="1.2" /><circle cx="690" cy="860" r="1" />
    </g>

    <!-- Quadrant Coordinate Axes -->
    <line x1="80" y1="500" x2="920" y2="500" stroke="#1c264a" stroke-width="1" stroke-dasharray="6 6" />
    <line x1="500" y1="80" x2="500" y2="920" stroke="#1c264a" stroke-width="1" stroke-dasharray="6 6" />
  </g>

  <!-- 02_Ecliptic_Rings -->
  <g id="layer-02-rings" inkscape:groupmode="layer" inkscape:label="02_Ecliptic_Rings">
    <!-- Outer Limb / Brass Ring Scale -->
    <circle cx="500" cy="500" r="410" class="gold-line" stroke-width="5" />
    <circle cx="500" cy="500" r="390" class="gold-line" stroke-width="1.5" />
    <circle cx="500" cy="500" r="365" class="gold-line" stroke-width="2" />
    <circle cx="500" cy="500" r="330" class="gold-line" stroke-width="1" stroke-dasharray="3 3" />
    <circle cx="500" cy="500" r="270" class="gold-line" stroke-width="1.5" />
    <circle cx="500" cy="500" r="180" class="gold-line" stroke-width="1.5" />
    <circle cx="500" cy="500" r="90" class="gold-line" stroke-width="2" />

    <!-- 360 Degree Calibration Ticks on Limb -->
    <g transform="translate(500,500)" stroke="url(#goldBrass)">
      <!-- 24 Major Hour Ticks -->
      <g stroke-width="2.5">
        <line x1="0" y1="-410" x2="0" y2="-390" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(30)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(60)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(90)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(120)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(150)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(180)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(210)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(240)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(270)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(300)" />
        <line x1="0" y1="-410" x2="0" y2="-390" transform="rotate(330)" />
      </g>
      <!-- Sub Ticks -->
      <g stroke-width="1" opacity="0.75">
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(10)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(20)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(40)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(50)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(70)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(80)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(100)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(110)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(130)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(140)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(160)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(170)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(190)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(200)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(220)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(230)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(250)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(260)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(280)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(290)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(310)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(320)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(340)" />
        <line x1="0" y1="-405" x2="0" y2="-390" transform="rotate(350)" />
      </g>
    </g>
  </g>

  <!-- 03_Constellations_Map -->
  <g id="layer-03-constellations" inkscape:groupmode="layer" inkscape:label="03_Constellations_Map">
    <!-- Major Zodiac Constellation 1: Ursa Major / Dipper (Top Left) -->
    <path d="M 320 280 L 380 295 L 430 330 L 410 380 L 350 370 L 380 295 M 430 330 L 480 345 L 510 320" class="const-line" />
    <circle cx="320" cy="280" r="3" class="star-point" />
    <circle cx="380" cy="295" r="3" class="star-point" />
    <circle cx="430" cy="330" r="4" class="star-point" />
    <circle cx="410" cy="380" r="3" class="star-point" />
    <circle cx="350" cy="370" r="3" class="star-point" />
    <circle cx="480" cy="345" r="2.5" class="star-point" />
    <circle cx="510" cy="320" r="3.5" class="star-point" />

    <!-- Constellation 2: Orion & Belt (Bottom Right) -->
    <path d="M 640 600 L 710 620 L 690 730 L 620 710 L 640 600 M 655 660 L 670 665 L 685 670" class="const-line" />
    <circle cx="640" cy="600" r="4" class="star-point" />
    <circle cx="710" cy="620" r="4" class="star-point" />
    <circle cx="690" cy="730" r="4" class="star-point" />
    <circle cx="620" cy="710" r="3" class="star-point" />
    <circle cx="655" cy="660" r="3" class="star-point" />
    <circle cx="670" cy="665" r="3" class="star-point" />
    <circle cx="685" cy="670" r="3" class="star-point" />

    <!-- Constellation 3: Cassiopeia 'W' (Top Right) -->
    <path d="M 620 220 L 670 250 L 710 210 L 760 240 L 800 200" class="const-line" />
    <circle cx="620" cy="220" r="3" class="star-point" />
    <circle cx="670" cy="250" r="3" class="star-point" />
    <circle cx="710" cy="210" r="4" class="star-point" />
    <circle cx="760" cy="240" r="3" class="star-point" />
    <circle cx="800" cy="200" r="3" class="star-point" />
  </g>

  <!-- 04_Lunar_Phases -->
  <g id="layer-04-lunar" inkscape:groupmode="layer" inkscape:label="04_Lunar_Phases">
    <!-- Offset Ecliptic Zodiac Circle -->
    <circle cx="500" cy="460" r="180" class="gold-line" stroke-width="2.5" />
    <circle cx="500" cy="460" r="195" class="gold-line" stroke-width="1" stroke-dasharray="4 4" />
    
    <!-- Moon Phase Crescents Around Ring -->
    <!-- New Moon: North -->
    <circle cx="500" cy="280" r="10" fill="#0b0e1e" stroke="url(#goldBrass)" stroke-width="1.5" />
    <!-- First Quarter: East -->
    <path d="M 680 460 A 10 10 0 0 1 680 480 A 10 10 0 0 0 680 460 Z" fill="url(#goldBrass)" />
    <!-- Full Moon: South -->
    <circle cx="500" cy="640" r="10" fill="url(#goldBrass)" />
    <!-- Third Quarter: West -->
    <path d="M 320 460 A 10 10 0 0 0 320 480 A 10 10 0 0 1 320 460 Z" fill="url(#goldBrass)" />
  </g>

  <!-- 05_Rete_and_Alidade -->
  <g id="layer-05-rete" inkscape:groupmode="layer" inkscape:label="05_Rete_and_Alidade">
    <!-- Rotating Alidade Ruler Vector -->
    <g transform="translate(500,500) rotate(-35)">
      <polygon points="-8,400 8,400 3,-400 0,-425 -3,-400" fill="url(#goldBrass)" filter="url(#starGlow)" />
      <circle cx="0" cy="-380" r="4" fill="#ffffff" />
      <circle cx="0" cy="380" r="4" fill="#ffffff" />
      <line x1="0" y1="-380" x2="0" y2="380" stroke="#04060f" stroke-width="1.5" />
    </g>

    <!-- Central Brass Pin & Solar Sunburst -->
    <circle cx="500" cy="500" r="24" fill="url(#goldBrass)" />
    <circle cx="500" cy="500" r="14" fill="#04060f" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="500" cy="500" r="5" fill="#f0c75e" />
  </g>

  <!-- 06_Typography -->
  <g id="layer-06-typography" inkscape:groupmode="layer" inkscape:label="06_Typography">
    <text x="500" y="140" text-anchor="middle" class="astro-text" font-size="22" font-weight="700">A S T R O L A B I U M  ·  S O L S T I C E</text>
    <text x="500" y="165" text-anchor="middle" font-family="'Cinzel', serif" font-size="11" fill="#8ba4f9" letter-spacing="4">EQUINOCTIUM VERNALE  ·  SPHAERA CELESTIS</text>
    
    <text x="500" y="875" text-anchor="middle" class="astro-text" font-size="14">LATITUDO 51°30' N  ·  LONGITUDO 00°07' W</text>
    <text x="500" y="900" text-anchor="middle" font-family="'Fira Code', monospace" font-size="10" fill="#64748b" letter-spacing="2">VECTORA CELESTIAL GENERATOR // ACCURACY CLASS I</text>
  </g>
</svg>`,
  },
  {
    id: 'bauhaus-kinetic-04',
    title: 'Bauhaus Kinetic Balance No. 4',
    subtitle: 'High Modernism & Constructivist Geometric Equilibrium',
    concept: 'A rigorous exploration of Wassily Kandinsky and László Moholy-Nagy constructivist principles. Built around intersecting pure primary geometry: an ultramarine counterbalance disk, a vermilion diagonal cantilever, and cadmium yellow arcs.',
    style: 'Bauhaus / Constructivism',
    viewBox: '0 0 1000 1000',
    palette: [
      { name: 'Warm Parchment', hex: '#f4ede2', role: 'background' },
      { name: 'Cadmium Vermilion', hex: '#e63929', role: 'primary' },
      { name: 'Ultramarine Blue', hex: '#1d4ed8', role: 'secondary' },
      { name: 'Chrome Yellow', hex: '#eab308', role: 'accent' },
      { name: 'Bauhaus Carbon', hex: '#171717', role: 'ink' },
    ],
    layers: [
      { name: '01_Background', description: 'Textured warm cream backdrop with asymmetrical tension grid' },
      { name: '02_Primary_Solids', description: 'Large scale geometric primary color masses (yellow semicircle, ultramarine disc)' },
      { name: '03_Cantilever_Beams', description: 'Black structural diagonal bar and dynamic weight vectors' },
      { name: '04_Counterweight_Rings', description: 'Concentric linework rings and intersecting target reticles' },
      { name: '05_Bauhaus_Typography', description: 'Geometric sans-serif typography with stark diagonal tracking' },
    ],
    evolutionIdeas: [
      'Animate the primary geometric discs with a kinetic seesaw oscillation effect',
      'Toggle a pure dark-mode inverted parchment background',
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 1000 1000" role="img" aria-label="Bauhaus Kinetic Balance No. 4 Vector Poster">
  <title>Bauhaus Kinetic Balance No. 4</title>
  <desc>Constructivist modernist vector poster featuring intersecting primary geometry, asymmetric balance, and bold typography.</desc>
  <defs>
    <filter id="inkMultiply">
      <feBlend mode="multiply" />
    </filter>
  </defs>
  <style>
    .bauhaus-bg { fill: #f5efe6; }
    .bauhaus-red { fill: #e63929; }
    .bauhaus-blue { fill: #1d4ed8; }
    .bauhaus-yellow { fill: #eab308; }
    .bauhaus-black { fill: #171717; }
    .b-line { stroke: #171717; stroke-width: 4; fill: none; }
    .b-text { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; fill: #171717; }
  </style>

  <!-- 01_Background -->
  <g id="layer-01-bg" inkscape:groupmode="layer" inkscape:label="01_Background">
    <rect width="1000" height="1000" class="bauhaus-bg" />
    <!-- Constructivist Asymmetry Guidelines -->
    <line x1="120" y1="0" x2="120" y2="1000" stroke="#e0d6c5" stroke-width="1.5" />
    <line x1="880" y1="0" x2="880" y2="1000" stroke="#e0d6c5" stroke-width="1.5" />
    <line x1="0" y1="620" x2="1000" y2="620" stroke="#e0d6c5" stroke-width="1.5" />
  </g>

  <!-- 02_Primary_Solids -->
  <g id="layer-02-solids" inkscape:groupmode="layer" inkscape:label="02_Primary_Solids">
    <!-- Massive Chrome Yellow Semicircle -->
    <path d="M 280 620 A 240 240 0 0 1 760 620 Z" class="bauhaus-yellow" />
    
    <!-- Ultramarine Heavy Orb (Counterbalance) -->
    <circle cx="680" cy="380" r="160" class="bauhaus-blue" opacity="0.9" />
    
    <!-- Vermilion Floating Segment -->
    <path d="M 320 260 L 480 180 L 440 380 Z" class="bauhaus-red" />
    
    <!-- Half-Tone Dot Cluster Grid -->
    <g fill="#171717" opacity="0.8">
      <circle cx="200" cy="420" r="6" /><circle cx="230" cy="420" r="6" /><circle cx="260" cy="420" r="6" />
      <circle cx="200" cy="450" r="6" /><circle cx="230" cy="450" r="6" /><circle cx="260" cy="450" r="6" />
      <circle cx="200" cy="480" r="6" /><circle cx="230" cy="480" r="6" /><circle cx="260" cy="480" r="6" />
    </g>
  </g>

  <!-- 03_Cantilever_Beams -->
  <g id="layer-03-beams" inkscape:groupmode="layer" inkscape:label="03_Cantilever_Beams">
    <!-- 45-Degree High Impact Carbon Diagonal Bar -->
    <polygon points="180,780 220,820 860,180 820,140" class="bauhaus-black" />
    
    <!-- Fine Structural Tension Wire Lines -->
    <line x1="120" y1="200" x2="880" y2="200" class="b-line" stroke-width="2" />
    <line x1="120" y1="200" x2="680" y2="380" stroke="#e63929" stroke-width="3" />
    <line x1="480" y1="620" x2="480" y2="880" class="b-line" stroke-width="6" />
    
    <!-- Intersecting Red Cross Indicator -->
    <path d="M 320 480 L 380 480 M 350 450 L 350 510" stroke="#e63929" stroke-width="5" />
  </g>

  <!-- 04_Counterweight_Rings -->
  <g id="layer-04-rings" inkscape:groupmode="layer" inkscape:label="04_Counterweight_Rings">
    <circle cx="680" cy="380" r="220" stroke="#171717" stroke-width="3" fill="none" stroke-dasharray="12 8" />
    <circle cx="680" cy="380" r="280" stroke="#171717" stroke-width="1.5" fill="none" />
    
    <circle cx="350" cy="740" r="70" stroke="#1d4ed8" stroke-width="8" fill="none" />
    <circle cx="350" cy="740" r="20" class="bauhaus-black" />
  </g>

  <!-- 05_Bauhaus_Typography -->
  <g id="layer-05-typography" inkscape:groupmode="layer" inkscape:label="05_Bauhaus_Typography">
    <!-- Large Display Header -->
    <text x="120" y="130" class="b-text" font-size="72" letter-spacing="-3">BAUHAUS</text>
    <text x="120" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#e63929" letter-spacing="4">WEIMAR · DESSAU · 1923</text>
    
    <!-- Vertical Editorial Text -->
    <g transform="translate(895, 300) rotate(90)">
      <text x="0" y="0" font-family="'Fira Code', monospace" font-size="12" fill="#171717" letter-spacing="3">STAATLICHES BAUHAUS // AUSSTELLUNG</text>
    </g>

    <!-- Bottom Constructivist Formula -->
    <text x="120" y="910" class="b-text" font-size="28">FORM FOLGT FUNKTION</text>
    <text x="120" y="935" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#64748b">VECTORA DESIGN SYSTEMS // KINETIC BALANCE NO. 4</text>
  </g>
</svg>`,
  },
  {
    id: 'komorebi-ginkgo',
    title: 'Komorebi Ginkgo Autumn',
    subtitle: 'Japanese Editorial Botanical & Sumi-E Bézier Linework',
    concept: 'A serene celebration of wabi-sabi and botanical elegance. Organic hand-crafted Ginkgo Biloba leaves with radiant vein branching, textured washi paper atmosphere, and warm terracotta/clay pigments.',
    style: 'Japanese Editorial / Botanical',
    viewBox: '0 0 1000 1000',
    palette: [
      { name: 'Warm Washi Paper', hex: '#f7f3eb', role: 'background' },
      { name: 'Kyoto Ginkgo Gold', hex: '#d99036', role: 'primary' },
      { name: 'Bamboo Forest Sage', hex: '#5b7553', role: 'secondary' },
      { name: 'Terracotta Seal', hex: '#bf432b', role: 'accent' },
      { name: 'Sumi-E Ink', hex: '#23201e', role: 'ink' },
    ],
    layers: [
      { name: '01_Background', description: 'Soft washi parchment surface with minimalist editorial vertical rules' },
      { name: '02_Botanical_Branches', description: 'Tapered organic sumi-e twig paths curving across the composition' },
      { name: '03_Ginkgo_Leaf_Masses', description: 'Fan-shaped scalloped ginkgo leaf geometry with warm gold gradients' },
      { name: '04_Leaf_Vein_Filigree', description: 'Intricate radial leaf ribs and delicate microscopic veins' },
      { name: '05_Hanko_Stamp_and_Type', description: 'Red square Japanese artisan seal (Hanko) and refined typography' },
    ],
    evolutionIdeas: [
      'Add drifting fallen golden leaves with varying opacity and depth of field blur',
      'Swap to a spring Sakura Blossom palette with pale quartz pink and emerald green',
    ],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 1000 1000" role="img" aria-label="Komorebi Ginkgo Botanical Vector Poster">
  <title>Komorebi Ginkgo Autumn</title>
  <desc>Japanese editorial botanical vector poster featuring organic ginkgo biloba leaves, delicate veins, and terracotta seal.</desc>
  <defs>
    <linearGradient id="ginkgoGold" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#bf7a2b" />
      <stop offset="50%" stop-color="#e8a838" />
      <stop offset="100%" stop-color="#f5cb6c" />
    </linearGradient>
    <linearGradient id="ginkgoSage" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475f41" />
      <stop offset="100%" stop-color="#738f6b" />
    </linearGradient>
    <radialGradient id="sunSpot" cx="30%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#e8a838" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#f7f3eb" stop-opacity="0" />
    </radialGradient>
    <filter id="softPaperShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="8" stdDeviation="12" flood-color="#544332" flood-opacity="0.15" />
    </filter>
  </defs>
  <style>
    .ink-stem { stroke: #23201e; stroke-linecap: round; stroke-linejoin: round; fill: none; }
    .leaf-rib { stroke: #8a571c; stroke-width: 0.9; opacity: 0.5; fill: none; }
    .washi-text { font-family: 'Plus Jakarta Sans', serif; fill: #23201e; }
  </style>

  <!-- 01_Background -->
  <g id="layer-01-bg" inkscape:groupmode="layer" inkscape:label="01_Background">
    <rect width="1000" height="1000" fill="#f7f3eb" />
    <circle cx="350" cy="400" r="320" fill="url(#sunSpot)" />
    <!-- Minimalist Japanese Editorial Grid Margins -->
    <line x1="80" y1="80" x2="920" y2="80" stroke="#e0d8cb" stroke-width="1" />
    <line x1="80" y1="920" x2="920" y2="920" stroke="#e0d8cb" stroke-width="1" />
  </g>

  <!-- 02_Botanical_Branches -->
  <g id="layer-02-branches" inkscape:groupmode="layer" inkscape:label="02_Botanical_Branches">
    <!-- Main Sumi-e Twig Path -->
    <path d="M 880 820 C 700 750 560 620 440 480 C 380 410 320 280 220 180" class="ink-stem" stroke-width="7" />
    <path d="M 520 570 C 450 620 380 700 280 740" class="ink-stem" stroke-width="4.5" />
    <path d="M 440 480 C 480 380 540 320 620 260" class="ink-stem" stroke-width="4" />
    <path d="M 330 300 C 260 320 200 360 140 420" class="ink-stem" stroke-width="3" />
  </g>

  <!-- 03_Ginkgo_Leaf_Masses -->
  <g id="layer-03-leaves" inkscape:groupmode="layer" inkscape:label="03_Ginkgo_Leaf_Masses" filter="url(#softPaperShadow)">
    <!-- Primary Giant Center Ginkgo Leaf -->
    <g transform="translate(440, 480) rotate(-25)">
      <!-- Fan Scallop Silhouette -->
      <path d="M 0 0 C 40 -80 120 -160 220 -180 C 260 -190 280 -150 250 -120 C 290 -100 310 -60 270 -30 C 200 30 100 20 0 0 Z" fill="url(#ginkgoGold)" stroke="#23201e" stroke-width="2" />
      <!-- Vein Radiance -->
      <path d="M 0 0 C 30 -40 100 -90 220 -180" class="leaf-rib" stroke-width="1.5" />
      <path d="M 0 0 C 40 -30 140 -60 250 -120" class="leaf-rib" />
      <path d="M 0 0 C 50 -20 160 -40 270 -30" class="leaf-rib" />
      <path d="M 0 0 C 30 -60 80 -120 180 -160" class="leaf-rib" />
      <path d="M 0 0 C 60 -10 140 10 230 -10" class="leaf-rib" />
    </g>

    <!-- Secondary Ginkgo Leaf (Sage Green, Left) -->
    <g transform="translate(280, 740) rotate(55)">
      <path d="M 0 0 C 30 -60 90 -120 160 -140 C 190 -150 210 -110 180 -90 C 210 -70 230 -40 200 -20 C 150 20 80 15 0 0 Z" fill="url(#ginkgoSage)" stroke="#23201e" stroke-width="2" />
      <path d="M 0 0 C 30 -30 80 -70 160 -140" stroke="#2d422a" stroke-width="1" fill="none" opacity="0.5" />
      <path d="M 0 0 C 40 -20 110 -40 180 -90" stroke="#2d422a" stroke-width="1" fill="none" opacity="0.5" />
    </g>

    <!-- Top Floating Ginkgo Leaf (Gold) -->
    <g transform="translate(620, 260) rotate(-60)">
      <path d="M 0 0 C 25 -50 75 -100 140 -120 C 170 -130 185 -95 160 -75 C 185 -60 200 -30 170 -15 C 130 15 70 10 0 0 Z" fill="url(#ginkgoGold)" stroke="#23201e" stroke-width="1.8" />
    </g>

    <!-- Small Budding Leaf (Sage) -->
    <g transform="translate(140, 420) rotate(110)">
      <path d="M 0 0 C 20 -40 60 -70 110 -80 C 130 -90 140 -70 120 -55 C 140 -45 150 -25 130 -10 C 100 10 50 10 0 0 Z" fill="url(#ginkgoSage)" stroke="#23201e" stroke-width="1.5" />
    </g>
  </g>

  <!-- 04_Leaf_Vein_Filigree & Details -->
  <g id="layer-04-details" inkscape:groupmode="layer" inkscape:label="04_Leaf_Vein_Filigree">
    <!-- Drifting Organic Seeds / Spores -->
    <circle cx="480" cy="220" r="3.5" fill="#d99036" />
    <circle cx="560" cy="380" r="2.5" fill="#5b7553" />
    <circle cx="310" cy="540" r="4" fill="#d99036" />
    <circle cx="680" cy="590" r="3" fill="#d99036" opacity="0.7" />
  </g>

  <!-- 05_Hanko_Stamp_and_Type -->
  <g id="layer-05-typography" inkscape:groupmode="layer" inkscape:label="05_Hanko_Stamp_and_Type">
    <!-- Japanese Hanko Red Seal Stamp -->
    <g transform="translate(120, 780)">
      <rect x="0" y="0" width="55" height="55" fill="#bf432b" rx="4" filter="url(#softPaperShadow)" />
      <!-- Hanko Kanji / Geometric Glyph -->
      <path d="M 12 12 L 43 12 M 28 12 L 28 43 M 16 26 L 40 26 M 16 43 L 40 43" stroke="#f7f3eb" stroke-width="3" stroke-linecap="square" fill="none" />
    </g>

    <!-- Editorial Typography (Kyoto Series) -->
    <text x="120" y="140" class="washi-text" font-size="32" font-weight="700" letter-spacing="1">木漏れ日 · KOMOREBI</text>
    <text x="120" y="165" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#8a7968" letter-spacing="3">AUTUMN GINKGO BILOBA // BOTANICAL NO. 07</text>
    
    <text x="880" y="140" text-anchor="end" class="washi-text" font-size="14" font-weight="600">KYOTO HERBARIUM</text>
    <text x="880" y="162" text-anchor="end" font-family="'Fira Code', monospace" font-size="10" fill="#8a7968">SPEC. 35°00'N 135°46'E</text>

    <!-- Minimalist Footer Coordinates -->
    <text x="880" y="890" text-anchor="end" class="washi-text" font-size="12" font-weight="600">VECTORA CRAFT STUDIO</text>
    <text x="880" y="910" text-anchor="end" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="#8a7968">HAND-AUTHORED BÉZIER CURVATURE</text>
  </g>
</svg>`,
  },
];
