import { AnimationConfig, AnimationLoopMode, AnimationPresetId, AnimationPresetMeta, AnimationSyncGroup, KeyframeNode, LayerAnimationConfig } from '../types';
import { COMPLETE_ANIMATION_PRESETS, injectExtendedAnimation } from './animations';

export const ANIMATION_EASINGS: { id: string; name: string; curve: string; category: string }[] = [
  { id: 'ease-in-out', name: 'Ease In Out (Smooth)', curve: 'ease-in-out', category: 'Standard' },
  { id: 'linear', name: 'Linear (Mechanical)', curve: 'linear', category: 'Standard' },
  { id: 'ease', name: 'Standard Ease', curve: 'ease', category: 'Standard' },
  { id: 'ease-in', name: 'Ease In (Accelerate)', curve: 'ease-in', category: 'Standard' },
  { id: 'ease-out', name: 'Ease Out (Decelerate)', curve: 'ease-out', category: 'Standard' },
  { id: 'step-start', name: 'Step Start (Instant Jump)', curve: 'step-start', category: 'Stepped' },
  { id: 'step-end', name: 'Step End (Delayed Jump)', curve: 'step-end', category: 'Stepped' },
  { id: 'steps(4, end)', name: 'Steps 4 (Retro 8-Bit)', curve: 'steps(4, end)', category: 'Stepped' },
  { id: 'steps(8, end)', name: 'Steps 8 (Chunky Jitter)', curve: 'steps(8, end)', category: 'Stepped' },
  { id: 'cubic-bezier(0.16, 1, 0.3, 1)', name: 'Elastic Expo Snappy', curve: 'cubic-bezier(0.16, 1, 0.3, 1)', category: 'Cubic Bezier' },
  { id: 'cubic-bezier(0.34, 1.56, 0.64, 1)', name: 'Rubber Bounce Overshoot', curve: 'cubic-bezier(0.34, 1.56, 0.64, 1)', category: 'Cubic Bezier' },
  { id: 'cubic-bezier(0.7, 0, 0.3, 1)', name: 'Cinematic Dramatic', curve: 'cubic-bezier(0.7, 0, 0.3, 1)', category: 'Cubic Bezier' },
  { id: 'cubic-bezier(0.25, 0.1, 0.25, 1)', name: 'Swift Fluid Pulse', curve: 'cubic-bezier(0.25, 0.1, 0.25, 1)', category: 'Cubic Bezier' },
  { id: 'cubic-bezier(0.87, 0, 0.13, 1)', name: 'Deep Cybernetic Surge', curve: 'cubic-bezier(0.87, 0, 0.13, 1)', category: 'Cubic Bezier' },
];

export const DEFAULT_KEYFRAMES: KeyframeNode[] = [
  { id: 'kf-0', percentage: 0, label: '0% Start', isRemovable: false },
  { id: 'kf-25', percentage: 25, label: '25% Build', isRemovable: true },
  { id: 'kf-50', percentage: 50, label: '50% Peak Wave', isRemovable: true },
  { id: 'kf-75', percentage: 75, label: '75% Settle', isRemovable: true },
  { id: 'kf-100', percentage: 100, label: '100% Loop Return', isRemovable: false },
];

export interface AnimationPresetTemplate {
  id: AnimationPresetId;
  name: string;
  category: 'Standard Essentials' | 'Kinetic & Dynamics' | 'Cybernetic & VFX';
  tagline: string;
  description: string;
  icon: string;
  defaults: {
    easing: string;
    loopMode: AnimationLoopMode;
    duration: number;
    speed: number;
    motionTrail?: boolean;
    motionTrailCount?: number;
    motionTrailOpacity?: number;
  };
  bestFor: string;
}

