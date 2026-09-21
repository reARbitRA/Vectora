// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  importSvg,
  saveDocument,
  loadDocument,
  deleteDocument,
  listDocumentIds,
  createAutosaver,
} from '../index';

// Each test gets a fresh database.
beforeEach(async () => {
  const ids = await listDocumentIds();
  for (const id of ids) await deleteDocument(id);
});

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g id="layer-01"><rect width="5" height="5"/></g></svg>`;

describe('IndexedDB persistence', () => {
  it('saves and loads a document with full fidelity', async () => {
    const doc = importSvg(SAMPLE, { documentId: 'doc-1', name: 'Test Doc' })!;
    await saveDocument(doc);
    const loaded = await loadDocument('doc-1')!;
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe('doc-1');
    expect(loaded!.name).toBe('Test Doc');
    expect((loaded!.pages[0].children[0] as any).attrs['id']).toBe('layer-01');
    // Deep equality of the whole tree.
    expect(JSON.stringify(loaded)).toBe(JSON.stringify(doc));
  });

  it('returns null for unknown ids', async () => {
    expect(await loadDocument('missing')).toBeNull();
  });

  it('lists and deletes documents', async () => {
    await saveDocument(importSvg(SAMPLE, { documentId: 'a' })!);
    await saveDocument(importSvg(SAMPLE, { documentId: 'b' })!);
    expect((await listDocumentIds()).sort()).toEqual(['a', 'b']);
    await deleteDocument('a');
    expect(await listDocumentIds()).toEqual(['b']);
  });

  it('overwrites (upserts) on the same id', async () => {
    await saveDocument(importSvg(SAMPLE, { documentId: 'x', name: 'First' })!);
    await saveDocument(importSvg(SAMPLE, { documentId: 'x', name: 'Second' })!);
    const loaded = await loadDocument('x');
    expect(loaded!.name).toBe('Second');
  });

  it('migrates legacy records on load', async () => {
    // Simulate a record persisted without schemaVersion (v0).
    const legacy = importSvg(SAMPLE, { documentId: 'legacy' })! as any;
    delete legacy.schemaVersion;
    await saveDocument(legacy);
    const loaded = await loadDocument('legacy');
    expect(loaded!.schemaVersion).toBe(1);
  });
});

describe('createAutosaver', () => {
  it('debounces rapid saves into one write', async () => {
    const doc = importSvg(SAMPLE, { documentId: 'auto' })!;
    const autosaver = createAutosaver(20);
    autosaver.save(doc);
    autosaver.save({ ...doc, name: 'v2' });
    autosaver.save({ ...doc, name: 'v3' });
    // Nothing written before the delay elapses.
    expect(await loadDocument('auto')).toBeNull();
    await new Promise((r) => setTimeout(r, 60));
    const loaded = await loadDocument('auto');
    expect(loaded!.name).toBe('v3');
  });

  it('flush() writes immediately', async () => {
    const doc = importSvg(SAMPLE, { documentId: 'flush' })!;
    const autosaver = createAutosaver(5000);
    autosaver.save(doc);
    autosaver.flush();
    expect((await loadDocument('flush'))!.id).toBe('flush');
  });

  it('cancel() drops the pending save', async () => {
    const doc = importSvg(SAMPLE, { documentId: 'cancel' })!;
    const autosaver = createAutosaver(20);
    autosaver.save(doc);
    autosaver.cancel();
    await new Promise((r) => setTimeout(r, 60));
    expect(await loadDocument('cancel')).toBeNull();
  });
});
