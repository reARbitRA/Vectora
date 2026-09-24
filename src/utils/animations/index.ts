/**
 * VECTORA Standalone Animation Engine — Master Registry & Injector
 * Fully implements all 25 production-ready animation techniques:
 * Category A: Reveal & Draw Animations
 * Category B: Morph & Transform Animations
 * Category C: Particle & Emission Effects
 * Category D: Color & Gradient Animations
 * Category E: Kinetic & Physics-Based
 * Category F: Advanced Cinematic
 */

import { AnimationConfig, AnimationPresetId, AnimationPresetMeta } from '../../types';
import { injectAnimationDefs } from './helpers/clipPathBuilder';
import { generateAllKeyframeRules } from './helpers/keyframeGenerator';

export interface ExtendedAnimationPresetMeta extends AnimationPresetMeta {
  category: 'Reveal & Draw' | 'Morph & Transform' | 'Particle & Emission' | 'Color & Gradient' | 'Kinetic & Physics' | 'Advanced Cinematic';
  trick: string;
}

export const COMPLETE_ANIMATION_PRESETS: ExtendedAnimationPresetMeta[] = [
  // Category A: Reveal & Draw
  {
    id: 'pen-draw-on',
    name: 'Pen Draw-On',
    category: 'Reveal & Draw',
    tagline: 'pathLength="1" stroke-dashoffset self-assembly',
    description: 'Simulates hand-drawing or laser etching along all vector linework with normalized pathLength dashoffset calculation.',
    icon: 'PenTool',
    recommendedDuration: 4.5,
    bestFor: 'Handwriting, signatures, logo outlines, schematics & linework',
    trick: 'pathLength="1" with stroke-dashoffset 1 to 0',
  },
  {
    id: 'typewriter',
    name: 'Typewriter Glyph Reveal',
    category: 'Reveal & Draw',
    tagline: 'Staggered glyph-by-glyph typography',
    description: 'Sequentially reveals individual typography glyphs and characters with retro terminal typewriter rhythm.',
    icon: 'Copy',
    recommendedDuration: 3.5,
    bestFor: 'Headlines, quotes, code terminal output & titles',
    trick: 'Split <text> into <tspan> with stepped animation delay',
  },
  {
    id: 'wipe-reveal',
    name: 'Directional Wipe Reveal',
    category: 'Reveal & Draw',
    tagline: 'Linear clipPath vector mask sweep',
    description: 'Smoothly sweeps a directional rectangular clipPath mask across the artwork to unveil the composition.',
    icon: 'Layers',
    recommendedDuration: 3.0,
    bestFor: 'Complex illustrations, banners, UI reveals & photographs',
    trick: 'Animated <clipPath> rectangle translating across viewport',
  },
  {
    id: 'signature-bleed',
    name: 'Signature Ink Bleed',
    category: 'Reveal & Draw',
    tagline: 'Pencil stroke with wet ink paper absorption',
    description: 'Draws linework with sharp precision, followed immediately by organic paper fiber ink bleed and specular spread.',
    icon: 'PenTool',
    recommendedDuration: 4.0,
    bestFor: 'Luxury signatures, fountain pen scripts, watercolor & ink seals',
    trick: 'Pen stroke-dashoffset + delayed feGaussianBlur expanding into canvas',
  },
  {
    id: 'iris-reveal',
    name: 'Iris / Aperture Reveal',
    category: 'Reveal & Draw',
    tagline: 'Radial circular camera aperture wipe',
    description: 'Unveils the vector artwork from the optical center outward using an animated circular clipPath aperture.',
    icon: 'Eye',
    recommendedDuration: 3.2,
    bestFor: 'Portraits, mandalas, hero focal graphics & logos',
    trick: 'Radial <clipPath> circle expanding from r=0 to max hypotenuse',
  },

  // Category B: Morph & Transform
  {
    id: 'path-morph',
    name: 'Harmonic Path Morph',
    category: 'Morph & Transform',
    tagline: 'Shape interpolation & liquid elasticity',
    description: 'Smoothly oscillates and flexes path geometry between harmonic bounding states with natural spring tension.',
    icon: 'Activity',
    recommendedDuration: 4.0,
    bestFor: 'Organic blobs, fluid icons, logos & abstract shapes',
    trick: 'Coordinated scale and rotational oscillation matching anchor vectors',
  },
  {
    id: 'skeleton-rig',
    name: 'Skeleton Rig Armature',
    category: 'Morph & Transform',
    tagline: 'Nested joint transform-origin pivoting',
    description: 'Animates nested layer groups around optical joint pivot points like a modular puppet armature.',
    icon: 'Cpu',
    recommendedDuration: 3.5,
    bestFor: 'Characters, mechanical robots, clock hands & linkages',
    trick: 'transform-origin: center bottom with coordinated rotational oscillation',
  },
  {
    id: 'path-warp',
    name: 'Perlin Path Warp',
    category: 'Morph & Transform',
    tagline: 'feTurbulence + feDisplacementMap fluid ripples',
    description: 'Applies procedural fractal noise displacement to vector contours for organic, shimmering water-like distortions.',
    icon: 'Waves',
    recommendedDuration: 5.0,
    bestFor: 'Liquids, heat haze, magical auras, flags & underwater scenes',
    trick: 'feTurbulence baseFrequency animated through feDisplacementMap',
  },
  {
    id: 'elastic-bounce',
    name: 'Elastic Bounce Overshoot',
    category: 'Morph & Transform',
    tagline: 'cubic-bezier(0.68,-0.55,0.265,1.55) snappy snap',
    description: 'Authentic physical spring snap with energetic overshoot and damped settling recoil.',
    icon: 'ArrowDownUp',
    recommendedDuration: 2.2,
    bestFor: 'Buttons, stickers, gaming badges, popups & notifications',
    trick: 'Physics overshoot cubic bezier curve with scale rebounding',
  },

  // Category C: Particle & Emission
  {
    id: 'particle-trail',
    name: 'Particle Trail / Comet Tail',
    category: 'Particle & Emission',
    tagline: 'Staggered opacity & scale decay clones',
    description: 'Emits a fading motion trail behind primary vector paths with gradual scale falloff and opacity decay.',
    icon: 'Sparkle',
    recommendedDuration: 2.5,
    bestFor: 'Mascots, cursor icons, rockets, cursors & sci-fi UI',
    trick: 'Duplicate ghost trails translating with staggered negative delays',
  },
  {
    id: 'constellation-draw',
    name: 'Constellation Assembly',
    category: 'Particle & Emission',
    tagline: 'Staggered node pulses with linking lines',
    description: 'Fades in celestial star nodes, subsequently drawing laser linework connecting the vertices.',
    icon: 'Sparkles',
    recommendedDuration: 4.5,
    bestFor: 'Network charts, tech graphs, constellations & geometric art',
    trick: 'Pulsing circle vertices followed by delayed stroke-dashoffset lines',
  },
  {
    id: 'firefly-particles',
    name: 'Firefly Ambient Particles',
    category: 'Particle & Emission',
    tagline: 'Drifting glowing atmospheric motes',
    description: 'Fills the vector canvas with drifting, levitating glowing particles with asynchronous organic float paths.',
    icon: 'Sun',
    recommendedDuration: 6.0,
    bestFor: 'Forest scenes, fantasy illustrations, ambient backdrops & night art',
    trick: 'Multi-axis 2D translation with randomized drop-shadow specular pulses',
  },

  // Category D: Color & Gradient
  {
    id: 'gradient-flow',
    name: 'Liquid Gradient Flow',
    category: 'Color & Gradient',
    tagline: 'Animated linearGradient stop coordinates',
    description: 'Continuously shifts color stops and phase angles across all vector gradients for dynamic color waves.',
    icon: 'Flame',
    recommendedDuration: 5.0,
    bestFor: 'Vaporwave art, holographic cards, modern brand logos & luxury UI',
    trick: 'Cyclic hue-rotate and stop-color animation on <defs> gradients',
  },
  {
    id: 'hue-rotation',
    name: '360° Hue Shift Cycle',
    category: 'Color & Gradient',
    tagline: 'feColorMatrix continuous spectrum rotation',
    description: 'Sweeps the entire color spectrum across every vector element continuously and seamlessly.',
    icon: 'Sliders',
    recommendedDuration: 7.0,
    bestFor: 'Psychedelic posters, iridescent materials & cybernetic art',
    trick: 'feColorMatrix type="hueRotate" values="0; 360"',
  },
  {
    id: 'chromatic-aberration',
    name: 'Chromatic RGB Glitch',
    category: 'Color & Gradient',
    tagline: 'Red/Cyan 3-channel optical prism split',
    description: 'Splits geometry into Red, Green, and Blue optical channels with micro-vibrational shear and glitch displacement.',
    icon: 'Zap',
    recommendedDuration: 1.8,
    bestFor: 'Cyberpunk posters, CRT monitors, brutalist design & glitch art',
    trick: 'Micro-translating duplicate drop-shadows in pure Red and Cyan',
  },

  // Category E: Kinetic & Physics
  {
    id: 'follow-path',
    name: 'Follow Path Motion',
    category: 'Kinetic & Physics',
    tagline: 'SMIL animateMotion & CSS offset-path',
    description: 'Guides accent elements along custom vector trajectories with auto-rotation alignment.',
    icon: 'RotateCw',
    recommendedDuration: 4.5,
    bestFor: 'Planetary orbits, track vehicles, flow charts & infographics',
    trick: 'offset-path: path(...) with offset-distance: 0% to 100%',
  },
  {
    id: 'wave-distortion',
    name: 'Harmonic Wave Distortion',
    category: 'Kinetic & Physics',
    tagline: 'Sine wave vertical shear oscillation',
    description: 'Applies organic wave oscillations across vector layers, simulating wind on a banner or ripples in water.',
    icon: 'Wind',
    recommendedDuration: 3.8,
    bestFor: 'Ribbons, flags, banners, hair & soundwaves',
    trick: 'Alternating vertical scale and skewX oscillation in harmony',
  },
  {
    id: 'pendulum-swing',
    name: 'Physics Pendulum Swing',
    category: 'Kinetic & Physics',
    tagline: 'Gravity pendulum swing with damping',
    description: 'Swings vector geometry around a top anchor point with authentic gravitational acceleration and dampening.',
    icon: 'RotateCcw',
    recommendedDuration: 3.2,
    bestFor: 'Hanging signs, lanterns, bells, pocket watches & charms',
    trick: 'transform-origin: top center with cubic-bezier(0.4, 0, 0.2, 1)',
  },
  {
    id: 'domino-cascade',
    name: 'Domino Layer Cascade',
    category: 'Kinetic & Physics',
    tagline: 'Staggered cascade across N elements',
    description: 'Staggers the entrance and motion of every child layer with progressive 100ms micro-delays for rich choreography.',
    icon: 'Layers',
    recommendedDuration: 3.5,
    bestFor: 'Multi-layer logos, bar charts, stacked cards & isometric buildings',
    trick: 'calc(var(--i) * 100ms) staggered animation delay on child elements',
  },

  // Category F: Advanced Cinematic
  {
    id: 'parallax-depth',
    name: 'Parallax Depth Scrolling',
    category: 'Advanced Cinematic',
    tagline: 'Multi-plane camera translation rates',
    description: 'Separates background, midground, and foreground layers to translate at mathematically scaled camera depth velocities.',
    icon: 'Maximize2',
    recommendedDuration: 6.0,
    bestFor: 'Landscape dioramas, sci-fi cityscapes & cinematic hero illustrations',
    trick: 'Foreground moves 3x faster than midground and 7x faster than background',
  },
  {
    id: 'camera-dolly',
    name: 'Cinematic Camera Dolly',
    category: 'Advanced Cinematic',
    tagline: 'Dynamic SVG viewport pan & zoom',
    description: 'Cinematically glides and zooms the focal frame into key details of the composition with smooth camera easing.',
    icon: 'Film',
    recommendedDuration: 7.0,
    bestFor: 'Complex blueprints, posters, detailed character portraits & scene reveals',
    trick: 'Smooth scale(1.15) and coordinate translation on primary art group',
  },
  {
    id: 'lightning-strike',
    name: 'Lightning Bolt Strike',
    category: 'Advanced Cinematic',
    tagline: 'Ultra-fast flash with lingering afterglow',
    description: 'High-speed stroboscopic electrical ignition with brilliant specular flash and decaying phosphorescent afterglow.',
    icon: 'Zap',
    recommendedDuration: 2.5,
    bestFor: 'Cybernetic cores, storm clouds, energy weapons & electric signs',
    trick: 'Single-frame full opacity flash + delayed feGaussianBlur decay',
  },
  {
    id: 'assembling-puzzle',
    name: 'Assembling Puzzle Reveal',
    category: 'Advanced Cinematic',
    tagline: 'Scattered offset layers snapping home',
    description: 'Throws layers outward into scattered positions and snaps them magnetically into place with elastic precision.',
    icon: 'Sparkles',
    recommendedDuration: 3.5,
    bestFor: 'Product schematics, logo unveils, technical assemblies & puzzle art',
    trick: 'Pre-computed scatter offsets snapping into transform: translate(0,0)',
  },
  {
    id: 'liquid-fill',
    name: 'Liquid Rising Fill',
    category: 'Advanced Cinematic',
    tagline: 'Rising waterline clipPath with wave crest',
    description: 'Fills the vector shape from bottom to top with a rising liquid waterline and undulating surface wave.',
    icon: 'Waves',
    recommendedDuration: 4.0,
    bestFor: 'Battery gauges, progress meters, potion bottles & beverage logos',
    trick: 'Rising <clipPath> rectangle with wave overlay',
  },
];

