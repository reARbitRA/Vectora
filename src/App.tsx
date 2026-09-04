import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CanvasSettings,
  LayerSpec,
  PaletteTheme,
  StudioTab,
  VectorArtwork,
  WorkspaceLayout
} from './types';
import { MASTERPIECES } from './data/masterpieces';
import { Navbar } from './components/Navbar';
import { StudioCanvas } from './components/StudioCanvas';
import { LayerPanel } from './components/LayerPanel';
import { ParametricPanel } from './components/ParametricPanel';
import { PaletteManager } from './components/PaletteManager';
import { ReusableComponentShowcase } from './components/ReusableComponentShowcase';
import { CodeEditor } from './components/CodeEditor';
import { DesignSpecPanel } from './components/DesignSpecPanel';
import { MasterpieceGallery } from './components/MasterpieceGallery';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { ImportModal } from './components/ImportModal';
import { RefinePromptBar } from './components/RefinePromptBar';
import { ExportModal } from './components/ExportModal';
import {
  parseSvgLayers,
  extractSvgColors,
  remapSvgColors,
  renameSvgLayer,
  setSvgLayerVisibility,
  setSvgLayerLock,
  setSvgLayerBlendMode,
  reorderSvgLayer,
  addNewSvgLayer,
  standardizeSvgLayers,
  injectReusableComponent,
  downloadBlob
} from './utils/svgParser';
import { Sparkles, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';

export function App() {
  const [currentArtwork, setCurrentArtwork] = useState<VectorArtwork>(MASTERPIECES[0]);
  const [currentTab, setCurrentTab] = useState<StudioTab>('canvas');
  const [layers, setLayers] = useState<LayerSpec[]>(() => parseSvgLayers(MASTERPIECES[0].svg));

  // Workspace Layout State
  const [workspaceLayout, setWorkspaceLayout] = useState<WorkspaceLayout>(() => {
    const saved = localStorage.getItem('vectora_workspace_layout');
    return (saved === 'minimalist' || saved === 'canvas-focus' || saved === 'full') ? saved : 'full';
  });

  // Save layout preference to localStorage
  const handleSelectLayout = (layout: WorkspaceLayout) => {
    setWorkspaceLayout(layout);
    localStorage.setItem('vectora_workspace_layout', layout);
  };

  // History State for Undo / Redo
  const [history, setHistory] = useState<string[]>([MASTERPIECES[0].svg]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isUndoRedoAction = useRef(false);

  // Canvas Viewport & Parametric Settings
  const [settings, setSettings] = useState<CanvasSettings>({
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

  // UI Panels and Modals
  const [showLayers, setShowLayers] = useState(true);
  const [showParametric, setShowParametric] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showMinimalistRefineBar, setShowMinimalistRefineBar] = useState(false);

  // Push to history helper
  const pushToHistory = useCallback((newSvg: string) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      if (upToCurrent[upToCurrent.length - 1] === newSvg) return prev;
      return [...upToCurrent, newSvg].slice(-30);
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Sync layers whenever artwork SVG changes
  useEffect(() => {
    const parsed = parseSvgLayers(currentArtwork.svg);
    if (parsed.length > 0) {
      setLayers(parsed);
    }
  }, [currentArtwork.svg]);

  const handleUpdateSettings = (newSettings: Partial<CanvasSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSelectArtwork = (art: VectorArtwork) => {
    setCurrentArtwork(art);
    setLayers(parseSvgLayers(art.svg));
    setHistory([art.svg]);
    setHistoryIndex(0);
    setCurrentTab('canvas');
  };

  const handleRandomArtwork = () => {
    const others = MASTERPIECES.filter((m) => m.id !== currentArtwork.id);
    const random = others[Math.floor(Math.random() * others.length)] || MASTERPIECES[0];
    handleSelectArtwork(random);
  };

  // Direct SVG update from live Code Editor
  const handleUpdateSvg = (newSvg: string) => {
    pushToHistory(newSvg);
    setCurrentArtwork((prev) => ({
      ...prev,
      svg: newSvg,
    }));
  };

  // Undo / Redo Handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const nextIndex = historyIndex - 1;
      const targetSvg = history[nextIndex];
      setHistoryIndex(nextIndex);
      setCurrentArtwork((prev) => ({
        ...prev,
        svg: targetSvg,
        layers: parseSvgLayers(targetSvg),
      }));
      setLayers(parseSvgLayers(targetSvg));
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextIndex = historyIndex + 1;
      const targetSvg = history[nextIndex];
      setHistoryIndex(nextIndex);
      setCurrentArtwork((prev) => ({
        ...prev,
        svg: targetSvg,
        layers: parseSvgLayers(targetSvg),
      }));
      setLayers(parseSvgLayers(targetSvg));
    }
  }, [history, historyIndex]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S: Save / Download SVG
      if (cmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const blob = new Blob([currentArtwork.svg], { type: 'image/svg+xml;charset=utf-8' });
        downloadBlob(blob, `${currentArtwork.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
        return;
      }

      // Ctrl/Cmd + I: Open Import Modal
      if (cmdOrCtrl && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsImportOpen(true);
        return;
      }

      // Ctrl/Cmd + Z (and Ctrl/Cmd + Shift + Z / Ctrl + Y for Redo)
      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Ctrl/Cmd + 0: Reset Zoom & Pan
      if (cmdOrCtrl && e.key === '0') {
        e.preventDefault();
        setSettings((prev) => ({ ...prev, zoom: 1, pan: { x: 0, y: 0 } }));
        return;
      }

      // Alt + 1, 2, 3: Layout Switcher
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        handleSelectLayout('full');
        return;
      }
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        handleSelectLayout('minimalist');
        return;
      }
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        handleSelectLayout('canvas-focus');
        return;
      }

      // Single-key studio toggles (only when not typing in inputs)
      if (!isInputActive && !cmdOrCtrl && !e.altKey) {
        if (e.code === 'KeyL') {
          e.preventDefault();
          setShowLayers((l) => !l);
        } else if (e.code === 'KeyP') {
          e.preventDefault();
          setShowParametric((p) => !p);
        } else if (e.code === 'KeyG') {
          e.preventDefault();
          setSettings((prev) => ({ ...prev, showGrid: !prev.showGrid }));
        } else if (e.code === 'KeyE') {
          e.preventDefault();
          setIsExportOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentArtwork, handleUndo, handleRedo]);

  // Layer Visibility Management (with DOM SVG sync)
  const handleToggleLayer = (layerName: string) => {
    const targetLayer = layers.find((l) => l.name === layerName);
    const nextVis = targetLayer ? targetLayer.visible === false : false;
    const updatedSvg = setSvgLayerVisibility(currentArtwork.svg, layerName, nextVis);

    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers((prev) =>
      prev.map((l) => (l.name === layerName ? { ...l, visible: nextVis } : l))
    );
  };

  // Layer Lock / Unlock
  const handleToggleLock = (layerName: string) => {
    const targetLayer = layers.find((l) => l.name === layerName);
    const nextLock = targetLayer ? !targetLayer.locked : true;
    const updatedSvg = setSvgLayerLock(currentArtwork.svg, layerName, nextLock);

    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers((prev) =>
      prev.map((l) => (l.name === layerName ? { ...l, locked: nextLock } : l))
    );
  };

  // Layer Blend Mode Management
  const handleSetLayerBlendMode = (layerName: string, blendMode: string) => {
    const updatedSvg = setSvgLayerBlendMode(currentArtwork.svg, layerName, blendMode);
    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers((prev) =>
      prev.map((l) => (l.name === layerName ? { ...l, blendMode } : l))
    );
  };

  // Layer Renaming
  const handleRenameLayer = (oldName: string, newName: string) => {
    const updatedSvg = renameSvgLayer(currentArtwork.svg, oldName, newName);
    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers((prev) =>
      prev.map((l) => (l.name === oldName ? { ...l, name: newName } : l))
    );
  };

  // Layer Reordering (Draw Order)
  const handleReorderLayer = (layerName: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const updatedSvg = reorderSvgLayer(currentArtwork.svg, layerName, direction);
    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers(parseSvgLayers(updatedSvg));
  };

  // Add New Layer
  const handleAddNewLayer = (name: string) => {
    const updatedSvg = addNewSvgLayer(currentArtwork.svg, name);
    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers(parseSvgLayers(updatedSvg));
  };

  // Standardize All Layer Names to VECTORA Convention
  const handleStandardizeLayers = () => {
    const updatedSvg = standardizeSvgLayers(currentArtwork.svg);
    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers(parseSvgLayers(updatedSvg));
  };

  const handleSoloLayer = (layerName: string) => {
    let updatedSvg = currentArtwork.svg;
    layers.forEach((l) => {
      const isTarget = l.name === layerName;
      updatedSvg = setSvgLayerVisibility(updatedSvg, l.name, isTarget);
    });
    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers((prev) =>
      prev.map((l) => ({
        ...l,
        visible: l.name === layerName,
      }))
    );
  };

  const handleShowAllLayers = () => {
    let updatedSvg = currentArtwork.svg;
    layers.forEach((l) => {
      updatedSvg = setSvgLayerVisibility(updatedSvg, l.name, true);
    });
    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({ ...prev, svg: updatedSvg }));
    setLayers((prev) => prev.map((l) => ({ ...l, visible: true })));
  };

  // Parametric Palette Remapping
  const handleApplyPaletteTheme = (theme: PaletteTheme) => {
    const remappedSvg = remapSvgColors(currentArtwork.svg, theme.colors);
    const updatedColors = extractSvgColors(remappedSvg);
    pushToHistory(remappedSvg);

    setCurrentArtwork((prev) => ({
      ...prev,
      svg: remappedSvg,
      palette: updatedColors.length > 0 ? updatedColors : prev.palette,
    }));
  };

  // Inject Reusable SVG Component into Current Artwork
  const handleInjectReusableComponent = (defsSnippet: string, useSnippet: string) => {
    const updatedSvg = injectReusableComponent(currentArtwork.svg, defsSnippet, useSnippet);
    pushToHistory(updatedSvg);
    setCurrentArtwork((prev) => ({
      ...prev,
      svg: updatedSvg,
      layers: parseSvgLayers(updatedSvg),
    }));
    setLayers(parseSvgLayers(updatedSvg));
    setCurrentTab('canvas');
  };

  // Import Artwork Result Handler
  const handleArtworkImported = (newArtwork: VectorArtwork) => {
    setCurrentArtwork(newArtwork);
    setLayers(parseSvgLayers(newArtwork.svg));
    setHistory([newArtwork.svg]);
    setHistoryIndex(0);
    setCurrentTab('canvas');
  };

  // AI Generation via Backend API with Graceful Procedural Fallback
  const handleAIGenerate = async (
    prompt: string,
    style: string,
    complexity: string,
    paletteMood: string
  ) => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/generate-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, complexity, paletteMood }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.artwork && data.artwork.svg) {
          const newArt: VectorArtwork = {
            id: `ai-art-${Date.now()}`,
            title: data.artwork.title || prompt.slice(0, 30),
            subtitle: data.artwork.subtitle || `${style} Generative Object`,
            style: data.artwork.style || style,
            concept: data.artwork.concept || prompt,
            viewBox: data.artwork.viewBox || '0 0 1000 1000',
            palette: data.artwork.palette || extractSvgColors(data.artwork.svg),
            layers: data.artwork.layers || parseSvgLayers(data.artwork.svg),
            evolutionIdeas: data.artwork.evolutionIdeas || [
              'Add animated rotation keyframes to the central ring',
              'Introduce dynamic stroke-dashoffset tracing',
            ],
            svg: data.artwork.svg,
          };
          handleArtworkImported(newArt);
          setIsAIGeneratorOpen(false);
          return;
        }
      }
      throw new Error('API generation failed or key missing');
    } catch (err) {
      console.warn('Backend generation failed, utilizing client procedural synthesis:', err);
      const matching = MASTERPIECES.find((m) => m.style.toLowerCase().includes(style.toLowerCase())) || MASTERPIECES[0];
      const fallbackArt: VectorArtwork = {
        ...matching,
        id: `synth-${Date.now()}`,
        title: prompt.length > 40 ? `${prompt.slice(0, 40)}...` : prompt,
        subtitle: `${style} Vector Composition`,
        concept: `A custom vector artifact synthesized for: "${prompt}". Designed with mathematical precision and Inkscape-compliant layering.`,
      };
      handleArtworkImported(fallbackArt);
      setIsAIGeneratorOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Refinement via Backend API
  const handleRefine = async (instruction: string) => {
    try {
      setIsRefining(true);
      const res = await fetch('/api/refine-svg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentSvg: currentArtwork.svg, instruction }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.artwork && data.artwork.svg) {
          setCurrentArtwork((prev) => ({
            ...prev,
            svg: data.artwork.svg,
            concept: `${prev.concept} • Refined: ${instruction}`,
            palette: data.artwork.palette || extractSvgColors(data.artwork.svg),
            layers: data.artwork.layers || parseSvgLayers(data.artwork.svg),
          }));
          return;
        }
      }
      throw new Error('Refinement failed');
    } catch (err) {
      console.warn('Refinement server call returned error:', err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#000000] text-[#FFFFFF] overflow-hidden font-mono antialiased">
      {/* Top Navbar (Hidden in Canvas Focus for max immersion) */}
      {workspaceLayout !== 'canvas-focus' && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentArtwork={currentArtwork}
          workspaceLayout={workspaceLayout}
          onSelectLayout={handleSelectLayout}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onRandomArtwork={handleRandomArtwork}
          onToggleParametric={() => setShowParametric((p) => !p)}
          showParametric={showParametric}
          onToggleLayers={() => setShowLayers((l) => !l)}
          showLayers={showLayers}
        />
      )}

      {/* Main Studio Viewport */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* TAB 1: Studio Canvas Mode */}
        {currentTab === 'canvas' && (
          <div className="flex-1 flex h-full relative overflow-hidden">
            <StudioCanvas
              artwork={currentArtwork}
              layers={layers}
              settings={settings}
              workspaceLayout={workspaceLayout}
              onSelectLayout={handleSelectLayout}
              onToggleLayers={() => setShowLayers((l) => !l)}
              showLayers={showLayers}
              onOpenExport={() => setIsExportOpen(true)}
              onOpenImport={() => setIsImportOpen(true)}
              onUpdateSettings={handleUpdateSettings}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />

            {/* Contextual Bottom Refinement Bar */}
            {workspaceLayout === 'full' && (
              <RefinePromptBar
                onRefine={handleRefine}
                isRefining={isRefining}
              />
            )}

            {/* Minimalist Refine Drawer / Pill */}
            {workspaceLayout === 'minimalist' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                {showMinimalistRefineBar ? (
                  <div className="w-[90vw] max-w-xl">
                    <RefinePromptBar
                      onRefine={(ins) => {
                        handleRefine(ins);
                        setShowMinimalistRefineBar(false);
                      }}
                      isRefining={isRefining}
                    />
                    <button
                      onClick={() => setShowMinimalistRefineBar(false)}
                      className="mx-auto mt-1 px-2 py-0.5 bg-[#141414] border border-[#333333] text-[9px] text-[#888888] hover:text-[#FFFFFF] uppercase flex items-center gap-1"
                    >
                      <ChevronDown className="w-2.5 h-2.5" />
                      <span>Hide Refine Bar</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMinimalistRefineBar(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D0D]/90 hover:bg-[#1A1A1A] border border-[#333333] hover:border-[#00FF00] text-[#CCCCCC] hover:text-[#00FF00] text-xs uppercase font-mono shadow-2xl backdrop-blur-md transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#00FF00]" />
                    <span>Quick Refine AI Prompt</span>
                    <ChevronUp className="w-3 h-3 text-[#777777]" />
                  </button>
                )}
              </div>
            )}

            {/* Right Drawer: Inkscape Layer Hierarchy & Nested Groups */}
            <AnimatePresence>
              {showLayers && (
                <motion.div
                  key="layer-panel-drawer"
                  initial={{ x: '100%', opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.5 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280, mass: 0.8 }}
                  className="h-full z-20 shrink-0 flex"
                >
                  <LayerPanel
                    layers={layers}
                    svgString={currentArtwork.svg}
                    onToggleLayer={handleToggleLayer}
                    onToggleLock={handleToggleLock}
                    onRenameLayer={handleRenameLayer}
                    onReorderLayer={handleReorderLayer}
                    onAddNewLayer={handleAddNewLayer}
                    onStandardizeLayers={handleStandardizeLayers}
                    onSoloLayer={handleSoloLayer}
                    onShowAllLayers={handleShowAllLayers}
                    onSetBlendMode={handleSetLayerBlendMode}
                    onClose={() => setShowLayers(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right Drawer: Parametric Styling & FX */}
            <AnimatePresence>
              {showParametric && (
                <motion.div
                  key="parametric-panel-drawer"
                  initial={{ x: '100%', opacity: 0.5 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0.5 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 280, mass: 0.8 }}
                  className="h-full z-20 shrink-0 flex"
                >
                  <ParametricPanel
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onApplyPaletteTheme={handleApplyPaletteTheme}
                    onClose={() => setShowParametric(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 2: Custom Palette Manager & Generator */}
        {currentTab === 'palettes' && (
          <PaletteManager
            onApplyPalette={handleApplyPaletteTheme}
            currentColors={currentArtwork.palette.map((p) => p.hex)}
            activeSvg={currentArtwork.svg}
          />
        )}

        {/* TAB 3: Reusable SVG Components Studio */}
        {currentTab === 'components' && (
          <ReusableComponentShowcase
            onInjectComponent={handleInjectReusableComponent}
          />
        )}

        {/* TAB 4: Live SVG Code & AST Inspector */}
        {currentTab === 'editor' && (
          <CodeEditor
            artwork={currentArtwork}
            onUpdateSvg={handleUpdateSvg}
          />
        )}

        {/* TAB 5: Design Spec Sheet & Standards Audit */}
        {currentTab === 'specs' && (
          <DesignSpecPanel artwork={currentArtwork} />
        )}

        {/* TAB 6: Masterpiece Gallery */}
        {currentTab === 'gallery' && (
          <MasterpieceGallery
            onSelectArtwork={handleSelectArtwork}
            currentArtworkId={currentArtwork.id}
          />
        )}
      </main>

      {/* AI Vector Generator Modal */}
      <AIGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
      />

      {/* Image & Text Document Import & Vectorization Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onArtworkImported={handleArtworkImported}
      />

      {/* Comprehensive Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        artwork={currentArtwork}
      />
    </div>
  );
}

export default App;
