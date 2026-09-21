import { SafeSvg } from './SafeSvg';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  VectorArtwork,
  AnimationConfig,
  AnimationPresetId,
  AnimationLoopMode,
  LayerSpec,
} from '../types';
import {
  ANIMATION_PRESETS,
  ANIMATION_EASINGS,
  DEFAULT_ANIMATION_CONFIG,
  injectSvgAnimations,
  removeSvgAnimations,
  generateAnimatedReactComponent,
} from '../utils/svgAnimator';
import { renderSvgAnimationToGif } from '../utils/gifRenderer';
import { parseSvgLayers, downloadBlob } from '../utils/svgParser';
import { KeyframeTimeline } from './KeyframeTimeline';
import { AnimationSyncManager } from './AnimationSyncManager';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Download,
  Copy,
  Check,
  Layers,
  Sliders,
  Maximize2,
  RefreshCw,
  Gauge,
  Film,
  Flame,
  Radio,
  RotateCw,
  PenTool,
  Heart,
  Wind,
  Sun,
  Activity,
  ChevronRight,
  Eye,
  Settings2,
  Save,
  HelpCircle,
  Repeat,
  Waves,
  Loader2,
  Image as ImageIcon,
  Sparkle,
  ArrowDownUp,
  Cpu,
  Flame as FlameIcon,
  CheckCircle2,
  Link2
} from 'lucide-react';

interface AnimationStudioProps {
  artwork: VectorArtwork;
  onUpdateSvg: (newSvg: string) => void;
  onSwitchToCanvas: () => void;
}

