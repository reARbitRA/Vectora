/**
 * VECTORA Vectorization Engine — Zhang-Suen Thinning Algorithm
 * Iteratively erodes binary boundary pixels preserving topological 8-connectivity,
 * reducing thick strokes, handwriting, and outlines to a 1-pixel wide skeleton.
 */

import { BinaryMatrix } from './imageProcessing';

export function zhangSuenThinning(binary: BinaryMatrix): BinaryMatrix {
  const { width, height } = binary;
  // Copy input matrix
  const img = new Uint8Array(binary.data);
  let changed = true;
  let iterations = 0;
  const maxIterations = 500;

  // 8-neighbor lookup offsets around pixel (x, y):
  // P9 P2 P3
  // P8 P1 P4
  // P7 P6 P5

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // Step 1: Flag pixels meeting Sub-iteration 1 conditions
    const toRemove1: number[] = [];

    for (let y = 1; y < height - 1; y++) {
      const row = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = row + x;
        if (img[idx] !== 1) continue;

        const p2 = img[idx - width];
        const p3 = img[idx - width + 1];
        const p4 = img[idx + 1];
        const p5 = img[idx + width + 1];
        const p6 = img[idx + width];
        const p7 = img[idx + width - 1];
        const p8 = img[idx - 1];
        const p9 = img[idx - width - 1];

        // Condition A: 2 <= B(P1) <= 6 (count of non-zero neighbors)
        const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (b < 2 || b > 6) continue;

        // Condition B: A(P1) == 1 (number of 0->1 transitions in clockwise order: p2..p9, p2)
        const neighbors = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
        let a = 0;
        for (let i = 0; i < 8; i++) {
          if (neighbors[i] === 0 && neighbors[i + 1] === 1) a++;
        }
        if (a !== 1) continue;

        // Condition C: P2 * P4 * P6 == 0
        if (p2 * p4 * p6 !== 0) continue;

        // Condition D: P4 * P6 * P8 == 0
        if (p4 * p6 * p8 !== 0) continue;

        toRemove1.push(idx);
      }
    }

    if (toRemove1.length > 0) {
      for (let i = 0; i < toRemove1.length; i++) {
        img[toRemove1[i]] = 0;
      }
      changed = true;
    }

    // Step 2: Sub-iteration 2
    const toRemove2: number[] = [];

    for (let y = 1; y < height - 1; y++) {
      const row = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = row + x;
        if (img[idx] !== 1) continue;

        const p2 = img[idx - width];
        const p3 = img[idx - width + 1];
        const p4 = img[idx + 1];
        const p5 = img[idx + width + 1];
        const p6 = img[idx + width];
        const p7 = img[idx + width - 1];
        const p8 = img[idx - 1];
        const p9 = img[idx - width - 1];

        const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (b < 2 || b > 6) continue;

        const neighbors = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
        let a = 0;
        for (let i = 0; i < 8; i++) {
          if (neighbors[i] === 0 && neighbors[i + 1] === 1) a++;
        }
        if (a !== 1) continue;

        // Condition C': P2 * P4 * P8 == 0
        if (p2 * p4 * p8 !== 0) continue;

        // Condition D': P2 * P6 * P8 == 0
        if (p2 * p6 * p8 !== 0) continue;

        toRemove2.push(idx);
      }
    }

    if (toRemove2.length > 0) {
      for (let i = 0; i < toRemove2.length; i++) {
        img[toRemove2[i]] = 0;
      }
      changed = true;
    }
  }

  return { width, height, data: img };
}
