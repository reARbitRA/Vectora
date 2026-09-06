import React, { useState, useEffect } from 'react';
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
  const [githubToken, setGithubToken] = useState<string | null>(localStorage.getItem('github_token'));
  
  // Real Layer State
  const [layers, setLayers] = useState<LayerSpec[]>(artwork.layers || []);

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

  // Undo / Redo SVG Stack
  const [svgHistory, setSvgHistory] = useState<string[]>([artwork.svg]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync layers and history when artwork changes
  React.useEffect(() => {
    if (artwork.layers) setLayers(artwork.layers);
    setSvgHistory([artwork.svg]);
    setHistoryIndex(0);
  }, [artwork.id]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevSvg = svgHistory[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onUpdateSvg(prevSvg);
      toast.info('Undo applied', { description: 'Reverted canvas to previous state' });
    }
  };

  const handleRedo = () => {
    if (historyIndex < svgHistory.length - 1) {
      const nextSvg = svgHistory[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onUpdateSvg(nextSvg);
      toast.info('Redo applied', { description: 'Restored forward canvas state' });
    }
  };

  const handleUpdateSvgWithHistory = (newSvg: string) => {
    onUpdateSvg(newSvg);
    setSvgHistory((prev) => [...prev.slice(0, historyIndex + 1), newSvg]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleUpdateLayers = (newLayers: LayerSpec[]) => {
    setLayers(newLayers);
  };

  const handleToggleLayer = (name: string) => {
    const newLayers = layers.map((l) => (l.name === name ? { ...l, visible: !l.visible } : l));
    handleUpdateLayers(newLayers);
  };

  const handleToggleLock = (name: string) => {
    const newLayers = layers.map((l) => (l.name === name ? { ...l, locked: !l.locked } : l));
    handleUpdateLayers(newLayers);
  };

  const handleRenameLayer = (oldName: string, newName: string) => {
    const newLayers = layers.map((l) => (l.name === oldName ? { ...l, name: newName } : l));
    handleUpdateLayers(newLayers);
  };

  const handleSoloLayer = (name: string) => {
    const newLayers = layers.map((l) => ({ ...l, visible: l.name === name }));
    handleUpdateLayers(newLayers);
  };

  const handleShowAllLayers = () => {
    const newLayers = layers.map((l) => ({ ...l, visible: true }));
    handleUpdateLayers(newLayers);
  };

  const handleApplyPalette = (colors: string[]) => {
    handleRefine(`Apply this color palette to the design: ${colors.join(', ')}`);
  };

  // Handle downloadable SVG export
  const handleDownloadSvg = () => {
    try {
      const blob = new Blob([artwork.svg], { type: 'image/svg+xml;charset=utf-8' });
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
      const blob = await exportSvgToPng(artwork.svg, scale);
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
  }, [artwork.svg, artwork.title]);

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
          currentSvg: artwork.svg,
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
        handleUpdateSvgWithHistory(result.data.svg);
        if (result.data.layers) setLayers(result.data.layers);
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

  const connectGitHub = async () => {
    const res = await fetch('/api/auth/github/url');
    const { url } = await res.json();
    const popup = window.open(url, 'github-auth', 'width=600,height=700');
    
    window.addEventListener('message', (event) => {
      if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
        const token = event.data.token;
        setGithubToken(token);
        localStorage.setItem('github_token', token);
      }
    }, { once: true });
  };

  const syncToGitHub = async () => {
    if (!githubToken) {
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
          token: githubToken,
          repo,
          path: `designs/${artwork.title.toLowerCase().replace(/\s+/g, '-')}.svg`,
          content: artwork.svg,
          message: `Update design: ${artwork.title}`
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert("Synced to GitHub successfully!");
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
            onClick={syncToGitHub}
            className={`transition-colors ${githubToken ? 'text-blue-400' : 'text-white/40 hover:text-white'}`}
            title={githubToken ? "Sync to GitHub" : "Connect GitHub"}
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
                navigator.clipboard.writeText(artwork.svg);
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
                  svgString={artwork.svg} 
                  onToggleLayer={handleToggleLayer} 
                  onToggleLock={handleToggleLock}
                  onRenameLayer={handleRenameLayer}
                  onSoloLayer={handleSoloLayer}
                  onShowAllLayers={handleShowAllLayers}
                  onClose={() => setActiveTool(null)} 
                  onReorderLayer={(from, to) => {
                    const newLayers = [...layers];
                    const [moved] = newLayers.splice(from, 1);
                    newLayers.splice(to, 0, moved);
                    handleUpdateLayers(newLayers);
                  }}
                  onAddNewLayer={() => {
                    const name = `Layer ${layers.length + 1}`;
                    handleUpdateLayers([...layers, { name, visible: true, locked: false, opacity: 1, blendMode: 'normal' }]);
                  }}
                  onSetBlendMode={(name, mode) => {
                    handleUpdateLayers(layers.map(l => l.name === name ? { ...l, blendMode: mode } : l));
                  }}
                />
              )}
              {activeTool === 'colors' && (
                <PaletteManager 
                  onApplyPalette={handleApplyPalette} 
                  currentColors={artwork.palette || []} 
                  activeSvg={artwork.svg} 
                />
              )}
              {activeTool === 'animation' && <AnimationStudio artwork={artwork} onUpdateSvg={onUpdateSvg} onSwitchToCanvas={() => setActiveTool(null)} />}
              {activeTool === 'plugins' && <PluginGallery />}
              {activeTool === 'specs' && <DesignSpecPanel artwork={artwork} />}
              {activeTool === 'code' && <CodeEditor artwork={artwork} onUpdateSvg={onUpdateSvg} />}
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
          canUndo={historyIndex > 0}
          canRedo={historyIndex < svgHistory.length - 1}
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
