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

export type StudioTab = 'canvas' | 'editor' | 'specs' | 'gallery' | 'generator' | 'palettes' | 'components';

export type WorkspaceLayout = 'full' | 'minimalist' | 'canvas-focus';

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
  tab: 'svg' | 'png' | 'react' | 'datauri';
  pngScale?: number;
  cleanOptimize?: boolean;
  stripInkscape?: boolean;
  isCustom?: boolean;
  createdAt?: string;
}
