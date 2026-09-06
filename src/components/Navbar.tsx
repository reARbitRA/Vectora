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
  Film,
  Menu,
  X,
  SlidersHorizontal,
  Wand2
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
  const [showTabletTools, setShowTabletTools] = useState(false);
  const [showMobileNavMenu, setShowMobileNavMenu] = useState(false);

  const layoutLabels: Record<WorkspaceLayout, { name: string; desc: string }> = {
    full: { name: 'Full Studio', desc: 'Complete toolbars, layers, and tuner' },
    minimalist: { name: 'Minimalist', desc: 'Clean, distraction-free artboard' },
    'canvas-focus': { name: 'Canvas Focus', desc: 'Immersive full-screen canvas' },
  };

  const navTabs: { id: StudioTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'canvas', label: 'Canvas', icon: Eye },
    { id: 'palettes', label: 'Palettes', icon: Palette },
    { id: 'components', label: 'Components', icon: Sparkles },
    { id: 'animator', label: 'Animate', icon: Film },
    { id: 'editor', label: 'Code & AST', icon: Code2 },
    { id: 'specs', label: 'Specs', icon: FileText },
    { id: 'gallery', label: 'Gallery', icon: Grid },
  ];

  const currentTabObj = navTabs.find((t) => t.id === currentTab) || navTabs[0];
  const CurrentTabIcon = currentTabObj.icon;

  const activeDrawerCount = (showLayers ? 1 : 0) + (showParametric ? 1 : 0);

  return (
    <header className="h-14 bg-[#0A0A0A] border-b border-[#333333] px-3 md:px-4 flex items-center justify-between z-30 shrink-0 select-none font-mono relative">
      {/* Brand Identity & Mobile Menu Toggle */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Mobile/Tablet Menu Button (Visible on screens < lg) */}
        {workspaceLayout !== 'canvas-focus' && (
          <button
            onClick={() => setShowMobileNavMenu(!showMobileNavMenu)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-1.5 bg-[#141414] hover:bg-[#202020] text-[#00FF00] border border-[#333333] flex items-center justify-center transition-colors"
          >
            {showMobileNavMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        )}

        <div className="w-7 h-7 md:w-8 md:h-8 bg-[#00FF00] border border-[#00FF00] flex items-center justify-center text-[#000000] font-black text-xs md:text-sm tracking-tighter shrink-0">
          V
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs tracking-widest text-[#FFFFFF] uppercase">VECTORA</span>
            <span className="text-[9px] uppercase font-mono px-1 py-0.2 bg-[#141414] text-[#00FF00] border border-[#333333] hidden sm:inline-block">
              v2.5
            </span>
          </div>
          <p className="text-[10px] md:text-[11px] text-[#888888] truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px] font-mono leading-none mt-0.5">
            {currentArtwork.title}
          </p>
        </div>
      </div>

      {/* Main Mode Navigation - DESKTOP (Visible on xl and above) */}
      {workspaceLayout !== 'canvas-focus' && (
        <nav className="hidden xl:flex items-center bg-[#141414] p-1 border border-[#333333]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00FF00] text-[#000000] font-bold shadow-sm'
                    : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Main Mode Navigation - TABLET (Visible on lg to xl) */}
      {workspaceLayout !== 'canvas-focus' && (
        <nav className="hidden lg:flex xl:hidden items-center bg-[#141414] p-1 border border-[#333333] overflow-x-auto max-w-[480px]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                title={tab.label}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00FF00] text-[#000000] font-bold'
                    : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* TABLET & MOBILE Active View Pill (< lg) */}
      {workspaceLayout !== 'canvas-focus' && (
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setShowMobileNavMenu(!showMobileNavMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#333333] text-xs text-[#00FF00] font-bold uppercase"
          >
            <CurrentTabIcon className="w-3.5 h-3.5" />
            <span>{currentTabObj.label}</span>
            <ChevronDown className={`w-3 h-3 text-[#777777] transition-transform ${showMobileNavMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Right Action Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* DESKTOP-ONLY Action Group (xl and up) */}
        <div className="hidden xl:flex items-center gap-2">
          {/* Workspace Layout Selector */}
          <div className="relative">
            <button
              id="btn-workspace-layout"
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              title="Switch Workspace Layout"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141414] hover:bg-[#202020] text-[#CCCCCC] hover:text-[#FFFFFF] border border-[#333333] hover:border-[#555555] text-xs font-mono uppercase transition-all"
            >
              <Layout className="w-3.5 h-3.5 text-[#00FF00]" />
              <span>{layoutLabels[workspaceLayout].name}</span>
              <ChevronDown className="w-3 h-3 text-[#777777]" />
            </button>

            {showLayoutMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-[#121212] border border-[#333333] shadow-2xl py-1 z-50 text-left">
                <div className="px-3 py-1.5 border-b border-[#222222] text-[10px] text-[#777777] uppercase font-bold tracking-wider">
                  Workspace Layouts
                </div>
                {(['full', 'minimalist', 'canvas-focus'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      onSelectLayout(mode);
                      setShowLayoutMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2 text-xs transition-colors ${
                      workspaceLayout === mode
                        ? 'bg-[#00FF00]/10 text-[#00FF00]'
                        : 'text-[#CCCCCC] hover:bg-[#1A1A1A]'
                    }`}
                  >
                    {mode === 'full' && <LayoutGrid className="w-4 h-4 shrink-0 mt-0.5" />}
                    {mode === 'minimalist' && <Minimize2 className="w-4 h-4 shrink-0 mt-0.5" />}
                    {mode === 'canvas-focus' && <Maximize2 className="w-4 h-4 shrink-0 mt-0.5" />}
                    <div>
                      <div className="font-bold">{layoutLabels[mode].name}</div>
                      <div className="text-[10px] text-[#777777]">{layoutLabels[mode].desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Import Button */}
          <button
            id="btn-import-vector"
            onClick={onOpenImport}
            title="Import image or text"
            className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#202020] text-[#00FF00] hover:text-[#33FF33] font-bold px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-[#333333] hover:border-[#00FF00] transition-all"
          >
            <Scan className="w-3.5 h-3.5 text-[#00FF00]" />
            <span>Import</span>
          </button>

          {/* Canvas-specific Drawers */}
          {currentTab === 'canvas' && workspaceLayout !== 'canvas-focus' && (
            <>
              <button
                id="btn-toggle-layers"
                onClick={onToggleLayers}
                title="Toggle Layers Drawer"
                className={`p-1.5 px-2.5 border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  showLayers
                    ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00] font-bold'
                    : 'bg-[#141414] text-[#888888] border-[#333333] hover:text-[#FFFFFF] hover:bg-[#222222]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Layers</span>
              </button>

              {workspaceLayout === 'full' && (
                <button
                  id="btn-toggle-parametric"
                  onClick={onToggleParametric}
                  title="Toggle Parametric FX Drawer"
                  className={`p-1.5 px-2.5 border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    showParametric
                      ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00] font-bold'
                      : 'bg-[#141414] text-[#888888] border-[#333333] hover:text-[#FFFFFF] hover:bg-[#222222]'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Tune</span>
                </button>
              )}
            </>
          )}

          {/* Random Artwork */}
          <button
            id="btn-random-artwork"
            onClick={onRandomArtwork}
            title="Load Random Masterpiece"
            className="p-1.5 px-2 bg-[#141414] border border-[#333333] text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* TABLET & MOBILE Quick Tools Popover Button (Screens < xl) */}
        <div className="relative xl:hidden">
          <button
            onClick={() => setShowTabletTools(!showTabletTools)}
            title="Studio Tools & Settings"
            className={`flex items-center gap-1 px-2.5 py-1.5 border text-xs font-mono uppercase transition-all ${
              showTabletTools || activeDrawerCount > 0
                ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]'
                : 'bg-[#141414] text-[#CCCCCC] border-[#333333] hover:text-[#FFFFFF]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">Tools</span>
            {activeDrawerCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#00FF00]" />
            )}
            <ChevronDown className="w-3 h-3 text-[#777777]" />
          </button>

          {showTabletTools && (
            <div className="absolute right-0 mt-2 w-64 bg-[#111111] border-2 border-[#333333] shadow-2xl p-2 z-50 text-left">
              <div className="px-2 py-1 border-b border-[#222222] text-[10px] text-[#777777] uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
                <span>Studio Controls</span>
                <button onClick={() => setShowTabletTools(false)} className="text-[#666666] hover:text-[#FFFFFF]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {currentTab === 'canvas' && (
                <div className="space-y-1 mb-2 pb-2 border-b border-[#222222]">
                  <button
                    onClick={() => {
                      onToggleLayers();
                      setShowTabletTools(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs border ${
                      showLayers
                        ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00] font-bold'
                        : 'bg-[#181818] text-[#CCCCCC] border-[#2A2A2A] hover:bg-[#222222]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      <span>Layers Drawer</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#000000] text-[#888888]">
                      {showLayers ? 'ACTIVE' : 'OFF'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleParametric();
                      setShowTabletTools(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs border ${
                      showParametric
                        ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00] font-bold'
                        : 'bg-[#181818] text-[#CCCCCC] border-[#2A2A2A] hover:bg-[#222222]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      <span>Parametric FX</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#000000] text-[#888888]">
                      {showParametric ? 'ACTIVE' : 'OFF'}
                    </span>
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <button
                  onClick={() => {
                    onOpenImport();
                    setShowTabletTools(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs bg-[#181818] hover:bg-[#222222] text-[#00FF00] border border-[#2A2A2A]"
                >
                  <Scan className="w-4 h-4 text-[#00FF00]" />
                  <span>Import Image or Spec</span>
                </button>

                <button
                  onClick={() => {
                    onRandomArtwork();
                    setShowTabletTools(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs bg-[#181818] hover:bg-[#222222] text-[#CCCCCC] border border-[#2A2A2A]"
                >
                  <Shuffle className="w-4 h-4 text-[#888888]" />
                  <span>Random Artwork</span>
                </button>
              </div>

              {/* Layout Mode Selector for Tablet */}
              <div className="mt-2 pt-2 border-t border-[#222222]">
                <div className="text-[10px] text-[#777777] uppercase font-bold tracking-wider px-1 mb-1">
                  Layout: {layoutLabels[workspaceLayout].name}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['full', 'minimalist', 'canvas-focus'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        onSelectLayout(mode);
                        setShowTabletTools(false);
                      }}
                      className={`text-[10px] py-1 border font-bold uppercase transition-all ${
                        workspaceLayout === mode
                          ? 'bg-[#00FF00] text-[#000000] border-[#00FF00]'
                          : 'bg-[#181818] text-[#888888] border-[#2A2A2A] hover:text-[#FFFFFF]'
                      }`}
                    >
                      {mode === 'full' ? 'Full' : mode === 'minimalist' ? 'Mini' : 'Focus'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action: AI Generator (Highlighted CTA) */}
        <button
          id="btn-open-generator"
          onClick={onOpenAIGenerator}
          className="flex items-center gap-1.5 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold px-2.5 md:px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border border-[#00FF00] active:translate-y-0.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 fill-[#000000]" />
          <span className="hidden sm:inline">AI Generator</span>
          <span className="sm:hidden font-extrabold text-[11px]">AI</span>
        </button>

        {/* Primary Action: Export */}
        <button
          id="btn-open-export"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#FFFFFF] font-bold px-2.5 md:px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-[#333333] hover:border-[#555555] transition-all active:translate-y-0.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* MOBILE / TABLET SLIDE-DOWN NAVIGATION DRAWER */}
      {showMobileNavMenu && workspaceLayout !== 'canvas-focus' && (
        <div className="lg:hidden absolute top-14 left-0 right-0 bg-[#0D0D0D] border-b-2 border-[#00FF00] shadow-2xl z-50 p-4 font-mono">
          <div className="flex items-center justify-between mb-3 border-b border-[#222222] pb-2">
            <span className="text-[11px] text-[#00FF00] uppercase font-bold tracking-wider">
              Studio Navigation Modes
            </span>
            <button
              onClick={() => setShowMobileNavMenu(false)}
              className="text-[#888888] hover:text-[#FFFFFF] p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    setShowMobileNavMenu(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 text-xs border text-left transition-all ${
                    isActive
                      ? 'bg-[#00FF00] text-[#000000] border-[#00FF00] font-bold shadow-md'
                      : 'bg-[#141414] text-[#CCCCCC] border-[#2A2A2A] hover:border-[#00FF00] hover:text-[#FFFFFF]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="uppercase">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
