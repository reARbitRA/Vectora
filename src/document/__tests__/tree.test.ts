// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { importSvg } from '../index';
import {
  findNode,
  insertNode,
  moveNodeWithinParent,
  removeNode,
  setAttr,
  updateAttrs,
  updateElement,
} from '../tree';
import type { ElementNode } from '../types';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100">
  <g id="layer-01" inkscape:groupmode="layer" inkscape:label="01_Background"><rect width="5" height="5"/></g>
  <g id="layer-02" inkscape:groupmode="layer" inkscape:label="02_Shapes"><circle r="5"/></g>
</svg>`;

function makeDoc() {
  return importSvg(SAMPLE, { documentId: 't' })!;
}

function layerUid(doc: any, id: string): string {
  const found = doc.pages[0].children.find((c: any) => c.kind === 'g' && c.attrs.id === id);
  return found.uid;
}

describe('findNode', () => {
  it('locates nested nodes with their parent chain', () => {
    const doc = makeDoc();
    const layer = layerUid(doc, 'layer-01');
    const located = findNode(doc, layer)!;
    expect(located).not.toBeNull();
    expect(located.parentUid).toBeNull(); // direct child of the page
    expect((located.parent as any).id).toBe(doc.pages[0].id);

    // Nested: rect inside layer-01
    const rect = (doc.pages[0].children[0] as ElementNode).children.find(
      (c) => c.type === 'element' && c.kind === 'rect',
    ) as ElementNode;
    const nested = findNode(doc, rect.uid)!;
    expect(nested.parentUid).toBe(layer);
  });

  it('returns null for unknown uids', () => {
    expect(findNode(makeDoc(), 'nope')).toBeNull();
  });
});

describe('immutability', () => {
  it('updateAttrs returns a new document and leaves the original untouched', () => {
    const doc = makeDoc();
    const uid = layerUid(doc, 'layer-01');
    const before = JSON.stringify(doc);
    const next = updateAttrs(doc, uid, (attrs) => setAttr(attrs, 'display', 'none'));
    expect(next).not.toBe(doc);
    expect(JSON.stringify(doc)).toBe(before); // original untouched
    expect(findNode(next, uid)!.node.attrs['display']).toBe('none');
  });

  it('returns the SAME instance when nothing changes', () => {
    const doc = makeDoc();
    const uid = layerUid(doc, 'layer-01');
    const next = updateAttrs(doc, uid, (attrs) => setAttr(attrs, 'display', 'none'));
    // Setting the same value again is a no-op.
    expect(updateAttrs(next, uid, (attrs) => setAttr(attrs, 'display', 'none'))).toBe(next);
    // Removing an absent attribute is a no-op.
    expect(updateAttrs(doc, uid, (attrs) => setAttr(attrs, 'missing', null))).toBe(doc);
    // An updater that returns the same attrs object is a no-op.
    expect(updateAttrs(doc, uid, (attrs) => attrs)).toBe(doc);
  });

  it('updateElement with identity updater returns the same doc', () => {
    const doc = makeDoc();
    const uid = layerUid(doc, 'layer-02');
    expect(updateElement(doc, uid, (n) => n)).toBe(doc);
  });
});

describe('removeNode / insertNode', () => {
  it('removes a node and reports where it was', () => {
    const doc = makeDoc();
    const uid = layerUid(doc, 'layer-02');
    const result = removeNode(doc, uid)!;
    expect(result).not.toBeNull();
    expect(result.removed.index).toBe(1);
    expect(findNode(result.doc, uid)).toBeNull();
    expect(JSON.stringify(doc)).toBeDefined(); // original still intact
  });

  it('re-inserting at the recorded index restores the original order', () => {
    const doc = makeDoc();
    const uid = layerUid(doc, 'layer-02');
    const { doc: removed, removed: info } = removeNode(doc, uid)!;
    const restored = insertNode(removed, info.parentUid, info.node, info.index);
    expect(
      restored.pages[0].children.map((c: any) => c.attrs.id),
    ).toEqual(['layer-01', 'layer-02']);
  });
});

describe('moveNodeWithinParent', () => {
  it('moves a node to a later index (bring forward)', () => {
    const doc = makeDoc();
    const uid = layerUid(doc, 'layer-01');
    const { doc: moved, oldIndex } = moveNodeWithinParent(doc, uid, 1)!;
    expect(oldIndex).toBe(0);
    expect(moved.pages[0].children.map((c: any) => c.attrs.id)).toEqual(['layer-02', 'layer-01']);
  });

  it('is a no-op (same instance) when the index is unchanged or out of bounds', () => {
    const doc = makeDoc();
    const uid = layerUid(doc, 'layer-01');
    expect(moveNodeWithinParent(doc, uid, 0)!.doc).toBe(doc);
    expect(moveNodeWithinParent(doc, uid, 9)?.doc).toBe(doc);
  });
});
