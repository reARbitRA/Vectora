/**
 * VECTORA Vectorization Engine — Delaunay Low-Poly Triangulation
 * Transforms raster images into stylized low-poly vector mesh artwork.
 * 
 * Pipeline:
 * 1. Grayscale & Sobel gradient analysis to identify high-detail edge regions.
 * 2. Importance-weighted Poisson/jitter sampling of vertices (denser at edges).
 * 3. Bowyer-Watson Delaunay Triangulation algorithm.
 * 4. Sample average pixel RGB color at each triangle centroid.
 * 5. Generate crisp `<polygon>` vector geometry.
 */

import { imageToGrayscale, sobelFilter } from './helpers/imageProcessing';
import { rgbToHex } from './helpers/colorMath';
import { Point2D } from './helpers/curveFitting';

export interface DelaunayOptions {
  pointCount?: number; // e.g. 800 - 3000
  edgeWeight?: number; // 0 to 1
  strokeWidth?: number;
  strokeColor?: string;
}

interface Triangle {
  a: Point2D;
  b: Point2D;
  c: Point2D;
  color: string;
}

function circumcircleContains(a: Point2D, b: Point2D, c: Point2D, p: Point2D): boolean {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-6) return false;

  const ux =
    ((a.x * a.x + a.y * a.y) * (b.y - c.y) +
      (b.x * b.x + b.y * b.y) * (c.y - a.y) +
      (c.x * c.x + c.y * c.y) * (a.y - b.y)) /
    d;
  const uy =
    ((a.x * a.x + a.y * a.y) * (c.x - b.x) +
      (b.x * b.x + b.y * b.y) * (a.x - c.x) +
      (c.x * c.x + c.y * c.y) * (b.x - a.x)) /
    d;

  const rSq = (a.x - ux) * (a.x - ux) + (a.y - uy) * (a.y - uy);
  const pDistSq = (p.x - ux) * (p.x - ux) + (p.y - uy) * (p.y - uy);

  return pDistSq <= rSq;
}

/**
 * Bowyer-Watson Incremental Delaunay Triangulation
 */
export function bowyerWatson(points: Point2D[], width: number, height: number): { a: Point2D; b: Point2D; c: Point2D }[] {
  // Super-triangle enclosing entire canvas
  const margin = 200;
  const p1: Point2D = { x: -margin, y: -margin };
  const p2: Point2D = { x: 2 * width + margin, y: -margin };
  const p3: Point2D = { x: width / 2, y: 2 * height + margin };

  let triangles: { a: Point2D; b: Point2D; c: Point2D }[] = [{ a: p1, b: p2, c: p3 }];

  for (const point of points) {
    const badTriangles: { a: Point2D; b: Point2D; c: Point2D }[] = [];

    for (const tri of triangles) {
      if (circumcircleContains(tri.a, tri.b, tri.c, point)) {
        badTriangles.push(tri);
      }
    }

    // Find polygonal boundary of bad triangles
    const polygonEdges: [Point2D, Point2D][] = [];

    for (const tri of badTriangles) {
      const edges: [Point2D, Point2D][] = [
        [tri.a, tri.b],
        [tri.b, tri.c],
        [tri.c, tri.a],
      ];

      for (const edge of edges) {
        // Edge is shared if it appears in another bad triangle
        let isShared = false;
        for (const other of badTriangles) {
          if (other === tri) continue;
          const otherEdges: [Point2D, Point2D][] = [
            [other.a, other.b],
            [other.b, other.c],
            [other.c, other.a],
          ];
          for (const oe of otherEdges) {
            if (
              (edge[0].x === oe[0].x && edge[0].y === oe[0].y && edge[1].x === oe[1].x && edge[1].y === oe[1].y) ||
              (edge[0].x === oe[1].x && edge[0].y === oe[1].y && edge[1].x === oe[0].x && edge[1].y === oe[0].y)
            ) {
              isShared = true;
              break;
            }
          }
          if (isShared) break;
        }

        if (!isShared) {
          polygonEdges.push(edge);
        }
      }
    }

    // Remove bad triangles
    triangles = triangles.filter((t) => !badTriangles.includes(t));

    // Retriangulate cavity
    for (const edge of polygonEdges) {
      triangles.push({ a: edge[0], b: edge[1], c: point });
    }
  }

  // Remove triangles that share vertices with the super-triangle
  return triangles.filter(
    (t) =>
      t.a !== p1 && t.a !== p2 && t.a !== p3 &&
      t.b !== p1 && t.b !== p2 && t.b !== p3 &&
      t.c !== p1 && t.c !== p2 && t.c !== p3
  );
}

export function traceDelaunay(
  imageData: ImageData,
  options: DelaunayOptions = {}
): { svg: string; triangleCount: number } {
  const {
    pointCount = 1200,
    edgeWeight = 0.75,
    strokeWidth = 0.4,
    strokeColor = 'rgba(0,0,0,0.15)',
  } = options;

  const width = imageData.width;
  const height = imageData.height;

  // 1. Edge & gradient analysis
  const gray = imageToGrayscale(imageData);
  const { magnitude } = sobelFilter(gray);

  // 2. Sample points (combining border pins, regular grid, and edge-weighted rejection)
  const points: Point2D[] = [];

  // Always pin corners & border points for complete canvas coverage
  const borderSteps = 12;
  for (let i = 0; i <= borderSteps; i++) {
    const x = (i / borderSteps) * width;
    points.push({ x, y: 0 });
    points.push({ x, y: height });
  }
  for (let j = 0; j <= borderSteps; j++) {
    const y = (j / borderSteps) * height;
    points.push({ x: 0, y });
    points.push({ x: width, y });
  }

  // Random rejection sampling biased toward edge magnitude
  let attempts = 0;
  const maxAttempts = pointCount * 8;

  while (points.length < pointCount && attempts < maxAttempts) {
    attempts++;
    const rx = Math.floor(Math.random() * width);
    const ry = Math.floor(Math.random() * height);
    const mag = magnitude[ry * width + rx];

    // Probability of accepting point increases with edge magnitude
    const acceptProb = (1 - edgeWeight) * 0.2 + edgeWeight * Math.min(1, mag * 2.5);

    if (Math.random() < acceptProb) {
      points.push({ x: rx, y: ry });
    }
  }

  // 3. Delaunay Triangulation
  const rawTriangles = bowyerWatson(points, width, height);

  // 4. Sample colors at centroid
  const triangles: Triangle[] = rawTriangles.map((tri) => {
    const cx = Math.min(width - 1, Math.max(0, Math.round((tri.a.x + tri.b.x + tri.c.x) / 3)));
    const cy = Math.min(height - 1, Math.max(0, Math.round((tri.a.y + tri.b.y + tri.c.y) / 3)));
    const idx = (cy * width + cx) * 4;

    const r = imageData.data[idx];
    const g = imageData.data[idx + 1];
    const b = imageData.data[idx + 2];
    const hex = rgbToHex(r, g, b);

    return { ...tri, color: hex };
  });

  // 5. Generate SVG
  const polygonsSvg = triangles
    .map((t, i) => {
      const pts = `${t.a.x.toFixed(1)},${t.a.y.toFixed(1)} ${t.b.x.toFixed(1)},${t.b.y.toFixed(1)} ${t.c.x.toFixed(1)},${t.c.y.toFixed(1)}`;
      return `    <polygon id="poly-${i}" points="${pts}" fill="${t.color}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
    })
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <g id="delaunay-mesh-layer">
${polygonsSvg}
  </g>
</svg>`;

  return { svg, triangleCount: triangles.length };
}
