/**
 * Command-based editing engine.
 *
 * Every user-visible mutation is a command with apply/undo over the
 * immutable document. Commands capture the minimal inverse state during
 * apply (an old attribute value, a removed node and its position), so undo
 * is precise rather than snapshot-based — except ReplaceDocumentCommand,
 * which intentionally records a full document (source edits, AI results).
 *
 * Multi-command transactions are grouped by the HistoryManager into a
 * single undo step.
 */

import type { ElementNode, VectorDocument, VectorNode } from './types';
import {
  findNode,
  insertNode,
  moveNodeWithinParent,
  removeNode,
  setAttr,
  updateAttrs,
  updateElement,
  updateTextNode,
} from './tree';
import { newUid } from './ids';

export interface EditorCommand {
  readonly type: string;
  readonly label: string;
  readonly affectedNodeIds: string[];
  apply(doc: VectorDocument): VectorDocument;
  undo(doc: VectorDocument): VectorDocument;
}

/** Reorder direction. Draw order: index 0 paints first (back). */
export type ReorderDirection = 'up' | 'down' | 'top' | 'bottom';

/* ────────────────────────────── attribute commands ───────────────────── */

export class SetNodeAttrCommand implements EditorCommand {
  readonly type = 'set-attr';
  private oldValue: string | null | undefined;
  private applied = false;

  constructor(
    readonly uid: string,
    readonly attr: string,
    readonly value: string | null,
    readonly label = `Set ${attr}`,
  ) {}

  get affectedNodeIds(): string[] {
    return [this.uid];
  }

  apply(doc: VectorDocument): VectorDocument {
    const located = findNode(doc, this.uid);
    if (!located) return doc;
    if (this.oldValue === undefined) {
      this.oldValue = Object.prototype.hasOwnProperty.call(located.node.attrs, this.attr)
        ? located.node.attrs[this.attr]
        : null;
    }
    this.applied = true;
    return updateAttrs(doc, this.uid, (attrs) => setAttr(attrs, this.attr, this.value));
  }

  undo(doc: VectorDocument): VectorDocument {
    if (!this.applied || this.oldValue === undefined) return doc;
    const restore = this.oldValue;
    return updateAttrs(doc, this.uid, (attrs) => setAttr(attrs, this.attr, restore));
  }
}

export class SetNodeTextCommand implements EditorCommand {
  readonly type = 'set-text';
  private oldText: string | undefined;

  constructor(
    readonly uid: string,
    readonly text: string,
    readonly label = 'Edit text content',
  ) {}

  get affectedNodeIds(): string[] {
    return [this.uid];
  }

  apply(doc: VectorDocument): VectorDocument {
    // Capture the old text lazily from the doc being mutated.
    const current = this.locateText(doc);
    if (current !== undefined && this.oldText === undefined) this.oldText = current;
    return updateTextNode(doc, this.uid, this.text);
  }

  undo(doc: VectorDocument): VectorDocument {
    if (this.oldText === undefined) return doc;
    return updateTextNode(doc, this.uid, this.oldText);
  }

  private locateText(doc: VectorDocument): string | undefined {
    let found: string | undefined;
    const descend = (children: VectorNode[]) => {
      for (const child of children) {
        if ((child.type === 'text' || child.type === 'comment') && child.uid === this.uid) {
          found = child.text;
          return;
        }
        if (child.type === 'element') descend(child.children);
      }
    };
    for (const page of doc.pages) descend(page.children);
    return found;
  }
}

/* ───────────────────────────── structural commands ───────────────────── */

export class AddNodeCommand implements EditorCommand {
  readonly type = 'add-node';
  private removed: ReturnType<typeof removeNode> = null;

  constructor(
    readonly node: VectorNode,
    readonly parentUid: string | null,
    readonly index: number | null = null,
    readonly label = 'Add node',
  ) {}

  get affectedNodeIds(): string[] {
    return [this.node.uid, ...(this.parentUid ? [this.parentUid] : [])];
  }

  apply(doc: VectorDocument): VectorDocument {
    if (findNode(doc, this.node.uid)) return doc; // uid collision guard
    return insertNode(doc, this.parentUid, this.node, this.index);
  }

  undo(doc: VectorDocument): VectorDocument {
    this.removed = removeNode(doc, this.node.uid);
    return this.removed ? this.removed.doc : doc;
  }
}

export class RemoveNodeCommand implements EditorCommand {
  readonly type = 'remove-node';
  private snapshot: {
    node: VectorNode;
    parentUid: string | null;
    index: number;
  } | null = null;

