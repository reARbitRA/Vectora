import React, { useState, useEffect, useMemo } from 'react';
import { PaletteTheme } from '../types';
import { PALETTE_THEMES } from '../data/palettes';
import { VECTORA_BASE_PALETTE, VECTORA_SVG_STYLE_BLOCK } from '../data/vectoraBasePalette';
import { analyzePaletteColorUsage } from '../utils/svgParser';
import {
  Palette,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Save,
  Paintbrush,
  Sliders,
  RotateCcw,
  Tag,
  CheckCircle2,
  Eye,
  FileCode,
  FolderOpen,
  Activity,
  AlertCircle,
  Hash
} from 'lucide-react';

interface PaletteManagerProps {
  onApplyPalette: (theme: PaletteTheme) => void;
  currentColors?: string[];
  activeSvg?: string;
}

const STORAGE_KEY = 'vectora_custom_palettes_v2';

export const PaletteManager: React.FC<PaletteManagerProps> = ({
  onApplyPalette,
  currentColors = [],
  activeSvg = '',
}) => {
  // Preset + Custom Palettes state
  const [customPalettes, setCustomPalettes] = useState<PaletteTheme[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading custom palettes:', e);
    }
    return [
      {
        id: 'vectora-cyber-matrix',
        name: 'VECTORA Matrix Core',
        category: 'Brutalist',
        colors: ['#000000', '#00FF00', '#FFB800', '#FF0055', '#FFFFFF', '#333333'],
        isCustom: true,
        description: 'The official brutalist cyber design system palette.',
        createdAt: '2026-09-04',
      },
    ];
  });

  // Active Category Filter
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Palette Creator / Editor State
  const [paletteName, setPaletteName] = useState('New Custom Palette');
  const [paletteCategory, setPaletteCategory] = useState<PaletteTheme['category']>('Brutalist');
  const [paletteDescription, setPaletteDescription] = useState('Custom user generated vector palette');
  const [paletteColors, setPaletteColors] = useState<string[]>([
    '#000000',
    '#00FF00',
    '#FF5500',
    '#00F0FF',
    '#FFFFFF',
    '#333333',
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Status state
  const [appliedPaletteId, setAppliedPaletteId] = useState<string | null>(null);
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);

  // Active palette being analyzed (either the one being edited, applied, or the current artwork colors)
  const activePaletteForAnalysis = useMemo(() => {
    if (appliedPaletteId) {
      const found = [...customPalettes, ...PALETTE_THEMES].find((p) => p.id === appliedPaletteId);
      if (found) return found.colors;
    }
    if (currentColors && currentColors.length > 0) {
      return currentColors;
    }
    return paletteColors;
  }, [appliedPaletteId, customPalettes, currentColors, paletteColors]);

  // Compute live SVG color utilization diagnostics
  const usageAnalysis = useMemo(() => {
    if (!activeSvg) {
      return {
        usedColors: currentColors.map((hex) => ({ hex, isUsed: true, count: 1, elements: [{ tag: 'path', attr: 'fill', count: 1 }] })),
        unusedColors: [],
        totalPaletteColors: currentColors.length,
        usedCount: currentColors.length,
        unusedCount: 0,
        coveragePct: 100,
        allSvgColorsFound: currentColors,
      };
    }
    return analyzePaletteColorUsage(activeSvg, activePaletteForAnalysis);
  }, [activeSvg, activePaletteForAnalysis, currentColors]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPalettes));
    } catch (e) {
      console.error('Error saving custom palettes:', e);
    }
  }, [customPalettes]);

  const allPalettes = [...customPalettes, ...PALETTE_THEMES];

  // Filtered palettes
  const filteredPalettes = allPalettes.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (activeCategory === 'Custom' && p.isCustom) ||
      p.category.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Handle color change for a slot
  const handleColorChange = (index: number, newHex: string) => {
    // Basic hex formatting check
    const cleanHex = newHex.startsWith('#') ? newHex : `#${newHex}`;
    const updated = [...paletteColors];
    updated[index] = cleanHex.toUpperCase();
    setPaletteColors(updated);
  };

  const handleAddColorSlot = () => {
    if (paletteColors.length >= 8) return;
    const randomHexes = ['#00FF00', '#FF0055', '#00F0FF', '#FFB800', '#8B5CF6', '#FFFFFF'];
    const nextColor = randomHexes[paletteColors.length % randomHexes.length];
    setPaletteColors([...paletteColors, nextColor]);
  };

  const handleRemoveColorSlot = (index: number) => {
    if (paletteColors.length <= 2) return;
    setPaletteColors(paletteColors.filter((_, i) => i !== index));
  };

  const handleSavePalette = () => {
    if (!paletteName.trim()) return;

    if (editingId) {
      // Update existing
      setCustomPalettes((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                name: paletteName.trim(),
                category: paletteCategory,
                description: paletteDescription,
                colors: paletteColors,
              }
            : p
        )
      );
      setEditingId(null);
    } else {
      // Create new
      const newPalette: PaletteTheme = {
        id: `custom-${Date.now()}`,
        name: paletteName.trim(),
        category: paletteCategory,
        description: paletteDescription,
        colors: paletteColors,
        isCustom: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomPalettes([newPalette, ...customPalettes]);
    }

    // Reset editor
    setPaletteName('My Fresh Palette');
    setPaletteColors(['#0A0A0A', '#00FF00', '#FFB800', '#FFFFFF', '#333333']);
  };

  const handleEditPalette = (palette: PaletteTheme) => {
    setEditingId(palette.id);
    setPaletteName(palette.name);
    setPaletteCategory(palette.category);
    setPaletteDescription(palette.description || '');
    setPaletteColors([...palette.colors]);
  };

  const handleDeletePalette = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPalettes((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleApply = (theme: PaletteTheme) => {
    onApplyPalette(theme);
    setAppliedPaletteId(theme.id);
    setTimeout(() => setAppliedPaletteId(null), 2500);
  };

  const handleCopyCssVariables = async () => {
    const css = `:root {
  ${paletteColors
    .map((hex, i) => `--palette-color-${i + 1}: ${hex};`)
    .join('\n  ')}
}`;
    await navigator.clipboard.writeText(css);
    setCopiedCodeType('css-vars');
    setTimeout(() => setCopiedCodeType(null), 2000);
  };

  const handleCopySvgStyleBlock = async () => {
    await navigator.clipboard.writeText(VECTORA_SVG_STYLE_BLOCK);
    setCopiedCodeType('svg-style');
    setTimeout(() => setCopiedCodeType(null), 2000);
  };

  const handleApplyBasePalette = () => {
    const baseTheme: PaletteTheme = {
      id: 'vectora-base-system',
      name: 'VECTORA Official Base System',
      category: 'Brutalist',
      colors: VECTORA_BASE_PALETTE.map((c) => c.hex),
      description: 'The definitive Electric Acid Green, Obsidian & Cyber Amber standard.',
    };
    handleApply(baseTheme);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#000000] text-[#FFFFFF] font-mono custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Title */}
        <div className="border-b border-[#333333] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#141414] text-[#00FF00] border border-[#333333] font-bold">
                COLOR ARCHITECTURE
              </span>
              <span className="text-xs font-mono text-[#888888] font-bold uppercase">
                {allPalettes.length} Palettes Available
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight uppercase">
              Palette Manager & Generator
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-mono">
              Define custom color palettes, adjust HEX values with visual color pickers, organize by category, and apply instantly to active SVG designs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyBasePalette}
              className="flex items-center gap-2 px-3 py-2 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] text-xs font-bold uppercase tracking-wider transition-all border border-[#00FF00]"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Apply Base VECTORA System</span>
            </button>
          </div>
        </div>

        {/* Section 1: Define & Save Custom Palette Studio */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-[#00FF00]" />
              <h2 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                {editingId ? 'Edit Palette Definition' : 'Define New Custom Palette'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setPaletteName('New Custom Palette');
                    setPaletteColors(['#000000', '#00FF00', '#FF5500', '#00F0FF', '#FFFFFF', '#333333']);
                  }}
                  className="text-xs text-[#888888] hover:text-[#FFFFFF] px-2 py-1 bg-[#141414] border border-[#333333]"
                >
                  Cancel Edit
                </button>
              )}
              <button
                onClick={handleCopyCssVariables}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#AAAAAA] hover:text-[#FFFFFF] bg-[#141414] border border-[#333333] hover:border-[#555555]"
              >
                {copiedCodeType === 'css-vars' ? <Check className="w-3.5 h-3.5 text-[#00FF00]" /> : <FileCode className="w-3.5 h-3.5" />}
                <span>{copiedCodeType === 'css-vars' ? 'Copied CSS!' : 'Copy CSS Vars'}</span>
              </button>
              <button
                onClick={handleCopySvgStyleBlock}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#AAAAAA] hover:text-[#FFFFFF] bg-[#141414] border border-[#333333] hover:border-[#555555]"
              >
                {copiedCodeType === 'svg-style' ? <Check className="w-3.5 h-3.5 text-[#00FF00]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeType === 'svg-style' ? 'Copied Style Block!' : 'Copy SVG <style>'}</span>
              </button>
            </div>
          </div>

          {/* Palette Metadata Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] uppercase font-bold text-[#888888] mb-1.5">
                Palette Name
              </label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                placeholder="e.g. Acid Neon Grid"
                className="w-full bg-[#141414] border border-[#333333] focus:border-[#00FF00] px-3 py-2 text-xs text-[#FFFFFF] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-[#888888] mb-1.5">
                Category / Style Tag
              </label>
              <select
                value={paletteCategory}
                onChange={(e) => setPaletteCategory(e.target.value as any)}
                className="w-full bg-[#141414] border border-[#333333] focus:border-[#00FF00] px-3 py-2 text-xs text-[#FFFFFF] outline-none"
              >
                <option value="Brutalist">Brutalist</option>
                <option value="Cyber">Cyber</option>
                <option value="Modernist">Modernist</option>
                <option value="Editorial">Editorial</option>
                <option value="Luxury">Luxury</option>
                <option value="Vibrant">Vibrant</option>
                <option value="Earthen">Earthen</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-[#888888] mb-1.5">
                Description / Usage Notes
              </label>
              <input
                type="text"
                value={paletteDescription}
                onChange={(e) => setPaletteDescription(e.target.value)}
                placeholder="High-contrast telemetry & UI"
                className="w-full bg-[#141414] border border-[#333333] focus:border-[#00FF00] px-3 py-2 text-xs text-[#FFFFFF] outline-none"
              />
            </div>
          </div>

          {/* Visual Swatch Editor & Hex Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] uppercase font-bold text-[#888888]">
                Color Swatches ({paletteColors.length} Colors)
              </label>
              {paletteColors.length < 8 && (
                <button
                  onClick={handleAddColorSlot}
                  className="flex items-center gap-1 text-[11px] text-[#00FF00] hover:text-[#33FF33] px-2 py-0.5 bg-[#141414] border border-[#333333]"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Swatch</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {paletteColors.map((color, index) => {
                const roles = ['Background', 'Primary', 'Secondary', 'Accent', 'Ink / Text', 'Border / Grid', 'Glow', 'Aux'];
                const roleLabel = roles[index] || `Slot ${index + 1}`;

                return (
                  <div
                    key={index}
                    className="p-2.5 bg-[#141414] border border-[#333333] flex flex-col space-y-2 group"
                  >
                    {/* Visual Color Picker + Preview */}
                    <div className="relative h-14 border border-[#222222] overflow-hidden flex items-center justify-center">
                      <div
                        className="absolute inset-0 w-full h-full cursor-pointer"
                        style={{ backgroundColor: color }}
                      />
                      <input
                        type="color"
                        value={color.startsWith('#') && color.length === 7 ? color : '#000000'}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Click to open visual color picker"
                      />
                      <span className="relative z-10 text-[10px] font-bold px-1 py-0.5 bg-black/60 text-white rounded pointer-events-none">
                        PICK
                      </span>
                    </div>

                    {/* Role Label */}
                    <div className="text-[10px] text-[#888888] font-bold uppercase truncate">
                      {roleLabel}
                    </div>

                    {/* Hex Code Input */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={color}
                        maxLength={7}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] px-1.5 py-1 text-[11px] font-mono text-[#00FF00] font-bold outline-none text-center"
                      />
                      {paletteColors.length > 2 && (
                        <button
                          onClick={() => handleRemoveColorSlot(index)}
                          title="Remove color slot"
                          className="p-1 text-[#666666] hover:text-[#FF3333] hover:bg-[#222222]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Palette Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#222222]">
            <div className="flex items-center gap-2 text-xs text-[#888888]">
              <span>Preview Live:</span>
              <div className="flex items-center gap-1">
                {paletteColors.map((c, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 border border-[#333333]"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const theme: PaletteTheme = {
                    id: 'temp-preview',
                    name: paletteName,
                    category: paletteCategory,
                    colors: paletteColors,
                  };
                  handleApply(theme);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider border border-[#333333]"
              >
                <Eye className="w-3.5 h-3.5 text-[#00FF00]" />
                <span>Test Apply to SVG</span>
              </button>

              <button
                onClick={handleSavePalette}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] text-xs font-bold uppercase tracking-wider border border-[#00FF00]"
              >
                <Save className="w-3.5 h-3.5 fill-black" />
                <span>{editingId ? 'Save Changes' : 'Save Custom Palette'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Library of Saved & Preset Palettes */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#333333] pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#00FF00]" />
              <h2 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                Palette Library ({filteredPalettes.length})
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {['All', 'Custom', 'Brutalist', 'Modernist', 'Cyber', 'Editorial', 'Luxury', 'Vibrant', 'Earthen'].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-all ${
                      activeCategory === cat
                        ? 'bg-[#00FF00] text-[#000000] font-bold border-[#00FF00]'
                        : 'bg-[#0A0A0A] text-[#888888] border-[#333333] hover:text-[#FFFFFF] hover:bg-[#141414]'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Palettes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPalettes.map((theme) => {
              const isApplied = appliedPaletteId === theme.id;
              return (
                <div
                  key={theme.id}
                  className={`p-4 border transition-all flex flex-col justify-between ${
                    isApplied
                      ? 'bg-[#00FF00]/10 border-[#00FF00]'
                      : 'bg-[#0A0A0A] border-[#333333] hover:border-[#555555]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-[#FFFFFF]">{theme.name}</h3>
                          {theme.isCustom && (
                            <span className="text-[9px] px-1 py-0.2 bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/40 font-bold uppercase">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#888888] font-mono">{theme.category}</span>
                      </div>

                      {theme.isCustom && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditPalette(theme)}
                            className="p-1 text-[#888888] hover:text-[#00FF00] hover:bg-[#141414]"
                            title="Edit Palette"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePalette(theme.id, e)}
                            className="p-1 text-[#888888] hover:text-[#FF3333] hover:bg-[#141414]"
                            title="Delete Palette"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {theme.description && (
                      <p className="text-[11px] text-[#777777] mb-3 line-clamp-2">{theme.description}</p>
                    )}

                    {/* Color Swatch Bars */}
                    <div className="grid grid-cols-6 gap-1 h-8 mb-4 border border-[#222222] p-0.5 bg-[#050505]">
                      {theme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-full w-full relative group/swatch"
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          <span className="opacity-0 group-hover/swatch:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1 py-0.5 bg-black text-[9px] text-white whitespace-nowrap z-20 pointer-events-none">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
                    <span className="text-[10px] font-mono text-[#666666]">
                      {theme.colors.length} Hex Swatches
                    </span>

                    <button
                      onClick={() => handleApply(theme)}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                        isApplied
                          ? 'bg-[#00FF00] text-[#000000] border border-[#00FF00]'
                          : 'bg-[#141414] text-[#00FF00] hover:bg-[#00FF00] hover:text-[#000000] border border-[#333333]'
                      }`}
                    >
                      {isApplied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Paintbrush className="w-3.5 h-3.5" />}
                      <span>{isApplied ? 'Applied!' : 'Apply to SVG'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VISUAL COLOR UTILIZATION SUMMARY IN SVG PATHS */}
          <div className="mt-8 border border-[#333333] bg-[#0A0A0A] p-4 sm:p-5 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#222222]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00FF00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                  Active Palette Vector Path Diagnostics
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-[#888888]">
                  Coverage: <strong className="text-[#00FF00]">{usageAnalysis.coveragePct}%</strong> ({usageAnalysis.usedCount}/{usageAnalysis.totalPaletteColors} colors active)
                </span>
              </div>
            </div>

            {/* Coverage Meter */}
            <div className="w-full h-1.5 bg-[#141414] border border-[#222222] my-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00FF00] via-[#FFB800] to-[#00FF00]"
                style={{ width: `${usageAnalysis.coveragePct}%` }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {/* SECTION A: Active In SVG Paths */}
              <div className="bg-[#111111] border border-[#222222] p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#00FF00]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PRESENT IN SVG PATH ATTRIBUTES ({usageAnalysis.usedColors.length})</span>
                  </div>
                  <span className="text-[10px] text-[#666666]">Referenced in DOM</span>
                </div>

                {usageAnalysis.usedColors.length === 0 ? (
                  <p className="text-[11px] text-[#666666] italic py-2">
                    No active colors currently detected in SVG paths. Apply a palette above.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {usageAnalysis.usedColors.map((color) => (
                      <div
                        key={color.hex}
                        className="flex items-center gap-2.5 p-2 bg-[#0A0A0A] border border-[#2A2A2A]"
                      >
                        <div
                          className="w-6 h-6 border border-[#444444] shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#FFFFFF] font-mono">{color.hex}</span>
                            <span className="text-[10px] px-1 bg-[#00FF00]/15 text-[#00FF00] font-bold">
                              {color.count}x
                            </span>
                          </div>
                          <p className="text-[9px] text-[#777777] truncate">
                            {color.elements.map((el) => `<${el.tag}> ${el.attr}`).slice(0, 2).join(', ') || 'fill / stroke'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION B: Unused In SVG Paths */}
              <div className="bg-[#111111] border border-[#222222] p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF9900]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>UNUSED IN CURRENT SVG ({usageAnalysis.unusedColors.length})</span>
                  </div>
                  <span className="text-[10px] text-[#666666]">Candidate accents</span>
                </div>

                {usageAnalysis.unusedColors.length === 0 ? (
                  <div className="p-3 bg-[#00FF00]/5 border border-[#00FF00]/20 text-[11px] text-[#00FF00]">
                    All colors in this palette are actively utilized in the SVG geometry.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {usageAnalysis.unusedColors.map((color) => (
                      <div
                        key={color.hex}
                        className="flex items-center gap-2.5 p-2 bg-[#0A0A0A] border border-[#222222] opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <div
                          className="w-6 h-6 border border-[#333333] shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#AAAAAA] font-mono">{color.hex}</span>
                            <span className="text-[9px] text-[#888888] italic">Unused</span>
                          </div>
                          <p className="text-[9px] text-[#555555]">
                            Not found in path/fill/stroke
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
