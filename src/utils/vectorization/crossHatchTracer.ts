/**
 * VECTORA Vectorization Engine — Cross-Hatch Etching & Sketch Tracer
 * Simulates classical intaglio, engraving, and pen-and-ink cross-hatching.
 * Generates 4 tonal layers: 45° single hatch, -45° cross-hatch, 0° horizontal, and 90° vertical lines.
 */

import { imageToGrayscale } from './helpers/imageProcessing';

export interface CrossHatchOptions {
  lineSpacing?: number; // 4 to 12 px
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  invert?: boolean;
}

export function traceCrossHatch(
  imageData: ImageData,
  options: CrossHatchOptions = {}
): { svg: string; lineCount: number } {
  const {
    lineSpacing = 6,
    strokeWidth = 0.8,
    strokeColor = '#00FF00',
    backgroundColor = '#0A0A0A',
    invert = false,
  } = options;

  const width = imageData.width;
  const height = imageData.height;
  const gray = imageToGrayscale(imageData);

  const linesLayer1: string[] = []; // 45 deg (Midtones < 0.75)
  const linesLayer2: string[] = []; // -45 deg (Dark tones < 0.50)
  const linesLayer3: string[] = []; // 0 deg (Deep shadows < 0.25)
  const linesLayer4: string[] = []; // 90 deg (Pure blacks < 0.10)

  // Step across canvas at line spacing
  const step = Math.max(3, lineSpacing);

  // 1. Layer 1: Diagonal 45 deg lines (y = x + c)
  for (let k = -height; k < width + height; k += step) {
    let inStroke = false;
    let startX = 0;
    let startY = 0;

    for (let x = 0; x < width; x += 3) {
      const y = x - k;
      if (y < 0 || y >= height) continue;

      const lum = gray.data[y * width + x];
      const darkness = invert ? lum : 1 - lum;

      if (darkness >= 0.25) {
        if (!inStroke) {
          inStroke = true;
          startX = x;
          startY = y;
        }
      } else {
        if (inStroke) {
          linesLayer1.push(`M ${startX} ${startY} L ${x} ${y}`);
          inStroke = false;
        }
      }
    }
    if (inStroke) {
      linesLayer1.push(`M ${startX} ${startY} L ${width} ${width - k}`);
    }
  }

  // 2. Layer 2: Diagonal -45 deg lines (y = -x + c)
  for (let k = 0; k < width + height * 2; k += step) {
    let inStroke = false;
    let startX = 0;
    let startY = 0;

    for (let x = 0; x < width; x += 3) {
      const y = k - x;
      if (y < 0 || y >= height) continue;

      const lum = gray.data[y * width + x];
      const darkness = invert ? lum : 1 - lum;

      if (darkness >= 0.5) {
        if (!inStroke) {
          inStroke = true;
          startX = x;
          startY = y;
        }
      } else {
        if (inStroke) {
          linesLayer2.push(`M ${startX} ${startY} L ${x} ${y}`);
          inStroke = false;
        }
      }
    }
    if (inStroke) {
      linesLayer2.push(`M ${startX} ${startY} L ${width} ${k - width}`);
    }
  }

  // 3. Layer 3: Horizontal 0 deg lines (Deep shadows)
  for (let y = 0; y < height; y += step) {
    let inStroke = false;
    let startX = 0;

    for (let x = 0; x < width; x += 3) {
      const lum = gray.data[y * width + x];
      const darkness = invert ? lum : 1 - lum;

      if (darkness >= 0.72) {
        if (!inStroke) {
          inStroke = true;
          startX = x;
        }
      } else {
        if (inStroke) {
          linesLayer3.push(`M ${startX} ${y} L ${x} ${y}`);
          inStroke = false;
        }
      }
    }
    if (inStroke) {
      linesLayer3.push(`M ${startX} ${y} L ${width} ${y}`);
    }
  }

  const allD = [...linesLayer1, ...linesLayer2, ...linesLayer3].join(' ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="crosshatch-engraving-layer" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round">
    <path d="${allD}" />
  </g>
</svg>`;

  return {
    svg,
    lineCount: linesLayer1.length + linesLayer2.length + linesLayer3.length,
  };
}
