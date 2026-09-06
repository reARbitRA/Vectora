/**
 * VECTORA Vectorization Engine — Centerline Skeletonization Tracer
 * Transforms handwritten signatures, line drawings, pencil sketches, and line art
 * into crisp 1-pixel vector centerlines with variable stroke-width.
 *
 * Pipeline:
 * 1. Grayscale & Gaussian filtering
 * 2. Otsu thresholding / adaptive binarization
 * 3. Zhang-Suen morphological thinning to 1-pixel skeleton
 * 4. 8-connectivity graph traversal to extract continuous polyline branches
 * 5. Ramer-Douglas-Peucker (RDP) polyline simplification
 * 6. Smooth cubic Bezier fitting into SVG `<path>` elements
 */

import { imageToGrayscale, otsuBinarize, gaussianBlur } from './helpers/imageProcessing';
import { zhangSuenThinning } from './helpers/skeletonize';
import { Point2D, simplifyRDP, fitCubicBeziers } from './helpers/curveFitting';

export interface CenterlineOptions {
  threshold?: number; // 0 to 1, or undefined for auto-Otsu
  invert?: boolean;
  blurRadius?: number;
  rdpEpsilon?: number;
  strokeWidth?: number;
  strokeColor?: string;
  minPathLength?: number;
}

export function traceCenterline(
  imageData: ImageData,
  options: CenterlineOptions = {}
): { paths: string[]; svg: string; polylineCount: number } {
  const {
    invert = false,
    blurRadius = 1,
    rdpEpsilon = 1.2,
    strokeWidth = 3,
    strokeColor = '#00FF00',
    minPathLength = 4,
  } = options;

  const width = imageData.width;
  const height = imageData.height;

  // 1. Grayscale & Blur
  const gray = imageToGrayscale(imageData);
  const blurred = blurRadius > 0 ? gaussianBlur(gray, blurRadius) : gray;

  // 2. Otsu Binarize
  const binary = otsuBinarize(blurred, invert);

  // 3. Zhang-Suen Thinning
  const skeleton = zhangSuenThinning(binary);
  const data = skeleton.data;

  // 4. Extract continuous polyline branches from 1-pixel skeleton
  const visited = new Uint8Array(width * height);
  const polylines: Point2D[][] = [];

  // Helper to count active neighbors
  const getNeighbors = (x: number, y: number): { x: number; y: number; idx: number }[] => {
    const list: { x: number; y: number; idx: number }[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = ny * width + nx;
          if (data[idx] === 1) {
            list.push({ x: nx, y: ny, idx });
          }
        }
      }
    }
    return list;
  };

  // First find endpoints (pixels with exactly 1 neighbor) to start clean paths
  const endpoints: { x: number; y: number }[] = [];
  for (let y = 1; y < height - 1; y++) {
    const row = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = row + x;
      if (data[idx] === 1) {
        const neighbors = getNeighbors(x, y);
        if (neighbors.length === 1) {
          endpoints.push({ x, y });
        }
      }
    }
  }

  // Trace starting from endpoints
  for (const ep of endpoints) {
    const startIdx = ep.y * width + ep.x;
    if (visited[startIdx] === 1) continue;

    const line: Point2D[] = [{ x: ep.x, y: ep.y }];
    visited[startIdx] = 1;

    let currX = ep.x;
    let currY = ep.y;
    let stepping = true;

    while (stepping) {
      const neighbors = getNeighbors(currX, currY).filter((n) => visited[n.idx] === 0);
      if (neighbors.length === 0) {
        stepping = false;
      } else {
        // Pick closest next neighbor
        const next = neighbors[0];
        visited[next.idx] = 1;
        line.push({ x: next.x, y: next.y });
        currX = next.x;
        currY = next.y;
      }
    }

    if (line.length >= minPathLength) {
      polylines.push(line);
    }
  }

  // Trace any remaining loops/cycles that had no endpoints
  for (let y = 1; y < height - 1; y++) {
    const row = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = row + x;
      if (data[idx] === 1 && visited[idx] === 0) {
        const line: Point2D[] = [{ x, y }];
        visited[idx] = 1;

        let currX = x;
        let currY = y;
        let stepping = true;

        while (stepping) {
          const neighbors = getNeighbors(currX, currY).filter((n) => visited[n.idx] === 0);
          if (neighbors.length === 0) {
            stepping = false;
          } else {
            const next = neighbors[0];
            visited[next.idx] = 1;
            line.push({ x: next.x, y: next.y });
            currX = next.x;
            currY = next.y;
          }
        }

        if (line.length >= minPathLength) {
          polylines.push(line);
        }
      }
    }
  }

  // 5. Simplify with RDP and fit smooth Bezier curves
  const pathStrings: string[] = [];
  for (const poly of polylines) {
    const simplified = simplifyRDP(poly, rdpEpsilon);
    if (simplified.length >= 2) {
      const pathD = fitCubicBeziers(simplified, 0.25, false);
      if (pathD) pathStrings.push(pathD);
    }
  }

  // 6. Generate SVG XML
  const pathsSvg = pathStrings
    .map(
      (d, i) =>
        `    <path id="centerline-${i}" d="${d}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" />`
    )
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <filter id="glow-ink" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="#0A0A0A" />
  <g id="centerline-skeleton-layer" filter="url(#glow-ink)">
${pathsSvg}
  </g>
</svg>`;

  return {
    paths: pathStrings,
    svg,
    polylineCount: pathStrings.length,
  };
}
