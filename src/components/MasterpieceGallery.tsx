import { SafeSvg } from './SafeSvg';
import React, { useState } from 'react';
import { VectorArtwork } from '../types';
import { MASTERPIECES } from '../data/masterpieces';
import {
  Grid,
  Sparkles,
  ArrowRight,
  Download,
  Copy,
  Check,
  Palette,
  Layers,
  Compass
} from 'lucide-react';
import { downloadBlob } from '../utils/svgParser';

interface MasterpieceGalleryProps {
  onSelectArtwork: (artwork: VectorArtwork) => void;
  currentArtworkId: string;
}

export const MasterpieceGallery: React.FC<MasterpieceGalleryProps> = ({
  onSelectArtwork,
  currentArtworkId,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const styles = [
    { id: 'all', label: 'All Aesthetics' },
    { id: 'Swiss / International', label: 'Swiss Grid' },
    { id: 'Art Deco', label: 'Art Deco' },
    { id: 'Cyberpunk / Brutalist', label: 'Isometric Cyber' },
    { id: 'Generative Parametric / Celestial', label: 'Celestial Astrolabe' },
    { id: 'Bauhaus / Constructivism', label: 'Bauhaus Modern' },
    { id: 'Japanese Editorial / Botanical', label: 'Japanese Botanical' },
  ];

  const filteredMasterpieces = selectedStyle === 'all'
    ? MASTERPIECES
    : MASTERPIECES.filter((m) => m.style.includes(selectedStyle) || selectedStyle.includes(m.style));

  const handleCopySvg = async (e: React.MouseEvent, artwork: VectorArtwork) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(artwork.svg);
    setCopiedId(artwork.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (e: React.MouseEvent, artwork: VectorArtwork) => {
    e.stopPropagation();
    const blob = new Blob([artwork.svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${artwork.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#000000] text-[#FFFFFF] custom-scrollbar select-none font-mono">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Gallery Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#333333] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#141414] text-[#00FF00] border border-[#333333] font-bold">
                CURATED ARCHIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight uppercase">
              Masterpiece Gallery
            </h1>
            <p className="text-sm text-[#888888] mt-1 font-mono">
              Hand-authored vector artifacts built to precision mathematical and aesthetic standards.
            </p>
          </div>

          {/* Aesthetic Movement Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5 bg-[#0A0A0A] p-1.5 border border-[#333333]">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all ${
                  selectedStyle === s.id
                    ? 'bg-[#00FF00] text-[#000000]'
                    : 'text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Masterpieces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMasterpieces.map((item) => {
            const isSelected = item.id === currentArtworkId;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectArtwork(item)}
                className={`group cursor-pointer border transition-all duration-200 flex flex-col bg-[#0A0A0A] ${
                  isSelected
                    ? 'border-[#00FF00] bg-[#141414]'
                    : 'border-[#333333] hover:border-[#00FF00]'
                }`}
              >
                {/* SVG Visual Stage */}
                <div className="relative aspect-square w-full bg-[#000000] overflow-hidden p-6 flex items-center justify-center border-b border-[#333333]">
                  <SafeSvg
                    className="w-full h-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    svg={item.svg}
                  />

                  {/* Active Indicator Badge */}
                  {isSelected && (
                    <div className="absolute top-3 left-3 bg-[#00FF00] text-[#000000] text-[10px] font-bold uppercase px-2 py-0.5">
                      Active In Studio
                    </div>
                  )}

                  {/* Quick Action Overlay Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleCopySvg(e, item)}
                      title="Copy SVG Code"
                      className="p-2 bg-[#0A0A0A] border border-[#333333] text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-[#00FF00]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={(e) => handleDownload(e, item)}
                      title="Download .svg file"
                      className="p-2 bg-[#0A0A0A] border border-[#333333] text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metadata & Description */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#888888] mb-1.5 uppercase font-bold">
                      <span className="text-[#00FF00]">{item.style}</span>
                      <span>{item.layers.length} Layers</span>
                    </div>

                    <h3 className="text-base font-bold text-[#FFFFFF] group-hover:text-[#00FF00] transition-colors uppercase">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#888888] mt-1.5 line-clamp-2 leading-relaxed font-mono">
                      {item.concept}
                    </p>
                  </div>

                  {/* Palette Swatches & Open Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#333333]">
                    <div className="flex items-center gap-1">
                      {item.palette.slice(0, 5).map((color, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 border border-black"
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name} (${color.hex})`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-[#00FF00] uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