export const ANIMATION_PRESETS: (AnimationPresetMeta & { defaults?: AnimationPresetTemplate['defaults']; category?: string })[] = [
  {
    id: 'pulse-breath',
    name: 'Pulse',
    category: 'Standard Essentials',
    tagline: 'Harmonic scale and specular glow',
    description: 'Expands and contracts vector elements with a rhythmic breathing cycle and specular drop-shadow glow.',
    icon: 'Heart',
    recommendedDuration: 3.5,
    defaults: {
      easing: 'ease-in-out',
      loopMode: 'infinite',
      duration: 3.5,
      speed: 1,
      motionTrail: false,
    },
    bestFor: 'Character focal points, gems, cores & reactors',
  },
  {
    id: 'orbit-spin',
    name: 'Rotate',
    category: 'Standard Essentials',
    tagline: 'Smooth 360° celestial rotation',
    description: 'Continuously rotates geometry and nested sub-groups around their optical centers with linear velocity.',
    icon: 'RotateCw',
    recommendedDuration: 6,
    defaults: {
      easing: 'linear',
      loopMode: 'infinite',
      duration: 6,
      speed: 1,
      motionTrail: false,
    },
    bestFor: 'Mandalas, gears, planetary rings, dials & spinners',
  },
  {
    id: 'wiggle',
    name: 'Wiggle',
    category: 'Standard Essentials',
    tagline: 'Playful jitter & elastic wobble',
    description: 'High-energy rotational vibration and dynamic angular wobble with organic elasticity.',
    icon: 'Sparkle',
    recommendedDuration: 2.2,
    defaults: {
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      loopMode: 'infinite',
      duration: 2.2,
      speed: 1.2,
      motionTrail: false,
    },
    bestFor: 'Badges, alert icons, stickers, gaming tokens & notifications',
  },
  {
    id: 'bounce',
    name: 'Bounce',
    category: 'Standard Essentials',
    tagline: 'Snappy vertical physics drop & rebound',
    description: 'Gravity-driven vertical drop with authentic elastic overshoot and dampening recoil.',
    icon: 'ArrowDownUp',
    recommendedDuration: 2.5,
    defaults: {
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      loopMode: 'infinite',
      duration: 2.5,
      speed: 1,
      motionTrail: false,
    },
    bestFor: 'Buttons, UI prompts, mascots, arrows & indicators',
  },
  {
    id: 'float-hover',
    name: 'Float',
    category: 'Kinetic & Dynamics',
    tagline: 'Weightless zero-gravity levitation',
    description: 'Suspends the vector artwork in dynamic zero-gravity with subtle vertical levitation and angular tilt.',
    icon: 'Wind',
    recommendedDuration: 4.5,
    defaults: {
      easing: 'ease-in-out',
      loopMode: 'alternate',
      duration: 4.5,
      speed: 1,
      motionTrail: false,
    },
    bestFor: 'Logos, isometric structures, spacecraft & hero badges',
  },
  {
    id: 'orchestrated-composite',
    name: 'Smart Orchestration',
    category: 'Kinetic & Dynamics',
    tagline: 'Multi-layer choreographed symphony',
    description: 'Intelligently assigns distinct harmonic motion to every layer: backgrounds pulse, frames rotate, core paths draw, and accents flicker.',
    icon: 'Sparkles',
    recommendedDuration: 8,
    defaults: {
      easing: 'ease-in-out',
      loopMode: 'infinite',
      duration: 8,
      speed: 1,
      motionTrail: true,
      motionTrailCount: 3,
      motionTrailOpacity: 0.3,
    },
    bestFor: 'Complex multi-layered artworks, HUDs & blueprints',
  },
  {
    id: 'path-draw',
    name: 'Laser Path Trace',
    category: 'Kinetic & Dynamics',
    tagline: 'Hypnotic stroke drawing animation',
    description: 'Calculates path dashoffsets to animate linework drawing and self-assembling across all vector contours.',
    icon: 'PenTool',
    recommendedDuration: 5,
    defaults: {
      easing: 'ease-in-out',
      loopMode: 'alternate',
      duration: 5,
      speed: 1,
      motionTrail: false,
    },
    bestFor: 'Wireframes, line art, sacred geometry & calligraphy',
  },
  {
    id: 'radar-sweep',
    name: 'Radar Sweep',
    category: 'Cybernetic & VFX',
    tagline: 'Sci-Fi telemetry beam & scan wave',
    description: 'Sweeps an angle radar beam across reticles, coordinate markers, and technical concentric rings.',
    icon: 'Radio',
    recommendedDuration: 5,
    defaults: {
      easing: 'linear',
      loopMode: 'infinite',
      duration: 5,
      speed: 1,
      motionTrail: true,
      motionTrailCount: 4,
      motionTrailOpacity: 0.4,
    },
    bestFor: 'Cyberpunk HUDs, avionics, sonar & tech interfaces',
  },
  {
    id: 'glitch-surge',
    name: 'Glitch Surge',
    category: 'Cybernetic & VFX',
    tagline: 'Cybernetic phase shift & displacement',
    description: 'High-frequency digital jitter, chromatic shear, and lightning-fast stroboscopic matrix displacement.',
    icon: 'Zap',
    recommendedDuration: 2.5,
    defaults: {
      easing: 'steps(8, end)',
      loopMode: 'infinite',
      duration: 2.5,
      speed: 1.4,
      motionTrail: false,
    },
    bestFor: 'Cyberpunk, brutalist posters & synthwave art',
  },
  {
    id: 'color-shimmer',
    name: 'Color Spectrum Wave',
    category: 'Cybernetic & VFX',
    tagline: 'Continuous hue-shift & saturation shimmer',
    description: 'Sweeps a vibrant 360-degree color phase cycle through all vector gradients, strokes, and fills.',
    icon: 'Flame',
    recommendedDuration: 7,
    defaults: {
      easing: 'linear',
      loopMode: 'infinite',
      duration: 7,
      speed: 1,
      motionTrail: false,
    },
    bestFor: 'Vaporwave, luxury art, holograms & gradient art',
  },
  {
    id: 'neon-flicker',
    name: 'Neon Strobe & Flicker',
    category: 'Cybernetic & VFX',
    tagline: 'Electric sign ignition surge',
    description: 'Authentic gas-discharge neon sign electrical flicker with erratic micro-pulses and luminous flares.',
    icon: 'Sun',
    recommendedDuration: 3.5,
    defaults: {
      easing: 'ease-in-out',
      loopMode: 'infinite',
      duration: 3.5,
      speed: 1.2,
      motionTrail: false,
    },
    bestFor: 'Retro signs, typography, night cityscapes & accents',
  },
  {
    id: 'wave-oscillate',
    name: 'Morphing Oscillation',
    category: 'Kinetic & Dynamics',
    tagline: 'Harmonic sine wave elasticity',
    description: 'Applies organic 2D scale and shear oscillations for fluid-like living vector dynamics.',
    icon: 'Activity',
    recommendedDuration: 4.5,
    defaults: {
      easing: 'ease-in-out',
      loopMode: 'alternate',
      duration: 4.5,
      speed: 1,
      motionTrail: false,
    },
    bestFor: 'Abstract fluids, biological shapes & soundwaves',
  },
  ...COMPLETE_ANIMATION_PRESETS.map((p) => ({
    ...p,
    defaults: {
      easing: 'ease-in-out',
      loopMode: (p.id === 'pen-draw-on' || p.id === 'wipe-reveal' || p.id === 'typewriter' || p.id === 'signature-bleed' || p.id === 'iris-reveal' || p.id === 'assembling-puzzle' ? 'once' : 'infinite') as AnimationLoopMode,
      duration: p.recommendedDuration,
      speed: 1,
      motionTrail: p.id === 'particle-trail',
      motionTrailCount: 3,
      motionTrailOpacity: 0.35,
    },
  })),
];

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  enabled: true,
  preset: 'orchestrated-composite',
  speed: 1,
  duration: 6,
  easing: 'ease-in-out',
  direction: 'normal',
  iterationCount: 'infinite',
  loopMode: 'infinite',
  motionTrail: false,
  motionTrailCount: 3,
  motionTrailOpacity: 0.35,
  autoBake: false,
  keyframes: DEFAULT_KEYFRAMES,
  syncGroups: [],
  activeSyncGroupId: null,
  isPaused: false,
  layerOverrides: {},
};

