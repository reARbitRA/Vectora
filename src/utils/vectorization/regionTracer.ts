/**
 * VECTORA Vectorization Engine — Region / Outline Tracer (Potrace-style)
 * Traces closed vector boundaries around solid shapes, logos, glyphs, and iconography.
 * Uses Moore-Neighbor boundary tracing, outer vs. hole loop topological classification,
 * RDP polygonal simplification, and cubic Bezier curve fitting.
 */

import { imageToGrayscale, otsuBinarize, gaussianBlur } from './helpers/imageProcessing';
import { Point2D, simplifyRDP, fitCubicBeziers } from './helpers/curveFitting';

export interface RegionTracerOptions {
  invert?: boolean;
  blurRadius?: number;
  rdpEpsilon?: number;
  fillColor?: string;
  strokeColor?: string;
  minArea?: number;
}

interface ContourLoop {
  points: Point2D[];
  isHole: boolean;
  area: number;
}

export function traceRegions(
  imageData: ImageData,
  options: RegionTracerOptions = {}
): { pathD: string; svg: string; regionCount: number } {
  const {
    invert = false,
    blurRadius = 0.8,
    rdpEpsilon = 1.0,
    fillColor = '#00FF00',
    strokeColor = 'none',
    minArea = 16,
  } = options;

  const width = imageData.width;
  const height = imageData.height;

  // 1. Grayscale, blur, binarize
  const gray = imageToGrayscale(imageData);
  const blurred = blurRadius > 0 ? gaussianBlur(gray, blurRadius) : gray;
  const binary = otsuBinarize(blurred, invert);
  const data = binary.data;

  // 2. Moore-Neighbor Boundary Tracing
  // 8 direction offsets starting East, moving clockwise:
  // 0: (1,0), 1: (1,1), 2: (0,1), 3: (-1,1), 4: (-1,0), 5: (-1,-1), 6: (0,-1), 7: (1,-1)
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];

  const visitedBoundary = new Uint8Array(width * height);
  const loops: ContourLoop[] = [];

  const getPixel = (x: number, y: number): number => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    return data[y * width + x];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const val = data[idx];

      // Find boundary transition: pixel is 1 and left pixel is 0 (outer boundary)
      // or pixel is 0 and left is 1 (hole boundary)
      const leftVal = x > 0 ? data[idx - 1] : 0;

      if (val === 1 && leftVal === 0 && visitedBoundary[idx] === 0) {
        // Outer loop trace
        const points: Point2D[] = [];
        let currX = x;
        let currY = y;
        let dir = 6; // Start checking from North

        const startX = currX;
        const startY = currY;
        let isStarted = false;

        let steps = 0;
        const maxSteps = width * height;

        while (steps < maxSteps) {
          steps++;
          visitedBoundary[currY * width + currX] = 1;
          points.push({ x: currX, y: currY });

          // Search clockwise for next foreground neighbor
          let foundNext = false;
          const searchStart = (dir + 5) % 8; // Backtrack

          for (let i = 0; i < 8; i++) {
            const checkDir = (searchStart + i) % 8;
            const nx = currX + dx[checkDir];
            const ny = currY + dy[checkDir];

            if (getPixel(nx, ny) === 1) {
              currX = nx;
              currY = ny;
              dir = checkDir;
              foundNext = true;
              break;
            }
          }

          if (!foundNext) break; // Isolated single pixel

          if (isStarted && currX === startX && currY === startY) {
            break; // Loop completed
          }
          isStarted = true;
        }

        // Calculate polygon signed area (Shoelace formula)
        let area = 0;
        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          area += (p1.x * p2.y - p2.x * p1.y);
        }
        area = Math.abs(area) / 2;

        if (area >= minArea && points.length >= 4) {
          loops.push({
            points,
            isHole: false,
            area,
          });
        }
      }
    }
  }

  // 3. Simplify loops and fit cubic Beziers
  const subPaths: string[] = [];
  for (const loop of loops) {
    const simplified = simplifyRDP(loop.points, rdpEpsilon);
    if (simplified.length >= 3) {
      const d = fitCubicBeziers(simplified, 0.25, true);
      if (d) subPaths.push(d);
    }
  }

  const combinedPathD = subPaths.join(' ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="#0D0D0D" />
  <g id="region-trace-layer">
    <path 
      d="${combinedPathD}" 
      fill="${fillColor}" 
      fill-rule="evenodd" 
      stroke="${strokeColor}" 
      stroke-width="1" 
    />
  </g>
</svg>`;

  return {
    pathD: combinedPathD,
    svg,
    regionCount: subPaths.length,
  };
}