  constructor(readonly uid: string, readonly label = 'Delete node') {}

  get affectedNodeIds(): string[] {
    return [this.uid];
  }

  apply(doc: VectorDocument): VectorDocument {
    const result = removeNode(doc, this.uid);
    if (!result) return doc;
    this.snapshot = result.removed;
    return result.doc;
  }

  undo(doc: VectorDocument): VectorDocument {
    if (!this.snapshot) return doc;
    const { node, parentUid, index } = this.snapshot;
    return insertNode(doc, parentUid, node, index);
  }
}

export class ReorderNodeCommand implements EditorCommand {
  readonly type = 'reorder-node';
  private oldIndex: number | null = null;

  constructor(
    readonly uid: string,
    readonly direction: ReorderDirection,
    readonly label = 'Reorder layer',
  ) {}

  get affectedNodeIds(): string[] {
    return [this.uid];
  }

  apply(doc: VectorDocument): VectorDocument {
    const located = findNode(doc, this.uid);
    if (!located) return doc;
    const siblingCount = located.parent.children.length;
    let target = located.index;
    // "up"/Bring Forward = towards the front = later index (paints later).
    if (this.direction === 'up') target = located.index + 1;
    else if (this.direction === 'down') target = located.index - 1;
    else if (this.direction === 'top') target = siblingCount - 1;
    else if (this.direction === 'bottom') target = 0;

    if (target === located.index || target < 0 || target >= siblingCount) return doc;
    const result = moveNodeWithinParent(doc, this.uid, target);
    if (!result) return doc;
    this.oldIndex = result.oldIndex;
    return result.doc;
  }

  undo(doc: VectorDocument): VectorDocument {
    if (this.oldIndex === null) return doc;
    const result = moveNodeWithinParent(doc, this.uid, this.oldIndex);
    return result ? result.doc : doc;
  }
}

/* ─────────────────────────── document-level commands ─────────────────── */

/**
 * Replace the whole document (source edits, AI results, imports).
 * Captures the previous document for undo; `retarget` lets the history
 * manager coalesce rapid consecutive replacements (code typing) into one
 * entry whose undo restores the pre-burst document.
 */
export class ReplaceDocumentCommand implements EditorCommand {
  readonly type = 'replace-document';
  private previous: VectorDocument | undefined;
  private uidSalt = newUid('tx');

  constructor(
    private next: VectorDocument,
    readonly label = 'Replace document',
  ) {}

  get affectedNodeIds(): string[] {
    return [];
  }

  apply(doc: VectorDocument): VectorDocument {
    if (this.previous === undefined) this.previous = doc;
    return this.next;
  }

  undo(doc: VectorDocument): VectorDocument {
    void doc;
    return this.previous ?? doc;
  }

  /** History coalescing: point this entry at a newer document. */
  retarget(next: VectorDocument): void {
    this.next = next;
  }

  /** Stable identity for coalescing consecutive replacements. */
  get coalesceKey(): string {
    return `${this.type}:${this.uidSalt}`;
  }
}

/**
 * Remap the document's colors onto a target palette — a local, deterministic
 * operation (no AI round-trip). Undo restores each touched attribute/text
 * node individually.
 */
export class ApplyPaletteCommand implements EditorCommand {
  readonly type = 'apply-palette';
  private touched: Array<{ uid: string; attr?: string; text?: string }> = [];

  constructor(
    readonly colors: string[],
    readonly label = 'Apply palette',
  ) {}

  get affectedNodeIds(): string[] {
    return this.touched.map((t) => t.uid);
  }

