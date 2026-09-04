import React, { useState, useEffect } from 'react';
import { ExportPreset, VectorArtwork } from '../types';
import {
  downloadBlob,
  exportSvgToPng,
  svgToReactComponent,
  formatSvgXml
} from '../utils/svgParser';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  Code2,
  FileText,
  Sparkles,
  Loader2,
  Bookmark,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  artwork: VectorArtwork;
}

type ExportTab = 'svg' | 'png' | 'react' | 'datauri';

const DEFAULT_PRESETS: ExportPreset[] = [
  {
    id: 'preset-svg-source',
    name: 'SVG Source',
    description: 'Raw, resolution-independent SVG with layer groups & semantic markup',
    tab: 'svg',
  },
  {
    id: 'preset-web-social',
    name: 'Web Social',
    description: '2x (2000px) Retina PNG, ideal for Twitter, Dribbble, and portfolio previews',
    tab: 'png',
    pngScale: 2,
  },
  {
    id: 'preset-high-res-print',
    name: 'High-Res Print',
    description: '8x (8000px) Ultra HD raster for large-format physical posters & prints',
    tab: 'png',
    pngScale: 8,
  },
  {
    id: 'preset-react-component',
    name: 'React TSX',
    description: 'Typed TypeScript React component wrapper for Next.js & Vite codebases',
    tab: 'react',
  },
  {
    id: 'preset-css-datauri',
    name: 'CSS Data URI',
    description: 'Self-contained URL-encoded background string for stylesheet embedding',
    tab: 'datauri',
  },
  {
    id: 'preset-4k-screen',
    name: '4K Display',
    description: '4x (4000px) UHD raster wallpaper for high-density desktop screens',
    tab: 'png',
    pngScale: 4,
  }
];

