/**
 * VectorDocument → SVG exporter (adapter).
 *
 * Serialization rules that preserve import fidelity:
 *   - the root element is created in the SVG namespace; the literal `xmlns`
 *     attribute is not re-set (the serializer emits it from the namespace)
 *   - `xmlns:*` declarations are re-emitted via the special XMLNS namespace
 *   - namespaced attributes (inkscape:label, xlink:href) are set with
 *     setAttributeNS so the serializer declares their namespaces
 *   - text and comment nodes round-trip as DOM text/comment nodes
 */

import {
  SVG_NS,
  XMLNS_NS,
  type ElementNode,
  type PageNode,
  type VectorDocument,
  type VectorNode,
} from './types';

function buildNode(node: VectorNode, doc: Document, depth: number): globalThis.Node {
  if (node.type === 'text') {
    return doc.createTextNode(node.text);
  }
  if (node.type === 'comment') {
    return doc.createComment(node.text);
  }
  const el = doc.createElementNS(node.ns ?? SVG_NS, node.kind);
  for (const [name, value] of Object.entries(node.attrs)) {
    if (node.nsByAttr && Object.prototype.hasOwnProperty.call(node.nsByAttr, name)) {
      el.setAttributeNS(node.nsByAttr[name], name, value);
    } else {
      el.setAttribute(name, value);
    }
  }
  appendChildren(el, node.children, doc, depth);
  return el;
}

/**
 * Append children with canonical pretty-printing: element/comment-only
 * content is indented (insignificant whitespace in SVG); mixed content
 * (any text node — <text>, <style>) is serialized inline so rendered
 * glyphs and CSS source are preserved verbatim.
 */
function appendChildren(el: Element, children: VectorNode[], doc: Document, depth: number): void {
  if (children.length === 0) return;
  const hasTextChild = children.some((c) => c.type === 'text');
  if (hasTextChild) {
    for (const child of children) {
      el.appendChild(buildNode(child, doc, depth + 1));
    }
    return;
  }
  const indent = '\n' + '  '.repeat(depth + 1);
  const closingIndent = '\n' + '  '.repeat(depth);
  for (const child of children) {
    el.appendChild(doc.createTextNode(indent));
    el.appendChild(buildNode(child, doc, depth + 1));
  }
  el.appendChild(doc.createTextNode(closingIndent));
}

function buildPage(page: PageNode, doc: Document): Element {
  const root = doc.createElementNS(SVG_NS, 'svg');
  for (const [name, value] of Object.entries(page.attrs)) {
    if (name === 'xmlns') continue; // provided by the element namespace
    if (name.startsWith('xmlns:')) {
      root.setAttributeNS(XMLNS_NS, name, value);
    } else if (page.nsByAttr && Object.prototype.hasOwnProperty.call(page.nsByAttr, name)) {
      root.setAttributeNS(page.nsByAttr[name], name, value);
    } else {
      root.setAttribute(name, value);
    }
  }
  appendChildren(root, page.children, doc, 0);
  return root;
}

/** Serialize the document's first page to a canonical, pretty-printed SVG string. */
export function documentToSvg(doc: VectorDocument): string {
  const page = doc.pages[0];
  if (!page) {
    return `<svg xmlns="${SVG_NS}" viewBox="0 0 1000 1000"></svg>`;
  }
  const dom = document.implementation.createDocument(SVG_NS, 'svg', null);
  const root = buildPage(page, dom);
  return new XMLSerializer().serializeToString(root);
}

/** Count elements in the document (cheap metric for budgets/diffs). */
export function countElements(doc: VectorDocument): number {
  let count = 0;
  const descend = (children: VectorNode[]) => {
    for (const child of children) {
      if (child.type === 'element') {
        count++;
        descend(child.children);
      }
    }
  };
  for (const page of doc.pages) descend(page.children);
  return count;
}
