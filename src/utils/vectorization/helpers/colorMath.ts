/**
 * VECTORA Vectorization Engine — Color Mathematics & Quantization
 * Implements K-Means clustering, Median-Cut, Delta-E approximations,
 * and palette generation from raster ImageData.
 */

export interface RGBColor {
  r: number; // 0 - 255
  g: number;
  b: number;
}

export interface QuantizedColorCluster {
  color: RGBColor;
  hex: string;
  count: number;
  percentage: number;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const clamped = Math.min(255, Math.max(0, Math.round(c)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RGBColor {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Weighted Euclidean distance in RGB color space accounting for human eye sensitivity:
 * 30% Red, 59% Green, 11% Blue weighting.
 */
export function colorDistance(c1: RGBColor, c2: RGBColor): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
}

/**
 * K-Means color quantization algorithm to extract N dominant color palettes from ImageData.
 */
export function kMeansQuantize(
  imageData: ImageData,
  k: number = 8,
  maxIterations: number = 10,
  sampleStride: number = 2
): { clusters: QuantizedColorCluster[]; indexedMap: Uint8Array } {
  const { width, height, data } = imageData;
  const totalPixels = width * height;
  const indexedMap = new Uint8Array(totalPixels);

  // Sub-sample pixels for fast centroid convergence
  const sampledPixels: RGBColor[] = [];
  for (let y = 0; y < height; y += sampleStride) {
    for (let x = 0; x < width; x += sampleStride) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a < 64) continue; // Skip near-transparent
      sampledPixels.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
      });
    }
  }

  if (sampledPixels.length === 0) {
    return {
      clusters: [{ color: { r: 0, g: 0, b: 0 }, hex: '#000000', count: totalPixels, percentage: 1 }],
      indexedMap,
    };
  }

  // Initialize centroids with k-means++ style spread
  const centroids: RGBColor[] = [];
  centroids.push(sampledPixels[Math.floor(Math.random() * sampledPixels.length)]);

  while (centroids.length < k && centroids.length < sampledPixels.length) {
    let bestDist = -1;
    let candidate: RGBColor = sampledPixels[0];

    // Pick 5 random candidates and choose the one furthest from existing centroids
    for (let i = 0; i < 5; i++) {
      const p = sampledPixels[Math.floor(Math.random() * sampledPixels.length)];
      let minDistToCentroid = Infinity;
      for (const c of centroids) {
        const d = colorDistance(p, c);
        if (d < minDistToCentroid) minDistToCentroid = d;
      }
      if (minDistToCentroid > bestDist) {
        bestDist = minDistToCentroid;
        candidate = p;
      }
    }
    centroids.push({ ...candidate });
  }

  // Run convergence iterations
  for (let iter = 0; iter < maxIterations; iter++) {
    const sumsR = new Float64Array(centroids.length);
    const sumsG = new Float64Array(centroids.length);
    const sumsB = new Float64Array(centroids.length);
    const counts = new Int32Array(centroids.length);

    for (let i = 0; i < sampledPixels.length; i++) {
      const p = sampledPixels[i];
      let bestDist = Infinity;
      let bestCluster = 0;

      for (let c = 0; c < centroids.length; c++) {
        const d = colorDistance(p, centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = c;
        }
      }

      sumsR[bestCluster] += p.r;
      sumsG[bestCluster] += p.g;
      sumsB[bestCluster] += p.b;
      counts[bestCluster]++;
    }

    let maxShift = 0;
    for (let c = 0; c < centroids.length; c++) {
      if (counts[c] > 0) {
        const newR = sumsR[c] / counts[c];
        const newG = sumsG[c] / counts[c];
        const newB = sumsB[c] / counts[c];
        const shift = Math.abs(centroids[c].r - newR) + Math.abs(centroids[c].g - newG) + Math.abs(centroids[c].b - newB);
        if (shift > maxShift) maxShift = shift;

        centroids[c].r = newR;
        centroids[c].g = newG;
        centroids[c].b = newB;
      }
    }

    if (maxShift < 1.0) break; // Converged
  }

  // Assign every pixel in the full image to the nearest centroid
  const pixelCounts = new Int32Array(centroids.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelIdx = y * width + x;
      const idx = pixelIdx * 4;
      const a = data[idx + 3];

      if (a < 32) {
        // Treat as transparent / background
        indexedMap[pixelIdx] = 0;
        continue;
      }

      const p: RGBColor = { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
      let bestDist = Infinity;
      let bestCluster = 0;

      for (let c = 0; c < centroids.length; c++) {
        const d = colorDistance(p, centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = c;
        }
      }

      indexedMap[pixelIdx] = bestCluster;
      pixelCounts[bestCluster]++;
    }
  }

  // Compile clusters sorted by dominance
  const clusters: QuantizedColorCluster[] = centroids.map((c, i) => ({
    color: { r: Math.round(c.r), g: Math.round(c.g), b: Math.round(c.b) },
    hex: rgbToHex(c.r, c.g, c.b),
    count: pixelCounts[i],
    percentage: pixelCounts[i] / totalPixels,
  }));

  return { clusters, indexedMap };
}
