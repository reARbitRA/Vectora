/**
 * Stable node identity generation.
 *
 * uids are internal to the document model; they are never serialized into
 * SVG output. On import, an element that carries an id keeps a deterministic
 * mapping (element id → uid) so that identity survives re-imports (AI
 * refinement, code edits) — see `importSvg({ preserveUidsFrom })`.
 */

const USED = new Set<string>();

function randomHex(byteCount: number): string {
  const bytes = new Uint8Array(byteCount);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    // Deterministic fallback for non-crypto environments.
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Generate a unique node uid. */
export function newUid(prefix = 'n'): string {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `${prefix}-${randomHex(6)}`;
    if (!USED.has(candidate)) {
      USED.add(candidate);
      return candidate;
    }
  }
  // Practically unreachable; last resort with a timestamp component.
  const candidate = `${prefix}-${Date.now().toString(36)}-${randomHex(4)}`;
  USED.add(candidate);
  return candidate;
}

/** Test seam: forget all generated uids. */
export function resetUidPool(): void {
  USED.clear();
}
