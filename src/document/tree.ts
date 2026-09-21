/**
 * Immutable tree operations for VectorDocument.
 *
 * Every mutation returns a NEW document with only the affected path copied
 * (persistent-data-structure style). If an operation changes nothing, the
 * SAME document instance is returned — the history manager relies on this
 * identity check to skip no-op entries.
 *
 * These functions never touch the DOM; they are testable in plain node.
 */

import type { ElementNode, PageNode, VectorDocument, VectorNode } from './types';
import { newUid } from './ids';

/** A node plus where it was found. `parent` is an ElementNode or the PageNode. */
export interface LocatedNode {
  node: ElementNode;
  parent: ElementNode | PageNode;
  parentUid: string | null; // null → parent is a page
  index: number;
  page: number;
}

function childrenOf(parent: ElementNode | PageNode): VectorNode[] {
  return parent.children;
}

/** Depth-first search for an element node by uid. */
export function findNode(doc: VectorDocument, uid: string): LocatedNode | null {
  for (let p = 0; p < doc.pages.length; p++) {
    const page = doc.pages[p];
    const found = findInChildren(page.children, page, null, p, uid);
    if (found) return found;
  }
  return null;
}

function findInChildren(
  children: VectorNode[],
  parent: ElementNode | PageNode,
  parentUid: string | null,
  page: number,
  uid: string,
): LocatedNode | null {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type !== 'element') continue;
    if (child.uid === uid) {
      return { node: child, parent, parentUid, index: i, page };
    }
    const deeper = findInChildren(child.children, child, child.uid, page, uid);
    if (deeper) return deeper;
  }
  return null;
}

/** Visit every element node in document order. */
export function walkElements(
  doc: VectorDocument,
  visit: (node: ElementNode, parent: ElementNode | PageNode) => void,
): void {
  const descend = (children: VectorNode[], parent: ElementNode | PageNode) => {
    for (const child of children) {
      if (child.type !== 'element') continue;
      visit(child, parent);
      descend(child.children, child);
    }
  };
  for (const page of doc.pages) descend(page.children, page);
}

/**
 * Return a new document with `updater` applied to the element identified by
 * `uid`. If the updater returns the same node object, the same document
 * instance is returned (no change).
 */
export function updateElement(
  doc: VectorDocument,
  uid: string,
  updater: (node: ElementNode) => ElementNode,
): VectorDocument {
  const mapChildren = (children: VectorNode[]): { children: VectorNode[]; changed: boolean } => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type !== 'element') continue;
      if (child.uid === uid) {
        const next = updater(child);
        if (next === child) return { children, changed: false };
        const copy = children.slice();
        copy[i] = next;
        return { children: copy, changed: true };
      }
      const inner = mapChildren(child.children);
      if (inner.changed) {
        const copy = children.slice();
        copy[i] = { ...child, children: inner.children };
        return { children: copy, changed: true };
      }
    }
    return { children, changed: false };
  };

  let changed = false;
  const pages = doc.pages.map((page, i) => {
    if (changed) return page;
    const result = mapChildren(page.children);
    if (result.changed) {
      changed = true;
      return { ...page, children: result.children };
    }
    return page;
  });
  if (!changed) return doc;
  return { ...doc, pages };
}

/** Update a node's attributes (returns a new document, or the same if unchanged). */
export function updateAttrs(
  doc: VectorDocument,
  uid: string,
  updater: (attrs: Record<string, string>) => Record<string, string>,
): VectorDocument {
  return updateElement(doc, uid, (node) => {
    const nextAttrs = updater(node.attrs);
    if (nextAttrs === node.attrs) return node;
    return { ...node, attrs: nextAttrs };
  });
}

/** Set or remove a single attribute. `value === null` removes the attribute. */
export function setAttr(
  attrs: Record<string, string>,
  name: string,
  value: string | null,
): Record<string, string> {
  const exists = Object.prototype.hasOwnProperty.call(attrs, name);
  if (value === null) {
    if (!exists) return attrs;
    const { [name]: _removed, ...rest } = attrs;
    return rest;
  }
  if (exists && attrs[name] === value) return attrs;
  return { ...attrs, [name]: value };
}

