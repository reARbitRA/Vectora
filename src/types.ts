export interface PaletteColor {
  name: string;
  hex: string;
  role: 'background' | 'primary' | 'secondary' | 'accent' | 'ink' | 'surface' | 'glow';
}

export interface LayerSpec {
  id?: string;
  name: string;
  description: string;
  elementCount?: number;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blendMode?: string;
}

export interface VectorArtwork {
  id: string;
  title: string;
  subtitle?: string;
  concept: string;
  style: string;
  viewBox: string;
  palette: PaletteColor[];
  layers: LayerSpec[];
  svg: string;
  evolutionIdeas: string[];
  createdAt?: string;
  author?: string;
  tags?: string[];
}

export interface PaletteTheme {
  id: string;
  name: string;
  category: 'Modernist' | 'Cyber' | 'Editorial' | 'Earthen' | 'Luxury' | 'Vibrant' | 'Brutalist' | 'Custom';
  colors: string[];
  isCustom?: boolean;
  description?: string;
  createdAt?: string;
  semanticRoles?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    text?: string;
  };
}

export interface ReusableSvgComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  defsCode: string;
  useCode: string;
  cssVariables: Record<string, string>;
  previewSvg: string;
  fullSnippet: string;
}

export interface CanvasSettings {
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  gridType: 'cartesian' | 'isometric' | 'golden' | 'none';
  bgMode: 'dark' | 'light' | 'blueprint' | 'checker' | 'obsidian';
  grainIntensity: number;
  glowIntensity: number;
  strokeScale: number;
  showBoundingBoxes: boolean;
  aspectRatio: '1:1' | '4:3' | '16:9' | '9:16' | '2:3' | 'custom';
}

export interface SvgMetrics {
  totalElements: number;
  pathCount: number;
  circleCount: number;
  rectCount: number;
  polygonCount: number;
  textCount: number;
  groupCount: number;
  defsCount: number;
  byteSize: number;
  formattedSize: string;
  gzipEstimate: string;
  complianceScore: number;
  complianceChecks: {
    hasXmlns: boolean;
    hasViewBox: boolean;
    hasLayerGroups: boolean;
    hasDefs: boolean;
    hasTitle: boolean;
    hasDesc: boolean;
    noExternalRasters: boolean;
    hasStyleBlock: boolean;
  };
}

export type StudioTab = 'canvas' | 'editor' | 'specs' | 'gallery' | 'generator' | 'palettes' | 'components' | 'animator';

export type WorkspaceLayout = 'full' | 'minimalist' | 'canvas-focus';

export type AnimationPresetId =
  | 'orchestrated-composite'
  | 'pulse-breath'
  | 'orbit-spin'
  | 'wiggle'
  | 'bounce'
  | 'path-draw'
  | 'radar-sweep'
  | 'float-hover'
  | 'glitch-surge'
  | 'color-shimmer'
  | 'neon-flicker'
  | 'wave-oscillate'
  // Tier 1 & Comprehensive Animation Suite
  | 'pen-draw-on'
  | 'typewriter'
  | 'wipe-reveal'
  | 'signature-bleed'
  | 'iris-reveal'
  | 'path-morph'
  | 'skeleton-rig'
  | 'path-warp'
  | 'elastic-bounce'
  | 'particle-trail'
  | 'constellation-draw'
  | 'firefly-particles'
  | 'gradient-flow'
  | 'hue-rotation'
  | 'chromatic-aberration'
  | 'follow-path'
  | 'wave-distortion'
  | 'pendulum-swing'
  | 'domino-cascade'
  | 'parallax-depth'
  | 'camera-dolly'
  | 'lightning-strike'
  | 'assembling-puzzle'
  | 'liquid-fill';

export type AnimationLoopMode = 'infinite' | 'once' | 'alternate';

export interface KeyframeNode {
  id: string;
  percentage: number; // 0 to 100
  label: string;
  isRemovable?: boolean;
}

export interface LayerAnimationConfig {
  type: AnimationPresetId | 'none';
  duration: number; // in seconds
  delay: number; // in seconds
  direction?: 'normal' | 'reverse' | 'alternate';
  easing?: string;
  intensity?: number;
}

export interface AnimationSyncGroup {
  id: string;
  name: string;
  layerNames: string[]; // layer ids or inkscape:labels
  color: string; // visual accent color badge (e.g. #00FF00, #00FFFF, #FF00FF, #FFB800, #E11D48)
  preset: AnimationPresetId;
  duration: number; // in seconds
  speed: number;
  easing: string;
  delay: number; // in seconds
  direction: 'normal' | 'reverse' | 'alternate';
  keyframes?: KeyframeNode[];
  active: boolean;
}

export interface AnimationConfig {
  enabled: boolean;
  preset: AnimationPresetId;
  speed: number; // multiplier e.g. 1
  duration: number; // base duration in seconds
  easing: string;
  direction: 'normal' | 'reverse' | 'alternate';
  iterationCount: 'infinite' | number;
  loopMode: AnimationLoopMode; // 'infinite' | 'once' | 'alternate'
  motionTrail: boolean; // Motion trail / staggered opacity clone blur toggle
  motionTrailCount: number; // Number of trail clones (e.g. 3)
  motionTrailOpacity: number; // Falloff base opacity (e.g. 0.35)
  autoBake: boolean; // Real-time auto-bake toggle into master SVG
  keyframes?: KeyframeNode[];
  syncGroups?: AnimationSyncGroup[];
  activeSyncGroupId?: string | null;
  isPaused: boolean;
  layerOverrides: Record<string, LayerAnimationConfig>;
}

export interface AnimationPresetMeta {
  id: AnimationPresetId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  recommendedDuration: number;
  bestFor: string;
}

export interface LayerHierarchyNode {
  id: string;
  name: string;
  label: string;
  description: string;
  elementCount: number;
  visible: boolean;
  locked: boolean;
  blendMode: string;
  depth: number;
  isGroup: boolean;
  isLayer: boolean;
  parentId?: string;
  children: LayerHierarchyNode[];
}

export type ImportSourceType = 'image' | 'text' | 'svg';

export interface ImportRequest {
  type: ImportSourceType;
  fileName: string;
  fileSize: number;
  dataUri?: string;
  textContent?: string;
  rawSvg?: string;
  targetStyle?: string;
  complexity?: 'minimal' | 'balanced' | 'intricate' | 'ultra';
  paletteMood?: string;
  promptCustomization?: string;
}

export interface ExportPreset {
  id: string;
  name: string;
  description: string;
  tab: 'svg' | 'png' | 'react' | 'datauri' | 'spritesheet';
  pngScale?: number;
  cleanOptimize?: boolean;
  stripInkscape?: boolean;
  isCustom?: boolean;
  createdAt?: string;
}
