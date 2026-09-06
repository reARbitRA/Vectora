/**
 * VECTORA Vectorization Engine — Potrace-Style Region & Silhouette Tracer
 * High-performance client-side polygonal boundary and Bezier contour vectorizer.
 */

import { traceRegions, RegionTracerOptions } from './regionTracer';

export interface PotraceOptions extends RegionTracerOptions {
  turdSize?: number; // Minimum area threshold (turdsize in Potrace spec)
  alphamax?: number; // Corner threshold parameter
  opticurve?: boolean;
}

/**
 * Executes Potrace-style closed-boundary vector tracing on ImageData.
 */
export function tracePotrace(
  imageData: ImageData,
  options: PotraceOptions = {}
): { pathD: string; svg: string; regionCount: number } {
  const minArea = options.turdSize !== undefined ? options.turdSize : options.minArea || 16;
  return traceRegions(imageData, {
    ...options,
    minArea,
  });
}

export const potraceTracer = tracePotrace;
export { traceRegions, type RegionTracerOptions };
