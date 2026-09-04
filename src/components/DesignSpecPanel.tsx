import React, { useState } from 'react';
import { VectorArtwork } from '../types';
import { computeSvgMetrics } from '../utils/svgParser';
import {
  VECTORA_BASE_PALETTE,
  VECTORA_SVG_STYLE_BLOCK,
  VECTORA_LAYER_CONVENTION
} from '../data/vectoraBasePalette';
import {
  FileText,
  Palette,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  Compass,
  Lightbulb,
  FileCode,
  Info,
  BookOpen
} from 'lucide-react';

interface DesignSpecPanelProps {
  artwork: VectorArtwork;
}

export const DesignSpecPanel: React.FC<DesignSpecPanelProps> = ({ artwork }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedStyleBlock, setCopiedStyleBlock] = useState(false);
  const [activeSpecTab, setActiveSpecTab] = useState<'artwork' | 'base-palette' | 'layer-standard'>('artwork');
  const metrics = computeSvgMetrics(artwork.svg);

  const handleCopyHex = async (hex: string) => {
    await navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCopyStyleBlock = async () => {
    await navigator.clipboard.writeText(VECTORA_SVG_STYLE_BLOCK);
    setCopiedStyleBlock(true);
    setTimeout(() => setCopiedStyleBlock(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#000000] text-[#FFFFFF] custom-scrollbar select-text font-mono">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header Title Section */}
        <div className="border-b border-[#333333] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#141414] text-[#00FF00] border border-[#333333] font-bold">
                DESIGN SPECIFICATION
              </span>
              <span className="text-xs font-mono text-[#888888] font-bold uppercase">{artwork.style}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight uppercase">
              {artwork.title}
            </h1>
            {artwork.subtitle && (
              <p className="text-sm md:text-base text-[#888888] mt-1 font-mono">
                {artwork.subtitle}
              </p>
            )}
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center bg-[#141414] p-1 border border-[#333333] shrink-0">
            <button
              onClick={() => setActiveSpecTab('artwork')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                activeSpecTab === 'artwork'
                  ? 'bg-[#00FF00] text-[#000000] font-bold'
                  : 'text-[#888888] hover:text-[#FFFFFF]'
              }`}
            >
              Artwork Specs
            </button>
            <button
              onClick={() => setActiveSpecTab('base-palette')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                activeSpecTab === 'base-palette'
                  ? 'bg-[#00FF00] text-[#000000] font-bold'
                  : 'text-[#888888] hover:text-[#FFFFFF]'
              }`}
            >
              Base Palette Matrix
            </button>
            <button
              onClick={() => setActiveSpecTab('layer-standard')}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                activeSpecTab === 'layer-standard'
                  ? 'bg-[#00FF00] text-[#000000] font-bold'
                  : 'text-[#888888] hover:text-[#FFFFFF]'
              }`}
            >
              Layer Convention
            </button>
          </div>
        </div>

        {activeSpecTab === 'artwork' && (
          <>
            {/* Section 1: Concept & Artistic Rationale */}
            <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00FF00] uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>Design Intent & Visual Metaphor</span>
              </div>
              <p className="text-sm md:text-base text-[#CCCCCC] leading-relaxed font-mono">
                {artwork.concept}
              </p>
            </div>

            {/* Section 2: Color Palette System */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                  <Palette className="w-4 h-4 text-[#00FF00]" />
                  <span>Semantic Palette System ({artwork.palette.length} Colors)</span>
                </div>
                <span className="text-xs text-[#888888]">Click swatch to copy HEX</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {artwork.palette.map((color, index) => {
                  const isCopied = copiedHex === color.hex;
                  return (
                    <button
                      key={index}
                      onClick={() => handleCopyHex(color.hex)}
                      className="group p-3 bg-[#0A0A0A] border border-[#333333] hover:border-[#00FF00] text-left transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 border border-[#333333] shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <div className="text-xs font-bold text-[#FFFFFF] group-hover:text-[#00FF00] transition-colors">
                            {color.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#888888] flex items-center gap-1.5 mt-0.5">
                            <span className="text-[#00FF00] font-bold">{color.hex}</span>
                            <span className="text-[9px] uppercase px-1 py-0.2 bg-[#222222] text-[#AAAAAA] border border-[#333333]">
                              {color.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-[#666666] group-hover:text-[#00FF00] transition-colors pr-1">
                        {isCopied ? <Check className="w-4 h-4 text-[#00FF00]" /> : <Copy className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Layer Hierarchy in Draw Order */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                <Layers className="w-4 h-4 text-[#00FF00]" />
                <span>Layer Architecture ({artwork.layers.length} Layers)</span>
              </div>

              <div className="border border-[#333333] overflow-hidden bg-[#0A0A0A]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141414] text-[#888888] font-mono text-[11px] border-b border-[#333333] uppercase">
                    <tr>
                      <th className="py-3 px-4 w-16">Index</th>
                      <th className="py-3 px-4 w-48">Layer Label</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222] font-mono">
                    {artwork.layers.map((layer, index) => (
                      <tr key={index} className="hover:bg-[#141414] transition-colors">
                        <td className="py-3 px-4 font-mono text-[#00FF00] font-bold">
                          #{String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#FFFFFF] font-bold">
                          {layer.name}
                        </td>
                        <td className="py-3 px-4 text-[#AAAAAA]">
                          {layer.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Engineering Standards Compliance Scorecard */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#00FF00]" />
                  <span>Standards Checklist</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#00FF00]">
                  Score: {metrics.complianceScore}/100
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: 'Valid XMLNS & Namespace',
                    passed: metrics.complianceChecks.hasXmlns,
                    detail: 'Standard SVG 1.1 / 2.0 namespace declared',
                  },
                  {
                    label: 'Purposeful ViewBox',
                    passed: metrics.complianceChecks.hasViewBox,
                    detail: 'Responsive coordinate system (e.g. 0 0 1000 1000)',
                  },
                  {
                    label: 'Layer Grouping Architecture',
                    passed: metrics.complianceChecks.hasLayerGroups,
                    detail: 'Organized with inkscape:groupmode & semantic labels',
                  },
                  {
                    label: 'DRY Defs (Gradients & Filters)',
                    passed: metrics.complianceChecks.hasDefs,
                    detail: 'Centralized reusable gradients and filters in <defs>',
                  },
                  {
                    label: 'Accessible <title> Tag',
                    passed: metrics.complianceChecks.hasTitle,
                    detail: 'Screen-reader friendly descriptive title',
                  },
                  {
                    label: 'Accessible <desc> Tag',
                    passed: metrics.complianceChecks.hasDesc,
                    detail: 'Comprehensive graphic purpose description',
                  },
                  {
                    label: 'Pure Vector (No External Rasters)',
                    passed: metrics.complianceChecks.noExternalRasters,
                    detail: 'Zero broken external HTTP image dependencies',
                  },
                  {
                    label: 'Semantic <style> Block',
                    passed: metrics.complianceChecks.hasStyleBlock,
                    detail: 'Centralized design token typography and stroke classes',
                  },
                ].map((check, i) => (
                  <div
                    key={i}
                    className={`p-3 border flex items-start gap-3 transition-colors ${
                      check.passed
                        ? 'bg-[#00FF00]/5 border-[#00FF00]/30 text-[#FFFFFF]'
                        : 'bg-[#FF3333]/5 border-[#FF3333]/30 text-[#FFFFFF]'
                    }`}
                  >
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00FF00] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#FF3333] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-[#FFFFFF]">{check.label}</div>
                      <p className="text-[11px] text-[#888888] mt-0.5">{check.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Evolution & Motion Recommendations */}
            {artwork.evolutionIdeas && artwork.evolutionIdeas.length > 0 && (
              <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00FF00] uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Evolutionary Vectors & Animation Opportunities</span>
                </div>
                <ul className="space-y-2">
                  {artwork.evolutionIdeas.map((idea, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                      <div className="w-1.5 h-1.5 bg-[#00FF00] shrink-0 mt-1.5" />
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {activeSpecTab === 'base-palette' && (
          <div className="space-y-8">
            {/* Header description */}
            <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00FF00] uppercase tracking-wider">
                  <Palette className="w-4 h-4" />
                  <span>VECTORA Base Color Palette Specification</span>
                </div>
                <button
                  onClick={handleCopyStyleBlock}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#00FF00] text-[#000000] text-xs font-bold uppercase tracking-wider border border-[#00FF00]"
                >
                  {copiedStyleBlock ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedStyleBlock ? 'Copied Style Block!' : 'Copy SVG <style> Block'}</span>
                </button>
              </div>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                The base color system establishes high-contrast optical hierarchy tailored for vector graphics, UI blueprints, precision instruments, and dark-mode displays. It defines distinct semantic roles: <strong className="text-[#00FF00]">Primary</strong> for brand anchors, <strong className="text-[#FFB800]">Secondary</strong> for telemetry & geometry, <strong className="text-[#FF0055]">Accent</strong> for dynamic focus, and <strong className="text-[#FFFFFF]">Neutrals</strong> for obsidian canvas depth and crisp typography.
              </p>
            </div>

            {/* Tokens Table */}
            <div className="border border-[#333333] overflow-hidden bg-[#0A0A0A]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141414] text-[#888888] font-mono text-[11px] border-b border-[#333333] uppercase">
                  <tr>
                    <th className="py-3 px-4 w-36">Token / Swatch</th>
                    <th className="py-3 px-4 w-28">Role</th>
                    <th className="py-3 px-4 w-28">HEX / RGB</th>
                    <th className="py-3 px-4 w-44">Semantic Class</th>
                    <th className="py-3 px-4">Usage Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222] font-mono">
                  {VECTORA_BASE_PALETTE.map((token, index) => (
                    <tr key={index} className="hover:bg-[#141414] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-6 h-6 border border-[#333333] shrink-0"
                            style={{ backgroundColor: token.hex }}
                          />
                          <span className="font-bold text-[#FFFFFF]">{token.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-[#1F1F1F] text-[#AAAAAA] border border-[#333333]">
                          {token.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#00FF00]">
                        <div>{token.hex}</div>
                        <div className="text-[10px] text-[#666666] font-normal">{token.rgb}</div>
                      </td>
                      <td className="py-3 px-4 text-[#00F0FF] font-mono">
                        <code>{token.semanticClass}</code>
                      </td>
                      <td className="py-3 px-4 text-[#AAAAAA] text-[11px]">
                        {token.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ready to Use SVG Style Code */}
            <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                  <FileCode className="w-4 h-4 text-[#00FF00]" />
                  <span>Production SVG &lt;style&gt; Block</span>
                </div>
                <button
                  onClick={handleCopyStyleBlock}
                  className="flex items-center gap-1 text-[11px] text-[#888888] hover:text-[#00FF00] px-2 py-1 bg-[#141414] border border-[#333333]"
                >
                  {copiedStyleBlock ? <Check className="w-3 h-3 text-[#00FF00]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStyleBlock ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="bg-[#000000] border border-[#222222] p-4 text-[11px] text-[#CCCCCC] overflow-x-auto max-h-72 custom-scrollbar">
                <code>{VECTORA_SVG_STYLE_BLOCK}</code>
              </pre>
            </div>
          </div>
        )}

        {activeSpecTab === 'layer-standard' && (
          <div className="space-y-8">
            {/* Header Description */}
            <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00FF00] uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>VECTORA Layer Architecture & Naming Convention</span>
              </div>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                VECTORA enforces a sequential, draw-order aligned naming convention: <code className="text-[#00FF00] font-bold">##_Category_Descriptor</code> (e.g. <code className="text-[#00FF00]">01_Background</code>, <code className="text-[#00FF00]">02_Shapes_Primary</code>, <code className="text-[#00FF00]">05_Text_Headlines</code>). Because SVG adheres strictly to the <em>Painter's Algorithm</em> (elements defined earlier in the DOM render underneath elements defined later), ordering layers sequentially guarantees predictable visual stacking, painless selective layer isolation, seamless Inkscape & Illustrator import/export, and automated optimization via SVGO without z-index collisions.
              </p>
            </div>

            {/* Standard Hierarchy Table */}
            <div className="border border-[#333333] overflow-hidden bg-[#0A0A0A]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141414] text-[#888888] font-mono text-[11px] border-b border-[#333333] uppercase">
                  <tr>
                    <th className="py-3 px-4 w-20">Prefix</th>
                    <th className="py-3 px-4 w-48">Standard Layer Name</th>
                    <th className="py-3 px-4 w-32">Draw Stack Rank</th>
                    <th className="py-3 px-4">Layer Purpose & Example Elements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222] font-mono">
                  {VECTORA_LAYER_CONVENTION.map((rule, index) => (
                    <tr key={index} className="hover:bg-[#141414] transition-colors">
                      <td className="py-3 px-4 font-mono text-[#00FF00] font-bold">
                        {rule.prefix}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#FFFFFF]">
                        {rule.standardName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#1A1A1A] text-[#00F0FF] border border-[#333333]">
                          {index === 0 ? 'Resource (Hidden)' : index === 1 ? 'Bottom (Backdrop)' : index === VECTORA_LAYER_CONVENTION.length - 1 ? 'Top (Overlay)' : `Level ${index}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#CCCCCC]">{rule.description}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rule.exampleElements.map((elem, i) => (
                            <span
                              key={i}
                              className="text-[9px] bg-[#111111] text-[#888888] px-1 py-0.2 border border-[#222222]"
                            >
                              {elem}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Why This Convention Aids Editing & Pipeline Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#0A0A0A] border border-[#333333] space-y-2">
                <div className="text-xs font-bold text-[#00FF00] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Painter's Algorithm Determinism</span>
                </div>
                <p className="text-[11px] text-[#AAAAAA] leading-relaxed">
                  SVG lacks a CSS <code>z-index</code> stacking context. Ordering layer groups from <code>01_Background</code> to <code>07_FX_Overlays</code> physically mirrors rendering execution, ensuring highlights and typography never get swallowed behind background geometry.
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333333] space-y-2">
                <div className="text-xs font-bold text-[#00FF00] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>2. Non-Destructive Vector Isolation</span>
                </div>
                <p className="text-[11px] text-[#AAAAAA] leading-relaxed">
                  Standardized prefixes allow the editor to isolate complex shapes (e.g. soloing <code>03_Artwork_Core</code>) for focused bezier editing without inadvertently altering background grid nodes or headline text positions.
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333333] space-y-2">
                <div className="text-xs font-bold text-[#00FF00] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>3. Inkscape & Illustrator Interoperability</span>
                </div>
                <p className="text-[11px] text-[#AAAAAA] leading-relaxed">
                  By declaring <code>inkscape:groupmode="layer"</code> and <code>inkscape:label="0X_..."</code> on every layer, vector files open in desktop CAD & illustration software with native named layer stacks preserved.
                </p>
              </div>

              <div className="p-4 bg-[#0A0A0A] border border-[#333333] space-y-2">
                <div className="text-xs font-bold text-[#00FF00] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>4. Programmatic SVGO & CI/CD Pipelines</span>
                </div>
                <p className="text-[11px] text-[#AAAAAA] leading-relaxed">
                  Scripts and build tools can safely parse layer indices with regular expressions (<code>/^\d{2}_/</code>) to automate asset exports, color remapping, and multi-resolution sprite sheet generation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
