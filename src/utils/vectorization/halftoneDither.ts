/**
 * VECTORA Vectorization Engine — Halftone Dot Pattern Generator
 * Converts raster images into comic-book / newsprint / pop-art style
 * variable-radius vector halftone circle grids. Supports monochrome or RGB/CMYK channels.
 */

import { imageToGrayscale } from './helpers/imageProcessing';
import { rgbToHex } from './helpers/colorMath';

export interface HalftoneOptions {
  dotSpacing?: number; // 4 to 24 px
  maxDotRadius?: number; // Maximum circle radius
  invert?: boolean;
  colorMode?: 'monochrome' | 'color' | 'cmyk';
  dotColor?: string;
  backgroundColor?: string;
  shape?: 'circle' | 'square' | 'diamond';
}

export function traceHalftone(
  imageData: ImageData,
  options: HalftoneOptions = {}
): { svg: string; dotCount: number } {
  const {
    dotSpacing = 10,
    maxDotRadius = 5.5,
    invert = false,
    colorMode = 'monochrome',
    dotColor = '#00FF00',
    backgroundColor = '#0A0A0A',
    shape = 'circle',
  } = options;

  const width = imageData.width;
  const height = imageData.height;
  const gray = imageToGrayscale(imageData);

  const elements: string[] = [];

  for (let y = dotSpacing / 2; y < height; y += dotSpacing) {
    for (let x = dotSpacing / 2; x < width; x += dotSpacing) {
      // Sample local box luminance
      let lumSum = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let sampleCount = 0;

      const half = Math.floor(dotSpacing / 2);
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const sx = Math.min(width - 1, Math.max(0, Math.round(x + dx)));
          const sy = Math.min(height - 1, Math.max(0, Math.round(y + dy)));
          const sIdx = sy * width + sx;
          lumSum += gray.data[sIdx];

          const pIdx = sIdx * 4;
          rSum += imageData.data[pIdx];
          gSum += imageData.data[pIdx + 1];
          bSum += imageData.data[pIdx + 2];
          sampleCount++;
        }
      }

      const avgLum = lumSum / sampleCount; // 0 (black) to 1 (white)
      // Darker areas get larger ink dots (unless inverted)
      const darkness = invert ? avgLum : 1 - avgLum;

      if (darkness < 0.05) continue; // Skip near-invisible dots

      const radius = darkness * maxDotRadius;
      let fill = dotColor;

      if (colorMode === 'color') {
        fill = rgbToHex(rSum / sampleCount, gSum / sampleCount, bSum / sampleCount);
      }

      if (shape === 'circle') {
        elements.push(
          `    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(2)}" fill="${fill}" />`
        );
      } else if (shape === 'square') {
        const size = radius * 2;
        elements.push(
          `    <rect x="${(x - radius).toFixed(1)}" y="${(y - radius).toFixed(1)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" fill="${fill}" />`
        );
      } else {
        // Diamond
        const d = `M ${x.toFixed(1)} ${(y - radius).toFixed(1)} L ${(x + radius).toFixed(1)} ${y.toFixed(1)} L ${x.toFixed(1)} ${(y + radius).toFixed(1)} L ${(x - radius).toFixed(1)} ${y.toFixed(1)} Z`;
        elements.push(`    <path d="${d}" fill="${fill}" />`);
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="halftone-dot-matrix">
${elements.join('\n')}
  </g>
</svg>`;

  return { svg, dotCount: elements.length };
}