/** Modern browser and production toolchain presets (AG/N/O encyclopedia). */
export const MODERN_ANIMATION_PRESETS: ExtendedAnimationPresetMeta[] = [
  ['scroll-driven-draw','Scroll-driven Signature Draw','CSS scroll timeline','Draws paths as the document scrolls','PenTool','Reveal & Draw','Scroll timeline + normalized dashoffset'],
  ['stagger-intersection','Intersection Stagger','Viewport-triggered cascade','Reveals layers when they enter the viewport','Layers','Kinetic & Physics','IntersectionObserver + --i'],
  ['gsap-morph-state','MorphSVG State Machine','Any-shape icon states','Adapter preset for robust unequal-path morphing','Activity','Morph & Transform','GSAP MorphSVG bridge'],
  ['spring-physics','Spring Physics Motion','Interruptible natural motion','Physics-based transforms for responsive UI','Activity','Kinetic & Physics','spring tension and friction'],
  ['filter-composition','Filter Composition','Animated effect stack','Composes blur, color and displacement filters','Waves','Color & Gradient','filter primitive pipeline'],
  ['gsap-timeline','GSAP Timeline Scene','Multi-step orchestration','Exportable scene choreography with labels','Film','Advanced Cinematic','timeline orchestration'],
  ['variable-font','Variable Font Animation','Animated type axes','Animates SVG text font variation settings','Copy','Color & Gradient','font-variation-settings'],
  ['view-transition','View Transition Morph','Native page transition','Names SVG elements for cross-document transitions','Layers','Advanced Cinematic','View Transitions API'],
  ['lottie-export','Lottie Export Pipeline','Portable animation interchange','Prepares supported SVG motion for Lottie tooling','Download','Advanced Cinematic','Lottie/dotLottie adapter'],
].map(([id,name,tagline,description,icon,category,trick])=>({id:id as AnimationPresetId,name,tagline,description,icon,recommendedDuration:2.5,bestFor:'Modern production web animation',category:category as ExtendedAnimationPresetMeta['category'],trick}));

