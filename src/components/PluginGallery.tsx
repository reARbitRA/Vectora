import React from 'react';
import { motion } from 'motion/react';
import { Puzzle, Zap, Scissors, Type, Maximize, Wind } from 'lucide-react';
import { toast } from 'sonner';

export const PluginGallery: React.FC = () => {
  const plugins = [
    { id: 'kinetic-vibe', name: 'Kinetic Vibe', desc: 'Auto-generate fluid motion paths', icon: Zap },
    { id: 'geo-mesh', name: 'Geo Mesh', desc: 'Convert paths to geometric wireframes', icon: Puzzle },
    { id: 'slice-dice', name: 'Slice & Dice', desc: 'Boolean operation helpers', icon: Scissors },
    { id: 'typo-wave', name: 'Typo Wave', desc: 'Animated text on paths', icon: Type },
    { id: 'scale-master', name: 'Scale Master', desc: 'Golden ratio scaling utility', icon: Maximize },
    { id: 'noise-flow', name: 'Noise Flow', desc: 'Perlin noise path distortion', icon: Wind },
  ];

  const handleInitialize = (name: string) => {
    toast.loading(`Initializing ${name}...`, {
      description: 'Injecting plugin dependencies into the vector engine.',
      duration: 2000,
      onAutoClose: () => {
        toast.success(`${name} Activated`, {
          description: 'The plugin is now available in your toolset.',
        });
      }
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Puzzle className="text-blue-400" size={20} />
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">Plugin Registry</h3>
      </div>

      <div className="space-y-3">
        {plugins.map((plugin) => (
          <motion.div
            key={plugin.id}
            whileHover={{ scale: 1.02 }}
            className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <plugin.icon size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">{plugin.name}</h4>
              <p className="mt-1 text-xs text-white/40 leading-relaxed">{plugin.desc}</p>
              <button 
                onClick={() => handleInitialize(plugin.name)}
                className="mt-3 rounded-lg bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                Initialize
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-6 text-center">
        <p className="text-xs text-white/30 italic">More community plugins loading...</p>
      </div>
    </div>
  );
};