/** Update a text/comment node's content. */
export function updateTextNode(
  doc: VectorDocument,
  uid: string,
  text: string,
): VectorDocument {
  const mapChildren = (children: VectorNode[]): { children: VectorNode[]; changed: boolean } => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if ((child.type === 'text' || child.type === 'comment') && child.uid === uid) {
        if (child.text === text) return { children, changed: false };
        const copy = children.slice();
        copy[i] = { ...child, text };
        return { children: copy, changed: true };
      }
      if (child.type !== 'element') continue;
      const inner = mapChildren(child.children);
      if (inner.changed) {
        const copy = children.slice();
        copy[i] = { ...child, children: inner.children };
        return { children: copy, changed: true };
      }
    }
    return { children, changed: false };
  };

  let changed = false;
  const pages = doc.pages.map((page) => {
    if (changed) return page;
    const result = mapChildren(page.children);
    if (result.changed) {
      changed = true;
      return { ...page, children: result.children };
    }
    return page;
  });
  if (!changed) return doc;
  return { ...doc, pages };
}

export interface RemovalResult {
  doc: VectorDocument;
  removed: {
    node: VectorNode;
    parentUid: string | null; // null → was a direct child of a page
    index: number;
    page: number;
  };
}

/** Remove a node (any type) by uid. Returns the new doc plus removal details for undo. */
export function removeNode(doc: VectorDocument, uid: string): RemovalResult | null {
  const tryRemove = (
    children: VectorNode[],
  ): { children: VectorNode[]; index: number; node: VectorNode } | null => {
    for (let i = 0; i < children.length; i++) {
      if (children[i].uid === uid) {
        return { children: children.filter((_, j) => j !== i), index: i, node: children[i] };
      }
      const child = children[i];
      if (child.type !== 'element') continue;
      const inner = tryRemove(child.children);
      if (inner) {
        return {
          children: children.map((c, j) => (j === i ? { ...child, children: inner.children } : c)),
          index: inner.index,
          node: inner.node,
        };
      }
    }
    return null;
  };

  for (let p = 0; p < doc.pages.length; p++) {
    const page = doc.pages[p];
    // The page itself cannot be removed here.
    const result = tryRemove(page.children);
    if (result) {
      const pages = doc.pages.slice();
      pages[p] = { ...page, children: result.children };
      return {
        doc: { ...doc, pages },
        removed: { node: result.node, parentUid: null, index: result.index, page: p },
      };
    }
  }
  return null;
}

/**
 * Insert `node` into the tree.
 * @param parentUid element uid to insert into; null inserts into page `pageIndex`.
 */
export function insertNode(
  doc: VectorDocument,
  parentUid: string | null,
  node: VectorNode,
  index: number | null = null,
  pageIndex = 0,
): VectorDocument {
  const doInsert = (children: VectorNode[]): VectorNode[] => {
    const at = index === null ? children.length : Math.max(0, Math.min(index, children.length));
    const copy = children.slice();
    copy.splice(at, 0, node);
    return copy;
  };

  if (parentUid === null) {
    const pages = doc.pages.slice();
    pages[pageIndex] = { ...doc.pages[pageIndex], children: doInsert(doc.pages[pageIndex].children) };
    return { ...doc, pages };
  }

  return updateElement(doc, parentUid, (el) => ({ ...el, children: doInsert(el.children) }));
}

/**
 * Move an element to a new index within its CURRENT parent (layer reorder).
 * Returns the same doc if the index is unchanged or out of bounds.
 */
export function moveNodeWithinParent(
  doc: VectorDocument,
  uid: string,
  newIndex: number,
): { doc: VectorDocument; oldIndex: number } | null {
  const located = findNode(doc, uid);
  if (!located) return null;
  const siblings = childrenOf(located.parent);
  if (newIndex === located.index || newIndex < 0 || newIndex >= siblings.length) {
    return { doc, oldIndex: located.index };
  }

  const rebuild = (children: VectorNode[]): VectorNode[] => {
    const copy = children.slice();
    const [moved] = copy.splice(located.index, 1);
    copy.splice(newIndex, 0, moved);
    return copy;
  };

  if (located.parentUid === null) {
    const pages = doc.pages.slice();
    pages[located.page] = { ...doc.pages[located.page] as PageNode, children: rebuild((located.parent as PageNode).children) };
    return { doc: { ...doc, pages }, oldIndex: located.index };
  }

  const newDoc = updateElement(doc, located.parentUid, (el) => ({
    ...el,
    children: rebuild(el.children),
  }));
  return { doc: newDoc, oldIndex: located.index };
}

/** Clone a subtree with fresh uids (deep copy for duplication commands later). */
export function cloneWithNewUids(node: VectorNode, prefix = 'n'): VectorNode {
  if (node.type === 'element') {
    return {
      ...node,
      uid: newUid(prefix),
      children: node.children.map((c) => cloneWithNewUids(c, prefix)),
    };
  }
  return { ...node, uid: newUid(prefix) };
}