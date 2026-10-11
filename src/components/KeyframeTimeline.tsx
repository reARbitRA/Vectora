import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { KeyframeNode, AnimationConfig, LayerSpec, KeyframeTransform } from '../types';
import {
  Play,
  Pause,
  Plus,
  RotateCcw,
  Trash2,
  Sliders,
  Clock,
  Sparkles,
  Zap,
  Split,
  ChevronRight,
  ChevronLeft,
  Layers,
  Repeat,
  Gauge,
  Activity,
  Move,
  RotateCw,
  Eye,
  Maximize2,
  Percent
} from 'lucide-react';

interface KeyframeTimelineProps {
  config: AnimationConfig;
  layers?: LayerSpec[];
  onChangeConfig: (partial: Partial<AnimationConfig>) => void;
  onTogglePlay: () => void;
}

const ACTION_PRESETS: { id: string; label: string; transform: KeyframeTransform }[] = [
  {
    id: 'scale-pulse',
    label: 'Scale Surge',
    transform: { scale: 1.25, rotate: 0, translateX: 0, translateY: 0, opacity: 1, skewX: 0 },
  },
  {
    id: 'rotate-spin',
    label: 'Rotate Spin',
    transform: { scale: 1, rotate: 90, translateX: 0, translateY: 0, opacity: 1, skewX: 0 },
  },
  {
    id: 'levitate-float',
    label: 'Float Drift',
    transform: { scale: 1.05, rotate: -8, translateX: 0, translateY: -25, opacity: 0.95, skewX: 0 },
  },
  {
    id: 'shake-glitch',
    label: 'Glitch Shift',
    transform: { scale: 1.08, rotate: 12, translateX: 18, translateY: -6, opacity: 0.85, skewX: 12 },
  },
  {
    id: 'fade-veil',
    label: 'Veil Fade',
    transform: { scale: 0.95, rotate: 0, translateX: 0, translateY: 0, opacity: 0.35, skewX: 0 },
  },
  {
    id: 'reset-origin',
    label: 'Origin Rest',
    transform: { scale: 1, rotate: 0, translateX: 0, translateY: 0, opacity: 1, skewX: 0 },
  },
];

