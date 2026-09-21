/**
 * IndexedDB persistence for canonical documents.
 *
 * Every studio mutation is autosaved (debounced) so a crash or refresh
 * recovers the exact document — including undo history-relevant state
 * (the document itself; history entries are not persisted yet).
 *
 * Stored records are plain JSON: { id, savedAt, doc }. On load, documents
 * pass through the migration chain.
 */

import type { VectorDocument } from './types';
import { migrateDocument } from './migrations';

const DB_NAME = 'vectora-studio';
const DB_VERSION = 1;
const STORE = 'documents';

interface StoredRecord {
  id: string;
  savedAt: string;
  doc: VectorDocument;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  if (!hasIndexedDB()) {
    return Promise.reject(new Error('IndexedDB is not available in this environment'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error ?? new Error('Failed to open IndexedDB'));
      };
    });
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = run(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

/** Persist a document (upsert by id). No-op when IndexedDB is unavailable. */
export async function saveDocument(doc: VectorDocument): Promise<void> {
  if (!hasIndexedDB()) return;
  const record: StoredRecord = { id: doc.id, savedAt: new Date().toISOString(), doc };
  await tx('readwrite', (store) => store.put(record) as IDBRequest<IDBValidKey>);
}

/** Load a document by id (migrated to the current schema), or null. */
export async function loadDocument(id: string): Promise<VectorDocument | null> {
  if (!hasIndexedDB()) return null;
  try {
    const record = await tx<StoredRecord | undefined>('readonly', (store) => store.get(id));
    if (!record || typeof record !== 'object' || !record.doc) return null;
    return migrateDocument(record.doc);
  } catch (error) {
    console.warn('[persistence] failed to load document:', error);
    return null;
  }
}

/** Delete a stored document. */
export async function deleteDocument(id: string): Promise<void> {
  if (!hasIndexedDB()) return;
  await tx('readwrite', (store) => store.delete(id) as unknown as IDBRequest<undefined>);
}

/** List stored document ids. */
export async function listDocumentIds(): Promise<string[]> {
  if (!hasIndexedDB()) return [];
  try {
    const keys = await tx<IDBValidKey[]>('readonly', (store) => store.getAllKeys());
    return keys.map(String);
  } catch {
    return [];
  }
}

export interface Autosaver {
  /** Schedule a debounced save. */
  save(doc: VectorDocument): void;
  /** Save immediately if a save is pending. */
  flush(): void;
  /** Drop any pending save. */
  cancel(): void;
}

/** Debounced autosave wrapper (default 800 ms). */
export function createAutosaver(delayMs = 800): Autosaver {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: VectorDocument | null = null;
  let warned = false;

  const write = (doc: VectorDocument) => {
    saveDocument(doc).catch((error) => {
      if (!warned) {
        warned = true;
        console.warn('[persistence] autosave failed:', error);
      }
    });
  };

  return {
    save(doc: VectorDocument): void {
      pending = doc;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        if (pending) {
          write(pending);
          pending = null;
        }
      }, delayMs);
    },
    flush(): void {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (pending) {
        write(pending);
        pending = null;
      }
    },
    cancel(): void {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      pending = null;
    },
  };
}
