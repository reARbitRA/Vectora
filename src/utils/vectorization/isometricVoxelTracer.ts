/**
 * VECTORA Vectorization Engine — Isometric Voxel 3D Reconstruction
 * Transforms 2D raster images into 2.5D isometric voxel dioramas,
 * projecting each pixel cell as a shaded 3D cube with top, left, and right polygon faces.
 */

import { imageToGrayscale } from './helpers/imageProcessing';
import { rgbToHex, hexToRgb } from './helpers/colorMath';

export interface IsometricOptions {
  voxelSize?: number; // 8 to 24 px
  heightScale?: number; // Height extrusion based on luminance
  backgroundColor?: string;
  outlineColor?: string;
}

export function traceIsometricVoxels(
  imageData: ImageData,
  options: IsometricOptions = {}
): { svg: string; voxelCount: number } {
  const {
    voxelSize = 14,
    heightScale = 1.2,
    backgroundColor = '#0A0A0A',
    outlineColor = 'rgba(0,0,0,0.3)',
  } = options;

  const imgWidth = imageData.width;
  const imgHeight = imageData.height;
  const gray = imageToGrayscale(imageData);

  const cols = Math.floor(imgWidth / voxelSize);
  const rows = Math.floor(imgHeight / voxelSize);

  // Isometric projection factors: 30-degree isometric angles
  const isoX = voxelSize * Math.cos(Math.PI / 6);
  const isoY = voxelSize * Math.sin(Math.PI / 6);

  const svgCanvasWidth = (cols + rows) * isoX + 100;
  const svgCanvasHeight = (cols + rows) * isoY + 250;
  const originX = svgCanvasWidth / 2;
  const originY = 80;

  const polygons: string[] = [];

  // Render back-to-front (painter's algorithm)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const srcX = Math.min(imgWidth - 1, Math.round((c + 0.5) * voxelSize));
      const srcY = Math.min(imgHeight - 1, Math.round((r + 0.5) * voxelSize));
      const sIdx = srcY * imgWidth + srcX;

      const lum = gray.data[sIdx];
      const pIdx = sIdx * 4;
      const baseR = imageData.data[pIdx];
      const baseG = imageData.data[pIdx + 1];
      const baseB = imageData.data[pIdx + 2];
      const baseHex = rgbToHex(baseR, baseG, baseB);

      // Height extrusion: brighter pixels stand taller
      const h = Math.max(4, Math.round((1 - lum) * voxelSize * heightScale * 2));

      // Isometric projection of bottom-center
      const bx = originX + (c - r) * isoX;
      const by = originY + (c + r) * isoY;

      // 3D Cube vertices:
      // Top face:
      // T0 (top), T1 (right), T2 (bottom), T3 (left)
      const t0x = bx;
      const t0y = by - h - isoY;
      const t1x = bx + isoX;
      const t1y = by - h;
      const t2x = bx;
      const t2y = by - h + isoY;
      const t3x = bx - isoX;
      const t3y = by - h;

      // Base vertices:
      const b1x = t1x;
      const b1y = t1y + h;
      const b2x = t2x;
      const b2y = t2y + h;
      const b3x = t3x;
      const b3y = t3y + h;

      // Shading: Top is lightest, Left is medium, Right is darkest
      const topColor = baseHex;
      const leftR = Math.round(baseR * 0.8);
      const leftG = Math.round(baseG * 0.8);
      const leftB = Math.round(baseB * 0.8);
      const leftColor = rgbToHex(leftR, leftG, leftB);

      const rightR = Math.round(baseR * 0.6);
      const rightG = Math.round(baseG * 0.6);
      const rightB = Math.round(baseB * 0.6);
      const rightColor = rgbToHex(rightR, rightG, rightB);

      // Left face
      polygons.push(
        `    <polygon points="${t3x.toFixed(1)},${t3y.toFixed(1)} ${t2x.toFixed(1)},${t2y.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)} ${b3x.toFixed(1)},${b3y.toFixed(1)}" fill="${leftColor}" stroke="${outlineColor}" stroke-width="0.5" />`
      );

      // Right face
      polygons.push(
        `    <polygon points="${t2x.toFixed(1)},${t2y.toFixed(1)} ${t1x.toFixed(1)},${t1y.toFixed(1)} ${b1x.toFixed(1)},${b1y.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)}" fill="${rightColor}" stroke="${outlineColor}" stroke-width="0.5" />`
      );

      // Top face
      polygons.push(
        `    <polygon points="${t0x.toFixed(1)},${t0y.toFixed(1)} ${t1x.toFixed(1)},${t1y.toFixed(1)} ${t2x.toFixed(1)},${t2y.toFixed(1)} ${t3x.toFixed(1)},${t3y.toFixed(1)}" fill="${topColor}" stroke="${outlineColor}" stroke-width="0.5" />`
      );
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgCanvasWidth.toFixed(0)} ${svgCanvasHeight.toFixed(0)}" width="100%" height="100%">
  <rect width="100%" height="100%" fill="${backgroundColor}" />
  <g id="isometric-voxel-diorama">
${polygons.join('\n')}
  </g>
</svg>`;

  return { svg, voxelCount: cols * rows };
}
