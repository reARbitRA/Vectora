import React, { useState } from 'react';
import { VectorArtwork } from '../types';
import { SafeSvg } from './SafeSvg';
import { downloadBlob, exportSvgToPng } from '../utils/svgParser';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { X, Download, Loader2, CheckSquare, Square, Layers, Image as ImageIcon } from 'lucide-react';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: VectorArtwork[];
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  artworks,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(artworks.map((a) => a.id))
  );
  const [exportFormat, setExportFormat] = useState<'svg' | 'png'>('svg');
  const [pngScale, setPngScale] = useState<number>(2);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.size === artworks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(artworks.map((a) => a.id)));
    }
  };

  const toggleSelectId = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleGenerateZip = async () => {
    const selectedArtworks = artworks.filter((a) => selectedIds.has(a.id));
    if (selectedArtworks.length === 0) {
      toast.error('Please select at least one artwork to export.');
      return;
    }

    setIsExporting(true);
    setProgressText('Initializing ZIP archive...');

    try {
      const zip = new JSZip();
      const folderName = `vectora-batch-export-${Date.now()}`;
      const exportFolder = zip.folder(folderName) || zip;

      for (let i = 0; i < selectedArtworks.length; i++) {
        const art = selectedArtworks[i];
        const safeTitle = (art.title || 'artwork').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
        setProgressText(`Processing (${i + 1}/${selectedArtworks.length}): ${art.title}`);

        if (exportFormat === 'svg') {
          exportFolder.file(`${String(i + 1).padStart(2, '0')}_${safeTitle}.svg`, art.svg);
        } else {
          try {
            const pngBlob = await exportSvgToPng(art.svg, pngScale);
            const arrayBuffer = await pngBlob.arrayBuffer();
            exportFolder.file(`${String(i + 1).padStart(2, '0')}_${safeTitle}_${pngScale}x.png`, arrayBuffer);
          } catch (e) {
            console.warn(`Failed to rasterize artwork ${art.id} to PNG`, e);
            exportFolder.file(`${String(i + 1).padStart(2, '0')}_${safeTitle}.svg`, art.svg);
          }
        }
      }

      setProgressText('Compressing ZIP archive...');
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setProgressText(`Compressing: ${Math.round(metadata.percent)}%`);
      });

      downloadBlob(content, `vectora-batch-export-${exportFormat.toUpperCase()}.zip`);
      toast.success('Batch Export ZIP Generated Successfully!', {
        description: `${selectedArtworks.length} items bundled into archive.`,
      });
      setIsExporting(false);
      onClose();
    } catch (err: any) {
      console.error('Batch ZIP export failed:', err);
      toast.error('Batch export failed', { description: err.message });
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn font-mono">
      <div className="bg-[#0A0A0A] border border-[#333333] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333] bg-[#000000]">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-[#141414] text-[#00FF00] border border-[#333333] text-[11px] font-bold uppercase">
              BATCH EXPORT ARCHIVE
            </span>
            <h2 className="text-lg font-bold text-[#FFFFFF] uppercase tracking-wider">
              Selected Artworks Preview Grid ({selectedIds.size} / {artworks.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors border border-transparent hover:border-[#333333]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-[#141414] border-b border-[#333333] text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-[#00FF00] hover:text-[#FFFFFF] font-bold uppercase transition-colors"
            >
              {selectedIds.size === artworks.length ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              <span>{selectedIds.size === artworks.length ? 'Deselect All' : 'Select All'}</span>
            </button>
            <span className="text-[#888888]">|</span>
            <div className="flex items-center gap-2">
              <span className="text-[#888888]">Format:</span>
              <button
                onClick={() => setExportFormat('svg')}
                className={`px-3 py-1 font-bold uppercase transition-all ${
                  exportFormat === 'svg'
                    ? 'bg-[#00FF00] text-black border border-[#00FF00]'
                    : 'bg-[#000000] text-[#888888] border border-[#333333] hover:text-[#FFFFFF]'
                }`}
              >
                SVG Source (.zip)
              </button>
              <button
                onClick={() => setExportFormat('png')}
                className={`px-3 py-1 font-bold uppercase transition-all ${
                  exportFormat === 'png'
                    ? 'bg-[#00FF00] text-black border border-[#00FF00]'
                    : 'bg-[#000000] text-[#888888] border border-[#333333] hover:text-[#FFFFFF]'
                }`}
              >
                Raster PNG (.zip)
              </button>
            </div>
          </div>

          {exportFormat === 'png' && (
            <div className="flex items-center gap-2">
              <span className="text-[#888888]">Resolution Scale:</span>
              {[1, 2, 4].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setPngScale(scale)}
                  className={`px-2.5 py-1 font-bold ${
                    pngScale === scale
                      ? 'bg-[#00FF00] text-black'
                      : 'bg-[#000000] text-[#888888] border border-[#333333]'
                  }`}
                >
                  {scale}x ({scale * 1000}px)
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 custom-scrollbar bg-[#000000]">
          {artworks.map((art) => {
            const isSelected = selectedIds.has(art.id);
            return (
              <div
                key={art.id}
                onClick={() => toggleSelectId(art.id)}
                className={`group relative cursor-pointer border transition-all duration-200 flex flex-col bg-[#0A0A0A] ${
                  isSelected
                    ? 'border-[#00FF00] bg-[#141414]'
                    : 'border-[#333333] opacity-60 hover:opacity-100 hover:border-[#666666]'
                }`}
              >
                {/* Checkbox overlay */}
                <div className="absolute top-2 left-2 z-10 p-1 bg-black/80 border border-[#333333] text-[#00FF00]">
                  {isSelected ? <CheckSquare size={14} /> : <Square size={14} className="text-[#888888]" />}
                </div>

                {/* SVG Thumbnail */}
                <div className="relative aspect-square w-full bg-[#000000] p-4 flex items-center justify-center border-b border-[#333333] overflow-hidden">
                  <SafeSvg
                    className="w-full h-full flex items-center justify-center transform group-hover:scale-105 transition-transform pointer-events-none"
                    svg={art.svg}
                  />
                </div>

                {/* Metadata */}
                <div className="p-3 flex flex-col justify-between flex-1">
                  <div>
                    <div className="text-[10px] text-[#00FF00] font-bold uppercase truncate">
                      {art.style || 'Vector Art'}
                    </div>
                    <div className="text-xs font-bold text-[#FFFFFF] truncate mt-0.5">
                      {art.title || 'Untitled Artwork'}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#888888] mt-2 flex items-center justify-between">
                    <span>{art.layers?.length || 0} Layers</span>
                    <span>{(art.svg.length / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#333333] bg-[#000000]">
          <div className="text-xs text-[#888888]">
            {selectedIds.size} of {artworks.length} artworks selected for zip bundling.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 bg-[#141414] border border-[#333333] text-[#FFFFFF] text-xs font-bold uppercase hover:bg-[#222222] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateZip}
              disabled={isExporting || selectedIds.size === 0}
              className="flex items-center gap-2 px-6 py-2 bg-[#00FF00] text-black font-bold text-xs uppercase hover:bg-[#00DD00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{progressText || 'Generating ZIP...'}</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download ZIP Archive ({selectedIds.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
