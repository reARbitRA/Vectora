/**
 * VECTORA Vectorization Engine — Marching Squares Contour Line Engraving
 * Extracts smooth elevation isolines based on luminance intervals,
 * producing breathtaking topographic map / contour vector art.
 */

import { imageToGrayscale, gaussianBlur } from './helpers/imageProcessing';
import { Point2D, simplifyRDP, fitCubicBeziers } from './helpers/curveFitting';

export interface ContourOptions {
  levels?: number; // 4 to 16 isoline elevation steps
  blurRadius?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
}

export function traceContours(
  imageData: ImageData,
  options: ContourOptions = {}
): { svg: string; lineCount: number } {
  const {
    levels = 8,
    blurRadius = 2,
    strokeWidth = 1.2,
    strokeColor = '#00FF00',
    backgroundColor = '#0A0A0A',
  } = options;

  const width = imageData.width;
  const height = imageData.height;

  const gray = imageToGrayscale(imageData);
  const blurred = gaussianBlur(gray, blurRadius);
  const data = blurred.data;

  const stepSize = 4; // Grid cell size
  const cols = Math.floor(width / stepSize);
  const rows = Math.floor(height / stepSize);

  const pathSegments: string[] = [];

  // Marching Squares 16-case segment interpolation table
  for (let l = 1; l <= levels; l++) {
    const isovalue = l / (levels + 1);

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const x0 = c * stepSize;
        const y0 = r * stepSize;
        const x1 = x0 + stepSize;
        const y1 = y0 + stepSize;

        const v0 = data[y0 * width + x0]; // top-left
        const v1 = data[y0 * width + x1]; // top-right
        const v2 = data[y1 * width + x1]; // bottom-right
        const v3 = data[y1 * width + x0]; // bottom-left

        // Calculate 4-bit case index
        let caseIdx = 0;
        if (v0 > isovalue) caseIdx |= 8;
        if (v1 > isovalue) caseIdx |= 4;
        if (v2 > isovalue) caseIdx |= 2;
        if (v3 > isovalue) caseIdx |= 1;

        if (caseIdx === 0 || caseIdx === 15) continue;

        // Linear interpolation along edges
        const lerp = (p1: number, p2: number, val1: number, val2: number) => {
          if (Math.abs(val1 - val2) < 1e-5) return (p1 + p2) / 2;
          return p1 + ((isovalue - val1) / (val2 - val1)) * (p2 - p1);
        };

        const top: Point2D = { x: lerp(x0, x1, v0, v1), y: y0 };
        const right: Point2D = { x: x1, y: lerp(y0, y1, v1, v2) };
        const bottom: Point2D = { x: lerp(x0, x1, v3, v2), y: y1 };
        const left: Point2D = { x: x0, y: lerp(y0, y1, v0, v3) };

        const addLine = (p1: Point2D, p2: Point2D) => {
          pathSegments.push(
            `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
          );
        };

        switch (caseIdx) {
          case 1:
          case 14:
            addLine(left, bottom);
            break;
          case 2:
          case 13:
            addLine(bottom, right);
            break;
          case 3:
          case 12:
            addLine(left, right);
            break;
          case 4:
          case 11:
            addLine(top, right);
            break;
          case 5:
            addLine(left, top);
            addLine(bottom, right);
            break;
          case 6:
          case 9:
            addLine(top, bottom);
            break;
          case 7:
          case 8:
            addLine(left, top);
            break;
          case 10:
            addLine(top, right);
            addLine(left, bottom);
            break;
        }
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="topographic-contours" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${pathSegments.join(' ')}" />
  </g>
</svg>`;

  return { svg, lineCount: pathSegments.length };
}