  apply(doc: VectorDocument): VectorDocument {
    this.touched = [];
    const hexRe = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    const currentColors = new Set<string>();
    let working = doc;

    // Pass 1: collect distinct colors in paint-ish attributes and <style> text.
    const collect = (node: ElementNode) => {
      for (const attr of ['fill', 'stroke', 'stop-color', 'color', 'flood-color', 'lighting-color']) {
        const value = node.attrs[attr];
        if (!value) continue;
        for (const match of value.match(hexRe) ?? []) currentColors.add(match.toLowerCase());
      }
      if (node.kind === 'style') {
        for (const child of node.children) {
          if (child.type === 'text') {
            for (const match of (child.text.match(hexRe) ?? [])) currentColors.add(match.toLowerCase());
          }
        }
      }
    };
    const walk = (children: VectorNode[], visit: (n: ElementNode) => void) => {
      for (const child of children) {
        if (child.type === 'element') {
          visit(child);
          walk(child.children, visit);
        }
      }
    };
    for (const page of working.pages) walk(page.children, collect);

    if (currentColors.size === 0 || this.colors.length === 0) return doc;

    const sorted = Array.from(currentColors).sort();
    const mapping = new Map<string, string>();
    sorted.forEach((color, idx) => {
      mapping.set(color, this.colors[idx % this.colors.length]);
    });

    const remapValue = (value: string): string | null => {
      let changed = false;
      const next = value.replace(hexRe, (match) => {
        const target = mapping.get(match.toLowerCase());
        if (target !== undefined) {
          changed = true;
          return target;
        }
        return match;
      });
      return changed ? next : null;
    };

    // Pass 2: apply remapping, recording old values for undo.
    const applyTo = (node: ElementNode) => {
      for (const attr of ['fill', 'stroke', 'stop-color', 'color', 'flood-color', 'lighting-color']) {
        const value = node.attrs[attr];
        if (!value) continue;
        const next = remapValue(value);
        if (next !== null) {
          this.touched.push({ uid: node.uid, attr, text: value });
          working = updateAttrs(working, node.uid, (attrs) => ({ ...attrs, [attr]: next }));
        }
      }
    };
    for (const page of working.pages) walk(page.children, applyTo);

    // <style> text content remap.
    const remapStyleText = (children: VectorNode[]) => {
      for (const child of children) {
        if (child.type === 'element') {
          if (child.kind === 'style') {
            for (const grandchild of child.children) {
              if (grandchild.type === 'text') {
                const next = remapValue(grandchild.text);
                if (next !== null) {
                  this.touched.push({ uid: grandchild.uid, text: grandchild.text });
                  working = updateTextNode(working, grandchild.uid, next);
                }
              }
            }
          }
          remapStyleText(child.children);
        }
      }
    };
    for (const page of working.pages) remapStyleText(page.children);

    return working;
  }

  undo(doc: VectorDocument): VectorDocument {
    let working = doc;
    // Restore in reverse so multiple touches of one node unwind correctly.
    for (const entry of [...this.touched].reverse()) {
      if (entry.attr !== undefined && entry.text !== undefined) {
        const attr = entry.attr;
        const value = entry.text;
        working = updateAttrs(working, entry.uid, (attrs) => ({ ...attrs, [attr]: value }));
      } else if (entry.text !== undefined) {
        working = updateTextNode(working, entry.uid, entry.text);
      }
    }
    return working;
  }
}

/* ─────────────────────────── command factory helpers ─────────────────── */

/** Commands that set a layer's blend mode (attr + style rewrite), matching legacy behavior. */
export function buildBlendModeCommands(doc: VectorDocument, uid: string, blendMode: string): EditorCommand[] {
  const located = findNode(doc, uid);
  if (!located) return [];
  const node = located.node;

  let styleStr = node.attrs['style'] ?? '';
  styleStr = styleStr.replace(/mix-blend-mode\s*:\s*[^;]+;?/gi, '').trim();

  if (blendMode && blendMode !== 'normal') {
    if (styleStr && !styleStr.endsWith(';')) styleStr += ';';
    styleStr = styleStr
      ? `${styleStr} mix-blend-mode: ${blendMode};`
      : `mix-blend-mode: ${blendMode};`;
    return [
      new SetNodeAttrCommand(uid, 'mix-blend-mode', blendMode, 'Set blend mode'),
      new SetNodeAttrCommand(uid, 'style', styleStr.trim(), 'Set blend mode style'),
    ];
  }
  return [
    new SetNodeAttrCommand(uid, 'mix-blend-mode', null, 'Reset blend mode'),
    new SetNodeAttrCommand(uid, 'style', styleStr || null, 'Reset blend mode style'),
  ];
}

/** Commands that rename a layer: inkscape:label + slugified element id. */
export function buildRenameLayerCommands(uid: string, newName: string): EditorCommand[] {
  const slug = newName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  return [
    new SetNodeAttrCommand(uid, 'inkscape:label', newName, 'Rename layer'),
    new SetNodeAttrCommand(uid, 'id', slug, 'Rename layer id'),
  ];
}

/** A fresh empty layer group node. */
export function createLayerNode(name: string): ElementNode {
  const slug = name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  return {
    type: 'element',
    uid: newUid('layer'),
    kind: 'g',
    attrs: {
      id: slug,
      'inkscape:groupmode': 'layer',
      'inkscape:label': name,
    },
    nsByAttr: {
      'inkscape:groupmode': 'http://www.inkscape.org/namespaces/inkscape',
      'inkscape:label': 'http://www.inkscape.org/namespaces/inkscape',
    },
    children: [],
  };
}
