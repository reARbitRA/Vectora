import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Upload, X, Image as ImageIcon, FileText, Sparkles } from 'lucide-react';

interface HomeViewProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
  onGoToStudio?: () => void;
  onOpenAiModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onGenerate, isGenerating, onGoToStudio, onOpenAiModal }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !selectedFile) return;
    onGenerate(prompt, selectedFile || undefined);
    setPrompt('');
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/') || file.name.endsWith('.svg')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyStyleTag = (styleName: string) => {
    if (!prompt.includes(styleName)) {
      setPrompt((prev) => (prev ? `${prev}, in ${styleName} style` : `Vectorize in ${styleName} style with intricate geometric paths and rich layer hierarchy`));
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-light tracking-tight text-white sm:text-6xl">
            Design <span className="text-blue-400 font-normal">Beyond</span> Limits
          </h2>
          <p className="mt-4 text-lg text-white/50">
            Generate high-fidelity vector artworks with parametric motion.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-2xl transition-all hover:border-white/20 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10"
        >
          <div className="flex flex-col gap-2 p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vector masterpiece (e.g., 'A complex mechanical clock with neon gears and rotating needles')"
              className="min-h-[120px] w-full resize-none bg-transparent text-lg text-white placeholder-white/20 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-2 rounded-2xl bg-black/40 border border-white/10 p-3"
              >
                <div className="flex items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Reference Preview"
                      className="h-14 w-14 rounded-lg object-cover border border-white/20 shrink-0"
                    />
                  ) : selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="h-6 w-6 text-blue-400 shrink-0" />
                  ) : (
                    <FileText className="h-6 w-6 text-blue-400 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">
                        {selectedFile.name}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Reference
                      </span>
                    </div>
                    <span className="text-xs text-white/40 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to synthesize
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    title="Remove reference image"
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick Vector Style Preset Directives */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 flex-wrap">
                  <span className="text-[10px] text-white/40 uppercase font-mono mr-1">Style Target:</span>
                  {['Faithful Vector Trace', 'Swiss Bauhaus', 'Cyberpunk Brutalist', 'Art Deco Geometric', 'Minimalist Line Art'].map((styleTag) => (
                    <button
                      key={styleTag}
                      type="button"
                      onClick={() => handleApplyStyleTag(styleTag)}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors"
                    >
                      {styleTag}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 p-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex items-center gap-2 rounded-xl px-4 py-2 text-white/50 transition-all hover:bg-white/5 hover:text-white"
              >
                <Upload className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                <span className="text-sm font-medium">Upload Reference</span>
              </button>
              {onOpenAiModal && (
                <button
                  type="button"
                  onClick={onOpenAiModal}
                  className="group flex items-center gap-2 rounded-xl px-3.5 py-2 text-white/50 transition-all hover:bg-white/5 hover:text-[#00FF00]"
                  title="Tune aesthetic style presets, complexity, and color palettes"
                >
                  <Sparkles className="h-4 w-4 text-[#00FF00] transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium">Style Blueprints</span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,.svg"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating || (!prompt.trim() && !selectedFile)}
              className="flex items-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  Generate
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {['Cyberpunk Watch', 'Orbital Engine', 'Geometric Mandala', 'Circuit Brain'].map((tag) => (
            <button
              key={tag}
              onClick={() => setPrompt(tag)}
              className="rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-sm text-white/40 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {tag}
            </button>
          ))}
        </div>

        {onGoToStudio && (
          <div className="mt-6 text-center">
            <button
              onClick={onGoToStudio}
              className="text-xs font-mono text-white/40 hover:text-[#00FF00] transition-colors underline underline-offset-4"
            >
              Or open the interactive Vector Studio canvas directly →
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
