/**
 * SVG → VectorDocument importer (adapter).
 *
 * Parses an SVG string via DOMParser and builds the canonical document
 * tree, preserving:
 *   - element ids and all attributes (by qualified name, incl. namespaces)
 *   - non-SVG namespaces (Inkscape sodipodi:/inkscape:, xlink:)
 *   - <style> blocks, text content, comments
 *
 * Node identity: elements that carry an `id` keep a stable uid across
 * re-imports when `preserveUidsFrom` is provided (used for AI refinement
 * and code edits, where the model/editor usually preserves layer ids).
 */

import { newUid } from './ids';
import {
  SCHEMA_VERSION,
  SVG_NS,
  XMLNS_NS,
  type CommentNode,
  type DocumentMetadata,
  type ElementNode,
  type PageNode,
  type TextNode,
  type VectorDocument,
  type VectorNode,
  type ViewBox,
} from './types';
import { walkElements } from './tree';

export interface ImportOptions {
  documentId?: string;
  name?: string;
  metadata?: Partial<DocumentMetadata>;
  /** Previous document: elements whose ids match keep their uids. */
  preserveUidsFrom?: VectorDocument;
}

/** Parse a viewBox attribute ("x y w h") — returns null when absent/invalid. */
export function parseViewBox(value: string | undefined): ViewBox | null {
  if (!value) return null;
  const parts = value.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

function uidMapFromPrevious(previous: VectorDocument | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!previous) return map;
  walkElements(previous, (node) => {
    const elementId = node.attrs['id'];
    if (elementId && !map.has(elementId)) map.set(elementId, node.uid);
  });
  return map;
}

function domAttrsToRecord(el: Element): {
  attrs: Record<string, string>;
  nsByAttr: Record<string, string> | undefined;
} {
  const attrs: Record<string, string> = {};
  let nsByAttr: Record<string, string> | undefined;
  for (const attr of Array.from(el.attributes)) {
    attrs[attr.name] = attr.value;
    // Record namespace URIs for serialization fidelity. xmlns declarations
    // are re-emitted by prefix rule on export; other namespaced attributes
    // (inkscape:label, xlink:href) need their URI stored explicitly.
    if (attr.namespaceURI && attr.namespaceURI !== XMLNS_NS) {
      (nsByAttr ??= {})[attr.name] = attr.namespaceURI;
    }
  }
  return { attrs, nsByAttr };
}

function importChildNodes(
  domNode: Node,
  uidByElementId: Map<string, string>,
  counter: { n: number },
  parentKind: string,
): VectorNode[] {
  const out: VectorNode[] = [];

  /**
   * Whitespace-only text between elements is insignificant in SVG (it is
   * not rendered) — skipping it keeps the tree clean and the exported SVG
   * compact. Inside <text> (rendered glyphs) and <style> (CSS source) the
   * content is significant and preserved verbatim.
   */
  const isSignificantText = (text: string): boolean =>
    text.trim().length > 0 || parentKind === 'text' || parentKind === 'style';

  const pushText = (text: string) => {
    if (!isSignificantText(text)) return;
    const prev = out[out.length - 1];
    if (prev && prev.type === 'text') prev.text += text;
    else
      out.push({
        type: 'text',
        uid: newUid(`n${(counter.n++).toString(36)}`),
        text,
      } satisfies TextNode);
  };

  for (const child of Array.from(domNode.childNodes)) {
    switch (child.nodeType) {
      case 1: {
        // Element
        const el = child as Element;
        const { attrs, nsByAttr } = domAttrsToRecord(el);
        const elementId = attrs['id'];
        const uid =
          elementId && uidByElementId.has(elementId)
            ? uidByElementId.get(elementId)!
            : newUid(`n${(counter.n++).toString(36)}`);
        const node: ElementNode = {
          type: 'element',
          uid,
          kind: el.localName || el.nodeName.toLowerCase(),
          attrs,
          children: importChildNodes(el, uidByElementId, counter, el.localName || ''),
        };
        if (nsByAttr) node.nsByAttr = nsByAttr;
        if (el.namespaceURI && el.namespaceURI !== SVG_NS) node.ns = el.namespaceURI;
        out.push(node);
        break;
      }
      case 3: {
        // Text
        pushText(child.nodeValue ?? '');
        break;
      }
      case 4: {
        // CDATA — kept as text content (lossy on the CDATA marker itself).
        pushText(child.nodeValue ?? '');
        break;
      }
      case 8: {
        // Comment
        out.push({
          type: 'comment',
          uid: newUid(`n${(counter.n++).toString(36)}`),
          text: child.nodeValue ?? '',
        } satisfies CommentNode);
        break;
      }
      default:
        break;
    }
  }
  return out;
}

