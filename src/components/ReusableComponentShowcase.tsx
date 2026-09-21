import { SafeSvg } from './SafeSvg';
import React, { useState } from 'react';
import { ReusableSvgComponent } from '../types';
import { REUSABLE_SVG_COMPONENTS } from '../data/reusableComponents';
import {
  Boxes,
  Code2,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Eye,
  Plus,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';

interface ReusableComponentShowcaseProps {
  onInjectComponent: (defsSnippet: string, useSnippet: string) => void;
}

export const ReusableComponentShowcase: React.FC<ReusableComponentShowcaseProps> = ({
  onInjectComponent,
}) => {
  const [selectedComp, setSelectedComp] = useState<ReusableSvgComponent>(REUSABLE_SVG_COMPONENTS[0]);
  const [activeVariables, setActiveVariables] = useState<Record<string, string>>(
    REUSABLE_SVG_COMPONENTS[0].cssVariables
  );
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  // Switch component
  const handleSelectComponent = (comp: ReusableSvgComponent) => {
    setSelectedComp(comp);
    setActiveVariables(comp.cssVariables);
    setInjectedSuccess(false);
  };

  // Variable tweak
  const handleVariableChange = (key: string, value: string) => {
    setActiveVariables((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCopy = async (text: string, sectionId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleInject = () => {
    onInjectComponent(selectedComp.defsCode, selectedComp.useCode);
    setInjectedSuccess(true);
    setTimeout(() => setInjectedSuccess(false), 3000);
  };

  // Build live preview with active CSS variables
  const styleString = Object.entries(activeVariables)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#000000] text-[#FFFFFF] font-mono custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Header Title */}
        <div className="border-b border-[#333333] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#141414] text-[#00FF00] border border-[#333333] font-bold">
                SVG COMPONENT ARCHITECTURE
              </span>
              <span className="text-xs font-mono text-[#888888] font-bold uppercase">
                &lt;defs&gt; + &lt;use&gt; + &lt;style&gt;
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#FFFFFF] tracking-tight uppercase">
              Reusable SVG Component Studio
            </h1>
            <p className="text-xs text-[#888888] mt-1 font-mono">
              Inspect modular, resolution-independent vector components defined within &lt;defs&gt; and instantiated via &lt;use&gt; with CSS variable styling.
            </p>
          </div>

          <button
            onClick={handleInject}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
              injectedSuccess
                ? 'bg-[#00FF00] text-[#000000] border-[#00FF00]'
                : 'bg-[#141414] text-[#00FF00] hover:bg-[#00FF00] hover:text-[#000000] border-[#00FF00]'
            }`}
          >
            {injectedSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{injectedSuccess ? 'Injected to Active SVG!' : 'Inject into Active SVG'}</span>
          </button>
        </div>

        {/* Component Selector Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REUSABLE_SVG_COMPONENTS.map((comp) => {
            const isSelected = selectedComp.id === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => handleSelectComponent(comp)}
                className={`p-3.5 border text-left transition-all ${
                  isSelected
                    ? 'bg-[#00FF00]/10 border-[#00FF00] text-[#FFFFFF]'
                    : 'bg-[#0A0A0A] border-[#333333] hover:border-[#555555] text-[#888888]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#00FF00] font-bold">
                    {comp.category}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse" />
                  )}
                </div>
                <div className="text-xs font-bold text-[#FFFFFF] mb-1">{comp.name}</div>
                <p className="text-[11px] text-[#777777] line-clamp-2">{comp.description}</p>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Preview Stage */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00FF00]" />
              <h2 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                Live Dynamic Instance Viewport (&lt;use&gt; Instances)
              </h2>
            </div>
            <span className="text-[11px] text-[#888888]">
              Rendered on isolated dark grid
            </span>
          </div>

          <div
            className="w-full h-48 md:h-56 bg-[#000000] border border-[#222222] p-4 flex items-center justify-center relative overflow-hidden"
            style={{ [':root' as any]: styleString }}
          >
            <SafeSvg className="w-full h-full" svg={selectedComp.previewSvg} />
          </div>

          {/* CSS Variable Real-Time Tuning Controls */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#AAAAAA] uppercase tracking-wider mb-3">
              <Sliders className="w-3.5 h-3.5 text-[#00FF00]" />
              <span>Override Component CSS Variables Live</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(activeVariables).map(([varName, value]) => {
                const strVal = String(value || '');
                return (
                  <div key={varName} className="p-2.5 bg-[#141414] border border-[#333333] space-y-1.5">
                    <span className="text-[10px] text-[#888888] font-bold truncate block">
                      {varName}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={strVal.startsWith('#') && strVal.length === 7 ? strVal : '#00FF00'}
                        onChange={(e) => handleVariableChange(varName, e.target.value)}
                        className="w-6 h-6 bg-transparent border-0 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={strVal}
                        onChange={(e) => handleVariableChange(varName, e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#333333] px-1.5 py-0.5 text-[11px] text-[#00FF00] font-mono outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Code Architecture Breakdown (<defs>, <use>, <style>) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defs Definition Block */}
          <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                <Code2 className="w-4 h-4 text-[#00FF00]" />
                <span>1. &lt;defs&gt; Component Symbol</span>
              </div>
              <button
                onClick={() => handleCopy(selectedComp.defsCode, 'defs')}
                className="flex items-center gap-1 text-[11px] text-[#888888] hover:text-[#00FF00] px-2 py-1 bg-[#141414] border border-[#333333]"
              >
                {copiedSection === 'defs' ? <Check className="w-3 h-3 text-[#00FF00]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'defs' ? 'Copied' : 'Copy <defs>'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#888888]">
              Defines the master vector shape once without rendering it directly.
            </p>
            <pre className="bg-[#000000] border border-[#222222] p-3 text-[11px] text-[#00FF00] overflow-x-auto max-h-48 custom-scrollbar">
              <code>{selectedComp.defsCode}</code>
            </pre>
          </div>

          {/* Use Instantiation Block */}
          <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                <Boxes className="w-4 h-4 text-[#00FF00]" />
                <span>2. &lt;use&gt; Instantiation & Overrides</span>
              </div>
              <button
                onClick={() => handleCopy(selectedComp.useCode, 'use')}
                className="flex items-center gap-1 text-[11px] text-[#888888] hover:text-[#00FF00] px-2 py-1 bg-[#141414] border border-[#333333]"
              >
                {copiedSection === 'use' ? <Check className="w-3 h-3 text-[#00FF00]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'use' ? 'Copied' : 'Copy <use>'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[#888888]">
              Instantiates the component multiple times at custom positions with custom CSS variables.
            </p>
            <pre className="bg-[#000000] border border-[#222222] p-3 text-[11px] text-[#00FF00] overflow-x-auto max-h-48 custom-scrollbar">
              <code>{selectedComp.useCode}</code>
            </pre>
          </div>
        </div>

        {/* Full Complete Ready-to-use Standalone Snippet */}
        <div className="bg-[#0A0A0A] border border-[#333333] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#00FF00]" />
              <span>Full Standalone SVG Template (Ready to paste)</span>
            </div>
            <button
              onClick={() => handleCopy(selectedComp.fullSnippet, 'full')}
              className="flex items-center gap-1 text-xs text-[#000000] font-bold px-3 py-1.5 bg-[#00FF00] hover:bg-[#33FF33] border border-[#00FF00]"
            >
              {copiedSection === 'full' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'full' ? 'Copied Full SVG' : 'Copy Standalone SVG'}</span>
            </button>
          </div>
          <pre className="bg-[#000000] border border-[#222222] p-4 text-[11px] text-[#CCCCCC] overflow-x-auto max-h-60 custom-scrollbar">
            <code>{selectedComp.fullSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
