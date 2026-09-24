import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { IntroLoader } from './components/IntroLoader';
import { MainLayout } from './components/MainLayout';
import { HomeView } from './components/HomeView';
import { UnifiedStudio } from './components/UnifiedStudio';
import { MasterpieceGallery } from './components/MasterpieceGallery';
import { HistoryView } from './components/HistoryView';
import { EncyclopediaView } from './components/EncyclopediaView';
import { GenerationLoader } from './components/GenerationLoader';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { Toaster, toast } from 'sonner';
import { downloadBlob, exportSvgToPng } from './utils/svgParser';
import { MASTERPIECES } from './data/masterpieces';
import { Keyboard, Command } from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'studio' | 'gallery' | 'history' | 'encyclopedia'>('studio');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentArtwork, setCurrentArtwork] = useState<any>(MASTERPIECES[0]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const saveToHistory = useCallback((artwork: any) => {
    if (!artwork || !artwork.id) return;
    try {
      const stored = localStorage.getItem('vectora_history');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = list.filter((item: any) => item.id !== artwork.id);
      const updated = [artwork, ...filtered].slice(0, 30);
      localStorage.setItem('vectora_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist history', e);
    }
  }, []);

  // Seed initial artwork in history if not already present
  useEffect(() => {
    if (MASTERPIECES[0]) {
      saveToHistory(MASTERPIECES[0]);
    }
  }, [saveToHistory]);

  // Global SVG Download Action
  const handleDownloadCurrentSvg = useCallback(() => {
    if (!currentArtwork?.svg) {
      toast.info('No active artwork to export');
      return;
    }
    try {
      const blob = new Blob([currentArtwork.svg], { type: 'image/svg+xml;charset=utf-8' });
      const filename = `${(currentArtwork.title || 'vectora-art').toLowerCase().replace(/[^a-z0-9_-]/g, '-')}.svg`;
      downloadBlob(blob, filename);
      toast.success('Vector SVG Downloaded', { description: filename });
    } catch (err: any) {
      toast.error('Download failed', { description: err.message });
    }
  }, [currentArtwork]);

  // Global High-Res PNG Download Action
  const handleDownloadCurrentPng = async (scale = 2) => {
    if (!currentArtwork?.svg) {
      toast.info('No active artwork to export');
      return;
    }
    const toastId = toast.loading('Rendering high-res PNG...', {
      description: `Scaling to ${scale}x Retina resolution...`
    });
    try {
      const blob = await exportSvgToPng(currentArtwork.svg, scale);
      const filename = `${(currentArtwork.title || 'vectora-art').toLowerCase().replace(/[^a-z0-9_-]/g, '-')}.png`;
      downloadBlob(blob, filename);
      toast.success('High-Res PNG Exported', { id: toastId, description: filename });
    } catch (err: any) {
      console.error('PNG export failed:', err);
      toast.error('Rasterization failed', {
        id: toastId,
        description: err?.message || 'Unable to render vector canvas to PNG.'
      });
    }
  };

  // Global Keyboard Shortcut Manager
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      const targetTag = (document.activeElement?.tagName || '').toUpperCase();
      const isInput = ['INPUT', 'TEXTAREA'].includes(targetTag);

      // Escape closes open palettes or modals
      if (e.key === 'Escape') {
        if (showCommandPalette) setShowCommandPalette(false);
        if (showShortcutsModal) setShowShortcutsModal(false);
        return;
      }

      // Command Palette (Ctrl+K or Cmd+K)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
        return;
      }

      // Help Modal (? when not in input, or Ctrl+H)
      if ((e.key === '?' && !isInput) || (isCmdOrCtrl && e.key.toLowerCase() === 'h')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Workspace View Navigation
      if (isCmdOrCtrl && e.key === '1') {
        e.preventDefault();
        setActiveView('home');
        toast.info('Workspace: Synthesis Studio', { description: 'Shortcut: Ctrl+1' });
        return;
      }
      if (isCmdOrCtrl && e.key === '2') {
        e.preventDefault();
        setActiveView('studio');
        toast.info('Workspace: Vector Studio Canvas', { description: 'Shortcut: Ctrl+2' });
        return;
      }
      if (isCmdOrCtrl && e.key === '3') {
        e.preventDefault();
        setActiveView('gallery');
        toast.info('Workspace: Masterpiece Gallery', { description: 'Shortcut: Ctrl+3' });
        return;
      }
      if (isCmdOrCtrl && e.key === '5') { e.preventDefault(); setActiveView('encyclopedia'); toast.info('Workspace: Master Encyclopedia'); return; }
      if (isCmdOrCtrl && e.key === '4') {
        e.preventDefault();
        setActiveView('history');
        toast.info('Workspace: Design History', { description: 'Shortcut: Ctrl+4' });
        return;
      }

      // Trigger New Artwork / Focus Prompt (Ctrl+N)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setActiveView('home');
        toast.info('New Artwork Creation', { description: 'Ready to synthesize from prompt.' });
        return;
      }

      // Direct SVG Export (Ctrl+Shift+S)
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownloadCurrentSvg();
        return;
      }

      // Direct PNG Export (Ctrl+Shift+P)
      if (isCmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handleDownloadCurrentPng(2);
        return;
      }

      // Quick Export Menu / Studio Focus (Ctrl+E)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (currentArtwork) {
          setActiveView('studio');
          setShowCommandPalette(true);
        } else {
          toast.info('Create an artwork first to export');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, showShortcutsModal, currentArtwork]);

  const handleGenerate = async (prompt: string, file?: File) => {
    setCurrentPrompt(prompt);
    setIsGenerating(true);
    const toastId = toast.loading('Initiating Synthesis Swarm...', {
      description: 'Orchestrating model rotation pool.'
    });

    try {
      let base64Image = '';
      if (file) {
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      let response: Response;
      try {
        response = await fetch('/api/generate-unified', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            image: base64Image,
            type: file ? 'vision' : 'text'
          }),
        });
      } catch (networkErr: any) {
        // Fallback for text prompt if generate-unified network stream broke
        if (!file) {
          response = await fetch('/api/generate-svg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          });
        } else {
          throw new Error(networkErr?.message || 'Network connection interrupted. Please try again.');
        }
      }

      if (response.status === 429) {
        toast.error('Engine Cooling Down', {
          id: toastId,
          description: 'Free tier quota reached. Retrying with fallback model...'
        });
      }

      if (!response.ok) {
        let errorDetail = 'Generation failed';
        try {
          const errJson = await response.json();
          if (errJson?.error) errorDetail = errJson.error;
        } catch (_) {
          errorDetail = `Server returned status ${response.status}`;
        }
        throw new Error(errorDetail);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setCurrentArtwork(result.data);
        saveToHistory(result.data);
        setActiveView('studio');
        toast.success('Masterpiece Synthesized', { id: toastId });
      } else {
        throw new Error(result.error || 'Invalid response received from synthesis engine.');
      }
    } catch (error: any) {
      console.error('Error generating artwork:', error);
      toast.error('Synthesis Failed', {
        id: toastId,
        description: error.message || 'The AI swarm is currently overloaded. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSvg = useCallback((newSvg: string) => {
    setCurrentArtwork((prev: any) => {
      if (!prev) return prev;
      if (prev.svg === newSvg) return prev;
      const updated = { ...prev, svg: newSvg };
      saveToHistory(updated);
      return updated;
    });
  }, [saveToHistory]);

  const handleUpdateArtwork = useCallback((newArtwork: any) => {
    setCurrentArtwork(newArtwork);
    saveToHistory(newArtwork);
    setActiveView('studio');
  }, [saveToHistory]);

  if (showIntro) {
    return <IntroLoader onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="h-screen w-full select-none overflow-hidden font-sans antialiased">
      <Toaster position="top-right" theme="dark" expand={true} richColors />
      <AnimatePresence>
        {isGenerating && <GenerationLoader prompt={currentPrompt} />}
      </AnimatePresence>

      <MainLayout
        activeView={activeView}
        onViewChange={setActiveView}
        isSidebarCollapsed={isSidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        artworkTitle={currentArtwork?.title}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
      >
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <HomeView 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating} 
                onGoToStudio={() => setActiveView('studio')}
              />
            </motion.div>
          )}

          {activeView === 'studio' && (
            <motion.div
              key="studio"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="h-full"
            >
              {currentArtwork ? (
                <UnifiedStudio 
                  artwork={currentArtwork} 
                  onUpdateSvg={handleUpdateSvg}
                  onUpdateArtwork={handleUpdateArtwork}
                  onBack={() => setActiveView('home')}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  <p className="text-white/40">No active design. Start a new one!</p>
                  <button 
                    onClick={() => setActiveView('home')}
                    className="mt-4 rounded-xl bg-blue-500 px-6 py-2 font-medium hover:bg-blue-600 transition-all"
                  >
                    New Design
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full"
            >
              <MasterpieceGallery 
                currentArtworkId={currentArtwork?.id || ''}
                onSelectArtwork={(art) => {
                  setCurrentArtwork(art);
                  saveToHistory(art);
                  setActiveView('studio');
                }} 
              />
            </motion.div>
          )}

          {activeView === 'encyclopedia' && (
            <motion.div key="encyclopedia" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="h-full">
              <EncyclopediaView />
            </motion.div>
          )}

          {activeView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full"
            >
              <HistoryView 
                currentArtworkId={currentArtwork?.id || ''}
                onSelectArtwork={(art) => {
                  setCurrentArtwork(art);
                  setActiveView('studio');
                }}
                onNewDesign={() => setActiveView('home')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </MainLayout>

      {/* Floating Keyboard Shortcut Trigger Indicator */}
      <div className="fixed bottom-3 right-3 z-30 flex items-center gap-1.5">
        <button
          onClick={() => setShowCommandPalette(true)}
          title="Open Command Palette (Ctrl+K)"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141414]/90 hover:bg-[#222222] border border-white/10 hover:border-white/30 text-white/60 hover:text-white rounded-lg text-xs font-mono shadow-xl backdrop-blur-md transition-all"
        >
          <Command size={12} className="text-[#00FF00]" />
          <span>Cmd+K</span>
        </button>

        <button
          onClick={() => setShowShortcutsModal(true)}
          title="Keyboard Shortcuts Guide (?)"
          className="flex items-center justify-center w-8 h-8 bg-[#141414]/90 hover:bg-[#222222] border border-white/10 hover:border-[#00FF00] text-white/60 hover:text-[#00FF00] rounded-lg text-xs font-mono font-bold shadow-xl backdrop-blur-md transition-all"
        >
          ?
        </button>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectView={setActiveView}
        onQuickGenerate={(prompt) => handleGenerate(prompt)}
        onDownloadSvg={handleDownloadCurrentSvg}
        onDownloadPng={() => handleDownloadCurrentPng(2)}
        onOpenExport={() => {
          setActiveView('studio');
          setShowCommandPalette(false);
        }}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        currentArtwork={currentArtwork}
      />

      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