/**
 * Import an SVG string as a canonical document.
 * Returns null when the input is not parseable or has no <svg> root.
 */
export function importSvg(svg: string, options: ImportOptions = {}): VectorDocument | null {
  if (typeof svg !== 'string' || svg.trim().length === 0) return null;

  let dom: Document;
  try {
    dom = new DOMParser().parseFromString(svg, 'image/svg+xml');
  } catch {
    return null;
  }
  const root = dom.documentElement;
  if (!root || root.localName?.toLowerCase() !== 'svg') return null;
  // DOMParser reports XML errors as a <parsererror> element.
  if (dom.getElementsByTagName('parsererror').length > 0) return null;

  const { attrs, nsByAttr } = domAttrsToRecord(root);
  const viewBox = parseViewBox(attrs['viewBox']);
  const width = Number.parseFloat(attrs['width'] ?? '') || viewBox?.width || 1000;
  const height = Number.parseFloat(attrs['height'] ?? '') || viewBox?.height || 1000;

  const uidByElementId = uidMapFromPrevious(options.preserveUidsFrom);
  const counter = { n: 0 };
  const children = importChildNodes(root, uidByElementId, counter, 'svg');

  // Root-level text/comments (rare) are dropped: the page holds elements.
  const page: PageNode = {
    id: `page-${options.documentId ?? 'root'}`,
    name: 'Page 1',
    width,
    height,
    viewBox,
    attrs,
    nsByAttr,
    children,
  };

  const now = new Date().toISOString();
  const metadata: DocumentMetadata = {
    title: options.metadata?.title ?? options.name ?? 'Untitled Artwork',
    description: options.metadata?.description,
    source: options.metadata?.source ?? 'import',
    createdAt: options.metadata?.createdAt ?? now,
    updatedAt: now,
  };

  return {
    schemaVersion: SCHEMA_VERSION,
    id: options.documentId ?? `doc-${Date.now().toString(36)}`,
    name: options.name ?? metadata.title,
    metadata,
    pages: [page],
  };
}

/** Minimal empty document (fallback when artwork.svg cannot be parsed). */
export function emptyDocument(options: ImportOptions = {}): VectorDocument {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: options.documentId ?? `doc-${Date.now().toString(36)}`,
    name: options.name ?? 'Untitled Artwork',
    metadata: {
      title: options.name ?? 'Untitled Artwork',
      source: 'local',
      createdAt: now,
      updatedAt: now,
    },
    pages: [
      {
        id: `page-${options.documentId ?? 'root'}`,
        name: 'Page 1',
        width: 1000,
        height: 1000,
        viewBox: { x: 0, y: 0, width: 1000, height: 1000 },
        attrs: { xmlns: SVG_NS, viewBox: '0 0 1000 1000' },
        children: [],
      },
    ],
  };
}

/* ─────────────────────────── semantic comparison ─────────────────────── */

/** Stable stringify: object keys sorted, uids and timestamps excluded. */
function canonicalJson(value: unknown): string {
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') {
      const src = v as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(src).sort()) {
        if (key === 'uid' || key === 'createdAt' || key === 'updatedAt') continue;
        out[key] = walk(src[key]);
      }
      return out;
    }
    return v;
  };
  return JSON.stringify(walk(value));
}

/**
 * Compare two SVG strings semantically: equal if they import to the same
 * document tree (ignoring node identity and timestamps). Used to detect
 * cosmetic-only code edits (formatting) so they don't dirty the document
 * or the undo history.
 */
export function svgSemanticallyEqual(a: string, b: string): boolean {
  if (a === b) return true;
  const docA = importSvg(a);
  const docB = importSvg(b);
  if (!docA || !docB) return false;
  return canonicalJson(docA) === canonicalJson(docB);
}
