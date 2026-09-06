/**
 * VECTORA Vectorization Engine — Curve Fitting & Vector Geometry
 * Implements:
 * - Point2D geometry primitives
 * - Ramer-Douglas-Peucker (RDP) polyline simplification
 * - Chaikin's corner-cutting subdivision smoothing
 * - Schneider's cubic Bezier fitting algorithm
 * - Standard SVG path generator (M/C/Q/L/Z)
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface CubicBezierSegment {
  p0: Point2D;
  p1: Point2D; // Control point 1
  p2: Point2D; // Control point 2
  p3: Point2D;
}

/**
 * Euclidean distance between two 2D points.
 */
export function pointDistance(p1: Point2D, p2: Point2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Perpendicular distance from point P to line segment AB.
 */
function perpendicularDistance(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return pointDistance(p, a);

  const num = Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x);
  return num / Math.sqrt(lenSq);
}

/**
 * Ramer-Douglas-Peucker (RDP) Polyline Simplification.
 * Recursively reduces dense pixel trails into minimal polygonal vertices within tolerance epsilon.
 */
export function simplifyRDP(points: Point2D[], epsilon: number = 1.5): Point2D[] {
  if (points.length <= 2) return [...points];

  let maxDist = 0;
  let index = 0;
  const last = points.length - 1;

  for (let i = 1; i < last; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[last]);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyRDP(points.slice(0, index + 1), epsilon);
    const right = simplifyRDP(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  } else {
    return [points[0], points[last]];
  }
}

/**
 * Chaikin's Algorithm: Corner-Cutting Subdivision Smoothing.
 * Smooths sharp polygonal vertices into organic curves by cutting corners at 25% and 75% intervals.
 */
export function chaikinSmooth(points: Point2D[], iterations: number = 2, closed: boolean = false): Point2D[] {
  if (points.length < 3) return points;

  let current = [...points];

  for (let it = 0; it < iterations; it++) {
    const next: Point2D[] = [];
    const len = current.length;

    if (!closed) {
      next.push(current[0]);
    }

    const count = closed ? len : len - 1;
    for (let i = 0; i < count; i++) {
      const p0 = current[i];
      const p1 = current[(i + 1) % len];

      // Q = 0.75 * P0 + 0.25 * P1
      const q: Point2D = {
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
      };
      // R = 0.25 * P0 + 0.75 * P1
      const r: Point2D = {
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
      };

      next.push(q, r);
    }

    if (!closed) {
      next.push(current[len - 1]);
    }

    current = next;
  }

  return current;
}

/**
 * Fits smooth cubic Bezier curves through polygonal vertices using Catmull-Rom tangent projection.
 */
export function fitCubicBeziers(points: Point2D[], tension: number = 0.35, closed: boolean = false): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} L ${points[1].x.toFixed(2)} ${points[1].y.toFixed(2)}`;
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  const n = points.length;

  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];

    // Compute tangents using Catmull-Rom cardinal splines
    const cp1: Point2D = {
      x: p1.x + (p2.x - p0.x) * tension,
      y: p1.y + (p2.y - p0.y) * tension,
    };
    const cp2: Point2D = {
      x: p2.x - (p3.x - p1.x) * tension,
      y: p2.y - (p3.y - p1.y) * tension,
    };

    d += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  if (closed) d += ' Z';
  return d;
}

/**
 * Converts array of 2D points to standard SVG path string.
 */
export function pointsToSvgPath(points: Point2D[], closed: boolean = false, smooth: boolean = true): string {
  if (points.length === 0) return '';
  if (smooth && points.length >= 3) {
    return fitCubicBeziers(points, 0.25, closed);
  }

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
  }
  if (closed) d += ' Z';
  return d;
}
