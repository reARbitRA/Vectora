/**
 * VECTORA Vectorization Engine — Voronoi Stippling
 * Generates organic stipple dot engravings using weighted rejection sampling
 * and Lloyd's relaxation iterations. Creates vintage pen-stippled art.
 */

import { imageToGrayscale } from './helpers/imageProcessing';
import { rgbToHex } from './helpers/colorMath';
import { Point2D } from './helpers/curveFitting';

export interface StippleOptions {
  dotCount?: number; // 500 to 5000
  relaxationIterations?: number; // 0 to 4
  dotRadius?: number;
  dotColor?: string;
  backgroundColor?: string;
  colorSampling?: boolean;
}

export function traceVoronoiStipple(
  imageData: ImageData,
  options: StippleOptions = {}
): { svg: string; pointCount: number } {
  const {
    dotCount = 2000,
    relaxationIterations = 2,
    dotRadius = 1.8,
    dotColor = '#00FF00',
    backgroundColor = '#0A0A0A',
    colorSampling = false,
  } = options;

  const width = imageData.width;
  const height = imageData.height;
  const gray = imageToGrayscale(imageData);

  // 1. Density-weighted rejection sampling
  const points: Point2D[] = [];
  let attempts = 0;
  const maxAttempts = dotCount * 20;

  while (points.length < dotCount && attempts < maxAttempts) {
    attempts++;
    const rx = Math.floor(Math.random() * width);
    const ry = Math.floor(Math.random() * height);
    const lum = gray.data[ry * width + rx];
    // Darker pixels have higher probability of placing a dot
    const prob = 1 - lum;

    if (Math.random() < prob * prob) {
      points.push({ x: rx, y: ry });
    }
  }

  // 2. Lloyd's Relaxation iterations (simplified grid-based centroid shifting)
  let currentPoints = points;
  for (let iter = 0; iter < relaxationIterations; iter++) {
    const gridRes = 30; // cell size
    const cols = Math.ceil(width / gridRes);
    const rows = Math.ceil(height / gridRes);
    const cells: Point2D[][] = Array.from({ length: cols * rows }, () => []);

    for (const p of currentPoints) {
      const c = Math.min(cols - 1, Math.max(0, Math.floor(p.x / gridRes)));
      const r = Math.min(rows - 1, Math.max(0, Math.floor(p.y / gridRes)));
      cells[r * cols + c].push(p);
    }

    currentPoints = currentPoints.map((p) => {
      const c = Math.min(cols - 1, Math.max(0, Math.floor(p.x / gridRes)));
      const r = Math.min(rows - 1, Math.max(0, Math.floor(p.y / gridRes)));
      const cellPoints = cells[r * cols + c];

      if (cellPoints.length <= 1) return p;

      let repulseX = 0;
      let repulseY = 0;
      for (const other of cellPoints) {
        if (other === p) continue;
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
        if (dist < gridRes / 2) {
          const force = (gridRes / 2 - dist) / dist;
          repulseX += dx * force * 0.1;
          repulseY += dy * force * 0.1;
        }
      }

      return {
        x: Math.min(width - 1, Math.max(0, p.x + repulseX)),
        y: Math.min(height - 1, Math.max(0, p.y + repulseY)),
      };
    });
  }

  // 3. Render stipple circles
  const circles = currentPoints
    .map((p, i) => {
      let fill = dotColor;
      if (colorSampling) {
        const px = Math.min(width - 1, Math.max(0, Math.round(p.x)));
        const py = Math.min(height - 1, Math.max(0, Math.round(p.y)));
        const idx = (py * width + px) * 4;
        fill = rgbToHex(imageData.data[idx], imageData.data[idx + 1], imageData.data[idx + 2]);
      }
      return `    <circle id="stipple-${i}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dotRadius}" fill="${fill}" />`;
    })
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="voronoi-stipple-layer">
${circles}
  </g>
</svg>`;

  return { svg, pointCount: currentPoints.length };
}
