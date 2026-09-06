/**
 * VECTORA Vectorization Engine — Color Quantized Layered Trace
 * Segments full-color images into N distinct palette colors via K-Means,
 * extracts vector boundary contours for each color slice, and stacks them
 * into beautifully organized Inkscape SVG layers.
 */

import { kMeansQuantize, QuantizedColorCluster } from './helpers/colorMath';
import { Point2D, simplifyRDP, fitCubicBeziers } from './helpers/curveFitting';

export interface ColorQuantizerOptions {
  colorCount?: number; // 2 to 16
  rdpEpsilon?: number;
  minArea?: number;
  includeBackground?: boolean;
}

export function traceColorLayers(
  imageData: ImageData,
  options: ColorQuantizerOptions = {}
): {
  layers: { color: string; pathD: string; cluster: QuantizedColorCluster }[];
  svg: string;
  palette: { name: string; hex: string; role: string }[];
} {
  const {
    colorCount = 6,
    rdpEpsilon = 1.2,
    minArea = 16,
    includeBackground = false,
  } = options;

  const width = imageData.width;
  const height = imageData.height;

  // 1. K-Means Quantization
  const { clusters, indexedMap } = kMeansQuantize(imageData, colorCount, 8, 2);

  // 2. Moore-Neighbor direction offsets
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];

  const layerResults: {
    color: string;
    pathD: string;
    cluster: QuantizedColorCluster;
  }[] = [];

  // Determine background cluster (usually the largest cluster covering edges)
  const bgClusterIdx = 0; // First is largest

  // Trace contours for each color cluster
  clusters.forEach((cluster, clusterIdx) => {
    if (!includeBackground && clusterIdx === bgClusterIdx && clusters.length > 2) {
      return; // Skip backdrop layer
    }

    const visited = new Uint8Array(width * height);
    const subPaths: string[] = [];

    const getPixelMatches = (x: number, y: number): boolean => {
      if (x < 0 || x >= width || y < 0 || y >= height) return false;
      return indexedMap[y * width + x] === clusterIdx;
    };

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = y * width + x;
        if (indexedMap[idx] === clusterIdx && visited[idx] === 0) {
          const leftMatches = x > 0 && indexedMap[idx - 1] === clusterIdx;

          // Boundary detected
          if (!leftMatches) {
            const points: Point2D[] = [];
            let currX = x;
            let currY = y;
            let dir = 6;
            const startX = currX;
            const startY = currY;
            let started = false;
            let steps = 0;
            const maxSteps = width * height;

            while (steps < maxSteps) {
              steps++;
              visited[currY * width + currX] = 1;
              points.push({ x: currX, y: currY });

              let found = false;
              const searchStart = (dir + 5) % 8;

              for (let i = 0; i < 8; i++) {
                const checkDir = (searchStart + i) % 8;
                const nx = currX + dx[checkDir];
                const ny = currY + dy[checkDir];

                if (getPixelMatches(nx, ny)) {
                  currX = nx;
                  currY = ny;
                  dir = checkDir;
                  found = true;
                  break;
                }
              }

              if (!found) break;

              if (started && currX === startX && currY === startY) {
                break;
              }
              started = true;
            }

            // Calculate area
            let area = 0;
            for (let i = 0; i < points.length; i++) {
              const p1 = points[i];
              const p2 = points[(i + 1) % points.length];
              area += p1.x * p2.y - p2.x * p1.y;
            }
            area = Math.abs(area) / 2;

            if (area >= minArea && points.length >= 4) {
              const simplified = simplifyRDP(points, rdpEpsilon);
              if (simplified.length >= 3) {
                const pathD = fitCubicBeziers(simplified, 0.25, true);
                if (pathD) subPaths.push(pathD);
              }
            }
          }
        }
      }
    }

    if (subPaths.length > 0) {
      layerResults.push({
        color: cluster.hex,
        pathD: subPaths.join(' '),
        cluster,
      });
    }
  });

  // Generate layered SVG
  const svgLayers = layerResults
    .map((layer, idx) => {
      const layerName = `Color_Layer_${idx + 1}_${layer.color.replace('#', '')}`;
      return `  <g id="${layerName}" inkscape:groupmode="layer" inkscape:label="${layerName}">
    <path d="${layer.pathD}" fill="${layer.color}" fill-rule="evenodd" />
  </g>`;
    })
    .join('\n');

  const palette = clusters.map((c, i) => ({
    name: `Tone ${i + 1}`,
    hex: c.hex,
    role: i === 0 ? 'background' : i === 1 ? 'primary' : 'accent',
  }));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="${clusters[0]?.hex || '#0A0A0A'}" />
${svgLayers}
</svg>`;

  return {
    layers: layerResults,
    svg,
    palette,
  };
}