/**
 * Checks whether an SVG string already has VECTORA animations injected.
 */
export function hasSvgAnimations(svgString: string): boolean {
  if (!svgString) return false;
  return svgString.includes('id="vectora-animations"') || svgString.includes('vec-anim-') || svgString.includes('vec-trail-');
}

/**
 * Strips all VECTORA animation style blocks, trail clones, and class bindings from an SVG.
 */
export function removeSvgAnimations(svgString: string): string {
  if (!svgString) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      console.warn('SVG Parse Error in removeSvgAnimations:', errorNode.textContent);
      return svgString;
    }
    
    // Remove animation style tag
    const styleEl = doc.getElementById('vectora-animations');
    if (styleEl) styleEl.remove();

    // Remove generated motion trail clones
    const trailElements = doc.querySelectorAll('.vec-trail-clone');
    trailElements.forEach((el) => el.remove());

    // Clean animation classes from all elements
    const allElements = doc.querySelectorAll('*');
    allElements.forEach((el) => {
      const cls = el.getAttribute('class');
      if (cls && (cls.includes('vec-anim-') || cls.includes('vec-orch-') || cls.includes('vec-trail-'))) {
        const cleaned = cls
          .split(/\s+/)
          .filter((c) => !c.startsWith('vec-anim-') && !c.startsWith('vec-orch-') && !c.startsWith('vec-trail-'))
          .join(' ')
          .trim();
        if (cleaned) {
          el.setAttribute('class', cleaned);
        } else {
          el.removeAttribute('class');
        }
      }
      // Remove inline animation styles if applied
      const style = el.getAttribute('style');
      if (style && style.includes('animation')) {
        const cleanedStyle = style
          .split(';')
          .filter((s) => !s.trim().startsWith('animation'))
          .join(';')
          .trim();
        if (cleanedStyle) {
          el.setAttribute('style', cleanedStyle);
        } else {
          el.removeAttribute('style');
        }
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (err) {
    console.error('Error removing SVG animations:', err);
    return svgString;
  }
}

/**
 * Injects pure CSS keyframe animations, loop modes, motion trails, and target class bindings into the SVG DOM.
 * Works entirely client-side and produces 100% standalone, valid SVG.
 */
export function injectSvgAnimations(
  rawSvg: string,
  config: AnimationConfig
): string {
  if (!rawSvg) return '';
  
  // If animation is disabled, return clean SVG without animation blocks
  if (!config.enabled) {
    return removeSvgAnimations(rawSvg);
  }

  // Check if active preset belongs to the 25-technique extended animation engine
  if (COMPLETE_ANIMATION_PRESETS.some((p) => p.id === config.preset)) {
    const cleanSvg = removeSvgAnimations(rawSvg);
    return injectExtendedAnimation(cleanSvg, config);
  }

  try {
    const cleanSvg = removeSvgAnimations(rawSvg);
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanSvg, 'image/svg+xml');
    
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      console.warn('SVG Parse Error in injectSvgAnimations:', errorNode.textContent);
      return rawSvg;
    }

    const svgEl = doc.querySelector('svg');
    if (!svgEl) return rawSvg;

    const baseDuration = Math.max(0.5, config.duration / (config.speed || 1));
    const easing = config.easing || 'ease-in-out';
    const playState = config.isPaused ? 'paused' : 'running';

    // Derive effective CSS iteration count and direction from loopMode
    let loopIteration = 'infinite';
    let effectiveDirection = config.direction || 'normal';

    if (config.loopMode === 'once') {
      loopIteration = '1 forwards';
    } else if (config.loopMode === 'alternate') {
      loopIteration = 'infinite';
      effectiveDirection = 'alternate';
    } else {
      // infinite
      loopIteration = 'infinite';
    }

    // Generate comprehensive CSS keyframe definitions
    const cssRules: string[] = [
      `/* ========================================================== */`,
      `/* VECTORA STANDALONE SVG ANIMATION ENGINE                     */`,
      `/* ========================================================== */`,
      `:root {`,
      `  --vec-anim-play-state: ${playState};`,
      `  --vec-anim-origin: center center;`,
      `  --vec-base-duration: ${baseDuration}s;`,
      `  --vec-easing: ${easing};`,
      `  --vec-iteration: ${loopIteration};`,
      `  --vec-direction: ${effectiveDirection};`,
      `}`,
      ``,
      `/* Global Animation Hardware Acceleration */`,
      `[class*="vec-anim-"], [class*="vec-orch-"], [class*="vec-trail-"] {`,
      `  transform-box: fill-box !important;`,
      `  transform-origin: center center !important;`,
      `  animation-play-state: var(--vec-anim-play-state) !important;`,
      `  animation-timing-function: var(--vec-easing) !important;`,
      `  animation-iteration-count: var(--vec-iteration) !important;`,
      `  animation-direction: var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 1. Orbit Spin Animations (Clockwise & Counter-Clockwise) */`,
      `@keyframes vec-kf-spin-cw {`,
      `  0% { transform: rotate(0deg); }`,
      `  100% { transform: rotate(360deg); }`,
      `}`,
      `@keyframes vec-kf-spin-ccw {`,
      `  0% { transform: rotate(0deg); }`,
      `  100% { transform: rotate(-360deg); }`,
      `}`,
      `.vec-anim-spin-cw {`,
      `  animation: vec-kf-spin-cw ${baseDuration * 1.5}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      `.vec-anim-spin-ccw {`,
      `  animation: vec-kf-spin-ccw ${baseDuration * 1.8}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      `.vec-anim-spin-fast {`,
      `  animation: vec-kf-spin-cw ${baseDuration * 0.75}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 2. Laser Path Trace / Drawing */`,
      `@keyframes vec-kf-path-draw {`,
      `  0% { stroke-dashoffset: 1200; opacity: 0.15; }`,
      `  50% { stroke-dashoffset: 0; opacity: 1; }`,
      `  100% { stroke-dashoffset: 1200; opacity: 0.15; }`,
      `}`,
      `.vec-anim-draw {`,
      `  stroke-dasharray: 600 600 !important;`,
      `  animation: vec-kf-path-draw ${baseDuration}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      `.vec-anim-draw-fast {`,
      `  stroke-dasharray: 400 400 !important;`,
      `  animation: vec-kf-path-draw ${baseDuration * 0.6}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 3. Breathing Specular Pulse */`,
      `@keyframes vec-kf-pulse-breath {`,
      `  0%, 100% { transform: scale(0.96); opacity: 0.8; filter: drop-shadow(0 0 2px rgba(0,255,100,0.2)); }`,
      `  50% { transform: scale(1.04); opacity: 1; filter: drop-shadow(0 0 16px rgba(0,255,100,0.7)); }`,
      `}`,
      `.vec-anim-pulse {`,
      `  animation: vec-kf-pulse-breath ${baseDuration * 0.75}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      `.vec-anim-pulse-subtle {`,
      `  animation: vec-kf-pulse-breath ${baseDuration * 1.2}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 4. Radar & Telemetry Beam Sweep */`,
      `@keyframes vec-kf-radar-sweep {`,
      `  0% { transform: rotate(0deg); opacity: 0.4; }`,
      `  50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(0,255,255,0.8)); }`,
      `  100% { transform: rotate(360deg); opacity: 0.4; }`,
      `}`,
      `.vec-anim-radar {`,
      `  animation: vec-kf-radar-sweep ${baseDuration}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 5. Cinematic Hover Levitation */`,
      `@keyframes vec-kf-float-hover {`,
      `  0%, 100% { transform: translateY(0px) rotate(0deg); }`,
      `  50% { transform: translateY(-16px) rotate(1.2deg); }`,
      `}`,
      `.vec-anim-float {`,
      `  animation: vec-kf-float-hover ${baseDuration * 0.9}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 6. Glitch Matrix Surge */`,
      `@keyframes vec-kf-glitch-surge {`,
      `  0%, 100% { transform: translate(0, 0); opacity: 1; }`,
      `  8% { transform: translate(-4px, 2px) skewX(2deg); opacity: 0.9; filter: hue-rotate(90deg); }`,
      `  15% { transform: translate(4px, -2px); opacity: 1; }`,
      `  22% { transform: translate(0, 0); }`,
      `  72% { transform: translate(2px, 1px) skewY(-1.5deg); filter: invert(0.2); }`,
      `  80% { transform: translate(-3px, -1px); opacity: 0.95; }`,
      `  88% { transform: translate(0, 0); }`,
      `}`,
      `.vec-anim-glitch {`,
      `  animation: vec-kf-glitch-surge ${baseDuration * 0.5}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 7. Color Wave Shimmer */`,
      `@keyframes vec-kf-color-shimmer {`,
      `  0% { filter: hue-rotate(0deg) saturate(1); }`,
      `  50% { filter: hue-rotate(180deg) saturate(1.8) drop-shadow(0 0 12px rgba(255,0,128,0.5)); }`,
      `  100% { filter: hue-rotate(360deg) saturate(1); }`,
      `}`,
      `.vec-anim-shimmer {`,
      `  animation: vec-kf-color-shimmer ${baseDuration * 1.4}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 8. Neon Electrical Strobe & Flicker */`,
      `@keyframes vec-kf-neon-flicker {`,
      `  0%, 18.999%, 22%, 58.999%, 61%, 63.999%, 68%, 100% { opacity: 1; filter: drop-shadow(0 0 12px currentColor); }`,
      `  19%, 21.999%, 59%, 60.999%, 64%, 67.999% { opacity: 0.25; filter: none; }`,
      `}`,
      `.vec-anim-flicker {`,
      `  animation: vec-kf-neon-flicker ${baseDuration * 0.8}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 9. Morphing Wave Oscillation */`,
      `@keyframes vec-kf-wave-oscillate {`,
      `  0%, 100% { transform: scaleX(1) scaleY(1); }`,
      `  25% { transform: scaleX(1.05) scaleY(0.95) rotate(-1deg); }`,
      `  75% { transform: scaleX(0.95) scaleY(1.05) rotate(1deg); }`,
      `}`,
      `.vec-anim-wave {`,
      `  animation: vec-kf-wave-oscillate ${baseDuration}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 10. Playful Wiggle / Elastic Wobble */`,
      `@keyframes vec-kf-wiggle {`,
      `  0%, 100% { transform: rotate(0deg) scale(1); }`,
      `  15% { transform: rotate(-6deg) scale(1.03); }`,
      `  30% { transform: rotate(5deg) scale(1.02); }`,
      `  45% { transform: rotate(-4deg) scale(1.01); }`,
      `  60% { transform: rotate(3deg) scale(1.01); }`,
      `  75% { transform: rotate(-1deg) scale(1); }`,
      `}`,
      `.vec-anim-wiggle {`,
      `  animation: vec-kf-wiggle ${baseDuration * 0.75}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 11. Snappy Elastic Bounce */`,
      `@keyframes vec-kf-bounce {`,
      `  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }`,
      `  40% { transform: translateY(-22px) scale(1.02, 0.98); }`,
      `  60% { transform: translateY(-10px) scale(0.99, 1.01); }`,
      `}`,
      `.vec-anim-bounce {`,
      `  animation: vec-kf-bounce ${baseDuration * 0.8}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important;`,
      `}`,
      ``,
      `/* 12. Multi-Layer Orchestrated Classes */`,
      `@keyframes vec-kf-bg-drift {`,
      `  0%, 100% { opacity: 0.7; transform: scale(1); }`,
      `  50% { opacity: 1; transform: scale(1.02); }`,
      `}`,
      `.vec-orch-bg { animation: vec-kf-bg-drift ${baseDuration * 1.5}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important; }`,
      `.vec-orch-primary { animation: vec-kf-spin-cw ${baseDuration * 2.2}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important; }`,
      `.vec-orch-core { animation: vec-kf-float-hover ${baseDuration * 0.9}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important; }`,
      `.vec-orch-details { animation: vec-kf-spin-ccw ${baseDuration * 1.8}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important; }`,
      `.vec-orch-text { animation: vec-kf-pulse-breath ${baseDuration * 1.1}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important; }`,
      `.vec-orch-accents { animation: vec-kf-neon-flicker ${baseDuration * 0.7}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important; }`,
      `.vec-orch-hands { 
         animation: vec-kf-spin-cw ${baseDuration * 3}s linear var(--vec-iteration) normal !important; 
         transform-origin: center center !important;
       }`,
      `.vec-orch-fx { animation: vec-kf-color-shimmer ${baseDuration * 1.6}s var(--vec-easing) var(--vec-iteration) var(--vec-direction) !important; }`,
      ``,
      `/* Animation Sync Groups (Linked Multi-Layer Parameters) */`,
    ];

    // Generate Custom Synchronized Group CSS Rules
    const activeSyncGroups = (config.syncGroups || []).filter(
      (sg) => sg.active !== false && sg.layerNames && sg.layerNames.length > 0
    );

    activeSyncGroups.forEach((sg) => {
      const sgDuration = Math.max(0.2, (sg.duration || config.duration) / (sg.speed || config.speed || 1));
      const sgEasing = sg.easing || config.easing || 'ease-in-out';
      const sgDelay = (sg.delay || 0).toFixed(2);
      const sgDirection = sg.direction || effectiveDirection;
      const presetId = sg.preset || config.preset;

      // Determine base keyframe definition
      let kfName = 'vec-kf-pulse-breath';
      switch (presetId) {
        case 'orbit-spin': kfName = 'vec-kf-spin-cw'; break;
        case 'path-draw': kfName = 'vec-kf-path-draw'; break;
        case 'pulse-breath': kfName = 'vec-kf-pulse-breath'; break;
        case 'wiggle': kfName = 'vec-kf-wiggle'; break;
        case 'bounce': kfName = 'vec-kf-bounce'; break;
        case 'float-hover': kfName = 'vec-kf-float-hover'; break;
        case 'radar-sweep': kfName = 'vec-kf-radar-sweep'; break;
        case 'glitch-surge': kfName = 'vec-kf-glitch-surge'; break;
        case 'color-shimmer': kfName = 'vec-kf-color-shimmer'; break;
        case 'neon-flicker': kfName = 'vec-kf-neon-flicker'; break;
        case 'wave-oscillate': kfName = 'vec-kf-wave-oscillate'; break;
        default: kfName = 'vec-kf-pulse-breath'; break;
      }

      // If custom keyframes are provided on the sync group, generate custom keyframe block
      if (sg.keyframes && sg.keyframes.length >= 2) {
        kfName = `vec-kf-sync-${sg.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
        const keyframeStops = sg.keyframes
          .slice()
          .sort((a, b) => a.percentage - b.percentage)
          .map((node) => {
            const p = node.percentage;
            // Provide harmonic motion interpolated across percentage stops
            const scale = (1 + Math.sin((p / 100) * Math.PI * 2) * 0.08).toFixed(3);
            const rot = (Math.sin((p / 100) * Math.PI * 2) * 8).toFixed(1);
            const op = (0.7 + Math.cos((p / 100) * Math.PI * 2) * 0.3).toFixed(2);
            return `  ${p}% { transform: scale(${scale}) rotate(${rot}deg); opacity: ${op}; }`;
          })
          .join('\n');

        cssRules.push(`@keyframes ${kfName} {\n${keyframeStops}\n}`);
      }

      const safeClass = `vec-sync-grp-${sg.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
      cssRules.push(`/* Synchronized Layer Group: "${sg.name}" (${sg.layerNames.length} Linked Layers) */`);
      cssRules.push(`.${safeClass} {`);
      cssRules.push(`  animation: ${kfName} ${sgDuration}s ${sgEasing} ${sgDelay}s var(--vec-iteration) ${sgDirection} !important;`);
      cssRules.push(`}`);
    });

    cssRules.push(``);
    cssRules.push(`/* Motion Blur / Echo Trails */`);
    cssRules.push(`.vec-trail-clone {`);
    cssRules.push(`  pointer-events: none !important;`);
    cssRules.push(`  mix-blend-mode: screen !important;`);
    cssRules.push(`}`);

    // Map layer name to its sync group if linked
    const layerToSyncGroupMap: Record<string, string> = {};
    activeSyncGroups.forEach((sg) => {
      const safeClass = `vec-sync-grp-${sg.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
      sg.layerNames.forEach((name) => {
        layerToSyncGroupMap[name.trim().toLowerCase()] = safeClass;
      });
    });

    // Identify all layer groups
    const allGroups = Array.from(doc.querySelectorAll('g'));
    const layerGroups = allGroups.filter((g) => {
      return (
        g.getAttribute('inkscape:groupmode') === 'layer' ||
        g.hasAttribute('inkscape:label') ||
        (g.id && g.id.toLowerCase().includes('layer'))
      );
    });

    const targetGroups = layerGroups.length > 0 ? layerGroups : allGroups.slice(0, 7);

    // Apply animation classes based on sync groups, presets, or layer overrides
    if (config.preset === 'orchestrated-composite') {
      // Smart Semantic Multi-layer Assignment
      targetGroups.forEach((group, index) => {
        const rawLabel = group.getAttribute('inkscape:label') || group.id || `Layer ${index + 1}`;
        const label = rawLabel.toLowerCase();
        let animClass = 'vec-orch-core';

        // 1. Check if linked to an Animation Sync Group (Highest Priority for precision multi-layer sync)
        const syncedClass = layerToSyncGroupMap[label] || layerToSyncGroupMap[rawLabel.toLowerCase()];
        if (syncedClass) {
          animClass = syncedClass;
        } else {
          if (label.includes('bg') || label.includes('background') || index === 0) {
            animClass = 'vec-orch-bg';
          } else if (label.includes('shape') || label.includes('frame') || index === 1) {
            animClass = 'vec-orch-primary';
          } else if (label.includes('core') || label.includes('art') || label.includes('subject') || index === 2) {
            animClass = 'vec-orch-core';
          } else if (label.includes('detail') || label.includes('telemetry') || label.includes('grid') || index === 3) {
            animClass = 'vec-orch-details';
          } else if (label.includes('text') || label.includes('head') || label.includes('label') || index === 4) {
            animClass = 'vec-orch-text';
          } else if (label.includes('accent') || label.includes('highlight') || label.includes('glow') || index === 5) {
            animClass = 'vec-orch-accents';
          } else if (label.includes('hand') || label.includes('indicator') || label.includes('needle') || label.includes('dial') || label.includes('aghrebe') || label.includes('pointer')) {
            animClass = 'vec-orch-hands';
          } else if (label.includes('fx') || label.includes('overlay') || label.includes('scan') || index >= 6) {
            animClass = 'vec-orch-fx';
          }

          // Check if user has explicit layer override
          const override = config.layerOverrides[group.getAttribute('inkscape:label') || group.id];
          if (override) {
            animClass = getAnimClassForPreset(override.type);
          }
        }

        if (animClass) {
          const currentClass = group.getAttribute('class') || '';
          group.setAttribute('class', `${currentClass} ${animClass}`.trim());
        }
      });
    } else {
      // Uniform Preset Applied to Whole Artwork or Key Layers
      const globalClass = getAnimClassForPreset(config.preset);
      
      if (config.preset === 'path-draw') {
        // Apply path-draw directly to all paths, circles, and polygons for maximum visual impact
        const drawTargets = doc.querySelectorAll('path, circle, polygon, polyline, line, rect');
        drawTargets.forEach((target, idx) => {
          const currentClass = target.getAttribute('class') || '';
          target.setAttribute('class', `${currentClass} vec-anim-draw`.trim());
          if (idx % 2 === 1) {
            target.setAttribute('style', `animation-delay: ${(idx * 0.15) % 2}s;`);
          }
        });
      } else {
        // Apply to layer groups with alternating phase/directions or sync group bindings
        targetGroups.forEach((group, index) => {
          const rawLabel = group.getAttribute('inkscape:label') || group.id || `Layer ${index + 1}`;
          const label = rawLabel.toLowerCase();

          // Check if linked to an Animation Sync Group
          const syncedClass = layerToSyncGroupMap[label] || layerToSyncGroupMap[rawLabel.toLowerCase()];
          let targetClass = syncedClass || globalClass;

          if (!syncedClass) {
            // For orbit spin, alternate clockwise and counter-clockwise on alternate layers for visual rhythm!
            if (config.preset === 'orbit-spin') {
              targetClass = index % 2 === 1 ? 'vec-anim-spin-ccw' : 'vec-anim-spin-cw';
            }

            // Check for user layer override
            const override = config.layerOverrides[group.getAttribute('inkscape:label') || group.id];
            if (override) {
              targetClass = getAnimClassForPreset(override.type);
            }
          }

          if (targetClass) {
            const currentClass = group.getAttribute('class') || '';
            group.setAttribute('class', `${currentClass} ${targetClass}`.trim());
          }
        });

        // If no layer groups existed, apply to root svg or child containers
        if (targetGroups.length === 0) {
          const childG = doc.querySelector('svg > g');
          if (childG) {
            const currentClass = childG.getAttribute('class') || '';
            childG.setAttribute('class', `${currentClass} ${globalClass}`.trim());
          }
        }
      }
    }

    // MOTION TRAIL ENGINE: Automatically generate staggered opacity clones of animated elements
    if (config.motionTrail) {
      const trailCount = Math.max(1, Math.min(6, config.motionTrailCount || 3));
      const baseOpacity = config.motionTrailOpacity || 0.35;
      const animatedElements = doc.querySelectorAll('[class*="vec-anim-"], [class*="vec-orch-"]');

      animatedElements.forEach((el) => {
        const parent = el.parentNode;
        if (!parent) return;

        // Skip root svg or defs
        if (el.tagName.toLowerCase() === 'svg' || el.tagName.toLowerCase() === 'defs') return;

        // Create staggered trail clones behind the source element
        for (let t = 1; t <= trailCount; t++) {
          const clone = el.cloneNode(true) as Element;
          const trailDelay = (t * (baseDuration * 0.06)).toFixed(3);
          const opacity = (baseOpacity * (1 - (t / (trailCount + 1)))).toFixed(3);
          
          const currentCls = clone.getAttribute('class') || '';
          clone.setAttribute('class', `${currentCls} vec-trail-clone`.trim());
          
          const existingStyle = clone.getAttribute('style') || '';
          clone.setAttribute(
            'style',
            `${existingStyle}; opacity: ${opacity} !important; animation-delay: -${trailDelay}s !important; filter: blur(${t * 0.75}px);`
          );

          // Insert clone right before the actual animated element
          parent.insertBefore(clone, el);
        }
      });
    }

    // Insert <style id="vectora-animations"> into <defs> or root <svg>
    let defsEl = doc.querySelector('defs');
    if (!defsEl) {
      defsEl = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svgEl.insertBefore(defsEl, svgEl.firstChild);
    }

    const styleTag = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleTag.setAttribute('id', 'vectora-animations');
    styleTag.textContent = `\n${cssRules.join('\n')}\n`;
    defsEl.appendChild(styleTag);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (err) {
    console.error('Error injecting SVG animations:', err);
    return rawSvg;
  }
}

/**
 * Helper to map an AnimationPresetId to its CSS class name.
 */
export function getAnimClassForPreset(presetId: AnimationPresetId | 'none'): string {
  switch (presetId) {
    case 'path-draw':
      return 'vec-anim-draw';
    case 'orbit-spin':
      return 'vec-anim-spin-cw';
    case 'pulse-breath':
      return 'vec-anim-pulse';
    case 'wiggle':
      return 'vec-anim-wiggle';
    case 'bounce':
      return 'vec-anim-bounce';
    case 'radar-sweep':
      return 'vec-anim-radar';
    case 'float-hover':
      return 'vec-anim-float';
    case 'glitch-surge':
      return 'vec-anim-glitch';
    case 'color-shimmer':
      return 'vec-anim-shimmer';
    case 'neon-flicker':
      return 'vec-anim-flicker';
    case 'wave-oscillate':
      return 'vec-anim-wave';
    case 'orchestrated-composite':
      return 'vec-orch-core';
    case 'none':
      return '';
    default:
      return `vec-anim-${presetId}`;
  }
}

/**
 * Generates an animated, typed React TypeScript Component export.
 */
export function generateAnimatedReactComponent(
  svgString: string,
  componentName: string = 'AnimatedVectorArtwork'
): string {
  const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '');
  const cleanName = safeName.charAt(0).toUpperCase() + safeName.slice(1);

  // Clean raw SVG content for JSX
  let innerSvg = svgString
    .replace(/<\?xml.*?\?>/gi, '')
    .replace(/<!DOCTYPE.*?>/gi, '')
    .replace(/<!--.*?-->/gis, '')
    .trim();

  // Convert SVG attributes to JSX camelCase
  const jsxReplacements: [RegExp, string][] = [
    [/xmlns:xlink/g, 'xmlnsXlink'],
    [/xlink:href/g, 'xlinkHref'],
    [/inkscape:groupmode/g, 'data-inkscape-groupmode'],
    [/inkscape:label/g, 'data-inkscape-label'],
    [/sodipodi:docname/g, 'data-sodipodi-docname'],
    [/stroke-width/g, 'strokeWidth'],
    [/stroke-linecap/g, 'strokeLinecap'],
    [/stroke-linejoin/g, 'strokeLinejoin'],
    [/stroke-dasharray/g, 'strokeDasharray'],
    [/stroke-dashoffset/g, 'strokeDashoffset'],
    [/stroke-miterlimit/g, 'strokeMiterlimit'],
    [/stroke-opacity/g, 'strokeOpacity'],
    [/fill-opacity/g, 'fillOpacity'],
    [/fill-rule/g, 'fillRule'],
    [/clip-path/g, 'clipPath'],
    [/clip-rule/g, 'clipRule'],
    [/stop-color/g, 'stopColor'],
    [/stop-opacity/g, 'stopOpacity'],
    [/font-family/g, 'fontFamily'],
    [/font-size/g, 'fontSize'],
    [/font-weight/g, 'fontWeight'],
    [/letter-spacing/g, 'letterSpacing'],
    [/text-anchor/g, 'textAnchor'],
    [/pointer-events/g, 'pointerEvents'],
    [/mix-blend-mode/g, 'mixBlendMode'],
  ];

  jsxReplacements.forEach(([reg, rep]) => {
    innerSvg = innerSvg.replace(reg, rep);
  });

  return `import React from 'react';

interface ${cleanName}Props extends React.SVGProps<SVGSVGElement> {
  className?: string;
  isPaused?: boolean;
}

/**
 * ${cleanName}
 * Self-contained Animated Vector Masterpiece generated by VECTORA Studio.
 * Includes embedded CSS keyframes with GPU-accelerated motion choreography.
 */
export const ${cleanName}: React.FC<${cleanName}Props> = ({
  className = '',
  isPaused = false,
  style,
  ...props
}) => {
  return (
    <div
      className={\`inline-block relative \${className}\`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      ${innerSvg}
    </div>
  );
};

export default ${cleanName};
`;
}