const STORAGE_KEY = 'vectora_export_presets';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  artwork,
}) => {
  const [tab, setTab] = useState<ExportTab>('svg');
  const [pngScale, setPngScale] = useState<number>(2);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preset Manager State
  const [presets, setPresets] = useState<ExportPreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ExportPreset[] = JSON.parse(saved);
        // Combine default with custom presets
        const customOnly = parsed.filter((p) => p.isCustom);
        return [...DEFAULT_PRESETS, ...customOnly];
      }
    } catch (e) {
      console.warn('Failed to load export presets from localStorage:', e);
    }
    return DEFAULT_PRESETS;
  });

  const [activePresetId, setActivePresetId] = useState<string>('preset-svg-source');
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Persist custom presets to localStorage whenever presets change
  useEffect(() => {
    try {
      const customPresets = presets.filter((p) => p.isCustom);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
    } catch (e) {
      console.warn('Failed to save export presets to localStorage:', e);
    }
  }, [presets]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: ExportPreset) => {
    setTab(preset.tab);
    if (preset.pngScale) {
      setPngScale(preset.pngScale);
    }
    setActivePresetId(preset.id);
  };

  const handleSaveCustomPreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: ExportPreset = {
      id: `custom-preset-${Date.now()}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim() || `Custom ${tab.toUpperCase()} profile (Scale: ${pngScale}x)`,
      tab: tab,
      pngScale: tab === 'png' ? pngScale : undefined,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    setPresets((prev) => [...prev, newPreset]);
    setActivePresetId(newPreset.id);
    setNewPresetName('');
    setNewPresetDesc('');
    setIsSavingPreset(false);
    setSaveSuccessMsg(`Preset "${newPreset.name}" saved!`);
    setTimeout(() => setSaveSuccessMsg(''), 2500);
  };

  const handleDeleteCustomPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
    if (activePresetId === presetId) {
      setActivePresetId('preset-svg-source');
      setTab('svg');
    }
  };

  const reactCode = svgToReactComponent(
    artwork.svg,
    artwork.title.replace(/[^a-zA-Z0-9]/g, '') || 'VectorArtwork'
  );

  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(artwork.svg)}`;
  const cssBackground = `background-image: url("${dataUri}");\nbackground-repeat: no-repeat;\nbackground-size: contain;`;

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([artwork.svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${artwork.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
  };

  const handleDownloadPng = async () => {
    try {
      setIsExportingPng(true);
      const blob = await exportSvgToPng(artwork.svg, pngScale);
      downloadBlob(
        blob,
        `${artwork.title.toLowerCase().replace(/\s+/g, '-')}-${pngScale * 1000}px.png`
      );
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleDownloadReact = () => {
    const blob = new Blob([reactCode], { type: 'text/typescript;charset=utf-8' });
    const compName = artwork.title.replace(/[^a-zA-Z0-9]/g, '') || 'VectorArtwork';
    downloadBlob(blob, `${compName}.tsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none font-mono">
      <div className="bg-[#0A0A0A] border-2 border-[#333333] w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#333333] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#00FF00]/10 border border-[#00FF00]/40 flex items-center justify-center text-[#00FF00]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-[#FFFFFF] uppercase tracking-wider">
                Export Vector Artifact
              </h2>
              <p className="text-[11px] text-[#888888] font-mono">
                {artwork.title} &middot; Resolution-independent design object
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Manager Profiles Strip */}
        <div className="bg-[#0F0F0F] border-b border-[#333333] p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-[#00FF00]" />
              <span className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-wider">
                Configuration Presets
              </span>
              {saveSuccessMsg && (
                <span className="text-[10px] text-[#00FF00] font-bold bg-[#00FF00]/10 px-2 py-0.5 border border-[#00FF00]/30 animate-pulse">
                  {saveSuccessMsg}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsSavingPreset(!isSavingPreset)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#00FF00] hover:text-[#33FF33] px-2 py-0.5 bg-[#1A1A1A] hover:bg-[#242424] border border-[#333333]"
            >
              <Plus className="w-3 h-3" />
              <span>Save Current Profile</span>
            </button>
          </div>

          {/* New Preset Drawer */}
          {isSavingPreset && (
            <div className="p-2.5 bg-[#141414] border border-[#00FF00]/40 mb-2.5 space-y-2">
              <div className="text-[10px] font-bold text-[#00FF00] uppercase tracking-wider">
                Create New Export Profile
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Preset Name (e.g. Figma Web Assets)"
                  autoFocus
                  className="flex-1 bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] px-2 py-1 text-xs text-[#FFFFFF] outline-none font-mono"
                />
                <input
                  type="text"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  placeholder="Optional description"
                  className="flex-1 bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] px-2 py-1 text-xs text-[#FFFFFF] outline-none font-mono"
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveCustomPreset}
                    className="px-3 py-1 bg-[#00FF00] text-[#000000] text-xs font-bold uppercase"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsSavingPreset(false)}
                    className="p-1 text-[#888888] hover:text-[#FFFFFF]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preset Buttons Grid */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto custom-scrollbar pb-0.5">
            {presets.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  title={preset.description}
                  className={`group flex items-center gap-1.5 px-2.5 py-1 text-left border transition-all text-xs font-mono ${
                    isSelected
                      ? 'bg-[#00FF00] text-[#000000] border-[#00FF00] font-bold'
                      : 'bg-[#181818] text-[#AAAAAA] border-[#2A2A2A] hover:border-[#00FF00] hover:text-[#FFFFFF]'
                  }`}
                >
                  <span className="uppercase">{preset.name}</span>
                  {preset.pngScale && (
                    <span
                      className={`text-[9px] px-1 py-0.2 font-mono font-bold ${
                        isSelected ? 'bg-[#000000] text-[#00FF00]' : 'bg-[#222222] text-[#888888]'
                      }`}
                    >
                      {preset.pngScale}x
                    </span>
                  )}
                  {preset.isCustom && (
                    <span
                      onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                      title="Delete custom preset"
                      className="ml-1 p-0.5 hover:text-[#FF4444] opacity-70 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#333333] bg-[#000000] px-4 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'svg', label: 'SVG File', icon: FileCode },
            { id: 'png', label: 'PNG Raster (HD)', icon: ImageIcon },
            { id: 'react', label: 'React TSX', icon: Code2 },
            { id: 'datauri', label: 'CSS Data URI', icon: FileText },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id as ExportTab);
                  setCopied(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-mono font-bold uppercase transition-all border-b-2 ${
                  tab === t.id
                    ? 'border-[#00FF00] text-[#00FF00] bg-[#141414]'
                    : 'border-transparent text-[#888888] hover:text-[#FFFFFF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          {tab === 'svg' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#141414] border border-[#333333] text-xs text-[#AAAAAA] leading-relaxed font-mono">
                Standard compliant, resolution-independent SVG with complete layer metadata, dry defs, and accessible tags.
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  value={artwork.svg}
                  className="w-full h-48 bg-[#000000] border border-[#333333] p-3 font-mono text-[11px] text-[#00FF00] resize-none focus:outline-none custom-scrollbar select-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleCopy(artwork.svg)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#141414] hover:bg-[#222222] text-[#FFFFFF] border border-[#333333] text-xs font-bold uppercase transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-[#00FF00]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy SVG'}</span>
                </button>
                <button
                  onClick={handleDownloadSvg}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .svg</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'png' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#141414] border border-[#333333] text-xs text-[#AAAAAA] leading-relaxed font-mono">
                Rasterize the vector curves into crisp PNG bitmaps rendered via high-density HTML5 2D Canvas.
              </div>

              <div>
                <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider block mb-2">
                  Output Resolution Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { scale: 1, label: '1x (1000px)', desc: 'Standard Web' },
                    { scale: 2, label: '2x (2000px)', desc: 'Retina Display' },
                    { scale: 4, label: '4x (4000px)', desc: '4K Ultra HD' },
                    { scale: 8, label: '8x (8000px)', desc: 'Print / Large' },
                  ].map((preset) => (
                    <button
                      key={preset.scale}
                      onClick={() => setPngScale(preset.scale)}
                      className={`p-3 text-left border transition-all ${
                        pngScale === preset.scale
                          ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]'
                          : 'bg-[#141414] text-[#888888] border-[#333333] hover:text-[#FFFFFF] hover:bg-[#222222]'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase font-mono">{preset.label}</div>
                      <div className="text-[10px] text-[#666666] mt-0.5 font-mono">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleDownloadPng}
                  disabled={isExportingPng}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isExportingPng ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#000000]" />
                      <span>Rasterizing PNG...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download {pngScale * 1000}px PNG</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === 'react' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#141414] border border-[#333333] text-xs text-[#AAAAAA] leading-relaxed font-mono">
                Clean, typed React functional component ready to copy directly into your Next.js or Vite codebase.
              </div>

              <textarea
                readOnly
                value={reactCode}
                className="w-full h-48 bg-[#000000] border border-[#333333] p-3 font-mono text-[11px] text-[#00FF00] resize-none focus:outline-none custom-scrollbar select-all"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleCopy(reactCode)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#141414] hover:bg-[#222222] text-[#FFFFFF] border border-[#333333] text-xs font-bold uppercase transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-[#00FF00]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy JSX'}</span>
                </button>
                <button
                  onClick={handleDownloadReact}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .tsx</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'datauri' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#141414] border border-[#333333] text-xs text-[#AAAAAA] leading-relaxed font-mono">
                Self-contained URL-encoded data URI string for direct embedding in CSS background rules or HTML img tags.
              </div>

              <textarea
                readOnly
                value={cssBackground}
                className="w-full h-48 bg-[#000000] border border-[#333333] p-3 font-mono text-[11px] text-[#00FF00] resize-none focus:outline-none custom-scrollbar select-all"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => handleCopy(cssBackground)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-[#000000]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy CSS Background'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
