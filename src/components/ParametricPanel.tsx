import React from 'react';
import { CanvasSettings, PaletteTheme } from '../types';
import { PALETTE_THEMES } from '../data/palettes';
import {
  Sliders,
  Palette,
  Sparkles,
  Layers,
  Ratio,
  RotateCcw,
  Sun,
  X
} from 'lucide-react';

interface ParametricPanelProps {
  settings: CanvasSettings;
  onUpdateSettings: (newSettings: Partial<CanvasSettings>) => void;
  onApplyPaletteTheme: (theme: PaletteTheme) => void;
  onClose: () => void;
}

export const ParametricPanel: React.FC<ParametricPanelProps> = ({
  settings,
  onUpdateSettings,
  onApplyPaletteTheme,
  onClose,
}) => {
  return (
    <aside className="w-[85vw] sm:w-80 max-w-full bg-[#0A0A0A] border-l border-[#333333] flex flex-col h-full z-20 select-none font-mono">
      {/* Header */}
      <div className="p-3.5 border-b border-[#333333] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00FF00]" />
          <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
            Parametric FX
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Section 1: Color Themes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#00FF00]" />
              Palette Remapper
            </label>
            <span className="text-[10px] font-mono text-[#888888]">10 Presets</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {PALETTE_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onApplyPaletteTheme(theme)}
                className="group p-2 bg-[#141414] border border-[#333333] hover:border-[#00FF00] hover:bg-[#1C1C1C] flex items-center justify-between transition-all"
              >
                <div className="text-left">
                  <div className="text-xs font-bold text-[#FFFFFF] group-hover:text-[#00FF00] transition-colors">
                    {theme.name}
                  </div>
                  <span className="text-[10px] font-mono text-[#666666]">{theme.category}</span>
                </div>

                {/* Swatch Strip */}
                <div className="flex items-center gap-1">
                  {theme.colors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 border border-black"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Procedural Filters & Finish */}
        <div className="space-y-4 pt-4 border-t border-[#333333]">
          <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00FF00]" />
            Finish & FX Sliders
          </label>

          {/* Grain Intensity */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-[#AAAAAA]">Film Grain / Texture</span>
              <span className="font-mono text-[#00FF00]">{Math.round(settings.grainIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.4"
              step="0.02"
              value={settings.grainIntensity}
              onChange={(e) => onUpdateSettings({ grainIntensity: parseFloat(e.target.value) })}
              className="w-full accent-[#00FF00] cursor-pointer h-1.5 bg-[#222222] appearance-none"
            />
          </div>

          {/* Ambient Glow */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-[#AAAAAA]">Ambient Glow Aura</span>
              <span className="font-mono text-[#00FF00]">{Math.round(settings.glowIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.glowIntensity}
              onChange={(e) => onUpdateSettings({ glowIntensity: parseFloat(e.target.value) })}
              className="w-full accent-[#00FF00] cursor-pointer h-1.5 bg-[#222222] appearance-none"
            />
          </div>

          {/* Stroke Scale Multiplier */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-bold">
              <span className="text-[#AAAAAA]">Stroke Weight Scale</span>
              <span className="font-mono text-[#00FF00]">{settings.strokeScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.strokeScale}
              onChange={(e) => onUpdateSettings({ strokeScale: parseFloat(e.target.value) })}
              className="w-full accent-[#00FF00] cursor-pointer h-1.5 bg-[#222222] appearance-none"
            />
          </div>
        </div>

        {/* Section 3: Aspect Ratio */}
        <div className="pt-4 border-t border-[#333333]">
          <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Ratio className="w-3.5 h-3.5 text-[#00FF00]" />
            Aspect Ratio Framing
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '1:1', label: '1:1 Square' },
              { id: '4:3', label: '4:3 Classic' },
              { id: '16:9', label: '16:9 Cinema' },
              { id: '9:16', label: '9:16 Story' },
              { id: '2:3', label: '2:3 Poster' },
            ].map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => onUpdateSettings({ aspectRatio: ratio.id as any })}
                className={`py-1.5 px-2 text-xs font-mono border transition-all ${
                  settings.aspectRatio === ratio.id
                    ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00] font-bold'
                    : 'bg-[#141414] text-[#888888] border-[#333333] hover:text-[#FFFFFF] hover:bg-[#222222]'
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Action */}
        <button
          onClick={() =>
            onUpdateSettings({
              grainIntensity: 0,
              glowIntensity: 0,
              strokeScale: 1,
              aspectRatio: '1:1',
            })
          }
          className="w-full py-2 px-3 border border-[#333333] bg-[#141414] text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset FX Tweaks</span>
        </button>
      </div>
    </aside>
  );
};
