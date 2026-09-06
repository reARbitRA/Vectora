import React from 'react';
import { motion } from 'motion/react';
import { X, Keyboard, Command, Eye, Zap, Download, Layers, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Workspace' | 'Generation' | 'Export' | 'Canvas Navigation';
}

const SHORTCUTS: ShortcutItem[] = [
  // Workspace Views
  { keys: ['Ctrl', '1'], description: 'Navigate to Home / Synthesis Studio', category: 'Workspace' },
  { keys: ['Ctrl', '2'], description: 'Navigate to Vector Studio Canvas', category: 'Workspace' },
  { keys: ['Ctrl', '3'], description: 'Navigate to Masterpiece Gallery', category: 'Workspace' },
  { keys: ['Ctrl', 'K'], description: 'Open Quick Command Palette', category: 'Workspace' },
  { keys: ['?'], description: 'Toggle Keyboard Shortcuts Guide', category: 'Workspace' },

  // Generation & AI
  { keys: ['Ctrl', 'Enter'], description: 'Trigger AI Swarm Synthesis', category: 'Generation' },
  { keys: ['Ctrl', 'N'], description: 'Create New Design / Focus Prompt', category: 'Generation' },
  { keys: ['Ctrl', 'I'], description: 'Open Raster-to-Vector Import Studio', category: 'Generation' },

  // Export
  { keys: ['Ctrl', 'E'], description: 'Open Export Studio / Download Options', category: 'Export' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Quick Download Vector .SVG', category: 'Export' },
  { keys: ['Ctrl', 'Shift', 'P'], description: 'Quick Download High-Res .PNG', category: 'Export' },

  // Canvas
  { keys: ['Space', 'Drag'], description: 'Pan Canvas Viewport', category: 'Canvas Navigation' },
  { keys: ['Scroll'], description: 'Smooth Zoom In / Out', category: 'Canvas Navigation' },
  { keys: ['Ctrl', '0'], description: 'Reset Canvas View to 100%', category: 'Canvas Navigation' },
  { keys: ['G'], description: 'Toggle Cartesian / Isometric Grid Overlay', category: 'Canvas Navigation' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories = ['Workspace', 'Generation', 'Export', 'Canvas Navigation'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg text-[#00FF00]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Keyboard Shortcut Manager</h2>
              <p className="text-xs text-white/40">Global productivity and rapid navigation hotkeys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {categories.map((category) => {
            const items = SHORTCUTS.filter((s) => s.category === category);
            return (
              <div key={category} className="space-y-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00FF00]">
                  {category}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <span className="text-xs text-white/80 pr-2">{item.description}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kidx) => (
                          <React.Fragment key={kidx}>
                            <kbd className="px-2 py-1 text-[10px] font-mono font-bold text-white bg-black/60 border border-white/20 rounded shadow-sm">
                              {k}
                            </kbd>
                            {kidx < item.keys.length - 1 && (
                              <span className="text-[10px] text-white/30">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-[#141414] text-xs text-white/40">
          <span>Press <kbd className="px-1.5 py-0.5 bg-black/60 border border-white/20 rounded text-[10px] text-white">Esc</kbd> to close</span>
          <span className="font-mono text-[#00FF00]">VECTORA KINETIC STUDIO v2.0</span>
        </div>
      </motion.div>
    </div>
  );
};
