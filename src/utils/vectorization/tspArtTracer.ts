/**
 * VECTORA Vectorization Engine — Traveling Salesperson (TSP) Single-Stroke Art
 * Solves a Traveling Salesperson path across density-sampled stipple points
 * to construct one single continuous, unbroken vector line representing the entire image.
 */

import { imageToGrayscale } from './helpers/imageProcessing';
import { Point2D, pointDistance, fitCubicBeziers } from './helpers/curveFitting';

export interface TSPOptions {
  pointCount?: number; // 300 to 2000 points
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  smoothPath?: boolean;
}

export function traceTSPSingleLine(
  imageData: ImageData,
  options: TSPOptions = {}
): { svg: string; pathD: string; pointCount: number } {
  const {
    pointCount = 1000,
    strokeWidth = 1.2,
    strokeColor = '#00FF00',
    backgroundColor = '#0A0A0A',
    smoothPath = true,
  } = options;

  const width = imageData.width;
  const height = imageData.height;
  const gray = imageToGrayscale(imageData);

  // 1. Rejection sampling of points weighted by darkness
  const points: Point2D[] = [];
  let attempts = 0;
  const maxAttempts = pointCount * 25;

  while (points.length < pointCount && attempts < maxAttempts) {
    attempts++;
    const rx = Math.floor(Math.random() * width);
    const ry = Math.floor(Math.random() * height);
    const lum = gray.data[ry * width + rx];
    const darkness = 1 - lum;

    if (Math.random() < darkness * darkness) {
      points.push({ x: rx, y: ry });
    }
  }

  if (points.length < 3) {
    return { svg: '', pathD: '', pointCount: 0 };
  }

  // 2. Nearest Neighbor TSP Heuristic Tour
  const unvisited = new Set<number>();
  for (let i = 1; i < points.length; i++) unvisited.add(i);

  const tour: Point2D[] = [points[0]];
  let currentIdx = 0;

  while (unvisited.size > 0) {
    let nearestIdx = -1;
    let minDist = Infinity;
    const curr = points[currentIdx];

    for (const nextIdx of unvisited) {
      const d = pointDistance(curr, points[nextIdx]);
      if (d < minDist) {
        minDist = d;
        nearestIdx = nextIdx;
      }
    }

    if (nearestIdx !== -1) {
      unvisited.delete(nearestIdx);
      tour.push(points[nearestIdx]);
      currentIdx = nearestIdx;
    } else {
      break;
    }
  }

  // Close the loop back to start
  tour.push(tour[0]);

  // 3. Convert tour to single continuous SVG path
  const pathD = smoothPath
    ? fitCubicBeziers(tour, 0.2, true)
    : `M ${tour.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} Z`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="tsp-single-stroke-layer">
    <path 
      d="${pathD}" 
      fill="none" 
      stroke="${strokeColor}" 
      stroke-width="${strokeWidth}" 
      stroke-linecap="round" 
      stroke-linejoin="round"
      pathLength="1"
    />
  </g>
</svg>`;

  return { svg, pathD, pointCount: tour.length };
}