export const AnimationStudio: React.FC<AnimationStudioProps> = ({
  artwork,
  onUpdateSvg,
  onSwitchToCanvas,
}) => {
  const [config, setConfig] = useState<AnimationConfig>(() => ({
    ...DEFAULT_ANIMATION_CONFIG,
    enabled: true,
  }));

  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'timeline' | 'sync' | 'code'>('presets');
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // GIF Rendering State
  const [isRenderingGif, setIsRenderingGif] = useState(false);
  const [gifProgress, setGifProgress] = useState(0);
  const [gifError, setGifError] = useState<string | null>(null);

  // Parse layers from current artwork
  const layers = useMemo<LayerSpec[]>(() => {
    return parseSvgLayers(artwork.svg);
  }, [artwork.svg]);

  // Compute live animated SVG string based on current config
  const animatedSvg = useMemo(() => {
    return injectSvgAnimations(artwork.svg, config);
  }, [artwork.svg, config]);

  // AUTO-BAKE ENGINE: Synchronize static CSS @keyframes directly into artwork when enabled
  useEffect(() => {
    if (config.autoBake && animatedSvg && animatedSvg !== artwork.svg) {
      onUpdateSvg(animatedSvg);
    }
  }, [config.autoBake, animatedSvg, artwork.svg, onUpdateSvg]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    setConfig((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  // Select Preset with Auto-Fill Defaults (Easing, Loop Mode, Duration, Speed, Trails)
  const handleSelectPreset = (presetId: AnimationPresetId) => {
    const presetMeta = ANIMATION_PRESETS.find((p) => p.id === presetId);
    const defaults = presetMeta?.defaults;

    setConfig((prev) => ({
      ...prev,
      preset: presetId,
      enabled: true,
      easing: defaults?.easing || prev.easing,
      loopMode: defaults?.loopMode || prev.loopMode,
      duration: defaults?.duration ?? (presetMeta ? presetMeta.recommendedDuration : prev.duration),
      speed: defaults?.speed ?? prev.speed,
      motionTrail: defaults?.motionTrail !== undefined ? defaults.motionTrail : prev.motionTrail,
      motionTrailCount: defaults?.motionTrailCount ?? prev.motionTrailCount,
      motionTrailOpacity: defaults?.motionTrailOpacity ?? prev.motionTrailOpacity,
      layerOverrides: {}, // reset granular overrides on global preset switch
    }));
  };

  // Update Global Settings
  const handleUpdateConfig = (partial: Partial<AnimationConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  // Update Layer Override
  const handleSetLayerAnimation = (layerName: string, type: AnimationPresetId | 'none', easing?: string) => {
    setConfig((prev) => ({
      ...prev,
      layerOverrides: {
        ...prev.layerOverrides,
        [layerName]: {
          type,
          duration: prev.duration,
          delay: 0,
          easing: easing || prev.easing,
        },
      },
    }));
  };

  // Apply and Bake into Artwork
  const handleBakeIntoArtwork = () => {
    onUpdateSvg(animatedSvg);
  };

  // Revert back to Static SVG
  const handleRevertStatic = () => {
    const clean = removeSvgAnimations(artwork.svg);
    setConfig((prev) => ({ ...prev, enabled: false, autoBake: false }));
    onUpdateSvg(clean);
  };

  // Export Standalone Animated SVG
  const handleDownloadAnimatedSvg = () => {
    const blob = new Blob([animatedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const filename = `${artwork.title.toLowerCase().replace(/\s+/g, '-')}-animated.svg`;
    downloadBlob(blob, filename);
  };

  // Render & Export Animated GIF
  const handleRenderGif = async () => {
    try {
      setIsRenderingGif(true);
      setGifProgress(5);
      setGifError(null);

      const cycleDuration = Math.max(1, Math.min(6, config.duration / (config.speed || 1)));

      const gifBlob = await renderSvgAnimationToGif(animatedSvg, {
        width: 500,
        height: 500,
        fps: 20,
        duration: cycleDuration,
        onProgress: (percent) => setGifProgress(percent),
      });

      const filename = `${artwork.title.toLowerCase().replace(/\s+/g, '-')}-animation.gif`;
      downloadBlob(gifBlob, filename);
    } catch (err: any) {
      console.error('GIF Rendering failed:', err);
      setGifError(err.message || 'Failed to encode GIF animation');
    } finally {
      setIsRenderingGif(false);
      setGifProgress(0);
    }
  };

  // Copy Animated React TSX
  const handleCopyReactComponent = () => {
    const tsxCode = generateAnimatedReactComponent(animatedSvg, artwork.title);
    navigator.clipboard.writeText(tsxCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // AI Smart Choreography
  const handleSmartChoreograph = async () => {
    setIsSynthesizing(true);
    try {
      // Analyze layers and assign complementary motions
      const newOverrides: Record<string, any> = {};
      const presetPool: AnimationPresetId[] = [
        'pulse-breath',
        'orbit-spin',
        'path-draw',
        'radar-sweep',
        'color-shimmer',
        'neon-flicker',
        'float-hover',
        'wiggle',
        'bounce',
      ];

      layers.forEach((l, i) => {
        const nameLower = l.name.toLowerCase();
        let assigned: AnimationPresetId = 'orbit-spin';

        if (nameLower.includes('bg') || nameLower.includes('back')) {
          assigned = 'pulse-breath';
        } else if (nameLower.includes('core') || nameLower.includes('art') || nameLower.includes('skull') || nameLower.includes('focal')) {
          assigned = 'float-hover';
        } else if (nameLower.includes('detail') || nameLower.includes('telemetry') || nameLower.includes('grid')) {
          assigned = 'path-draw';
        } else if (nameLower.includes('text') || nameLower.includes('head')) {
          assigned = 'color-shimmer';
        } else if (nameLower.includes('accent') || nameLower.includes('glow') || nameLower.includes('neon')) {
          assigned = 'neon-flicker';
        } else {
          assigned = presetPool[i % presetPool.length];
        }

        newOverrides[l.name] = {
          type: assigned,
          duration: Math.max(3, 5 + (i * 1.2)),
          delay: i * 0.2,
          easing: config.easing,
        };
      });

      setConfig((prev) => ({
        ...prev,
        enabled: true,
        preset: 'orchestrated-composite',
        duration: 7,
        speed: 1,
        layerOverrides: newOverrides,
      }));
    } finally {
      setTimeout(() => setIsSynthesizing(false), 500);
    }
  };

  // Helper to render preset icon
  const renderPresetIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Sparkle': return <Sparkle className={className} />;
      case 'ArrowDownUp': return <ArrowDownUp className={className} />;
      case 'PenTool': return <PenTool className={className} />;
      case 'RotateCw': return <RotateCw className={className} />;
      case 'RotateCcw': return <RotateCcw className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Wind': return <Wind className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Sun': return <Sun className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Eye': return <Eye className={className} />;
      case 'Waves': return <Waves className={className} />;
      case 'Sliders': return <Sliders className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Copy': return <Copy className={className} />;
      case 'Maximize2': return <Maximize2 className={className} />;
      default: return <Film className={className} />;
    }
  };

  const filteredPresets = useMemo(() => {
    if (presetCategoryFilter === 'all') return ANIMATION_PRESETS;
    return ANIMATION_PRESETS.filter((p) => p.category === presetCategoryFilter);
  }, [presetCategoryFilter]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#000000] text-[#FFFFFF] overflow-hidden font-mono antialiased">
      {/* Top Animation Control Header */}
      <div className="h-14 border-b border-[#222222] bg-[#0A0A0A] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-[#00FF00]/10 border border-[#00FF00]/40 flex items-center justify-center text-[#00FF00]">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider uppercase text-[#FFFFFF]">
                SVG Kinetic Animation Studio
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/40 font-bold uppercase">
                Standalone CSS
              </span>
              {config.autoBake && (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] bg-[#00FFFF]/20 text-[#00FFFF] border border-[#00FFFF]/40 font-bold uppercase animate-pulse">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Auto-Bake: ON
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#777777] hidden sm:block">
              Injects pure GPU-accelerated keyframe motion directly into your vector SVG DOM
            </p>
          </div>
        </div>

        {/* Playback & Quick Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Auto-Bake Toggle Button in Header */}
          <button
            onClick={() => handleUpdateConfig({ autoBake: !config.autoBake })}
            className={`px-2 md:px-2.5 py-1.5 border text-[11px] md:text-xs font-mono uppercase flex items-center gap-1 md:gap-1.5 transition-all shrink-0 ${
              config.autoBake
                ? 'bg-[#00FFFF]/15 text-[#00FFFF] border-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.25)]'
                : 'bg-[#141414] text-[#888888] border-[#333333] hover:text-[#FFFFFF]'
            }`}
            title="Automatically compiles and synchronizes animation CSS into canvas SVG state"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-Bake</span>
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-2.5 md:px-3 py-1.5 border text-[11px] md:text-xs font-mono uppercase flex items-center gap-1 md:gap-1.5 transition-all shrink-0 ${
              config.isPaused
                ? 'bg-[#141414] text-[#CCCCCC] border-[#444444] hover:text-[#FFFFFF]'
                : 'bg-[#00FF00] text-[#000000] border-[#00FF00] font-bold shadow-[0_0_10px_rgba(0,255,0,0.3)]'
            }`}
          >
            {config.isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            onClick={handleSmartChoreograph}
            disabled={isSynthesizing}
            title="AI Smart Choreography"
            className="px-2.5 md:px-3 py-1.5 bg-[#0D0D0D] border border-[#333333] hover:border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF]/10 text-[11px] md:text-xs uppercase flex items-center gap-1 md:gap-1.5 transition-all disabled:opacity-50 shrink-0"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Choreograph</span>
          </button>

          {/* Render as GIF Button */}
          <button
            onClick={handleRenderGif}
            disabled={isRenderingGif}
            title="Render and encode current SVG animation timeline into an animated GIF file"
            className="px-2.5 md:px-3 py-1.5 bg-[#FF0055]/10 hover:bg-[#FF0055]/20 border border-[#FF0055]/50 text-[#FF3377] text-[11px] md:text-xs uppercase flex items-center gap-1 md:gap-1.5 font-bold transition-all disabled:opacity-50 shrink-0"
          >
            {isRenderingGif ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{gifProgress > 0 ? `${gifProgress}%` : 'GIF...'}</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">GIF</span>
              </>
            )}
          </button>

          <div className="h-4 w-px bg-[#333333] mx-0.5 shrink-0" />

          <button
            onClick={handleBakeIntoArtwork}
            title="Bake animations into the current artwork"
            className="px-2.5 md:px-3 py-1.5 bg-[#141414] hover:bg-[#1A1A1A] border border-[#444444] hover:border-[#00FF00] text-[#FFFFFF] text-[11px] md:text-xs uppercase flex items-center gap-1 md:gap-1.5 transition-all shrink-0"
          >
            <Save className="w-3.5 h-3.5 text-[#00FF00]" />
            <span className="hidden lg:inline">Bake</span>
          </button>

          <button
            onClick={handleDownloadAnimatedSvg}
            title="Download animated standalone SVG"
            className="px-2.5 md:px-3 py-1.5 bg-[#00FF00]/10 hover:bg-[#00FF00]/20 border border-[#00FF00]/50 text-[#00FF00] text-[11px] md:text-xs uppercase flex items-center gap-1 md:gap-1.5 font-bold transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split: Left Interactive Canvas, Right Motion Controls */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Live Dynamic Viewport */}
        <div className="flex-1 flex flex-col bg-[#050505] border-r border-[#222222] relative overflow-hidden min-h-[260px]">
          {/* Viewport Top Bar Status */}
          <div className="h-9 bg-[#0A0A0A]/90 border-b border-[#222222] px-4 flex items-center justify-between text-[11px] text-[#777777] z-10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#CCCCCC]">
                <span className={`w-2 h-2 rounded-full ${config.isPaused ? 'bg-[#FFCC00]' : 'bg-[#00FF00] animate-pulse'}`} />
                {config.isPaused ? 'MOTION PAUSED' : 'LIVE 60FPS CSS PLAYBACK'}
              </span>
              <span>•</span>
              <span>Preset: <strong className="text-[#00FF00] uppercase">{config.preset}</strong></span>
              <span>•</span>
              <span>Loop: <strong className="text-[#00FFFF] uppercase">{config.loopMode}</strong></span>
              <span>•</span>
              <span>Easing: <strong className="text-[#FFFFFF] uppercase">{config.easing.split('(')[0]}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelper(!showHelper)}
                className="text-[#666666] hover:text-[#FFFFFF] flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Info</span>
              </button>
              <button
                onClick={handleRevertStatic}
                className="text-[#888888] hover:text-[#FF3333] transition-colors text-[10px] uppercase ml-2"
              >
                Revert Static
              </button>
            </div>
          </div>

          {/* Canvas Rendering Area */}
          <div className="flex-1 relative flex items-center justify-center p-4 lg:p-8 overflow-hidden select-none">
            {/* Ambient Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #333333 1px, transparent 1px),
                  linear-gradient(to bottom, #333333 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Active Rendered Animated SVG Container */}
            <div
              className="w-full max-w-[560px] aspect-square flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#222222] bg-[#0A0A0A] p-2"
            >
              <SafeSvg
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full"
                svg={animatedSvg}
              />

              {/* GIF Encoding Overlay Indicator */}
              {isRenderingGif && (
                <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#FF0055] border-t-transparent animate-spin mb-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFFFFF] mb-1">
                    Rendering & Encoding Animated GIF
                  </h3>
                  <p className="text-xs text-[#AAAAAA] mb-4">
                    Capturing high-fidelity 60FPS timeline keyframe slices...
                  </p>
                  <div className="w-48 bg-[#222222] h-2 rounded-full overflow-hidden border border-[#333333]">
                    <div
                      className="bg-gradient-to-r from-[#FF0055] to-[#00FF00] h-full transition-all duration-200"
                      style={{ width: `${gifProgress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#00FF00] mt-2 font-bold">{gifProgress}%</span>
                </div>
              )}
            </div>

            {/* Helper Drawer Info */}
            <AnimatePresence>
              {showHelper && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-4 left-4 right-4 max-w-lg bg-[#0F0F0F]/95 border border-[#333333] p-3 text-xs text-[#AAAAAA] backdrop-blur-md z-20 shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#00FF00] uppercase">How VECTORA SVG Animation Works</span>
                    <button onClick={() => setShowHelper(false)} className="text-[#666666] hover:text-[#FFFFFF]">✕</button>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    VECTORA compiles motion parameters into pure, GPU-accelerated CSS keyframes embedded directly in the SVG's <code>&lt;style&gt;</code> block. When exported, the file animates natively across web pages, browsers, Figma, and apps without requiring any external JavaScript runtime.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* VISUAL KEYFRAME TIMELINE BAR */}
          <KeyframeTimeline
            config={config}
            onChangeConfig={handleUpdateConfig}
            onTogglePlay={handleTogglePlay}
          />
        </div>

        {/* Right Side: Motion Control Panel */}
        <div className="w-full h-[45vh] lg:h-full lg:w-96 xl:w-[440px] bg-[#0D0D0D] flex flex-col shrink-0 overflow-hidden border-t lg:border-t-0 lg:border-l border-[#222222]">
          {/* Sub-Tabs Selector */}
          <div className="h-11 bg-[#0A0A0A] border-b border-[#222222] px-3 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveSubTab('presets')}
              className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'presets'
                  ? 'border-[#00FF00] text-[#00FF00] font-bold'
                  : 'border-transparent text-[#777777] hover:text-[#CCCCCC]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Presets</span>
            </button>

            <button
              onClick={() => setActiveSubTab('timeline')}
              className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'timeline'
                  ? 'border-[#00FF00] text-[#00FF00] font-bold'
                  : 'border-transparent text-[#777777] hover:text-[#CCCCCC]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Timeline & Easing</span>
              {Object.keys(config.layerOverrides).length > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" />
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('sync')}
              className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'sync'
                  ? 'border-[#00FF00] text-[#00FF00] font-bold'
                  : 'border-transparent text-[#777777] hover:text-[#CCCCCC]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Sync</span>
              {(config.syncGroups?.length || 0) > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]" />
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('code')}
              className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeSubTab === 'code'
                  ? 'border-[#00FF00] text-[#00FF00] font-bold'
                  : 'border-transparent text-[#777777] hover:text-[#CCCCCC]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Physics & Bake</span>
            </button>
          </div>

          {/* Sub-Tab 1: Motion Presets Catalog */}
          {activeSubTab === 'presets' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              <div className="flex items-center justify-between pb-1 border-b border-[#222222]">
                <span className="text-[11px] uppercase tracking-wider text-[#888888]">Animation Preset Library</span>
                <span className="text-[10px] text-[#00FF00] font-bold">{ANIMATION_PRESETS.length} EFFECTS</span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'Reveal & Draw', label: 'Reveal & Draw' },
                  { id: 'Morph & Transform', label: 'Morph & Warp' },
                  { id: 'Particle & Emission', label: 'Particles' },
                  { id: 'Color & Gradient', label: 'Color & Glitch' },
                  { id: 'Kinetic & Physics', label: 'Kinetic & Physics' },
                  { id: 'Advanced Cinematic', label: 'Cinematic' },
                  { id: 'Standard Essentials', label: 'Essentials' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setPresetCategoryFilter(cat.id)}
                    className={`px-2 py-1 text-[10px] uppercase font-mono border transition-colors ${
                      presetCategoryFilter === cat.id
                        ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]'
                        : 'bg-[#141414] text-[#777777] border-[#2A2A2A] hover:text-[#FFFFFF]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Presets List */}
              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {filteredPresets.map((preset) => {
                  const isSelected = config.preset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-3 border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#00FF00]/10 border-[#00FF00] shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                          : 'bg-[#121212] border-[#262626] hover:border-[#444444] hover:bg-[#161616]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-sm flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#00FF00] text-[#000000]'
                                : 'bg-[#1C1C1C] text-[#AAAAAA]'
                            }`}
                          >
                            {renderPresetIcon(preset.icon)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-[#00FF00]' : 'text-[#FFFFFF]'}`}>
                                {preset.name}
                              </h3>
                              {preset.category === 'Standard Essentials' && (
                                <span className="text-[8px] px-1 bg-[#222222] text-[#00FF00] border border-[#333333]">
                                  Quick Preset
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#777777]">{preset.tagline}</p>
                          </div>
                        </div>

                        <span className="px-1.5 py-0.5 text-[9px] bg-[#1A1A1A] border border-[#333333] text-[#888888]">
                          {preset.recommendedDuration}s cycle
                        </span>
                      </div>

                      <p className="mt-2 text-[11px] text-[#999999] leading-relaxed">
                        {preset.description}
                      </p>

                      {(preset as any).trick && (
                        <div className="mt-2 px-2 py-1 bg-[#00FFFF]/5 border border-[#00FFFF]/20 text-[10px] text-[#00FFFF] flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-[#00FFFF] shrink-0" />
                          <span className="font-mono">Trick: {(preset as any).trick}</span>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-[#222222] flex items-center justify-between text-[10px] text-[#666666]">
                        <span>Best for: <strong className="text-[#AAAAAA]">{preset.bestFor}</strong></span>
                        {isSelected && <span className="text-[#00FF00] font-bold">● ACTIVE</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Layer-by-Layer Timeline & Easing Functions */}
          {activeSubTab === 'timeline' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="flex items-center justify-between pb-1 border-b border-[#222222]">
                <span className="text-[11px] uppercase tracking-wider text-[#888888]">Granular Timeline & Easing</span>
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, layerOverrides: {} }))}
                  className="text-[10px] text-[#888888] hover:text-[#FFFFFF] uppercase"
                >
                  Reset Overrides
                </button>
              </div>

              {/* Master Global CSS Easing Dropdown */}
              <div className="p-3 bg-[#141414] border border-[#2D2D2D] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#00FF00] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Global Keyframe Easing Function
                  </span>
                </div>
                <p className="text-[10px] text-[#777777]">
                  Applies mathematical acceleration curves to all transitions across the animation timeline.
                </p>
                <select
                  value={config.easing}
                  onChange={(e) => handleUpdateConfig({ easing: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] text-xs px-2.5 py-1.5 text-[#00FF00] font-mono outline-none"
                >
                  <optgroup label="Standard Curves">
                    <option value="ease-in-out">ease-in-out (Smooth Harmonic)</option>
                    <option value="linear">linear (Uniform Mechanical)</option>
                    <option value="ease">ease (Natural Start)</option>
                    <option value="ease-in">ease-in (Accelerate)</option>
                    <option value="ease-out">ease-out (Decelerate)</option>
                  </optgroup>
                  <optgroup label="Stepped & Retro">
                    <option value="step-start">step-start (Immediate Phase Jump)</option>
                    <option value="step-end">step-end (Delayed Phase Jump)</option>
                    <option value="steps(4, end)">steps(4, end) (4-Frame 8-Bit Stop Motion)</option>
                    <option value="steps(8, end)">steps(8, end) (8-Frame Chunky Jitter)</option>
                  </optgroup>
                  <optgroup label="Cubic Bezier Physics">
                    <option value="cubic-bezier(0.16, 1, 0.3, 1)">cubic-bezier(0.16, 1, 0.3, 1) - Snappy Elastic Expo</option>
                    <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">cubic-bezier(0.34, 1.56, 0.64, 1) - Overshoot Rubber Bounce</option>
                    <option value="cubic-bezier(0.7, 0, 0.3, 1)">cubic-bezier(0.7, 0, 0.3, 1) - Dramatic Cinematic Ease</option>
                    <option value="cubic-bezier(0.25, 0.1, 0.25, 1)">cubic-bezier(0.25, 0.1, 0.25, 1) - Swift Fluid Pulse</option>
                    <option value="cubic-bezier(0.87, 0, 0.13, 1)">cubic-bezier(0.87, 0, 0.13, 1) - Cybernetic High-Speed Surge</option>
                  </optgroup>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#888888] uppercase">
                  <span>Layer Nodes ({layers.length})</span>
                  <span>Target Override</span>
                </div>

                {layers.map((layer, index) => {
                  const currentOverride = config.layerOverrides[layer.name];

                  return (
                    <div
                      key={layer.name}
                      className="p-3 bg-[#121212] border border-[#262626] hover:border-[#383838] transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#666666] font-mono">#{index + 1}</span>
                          <span className="text-xs font-bold text-[#FFFFFF]">{layer.name}</span>
                          <span className="text-[9px] px-1 bg-[#1C1C1C] text-[#777777] border border-[#2D2D2D]">
                            {layer.elementCount} nodes
                          </span>
                        </div>
                      </div>

                      {/* Dropdown for Layer Animation Preset */}
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#777777] uppercase shrink-0 w-12">Motion:</span>
                          <select
                            value={currentOverride ? currentOverride.type : 'inherit'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'inherit') {
                                const next = { ...config.layerOverrides };
                                delete next[layer.name];
                                setConfig((prev) => ({ ...prev, layerOverrides: next }));
                              } else {
                                handleSetLayerAnimation(layer.name, val as AnimationPresetId | 'none');
                              }
                            }}
                            className="flex-1 bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] text-xs px-2 py-1 text-[#CCCCCC] font-mono outline-none"
                          >
                            <option value="inherit">Inherit Global ({config.preset})</option>
                            <option value="none">None (Static)</option>
                            <option value="pulse-breath">Pulse & Breathing</option>
                            <option value="orbit-spin">Rotate & Spin</option>
                            <option value="wiggle">Wiggle & Jitter</option>
                            <option value="bounce">Bounce & Rebound</option>
                            <option value="path-draw">Laser Path Trace</option>
                            <option value="radar-sweep">Radar Telemetry Beam</option>
                            <option value="float-hover">Cinematic Levitation</option>
                            <option value="glitch-surge">Glitch Matrix Surge</option>
                            <option value="color-shimmer">Color Wave Shimmer</option>
                            <option value="neon-flicker">Neon Strobe & Flicker</option>
                            <option value="wave-oscillate">Morphing Wave Oscillation</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Animation Sync Groups */}
          {activeSubTab === 'sync' && (
            <AnimationSyncManager
              layers={layers}
              config={config}
              onChangeConfig={handleUpdateConfig}
            />
          )}

          {/* Sub-Tab 4: Parametric Motion Tuning, Loops & Motion Trail */}
          {activeSubTab === 'code' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-5 custom-scrollbar">
              <div className="flex items-center justify-between pb-1 border-b border-[#222222]">
                <span className="text-[11px] uppercase tracking-wider text-[#888888]">Motion Physics & Auto-Bake</span>
                <span className="text-[10px] text-[#00FF00]">REAL-TIME SYNC</span>
              </div>

              {/* AUTO-BAKE TOGGLE */}
              <div className="p-3 bg-[#141414] border border-[#2D2D2D] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#00FFFF]" />
                    <span className="text-xs font-bold uppercase text-[#FFFFFF]">Auto-Bake Static CSS</span>
                  </div>

                  <button
                    onClick={() => handleUpdateConfig({ autoBake: !config.autoBake })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      config.autoBake ? 'bg-[#00FFFF]' : 'bg-[#333333]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#000000] transition-transform ${
                        config.autoBake ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-[10px] text-[#777777] leading-relaxed">
                  Converts high-level animation parameters and timeline keyframes directly into static CSS <code>@keyframes</code> and <code>class</code> attributes baked into the master SVG document.
                </p>
              </div>

              {/* GLOBAL ANIMATION LOOP SETTING */}
              <div className="p-3 bg-[#141414] border border-[#2D2D2D] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#00FFFF] flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5" />
                    Global Animation Loop Mode
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#00FFFF]/10 border border-[#00FFFF]/30 text-[#00FFFF] font-bold uppercase">
                    {config.loopMode}
                  </span>
                </div>
                <p className="text-[10px] text-[#777777]">
                  Controls the playback cycle behavior of the generated SVG keyframes.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'infinite', label: 'Infinite', desc: 'Seamless continuous loop' },
                    { id: 'once', label: 'Once', desc: 'Play 1 cycle and stop' },
                    { id: 'alternate', label: 'Alternate', desc: 'Ping-pong forward & back' },
                  ].map((mode) => {
                    const isSelected = config.loopMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleUpdateConfig({ loopMode: mode.id as AnimationLoopMode })}
                        className={`p-2 border text-center transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-[#00FFFF]/15 border-[#00FFFF] text-[#00FFFF] font-bold shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                            : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#888888] hover:text-[#FFFFFF]'
                        }`}
                      >
                        <span className="text-xs uppercase">{mode.label}</span>
                        <span className="text-[9px] text-[#666666] mt-0.5">{mode.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MOTION TRAIL TOGGLE & PARAMETERS */}
              <div className="p-3 bg-[#141414] border border-[#2D2D2D] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-[#00FF00]" />
                    <span className="text-xs font-bold uppercase text-[#FFFFFF]">Motion Trail & Blur Effect</span>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleUpdateConfig({ motionTrail: !config.motionTrail })}
                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                      config.motionTrail ? 'bg-[#00FF00]' : 'bg-[#333333]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-[#000000] transition-transform ${
                        config.motionTrail ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-[10px] text-[#777777] leading-relaxed">
                  Automatically clones animated SVG paths with staggered phase offsets and opacity decay to simulate fluid cinematic motion blur.
                </p>

                {config.motionTrail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2 border-t border-[#262626]"
                  >
                    {/* Clones Count */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#AAAAAA]">Trail Echo Density</span>
                        <span className="text-[#00FF00] font-bold">{config.motionTrailCount} clones</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={config.motionTrailCount}
                        onChange={(e) => handleUpdateConfig({ motionTrailCount: parseInt(e.target.value) })}
                        className="w-full accent-[#00FF00] bg-[#222222] h-1.5 cursor-pointer"
                      />
                    </div>

                    {/* Base Opacity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#AAAAAA]">Trail Opacity Falloff</span>
                        <span className="text-[#00FF00] font-bold">{Math.round(config.motionTrailOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={0.8}
                        step={0.05}
                        value={config.motionTrailOpacity}
                        onChange={(e) => handleUpdateConfig({ motionTrailOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-[#00FF00] bg-[#222222] h-1.5 cursor-pointer"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Base Duration Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#AAAAAA] uppercase">Cycle Duration</span>
                  <span className="text-[#00FF00] font-bold">{config.duration}s</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={0.5}
                  value={config.duration}
                  onChange={(e) => handleUpdateConfig({ duration: parseFloat(e.target.value) })}
                  className="w-full accent-[#00FF00] bg-[#222222] h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-[#555555]">
                  <span>1s (Ultra Fast)</span>
                  <span>12s</span>
                  <span>24s (Slow Ambient)</span>
                </div>
              </div>

              {/* Info Card */}
              <div className="p-3 bg-[#141414] border border-[#262626] text-xs text-[#888888] space-y-1">
                <div className="font-bold text-[#FFFFFF] uppercase text-[11px]">Zero-Dependency Guarantee</div>
                <p className="text-[11px] leading-relaxed">
                  All animations compile into clean W3C CSS3 Keyframe specifications inside the SVG. You can embed the downloaded SVG file into HTML, Figma, Android/iOS vector drawables, and video editors without running external scripts.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

