import React, { useState, useEffect, useRef } from 'react';
import { SvgMetrics, VectorArtwork } from '../types';
import {
  computeSvgMetrics,
  formatSvgXml,
  downloadBlob,
  optimizePathData,
  PathOptimizationResult
} from '../utils/svgParser';
import { svgSemanticallyEqual } from '../document';
import {
  Code2,
  Copy,
  Check,
  Download,
  Wand2,
  AlertCircle,
  FileCode,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Scissors,
  Zap
} from 'lucide-react';

interface CodeEditorProps {
  artwork: VectorArtwork;
  onUpdateSvg: (newSvg: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ artwork, onUpdateSvg }) => {
  const [code, setCode] = useState(artwork.svg);
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState<SvgMetrics>(() => computeSvgMetrics(artwork.svg));
  const [parseError, setParseError] = useState<string | null>(null);
  const [cleanStats, setCleanStats] = useState<PathOptimizationResult | null>(null);

  // The last value this editor emitted. When the canonical document echoes
  // our own edit back (artwork.svg updates with the document's serialization,
  // which may differ cosmetically — whitespace, attribute order), we keep the
  // user's text instead of clobbering it mid-typing.
  const lastEmittedRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      lastEmittedRef.current !== null &&
      svgSemanticallyEqual(artwork.svg, lastEmittedRef.current)
    ) {
      return; // echo of our own edit — keep the user's text
    }
    lastEmittedRef.current = null;
    setCode(artwork.svg);
    setMetrics(computeSvgMetrics(artwork.svg));
  }, [artwork.svg]);

  const commit = (newCode: string) => {
    lastEmittedRef.current = newCode;
    onUpdateSvg(newCode);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);

    // Validate SVG syntax
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(newCode, 'image/svg+xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        setParseError(parserError.textContent || 'XML Parsing Error');
      } else {
        setParseError(null);
        setMetrics(computeSvgMetrics(newCode));
        commit(newCode);
      }
    } catch (err: any) {
      setParseError(err.message || 'Invalid SVG XML');
    }
  };

  const handleFormatCode = () => {
    const formatted = formatSvgXml(code);
    setCode(formatted);
    commit(formatted);
    setCleanStats(null);
  };

  const handleCleanSvg = () => {
    const result = optimizePathData(code);
    setCode(result.optimizedSvg);
    commit(result.optimizedSvg);
    setMetrics(computeSvgMetrics(result.optimizedSvg));
    setCleanStats(result);

    setTimeout(() => {
      setCleanStats(null);
    }, 6000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${artwork.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
  };

  // Generate line numbers
  const lines = code.split('\n');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#000000] overflow-hidden select-text font-mono">
      {/* Top Metrics & Actions Toolbar */}
      <div className="bg-[#0A0A0A] border-b border-[#333333] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Metric Badges */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#333333] text-[#FFFFFF]">
            <span className="text-[#888888]">Size:</span>
            <span className="text-[#00FF00] font-bold">{metrics.formattedSize}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#333333] text-[#FFFFFF]">
            <span className="text-[#888888]">Gzip:</span>
            <span className="text-[#FFFFFF]">{metrics.gzipEstimate}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#333333] text-[#FFFFFF]">
            <span className="text-[#888888]">Paths:</span>
            <span className="text-[#FFFFFF]">{metrics.pathCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#333333] text-[#FFFFFF]">
            <span className="text-[#888888]">Elements:</span>
            <span className="text-[#FFFFFF]">{metrics.totalElements}</span>
          </div>

          {/* Compliance Score */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 border font-bold ${
              metrics.complianceScore >= 85
                ? 'bg-[#00FF00]/10 border-[#00FF00]/50 text-[#00FF00]'
                : 'bg-[#FF3333]/10 border-[#FF3333]/50 text-[#FF3333]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Standard: {metrics.complianceScore}%</span>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          {/* Clean SVG Optimization Trigger */}
          <button
            id="btn-clean-svg"
            onClick={handleCleanSvg}
            title="Simplify coordinates to 1 decimal place, remove trailing zeros & optimize path syntax"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#00FF00] hover:text-[#000000] text-[#00FF00] border border-[#00FF00]/50 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Clean SVG</span>
          </button>

          <button
            id="btn-format-svg"
            onClick={handleFormatCode}
            title="Format / Beautify XML Code"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#222222] text-[#FFFFFF] border border-[#333333] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#00FF00]" />
            <span>Format</span>
          </button>

          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#222222] text-[#FFFFFF] border border-[#333333] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#00FF00]" />
                <span className="text-[#00FF00] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            id="btn-download-svg"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold text-xs uppercase tracking-wider transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .svg</span>
          </button>
        </div>
      </div>

      {/* Path Optimization Analytics Toast Banner */}
      {cleanStats && (
        <div className="bg-[#00FF00]/10 border-b border-[#00FF00] px-4 py-2 flex items-center justify-between text-xs text-[#00FF00] shrink-0 font-mono animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00FF00]" />
            <span>
              <strong>Path Optimization Complete:</strong> Simplified {cleanStats.pathsOptimized} paths ({cleanStats.pointsSimplified} coordinates rounded).
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Saved <strong>{cleanStats.bytesSaved} bytes</strong> ({cleanStats.savingsPct}% reduction)
            </span>
            <button
              onClick={() => setCleanStats(null)}
              className="text-[#888888] hover:text-[#FFFFFF] text-[10px] uppercase font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Parse Error Notification Banner */}
      {parseError && (
        <div className="bg-[#2A0808] border-b border-[#FF3333] px-4 py-2 flex items-center gap-2 text-[#FF9999] text-xs shrink-0">
          <AlertCircle className="w-4 h-4 text-[#FF3333] shrink-0" />
          <span className="font-mono truncate">{parseError}</span>
        </div>
      )}

      {/* Code Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div className="w-12 py-4 bg-[#050505] border-r border-[#222222] select-none text-right pr-3 font-mono text-xs text-[#555555] overflow-hidden shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          id="svg-code-textarea"
          value={code}
          onChange={handleCodeChange}
          spellCheck={false}
          className="flex-1 h-full w-full p-4 bg-transparent text-[#00FF00] font-mono text-xs leading-6 resize-none focus:outline-none focus:ring-0 selection:bg-[#00FF00] selection:text-[#000000] custom-scrollbar whitespace-pre"
        />
      </div>

      {/* Status Bar */}
      <div className="h-7 bg-[#0A0A0A] border-t border-[#333333] px-4 flex items-center justify-between text-[11px] font-mono text-[#888888] shrink-0">
        <div className="flex items-center gap-3">
          <span>XML SVG 1.1 / 2.0</span>
          <span>UTF-8</span>
          <span className="text-[#FFFFFF]">{lines.length} lines</span>
        </div>
        <div className="flex items-center gap-2 text-[#00FF00] font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-[#00FF00]" />
          <span>VECTORA Synced</span>
        </div>
      </div>
    </div>
  );
};
