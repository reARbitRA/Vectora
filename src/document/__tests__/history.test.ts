// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  importSvg,
  HistoryManager,
  SetNodeAttrCommand,
  ReorderNodeCommand,
  ReplaceDocumentCommand,
} from '../index';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100">
  <g id="layer-01" inkscape:groupmode="layer" inkscape:label="01_Background"><rect width="5" height="5"/></g>
  <g id="layer-02" inkscape:groupmode="layer" inkscape:label="02_Shapes"><circle r="5"/></g>
</svg>`;

function makeManager() {
  const doc = importSvg(SAMPLE, { documentId: 't' })!;
  return { manager: new HistoryManager(doc), doc };
}

describe('HistoryManager', () => {
  it('starts with no undo/redo available', () => {
    const { manager } = makeManager();
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);
  });

  it('records a transaction of multiple commands as ONE undo step', () => {
    const { manager, doc } = makeManager();
    const uid = doc.pages[0].children[0].uid;
    manager.apply(
      [
        new SetNodeAttrCommand(uid, 'display', 'none'),
        new SetNodeAttrCommand(uid, 'pointer-events', 'none'),
        new SetNodeAttrCommand(uid, 'data-locked', 'true'),
      ],
      { label: 'Lock layer' },
    );
    expect(manager.canUndo()).toBe(true);
    expect(manager.getHistory()).toHaveLength(1);
    expect(manager.getHistory()[0].label).toBe('Lock layer');

    const undone = manager.undo()!;
    const layer: any = undone.doc.pages[0].children[0];
    expect(layer.attrs['display']).toBeUndefined();
    expect(layer.attrs['pointer-events']).toBeUndefined();
    expect(layer.attrs['data-locked']).toBeUndefined();
  });

  it('undoes and redoes through a sequence of edits', () => {
    const { manager, doc } = makeManager();
    const uidA = doc.pages[0].children[0].uid;
    const uidB = doc.pages[0].children[1].uid;

    manager.apply(new SetNodeAttrCommand(uidA, 'display', 'none'), { label: 'Hide A' });
    manager.apply(new ReorderNodeCommand(uidA, 'up'), { label: 'Bring layer-01 forward' });

    expect(manager.canUndo()).toBe(true);
    const u1 = manager.undo()!;
    expect(u1.entry.label).toBe('Bring layer-01 forward');
    const u2 = manager.undo()!;
    expect(u2.entry.label).toBe('Hide A');
    expect(manager.canUndo()).toBe(false);
    expect((u2.doc.pages[0].children[0] as any).attrs['display']).toBeUndefined();

    const r1 = manager.redo()!;
    expect(r1.entry.label).toBe('Hide A');
    expect((r1.doc.pages[0].children[0] as any).attrs['display']).toBe('none');
    const r2 = manager.redo()!;
    // After redoing "Bring B forward" the draw order is swapped:
    expect(r2.doc.pages[0].children.map((c: any) => c.attrs.id)).toEqual(['layer-02', 'layer-01']);
    expect(manager.canRedo()).toBe(false);
  });

  it('clears the redo stack when a new edit is applied', () => {
    const { manager, doc } = makeManager();
    const uid = doc.pages[0].children[0].uid;
    manager.apply(new SetNodeAttrCommand(uid, 'display', 'none'), { label: 'hide' });
    manager.undo();
    expect(manager.canRedo()).toBe(true);
    manager.apply(new SetNodeAttrCommand(uid, 'opacity', '0.5'), { label: 'fade' });
    expect(manager.canRedo()).toBe(false);
  });

  it('does not record no-op transactions', () => {
    const { manager, doc } = makeManager();
    const uid = doc.pages[0].children[0].uid;
    manager.apply(new SetNodeAttrCommand(uid, 'inkscape:label', '01_Background'), { label: 'noop' });
    expect(manager.canUndo()).toBe(false);
    expect(manager.getHistory()).toHaveLength(0);
  });

  it('coalesces consecutive replace-document applies into one entry', () => {
    const { manager, doc } = makeManager();
    const v1 = doc;
    const v2 = importSvg(SAMPLE.replace('01_Background', '01_A'), { documentId: 't' })!;
    const v3 = importSvg(SAMPLE.replace('01_Background', '01_B'), { documentId: 't' })!;
    const v4 = importSvg(SAMPLE.replace('01_Background', '01_C'), { documentId: 't' })!;

    manager.apply(new ReplaceDocumentCommand(v2), { label: 'Edit source', coalesceKey: 'code' });
    manager.apply(new ReplaceDocumentCommand(v3), { label: 'Edit source', coalesceKey: 'code' });
    manager.apply(new ReplaceDocumentCommand(v4), { label: 'Edit source', coalesceKey: 'code' });

    // One entry for the whole typing burst.
    expect(manager.getHistory()).toHaveLength(1);
    expect(manager.current).toBe(v4);

    // Undo restores the pre-burst document in a single step.
    const undone = manager.undo()!;
    expect(undone.doc).toBe(v1);
    expect(manager.getHistory()).toHaveLength(0);

    // Redo replays to the latest version.
    const redone = manager.redo()!;
    expect(JSON.stringify(redone.doc)).toContain('01_C');
  });

  it('does not coalesce across different keys', () => {
    const { manager, doc } = makeManager();
    const v2 = importSvg(SAMPLE.replace('01_Background', '01_A'), { documentId: 't' })!;
    const v3 = importSvg(SAMPLE.replace('01_Background', '01_B'), { documentId: 't' })!;
    manager.apply(new ReplaceDocumentCommand(v2), { label: 'Edit source', coalesceKey: 'code' });
    manager.apply(new ReplaceDocumentCommand(v3), { label: 'AI refine', coalesceKey: 'ai' });
    expect(manager.getHistory()).toHaveLength(2);
    void doc;
  });

  it('reset clears history for a new document', () => {
    const { manager, doc } = makeManager();
    const uid = doc.pages[0].children[0].uid;
    manager.apply(new SetNodeAttrCommand(uid, 'display', 'none'), { label: 'hide' });
    const fresh = importSvg(SAMPLE, { documentId: 'other' })!;
    manager.reset(fresh);
    expect(manager.current).toBe(fresh);
    expect(manager.canUndo()).toBe(false);
    expect(manager.canRedo()).toBe(false);
  });
});
