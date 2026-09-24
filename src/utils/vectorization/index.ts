/**
 * VECTORA Vectorization Engine — Unified Public API & Technique Registry
 * Provides 12+ client-side raster-to-SVG vectorization algorithms with 0 external dependencies.
 */

import { traceCenterline, CenterlineOptions } from './centerlineTracer';
import { traceRegions, RegionTracerOptions } from './regionTracer';
import { tracePotrace, potraceTracer, PotraceOptions } from './potraceTracer';
import { traceColorLayers, ColorQuantizerOptions } from './colorQuantizer';
import { traceDelaunay, DelaunayOptions } from './delaunayTriangulator';
import { traceHalftone, HalftoneOptions } from './halftoneDither';
import { traceVoronoiStipple, StippleOptions } from './voronoiStippler';
import { traceContours, ContourOptions } from './contourExtractor';
import { traceAsciiArt, AsciiOptions } from './asciiArtTracer';
import { traceIsometricVoxels, IsometricOptions } from './isometricVoxelTracer';
import { traceCrossHatch, CrossHatchOptions } from './crossHatchTracer';
import { traceTSPSingleLine, TSPOptions } from './tspArtTracer';
import { traceCannyEdges, CannyTracerOptions } from './cannyLineTracer';
import { VectorArtwork } from '../../types';
import { traceMarchingSquares } from './marchingSquares';
import { approximateFourier } from './fourierApproximator';
import { traceSobelGradients } from './sobelGradientTracer';
import { traceSlic } from './slicSuperpixels';
import { detectHarrisCorners } from './featureDetectors';

export {
  traceCenterline,
  traceRegions,
  tracePotrace,
  potraceTracer,
  traceColorLayers,
  traceDelaunay,
  traceHalftone,
  traceVoronoiStipple,
  traceContours,
  traceAsciiArt,
  traceIsometricVoxels,
  traceCrossHatch,
  traceTSPSingleLine,
  traceCannyEdges,
  type CenterlineOptions,
  type RegionTracerOptions,
  type PotraceOptions,
  type ColorQuantizerOptions,
  type DelaunayOptions,
  type HalftoneOptions,
  type StippleOptions,
  type ContourOptions,
  type AsciiOptions,
  type IsometricOptions,
  type CrossHatchOptions,
  type TSPOptions,
  type CannyTracerOptions,
};

export type VectorizationTechniqueId =
  | 'centerline'
  | 'region'
  | 'color-quantize'
  | 'delaunay'
  | 'halftone'
  | 'voronoi-stipple'
  | 'contour'
  | 'ascii-art'
  | 'isometric-voxel'
  | 'cross-hatch'
  | 'tsp-single-line'
  | 'canny-blueprint'
  | 'marching-squares' | 'sobel-gradient' | 'fourier-contour' | 'slic-superpixel' | 'harris-corners';

export interface VectorizationMeta {
  id: VectorizationTechniqueId;
  name: string;
  category: 'Contour & Line Art' | 'Color & Low-Poly' | 'Pattern & Engraving' | 'Experimental & 3D';
  tagline: string;
  description: string;
  icon: string;
  bestFor: string;
}

