import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Upload, X, Image as ImageIcon, FileText, Sparkles } from 'lucide-react';

interface HomeViewProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !selectedFile) return;
    onGenerate(prompt, selectedFile || undefined);
    setPrompt('');
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl bg-white/5 p-3 pr-2"
              >
                {selectedFile.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-blue-400" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-400" />
                )}
                <span className="flex-1 truncate text-sm text-white/70">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
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
      </motion.div>
    </div>
  );
};
