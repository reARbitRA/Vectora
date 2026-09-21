import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Palette, Zap, Puzzle, FileCode, Search, 
  MessageSquare, ChevronLeft, ChevronRight, Download, 
  Share2, Save, Play, Pause, RotateCcw, Sliders, Info, X, Send, Github,
  Image as ImageIcon, Check, Sparkles, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { StudioCanvas } from './StudioCanvas';
import { LayerPanel } from './LayerPanel';
import { PaletteManager } from './PaletteManager';
import { AnimationStudio } from './AnimationStudio';
import { CodeEditor } from './CodeEditor';
import { DesignSpecPanel } from './DesignSpecPanel';
import { PluginGallery } from './PluginGallery';
import { ExportModal } from './ExportModal';
import { ImportModal } from './ImportModal';
import { RefinePromptBar } from './RefinePromptBar';
import { CanvasSettings, LayerSpec, VectorArtwork } from '../types';
import { exportSvgToPng, downloadBlob } from '../utils/svgParser';
import {
  importSvg,
  emptyDocument,
  documentToSvg,
  layersFromDocument,
  layerUidByName,
  svgSemanticallyEqual,
  HistoryManager,
  AddNodeCommand,
  ApplyPaletteCommand,
  EditorCommand,
  ReplaceDocumentCommand,
  ReorderNodeCommand,
  SetNodeAttrCommand,
  buildBlendModeCommands,
  buildRenameLayerCommands,
  createLayerNode,
  loadDocument,
  createAutosaver,
  type Autosaver,
  type VectorDocument,
} from '../document';

interface UnifiedStudioProps {
  artwork: VectorArtwork;
  onUpdateSvg: (svg: string) => void;
  onUpdateArtwork: (artwork: VectorArtwork) => void;
  onBack: () => void;
}

