import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Home,
  Layers,
  Sparkles,
  Download,
  Film,
  Keyboard,
  ArrowRight,
  Zap,
  Image as ImageIcon,
  Scan,
  Compass,
  X,
  Clock
} from 'lucide-react';
import { VectorArtwork } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: 'home' | 'studio' | 'gallery' | 'history' | 'encyclopedia') => void;
  onQuickGenerate?: (prompt: string) => void;
  onDownloadSvg?: () => void;
  onDownloadPng?: () => void;
  onOpenExport?: () => void;
  onOpenShortcuts?: () => void;
  currentArtwork?: VectorArtwork | null;
}

interface PaletteCommand {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  category: 'Views' | 'Generation' | 'Export' | 'Help';
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onQuickGenerate,
  onDownloadSvg,
  onDownloadPng,
  onOpenExport,
  onOpenShortcuts,
  currentArtwork,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: PaletteCommand[] = [
    // Views
    {
      id: 'view-home',
      title: 'Go to Home / Synthesis Studio',
      subtitle: 'Prompt entry, multi-model selection, and design presets',
      icon: Home,
      shortcut: 'Ctrl+1',
      category: 'Views',
      action: () => {
        onSelectView('home');
        onClose();
      },
    },
    {
      id: 'view-studio',
      title: 'Go to Vector Studio Canvas',
      subtitle: 'Direct SVG canvas editing, layer hierarchies, and color mutations',
      icon: Layers,
      shortcut: 'Ctrl+2',
      category: 'Views',
      action: () => {
        onSelectView('studio');
        onClose();
      },
    },
    {
      id: 'view-gallery',
      title: 'Open Masterpiece Gallery',
      subtitle: 'Browse curated museum-grade vector illustrations and templates',
      icon: Sparkles,
      shortcut: 'Ctrl+3',
      category: 'Views',
      action: () => {
        onSelectView('gallery');
        onClose();
      },
    },
    {
      id: 'view-history',
      title: 'Open Design History',
      subtitle: 'Review, duplicate, or reload recent session artworks',
      icon: Clock,
      shortcut: 'Ctrl+4',
      category: 'Views',
      action: () => {
        onSelectView('history');
        onClose();
      },
    },

    // Generation
    {
      id: 'cmd-new-design',
      title: 'Create New Vector Artwork',
      subtitle: 'Start with a fresh prompt in the Synthesis Studio',
      icon: Zap,
      shortcut: 'Ctrl+N',
      category: 'Generation',
      action: () => {
        onSelectView('home');
        onClose();
      },
    },

    // Export options (available when artwork exists)
    ...(currentArtwork
      ? [
          {
            id: 'cmd-download-svg',
            title: 'Download Vector (.SVG)',
            subtitle: `Export "${currentArtwork.title}" as source SVG with layer tags`,
            icon: Download,
            shortcut: 'Ctrl+Shift+S',
            category: 'Export' as const,
            action: () => {
              onDownloadSvg?.();
              onClose();
            },
          },
          {
            id: 'cmd-download-png',
            title: 'Download High-Res (.PNG)',
            subtitle: `Rasterize "${currentArtwork.title}" at 2x Retina resolution`,
            icon: ImageIcon,
            shortcut: 'Ctrl+Shift+P',
            category: 'Export' as const,
            action: () => {
              onDownloadPng?.();
              onClose();
            },
          },
          {
            id: 'cmd-open-export',
            title: 'Open Advanced Export Studio...',
            subtitle: 'Export options for React TSX, CSS Data URI, and Spritesheets',
            icon: Download,
            shortcut: 'Ctrl+E',
            category: 'Export' as const,
            action: () => {
              onOpenExport?.();
              onClose();
            },
          },
        ]
      : []),

    // Help
    {
      id: 'cmd-shortcuts',
      title: 'View Keyboard Shortcuts',
      subtitle: 'Display complete hotkey matrix and cheat sheet',
      icon: Keyboard,
      shortcut: '?',
      category: 'Help',
      action: () => {
        onOpenShortcuts?.();
        onClose();
      },
    },
  ];

  // Filter commands by search query
  const filteredCommands = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      } else if (query.trim() && onQuickGenerate) {
        onQuickGenerate(query.trim());
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        className="relative w-full max-w-xl bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#141414]">
          <Search className="w-5 h-5 text-white/40 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or enter a prompt to generate..."
            className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-white/30 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Command List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {query.trim() && (
            <div
              onClick={() => {
                if (onQuickGenerate) {
                  onQuickGenerate(query.trim());
                  onClose();
                }
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#00FF00]/10 border border-[#00FF00]/20 text-[#00FF00] cursor-pointer hover:bg-[#00FF00]/20 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Zap className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold truncate">
                  Synthesize Vector: "{query}"
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#00FF00]/20 px-2 py-0.5 rounded shrink-0">
                Press Enter
              </span>
            </div>
          )}

          {filteredCommands.length === 0 && !query.trim() ? (
            <div className="p-8 text-center text-xs text-white/30">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((command, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = command.icon;
              return (
                <div
                  key={command.id}
                  onClick={command.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-white/10 text-[#00FF00]' : 'bg-white/5 text-white/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-white truncate">
                        {command.title}
                      </div>
                      <div className="text-[11px] text-white/40 truncate">
                        {command.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {command.shortcut && (
                      <kbd className="px-2 py-0.5 text-[10px] font-mono text-white/40 bg-black/40 border border-white/10 rounded">
                        {command.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'opacity-0'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/10 bg-[#141414] text-[11px] text-white/40">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="px-1 py-0.5 bg-black/40 border border-white/10 rounded text-[9px] text-white">↑</kbd> <kbd className="px-1 py-0.5 bg-black/40 border border-white/10 rounded text-[9px] text-white">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 bg-black/40 border border-white/10 rounded text-[9px] text-white">Enter</kbd> to select</span>
          </div>
          <span className="font-mono text-[10px] text-[#00FF00]">VECTORA COMMAND HUB</span>
        </div>
      </motion.div>
    </div>
  );
};
