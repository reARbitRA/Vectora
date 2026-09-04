import React, { useState } from 'react';
import { VectorArtwork } from '../types';
import {
  Sparkles,
  X,
  Loader2,
  Wand2,
  Sliders,
  Palette,
  Compass,
  ArrowRight,
  Zap
} from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, style: string, complexity: string, paletteMood: string) => Promise<void>;
  isGenerating: boolean;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Art Deco');
  const [complexity, setComplexity] = useState('balanced');
  const [paletteMood, setPaletteMood] = useState('Onyx & Gold');

  if (!isOpen) return null;

  const stylePresets = [
    'Art Deco',
    'Swiss / International',
    'Cyberpunk / Brutalist',
    'Bauhaus / Constructivism',
    'Celestial Astrolabe',
    'Japanese Botanical',
    'Glassmorphism UI',
    'Generative Parametric',
  ];

  const paletteMoods = [
    'Onyx & Gold',
    'Swiss Monochrome & Red',
    'Cyber Neon (Cyan/Magenta)',
    'Kyoto Sage & Terracotta',
    'Deep Cosmic Astral',
    'Warm Parchment & Ultramarine',
  ];

  const samplePrompts = [
    {
      title: 'Art Deco Luxury Monogram',
      prompt: 'A symmetrical luxury Art Deco monogram crest with stepped chevron arches, gold foil gradients, and radiant sunburst rays.',
      style: 'Art Deco',
      palette: 'Onyx & Gold',
    },
    {
      title: 'Bauhaus Kinetic Mobile',
      prompt: 'A constructivist Bauhaus kinetic balance composition with intersecting primary geometric discs, diagonal cantilever bar, and asymmetry.',
      style: 'Bauhaus / Constructivism',
      palette: 'Warm Parchment & Ultramarine',
    },
    {
      title: 'Quantum Isometric Server',
      prompt: 'An isometric cyberpunk data monolith with illuminated fiber optic conduit channels, 30-degree grid projections, and holographic telemetry tags.',
      style: 'Cyberpunk / Brutalist',
      palette: 'Cyber Neon (Cyan/Magenta)',
    },
    {
      title: 'Celestial Equinox Astrolabe',
      prompt: 'An antique celestial astrolabe with calibrated 360-degree degree limb rings, zodiac constellation star charts, and solar pointer ruler.',
      style: 'Celestial Astrolabe',
      palette: 'Deep Cosmic Astral',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    await onGenerate(prompt, style, complexity, paletteMood);
  };

  const handleSelectSample = (sample: typeof samplePrompts[0]) => {
    setPrompt(sample.prompt);
    setStyle(sample.style);
    setPaletteMood(sample.palette);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 select-none font-mono">
      <div className="bg-[#0A0A0A] border-2 border-[#333333] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-[#333333] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#00FF00]/10 border border-[#00FF00]/40 flex items-center justify-center text-[#00FF00]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-[#FFFFFF] uppercase tracking-wider">
                Generative SVG Engine
              </h2>
              <p className="text-[11px] text-[#888888] font-mono">
                Hand-authored, production-grade vector synthesis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Prompt Input Area */}
            <div>
              <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider block mb-2">
                Vector Prompt & Art Direction
              </label>
              <textarea
                id="ai-generator-prompt-input"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                placeholder="Describe your vector artwork (e.g., 'An intricate Swiss horological dial with red second needles and micro-grid lines')..."
                className="w-full bg-[#000000] border border-[#333333] p-3.5 text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#00FF00] font-mono selection:bg-[#00FF00] selection:text-[#000000] resize-none leading-relaxed"
              />
            </div>

            {/* Aesthetic Style Chips */}
            <div>
              <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#00FF00]" />
                Aesthetic Movement
              </label>
              <div className="flex flex-wrap gap-1.5">
                {stylePresets.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-all ${
                      style === s
                        ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]'
                        : 'bg-[#141414] text-[#888888] border-[#333333] hover:text-[#FFFFFF] hover:bg-[#222222]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Two Column Controls: Complexity & Palette Mood */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Complexity */}
              <div>
                <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#00FF00]" />
                  Geometry Complexity
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#000000] p-1 border border-[#333333]">
                  {['minimal', 'balanced', 'masterpiece'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setComplexity(c)}
                      className={`py-1.5 text-center text-xs font-mono font-bold uppercase transition-all ${
                        complexity === c
                          ? 'bg-[#00FF00] text-[#000000]'
                          : 'text-[#888888] hover:text-[#FFFFFF]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette Mood */}
              <div>
                <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#00FF00]" />
                  Color Palette Mood
                </label>
                <select
                  value={paletteMood}
                  onChange={(e) => setPaletteMood(e.target.value)}
                  className="w-full bg-[#000000] border border-[#333333] px-3 py-2 text-xs text-[#00FF00] font-mono font-bold uppercase focus:outline-none focus:border-[#00FF00] cursor-pointer"
                >
                  {paletteMoods.map((m) => (
                    <option key={m} value={m} className="bg-[#0A0A0A] text-[#FFFFFF]">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inspiration Prompt Presets */}
            <div>
              <label className="text-xs font-bold text-[#888888] uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#00FF00]" />
                Curated Design Briefs
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((sp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sp)}
                    className="p-2.5 text-left bg-[#141414] border border-[#333333] hover:border-[#00FF00] transition-all group"
                  >
                    <div className="text-xs font-bold text-[#FFFFFF] group-hover:text-[#00FF00] transition-colors uppercase">
                      {sp.title}
                    </div>
                    <div className="text-[11px] text-[#888888] line-clamp-1 mt-0.5 font-mono">
                      {sp.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-3 px-4 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#00FF00]" />
                    <span>Authoring Precision Vector SVG...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-[#000000]" />
                    <span>Generate Vector Artwork</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
