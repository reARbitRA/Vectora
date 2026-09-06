/**
 * VECTORA Vectorization Engine — Image Processing Helpers
 * Fast, pure TypeScript algorithms for image manipulation on HTML5 ImageData:
 * - Grayscale conversion
 * - Gaussian Blur (separable kernel)
 * - Otsu's Thresholding (optimal binary binarization)
 * - Sobel Operator (gradient magnitude and orientation)
 * - Canny Edge Detection (with non-maximum suppression & hysteresis)
 * - Floyd-Steinberg Error Diffusion Dithering
 */

export interface GrayscaleMatrix {
  width: number;
  height: number;
  data: Float32Array; // values 0.0 to 1.0 (or 0-255)
}

export interface BinaryMatrix {
  width: number;
  height: number;
  data: Uint8Array; // 0 (background) or 1 (foreground)
}

export interface GradientMatrix {
  width: number;
  height: number;
  magnitude: Float32Array;
  direction: Float32Array; // in radians
}

/**
 * Converts ImageData to a normalized 0.0 - 1.0 luminance matrix.
 * Uses Rec. 709 luminance weights: 0.2126 R + 0.7152 G + 0.0722 B
 */
export function imageToGrayscale(imageData: ImageData): GrayscaleMatrix {
  const { width, height, data } = imageData;
  const gray = new Float32Array(width * height);

  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3] / 255;
    // Composite over white if alpha < 1
    const cr = r * a + 255 * (1 - a);
    const cg = g * a + 255 * (1 - a);
    const cb = b * a + 255 * (1 - a);
    gray[j] = (0.2126 * cr + 0.7152 * cg + 0.0722 * cb) / 255;
  }

  return { width, height, data: gray };
}

/**
 * Separable Gaussian Blur filter to suppress high-frequency noise.
 */
export function gaussianBlur(gray: GrayscaleMatrix, radius: number = 1): GrayscaleMatrix {
  if (radius <= 0) return gray;

  const { width, height, data } = gray;
  const size = radius * 2 + 1;
  const sigma = Math.max(radius / 2, 0.5);
  const kernel = new Float32Array(size);

  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    const g = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = g;
    sum += g;
  }
  for (let i = 0; i < size; i++) kernel[i] /= sum;

  const temp = new Float32Array(width * height);
  const result = new Float32Array(width * height);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const px = Math.min(Math.max(x + k, 0), width - 1);
        acc += data[rowOffset + px] * kernel[k + radius];
      }
      temp[rowOffset + x] = acc;
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let acc = 0;
      for (let k = -radius; k <= radius; k++) {
        const py = Math.min(Math.max(y + k, 0), height - 1);
        acc += temp[py * width + x] * kernel[k + radius];
      }
      result[y * width + x] = acc;
    }
  }

  return { width, height, data: result };
}

/**
 * Otsu's Global Thresholding Method.
 * Computes optimal threshold maximizing inter-class variance between foreground and background.
 * Returns binary matrix where 1 = ink/foreground, 0 = paper/background.
 */
export function otsuBinarize(gray: GrayscaleMatrix, invert: boolean = false): BinaryMatrix {
  const { width, height, data } = gray;
  const total = width * height;
  const histogram = new Int32Array(256);

  for (let i = 0; i < total; i++) {
    const val = Math.min(255, Math.max(0, Math.round(data[i] * 255)));
    histogram[val]++;
  }

  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * histogram[t];

  let sumB = 0;
  let wB = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  const binary = new Uint8Array(total);
  const normalizedThreshold = threshold / 255;

  for (let i = 0; i < total; i++) {
    // Usually ink is darker than paper (data[i] < threshold)
    const isDark = data[i] < normalizedThreshold;
    binary[i] = invert ? (isDark ? 0 : 1) : (isDark ? 1 : 0);
  }

  return { width, height, data: binary };
}

/**
 * Sobel Edge Operator. Computes spatial gradient magnitude and angle for each pixel.
 */
