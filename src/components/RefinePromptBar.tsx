import React, { useState } from 'react';
import { Sparkles, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface RefinePromptBarProps {
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
}

export const RefinePromptBar: React.FC<RefinePromptBarProps> = ({
  onRefine,
  isRefining,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const quickPrompts = [
    'Add gilded Art Deco chevrons',
    'Add glowing cyan neon conduits',
    'Add technical vernier dial scales',
    'Add delicate stippling texture',
    'Add celestial starfield & orbit rings',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRefining) return;
    await onRefine(prompt);
    setPrompt('');
  };

  const handleQuickClick = async (qp: string) => {
    if (isRefining) return;
    setPrompt(qp);
    await onRefine(qp);
    setPrompt('');
  };

  return (
    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 max-w-[calc(100vw-170px)] sm:max-w-md md:max-w-xl select-none font-mono">
      {isCollapsed ? (
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-[#0A0A0A]/95 border border-[#333333] hover:border-[#00FF00] px-3 py-1.5 flex items-center gap-2 shadow-2xl text-xs text-[#CCCCCC] hover:text-[#00FF00] backdrop-blur-md transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00FF00]" />
          <span className="font-bold">Evolve Artwork...</span>
          <ChevronUp className="w-3 h-3 text-[#777777]" />
        </button>
      ) : (
        <div className="bg-[#0A0A0A]/95 backdrop-blur-md border border-[#333333] p-1.5 md:p-2 flex flex-col gap-1.5 shadow-2xl">
          {/* Header & Quick Suggestion Chips */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar flex-1 min-w-0">
              <span className="text-[10px] uppercase font-mono text-[#00FF00] shrink-0 flex items-center gap-1 font-bold">
                <Sparkles className="w-3 h-3 text-[#00FF00]" />
                <span className="hidden sm:inline">Evolve:</span>
              </span>
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickClick(qp)}
                  disabled={isRefining}
                  className="text-[10px] whitespace-nowrap px-2 py-0.5 bg-[#141414] border border-[#333333] hover:border-[#00FF00] hover:bg-[#222222] text-[#AAAAAA] hover:text-[#00FF00] transition-colors disabled:opacity-50 font-mono"
                >
                  {qp}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              title="Minimize Evolve Bar"
              className="p-1 text-[#666666] hover:text-[#FFFFFF] shrink-0"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
            <input
              id="refine-prompt-input"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isRefining}
              placeholder="Refine artwork (e.g. 'Add gold sunburst rays')..."
              className="flex-1 bg-[#000000] border border-[#333333] px-2.5 py-1.5 text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#00FF00] font-mono selection:bg-[#00FF00] selection:text-[#000000]"
            />

            <button
              type="submit"
              disabled={!prompt.trim() || isRefining}
              className="flex items-center gap-1 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold px-3 py-1.5 text-xs transition-all uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">Refining...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Evolve</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
