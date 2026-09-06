/**
 * VECTORA Vectorization Engine — Canny Edge Blueprint Tracer
 * Generates crisp technical blueprint / wireframe line art using Canny edge detection
 * and vector edge segment stitching.
 */

import { imageToGrayscale, cannyEdgeDetection } from './helpers/imageProcessing';
import { Point2D, simplifyRDP, fitCubicBeziers } from './helpers/curveFitting';

export interface CannyTracerOptions {
  lowThreshold?: number; // 0.05 to 0.2
  highThreshold?: number; // 0.15 to 0.4
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  rdpEpsilon?: number;
}

export function traceCannyEdges(
  imageData: ImageData,
  options: CannyTracerOptions = {}
): { svg: string; edgeCount: number } {
  const {
    lowThreshold = 0.08,
    highThreshold = 0.22,
    strokeWidth = 1.4,
    strokeColor = '#00FFFF',
    backgroundColor = '#0A0A0A',
    rdpEpsilon = 1.2,
  } = options;

  const width = imageData.width;
  const height = imageData.height;

  const gray = imageToGrayscale(imageData);
  const edges = cannyEdgeDetection(gray, lowThreshold, highThreshold);
  const data = edges.data;

  // Stitch 1-pixel edges into continuous polylines
  const visited = new Uint8Array(width * height);
  const polylines: Point2D[][] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (data[idx] === 1 && visited[idx] === 0) {
        const line: Point2D[] = [{ x, y }];
        visited[idx] = 1;

        let cx = x;
        let cy = y;
        let searching = true;

        while (searching) {
          searching = false;
          // Look at 8 neighbors
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (data[nIdx] === 1 && visited[nIdx] === 0) {
                  visited[nIdx] = 1;
                  line.push({ x: nx, y: ny });
                  cx = nx;
                  cy = ny;
                  searching = true;
                  break;
                }
              }
            }
            if (searching) break;
          }
        }

        if (line.length >= 4) {
          polylines.push(line);
        }
      }
    }
  }

  // Simplify and fit Beziers
  const pathDList: string[] = [];
  for (const poly of polylines) {
    const simplified = simplifyRDP(poly, rdpEpsilon);
    if (simplified.length >= 2) {
      const d = fitCubicBeziers(simplified, 0.25, false);
      if (d) pathDList.push(d);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="canny-blueprint-layer" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${pathDList.join(' ')}" />
  </g>
</svg>`;

  return { svg, edgeCount: pathDList.length };
}
