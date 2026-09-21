// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  importSvg,
  layersFromDocument,
  SetNodeAttrCommand,
  ReorderNodeCommand,
  AddNodeCommand,
  RemoveNodeCommand,
  ReplaceDocumentCommand,
  ApplyPaletteCommand,
  buildBlendModeCommands,
  buildRenameLayerCommands,
  createLayerNode,
} from '../index';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100">
  <g id="layer-01" inkscape:groupmode="layer" inkscape:label="01_Background"><rect width="5" height="5" fill="#111111"/></g>
  <g id="layer-02" inkscape:groupmode="layer" inkscape:label="02_Shapes"><circle r="5" fill="#222222"/></g>
  <g id="layer-03" inkscape:groupmode="layer" inkscape:label="03_Core"><path d="M0 0" stroke="#333333"/></g>
</svg>`;

function makeDoc() {
  return importSvg(SAMPLE, { documentId: 't' })!;
}

function uidAt(doc: any, index: number): string {
  return doc.pages[0].children[index].uid;
}

/** Element child of the first page at index (all children are elements in these samples). */
function L(doc: any, index: number): any {
  return doc.pages[0].children[index];
}

describe('SetNodeAttrCommand', () => {
  it('sets and un-does an attribute', () => {
    const doc = makeDoc();
    const uid = uidAt(doc, 0);
    const cmd = new SetNodeAttrCommand(uid, 'display', 'none');
    const next = cmd.apply(doc);
    expect(L(next, 0).attrs['display']).toBe('none');
    const undone = cmd.undo(next);
    expect(L(undone, 0).attrs['display']).toBeUndefined();
    expect(L(undone, 0)).toEqual(L(doc, 0));
  });

  it('removes the attribute on null and restores it on undo', () => {
    const doc = makeDoc();
    const uid = uidAt(doc, 0);
    const cmd = new SetNodeAttrCommand(uid, 'inkscape:label', null);
    const next = cmd.apply(doc);
    expect(L(next, 0).attrs['inkscape:label']).toBeUndefined();
    const undone = cmd.undo(next);
    expect(L(undone, 0).attrs['inkscape:label']).toBe('01_Background');
  });

  it('is a no-op (same instance) when the value is unchanged', () => {
    const doc = makeDoc();
    const uid = uidAt(doc, 0);
    const cmd = new SetNodeAttrCommand(uid, 'inkscape:label', '01_Background');
    expect(cmd.apply(doc)).toBe(doc);
  });
});

describe('ReorderNodeCommand', () => {
  it('bring forward moves the layer to a later index', () => {
    const doc = makeDoc();
    const uid = uidAt(doc, 0);
    const cmd = new ReorderNodeCommand(uid, 'up');
    const next = cmd.apply(doc);
    expect(layersFromDocument(next).map((l) => l.name)).toEqual([
      '02_Shapes',
      '01_Background',
      '03_Core',
    ]);
    const undone = cmd.undo(next);
    expect(layersFromDocument(undone).map((l) => l.name)).toEqual([
      '01_Background',
      '02_Shapes',
      '03_Core',
    ]);
  });

  it('send backward moves the layer to an earlier index', () => {
    const doc = makeDoc();
    const uid = uidAt(doc, 1);
    const next = new ReorderNodeCommand(uid, 'down').apply(doc);
    expect(layersFromDocument(next).map((l) => l.name)).toEqual([
      '02_Shapes',
      '01_Background',
      '03_Core',
    ]);
  });

  it('top/bottom move to the ends of the sibling list', () => {
    const doc = makeDoc();
    const bottom = new ReorderNodeCommand(uidAt(doc, 1), 'bottom').apply(doc);
    expect(layersFromDocument(bottom).map((l) => l.name)).toEqual([
      '02_Shapes',
      '01_Background',
      '03_Core',
    ]);
    const top = new ReorderNodeCommand(uidAt(doc, 1), 'top').apply(doc);
    expect(layersFromDocument(top).map((l) => l.name)).toEqual([
      '01_Background',
      '03_Core',
      '02_Shapes',
    ]);
  });

  it('no-ops at the boundaries (same instance)', () => {
    const doc = makeDoc();
    expect(new ReorderNodeCommand(uidAt(doc, 0), 'down').apply(doc)).toBe(doc);
    expect(new ReorderNodeCommand(uidAt(doc, 2), 'up').apply(doc)).toBe(doc);
  });
});

describe('AddNodeCommand / RemoveNodeCommand', () => {
  it('adds a layer node to the page and undo removes it', () => {
    const doc = makeDoc();
    const layer = createLayerNode('04_New');
    const cmd = new AddNodeCommand(layer, null, null, 'Add layer');
    const next = cmd.apply(doc);
    expect(layersFromDocument(next).map((l) => l.name)).toContain('04_New');
    const undone = cmd.undo(next);
    expect(layersFromDocument(undone).map((l) => l.name)).not.toContain('04_New');
    expect(undone.pages[0].children.length).toBe(3);
  });

  it('refuses to add a node whose uid already exists', () => {
    const doc = makeDoc();
    const existing = doc.pages[0].children[0];
    const cmd = new AddNodeCommand(existing, null, null);
    expect(cmd.apply(doc)).toBe(doc);
  });

  it('removes a node and undo restores it at the exact position', () => {
    const doc = makeDoc();
    const uid = uidAt(doc, 1);
    const cmd = new RemoveNodeCommand(uid);
    const next = cmd.apply(doc);
    expect(next.pages[0].children.length).toBe(2);
    const undone = cmd.undo(next);
    expect(undone.pages[0].children.map((c: any) => c.attrs?.id)).toEqual([
      'layer-01',
      'layer-02',
      'layer-03',
    ]);
  });
});

describe('ReplaceDocumentCommand', () => {
  it('swaps the document and undo restores the previous one', () => {
    const docA = makeDoc();
    const docB = importSvg(SAMPLE.replace('01_Background', '01_Backdrop'), { documentId: 't2' })!;
    const cmd = new ReplaceDocumentCommand(docB);
    const next = cmd.apply(docA);
    expect(next).toBe(docB);
    expect(cmd.undo(next)).toBe(docA);
  });
});

describe('ApplyPaletteCommand', () => {
  const COLORFUL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
  <style>.a { fill: #111111; } .b { stroke: #222222; }</style>
  <g id="layer-01" inkscape:label="L1" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
    <rect fill="#111111" stroke="#222222" width="5" height="5"/>
  </g>
</svg>`;

  it('remaps colors in attributes and style text deterministically', () => {
    const doc = importSvg(COLORFUL, { documentId: 't' })!;
    const cmd = new ApplyPaletteCommand(['#ff0000', '#00ff00']);
    const next = cmd.apply(doc);
    const rect = (next.pages[0].children.find((c: any) => c.kind === 'g') as any)!.children[0];
    expect(rect.attrs['fill']).toBe('#ff0000');
    expect(rect.attrs['stroke']).toBe('#00ff00');
    const out = JSON.stringify(next);
    expect(out).toContain('.a');
    expect(out).not.toContain('#111111');
    expect(out).not.toContain('#222222');
  });

  it('undo restores every original color', () => {
    const doc = importSvg(COLORFUL, { documentId: 't' })!;
    const cmd = new ApplyPaletteCommand(['#ff0000', '#00ff00']);
    const next = cmd.apply(doc);
    const undone = cmd.undo(next);
    const rect = (undone.pages[0].children.find((c: any) => c.kind === 'g') as any)!.children[0];
    expect(rect.attrs['fill']).toBe('#111111');
    expect(rect.attrs['stroke']).toBe('#222222');
    expect(JSON.stringify(undone)).toContain('#111111');
    expect(JSON.stringify(undone)).toContain('.b { stroke: #222222; }');
  });

  it('is a no-op when there are no colors to remap', () => {
    const plain = importSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="5" height="5"/></svg>`,
      { documentId: 't' },
    )!;
    const cmd = new ApplyPaletteCommand(['#ff0000']);
    expect(cmd.apply(plain)).toBe(plain);
  });
});

describe('command factory helpers', () => {
  it('buildRenameLayerCommands renames label and slugs the id', () => {
    const doc = makeDoc();
    const uid = uidAt(doc, 0);
    const cmds = buildRenameLayerCommands(uid, '01_Backdrop & Sky');
    let next = doc;
    for (const c of cmds) next = c.apply(next);
    const layer = L(next, 0);
    expect(layer.attrs['inkscape:label']).toBe('01_Backdrop & Sky');
    expect(layer.attrs['id']).toBe('01_backdrop-sky');
    let undone = next;
    for (const c of [...cmds].reverse()) undone = c.undo(undone);
    expect(L(undone, 0).attrs['inkscape:label']).toBe('01_Background');
    expect(L(undone, 0).attrs['id']).toBe('layer-01');
  });

  it('buildBlendModeCommands sets and clears blend modes with style rewrite', () => {
    const doc = makeDoc();
    const uid = uidAt(doc, 0);
    let next = doc;
    for (const c of buildBlendModeCommands(doc, uid, 'multiply')) next = c.apply(next);
    let layer: any = L(next, 0);
    expect(layer.attrs['mix-blend-mode']).toBe('multiply');
    expect(layer.attrs['style']).toContain('mix-blend-mode: multiply');

    // Reset back to normal.
    let reset = next;
    for (const c of buildBlendModeCommands(next, uid, 'normal')) reset = c.apply(reset);
    layer = L(reset, 0);
    expect(layer.attrs['mix-blend-mode']).toBeUndefined();
    expect(layer.attrs['style'] ?? '').not.toContain('mix-blend-mode');
  });
});