export const VECTORIZATION_TECHNIQUES: VectorizationMeta[] = [
  {
    id: 'centerline',
    name: 'Centerline Skeletonization',
    category: 'Contour & Line Art',
    tagline: '1-pixel topological medial axis',
    description: 'Binarizes with Otsu, thins via Zhang-Suen morphological erosion, simplifies with RDP, and fits smooth cubic Beziers.',
    icon: 'PenTool',
    bestFor: 'Handwritten signatures, calligraphy, pencil sketches & line art',
  },
  {
    id: 'region',
    name: 'Region Outline (Potrace)',
    category: 'Contour & Line Art',
    tagline: 'Crisp solid boundary polygon trace',
    description: 'Traces Moore-Neighbor boundaries with hole detection, generating crisp closed fills with even-odd rule.',
    icon: 'Layers',
    bestFor: 'Logos, emblems, solid icons, geometric glyphs & silhouettes',
  },
  {
    id: 'color-quantize',
    name: 'Color-Quantized Layers',
    category: 'Color & Low-Poly',
    tagline: 'Multi-layer K-Means posterization',
    description: 'Clusters pixels into N dominant palette colors, tracing separate vector boundary layers stacked into Inkscape groups.',
    icon: 'Sparkles',
    bestFor: 'Full-color illustrations, vintage posters, pop art & cartoons',
  },
  {
    id: 'delaunay',
    name: 'Delaunay Low-Poly Mesh',
    category: 'Color & Low-Poly',
    tagline: 'Edge-weighted geometric triangulation',
    description: 'Samples gradient-weighted points using Bowyer-Watson triangulation, rendering centroid-sampled colored polygon faces.',
    icon: 'Zap',
    bestFor: 'Portraits, landscapes, geometric abstractions & 3D gaming aesthetics',
  },
  {
    id: 'halftone',
    name: 'Halftone Dot Matrix',
    category: 'Pattern & Engraving',
    tagline: 'Pop-art variable radius circle grid',
    description: 'Samples local area luminance onto a Cartesian or hexagonal grid, mapping tonal value to circle radius.',
    icon: 'Radio',
    bestFor: 'Comic books, newsprint posters, vintage screen-printing & editorial art',
  },
  {
    id: 'voronoi-stipple',
    name: 'Voronoi Stippling',
    category: 'Pattern & Engraving',
    tagline: 'Lloyd-relaxed pen stipple dots',
    description: 'Uses rejection density sampling with Lloyd relaxation to position thousands of organic pen stipple points.',
    icon: 'Eye',
    bestFor: 'Wall street journal portraits, botanical illustrations & engravings',
  },
  {
    id: 'contour',
    name: 'Topographic Contour Lines',
    category: 'Contour & Line Art',
    tagline: 'Marching Squares elevation isolines',
    description: 'Interpolates continuous iso-luminance contours across 16-case grid cells, producing elegant topographic maps.',
    icon: 'Waves',
    bestFor: 'Topographic maps, elevation charts, acoustic landscapes & waves',
  },
  {
    id: 'cross-hatch',
    name: 'Cross-Hatch Etching',
    category: 'Pattern & Engraving',
    tagline: 'Multi-angle intaglio sketch lines',
    description: 'Generates 4 tonal layers of angled hatch lines (45°, -45°, 0°, 90°) simulating classical pen-and-ink intaglio printing.',
    icon: 'Flame',
    bestFor: 'Renaissance sketches, vintage money engravings & architectural drawings',
  },
  {
    id: 'tsp-single-line',
    name: 'Single-Stroke TSP Art',
    category: 'Contour & Line Art',
    tagline: 'One unbroken continuous vector path',
    description: 'Calculates a Traveling Salesperson tour across thousands of stipple coordinates, generating a single unbroken line.',
    icon: 'Activity',
    bestFor: 'Pen plotters, laser cutters, CNC machines & continuous string art',
  },
  {
    id: 'canny-blueprint',
    name: 'Canny Edge Blueprint',
    category: 'Contour & Line Art',
    tagline: 'Non-max suppression wireframe',
    description: 'Runs Sobel gradients with hysteresis thresholding, linking connected edges into crisp cybernetic wireframes.',
    icon: 'Cpu',
    bestFor: 'Technical blueprints, CAD schematics, cybernetic HUDs & wireframes',
  },
  { id: 'slic-superpixel', name: 'SLIC Superpixels', category: 'Color & Low-Poly', tagline: 'Lab-space photo mosaic', description: 'Clusters pixels in color and spatial space into editable superpixel regions.', icon: 'Grid3X3', bestFor: 'Portrait mosaics and painterly photo vectorization' },
  { id: 'harris-corners', name: 'Harris Corner Field', category: 'Contour & Line Art', tagline: 'Structural anchor detection', description: 'Extracts high-response image corners as editable SVG anchors.', icon: 'Crosshair', bestFor: 'Wireframes, sparse graphics and geometric anchors' },
  {
    id: 'marching-squares', name: 'Marching Squares Isolines', category: 'Contour & Line Art', tagline: 'Multi-level scalar field contours', description: 'Extracts smooth threshold isolines from raster luminance using interpolated 16-case marching squares.', icon: 'Waves', bestFor: 'Maps, topographic art, data visualization & contour engraving',
  },
  { id: 'sobel-gradient', name: 'Sobel Gradient Field', category: 'Contour & Line Art', tagline: 'Directional gradient micro-strokes', description: 'Converts local Sobel gradient orientation into directional SVG linework.', icon: 'Activity', bestFor: 'Blueprints, etched textures and directional analysis', },
  { id: 'fourier-contour', name: 'Fourier Epicycle Contour', category: 'Experimental & 3D', tagline: 'Frequency-domain contour reconstruction', description: 'Compresses closed contours into editable harmonic coefficients for smooth paths and epicycle animation.', icon: 'Activity', bestFor: 'Logo approximation, mathematical art and drawing demos', },
  {
    id: 'isometric-voxel',
    name: 'Isometric Voxel 3D',
    category: 'Experimental & 3D',
    tagline: '2.5D shaded cube projection',
    description: 'Projects pixel cells into 3D isometric cube voxels with light-shaded top, left, and right polygon faces.',
    icon: 'Sliders',
    bestFor: 'Pixel art, Minecraft-style dioramas, retro gaming & isometric icons',
  },
  {
    id: 'ascii-art',
    name: 'ASCII Vector Typography',
    category: 'Experimental & 3D',
    tagline: 'Monospace matrix glyph grid',
    description: 'Maps cellular luminance into typographic density glyphs, producing fully scalable monospace text vector art.',
    icon: 'Copy',
    bestFor: 'Terminal matrix aesthetics, retro hacker art & typewriter graphics',
  },
];

