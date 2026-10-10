import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Puzzle, Zap, Scissors, Type, Maximize, Wind, Check, Play } from 'lucide-react';
import { toast } from 'sonner';

interface PluginGalleryProps {
  activeSvg?: string;
  onApplyPlugin?: (modifiedSvg: string, pluginName: string) => void;
}

export const PluginGallery: React.FC<PluginGalleryProps> = ({ activeSvg, onApplyPlugin }) => {
  const [activePluginId, setActivePluginId] = useState<string | null>(null);

  const plugins = [
    {
      id: 'kinetic-vibe',
      name: 'Kinetic Vibe',
      desc: 'Injects fluid harmonic kinetic CSS keyframes into vector layers',
      icon: Zap,
      apply: (svg: string) => {
        const styleBlock = `
<style id="vectora-plugin-kinetic-vibe">
@keyframes vectora-kinetic-vibe {
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-12px) scale(1.02); }
  100% { transform: translateY(0px) scale(1); }
}
svg > g:not(#defs):not([id*="defs"]) {
  animation: vectora-kinetic-vibe 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  transform-origin: center;
}
</style>`;
        if (svg.includes('id="vectora-plugin-kinetic-vibe"')) {
          return svg;
        }
        if (svg.includes('<defs>')) {
          return svg.replace('<defs>', `<defs>${styleBlock}`);
        }
        return svg.replace('</svg>', `${styleBlock}</svg>`);
      },
    },
    {
      id: 'geo-mesh',
      name: 'Geo Mesh',
      desc: 'Overlays precision geometric triangulation & coordinate wireframe',
      icon: Puzzle,
      apply: (svg: string) => {
        const meshGroup = `
<g id="plugin-geo-mesh" opacity="0.35" stroke="#00FFCC" stroke-width="0.8" fill="none">
  <polygon points="100,100 250,50 400,150 250,250" />
  <polygon points="400,150 600,80 750,200 550,280" />
  <polygon points="250,250 450,350 650,450 400,550" />
  <polygon points="750,200 900,320 820,500 650,450" />
  <line x1="100" y1="100" x2="900" y2="900" stroke-dasharray="4 4" stroke="#00FFCC" opacity="0.25" />
  <line x1="900" y1="100" x2="100" y2="900" stroke-dasharray="4 4" stroke="#00FFCC" opacity="0.25" />
  <circle cx="250" cy="50" r="3" fill="#00FFCC" />
  <circle cx="400" cy="150" r="3" fill="#00FFCC" />
  <circle cx="750" cy="200" r="3" fill="#00FFCC" />
  <circle cx="450" cy="350" r="3" fill="#00FFCC" />
</g>`;
        if (svg.includes('id="plugin-geo-mesh"')) {
          return svg.replace(/<g id="plugin-geo-mesh"[\s\S]*?<\/g>/, meshGroup);
        }
        return svg.replace('</svg>', `${meshGroup}\n</svg>`);
      },
    },
    {
      id: 'slice-dice',
      name: 'Slice & Dice',
      desc: 'Applies dynamic high-contrast geometric stencil and stroke rhythm',
      icon: Scissors,
      apply: (svg: string) => {
        const sliceStyle = `
<style id="vectora-plugin-slice-dice">
svg path {
  stroke-dasharray: 12 4 !important;
  stroke-linecap: round !important;
}
</style>`;
        if (svg.includes('id="vectora-plugin-slice-dice"')) {
          return svg;
        }
        return svg.replace('</svg>', `${sliceStyle}</svg>`);
      },
    },
    {
      id: 'typo-wave',
      name: 'Typo Wave',
      desc: 'Injects sinusoidal undulating wave physics across paths and text',
      icon: Type,
      apply: (svg: string) => {
        const waveStyle = `
<style id="vectora-plugin-typo-wave">
@keyframes vectora-typo-wave {
  0% { transform: skewX(-2.5deg) scaleY(1); }
  50% { transform: skewX(2.5deg) scaleY(1.04); }
  100% { transform: skewX(-2.5deg) scaleY(1); }
}
svg text, svg [id*="text"], svg [id*="Text"] {
  animation: vectora-typo-wave 2.8s ease-in-out infinite alternate;
  transform-origin: center;
}
</style>`;
        if (svg.includes('id="vectora-plugin-typo-wave"')) {
          return svg;
        }
        return svg.replace('</svg>', `${waveStyle}</svg>`);
      },
    },
    {
      id: 'scale-master',
      name: 'Scale Master',
      desc: 'Calibrates viewBox to golden ratio proportions (1.618:1 framing)',
      icon: Maximize,
      apply: (svg: string) => {
        // Read existing viewBox
        const vbMatch = svg.match(/viewBox=["']([^"']+)["']/i);
        if (vbMatch) {
          const parts = vbMatch[1].split(/[\s,]+/).map(Number);
          if (parts.length === 4) {
            const w = parts[2];
            const goldenH = Math.round(w / 1.618033);
            return svg.replace(vbMatch[0], `viewBox="${parts[0]} ${parts[1]} ${w} ${goldenH}"`);
          }
        }
        return svg.replace(/<svg\b([^>]*)>/i, '<svg$1 viewBox="0 0 1000 618">');
      },
    },
    {
      id: 'noise-flow',
      name: 'Noise Flow',
      desc: 'Injects procedural SVG Perlin noise displacement filter',
      icon: Wind,
      apply: (svg: string) => {
        const filterSnippet = `
<filter id="vectora-noise-flow" x="-20%" y="-20%" width="140%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" result="turb"/>
  <feDisplacementMap in="SourceGraphic" in2="turb" scale="7" xChannelSelector="R" yChannelSelector="G"/>
</filter>`;
        const styleSnippet = `
<style id="vectora-plugin-noise-flow-style">
svg > g:last-of-type { filter: url(#vectora-noise-flow); }
</style>`;
        let updated = svg;
        if (!updated.includes('id="vectora-noise-flow"')) {
          if (updated.includes('<defs>')) {
            updated = updated.replace('<defs>', `<defs>${filterSnippet}`);
          } else {
            updated = updated.replace(/<svg\b([^>]*)>/i, `<svg$1><defs>${filterSnippet}</defs>`);
          }
        }
        if (!updated.includes('id="vectora-plugin-noise-flow-style"')) {
          updated = updated.replace('</svg>', `${styleSnippet}</svg>`);
        }
        return updated;
      },
    },
  ];

  const handleApply = (plugin: typeof plugins[0]) => {
    if (!activeSvg) {
      toast.info('No active vector canvas to transform');
      return;
    }
    try {
      const modified = plugin.apply(activeSvg);
      if (modified === activeSvg) {
        toast.info(`${plugin.name} is already active on this canvas`);
        return;
      }
      setActivePluginId(plugin.id);
      onApplyPlugin?.(modified, plugin.name);
      toast.success(`${plugin.name} Applied`, {
        description: 'Transformed vector document (undoable)',
      });
    } catch (err: any) {
      console.error('Plugin error:', err);
      toast.error('Failed to apply plugin', { description: err.message });
    }
  };

  return (
    <div className="p-4 space-y-4 font-mono select-none">
      <div className="flex items-center gap-2 mb-4">
        <Puzzle className="text-blue-400" size={18} />
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">Plugin Registry</h3>
        <span className="text-[10px] text-[#00FF00] ml-auto">6 Live Plugins</span>
      </div>

      <div className="space-y-3">
        {plugins.map((plugin) => (
          <motion.div
            key={plugin.id}
            whileHover={{ scale: 1.01 }}
            className={`group flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
              activePluginId === plugin.id
                ? 'border-[#00FF00]/40 bg-[#00FF00]/5'
                : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <plugin.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white truncate">{plugin.name}</h4>
                {activePluginId === plugin.id && (
                  <span className="flex items-center gap-1 text-[10px] text-[#00FF00]">
                    <Check size={11} /> Active
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-white/50 leading-relaxed">{plugin.desc}</p>
              <button 
                onClick={() => handleApply(plugin)}
                className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                <Play size={10} /> Apply Plugin
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

