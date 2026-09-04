import React, { useState } from 'react';
import { Sparkles, Send, Loader2, ArrowRight } from 'lucide-react';

interface RefinePromptBarProps {
  onRefine: (instruction: string) => Promise<void>;
  isRefining: boolean;
}

export const RefinePromptBar: React.FC<RefinePromptBarProps> = ({
  onRefine,
  isRefining,
}) => {
  const [prompt, setPrompt] = useState('');

  const quickPrompts = [
    'Add gilded Art Deco chevron borders',
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
    <div className="absolute bottom-4 left-4 right-4 md:left-24 md:right-24 max-w-3xl mx-auto z-20 select-none font-mono">
      <div className="bg-[#0A0A0A] border border-[#333333] p-2 flex flex-col gap-2">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 custom-scrollbar">
          <span className="text-[10px] uppercase font-mono text-[#888888] shrink-0 flex items-center gap-1 pl-1">
            <Sparkles className="w-3 h-3 text-[#00FF00]" />
            Evolve:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleQuickClick(qp)}
              disabled={isRefining}
              className="text-[11px] whitespace-nowrap px-2.5 py-0.5 bg-[#141414] border border-[#333333] hover:border-[#00FF00] hover:bg-[#222222] text-[#AAAAAA] hover:text-[#00FF00] transition-colors disabled:opacity-50 font-mono"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            id="refine-prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isRefining}
            placeholder="Instruct VECTORA to refine this artwork (e.g. 'Add gold sunburst rays')..."
            className="flex-1 bg-[#000000] border border-[#333333] px-3 py-2 text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#00FF00] font-mono selection:bg-[#00FF00] selection:text-[#000000]"
          />

          <button
            type="submit"
            disabled={!prompt.trim() || isRefining}
            className="flex items-center gap-1.5 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold px-4 py-2 text-xs transition-all uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isRefining ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Refining...</span>
              </>
            ) : (
              <>
                <span>Evolve</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
