import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, LayoutGrid, Plus, History, Settings, Github, 
  HelpCircle, ChevronLeft, ChevronRight, User, LogOut
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  activeView: 'home' | 'studio' | 'gallery';
  onViewChange: (view: 'home' | 'studio' | 'gallery') => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  activeView, 
  onViewChange,
  isSidebarCollapsed,
  setSidebarCollapsed
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { id: 'home', icon: Plus, label: 'New Design' },
    { id: 'gallery', icon: LayoutGrid, label: 'Gallery' },
    { id: 'history', icon: History, label: 'History' },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 260 }}
        className="relative flex h-full flex-col border-r border-white/5 bg-[#0d0d0d] transition-all"
      >
        <div className="flex h-16 items-center justify-between px-6">
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tight text-blue-400"
            >
              Vectora
            </motion.span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-3 pt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as any)}
              className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-all ${
                activeView === item.id 
                  ? 'bg-blue-500/10 text-blue-400' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={22} className={activeView === item.id ? 'text-blue-400' : ''} />
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/5 p-4 space-y-2">
          <button className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-white/40 hover:bg-white/5 hover:text-white">
            <Github size={22} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">GitHub Sync</span>}
          </button>
          <button className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-white/40 hover:bg-white/5 hover:text-white">
            <Settings size={22} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-bottom border-white/5 bg-[#0d0d0d] px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-white/40">
              Workspace / <span className="text-white">{activeView === 'home' ? 'New Design' : 'Project Alpha'}</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-white/40 hover:text-white transition-colors">
              <HelpCircle size={20} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:bg-white/10"
              >
                <User size={20} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-white/10 bg-[#161616] p-2 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <p className="text-sm font-medium">Pro Account</p>
                      <p className="text-xs text-white/40">ari.eshghi89@gmail.com</p>
                    </div>
                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white">
                      <User size={16} /> Profile Settings
                    </button>
                    <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#0a0a0a]">
          {children}
        </main>
      </div>
    </div>
  );
};
