import { SafeSvg } from './SafeSvg';
import React, { useState, useEffect } from 'react';
import { VectorArtwork } from '../types';
import { MASTERPIECES } from '../data/masterpieces';
import { 
  History, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Layers, 
  Clock, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { downloadBlob, exportSvgToPng } from '../utils/svgParser';
import { toast } from 'sonner';

interface HistoryViewProps {
  onSelectArtwork: (artwork: VectorArtwork) => void;
  onNewDesign: () => void;
  currentArtworkId?: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onSelectArtwork,
  onNewDesign,
  currentArtworkId,
}) => {
  const [historyItems, setHistoryItems] = useState<VectorArtwork[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load user designs from localStorage, fallback to curated seeds
  useEffect(() => {
    try {
      const stored = localStorage.getItem('vectora_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistoryItems(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read history from localStorage', e);
    }
    // Default seed from masterpieces
    setHistoryItems(MASTERPIECES.slice(0, 4));
  }, []);

  const handleCopySvg = async (e: React.MouseEvent, art: VectorArtwork) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(art.svg);
      setCopiedId(art.id);
      toast.success('SVG Markup copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleDownloadSvg = (e: React.MouseEvent, art: VectorArtwork) => {
    e.stopPropagation();
    try {
      const blob = new Blob([art.svg], { type: 'image/svg+xml;charset=utf-8' });
      const filename = `${art.title.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'design'}.svg`;
      downloadBlob(blob, filename);
      toast.success('Vector SVG Downloaded', { description: filename });
    } catch (err: any) {
      toast.error('Download failed', { description: err.message });
    }
  };

  const handleDownloadPng = async (e: React.MouseEvent, art: VectorArtwork) => {
    e.stopPropagation();
    const toastId = toast.loading('Rendering 2x PNG...', {
      description: art.title,
    });
    try {
      const blob = await exportSvgToPng(art.svg, 2);
      const filename = `${art.title.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'design'}.png`;
      downloadBlob(blob, filename);
      toast.success('High-Res PNG Exported', { id: toastId, description: filename });
    } catch (err: any) {
      toast.error('Export failed', { id: toastId, description: err.message });
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = historyItems.filter((item) => item.id !== id);
    setHistoryItems(updated);
    try {
      localStorage.setItem('vectora_history', JSON.stringify(updated));
    } catch (e) {}
    toast.info('Artwork removed from session history');
  };

  const handleClearAll = () => {
    if (confirm('Clear all items from your history?')) {
      setHistoryItems([]);
      try {
        localStorage.removeItem('vectora_history');
      } catch (e) {}
      toast.info('History cleared');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#000000] text-[#FFFFFF] font-mono select-none custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#333333] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#141414] text-[#00FF00] border border-[#333333] font-bold flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                SESSION TIMELINE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight uppercase">
              Design History
            </h1>
            <p className="text-sm text-[#888888] mt-1 font-mono">
              Recall, examine, export, and continue editing recently synthesized and modified vector works.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewDesign}
              className="flex items-center gap-2 px-4 py-2 bg-[#00FF00] text-black font-bold text-xs uppercase hover:bg-[#00DD00] transition-colors rounded"
            >
              <Plus size={14} />
              <span>Create New</span>
            </button>
            {historyItems.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2 border border-[#333333] hover:border-red-500/50 hover:text-red-400 text-[#888888] text-xs font-mono transition-colors rounded"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* History Grid */}
        {historyItems.length === 0 ? (
          <div className="border border-[#222222] bg-[#0A0A0A] p-12 text-center rounded-xl space-y-4">
            <History className="w-10 h-10 text-[#555555] mx-auto" />
            <div className="text-lg font-bold text-white uppercase">No History Found</div>
            <p className="text-sm text-[#888888] max-w-md mx-auto">
              You haven't generated or edited any designs yet. Generate an artwork from the prompt studio or load one from the gallery.
            </p>
            <button
              onClick={onNewDesign}
              className="mt-4 px-6 py-2.5 bg-[#00FF00] text-black font-bold text-xs uppercase hover:bg-[#00DD00] transition-colors rounded inline-flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>Launch Studio</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {historyItems.map((item) => {
              const isSelected = item.id === currentArtworkId;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectArtwork(item)}
                  className={`group cursor-pointer border transition-all duration-200 flex flex-col bg-[#0A0A0A] rounded-lg overflow-hidden ${
                    isSelected
                      ? 'border-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.15)] bg-[#111111]'
                      : 'border-[#2A2A2A] hover:border-[#00FF00]'
                  }`}
                >
                  {/* SVG Stage */}
                  <div className="relative aspect-square w-full bg-[#050505] overflow-hidden p-6 flex items-center justify-center border-b border-[#2A2A2A]">
                    <SafeSvg
                      className="w-full h-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      svg={item.svg}
                    />

                    {isSelected && (
                      <div className="absolute top-3 left-3 bg-[#00FF00] text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                        Active in Canvas
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleCopySvg(e, item)}
                        title="Copy SVG XML"
                        className="p-1.5 bg-[#141414]/90 border border-white/10 hover:border-[#00FF00] text-white/70 hover:text-white rounded transition-colors"
                      >
                        {isCopied ? <Check size={13} className="text-[#00FF00]" /> : <Copy size={13} />}
                      </button>
                      <button
                        onClick={(e) => handleDownloadSvg(e, item)}
                        title="Download .SVG"
                        className="p-1.5 bg-[#141414]/90 border border-white/10 hover:border-[#00FF00] text-white/70 hover:text-white rounded transition-colors"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        title="Remove from history"
                        className="p-1.5 bg-[#141414]/90 border border-white/10 hover:border-red-500 text-white/40 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#888888] mb-1 font-bold uppercase">
                        <span className="text-[#00FF00] truncate max-w-[160px]">{item.style || 'Vector'}</span>
                        <span>{item.layers?.length || 1} Layers</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00FF00] transition-colors uppercase truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#888888] mt-1 line-clamp-2 leading-relaxed">
                        {item.concept || 'Parametric vector composition.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
                      <div className="flex items-center gap-1">
                        {item.palette?.slice(0, 4).map((c, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full border border-black"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#00FF00] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                        <span>Open Canvas</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
