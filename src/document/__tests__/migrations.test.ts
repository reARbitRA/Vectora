import { describe, it, expect } from 'vitest';
import { migrateDocument, registeredMigrations, FutureDocumentError, SCHEMA_VERSION } from '../index';

describe('migrations', () => {
  it('passes current-version documents through untouched', () => {
    const doc = {
      schemaVersion: SCHEMA_VERSION,
      id: 'x',
      name: 'Test',
      metadata: { title: 'Test', source: 'local', createdAt: 't', updatedAt: 't' },
      pages: [],
    };
    expect(migrateDocument(doc)).toEqual(doc);
  });

  it('upgrades unversioned (v0) documents via the registered chain', () => {
    const legacy = { id: 'x' }; // no schemaVersion, no pages, no metadata
    const migrated = migrateDocument(legacy) as any;
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(Array.isArray(migrated.pages)).toBe(true);
    expect(migrated.metadata.title).toBe('Untitled Artwork');
    expect(migrated.name).toBe('Untitled Artwork');
  });

  it('preserves existing content while normalizing missing fields', () => {
    const legacy = {
      id: 'keep-me',
      name: 'My Doc',
      pages: [{ id: 'p1', children: [] }],
    };
    const migrated = migrateDocument(legacy) as any;
    expect(migrated.id).toBe('keep-me');
    expect(migrated.pages[0].id).toBe('p1');
    expect(migrated.metadata.title).toBe('My Doc');
  });

  it('rejects documents from a newer schema version', () => {
    const future = { schemaVersion: SCHEMA_VERSION + 1, id: 'x' };
    expect(() => migrateDocument(future)).toThrow(FutureDocumentError);
  });

  it('registers a sequential migration chain ending at the current version', () => {
    const migrations = registeredMigrations();
    let version = 0;
    for (const m of migrations) {
      expect(m.from).toBe(version);
      expect(m.to).toBe(version + 1);
      version = m.to;
    }
    expect(version).toBe(SCHEMA_VERSION);
  });
});
