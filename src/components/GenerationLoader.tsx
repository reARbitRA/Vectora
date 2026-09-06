import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Cpu, Layers, Zap } from 'lucide-react';

interface GenerationLoaderProps {
  prompt: string;
}

export const GenerationLoader: React.FC<GenerationLoaderProps> = ({ prompt }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] px-6 text-center">
      <div className="relative mb-12">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="h-32 w-32 rounded-full border-2 border-blue-500/20 border-t-blue-500"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-blue-400" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md"
      >
        <h2 className="text-2xl font-light text-white">Synthesizing Artwork</h2>
        <p className="mt-2 text-white/40 italic">"{prompt}"</p>
      </motion.div>

      <div className="mt-16 grid w-full max-w-sm grid-cols-3 gap-8">
        {[
          { icon: Cpu, label: 'Neural Mapping' },
          { icon: Layers, label: 'Vector Stacking' },
          { icon: Zap, label: 'Kinetic Binding' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
            <motion.div
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5"
            >
              <item.icon className="h-5 w-5 text-blue-400" />
            </motion.div>
            <span className="text-[10px] uppercase tracking-widest text-white/20">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 h-1 w-64 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};
