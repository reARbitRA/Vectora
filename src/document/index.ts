/**
 * VECTORA canonical document engine (Phase 1) — public surface.
 *
 * The app layer (UnifiedStudio) imports from here; nothing outside this
 * directory reaches into the internals.
 */

export * from './types';
export { newUid, resetUidPool } from './ids';
export {
  findNode,
  insertNode,
  moveNodeWithinParent,
  removeNode,
  setAttr,
  updateAttrs,
  updateElement,
  updateTextNode,
  walkElements,
  cloneWithNewUids,
} from './tree';
export type { LocatedNode } from './tree';
export { importSvg, emptyDocument, parseViewBox, svgSemanticallyEqual } from './importer';
export type { ImportOptions } from './importer';
export { documentToSvg, countElements } from './exporter';
export { layersFromDocument, layerUidByName, isLayerGroup } from './selectors';
export {
  AddNodeCommand,
  ApplyPaletteCommand,
  RemoveNodeCommand,
  ReorderNodeCommand,
  ReplaceDocumentCommand,
  SetNodeAttrCommand,
  SetNodeTextCommand,
  buildBlendModeCommands,
  buildRenameLayerCommands,
  createLayerNode,
} from './commands';
export type { EditorCommand, ReorderDirection } from './commands';
export { HistoryManager } from './history';
export type { HistoryEntry, ApplyOptions } from './history';
export { migrateDocument, registeredMigrations, FutureDocumentError } from './migrations';
export {
  saveDocument,
  loadDocument,
  deleteDocument,
  listDocumentIds,
  createAutosaver,
} from './persistence';
export type { Autosaver } from './persistence';