export const KeyframeTimeline: React.FC<KeyframeTimelineProps> = ({
  config,
  layers = [],
  onChangeConfig,
  onTogglePlay,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>('kf-0');
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [currentTimePercent, setCurrentTimePercent] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const durationSec = Math.max(0.5, config.duration / (config.speed || 1));
  const keyframes: KeyframeNode[] = useMemo(() => {
    if (config.keyframes && config.keyframes.length > 0) {
      return config.keyframes;
    }
    return [
      {
        id: 'kf-0',
        percentage: 0,
        label: '0% Start Anchor',
        isRemovable: false,
        action: 'Origin Rest',
        transform: { scale: 1, rotate: 0, translateX: 0, translateY: 0, opacity: 1, skewX: 0 },
      },
      {
        id: 'kf-25',
        percentage: 25,
        label: '25% Build Wave',
        isRemovable: true,
        action: 'Float Drift',
        transform: { scale: 1.08, rotate: 12, translateX: 10, translateY: -10, opacity: 0.95, skewX: 0 },
      },
      {
        id: 'kf-50',
        percentage: 50,
        label: '50% Peak Surge',
        isRemovable: true,
        action: 'Scale Surge',
        transform: { scale: 1.2, rotate: -15, translateX: -10, translateY: -22, opacity: 1, skewX: -5 },
      },
      {
        id: 'kf-75',
        percentage: 75,
        label: '75% Settle Glide',
        isRemovable: true,
        action: 'Glitch Shift',
        transform: { scale: 1.05, rotate: 6, translateX: 6, translateY: -8, opacity: 0.9, skewX: 2 },
      },
      {
        id: 'kf-100',
        percentage: 100,
        label: '100% Loop Return',
        isRemovable: false,
        action: 'Origin Rest',
        transform: { scale: 1, rotate: 0, translateX: 0, translateY: 0, opacity: 1, skewX: 0 },
      },
    ];
  }, [config.keyframes]);

  // Live playhead animation loop
  useEffect(() => {
    if (config.isPaused || isScrubbing) return;

    let animFrameId: number;
    let startTime = performance.now();
    const cycleMs = durationSec * 1000;

    const tick = (now: number) => {
      const elapsed = (now - startTime) % cycleMs;
      const progress = (elapsed / cycleMs) * 100;
      setCurrentTimePercent(progress);
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [config.isPaused, isScrubbing, durationSec]);

  // Convert mouse X to track percentage
  const getPercentFromEvent = useCallback((e: MouseEvent | React.MouseEvent): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    return Math.round((x / rect.width) * 100);
  }, []);

  // Handle Dragging Keyframe Nodes
  useEffect(() => {
    if (!isDraggingNode) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPercent = getPercentFromEvent(e);
      const updated = keyframes.map((kf) => {
        if (kf.id === isDraggingNode) {
          const clamped =
            kf.isRemovable === false
              ? kf.percentage
              : Math.max(1, Math.min(99, newPercent));
          return { ...kf, percentage: clamped };
        }
        return kf;
      });
      onChangeConfig({ keyframes: updated });
    };

    const handleMouseUp = () => {
      setIsDraggingNode(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingNode, keyframes, getPercentFromEvent, onChangeConfig]);

  // Handle Track Click to Scrub or Select Keyframe
  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-keyframe-node]')) return;

    const percent = getPercentFromEvent(e);
    setCurrentTimePercent(percent);
    setIsScrubbing(true);

    const nearby = keyframes.find((k) => Math.abs(k.percentage - percent) < 4);
    if (nearby) {
      setSelectedKeyframeId(nearby.id);
    }

    const onScrubMove = (moveEvt: MouseEvent) => {
      const p = getPercentFromEvent(moveEvt);
      setCurrentTimePercent(p);
    };

    const onScrubUp = () => {
      setIsScrubbing(false);
      window.removeEventListener('mousemove', onScrubMove);
      window.removeEventListener('mouseup', onScrubUp);
    };

    window.addEventListener('mousemove', onScrubMove);
    window.addEventListener('mouseup', onScrubUp);
  };

  // Add new keyframe node at current playhead position with interpolated values
  const handleAddKeyframe = (percentOverride?: number) => {
    const targetPercent = percentOverride !== undefined ? percentOverride : Math.round(currentTimePercent);
    const id = `kf-${Date.now()}`;

    // Interpolate transform between surrounding keys
    const sorted = [...keyframes].sort((a, b) => a.percentage - b.percentage);
    const prev = [...sorted].reverse().find((k) => k.percentage <= targetPercent) || sorted[0];
    const next = sorted.find((k) => k.percentage >= targetPercent) || sorted[sorted.length - 1];

    const span = Math.max(1, (next?.percentage || 100) - (prev?.percentage || 0));
    const factor = Math.max(0, Math.min(1, (targetPercent - (prev?.percentage || 0)) / span));

    const pT = prev?.transform || { scale: 1, rotate: 0, translateX: 0, translateY: 0, opacity: 1, skewX: 0 };
    const nT = next?.transform || { scale: 1, rotate: 0, translateX: 0, translateY: 0, opacity: 1, skewX: 0 };

    const interpolatedTransform: KeyframeTransform = {
      scale: Number(((pT.scale ?? 1) + ((nT.scale ?? 1) - (pT.scale ?? 1)) * factor).toFixed(2)),
      rotate: Math.round((pT.rotate ?? 0) + ((nT.rotate ?? 0) - (pT.rotate ?? 0)) * factor),
      translateX: Math.round((pT.translateX ?? 0) + ((nT.translateX ?? 0) - (pT.translateX ?? 0)) * factor),
      translateY: Math.round((pT.translateY ?? 0) + ((nT.translateY ?? 0) - (pT.translateY ?? 0)) * factor),
      opacity: Number(((pT.opacity ?? 1) + ((nT.opacity ?? 1) - (pT.opacity ?? 1)) * factor).toFixed(2)),
      skewX: Math.round((pT.skewX ?? 0) + ((nT.skewX ?? 0) - (pT.skewX ?? 0)) * factor),
    };

    const newKeyframe: KeyframeNode = {
      id,
      percentage: Math.max(1, Math.min(99, targetPercent)),
      label: `${targetPercent}% Step`,
      action: 'Custom Step',
      isRemovable: true,
      transform: interpolatedTransform,
    };

    const updated = [...keyframes, newKeyframe].sort((a, b) => a.percentage - b.percentage);
    onChangeConfig({ keyframes: updated, preset: 'custom-timeline' });
    setSelectedKeyframeId(id);
  };

  // Remove Keyframe
  const handleDeleteKeyframe = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = keyframes.find((k) => k.id === id);
    if (!target || target.isRemovable === false) return;

    const updated = keyframes.filter((k) => k.id !== id);
    onChangeConfig({ keyframes: updated });
    if (selectedKeyframeId === id) {
      setSelectedKeyframeId(updated[0]?.id || null);
    }
  };

  // Step to Next / Previous Keyframe
  const handleStepKeyframe = (direction: 'prev' | 'next') => {
    const sorted = [...keyframes].sort((a, b) => a.percentage - b.percentage);
    if (direction === 'prev') {
      const prevKeys = sorted.filter((k) => k.percentage < currentTimePercent - 0.5);
      const target = prevKeys[prevKeys.length - 1] || sorted[0];
      if (target) {
        setCurrentTimePercent(target.percentage);
        setSelectedKeyframeId(target.id);
      }
    } else {
      const nextKeys = sorted.filter((k) => k.percentage > currentTimePercent + 0.5);
      const target = nextKeys[0] || sorted[sorted.length - 1];
      if (target) {
        setCurrentTimePercent(target.percentage);
        setSelectedKeyframeId(target.id);
      }
    }
  };

  // Distribute keyframes evenly across timeline
  const handleDistributeEvenly = () => {
    if (keyframes.length <= 2) return;
    const count = keyframes.length;
    const step = 100 / (count - 1);

    const updated = keyframes.map((kf, idx) => ({
      ...kf,
      percentage: Math.round(idx * step),
    }));

    onChangeConfig({ keyframes: updated });
  };

  // Reset to 5-point default keyframes
  const handleResetKeyframes = () => {
    onChangeConfig({
      keyframes: [
        { id: 'kf-0', percentage: 0, label: '0% Start Anchor', isRemovable: false, action: 'Origin Rest', transform: { scale: 1, rotate: 0, translateX: 0, translateY: 0, opacity: 1, skewX: 0 } },
        { id: 'kf-25', percentage: 25, label: '25% Build Wave', isRemovable: true, action: 'Float Drift', transform: { scale: 1.08, rotate: 12, translateX: 10, translateY: -10, opacity: 0.95, skewX: 0 } },
        { id: 'kf-50', percentage: 50, label: '50% Peak Surge', isRemovable: true, action: 'Scale Surge', transform: { scale: 1.2, rotate: -15, translateX: -10, translateY: -22, opacity: 1, skewX: -5 } },
        { id: 'kf-75', percentage: 75, label: '75% Settle Glide', isRemovable: true, action: 'Glitch Shift', transform: { scale: 1.05, rotate: 6, translateX: 6, translateY: -8, opacity: 0.9, skewX: 2 } },
        { id: 'kf-100', percentage: 100, label: '100% Loop Return', isRemovable: false, action: 'Origin Rest', transform: { scale: 1, rotate: 0, translateX: 0, translateY: 0, opacity: 1, skewX: 0 } },
      ],
      preset: 'custom-timeline',
    });
  };

  // Update selected keyframe's properties
  const handleUpdateSelectedKeyframe = (partial: Partial<KeyframeNode>) => {
    if (!selectedKeyframeId) return;
    const updated = keyframes.map((k) => {
      if (k.id === selectedKeyframeId) {
        return {
          ...k,
          ...partial,
          transform: {
            ...(k.transform || {}),
            ...(partial.transform || {}),
          },
        };
      }
      return k;
    });
    onChangeConfig({ keyframes: updated, preset: 'custom-timeline' });
  };

  // Apply Action Preset to selected keyframe
  const handleApplyActionPreset = (actionId: string) => {
    const preset = ACTION_PRESETS.find((p) => p.id === actionId);
    if (!preset) return;
    handleUpdateSelectedKeyframe({
      action: preset.label,
      transform: { ...preset.transform },
    });
  };

  const selectedNode = keyframes.find((k) => k.id === selectedKeyframeId) || keyframes[0];
  const currentTimeSec = ((currentTimePercent / 100) * durationSec).toFixed(2);

  // Generate SVG spline points connecting all keyframes across the track
  const splinePath = useMemo(() => {
    if (keyframes.length < 2) return '';
    const sorted = [...keyframes].sort((a, b) => a.percentage - b.percentage);
    // Base height 48px, mid 24px
    const points = sorted.map((k) => {
      const x = k.percentage; // in %
      const scale = k.transform?.scale ?? 1;
      const y = Math.max(4, Math.min(44, 24 - (scale - 1) * 40));
      return { x, y };
    });

    let d = `M ${points[0].x}% ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX}% ${p0.y}, ${midX}% ${p1.y}, ${p1.x}% ${p1.y}`;
    }
    return d;
  }, [keyframes]);

  return (
    <div className="bg-[#0A0A0A] border-t border-[#1F1F1F] text-[#CCCCCC] font-mono select-none flex flex-col shrink-0">
      {/* 1. Timeline Controls Header */}
      <div className="px-3 py-2 bg-[#0E0E0E] border-b border-[#1A1A1A] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Transport controls & Timecode */}
        <div className="flex items-center gap-2">
          {/* Play / Pause button */}
          <button
            onClick={onTogglePlay}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
              config.isPaused
                ? 'bg-[#181818] border-[#333333] text-[#FFFFFF] hover:border-[#00FF00]'
                : 'bg-[#00FF00] border-[#00FF00] text-[#000000] shadow-[0_0_12px_rgba(0,255,0,0.4)]'
            }`}
            title={config.isPaused ? 'Play Timeline (Space)' : 'Pause Timeline (Space)'}
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

          {/* Step Back / Forward Keys */}
          <div className="flex items-center border border-[#262626] bg-[#141414]">
            <button
              onClick={() => handleStepKeyframe('prev')}
              className="p-1.5 text-[#777777] hover:text-[#FFFFFF] hover:bg-[#222222]"
              title="Previous Keyframe"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleStepKeyframe('next')}
              className="p-1.5 text-[#777777] hover:text-[#FFFFFF] hover:bg-[#222222]"
              title="Next Keyframe"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timecode readout */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121212] border border-[#242424] text-[11px] tabular-nums">
            <Clock className="w-3 h-3 text-[#00FF00]" />
            <span className="text-[#00FF00] font-bold">{currentTimeSec}s</span>
            <span className="text-[#444444]">/</span>
            <span className="text-[#888888]">{durationSec.toFixed(2)}s</span>
            <span className="text-[#555555] text-[10px]">({Math.round(currentTimePercent)}%)</span>
          </div>

          {/* Speed multiplier toggle */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] bg-[#121212] border border-[#242424] px-2 py-0.5">
            <Gauge className="w-3 h-3 text-[#00FFFF]" />
            <span className="text-[#666666]">Speed:</span>
            {[0.5, 1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeConfig({ speed: spd })}
                className={`px-1 py-0.2 ${
                  (config.speed || 1) === spd
                    ? 'text-[#00FFFF] font-bold bg-[#1A1A1A]'
                    : 'text-[#666666] hover:text-[#AAAAAA]'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Keyframe Tools & Mode Badges */}
        <div className="flex items-center gap-1.5">
          {/* Add Keyframe Button */}
          <button
            onClick={() => handleAddKeyframe()}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#181818] hover:bg-[#222222] text-[#00FF00] border border-[#333333] hover:border-[#00FF00]/50 text-[10px] font-bold uppercase transition-all"
            title="Add keyframe with interpolated values at playhead position"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Key</span>
          </button>

          {/* Distribute Evenly */}
          <button
            onClick={handleDistributeEvenly}
            className="flex items-center gap-1 px-2 py-1.5 bg-[#141414] hover:bg-[#1E1E1E] text-[#888888] hover:text-[#FFFFFF] border border-[#242424] text-[10px] font-bold uppercase transition-colors"
            title="Distribute active keyframes evenly between 0% and 100%"
          >
            <Split className="w-3 h-3" />
            <span className="hidden md:inline">Distribute</span>
          </button>

          {/* Reset Keyframes */}
          <button
            onClick={handleResetKeyframes}
            className="p-1.5 text-[#666666] hover:text-[#FFFFFF] hover:bg-[#1C1C1C] border border-[#242424]"
            title="Reset to 5-point standard dynamic keyframe track"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Visual Track Bar with Spline Connectors */}
      <div className="relative px-3 pt-5 pb-3 bg-[#0B0B0B]">
        {/* Time Tick Ruler */}
        <div className="flex justify-between text-[9px] text-[#555555] font-mono pointer-events-none mb-1 px-1">
          <span>0.00s (0%)</span>
          <span className="hidden sm:inline">{(durationSec * 0.25).toFixed(2)}s (25%)</span>
          <span>{(durationSec * 0.5).toFixed(2)}s (50%)</span>
          <span className="hidden sm:inline">{(durationSec * 0.75).toFixed(2)}s (75%)</span>
          <span>{durationSec.toFixed(2)}s (100%)</span>
        </div>

        {/* Ruler Tick Marks */}
        <div className="h-1.5 flex justify-between px-1 pointer-events-none mb-1">
          {Array.from({ length: 41 }).map((_, i) => (
            <div
              key={i}
              className={`w-[1px] ${
                i % 10 === 0 ? 'h-2 bg-[#555555]' : i % 5 === 0 ? 'h-1.5 bg-[#333333]' : 'h-1 bg-[#1E1E1E]'
              }`}
            />
          ))}
        </div>

        {/* Main Track Container */}
        <div
          ref={trackRef}
          onMouseDown={handleTrackMouseDown}
          className="relative h-12 bg-[#111111] border border-[#262626] hover:border-[#383838] cursor-pointer rounded-none overflow-visible flex items-center transition-colors shadow-inner"
        >
          {/* Active progress elapsed backdrop */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#00FF00]/5 border-r border-[#00FF00]/25 pointer-events-none"
            style={{ width: `${currentTimePercent}%` }}
          />

          {/* SVG Connecting Spline Curve across all keyframes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="splineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00FF00" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#00FFFF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#00FF00" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {splinePath && (
              <path
                d={splinePath}
                fill="none"
                stroke="url(#splineGradient)"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            )}
          </svg>

          {/* Keyframe Diamond Nodes on Track */}
          {keyframes.map((node) => {
            const isSelected = selectedKeyframeId === node.id;
            return (
              <div
                key={node.id}
                data-keyframe-node="true"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setSelectedKeyframeId(node.id);
                  setCurrentTimePercent(node.percentage);
                  if (node.isRemovable !== false) {
                    setIsDraggingNode(node.id);
                  }
                }}
                className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-ew-resize group flex flex-col items-center justify-center"
                style={{ left: `${node.percentage}%` }}
              >
                {/* Diamond Handle */}
                <div
                  className={`w-4 h-4 rotate-45 border-2 transition-transform ${
                    isSelected
                      ? 'bg-[#00FF00] border-[#FFFFFF] scale-125 shadow-[0_0_12px_rgba(0,255,0,0.8)]'
                      : 'bg-[#181818] border-[#00FF00] hover:bg-[#00FF00]/30 hover:scale-110'
                  }`}
                />

                {/* Info Tooltip */}
                <div
                  className={`absolute -bottom-6 text-[8px] font-mono px-1.5 py-0.5 whitespace-nowrap border pointer-events-none transition-all ${
                    isSelected
                      ? 'bg-[#000000] text-[#00FF00] border-[#00FF00] opacity-100 font-bold z-30 shadow-md'
                      : 'bg-[#111111] text-[#888888] border-[#2B2B2B] opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <span>{node.percentage}%</span>
                  {node.action && <span className="ml-1 text-[#FFFFFF]">· {node.action}</span>}
                </div>
              </div>
            );
          })}

          {/* Live Playhead Scrubber */}
          <div
            className="absolute top-[-8px] bottom-[-8px] w-[2px] bg-[#00FF00] z-30 pointer-events-none shadow-[0_0_8px_#00FF00]"
            style={{ left: `${currentTimePercent}%` }}
          >
            <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-[#00FF00] rotate-45 shadow-[0_0_6px_#00FF00]" />
          </div>
        </div>
      </div>

      {/* 3. Deep Keyframe Action & Transform Inspector */}
      {selectedNode && (
        <div className="p-3 bg-[#0F0F0F] border-t border-[#1C1C1C] flex flex-col gap-2.5">
          {/* Top row: Label, percentage, action preset buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#555555] uppercase font-bold">Keyframe:</span>
              <input
                type="text"
                value={selectedNode.label || ''}
                onChange={(e) => handleUpdateSelectedKeyframe({ label: e.target.value })}
                className="bg-[#181818] border border-[#2B2B2B] focus:border-[#00FF00] px-2 py-0.5 text-xs text-[#FFFFFF] font-mono outline-none w-36 sm:w-48"
              />
              <span className="text-xs text-[#00FF00] font-bold">{selectedNode.percentage}%</span>
              <span className="text-[10px] text-[#666666]">
                ({((selectedNode.percentage / 100) * durationSec).toFixed(2)}s)
              </span>
            </div>

            {/* Quick Action Presets */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-[#666666] uppercase font-bold mr-1">Action:</span>
              {ACTION_PRESETS.map((ap) => (
                <button
                  key={ap.id}
                  onClick={() => handleApplyActionPreset(ap.id)}
                  className={`text-[9px] px-2 py-0.5 border uppercase font-bold transition-colors ${
                    selectedNode.action === ap.label
                      ? 'bg-[#00FF00]/20 text-[#00FF00] border-[#00FF00]'
                      : 'bg-[#141414] text-[#888888] border-[#2A2A2A] hover:text-[#FFFFFF]'
                  }`}
                >
                  {ap.label}
                </button>
              ))}
            </div>

            {/* Delete button */}
            {selectedNode.isRemovable !== false && (
              <button
                onClick={(e) => handleDeleteKeyframe(selectedNode.id, e)}
                className="flex items-center gap-1 text-[10px] text-[#FF4444] hover:text-[#FF6666] hover:bg-[#FF4444]/10 px-2 py-1 border border-[#FF4444]/30"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Bottom row: Detailed Transform sliders (Scale, Rotate, Translate X/Y, Opacity, Easing) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2 border-t border-[#1C1C1C]">
            {/* Scale */}
            <div className="bg-[#141414] border border-[#222222] p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#888888] uppercase">Scale</span>
                <span className="text-[#00FF00] font-bold">{(selectedNode.transform?.scale ?? 1).toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={selectedNode.transform?.scale ?? 1}
                onChange={(e) =>
                  handleUpdateSelectedKeyframe({
                    transform: { scale: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#00FF00] cursor-pointer"
              />
            </div>

            {/* Rotate */}
            <div className="bg-[#141414] border border-[#222222] p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#888888] uppercase">Rotate</span>
                <span className="text-[#00FFFF] font-bold">{selectedNode.transform?.rotate ?? 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={selectedNode.transform?.rotate ?? 0}
                onChange={(e) =>
                  handleUpdateSelectedKeyframe({
                    transform: { rotate: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-[#00FFFF] cursor-pointer"
              />
            </div>

            {/* Translate X */}
            <div className="bg-[#141414] border border-[#222222] p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#888888] uppercase">Translate X</span>
                <span className="text-[#CCCCCC] font-bold">{selectedNode.transform?.translateX ?? 0}px</span>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="2"
                value={selectedNode.transform?.translateX ?? 0}
                onChange={(e) =>
                  handleUpdateSelectedKeyframe({
                    transform: { translateX: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-[#CCCCCC] cursor-pointer"
              />
            </div>

            {/* Translate Y */}
            <div className="bg-[#141414] border border-[#222222] p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#888888] uppercase">Translate Y</span>
                <span className="text-[#CCCCCC] font-bold">{selectedNode.transform?.translateY ?? 0}px</span>
              </div>
              <input
                type="range"
                min="-120"
                max="120"
                step="2"
                value={selectedNode.transform?.translateY ?? 0}
                onChange={(e) =>
                  handleUpdateSelectedKeyframe({
                    transform: { translateY: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full accent-[#CCCCCC] cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div className="bg-[#141414] border border-[#222222] p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#888888] uppercase">Opacity</span>
                <span className="text-[#FFCC00] font-bold">
                  {Math.round((selectedNode.transform?.opacity ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={selectedNode.transform?.opacity ?? 1}
                onChange={(e) =>
                  handleUpdateSelectedKeyframe({
                    transform: { opacity: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-[#FFCC00] cursor-pointer"
              />
            </div>

            {/* Target Layer selector */}
            <div className="bg-[#141414] border border-[#222222] p-2 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="text-[#888888] uppercase">Target Layer</span>
              </div>
              <select
                value={selectedNode.targetLayer || 'all'}
                onChange={(e) => handleUpdateSelectedKeyframe({ targetLayer: e.target.value })}
                className="bg-[#181818] border border-[#2B2B2B] text-xs text-[#00FF00] outline-none px-1 py-0.5"
              >
                <option value="all">All Layers</option>
                {layers.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
