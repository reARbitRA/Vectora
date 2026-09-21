/**
 * Server-side SVG guard: defense-in-depth validation for SVG strings that
 * flow through the API (AI output, refine input, export).
 *
 * IMPORTANT SCOPE: Node has no DOMParser, so this module is a
 * pattern-based deny-list, not a full sanitizer. The authoritative,
 * allowlist-based sanitizer for anything rendered in the browser lives in
 * `src/utils/sanitizeSvg.ts` (DOM-based). This guard:
 *
 *   1. rejects documents carrying unambiguous active-content payloads
 *      (`<script>`, event-handler attributes, `javascript:`/`vbscript:` URLs,
 *      `<foreignObject>`, `<embed>`, `<iframe>`, `<object>`), and
 *   2. enforces complexity budgets (byte size, element count) so a
 *      pathological model response cannot take down the client or the
 *      browser renderer.
 */

export interface SvgGuardLimits {
  maxSvgBytes: number;
  maxSvgElements: number;
}

export interface SvgGuardVerdict {
  ok: boolean;
  /** Human-readable reason when rejected. */
  reason?: string;
  /** Dangerous patterns detected (for logs/redacted errors). */
  violations: string[];
}

/** Patterns that indicate active content or resource exfiltration. */
const DENY_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "script-element", pattern: /<\s*script\b/i },
  { name: "event-handler-attribute", pattern: /\bon[a-z]+\s*=/i },
  { name: "javascript-url", pattern: /(?:href|xlink:href|src|from|to|values|filter|clip-path|mask|marker-end|marker-start|marker-mid)\s*=\s*["']\s*javascript\s*:/i },
  { name: "vbscript-url", pattern: /(?:href|xlink:href|src)\s*=\s*["']\s*vbscript\s*:/i },
  { name: "data-html-url", pattern: /(?:href|xlink:href|src)\s*=\s*["']\s*data:text\/html/i },
  { name: "foreign-object", pattern: /<\s*foreignObject\b/i },
  { name: "embed-element", pattern: /<\s*embed\b/i },
  { name: "iframe-element", pattern: /<\s*iframe\b/i },
  { name: "object-element", pattern: /<\s*object\b/i },
  { name: "external-entity", pattern: /<!ENTITY|<!DOCTYPE\s+\w+\s+SYSTEM/i },
  { name: "processing-instruction", pattern: /<\s*\?xml-stylesheet/i },
];

/** Rough element count: opening tags, excluding self-closing duplicates is unnecessary for a budget check. */
function estimateElementCount(svg: string): number {
  const matches = svg.match(/<\s*[a-zA-Z]/g);
  return matches ? matches.length : 0;
}

export function inspectSvg(svg: string, limits: SvgGuardLimits): SvgGuardVerdict {
  if (typeof svg !== "string" || svg.length === 0) {
    return { ok: false, reason: "SVG document is empty", violations: [] };
  }
  if (!/<\s*svg[\s>]/i.test(svg)) {
    return {
      ok: false,
      reason: "Document does not contain an <svg> root element",
      violations: [],
    };
  }
  if (svg.length > limits.maxSvgBytes) {
    return {
      ok: false,
      reason: `SVG exceeds maximum size of ${limits.maxSvgBytes} bytes`,
      violations: ["size-budget"],
    };
  }
  const elementCount = estimateElementCount(svg);
  if (elementCount > limits.maxSvgElements) {
    return {
      ok: false,
      reason: `SVG exceeds maximum element count of ${limits.maxSvgElements}`,
      violations: ["complexity-budget"],
    };
  }
  const violations: string[] = [];
  for (const { name, pattern } of DENY_PATTERNS) {
    if (pattern.test(svg)) violations.push(name);
  }
  if (violations.length > 0) {
    return {
      ok: false,
      reason: "SVG contains disallowed active content or external references",
      violations,
    };
  }
  return { ok: true, violations: [] };
}

/**
 * Strip dangerous constructs from an SVG string (best effort, deny-list).
 * Used for AI-generated output as defense in depth — the browser-side
 * allowlist sanitizer remains the real gate before rendering.
 * Returns the cleaned string plus the list of removed constructs.
 */
export function stripUnsafeSvg(svg: string): { svg: string; removed: string[] } {
  const removed: string[] = [];
  let out = svg;

  // Remove dangerous elements entirely (with their content).
  for (const tag of ["script", "foreignObject", "embed", "iframe", "object", "set"]) {
    const elementRe = new RegExp(`<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\s*/\\s*${tag}\\s*>`, "gi");
    const selfClosingRe = new RegExp(`<\\s*${tag}\\b[^>]*/?>`, "gi");
    if (elementRe.test(out)) {
      out = out.replace(elementRe, "");
      removed.push(`<${tag}>`);
    } else if (selfClosingRe.test(out)) {
      out = out.replace(selfClosingRe, "");
      removed.push(`<${tag}>`);
    }
  }

  // Remove event handler attributes (on*) and javascript:/vbscript:/data:text/html URLs.
  if (/\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i.test(out)) {
    out = out.replace(/\bon[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    removed.push("event-handler");
  }
  const badUrl = /(href|xlink:href|src)\s*=\s*(?:"\s*(?:javascript|vbscript):[^"]*"|'\s*(?:javascript|vbscript):[^']*'|\s*(?:javascript|vbscript):[^\s>]*)/gi;
  if (badUrl.test(out)) {
    out = out.replace(badUrl, "$1=\"\"");
    removed.push("unsafe-url");
  }
  const dataHtmlUrl = /(href|xlink:href|src)\s*=\s*(?:"\s*data:text\/html[^"]*"|'\s*data:text\/html[^']*')/gi;
  if (dataHtmlUrl.test(out)) {
    out = out.replace(dataHtmlUrl, "$1=\"\"");
    removed.push("data-html-url");
  }

  return { svg: out, removed };
}
