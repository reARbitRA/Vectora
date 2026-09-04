import React, { useRef, useState, useEffect, useMemo } from 'react';
import { CanvasSettings, LayerSpec, VectorArtwork, WorkspaceLayout } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Maximize,
  Keyboard,
  HelpCircle,
  Compass,
  Layers,
  Sliders,
  Layout,
  Maximize2,
  Scan,
  Download
} from 'lucide-react';

interface StudioCanvasProps {
  artwork: VectorArtwork;
  layers: LayerSpec[];
  settings: CanvasSettings;
  workspaceLayout?: WorkspaceLayout;
  onSelectLayout?: (layout: WorkspaceLayout) => void;
  onToggleLayers?: () => void;
  showLayers?: boolean;
  onOpenExport?: () => void;
  onOpenImport?: () => void;
  onUpdateSettings: (newSettings: Partial<CanvasSettings>) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  artwork,
  layers,
  settings,
  workspaceLayout = 'full',
  onSelectLayout,
  onToggleLayers,
  showLayers = false,
  onOpenExport,
  onOpenImport,
  onUpdateSettings,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [showShortcutsTooltip, setShowShortcutsTooltip] = useState(false);

  // Track Space bar for Space + Drag panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Process SVG string based on active layer visibility & procedural filters
  const processedSvg = useMemo(() => {
    if (!artwork.svg) return '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(artwork.svg, 'image/svg+xml');
      const rootSvg = doc.querySelector('svg');
      if (!rootSvg) return artwork.svg;

      // Make SVG scale to fill container viewBox
      rootSvg.setAttribute('width', '100%');
      rootSvg.setAttribute('height', '100%');
      rootSvg.style.overflow = 'visible';

      // Apply Layer Visibility
      layers.forEach((layer) => {
        if (!layer.visible) {
          // Find groups by inkscape:label, id, or text
          const matchingGroups = doc.querySelectorAll(
            `g[inkscape\\:label="${layer.name}"], g[id="${layer.name}"], g[id="${layer.name.toLowerCase().replace(/_/g, '-')}"]`
          );
          matchingGroups.forEach((g) => {
            g.setAttribute('display', 'none');
          });
        }
      });

      // Apply Stroke Scale Multiplier if altered
      if (settings.strokeScale !== 1) {
        const strokes = doc.querySelectorAll('[stroke-width]');
        strokes.forEach((el) => {
          const current = parseFloat(el.getAttribute('stroke-width') || '1');
          el.setAttribute('stroke-width', (current * settings.strokeScale).toFixed(2));
        });
      }

      return rootSvg.outerHTML;
    } catch (e) {
      console.error('Error processing SVG for canvas:', e);
      return artwork.svg;
    }
  }, [artwork.svg, layers, settings.strokeScale]);

  // Handle Zoom In / Out
  const handleZoom = (delta: number) => {
    onUpdateSettings({
      zoom: parseFloat(Math.min(8, Math.max(0.1, settings.zoom + delta)).toFixed(2)),
    });
  };

  const handleSetZoom = (targetZoom: number) => {
    onUpdateSettings({
      zoom: targetZoom,
    });
  };

  const handleResetView = () => {
    onUpdateSettings({
      zoom: 1.0,
      pan: { x: 0, y: 0 },
    });
  };

  const handleFitToView = () => {
    onUpdateSettings({
      zoom: 0.85,
      pan: { x: 0, y: 0 },
    });
  };

  // Pan Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 && e.button !== 1) return; // Left or Middle click
    setIsPanning(true);
    setStartPan({
      x: e.clientX - settings.pan.x,
      y: e.clientY - settings.pan.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    onUpdateSettings({
      pan: {
        x: Math.round(e.clientX - startPan.x),
        y: Math.round(e.clientY - startPan.y),
      },
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = parseFloat(Math.min(8, Math.max(0.1, settings.zoom * zoomFactor)).toFixed(2));
    onUpdateSettings({ zoom: newZoom });
  };

  // Background container styling
  const bgClasses = {
    dark: 'bg-[#000000]',
    light: 'bg-[#EDEDED]',
    obsidian: 'bg-[#080808]',
    blueprint: 'bg-[#050D1A] bg-[radial-gradient(#00FF00_1px,transparent_1px)] [background-size:24px_24px]',
    checker: 'bg-[radial-gradient(#222222_1px,transparent_1px)] [background-size:16px_16px] bg-[#000000]',
  }[settings.bgMode];

  const zoomPercent = Math.round(settings.zoom * 100);
  const isDefaultZoom = Math.abs(settings.zoom - 1.0) < 0.01 && settings.pan.x === 0 && settings.pan.y === 0;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative flex-1 h-full w-full overflow-hidden select-none font-mono ${bgClasses} ${
        isSpacePressed || isPanning ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      }`}
    >
      {/* Viewport Overlay Grid */}
      {settings.showGrid && (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-40">
          {settings.gridType === 'cartesian' && (
            <svg width="100%" height="100%">
              <defs>
                <pattern id="canvas-grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#222222" strokeWidth="0.75" />
                </pattern>
                <pattern id="canvas-grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="url(#canvas-grid-small)" />
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#00FF00" strokeWidth="1" strokeOpacity="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#canvas-grid-large)" />
            </svg>
          )}

          {settings.gridType === 'isometric' && (
            <svg width="100%" height="100%">
              <defs>
                <pattern id="canvas-iso-grid" width="60" height="34.64" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 60 17.32 L 30 34.64 L 0 17.32 Z" fill="none" stroke="#00FF00" strokeWidth="0.75" strokeOpacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#canvas-iso-grid)" />
            </svg>
          )}

          {settings.gridType === 'golden' && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-[700px] h-[700px] border border-[#00FF00]/50 rounded-full relative">
                <div className="absolute inset-[14.6%] border border-[#00FF00]/40 rounded-full" />
                <div className="absolute inset-[38.2%] border border-[#00FF00]/30 rounded-full" />
                <line x1="0" y1="50%" x2="100%" y2="50%" className="stroke-[#00FF00]/40" />
                <line x1="50%" y1="0" x2="50%" y2="100%" className="stroke-[#00FF00]/40" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas Artboard Container */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out origin-center pointer-events-none"
        style={{
          transform: `translate(${settings.pan.x}px, ${settings.pan.y}px) scale(${settings.zoom})`,
        }}
      >
        <div
          id="vector-artboard"
          className="relative max-w-[860px] max-h-[860px] w-[85vw] h-[85vw] md:w-[760px] md:h-[760px] border-2 border-[#333333] shadow-none pointer-events-auto"
          style={{
            filter: settings.glowIntensity > 0 ? `drop-shadow(0 0 ${settings.glowIntensity * 24}px rgba(0, 255, 0, 0.45))` : undefined,
          }}
        >
          {/* Grain Texture Overlay */}
          {settings.grainIntensity > 0 && (
            <div
              className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
              style={{
                opacity: settings.grainIntensity,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E")`,
              }}
            />
          )}

          {/* Render Active SVG */}
          <div
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: processedSvg }}
          />
        </div>
      </div>

      {/* Floating Real-Time Zoom Level Indicator & Viewport HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#0A0A0A]/95 backdrop-blur-md p-1.5 border-2 border-[#333333] shadow-2xl select-none font-mono">
        {/* Zoom Out */}
        <button
          id="btn-zoom-out"
          onClick={() => handleZoom(-0.15)}
          title="Zoom Out (Scroll Down)"
          className="p-1.5 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Live Real-Time Zoom Percentage Badge */}
        <div
          title="Current Zoom Level"
          className="px-2.5 py-1 bg-[#141414] border border-[#222222] flex items-center gap-1.5 min-w-[72px] justify-center"
        >
          <span className="text-xs font-mono font-bold text-[#00FF00]">
            {zoomPercent}%
          </span>
        </div>

        {/* Zoom In */}
        <button
          id="btn-zoom-in"
          onClick={() => handleZoom(0.15)}
          title="Zoom In (Scroll Up)"
          className="p-1.5 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-[#333333] mx-1" />

        {/* Dedicated Reset Zoom to 100% Button */}
        <button
          id="btn-reset-zoom-100"
          onClick={handleResetView}
          title="Reset Zoom to 100% & Center Pan (Ctrl+0)"
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase transition-all ${
            isDefaultZoom
              ? 'bg-[#181818] text-[#888888] border border-[#282828] opacity-60'
              : 'bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] border border-[#00FF00]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Zoom</span>
        </button>

        {/* Fit View Preset */}
        <button
          id="btn-fit-view"
          onClick={handleFitToView}
          title="Fit Artboard to Screen"
          className="px-2 py-1 bg-[#141414] hover:bg-[#222222] text-[#888888] hover:text-[#FFFFFF] border border-[#333333] text-[11px] font-bold uppercase"
        >
          Fit
        </button>

        {/* Pan Offset Telemetry */}
        {(settings.pan.x !== 0 || settings.pan.y !== 0) && (
          <span
            title="Pan coordinate offset from center"
            className="text-[10px] text-[#666666] px-1 hidden md:inline-block"
          >
            {settings.pan.x > 0 ? `+${settings.pan.x}` : settings.pan.x},{settings.pan.y > 0 ? `+${settings.pan.y}` : settings.pan.y}
          </span>
        )}
      </div>

      {/* Bottom Left: Keyboard Shortcuts Manager & Tooltip Button */}
      <div className="absolute bottom-4 left-4 z-20 font-mono">
        <div className="relative">
          <button
            id="btn-shortcuts-tooltip"
            onClick={() => setShowShortcutsTooltip(!showShortcutsTooltip)}
            onMouseEnter={() => setShowShortcutsTooltip(true)}
            onMouseLeave={() => setShowShortcutsTooltip(false)}
            title="View Keyboard Shortcuts (Ctrl+S, Space+Drag, Ctrl+Z)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-xs font-bold uppercase transition-all ${
              showShortcutsTooltip
                ? 'bg-[#00FF00] text-[#000000] border-[#00FF00]'
                : 'bg-[#0A0A0A] text-[#888888] hover:text-[#FFFFFF] border-[#333333] hover:border-[#00FF00]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>

          {/* Shortcuts Popover Tooltip */}
          {showShortcutsTooltip && (
            <div
              onMouseEnter={() => setShowShortcutsTooltip(true)}
              onMouseLeave={() => setShowShortcutsTooltip(false)}
              className="absolute bottom-10 left-0 w-64 md:w-72 bg-[#0A0A0A] border-2 border-[#333333] p-3 shadow-2xl z-30 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-[#222222] pb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                  <Keyboard className="w-3.5 h-3.5 text-[#00FF00]" />
                  <span>Global Keymaps</span>
                </div>
                <span className="text-[9px] text-[#00FF00] bg-[#141414] px-1.5 py-0.5 border border-[#333333]">
                  Active
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Save / Export SVG</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    Ctrl + S
                  </kbd>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Pan Canvas</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    Space + Drag
                  </kbd>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Undo Action</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    Ctrl + Z
                  </kbd>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Redo Action</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    Ctrl + Y / ⇧⌘Z
                  </kbd>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Reset Zoom (100%)</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    Ctrl + 0
                  </kbd>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Zoom In / Out</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    Mouse Wheel
                  </kbd>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Toggle Layer Drawer</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    L
                  </kbd>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Toggle Parametric FX</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    P
                  </kbd>
                </div>

                <div className="flex items-center justify-between py-0.5">
                  <span className="text-[#AAAAAA]">Toggle Grid Overlay</span>
                  <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-[#00FF00] font-bold text-[10px]">
                    G
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Floating Art Info & Canvas Settings Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 font-mono flex-wrap">
        {/* Style Badge */}
        <div className="bg-[#0A0A0A] px-3 py-1.5 border border-[#333333] flex items-center gap-2.5">
          <div className="w-2 h-2 bg-[#00FF00] animate-pulse" />
          <span className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">{artwork.style}</span>
          <span className="text-[10px] font-mono text-[#888888] border-l border-[#333333] pl-2">
            {artwork.viewBox || '0 0 1000 1000'}
          </span>
        </div>

        {/* Grid Overlay Mode Toggle */}
        <div className="bg-[#0A0A0A] p-1 border border-[#333333] flex items-center gap-1">
          <button
            id="btn-toggle-grid"
            onClick={() => onUpdateSettings({ showGrid: !settings.showGrid })}
            title={settings.showGrid ? 'Hide Grid (G)' : 'Show Grid (G)'}
            className={`p-1.5 text-xs font-medium transition-colors ${
              settings.showGrid ? 'bg-[#00FF00] text-[#00FF00]' : 'text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            <Grid className={`w-3.5 h-3.5 ${settings.showGrid ? 'text-[#000000]' : ''}`} />
          </button>

          {settings.showGrid && (
            <select
              value={settings.gridType}
              onChange={(e) => onUpdateSettings({ gridType: e.target.value as any })}
              className="bg-transparent text-[11px] text-[#00FF00] font-mono focus:outline-none px-1 py-0.5 cursor-pointer uppercase font-bold"
            >
              <option value="cartesian" className="bg-[#0A0A0A] text-[#FFFFFF]">Cartesian</option>
              <option value="isometric" className="bg-[#0A0A0A] text-[#FFFFFF]">Isometric</option>
              <option value="golden" className="bg-[#0A0A0A] text-[#FFFFFF]">Golden Ratio</option>
            </select>
          )}
        </div>

        {/* Background Canvas Mode Selector */}
        <div className="bg-[#0A0A0A] p-1 border border-[#333333] flex items-center gap-1">
          {(['dark', 'light', 'obsidian', 'blueprint', 'checker'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onUpdateSettings({ bgMode: mode })}
              title={`Canvas Background: ${mode}`}
              className={`w-6 h-6 text-[10px] font-mono flex items-center justify-center transition-all ${
                settings.bgMode === mode
                  ? 'border border-[#00FF00] text-[#00FF00] font-bold bg-[#141414]'
                  : 'text-[#666666] hover:text-[#AAAAAA]'
              }`}
            >
              {mode === 'dark' && '🌑'}
              {mode === 'light' && '☀️'}
              {mode === 'obsidian' && '🌌'}
              {mode === 'blueprint' && '📐'}
              {mode === 'checker' && '🏁'}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Focus Floating Top-Right HUD */}
      {workspaceLayout === 'canvas-focus' && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 font-mono">
          {onToggleLayers && (
            <button
              onClick={onToggleLayers}
              title="Toggle Layer Drawer"
              className={`px-2.5 py-1.5 border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md transition-all ${
                showLayers
                  ? 'bg-[#00FF00] text-[#000000] border-[#00FF00] font-bold'
                  : 'bg-[#0A0A0A]/90 text-[#CCCCCC] border-[#333333] hover:text-[#FFFFFF] hover:border-[#555555]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>
          )}

          {onOpenImport && (
            <button
              onClick={onOpenImport}
              title="Import Image or Text Spec"
              className="px-2.5 py-1.5 bg-[#0A0A0A]/90 border border-[#333333] hover:border-[#00FF00] text-[#00FF00] text-xs font-mono uppercase flex items-center gap-1.5 backdrop-blur-md transition-all"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              title="Export Artwork"
              className="px-2.5 py-1.5 bg-[#0A0A0A]/90 border border-[#333333] hover:border-[#555555] text-[#FFFFFF] text-xs font-mono uppercase flex items-center gap-1.5 backdrop-blur-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}

          {onSelectLayout && (
            <button
              onClick={() => onSelectLayout('full')}
              title="Exit Canvas Focus (Return to Full Studio)"
              className="px-2.5 py-1.5 bg-[#141414]/90 border border-[#333333] hover:border-[#00FF00] text-[#00FF00] text-xs font-mono uppercase flex items-center gap-1.5 backdrop-blur-md transition-all font-bold"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Exit Focus</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
