/**
 * Browser-side SVG sanitizer (authoritative, DOM-based).
 *
 * EVERY SVG string that reaches `dangerouslySetInnerHTML` must pass through
 * `sanitizeSvg` first — regardless of whether it came from the AI backend,
 * an imported file, localStorage history, or a bundled showcase sample.
 * The server additionally screens AI output (`server/security/svgGuard.ts`),
 * but the client cannot trust the network path, so this is the real gate.
 *
 * Policy (deny-list elements + strict attribute/URL rules, so Inkscape and
 * Illustrator namespace metadata survives untouched):
 *
 *   Elements removed:  script, foreignObject, iframe, embed, object, frame,
 *                      audio, video, handler (SVG 1.2 event element).
 *   Attributes removed: every `on*` event handler; `style` attributes and
 *                      <style> blocks are scrubbed of @import and unsafe url()s.
 *   URL policy: href/xlink:href/src accept only local fragments (`#id`),
 *                      `data:image/*` payloads (for <image>), and http(s) on
 *                      <image>/<a>. `javascript:`, `vbscript:`, and everything
 *                      else is dropped.
 *   SMIL safety:       <animate*>/<set> elements that target `href`-like or
 *                      `on*` attributes are removed (they could otherwise
 *                      animate an event handler or a javascript: URL into
 *                      existence).
 */

export interface SanitizeReport {
  /** Whether the input parsed to an <svg> root document. */
  ok: boolean;
  /** Why the document was rejected (when `ok` is false). */
  reason?: string;
  /** Tag names of removed elements, in encounter order. */
  removedElements: string[];
  /** Names of removed attributes, in encounter order. */
  removedAttributes: string[];
}

export interface SanitizeResult {
  svg: string;
  report: SanitizeReport;
}

const DENIED_ELEMENTS = new Set([
  "script",
  "foreignobject",
  "iframe",
  "embed",
  "object",
  "frame",
  "audio",
  "video",
  "handler",
  "listener",
]);

/** URL schemes permitted in href/src contexts. */
const SAFE_URL_PATTERN = /^(#|data:image\/(?:png|jpeg|jpg|gif|webp|bmp|x-icon)|https?:)/i;
/** Schemes allowed on <a> navigation targets. */
const SAFE_LINK_PATTERN = /^(#|https?:|mailto:)/i;
/** URL attributes that carry resource/namespace references. */
const URL_ATTRIBUTES = new Set(["href", "xlink:href", "src"]);

/** Attributes whose values are URL references (fill="url(#x)" etc.) — local-only. */
const PAINT_ATTRIBUTES = new Set([
  "fill", "stroke", "clip-path", "mask", "filter",
  "marker-start", "marker-mid", "marker-end",
]);

const UNSAFE_CSS_PATTERN = /(@import|expression\s*\(|url\s*\(\s*['"]?\s*(?:javascript|vbscript|data:text\/html):)/gi;

function isEventHandlerAttribute(name: string): boolean {
  return /^on[a-z]+$/i.test(name);
}

function isHrefLikeAttributeName(name: string): boolean {
  return /^xlink:href$|^href$|^src$/i.test(name);
}

function sanitizeCssText(css: string): string {
  return css.replace(UNSAFE_CSS_PATTERN, "");
}

function sanitizeUrlAttribute(value: string, isLink: boolean): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  const pattern = isLink ? SAFE_LINK_PATTERN : SAFE_URL_PATTERN;
  if (pattern.test(trimmed)) {
    return trimmed;
  }
  return null; // null = drop the attribute
}

function sanitizePaintAttribute(value: string): string | null {
  const trimmed = value.trim();
  // url(#local) references and plain values are fine; url(<anything else>) is dropped.
  const urlMatch = /^url\(\s*['"]?([^'")]+)/i.exec(trimmed);
  if (urlMatch) {
    const target = urlMatch[1].trim();
    if (target.startsWith("#")) return trimmed;
    return null;
  }
  return trimmed;
}

/**
 * Sanitize an SVG string for safe inline rendering.
 * On unrecoverable input, returns a minimal empty `<svg>` and `ok: false`.
 */
export function sanitizeSvg(svgString: string): SanitizeResult {
  const report: SanitizeReport = {
    ok: true,
    removedElements: [],
    removedAttributes: [],
  };

  if (typeof svgString !== "string" || svgString.trim().length === 0) {
    report.ok = false;
    report.reason = "Empty SVG input";
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', report };
  }

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(svgString, "image/svg+xml");
  } catch {
    report.ok = false;
    report.reason = "Input could not be parsed as SVG";
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', report };
  }

  const root = doc.documentElement;
  if (!root || root.localName?.toLowerCase() !== "svg" || root.namespaceURI === null) {
    report.ok = false;
    report.reason = "Document root is not an <svg> element";
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', report };
  }

  // Walk every element (including defs, symbols, masks…).
  const elements = Array.from(root.getElementsByTagName("*"));
  for (const el of elements) {
    const tag = el.localName?.toLowerCase() ?? "";

    if (DENIED_ELEMENTS.has(tag)) {
      report.removedElements.push(tag);
      el.remove();
      continue;
    }

    // SMIL animation elements must not target href-like or event attributes.
    if (tag === "animate" || tag === "animatetransform" || tag === "animatemotion" || tag === "set") {
      const attributeName = el.getAttribute("attributeName") ?? "";
      const targetsForbidden =
        isEventHandlerAttribute(attributeName) || isHrefLikeAttributeName(attributeName);
      const carriesUnsafeUrl = ["from", "to", "values", "by"].some((attr) => {
        const v = el.getAttribute(attr);
        return v !== null && /^\s*(?:javascript|vbscript):/i.test(v);
      });
      if (targetsForbidden || carriesUnsafeUrl) {
        report.removedElements.push(tag);
        el.remove();
        continue;
      }
    }

    const isLink = tag === "a";

    // Attribute pass.
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (isEventHandlerAttribute(name)) {
        report.removedAttributes.push(`${tag}[${attr.name}]`);
        el.removeAttribute(attr.name);
        continue;
      }

      if (name === "style") {
        const cleaned = sanitizeCssText(value);
        if (cleaned !== value) {
          report.removedAttributes.push(`${tag}[style]`);
          if (cleaned.trim()) el.setAttribute("style", cleaned);
          else el.removeAttribute("style");
        }
        continue;
      }

      if (URL_ATTRIBUTES.has(name)) {
        const kept = sanitizeUrlAttribute(value, isLink);
        if (kept === null) {
          report.removedAttributes.push(`${tag}[${attr.name}]`);
          el.removeAttribute(attr.name);
        } else if (kept !== value) {
          el.setAttribute(attr.name, kept);
        }
        continue;
      }

      if (PAINT_ATTRIBUTES.has(name)) {
        const kept = sanitizePaintAttribute(value);
        if (kept === null) {
          report.removedAttributes.push(`${tag}[${attr.name}]`);
          el.removeAttribute(attr.name);
        }
        continue;
      }
    }

    // <style> element text content.
    if (tag === "style") {
      const css = el.textContent ?? "";
      const cleaned = sanitizeCssText(css);
      if (cleaned !== css) {
        report.removedElements.push("style-rules");
        el.textContent = cleaned;
      }
    }
  }

  let svg: string;
  try {
    svg = new XMLSerializer().serializeToString(root);
  } catch {
    report.ok = false;
    report.reason = "Sanitized document could not be serialized";
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', report };
  }

  return { svg, report };
}

/** Convenience wrapper: sanitize and return only the markup. */
export function sanitizeSvgMarkup(svgString: string): string {
  return sanitizeSvg(svgString).svg;
}
