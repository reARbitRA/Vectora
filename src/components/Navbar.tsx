import React, { useState } from 'react';
import { StudioTab, VectorArtwork, WorkspaceLayout } from '../types';
import {
  Compass,
  Code2,
  FileText,
  Sparkles,
  Download,
  Grid,
  Layers,
  Shuffle,
  Eye,
  Sliders,
  Palette,
  Scan,
  Layout,
  Maximize2,
  LayoutGrid,
  Minimize2,
  ChevronDown,
  Film
} from 'lucide-react';

interface NavbarProps {
  currentTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  currentArtwork: VectorArtwork;
  workspaceLayout: WorkspaceLayout;
  onSelectLayout: (layout: WorkspaceLayout) => void;
  onOpenImport: () => void;
  onOpenAIGenerator: () => void;
  onOpenExport: () => void;
  onRandomArtwork: () => void;
  onToggleParametric: () => void;
  showParametric: boolean;
  onToggleLayers: () => void;
  showLayers: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentArtwork,
  workspaceLayout,
  onSelectLayout,
  onOpenImport,
  onOpenAIGenerator,
  onOpenExport,
  onRandomArtwork,
  onToggleParametric,
  showParametric,
  onToggleLayers,
  showLayers,
}) => {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const layoutLabels: Record<WorkspaceLayout, { name: string; desc: string }> = {
    full: { name: 'Full Studio', desc: 'Complete toolbars, layers, and tuner' },
    minimalist: { name: 'Minimalist', desc: 'Clean, distraction-free artboard' },
    'canvas-focus': { name: 'Canvas Focus', desc: 'Immersive full-screen canvas' },
  };

  return (
    <header className="h-14 bg-[#0A0A0A] border-b border-[#333333] px-3 md:px-4 flex items-center justify-between z-30 shrink-0 select-none font-mono">
      {/* Brand Identity */}
      <div className="flex items-center gap-2.5 md:gap-3">
        <div className="w-8 h-8 bg-[#00FF00] border border-[#00FF00] flex items-center justify-center text-[#000000] font-black text-sm tracking-tighter">
          V
        </div>
        <div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="font-extrabold text-xs tracking-widest text-[#FFFFFF] uppercase">VECTORA</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#141414] text-[#00FF00] border border-[#333333]">
              STUDIO v2.5
            </span>
          </div>
          <p className="text-[11px] text-[#888888] hidden sm:block truncate max-w-[160px] md:max-w-[280px] font-mono">
            {currentArtwork.title}
          </p>
        </div>
      </div>

      {/* Main Mode Navigation (Hidden in Canvas Focus for maximum screen real-estate) */}
      {workspaceLayout !== 'canvas-focus' && (
        <nav className="flex items-center bg-[#141414] p-1 border border-[#333333] overflow-x-auto custom-scrollbar">
          <button
            id="nav-tab-canvas"
            onClick={() => onSelectTab('canvas')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentTab === 'canvas'
                ? 'bg-[#00FF00] text-[#000000] font-bold'
                : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>

          <button
            id="nav-tab-palettes"
            onClick={() => onSelectTab('palettes')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentTab === 'palettes'
                ? 'bg-[#00FF00] text-[#000000] font-bold'
                : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Palettes</span>
          </button>

          <button
            id="nav-tab-components"
            onClick={() => onSelectTab('components')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentTab === 'components'
                ? 'bg-[#00FF00] text-[#000000] font-bold'
                : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Components</span>
          </button>

          <button
            id="nav-tab-animator"
            onClick={() => onSelectTab('animator')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentTab === 'animator'
                ? 'bg-[#00FF00] text-[#000000] font-bold'
                : 'text-[#888888] hover:text-[#00FF00] hover:bg-[#222222]'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-[#00FF00]" />
            <span>Animate</span>
          </button>

          <button
            id="nav-tab-editor"
            onClick={() => onSelectTab('editor')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentTab === 'editor'
                ? 'bg-[#00FF00] text-[#000000] font-bold'
                : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code & AST</span>
          </button>

          <button
            id="nav-tab-specs"
            onClick={() => onSelectTab('specs')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentTab === 'specs'
                ? 'bg-[#00FF00] text-[#000000] font-bold'
                : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Specs</span>
          </button>

          <button
            id="nav-tab-gallery"
            onClick={() => onSelectTab('gallery')}
            className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
              currentTab === 'gallery'
                ? 'bg-[#00FF00] text-[#000000] font-bold'
                : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Gallery</span>
          </button>
        </nav>
      )}

      {/* Action Controls & Layout Switcher */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Predefined Workspace Layout Selector Dropdown */}
        <div className="relative">
          <button
            id="btn-workspace-layout"
            onClick={() => setShowLayoutMenu(!showLayoutMenu)}
            title="Switch Workspace Layout (Full Studio, Minimalist, Canvas Focus)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141414] hover:bg-[#202020] text-[#CCCCCC] hover:text-[#FFFFFF] border border-[#333333] hover:border-[#555555] text-xs font-mono uppercase transition-all"
          >
            <Layout className="w-3.5 h-3.5 text-[#00FF00]" />
            <span className="hidden lg:inline">{layoutLabels[workspaceLayout].name}</span>
            <ChevronDown className="w-3 h-3 text-[#777777]" />
          </button>

          {showLayoutMenu && (
            <div className="absolute right-0 mt-1 w-56 bg-[#121212] border border-[#333333] shadow-2xl py-1 z-50 text-left">
              <div className="px-3 py-1.5 border-b border-[#222222] text-[10px] text-[#777777] uppercase font-bold tracking-wider">
                Workspace Layouts
              </div>

              <button
                onClick={() => {
                  onSelectLayout('full');
                  setShowLayoutMenu(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2 text-xs transition-colors ${
                  workspaceLayout === 'full'
                    ? 'bg-[#00FF00]/10 text-[#00FF00]'
                    : 'text-[#CCCCCC] hover:bg-[#1A1A1A]'
                }`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Full Studio</div>
                  <div className="text-[10px] text-[#777777]">All tools, drawers & refinement</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectLayout('minimalist');
                  setShowLayoutMenu(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2 text-xs transition-colors ${
                  workspaceLayout === 'minimalist'
                    ? 'bg-[#00FF00]/10 text-[#00FF00]'
                    : 'text-[#CCCCCC] hover:bg-[#1A1A1A]'
                }`}
              >
                <Minimize2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Minimalist</div>
                  <div className="text-[10px] text-[#777777]">Clean, distraction-free artboard</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectLayout('canvas-focus');
                  setShowLayoutMenu(false);
                }}
                className={`w-full px-3 py-2 text-left flex items-start gap-2 text-xs transition-colors ${
                  workspaceLayout === 'canvas-focus'
                    ? 'bg-[#00FF00]/10 text-[#00FF00]'
                    : 'text-[#CCCCCC] hover:bg-[#1A1A1A]'
                }`}
              >
                <Maximize2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Canvas Focus</div>
                  <div className="text-[10px] text-[#777777]">Immersive ultra-wide artboard</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Import Image / Text Document Button */}
        <button
          id="btn-import-vector"
          onClick={onOpenImport}
          title="Import image to vector scan or text document to vector synthesize"
          className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#202020] text-[#00FF00] hover:text-[#33FF33] font-bold px-2.5 md:px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-[#333333] hover:border-[#00FF00] transition-all"
        >
          <Scan className="w-3.5 h-3.5 text-[#00FF00]" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {currentTab === 'canvas' && workspaceLayout !== 'canvas-focus' && (
          <>
            <button
              id="btn-toggle-layers"
              onClick={onToggleLayers}
              title="Toggle Inkscape Layer Hierarchy"
              className={`p-2 border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                showLayers
                  ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]'
                  : 'bg-[#141414] text-[#888888] border-[#333333] hover:text-[#FFFFFF] hover:bg-[#222222]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">Layers</span>
            </button>

            {workspaceLayout === 'full' && (
              <button
                id="btn-toggle-parametric"
                onClick={onToggleParametric}
                title="Toggle Parametric Styling & FX"
                className={`p-2 border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  showParametric
                    ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]'
                    : 'bg-[#141414] text-[#888888] border-[#333333] hover:text-[#FFFFFF] hover:bg-[#222222]'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden md:inline">Tune</span>
              </button>
            )}
          </>
        )}

        <button
          id="btn-random-artwork"
          onClick={onRandomArtwork}
          title="Load Random Masterpiece"
          className="p-2 bg-[#141414] border border-[#333333] text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          id="btn-open-generator"
          onClick={onOpenAIGenerator}
          className="flex items-center gap-1.5 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold px-2.5 md:px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border border-[#00FF00] active:translate-y-0.5"
        >
          <Sparkles className="w-3.5 h-3.5 fill-[#000000]" />
          <span className="hidden sm:inline">AI Generator</span>
        </button>

        <button
          id="btn-open-export"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#FFFFFF] font-bold px-2.5 md:px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-[#333333] hover:border-[#555555] transition-all active:translate-y-0.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