export interface UnifiedVectorizationOptions {
  technique: VectorizationTechniqueId;
  invert?: boolean;
  strokeColor?: string;
  fillColor?: string;
  backgroundColor?: string;
  colorCount?: number;
  pointCount?: number;
  gridSize?: number;
  strokeWidth?: number;
  detailLevel?: 'low' | 'medium' | 'high';
}

/**
 * Runs the selected vectorization algorithm on ImageData and produces a complete VectorArtwork object.
 */
export function runVectorization(
  imageData: ImageData,
  options: UnifiedVectorizationOptions,
  sourceFileName: string = 'imported-artwork'
): { artwork: VectorArtwork; rawSvg: string } {
  const { technique } = options;
  let rawSvg = '';

  const rdpEpsilon =
    options.detailLevel === 'high' ? 0.8 : options.detailLevel === 'low' ? 2.5 : 1.3;

  switch (technique) {
    case 'centerline': {
      const res = traceCenterline(imageData, {
        invert: options.invert,
        strokeColor: options.strokeColor || '#00FF00',
        strokeWidth: options.strokeWidth || 3,
        rdpEpsilon,
      });
      rawSvg = res.svg;
      break;
    }
    case 'region': {
      const res = traceRegions(imageData, {
        invert: options.invert,
        fillColor: options.fillColor || '#00FF00',
        strokeColor: 'none',
        rdpEpsilon,
      });
      rawSvg = res.svg;
      break;
    }
    case 'color-quantize': {
      const res = traceColorLayers(imageData, {
        colorCount: options.colorCount || 6,
        rdpEpsilon,
      });
      rawSvg = res.svg;
      break;
    }
    case 'delaunay': {
      const res = traceDelaunay(imageData, {
        pointCount: options.pointCount || 1200,
        strokeWidth: options.strokeWidth || 0.4,
      });
      rawSvg = res.svg;
      break;
    }
    case 'halftone': {
      const res = traceHalftone(imageData, {
        dotSpacing: options.gridSize || 10,
        dotColor: options.fillColor || '#00FF00',
        backgroundColor: options.backgroundColor || '#0A0A0A',
        invert: options.invert,
      });
      rawSvg = res.svg;
      break;
    }
    case 'voronoi-stipple': {
      const res = traceVoronoiStipple(imageData, {
        dotCount: options.pointCount || 2200,
        dotColor: options.strokeColor || '#00FF00',
        backgroundColor: options.backgroundColor || '#0A0A0A',
      });
      rawSvg = res.svg;
      break;
    }
    case 'contour': {
      const res = traceContours(imageData, {
        levels: options.colorCount || 9,
        strokeColor: options.strokeColor || '#00FF00',
        strokeWidth: options.strokeWidth || 1.2,
        backgroundColor: options.backgroundColor || '#0A0A0A',
      });
      rawSvg = res.svg;
      break;
    }
    case 'cross-hatch': {
      const res = traceCrossHatch(imageData, {
        lineSpacing: options.gridSize || 6,
        strokeColor: options.strokeColor || '#00FF00',
        strokeWidth: options.strokeWidth || 0.8,
        backgroundColor: options.backgroundColor || '#0A0A0A',
        invert: options.invert,
      });
      rawSvg = res.svg;
      break;
    }
    case 'tsp-single-line': {
      const res = traceTSPSingleLine(imageData, {
        pointCount: options.pointCount || 900,
        strokeColor: options.strokeColor || '#00FF00',
        strokeWidth: options.strokeWidth || 1.2,
        backgroundColor: options.backgroundColor || '#0A0A0A',
      });
      rawSvg = res.svg;
      break;
    }
    case 'canny-blueprint': {
      const res = traceCannyEdges(imageData, {
        strokeColor: options.strokeColor || '#00FFFF',
        strokeWidth: options.strokeWidth || 1.2,
        backgroundColor: options.backgroundColor || '#0A0A0A',
        rdpEpsilon,
      });
      rawSvg = res.svg;
      break;
    }
    case 'slic-superpixel': rawSvg = traceSlic(imageData, { count: options.pointCount || 160 }).svg; break;
    case 'harris-corners': rawSvg = detectHarrisCorners(imageData, .25).svg; break;
    case 'marching-squares': rawSvg = traceMarchingSquares(imageData, { levels: options.colorCount || 8, strokeColor: options.strokeColor || '#00FFFF', strokeWidth: options.strokeWidth || 1, backgroundColor: options.backgroundColor || '#05070A' }).svg; break;
    case 'sobel-gradient': rawSvg = traceSobelGradients(imageData, .12, options.strokeColor || '#00FFFF').svg; break;
    case 'fourier-contour': { const pts=[]; for(let y=0;y<imageData.height;y+=Math.max(1,Math.floor(imageData.height/32))) for(let x=0;x<imageData.width;x+=Math.max(1,Math.floor(imageData.width/32))) pts.push({x,y}); rawSvg=approximateFourier(pts,{harmonics:options.pointCount||24,strokeColor:options.strokeColor}).svg; break; }
    case 'isometric-voxel': {
      const res = traceIsometricVoxels(imageData, {
        voxelSize: options.gridSize || 14,
        backgroundColor: options.backgroundColor || '#0A0A0A',
      });
      rawSvg = res.svg;
      break;
    }
    case 'ascii-art': {
      const res = traceAsciiArt(imageData, {
        charWidth: options.gridSize ? Math.floor(options.gridSize * 0.7) : 7,
        charHeight: options.gridSize || 12,
        textColor: options.strokeColor || '#00FF00',
        backgroundColor: options.backgroundColor || '#0A0A0A',
        invert: options.invert,
      });
      rawSvg = res.svg;
      break;
    }
    default: {
      const res = traceCenterline(imageData);
      rawSvg = res.svg;
      break;
    }
  }

  const meta = VECTORIZATION_TECHNIQUES.find((t) => t.id === technique);
  const baseTitle = sourceFileName.replace(/\.[^/.]+$/, '');

  const artwork: VectorArtwork = {
    id: `vectorized-${Date.now()}`,
    title: `${baseTitle} — ${meta?.name || 'Vector'}`,
    concept: `${meta?.description || 'Algorithmic vector reproduction.'}`,
    style: meta?.name || 'Vector Trace',
    viewBox: `0 0 ${imageData.width} ${imageData.height}`,
    palette: [
      { name: 'Canvas Dark', hex: options.backgroundColor || '#0A0A0A', role: 'background' },
      { name: 'Core Vector Accent', hex: options.strokeColor || options.fillColor || '#00FF00', role: 'primary' },
      { name: 'Secondary Ink', hex: '#FFFFFF', role: 'secondary' },
      { name: 'Telemetry Cyan', hex: '#00FFFF', role: 'accent' },
    ],
    layers: [
      { name: '01_Background', description: 'Base Canvas' },
      { name: '02_Vector_Geometry', description: 'Algorithmic vector path trace' },
    ],
    svg: rawSvg,
    evolutionIdeas: [
      'Apply Pen Draw-On or Wipe Reveal animations in the Animation Studio',
      'Refine strokes and stroke-width with precision slider controls',
    ],
    createdAt: new Date().toISOString(),
    tags: ['Vectorized', technique, 'Algorithmic'],
  };

  return { artwork, rawSvg };
}

// Production facade (kept in a separate module to avoid making the algorithm registry circular).
export { VectorizationEngine, techniqueCatalog } from './engine';
export type { VectorizationOptions, VectorizationResult } from './engine';
export { traceMarchingSquares } from './marchingSquares';
export { approximateFourier } from './fourierApproximator';
export { traceSobelGradients } from './sobelGradientTracer';
export { optimizeRasterToSvg } from './optimization/diffvgOptimizer';
export { evolve } from './optimization/evolutionaryBase';
export { callNeuralProvider } from './neural/neuralVectorizerBase';
export type { OptimizerOptions, OptimizedPrimitive } from './optimization/diffvgOptimizer';
export type { EvolutionOptions, Genome } from './optimization/evolutionaryBase';

export { traceSlic } from './slicSuperpixels';
export { detectHarrisCorners } from './featureDetectors';
