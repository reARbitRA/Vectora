import { ReusableSvgComponent } from '../types';

export const REUSABLE_SVG_COMPONENTS: ReusableSvgComponent[] = [
  {
    id: 'cyber-badge',
    name: 'Cybernetic Spec Badge',
    category: 'Badges & Seals',
    description: 'Precision beveled badge token with rivets, corner chamfers, and dynamic status ring. Reusable via <use>.',
    cssVariables: {
      '--badge-bg': '#0A0A0A',
      '--badge-border': '#333333',
      '--badge-primary': '#00FF00',
      '--badge-accent': '#FF5500',
      '--badge-text': '#FFFFFF',
    },
    defsCode: `<g id="v-cyber-badge">
    <!-- Outer Chamfered Shield -->
    <polygon points="10,0 90,0 100,10 100,70 90,80 10,80 0,70 0,10" 
             fill="var(--badge-bg, #0A0A0A)" 
             stroke="var(--badge-border, #333333)" 
             stroke-width="1.5" />
    
    <!-- Inner Accent Frame -->
    <polygon points="12,5 88,5 95,12 95,68 88,75 12,75 5,68 5,12" 
             fill="none" 
             stroke="var(--badge-primary, #00FF00)" 
             stroke-width="1" 
             stroke-dasharray="8,4" 
             opacity="0.7" />

    <!-- Corner Rivets -->
    <circle cx="10" cy="10" r="1.5" fill="var(--badge-primary, #00FF00)" />
    <circle cx="90" cy="10" r="1.5" fill="var(--badge-primary, #00FF00)" />
    <circle cx="10" cy="70" r="1.5" fill="var(--badge-primary, #00FF00)" />
    <circle cx="90" cy="70" r="1.5" fill="var(--badge-primary, #00FF00)" />

    <!-- Status Indicator Beacon -->
    <circle cx="20" cy="40" r="4" fill="var(--badge-accent, #FF5500)" />
    <circle cx="20" cy="40" r="8" fill="none" stroke="var(--badge-accent, #FF5500)" stroke-width="0.8" opacity="0.5" />

    <!-- Badge Typography -->
    <text x="32" y="38" fill="var(--badge-text, #FFFFFF)" font-family="monospace" font-size="8" font-weight="700" letter-spacing="1">VECTORA</text>
    <text x="32" y="50" fill="var(--badge-primary, #00FF00)" font-family="monospace" font-size="6" font-weight="500">SPEC // 01</text>
  </g>`,
    useCode: `<!-- Multiple instances customized via position & CSS variables -->
<use href="#v-cyber-badge" x="50" y="50" />
<use href="#v-cyber-badge" x="180" y="50" style="--badge-primary:#FFB800; --badge-accent:#00F0FF;" />
<use href="#v-cyber-badge" x="310" y="50" transform="scale(1.2)" style="--badge-primary:#FF0055; --badge-accent:#8B5CF6;" />`,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 160" width="100%" height="100%" style="background:#000000;">
  <style>
    :root {
      --badge-bg: #0A0A0A;
      --badge-border: #333333;
      --badge-primary: #00FF00;
      --badge-accent: #FF5500;
      --badge-text: #FFFFFF;
    }
  </style>
  <defs>
    <g id="v-cyber-badge-demo">
      <polygon points="10,0 90,0 100,10 100,70 90,80 10,80 0,70 0,10" 
               fill="var(--badge-bg, #0A0A0A)" 
               stroke="var(--badge-border, #333333)" 
               stroke-width="1.5" />
      <polygon points="12,5 88,5 95,12 95,68 88,75 12,75 5,68 5,12" 
               fill="none" 
               stroke="var(--badge-primary, #00FF00)" 
               stroke-width="1" 
               stroke-dasharray="8,4" 
               opacity="0.7" />
      <circle cx="10" cy="10" r="1.5" fill="var(--badge-primary, #00FF00)" />
      <circle cx="90" cy="10" r="1.5" fill="var(--badge-primary, #00FF00)" />
      <circle cx="10" cy="70" r="1.5" fill="var(--badge-primary, #00FF00)" />
      <circle cx="90" cy="70" r="1.5" fill="var(--badge-primary, #00FF00)" />
      <circle cx="20" cy="40" r="4" fill="var(--badge-accent, #FF5500)" />
      <circle cx="20" cy="40" r="8" fill="none" stroke="var(--badge-accent, #FF5500)" stroke-width="0.8" opacity="0.5" />
      <text x="32" y="38" fill="var(--badge-text, #FFFFFF)" font-family="monospace" font-size="8" font-weight="700" letter-spacing="1">VECTORA</text>
      <text x="32" y="50" fill="var(--badge-primary, #00FF00)" font-family="monospace" font-size="6" font-weight="500">SPEC // 01</text>
    </g>
  </defs>
  
  <!-- Instance 1: Default Acid Green -->
  <use href="#v-cyber-badge-demo" x="30" y="40" />

  <!-- Instance 2: Amber Telemetry -->
  <use href="#v-cyber-badge-demo" x="160" y="40" style="--badge-primary:#FFB800; --badge-accent:#00F0FF; --badge-bg:#0F0F00;" />

  <!-- Instance 3: Magenta Core -->
  <use href="#v-cyber-badge-demo" x="290" y="40" style="--badge-primary:#FF0055; --badge-accent:#8B5CF6; --badge-bg:#12050A;" />
</svg>`,
    fullSnippet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="100%" height="100%">
  <style>
    :root {
      --badge-bg: #0A0A0A;
      --badge-border: #333333;
      --badge-primary: #00FF00;
      --badge-accent: #FF5500;
      --badge-text: #FFFFFF;
    }
    .badge-variant-amber { --badge-primary: #FFB800; --badge-accent: #00F0FF; }
    .badge-variant-magenta { --badge-primary: #FF0055; --badge-accent: #8B5CF6; }
  </style>

  <defs>
    <g id="v-cyber-badge">
      <polygon points="10,0 90,0 100,10 100,70 90,80 10,80 0,70 0,10" 
               fill="var(--badge-bg)" 
               stroke="var(--badge-border)" 
               stroke-width="1.5" />
      <polygon points="12,5 88,5 95,12 95,68 88,75 12,75 5,68 5,12" 
               fill="none" 
               stroke="var(--badge-primary)" 
               stroke-width="1" 
               stroke-dasharray="8,4" 
               opacity="0.7" />
      <circle cx="10" cy="10" r="1.5" fill="var(--badge-primary)" />
      <circle cx="90" cy="10" r="1.5" fill="var(--badge-primary)" />
      <circle cx="10" cy="70" r="1.5" fill="var(--badge-primary)" />
      <circle cx="90" cy="70" r="1.5" fill="var(--badge-primary)" />
      <circle cx="20" cy="40" r="4" fill="var(--badge-accent)" />
      <circle cx="20" cy="40" r="8" fill="none" stroke="var(--badge-accent)" stroke-width="0.8" opacity="0.5" />
      <text x="32" y="38" fill="var(--badge-text)" font-family="monospace" font-size="8" font-weight="700" letter-spacing="1">VECTORA</text>
      <text x="32" y="50" fill="var(--badge-primary)" font-family="monospace" font-size="6" font-weight="500">SPEC // 01</text>
    </g>
  </defs>

  <use href="#v-cyber-badge" x="40" y="60" />
  <use href="#v-cyber-badge" x="180" y="60" class="badge-variant-amber" />
  <use href="#v-cyber-badge" x="320" y="60" class="badge-variant-magenta" />
</svg>`,
  },
  {
    id: 'precision-dial',
    name: 'Precision Dial & Gauge Node',
    category: 'Instruments & Dials',
    description: 'Circular telemetry instrument with radial degree ticks, needle pointer, and optical outer bezel.',
    cssVariables: {
      '--dial-bg': '#0A0A0A',
      '--dial-bezel': '#333333',
      '--dial-needle': '#00FF00',
      '--dial-ticks': '#888888',
      '--dial-accent': '#FF5500',
    },
    defsCode: `<g id="v-precision-dial">
    <!-- Outer Bezel -->
    <circle cx="50" cy="50" r="45" fill="var(--dial-bg, #0A0A0A)" stroke="var(--dial-bezel, #333333)" stroke-width="2" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dial-bezel, #333333)" stroke-width="0.75" stroke-dasharray="2,2" />
    
    <!-- 8-Axis Radial Ticks -->
    <line x1="50" y1="12" x2="50" y2="18" stroke="var(--dial-needle, #00FF00)" stroke-width="1.5" />
    <line x1="50" y1="82" x2="50" y2="88" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
    <line x1="12" y1="50" x2="18" y2="50" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
    <line x1="82" y1="50" x2="88" y2="50" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
    <line x1="23" y1="23" x2="28" y2="28" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
    <line x1="77" y1="23" x2="72" y2="28" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
    <line x1="23" y1="77" x2="28" y2="72" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
    <line x1="77" y1="77" x2="72" y2="72" stroke="var(--dial-ticks, #888888)" stroke-width="1" />

    <!-- Dynamic Indicator Needle -->
    <line x1="50" y1="50" x2="72" y2="28" stroke="var(--dial-needle, #00FF00)" stroke-width="2" stroke-linecap="round" />
    <circle cx="50" cy="50" r="4" fill="var(--dial-accent, #FF5500)" stroke="var(--dial-bezel, #333333)" stroke-width="1" />
  </g>`,
    useCode: `<!-- Instantiate precision dials with different rotations and styles -->
<use href="#v-precision-dial" x="50" y="50" />
<use href="#v-precision-dial" x="180" y="50" style="--dial-needle:#00F0FF; --dial-accent:#FFB800;" />
<use href="#v-precision-dial" x="310" y="50" style="--dial-needle:#FF0055; --dial-accent:#FFFFFF;" />`,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 160" width="100%" height="100%" style="background:#000000;">
  <defs>
    <g id="v-precision-dial-demo">
      <circle cx="50" cy="50" r="45" fill="var(--dial-bg, #0A0A0A)" stroke="var(--dial-bezel, #333333)" stroke-width="2" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dial-bezel, #333333)" stroke-width="0.75" stroke-dasharray="2,2" />
      <line x1="50" y1="12" x2="50" y2="18" stroke="var(--dial-needle, #00FF00)" stroke-width="1.5" />
      <line x1="50" y1="82" x2="50" y2="88" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="12" y1="50" x2="18" y2="50" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="82" y1="50" x2="88" y2="50" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="23" y1="23" x2="28" y2="28" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="77" y1="23" x2="72" y2="28" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="23" y1="77" x2="28" y2="72" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="77" y1="77" x2="72" y2="72" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="50" y1="50" x2="72" y2="28" stroke="var(--dial-needle, #00FF00)" stroke-width="2" stroke-linecap="round" />
      <circle cx="50" cy="50" r="4" fill="var(--dial-accent, #FF5500)" stroke="var(--dial-bezel, #333333)" stroke-width="1" />
    </g>
  </defs>

  <use href="#v-precision-dial-demo" x="40" y="30" />
  <use href="#v-precision-dial-demo" x="180" y="30" style="--dial-needle:#00F0FF; --dial-accent:#FFB800;" />
  <use href="#v-precision-dial-demo" x="320" y="30" style="--dial-needle:#FF0055; --dial-accent:#FFFFFF;" />
</svg>`,
    fullSnippet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" width="100%" height="100%">
  <defs>
    <g id="v-precision-dial">
      <circle cx="50" cy="50" r="45" fill="var(--dial-bg, #0A0A0A)" stroke="var(--dial-bezel, #333333)" stroke-width="2" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dial-bezel, #333333)" stroke-width="0.75" stroke-dasharray="2,2" />
      <line x1="50" y1="12" x2="50" y2="18" stroke="var(--dial-needle, #00FF00)" stroke-width="1.5" />
      <line x1="50" y1="82" x2="50" y2="88" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="12" y1="50" x2="18" y2="50" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="82" y1="50" x2="88" y2="50" stroke="var(--dial-ticks, #888888)" stroke-width="1" />
      <line x1="50" y1="50" x2="72" y2="28" stroke="var(--dial-needle, #00FF00)" stroke-width="2" stroke-linecap="round" />
      <circle cx="50" cy="50" r="4" fill="var(--dial-accent, #FF5500)" stroke="var(--dial-bezel, #333333)" stroke-width="1" />
    </g>
  </defs>

  <use href="#v-precision-dial" x="50" y="50" />
  <use href="#v-precision-dial" x="200" y="50" style="--dial-needle:#00F0FF; --dial-accent:#FFB800;" />
  <use href="#v-precision-dial" x="350" y="50" style="--dial-needle:#FF0055; --dial-accent:#FFFFFF;" />
</svg>`,
  },
  {
    id: 'brutalist-button',
    name: 'Brutalist Action Trigger',
    category: 'UI & Buttons',
    description: 'Angled vector CTA button with sharp corner cutouts, grip hash lines, and dynamic text slot.',
    cssVariables: {
      '--btn-bg': '#141414',
      '--btn-border': '#333333',
      '--btn-accent': '#00FF00',
      '--btn-text': '#FFFFFF',
    },
    defsCode: `<g id="v-brutalist-button">
    <!-- Cut-Corner Button Base -->
    <polygon points="0,0 130,0 140,10 140,40 10,40 0,30" 
             fill="var(--btn-bg, #141414)" 
             stroke="var(--btn-border, #333333)" 
             stroke-width="1.5" />
    
    <!-- Left Accent Stripe -->
    <polygon points="0,0 6,0 6,30 0,30" fill="var(--btn-accent, #00FF00)" />

    <!-- Tactical Grip Hashes -->
    <line x1="120" y1="12" x2="132" y2="12" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />
    <line x1="120" y1="18" x2="132" y2="18" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />
    <line x1="120" y1="24" x2="132" y2="24" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />

    <!-- Button Label -->
    <text x="18" y="24" fill="var(--btn-text, #FFFFFF)" font-family="monospace" font-size="10" font-weight="700" letter-spacing="1.5">EXECUTE</text>
  </g>`,
    useCode: `<!-- Multiple brutalist CTA buttons -->
<use href="#v-brutalist-button" x="40" y="50" />
<use href="#v-brutalist-button" x="200" y="50" style="--btn-accent:#FF5500;" />
<use href="#v-brutalist-button" x="360" y="50" style="--btn-accent:#00F0FF; --btn-bg:#00151C;" />`,
    previewSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 140" width="100%" height="100%" style="background:#000000;">
  <defs>
    <g id="v-brutalist-button-demo">
      <polygon points="0,0 130,0 140,10 140,40 10,40 0,30" 
               fill="var(--btn-bg, #141414)" 
               stroke="var(--btn-border, #333333)" 
               stroke-width="1.5" />
      <polygon points="0,0 6,0 6,30 0,30" fill="var(--btn-accent, #00FF00)" />
      <line x1="120" y1="12" x2="132" y2="12" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />
      <line x1="120" y1="18" x2="132" y2="18" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />
      <line x1="120" y1="24" x2="132" y2="24" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />
      <text x="18" y="24" fill="var(--btn-text, #FFFFFF)" font-family="monospace" font-size="10" font-weight="700" letter-spacing="1.5">EXECUTE</text>
    </g>
  </defs>

  <use href="#v-brutalist-button-demo" x="30" y="50" />
  <use href="#v-brutalist-button-demo" x="190" y="50" style="--btn-accent:#FF5500;" />
  <use href="#v-brutalist-button-demo" x="350" y="50" style="--btn-accent:#00F0FF; --btn-bg:#00151C;" />
</svg>`,
    fullSnippet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 140" width="100%" height="100%">
  <defs>
    <g id="v-brutalist-button">
      <polygon points="0,0 130,0 140,10 140,40 10,40 0,30" 
               fill="var(--btn-bg, #141414)" 
               stroke="var(--btn-border, #333333)" 
               stroke-width="1.5" />
      <polygon points="0,0 6,0 6,30 0,30" fill="var(--btn-accent, #00FF00)" />
      <line x1="120" y1="12" x2="132" y2="12" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />
      <line x1="120" y1="18" x2="132" y2="18" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />
      <line x1="120" y1="24" x2="132" y2="24" stroke="var(--btn-accent, #00FF00)" stroke-width="1" />
      <text x="18" y="24" fill="var(--btn-text, #FFFFFF)" font-family="monospace" font-size="10" font-weight="700" letter-spacing="1.5">EXECUTE</text>
    </g>
  </defs>

  <use href="#v-brutalist-button" x="30" y="50" />
  <use href="#v-brutalist-button" x="190" y="50" style="--btn-accent:#FF5500;" />
  <use href="#v-brutalist-button" x="350" y="50" style="--btn-accent:#00F0FF; --btn-bg:#00151C;" />
</svg>`,
  },
];
