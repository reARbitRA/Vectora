/**
 * VECTORA canonical document model (Phase 1).
 *
 * This is the authoritative editing state. SVG is an import/export format —
 * never the primary database. Every node has a stable internal uid; element
 * ids live in `attrs` exactly as they appear in the SVG (they are reference
 * targets like url(#gradient), not node identity).
 *
 * The model is plain JSON: it can be structurally cloned, persisted to
 * IndexedDB, diffed, and migrated without a DOM.
 */

/** Current document schema version. Bump when the shape changes and add a migration. */
export const SCHEMA_VERSION = 1;

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentMetadata {
  title: string;
  description?: string;
  /** Where the document came from. */
  source: 'ai' | 'import' | 'local' | 'sample';
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * A page is one artboard: the root <svg> element's attributes plus its
 * child node tree. Multi-page documents are representable; the current UI
 * edits page 0.
 */
export interface PageNode {
  id: string;
  name: string;
  width: number;
  height: number;
  viewBox: ViewBox | null;
  /** Root <svg> attributes by qualified name (viewBox, xmlns:inkscape, ...). */
  attrs: Record<string, string>;
  /** Namespace URI per attribute name, when the attribute is namespaced. */
  nsByAttr?: Record<string, string>;
  children: VectorNode[];
}

export type VectorNode = ElementNode | TextNode | CommentNode;

/**
 * A generic element node. `kind` is the local element name ('g', 'rect',
 * 'path', ...); `ns` preserves a non-SVG namespace (e.g. Inkscape's
 * sodipodi:namedview) so foreign metadata round-trips.
 */
export interface ElementNode {
  type: 'element';
  /** Stable internal identity — survives renames and id changes. */
  uid: string;
  kind: string;
  /** Element namespace URI; undefined means the SVG namespace. */
  ns?: string;
  attrs: Record<string, string>;
  nsByAttr?: Record<string, string>;
  children: VectorNode[];
}

/** Character data inside an element (text content, <style> blocks, ...). */
export interface TextNode {
  type: 'text';
  uid: string;
  text: string;
}

/** XML comment, preserved for fidelity with imported files. */
export interface CommentNode {
  type: 'comment';
  uid: string;
  text: string;
}

export interface VectorDocument {
  schemaVersion: number;
  /** Document id (matches the artwork id in the app layer). */
  id: string;
  name: string;
  metadata: DocumentMetadata;
  pages: PageNode[];
}

/** Namespaces referenced by the importer/exporter. */
export const SVG_NS = 'http://www.w3.org/2000/svg';
export const XMLNS_NS = 'http://www.w3.org/2000/xmlns/';
export const XLINK_NS = 'http://www.w3.org/1999/xlink';
