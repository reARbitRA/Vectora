/**
 * Transactional command history.
 *
 * - `apply(commands, {label})` folds a command list over the current
 *   document and records ONE history entry (a transaction) → one undo step.
 * - No-op transactions (identity-preserving folds) are not recorded.
 * - `coalesceKey` merges a rapid sequence of compatible entries (e.g. code
 *   editor keystrokes, each a ReplaceDocumentCommand) into a single entry;
 *   undo then restores the pre-burst state.
 *
 * The manager is framework-agnostic and holds the current document as the
 * single source of truth; the React layer mirrors it into state and derives
 * everything (layers, SVG export, persistence) from it.
 */

import type { EditorCommand, ReplaceDocumentCommand } from './commands';
import type { VectorDocument } from './types';
import { newUid } from './ids';

export interface HistoryEntry {
  id: string;
  label: string;
  timestamp: number;
  commands: EditorCommand[];
  /** When set, consecutive applies with the same key coalesce into this entry. */
  coalesceKey?: string;
}

export interface ApplyOptions {
  label?: string;
  /**
   * Merge this apply into the previous entry when it carries the same key.
   * Only supported for single-command ReplaceDocumentCommand entries
   * (the command is retargeted, so undo still restores the pre-burst doc).
   */
  coalesceKey?: string;
}

export class HistoryManager {
  private past: HistoryEntry[] = [];
  private future: HistoryEntry[] = [];
  private doc: VectorDocument;

  constructor(initial: VectorDocument) {
    this.doc = initial;
  }

  get current(): VectorDocument {
    return this.doc;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  /** Read-only view of past entries (oldest → newest). */
  getHistory(): readonly HistoryEntry[] {
    return this.past;
  }

  /** Replace the document and clear history (new artwork opened). */
  reset(next: VectorDocument): void {
    this.doc = next;
    this.past = [];
    this.future = [];
  }

  apply(commands: EditorCommand | EditorCommand[], options: ApplyOptions = {}): VectorDocument {
    const list = Array.isArray(commands) ? commands : [commands];
    if (list.length === 0) return this.doc;

    const label = options.label ?? list[0].label ?? 'Edit';

    // Coalescing: merge into the previous entry when compatible.
    if (options.coalesceKey) {
      const last = this.past[this.past.length - 1];
      if (
        last &&
        last.coalesceKey === options.coalesceKey &&
        last.commands.length === 1 &&
        isReplaceCommand(last.commands[0])
      ) {
        const replace = last.commands[0] as ReplaceDocumentCommand;
        const folded = this.fold(list, this.doc);
        replace.retarget(folded);
        last.timestamp = Date.now();
        this.doc = folded;
        this.future = [];
        return folded;
      }
    }

    const next = this.fold(list, this.doc);
    if (next === this.doc) return this.doc; // no-op transaction: not recorded

    this.past.push({
      id: newUid('hist'),
      label,
      timestamp: Date.now(),
      commands: list,
      ...(options.coalesceKey ? { coalesceKey: options.coalesceKey } : {}),
    });
    this.future = [];
    this.doc = next;
    return next;
  }

  undo(): { doc: VectorDocument; entry: HistoryEntry } | null {
    const entry = this.past.pop();
    if (!entry) return null;
    // Undo in reverse command order within the transaction.
    let doc = this.doc;
    for (const command of [...entry.commands].reverse()) {
      doc = command.undo(doc);
    }
    this.doc = doc;
    this.future.push(entry);
    return { doc, entry };
  }

  redo(): { doc: VectorDocument; entry: HistoryEntry } | null {
    const entry = this.future.pop();
    if (!entry) return null;
    const doc = this.fold(entry.commands, this.doc);
    this.doc = doc;
    this.past.push(entry);
    return { doc, entry };
  }

  private fold(commands: EditorCommand[], start: VectorDocument): VectorDocument {
    let doc = start;
    for (const command of commands) {
      doc = command.apply(doc);
    }
    return doc;
  }
}

function isReplaceCommand(command: EditorCommand): command is ReplaceDocumentCommand {
  return command.type === 'replace-document' && typeof (command as ReplaceDocumentCommand).retarget === 'function';
}
