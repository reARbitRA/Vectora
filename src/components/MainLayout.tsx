import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, LayoutGrid, Plus, History, Settings, Github, 
  HelpCircle, ChevronLeft, ChevronRight, User, LogOut,
  PenTool, Sparkles, Command
} from 'lucide-react';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
  activeView: 'home' | 'studio' | 'gallery' | 'history';
  onViewChange: (view: 'home' | 'studio' | 'gallery' | 'history') => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  artworkTitle?: string;
  onOpenShortcuts?: () => void;
  onOpenCommandPalette?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeView, 
  onViewChange,
  isSidebarCollapsed,
  setSidebarCollapsed,
  artworkTitle,
  onOpenShortcuts,
  onOpenCommandPalette
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { id: 'studio', icon: PenTool, label: 'Vector Studio' },
    { id: 'home', icon: Sparkles, label: 'Synthesize' },
    { id: 'gallery', icon: LayoutGrid, label: 'Gallery' },
    { id: 'history', icon: History, label: 'History' },
  ];

  const handleGithubSync = () => {
    toast.info('GitHub Integration', {
      description: 'Open Vector Studio to commit or sync your artwork directly to GitHub.'
    });
  };

  const handleSettingsClick = () => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      toast.info('Settings & Preferences', {
        description: 'Use the Command Palette (Cmd+K) or Canvas HUD to toggle grids, layers, and styles.'
      });
    }
  };

  const viewTitles: Record<string, string> = {
    studio: artworkTitle || 'Vector Studio',
    home: 'AI Synthesis Studio',
    gallery: 'Curated Masterpieces',
    history: 'Session History',
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 250 }}
        className="relative flex h-full flex-col border-r border-white/5 bg-[#0d0d0d] transition-all select-none z-20"
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/5">
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onViewChange('studio')}
            >
              <div className="w-6 h-6 rounded bg-[#00FF00] flex items-center justify-center font-bold text-black text-xs font-mono">
                V
              </div>
              <span className="text-lg font-bold tracking-wider text-white font-mono uppercase">
                VECTORA
              </span>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 pt-4">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as any)}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 transition-all font-mono text-xs uppercase font-semibold ${
                  isActive 
                    ? 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30 shadow-[0_0_12px_rgba(0,255,0,0.15)]' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <item.icon size={19} className={isActive ? 'text-[#00FF00]' : 'text-white/40 group-hover:text-white'} />
                {!isSidebarCollapsed && (
                  <span className="tracking-wide">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-3 space-y-1">
          <button 
            onClick={onOpenCommandPalette}
            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-white/40 hover:bg-white/5 hover:text-white transition-all text-xs font-mono"
            title="Command Palette (Ctrl+K)"
          >
            <Command size={18} />
            {!isSidebarCollapsed && <span>Command Bar</span>}
          </button>
          <button 
            onClick={handleGithubSync}
            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-white/40 hover:bg-white/5 hover:text-white transition-all text-xs font-mono"
          >
            <Github size={18} />
            {!isSidebarCollapsed && <span>GitHub Sync</span>}
          </button>
          <button 
            onClick={handleSettingsClick}
            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-white/40 hover:bg-white/5 hover:text-white transition-all text-xs font-mono"
          >
            <Settings size={18} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0d0d0d] px-6 z-10 select-none font-mono">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/40 uppercase">VECTORA /</span>
            <span className="text-[#00FF00] font-bold uppercase truncate max-w-xs md:max-w-md">
              {viewTitles[activeView] || 'Workspace'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenShortcuts && (
              <button 
                onClick={onOpenShortcuts}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-white/50 hover:text-[#00FF00] hover:bg-white/5 rounded-lg border border-white/10 text-xs transition-colors"
                title="Keyboard Shortcuts (?)"
              >
                <HelpCircle size={15} />
                <span className="hidden sm:inline">Shortcuts</span>
              </button>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10 hover:border-[#00FF00]/50"
              >
                <User size={16} className="text-white/70" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-white/10 bg-[#161616] p-2 shadow-2xl backdrop-blur-xl z-50 font-mono text-xs"
                  >
                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <p className="font-bold text-white uppercase">Vectora Studio</p>
                      <p className="text-[11px] text-[#00FF00] mt-0.5">Online & Ready</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (onOpenShortcuts) onOpenShortcuts();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-white/60 hover:bg-white/5 hover:text-white"
                    >
                      <HelpCircle size={14} /> Shortcuts Guide
                    </button>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        onViewChange('gallery');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-white/60 hover:bg-white/5 hover:text-white"
                    >
                      <LayoutGrid size={14} /> Masterpiece Gallery
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#0a0a0a] relative">
          {children}
        </main>
      </div>
    </div>
  );
};