export const UnifiedStudio: React.FC<UnifiedStudioProps> = ({ 
  artwork, 
  onUpdateSvg, 
  onUpdateArtwork,
  onBack 
}) => {
  const [activeTool, setActiveTool] = useState<'layers' | 'colors' | 'animation' | 'plugins' | 'specs' | 'code' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  // GitHub connection state. The OAuth token lives in a server-side session
  // (HTTP-only cookie) — the browser never stores or handles the raw token.
  const [githubConnected, setGithubConnected] = useState(false);

  // ── Canonical document state (Phase 1) ─────────────────────────────────
  // The VectorDocument is the single source of truth. `layers` and
  // `exportedSvg` are DERIVED views; the canvas, code editor, layer panel,
  // and exporters all read from the same document through them.
  const [vectorDoc, setVectorDoc] = useState<VectorDocument | null>(null);
  const [exportedSvg, setExportedSvg] = useState(artwork.svg);
  const [layers, setLayers] = useState<LayerSpec[]>(() => {
    const imported = importSvg(artwork.svg, { documentId: artwork.id, name: artwork.title });
    return imported ? layersFromDocument(imported) : artwork.layers || [];
  });

  const historyRef = useRef<HistoryManager | null>(null);
  const autosaveRef = useRef<Autosaver | null>(null);
  if (!autosaveRef.current) autosaveRef.current = createAutosaver(800);
  // Tracks whether the document can authoritatively drive artwork.svg
  // (false when artwork.svg could not be imported — avoids clobbering it).
  const docHealthyRef = useRef(true);
  const importedForIdRef = useRef<string | null>(null);
  const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false });

  // Dynamic Canvas Viewport Settings
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: false,
    gridType: 'cartesian',
    bgMode: 'dark',
    strokeScale: 1,
    grainIntensity: 0,
    glowIntensity: 0,
    aspectRatio: '1:1',
  });

  const handleUpdateSettings = (newSettings: Partial<CanvasSettings>) => {
    setCanvasSettings((prev) => ({ ...prev, ...newSettings }));
  };

  /**
   * Publish a new document state to every consumer: React state (doc,
   * derived layers, exported SVG), the App artwork (so the rest of the app
   * and localStorage history stay in sync), and IndexedDB autosave.
   */
  const publishDocument = (doc: VectorDocument) => {
    const svg = documentToSvg(doc);
    setVectorDoc(doc);
    setExportedSvg(svg);
    setLayers(layersFromDocument(doc));
    setHistoryFlags({
      canUndo: historyRef.current?.canUndo() ?? false,
      canRedo: historyRef.current?.canRedo() ?? false,
    });
    if (docHealthyRef.current && svg !== artwork.svg) onUpdateSvg(svg);
    autosaveRef.current?.save(doc);
  };

  /** Apply commands as one undoable transaction against the document. */
  const applyCommands = (
    commands: EditorCommand | EditorCommand[],
    label: string,
    coalesceKey?: string,
  ) => {
    const history = historyRef.current;
    if (!history) return;
    const next = history.apply(commands, {
      label,
      ...(coalesceKey ? { coalesceKey } : {}),
    });
    if (next === history.current) return; // no-op transaction
    publishDocument(next);
  };

  // Import the artwork as a canonical document when the artwork changes.
  useEffect(() => {
    if (importedForIdRef.current === artwork.id) return;
    importedForIdRef.current = artwork.id;

    const imported = importSvg(artwork.svg, {
      documentId: artwork.id,
      name: artwork.title,
      metadata: { title: artwork.title, source: 'local' },
    });
    const doc = imported ?? emptyDocument({ documentId: artwork.id, name: artwork.title });
    docHealthyRef.current = !!imported;
    if (!imported) {
      console.warn('[studio] artwork.svg could not be imported; document sync paused for this artwork');
    }
    historyRef.current = new HistoryManager(doc);
    setVectorDoc(doc);
    setExportedSvg(artwork.svg);
    setLayers(layersFromDocument(doc));
    setHistoryFlags({ canUndo: false, canRedo: false });

    // Crash recovery: offer the autosaved document when it differs from the
    // artwork's persisted SVG.
    let cancelled = false;
    if (imported) {
      loadDocument(artwork.id)
        .then((saved) => {
          if (cancelled || !saved) return;
          if (documentToSvg(saved) !== artwork.svg) {
            toast('Autosaved changes found', {
              description: 'Restore unsaved edits for this design?',
              action: {
                label: 'Restore',
                onClick: () => {
                  historyRef.current?.reset(saved);
                  publishDocument(saved);
                  toast.success('Autosave restored');
                },
              },
              duration: 12000,
            });
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artwork.id]);

  // Flush pending autosaves when the studio unmounts.
  useEffect(() => () => autosaveRef.current?.flush(), []);

  const handleUndo = () => {
    const result = historyRef.current?.undo();
    if (!result) return;
    publishDocument(result.doc);
    toast.info('Undo applied', { description: result.entry.label });
  };

  const handleRedo = () => {
    const result = historyRef.current?.redo();
    if (!result) return;
    publishDocument(result.doc);
    toast.info('Redo applied', { description: result.entry.label });
  };

  /** Resolve a layer's stable node uid from its panel name. */
  const layerUid = (name: string): string | null =>
    layers.find((l) => l.name === name)?.id ?? (vectorDoc ? layerUidByName(vectorDoc, name) : null);

  const handleToggleLayer = (name: string) => {
    const uid = layerUid(name);
    if (!uid) return;
    const layer = layers.find((l) => l.name === name);
    const nextVisible = layer ? !layer.visible : true;
    // Visibility is persisted into the document (display="none") — exports,
    // reloads, and the code view all read the same state.
    applyCommands(
      new SetNodeAttrCommand(uid, 'display', nextVisible ? null : 'none'),
      `${nextVisible ? 'Show' : 'Hide'} ${name}`,
    );
  };

  const handleToggleLock = (name: string) => {
    const uid = layerUid(name);
    if (!uid) return;
    const layer = layers.find((l) => l.name === name);
    const nextLocked = layer ? !layer.locked : true;
    applyCommands(
      [
        new SetNodeAttrCommand(uid, 'pointer-events', nextLocked ? 'none' : null),
        new SetNodeAttrCommand(uid, 'data-locked', nextLocked ? 'true' : null),
      ],
      `${nextLocked ? 'Lock' : 'Unlock'} ${name}`,
    );
  };

  const handleRenameLayer = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    const uid = layerUid(oldName);
    if (!uid) return;
    applyCommands(buildRenameLayerCommands(uid, newName), `Rename layer to ${newName}`);
  };

  const handleSoloLayer = (name: string) => {
    const commands: EditorCommand[] = [];
    for (const layer of layers) {
      const uid = layerUid(layer.name);
      if (!uid) continue;
      const visible = layer.name === name;
      if (layer.visible !== visible) {
        commands.push(new SetNodeAttrCommand(uid, 'display', visible ? null : 'none'));
      }
    }
    if (commands.length > 0) applyCommands(commands, `Solo ${name}`);
  };

  const handleShowAllLayers = () => {
    const commands: EditorCommand[] = [];
    for (const layer of layers) {
      if (layer.visible) continue;
      const uid = layerUid(layer.name);
      if (uid) commands.push(new SetNodeAttrCommand(uid, 'display', null));
    }
    if (commands.length > 0) applyCommands(commands, 'Show all layers');
  };

  /**
   * Reorder a layer by name + direction. Ordering convention: the layers
   * array is in document/draw order — index 0 paints first (back), the last
   * index paints last (front). "Up"/Bring Forward moves a layer to a LATER
   * index, "down"/Send Backward to an earlier one.
   */
  const handleReorderLayer = (layerName: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const uid = layerUid(layerName);
    if (!uid) return;
    applyCommands(new ReorderNodeCommand(uid, direction), `Move ${layerName} ${direction}`);
  };

  const handleAddNewLayer = () => {
    const name = `Layer ${layers.length + 1}`;
    // New layer goes to the top of the stack (end of draw order).
    applyCommands(new AddNodeCommand(createLayerNode(name), null, null), `Add layer ${name}`);
  };

  const handleSetBlendMode = (name: string, mode: string) => {
    const uid = layerUid(name);
    if (!uid || !vectorDoc) return;
    applyCommands(buildBlendModeCommands(vectorDoc, uid, mode), `Set ${name} blend to ${mode}`);
  };

  /**
   * Apply a palette locally and deterministically by remapping the colors
   * in the document. Undoable via a single command (restores each original
   * color individually).
   */
  const handleApplyPalette = (colors: string[]) => {
    if (!colors?.length) return;
    applyCommands(new ApplyPaletteCommand(colors), 'Apply palette');
    toast.success('Palette applied to document', {
      description: `${colors.length} colors remapped locally (undoable)`,
    });
  };

  /**
   * Apply an externally-produced SVG string (code editor, animation studio)
   * to the document as a single undoable command. Cosmetic-only changes
   * (pure reformatting) are detected semantically and skipped so they
   * neither dirty the document nor spam the undo history; real changes are
   * coalesced (one undo step per burst of typing/tweaking).
   */
  const handleExternalSvgChange = (newSvg: string, label: string, coalesceKey: string) => {
    if (!vectorDoc || !historyRef.current) return;
    if (svgSemanticallyEqual(newSvg, exportedSvg)) return; // cosmetic only
    const next = importSvg(newSvg, {
      documentId: artwork.id,
      name: artwork.title,
      preserveUidsFrom: vectorDoc,
      metadata: vectorDoc.metadata,
    });
    if (!next) {
      toast.error('Invalid SVG — document unchanged');
      return;
    }
    applyCommands(new ReplaceDocumentCommand(next), label, coalesceKey);
  };

  // Handle downloadable SVG export
  const handleDownloadSvg = () => {
    try {
      // Exported from the canonical document — never a stale artwork string.
      const blob = new Blob([exportedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const filename = `${artwork.title.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'vectora-art'}.svg`;
      downloadBlob(blob, filename);
      toast.success('Vector Artwork Exported as .SVG', {
        description: `Downloaded ${filename} with preserved vector layers and metadata.`
      });
      setIsExportMenuOpen(false);
    } catch (err: any) {
      console.error('SVG download failed:', err);
      toast.error('SVG download failed', { description: err?.message || 'Error creating file' });
    }
  };

  // Handle downloadable PNG export with high-res scale
  const handleDownloadPng = async (scale = 2) => {
    if (isExportingPng) return;
    setIsExportingPng(true);
    const toastId = toast.loading('Rasterizing artwork to PNG...', {
      description: `Rendering vector canvas at ${scale}x (${scale * 1000}px resolution)...`
    });

    try {
      const blob = await exportSvgToPng(exportedSvg, scale);
      const filename = `${artwork.title.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'vectora-art'}.png`;
      downloadBlob(blob, filename);
      toast.success('Artwork Exported as .PNG', {
        id: toastId,
        description: `Saved ${filename} at ${scale}x Retina resolution.`
      });
      setIsExportMenuOpen(false);
    } catch (err: any) {
      console.error('PNG export failed:', err);
      toast.error('PNG rasterization failed', {
        id: toastId,
        description: err?.message || 'Canvas rendering error. Please try standard SVG export.'
      });
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownload = () => {
    handleDownloadSvg();
  };

  // Keyboard shortcut listener within Studio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA'].includes(targetTag)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownloadSvg();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleDownloadPng(2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exportedSvg, artwork.title]);

  const handleRefine = async (instruction?: string) => {
    const message = instruction || chatMessage;
    if (!message.trim() || isRefining) return;
    setIsRefining(true);
    const toastId = toast.loading('AI is refining your design...', {
      description: 'Orchestrating multi-model swarm rotation.'
    });

    try {
      const response = await fetch('/api/refine-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSvg: exportedSvg,
          instruction: message,
          currentTitle: artwork.title
        }),
      });

      if (response.status === 503 || response.status === 429) {
        toast.error('Engine Cooling Down', {
          id: toastId,
          description: 'Free tier rate limits hit. Retrying automatically in background...'
        });
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Import the refined SVG as a new document (reusing node uids for
        // elements whose ids survive the refinement) and apply it as one
        // undoable command. The layer panel re-derives from the document —
        // model-reported layer lists are no longer trusted directly.
        const refinedSvg: string = result.data.svg;
        const next = importSvg(refinedSvg, {
          documentId: artwork.id,
          name: artwork.title,
          preserveUidsFrom: vectorDoc ?? undefined,
          metadata: vectorDoc?.metadata,
        });
        if (!next) {
          throw new Error('Refinement returned invalid SVG — document unchanged');
        }
        if (!svgSemanticallyEqual(refinedSvg, exportedSvg)) {
          applyCommands(new ReplaceDocumentCommand(next), 'AI refinement');
        }
        setChatMessage('');
        toast.success('Design Refined', { id: toastId });
      } else {
        throw new Error(result.error || 'Refinement failed');
      }
    } catch (err: any) {
      console.error('Refine failed:', err);
      toast.error('Refinement Failed', { 
        id: toastId,
        description: err.message || 'The AI swarm encountered an issue.' 
      });
    } finally {
      setIsRefining(false);
    }
  };

  // On mount, check whether a server-side GitHub session is still alive.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/github/status')
      .then((res) => (res.ok ? res.json() : { connected: false }))
      .then((data) => {
        if (!cancelled) setGithubConnected(!!data.connected);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const connectGitHub = async () => {
    const res = await fetch('/api/auth/github/url');
    const { url } = await res.json();
    window.open(url, 'github-auth', 'width=600,height=700');

    window.addEventListener('message', (event) => {
      // Only trust same-origin messages from our own OAuth callback page.
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        // The token stays server-side; the callback only signals success.
        setGithubConnected(true);
      }
    }, { once: true });
  };

  const disconnectGitHub = async () => {
    await fetch('/api/auth/github/logout', { method: 'POST' }).catch(() => {});
    setGithubConnected(false);
    toast.info('GitHub disconnected');
  };

  const syncToGitHub = async () => {
    if (!githubConnected) {
      connectGitHub();
      return;
    }

    const repo = prompt("Enter GitHub Repo (owner/repo):", "username/vectora-designs");
    if (!repo) return;

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo,
          path: `designs/${artwork.title.toLowerCase().replace(/\s+/g, '-')}.svg`,
          content: exportedSvg,
          message: `Update design: ${artwork.title}`
        }),
      });
      if (response.status === 401) {
        // Session expired or revoked — reconnect.
        setGithubConnected(false);
        toast.error('GitHub session expired', { description: 'Please reconnect and try again.' });
        return;
      }
      const result = await response.json();
      if (result.success) {
        toast.success('Synced to GitHub successfully!');
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  const tools = [
    { id: 'layers', icon: Layers, label: 'Layers' },
    { id: 'colors', icon: Palette, label: 'Colors' },
    { id: 'animation', icon: Zap, label: 'Animation' },
    { id: 'plugins', icon: Puzzle, label: 'Plugins' },
    { id: 'specs', icon: Info, label: 'Specs' },
    { id: 'code', icon: FileCode, label: 'Code' },
  ];

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#050505]">
      {/* Tool Sidebar (Vertical Bar) */}
      <div className="z-20 flex w-16 flex-col items-center border-r border-white/5 bg-[#0d0d0d] py-4 shadow-2xl">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id as any)}
            className={`group relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
              activeTool === tool.id 
                ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`}
          >
            <tool.icon size={20} />
            <div className="absolute left-14 hidden rounded-md bg-black px-2 py-1 text-xs whitespace-nowrap group-hover:block">
              {tool.label}
            </div>
          </button>
        ))}
        
        <div className="mt-auto border-t border-white/5 pt-4 space-y-4 relative">
          <button 
            onClick={(e) => (e.shiftKey ? disconnectGitHub() : syncToGitHub())}
            className={`transition-colors ${githubConnected ? 'text-blue-400' : 'text-white/40 hover:text-white'}`}
            title={githubConnected ? "Sync to GitHub (Shift+click to disconnect)" : "Connect GitHub"}
          >
            <Github size={20} />
          </button>
          
          {/* Download & Export Trigger */}
          <div className="relative">
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className={`p-2 rounded-xl transition-all ${
                isExportMenuOpen 
                  ? 'bg-[#00FF00] text-black shadow-[0_0_15px_rgba(0,255,0,0.4)]' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
              title="Export Artwork (.SVG / .PNG)"
            >
              <Download size={20} />
            </button>

            {/* Export Quick Popover */}
            <AnimatePresence>
              {isExportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 10 }}
                  className="absolute bottom-0 left-14 z-50 w-64 rounded-2xl border border-white/10 bg-[#0F0F0F] p-2 shadow-2xl backdrop-blur-xl"
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00FF00]">
                      Export Options
                    </span>
                    <button 
                      onClick={() => setIsExportMenuOpen(false)}
                      className="text-white/30 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={handleDownloadSvg}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-white/5 text-xs text-white transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                          <FileCode size={14} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Vector .SVG</div>
                          <div className="text-[10px] text-white/40">Scalable vector markup</div>
                        </div>
                      </div>
                      <kbd className="text-[9px] font-mono text-white/30 bg-black/40 px-1 py-0.5 rounded border border-white/10">
                        Ctrl+Shift+S
                      </kbd>
                    </button>

                    <button
                      onClick={() => handleDownloadPng(2)}
                      disabled={isExportingPng}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-white/5 text-xs text-white transition-colors group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                          <ImageIcon size={14} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Raster .PNG (2x)</div>
                          <div className="text-[10px] text-white/40">2000px Retina render</div>
                        </div>
                      </div>
                      <kbd className="text-[9px] font-mono text-white/30 bg-black/40 px-1 py-0.5 rounded border border-white/10">
                        Ctrl+Shift+P
                      </kbd>
                    </button>

                    <button
                      onClick={() => handleDownloadPng(4)}
                      disabled={isExportingPng}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-white/5 text-xs text-white transition-colors group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                          <Sparkles size={14} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Ultra HD .PNG (4x)</div>
                          <div className="text-[10px] text-white/40">4000px 4K display</div>
                        </div>
                      </div>
                    </button>

                    <div className="border-t border-white/5 my-1" />

                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        setIsExportModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                    >
                      <span className="font-medium text-[11px]">Advanced Export Studio...</span>
                      <kbd className="text-[9px] font-mono text-white/30 bg-black/40 px-1 py-0.5 rounded border border-white/10">
                        Ctrl+E
                      </kbd>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: artwork.title,
                  text: `Check out "${artwork.title}" made with VECTORA!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(exportedSvg);
                toast.success('SVG Markup copied to clipboard');
              }
            }}
            className="text-white/40 hover:text-white transition-colors"
            title="Share or Copy SVG"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Active Tool Panel */}
      <AnimatePresence mode="wait">
        {activeTool && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="z-10 w-80 border-r border-white/5 bg-[#0d0d0d] shadow-2xl"
          >
            <div className="flex h-12 items-center justify-between border-b border-white/5 px-4">
              <span className="text-sm font-bold uppercase tracking-widest text-white/60">
                {activeTool}
              </span>
              <button onClick={() => setActiveTool(null)} className="text-white/20 hover:text-white">
                <ChevronLeft size={16} />
              </button>
            </div>
            <div className="h-[calc(100%-3rem)] overflow-y-auto">
              {activeTool === 'layers' && (
                <LayerPanel 
                  layers={layers} 
                  svgString={exportedSvg} 
                  onToggleLayer={handleToggleLayer} 
                  onToggleLock={handleToggleLock}
                  onRenameLayer={handleRenameLayer}
                  onSoloLayer={handleSoloLayer}
                  onShowAllLayers={handleShowAllLayers}
                  onClose={() => setActiveTool(null)} 
                  onReorderLayer={handleReorderLayer}
                  onAddNewLayer={handleAddNewLayer}
                  onSetBlendMode={handleSetBlendMode}
                />
              )}
              {activeTool === 'colors' && (
                <PaletteManager 
                  onApplyPalette={handleApplyPalette} 
                  currentColors={artwork.palette || []} 
                  activeSvg={exportedSvg} 
                />
              )}
              {activeTool === 'animation' && (
                <AnimationStudio
                  artwork={artwork}
                  onUpdateSvg={(svg) => handleExternalSvgChange(svg, 'Apply animation', 'animation-bake')}
                  onSwitchToCanvas={() => setActiveTool(null)}
                />
              )}
              {activeTool === 'plugins' && <PluginGallery />}
              {activeTool === 'specs' && <DesignSpecPanel artwork={artwork} />}
              {activeTool === 'code' && (
                <CodeEditor
                  artwork={artwork}
                  onUpdateSvg={(svg) => handleExternalSvgChange(svg, 'Edit SVG source', 'code-edit')}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas Viewport */}
      <div className="relative flex-1 overflow-hidden">
        {/* Quick Direct Export HUD */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1.5 font-mono">
          <button
            onClick={handleDownloadSvg}
            title="Download Vector .SVG (Ctrl+Shift+S)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0D0D0D]/90 hover:bg-[#1A1A1A] border border-white/10 hover:border-[#00FF00] text-xs font-semibold text-white rounded-lg shadow-lg backdrop-blur-md transition-all group"
          >
            <Download size={13} className="text-[#00FF00] group-hover:scale-110 transition-transform" />
            <span>.SVG</span>
          </button>

          <button
            onClick={() => handleDownloadPng(2)}
            disabled={isExportingPng}
            title="Download High-Res .PNG (Ctrl+Shift+P)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0D0D0D]/90 hover:bg-[#1A1A1A] border border-white/10 hover:border-emerald-400 text-xs font-semibold text-white rounded-lg shadow-lg backdrop-blur-md transition-all group disabled:opacity-50"
          >
            <ImageIcon size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{isExportingPng ? 'Rendering...' : '.PNG'}</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            title="Open Advanced Export Studio (Ctrl+E)"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0D0D0D]/90 hover:bg-[#1A1A1A] border border-white/10 hover:border-white/30 text-xs font-semibold text-white/70 hover:text-white rounded-lg shadow-lg backdrop-blur-md transition-all"
          >
            <span>Export</span>
            <ExternalLink size={12} className="text-white/40" />
          </button>
        </div>

        <StudioCanvas 
          artwork={artwork} 
          layers={layers} 
          settings={canvasSettings}
          workspaceLayout="canvas-focus"
          onSelectLayout={() => {}}
          onToggleLayers={() => setActiveTool(activeTool === 'layers' ? null : 'layers')}
          showLayers={activeTool === 'layers'}
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenImport={() => setIsImportModalOpen(true)}
          onOpenAnimator={() => setActiveTool('animation')}
          onUpdateSettings={handleUpdateSettings}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyFlags.canUndo}
          canRedo={historyFlags.canRedo}
        />

        {/* Real-Time On-Canvas Prompt Refinement */}
        <RefinePromptBar onRefine={handleRefine} isRefining={isRefining} />
      </div>

      {/* Modals */}
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        artwork={artwork} 
      />
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onArtworkImported={(newArt) => {
          onUpdateArtwork(newArt);
          setIsImportModalOpen(false);
        }} 
      />

      {/* Floating Collapsable Chat */}
      <div className={`absolute bottom-6 right-6 z-30 flex flex-col items-end gap-4 transition-all ${isChatOpen ? 'w-96' : 'w-14'}`}>
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="flex h-[500px] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#161616]/80 p-1 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="text-sm font-bold text-white/60">Aesthetic AI Refiner</span>
                <button onClick={() => setIsChatOpen(false)} className="text-white/20 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="rounded-2xl bg-white/5 p-3 text-sm text-white/80">
                  How can I refine this design? I can adjust colors, add motion, or mutate the geometry.
                </div>
              </div>
              <div className="p-3">
                <div className="flex gap-2 rounded-2xl border border-white/5 bg-white/5 p-2">
                  <input 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRefine();
                      }
                    }}
                    placeholder="Refine design..."
                    className="flex-1 bg-transparent px-2 text-sm outline-none"
                    disabled={isRefining}
                  />
                  <button 
                    onClick={handleRefine}
                    disabled={isRefining || !chatMessage.trim()}
                    className="rounded-xl bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isRefining ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RotateCcw size={16} />
                      </motion.div>
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all ${
            isChatOpen ? 'bg-white text-black' : 'bg-blue-500 text-white hover:scale-110'
          }`}
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </div>
  );
};

// Internal components would need to be imported or adjusted to fit this unified layout.