export function sobelFilter(gray: GrayscaleMatrix): GradientMatrix {
  const { width, height, data } = gray;
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    const rowPrev = (y - 1) * width;
    const rowCurr = y * width;
    const rowNext = (y + 1) * width;

    for (let x = 1; x < width - 1; x++) {
      // Gx kernel
      // -1 0 1
      // -2 0 2
      // -1 0 1
      const gx =
        -data[rowPrev + x - 1] +
        data[rowPrev + x + 1] -
        2 * data[rowCurr + x - 1] +
        2 * data[rowCurr + x + 1] -
        data[rowNext + x - 1] +
        data[rowNext + x + 1];

      // Gy kernel
      // -1 -2 -1
      //  0  0  0
      //  1  2  1
      const gy =
        -data[rowPrev + x - 1] -
        2 * data[rowPrev + x] -
        data[rowPrev + x + 1] +
        data[rowNext + x - 1] +
        2 * data[rowNext + x] +
        data[rowNext + x + 1];

      const mag = Math.sqrt(gx * gx + gy * gy);
      const idx = rowCurr + x;
      magnitude[idx] = mag;
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  return { width, height, magnitude, direction };
}

/**
 * Canny Edge Detector with non-maximum suppression & hysteresis tracking.
 */
export function cannyEdgeDetection(
  gray: GrayscaleMatrix,
  lowThreshold: number = 0.08,
  highThreshold: number = 0.2
): BinaryMatrix {
  const blurred = gaussianBlur(gray, 1.2);
  const { width, height, magnitude, direction } = sobelFilter(blurred);
  const suppressed = new Float32Array(width * height);

  // Non-maximum suppression along gradient direction
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const mag = magnitude[idx];
      if (mag < lowThreshold) continue;

      let angle = direction[idx] * (180 / Math.PI);
      if (angle < 0) angle += 180;

      let n1 = 0;
      let n2 = 0;

      // 0 deg (East-West)
      if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
        n1 = magnitude[idx - 1];
        n2 = magnitude[idx + 1];
      }
      // 45 deg (North-East - South-West)
      else if (angle >= 22.5 && angle < 67.5) {
        n1 = magnitude[(y - 1) * width + x + 1];
        n2 = magnitude[(y + 1) * width + x - 1];
      }
      // 90 deg (North-South)
      else if (angle >= 67.5 && angle < 112.5) {
        n1 = magnitude[(y - 1) * width + x];
        n2 = magnitude[(y + 1) * width + x];
      }
      // 135 deg (North-West - South-East)
      else {
        n1 = magnitude[(y - 1) * width + x - 1];
        n2 = magnitude[(y + 1) * width + x + 1];
      }

      if (mag >= n1 && mag >= n2) {
        suppressed[idx] = mag;
      }
    }
  }

  // Hysteresis thresholding & edge linking
  const edges = new Uint8Array(width * height);
  const stack: number[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (suppressed[idx] >= highThreshold && edges[idx] === 0) {
        edges[idx] = 1;
        stack.push(idx);

        while (stack.length > 0) {
          const curr = stack.pop()!;
          const cy = Math.floor(curr / width);
          const cx = curr % width;

          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const ny = cy + dy;
              const nx = cx + dx;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = ny * width + nx;
                if (suppressed[nIdx] >= lowThreshold && edges[nIdx] === 0) {
                  edges[nIdx] = 1;
                  stack.push(nIdx);
                }
              }
            }
          }
        }
      }
    }
  }

  return { width, height, data: edges };
}

/**
 * Floyd-Steinberg Error Diffusion Dithering for smooth continuous-tone quantization.
 */
export function floydSteinbergDither(
  gray: GrayscaleMatrix,
  levels: number = 2
): GrayscaleMatrix {
  const { width, height } = gray;
  const output = new Float32Array(gray.data);

  const quantize = (val: number) => {
    const step = 1 / (levels - 1);
    return Math.round(val / step) * step;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldVal = output[idx];
      const newVal = quantize(oldVal);
      output[idx] = newVal;
      const error = oldVal - newVal;

      // Distribute error to 4 neighbors:
      //      X    7/16
      // 3/16 5/16 1/16
      if (x + 1 < width) output[idx + 1] += error * (7 / 16);
      if (y + 1 < height) {
        if (x - 1 >= 0) output[(y + 1) * width + x - 1] += error * (3 / 16);
        output[(y + 1) * width + x] += error * (5 / 16);
        if (x + 1 < width) output[(y + 1) * width + x + 1] += error * (1 / 16);
      }
    }
  }

  return { width, height, data: output };
}