// Preset ID Named Constants & Aliases
export const penDrawOn = 'pen-draw-on';
export const wipeReveal = 'wipe-reveal';
export const elasticBounce = 'elastic-bounce';

export const ALL_ANIMATION_PRESETS = [...COMPLETE_ANIMATION_PRESETS, ...MODERN_ANIMATION_PRESETS];

export const ANIMATION_PRESET_ALIASES: Record<string, AnimationPresetId> = {
  penDrawOn: 'pen-draw-on',
  wipeReveal: 'wipe-reveal',
  elasticBounce: 'elastic-bounce',
  'elastic-wobble': 'elastic-bounce',
  pathMorph: 'path-morph',
  pathDraw: 'path-draw',
};

/**
 * Injects complete 25-technique animation styles, defs, and bindings into any SVG string.
 */
export function injectExtendedAnimation(rawSvg: string, config: AnimationConfig): string {
  if (!rawSvg) return '';
  if (!config.enabled) return rawSvg;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return rawSvg;

    // Normalize preset ID if an alias was provided
    const rawPreset = config.preset as string;
    const presetId = (ANIMATION_PRESET_ALIASES[rawPreset] || rawPreset) as AnimationPresetId;

    // Determine viewBox dimensions
    const viewBoxAttr = svgEl.getAttribute('viewBox') || '0 0 1000 1000';
    const parts = viewBoxAttr.split(/[\s,]+/).map(Number);
    const width = parts[2] || 1000;
    const height = parts[3] || 1000;

    // Inject procedural defs
    injectAnimationDefs(doc, width, height);

    const baseDuration = Math.max(0.4, config.duration / (config.speed || 1));
    const easing = config.easing || 'ease-in-out';
    const loopIteration = config.loopMode === 'once' ? '1 forwards' : 'infinite';
    const effectiveDirection = config.direction || (config.loopMode === 'alternate' ? 'alternate' : 'normal');

    // Generate CSS keyframes
    const keyframeRules = generateAllKeyframeRules({
      baseDuration,
      easing,
      loopIteration,
      effectiveDirection,
      width,
      height,
    });

    // Attach animation class to target
    const animClass = `vec-anim-${presetId}`;

    // Apply animation class to primary group or root
    let targetGroup = svgEl.querySelector('g:not([id^="vec-anim-def-"])');
    if (!targetGroup) targetGroup = svgEl;

    const existingClass = targetGroup.getAttribute('class') || '';
    if (!existingClass.includes(animClass)) {
      targetGroup.setAttribute('class', `${existingClass} ${animClass}`.trim());
    }

    // Special clipPath attachments for wipe and iris
    if (presetId === 'wipe-reveal') {
      targetGroup.setAttribute('clip-path', 'url(#vec-anim-def-wipe-clip)');
    } else if (presetId === 'iris-reveal') {
      targetGroup.setAttribute('clip-path', 'url(#vec-anim-def-iris-clip)');
    } else if (presetId === 'liquid-fill') {
      targetGroup.setAttribute('clip-path', 'url(#vec-anim-def-liquid-clip)');
    }

    // Insert or update style element
    let styleEl: Element | null = doc.getElementById('vectora-animations');
    if (!styleEl) {
      const newStyle = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
      newStyle.setAttribute('id', 'vectora-animations');
      svgEl.insertBefore(newStyle, svgEl.firstChild);
      styleEl = newStyle;
    }

    const modernRules: Record<string, string> = {
      'scroll-driven-draw': `.vec-anim-scroll-driven-draw path { pathLength: 1; stroke-dasharray: 1; stroke-dashoffset: 1; animation: vec-kf-pen-draw-on linear ${loopIteration}; animation-timeline: scroll(root block); }`,
      'stagger-intersection': `.vec-anim-stagger-intersection > * { opacity: 0; transform: translateY(20px); animation: vec-kf-domino-rise ${baseDuration}s ${easing} forwards; animation-delay: calc(var(--i, 0) * 80ms); }`,
      'spring-physics': `.vec-anim-spring-physics { transition: transform ${baseDuration}s cubic-bezier(.175,.885,.32,1.275); }`,
      'variable-font': `.vec-anim-variable-font text { animation: vec-kf-variable-font ${baseDuration}s ease-in-out infinite alternate; } @keyframes vec-kf-variable-font { to { font-variation-settings: 'wght' 900, 'wdth' 110; } }`,
      'view-transition': `.vec-anim-view-transition { view-transition-name: vectora-element; }`,
    };
    styleEl.textContent = `\n${keyframeRules.join('\n')}\n${modernRules[presetId] || ''}\n\n@media (prefers-reduced-motion: reduce) { .vec-anim-${presetId}, .vec-anim-${presetId} * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }`;

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (err) {
    console.error('Error in injectExtendedAnimation:', err);
    return rawSvg;
  }
}

export { AnimationEngine } from './runtime';
export type { AnimationOptions } from './runtime';
export { wavePath, waveKeyframes } from './helpers/waveGenerator';
export { observeStagger } from './helpers/intersectionStagger';
