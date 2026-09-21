/**
 * Document schema migrations.
 *
 * Documents are persisted with a `schemaVersion`. On load (IndexedDB or
 * elsewhere) `migrateDocument` walks the chain of registered migrations
 * from the document's version up to SCHEMA_VERSION. Future versions are
 * rejected loudly rather than silently misread.
 */

import { SCHEMA_VERSION, type VectorDocument } from './types';

export interface Migration {
  from: number;
  to: number;
  description: string;
  migrate(doc: Record<string, unknown>): Record<string, unknown>;
}

/**
 * v0 → v1: normalize documents persisted before the schemaVersion field
 * existed. Phase 1 writers always emit version 1, but autosaves written
 * during development may lack the field.
 */
const v0toV1: Migration = {
  from: 0,
  to: 1,
  description: 'Stamp schemaVersion, ensure pages/metadata/name exist',
  migrate(doc) {
    const next: Record<string, unknown> = { ...doc };
    next.schemaVersion = 1;
    if (!Array.isArray(next.pages)) next.pages = [];
    if (typeof next.name !== 'string') next.name = 'Untitled Artwork';
    if (next.metadata === null || typeof next.metadata !== 'object') {
      next.metadata = {
        title: next.name,
        source: 'local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return next;
  },
};

/** Ordered registry; keep sequential (from n → n+1). */
const REGISTRY: Migration[] = [v0toV1];

export function registeredMigrations(): readonly Migration[] {
  return REGISTRY;
}

export class FutureDocumentError extends Error {
  constructor(public readonly documentVersion: number) {
    super(
      `Document schema version ${documentVersion} is newer than this build supports ` +
        `(${SCHEMA_VERSION}); the document was written by a newer VECTORA.`,
    );
    this.name = 'FutureDocumentError';
  }
}

/** Migrate a (possibly old) persisted document to the current schema. */
export function migrateDocument(input: unknown): VectorDocument {
  const record = (input ?? {}) as Record<string, unknown>;
  let version = typeof record.schemaVersion === 'number' ? record.schemaVersion : 0;
  if (version > SCHEMA_VERSION) {
    throw new FutureDocumentError(version);
  }
  let doc = record;
  for (const migration of REGISTRY) {
    if (version === migration.from) {
      doc = migration.migrate(doc);
      version = migration.to;
    }
  }
  if (version !== SCHEMA_VERSION) {
    // Should not happen with a sequential registry; fail loudly.
    throw new Error(`Migration chain incomplete: ended at version ${version}`);
  }
  return doc as unknown as VectorDocument;
}
