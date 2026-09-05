import React, { useState, useRef, useEffect, useCallback } from 'react';
import { KeyframeNode, AnimationConfig } from '../types';
import {
  Play,
  Pause,
  Plus,
  RotateCcw,
  Trash2,
  Sliders,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  Split,
  Maximize2
} from 'lucide-react';

interface KeyframeTimelineProps {
  config: AnimationConfig;
  onChangeConfig: (partial: Partial<AnimationConfig>) => void;
  onTogglePlay: () => void;
}

export const KeyframeTimeline: React.FC<KeyframeTimelineProps> = ({
  config,
  onChangeConfig,
  onTogglePlay,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>('kf-0');
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [currentTimePercent, setCurrentTimePercent] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const durationSec = Math.max(0.5, config.duration / (config.speed || 1));
  const keyframes = config.keyframes && config.keyframes.length > 0
    ? config.keyframes
    : [
        { id: 'kf-0', percentage: 0, label: '0% Start', isRemovable: false },
        { id: 'kf-50', percentage: 50, label: '50% Mid Wave', isRemovable: true },
        { id: 'kf-100', percentage: 100, label: '100% Return', isRemovable: false },
      ];

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
      onChangeConfig({
        keyframes: keyframes.map((kf) => {
          if (kf.id === isDraggingNode) {
            // Keep bounds between 0 and 100, lock 0% and 100% if not removable
            const clamped = kf.isRemovable === false
              ? kf.percentage
              : Math.max(1, Math.min(99, newPercent));
            return { ...kf, percentage: clamped };
          }
          return kf;
        }),
      });
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

  // Handle Track Click to Add Keyframe or Scrub
  const handleTrackClick = (e: React.MouseEvent) => {
    // If clicked directly on a node, don't trigger track click
    if ((e.target as HTMLElement).closest('[data-keyframe-node]')) return;

    const percent = getPercentFromEvent(e);
    setCurrentTimePercent(percent);

    // If near an existing keyframe, select it
    const nearby = keyframes.find((k) => Math.abs(k.percentage - percent) < 4);
    if (nearby) {
      setSelectedKeyframeId(nearby.id);
    }
  };

  // Add new keyframe node at current playhead position
  const handleAddKeyframe = (percentOverride?: number) => {
    const targetPercent = percentOverride !== undefined ? percentOverride : Math.round(currentTimePercent);
    const id = `kf-custom-${Date.now()}`;
    const newKeyframe: KeyframeNode = {
      id,
      percentage: Math.max(1, Math.min(99, targetPercent)),
      label: `${targetPercent}% Step`,
      isRemovable: true,
    };

    const updated = [...keyframes, newKeyframe].sort((a, b) => a.percentage - b.percentage);
    onChangeConfig({ keyframes: updated });
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

  // Reset to default keyframes
  const handleResetKeyframes = () => {
    onChangeConfig({
      keyframes: [
        { id: 'kf-0', percentage: 0, label: '0% Start', isRemovable: false },
        { id: 'kf-25', percentage: 25, label: '25% Build', isRemovable: true },
        { id: 'kf-50', percentage: 50, label: '50% Peak Wave', isRemovable: true },
        { id: 'kf-75', percentage: 75, label: '75% Settle', isRemovable: true },
        { id: 'kf-100', percentage: 100, label: '100% Loop Return', isRemovable: false },
      ],
    });
  };

  const selectedNode = keyframes.find((k) => k.id === selectedKeyframeId);
  const currentTimeSec = ((currentTimePercent / 100) * durationSec).toFixed(2);

  return (
    <div className="bg-[#0D0D0D] border-t border-[#222222] p-3 select-none font-mono">
      {/* Timeline Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        {/* Left: Playback transport & Timecode */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`p-1.5 border transition-all ${
              config.isPaused
                ? 'bg-[#1A1A1A] border-[#333333] text-[#FFFFFF] hover:border-[#00FF00]'
                : 'bg-[#00FF00]/15 border-[#00FF00] text-[#00FF00]'
            }`}
            title={config.isPaused ? 'Play Timeline (Space)' : 'Pause Timeline (Space)'}
          >
            {config.isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-[#2A2A2A] text-[11px]">
            <Clock className="w-3 h-3 text-[#00FF00]" />
            <span className="text-[#00FF00] font-bold">{currentTimeSec}s</span>
            <span className="text-[#555555]">/</span>
            <span className="text-[#888888]">{durationSec.toFixed(2)}s</span>
            <span className="text-[#444444] text-[10px]">({Math.round(currentTimePercent)}%)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#666666]">
            <span>Loop:</span>
            <span className="text-[#AAAAAA] uppercase font-bold">{config.loopMode || 'infinite'}</span>
          </div>
        </div>

        {/* Right: Keyframe Management Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleAddKeyframe()}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#242424] text-[#00FF00] border border-[#333333] hover:border-[#00FF00]/40 text-[10px] font-bold uppercase transition-colors"
            title="Add keyframe at playhead position"
          >
            <Plus className="w-3 h-3" />
            <span>Add Keyframe</span>
          </button>

          <button
            onClick={handleDistributeEvenly}
            className="flex items-center gap-1 px-2 py-1 bg-[#141414] hover:bg-[#1E1E1E] text-[#888888] hover:text-[#FFFFFF] border border-[#2A2A2A] text-[10px] font-bold uppercase transition-colors"
            title="Distribute active keyframes evenly across 0-100%"
          >
            <Split className="w-3 h-3" />
            <span className="hidden md:inline">Distribute</span>
          </button>

          <button
            onClick={handleResetKeyframes}
            className="p-1 text-[#666666] hover:text-[#FFFFFF] hover:bg-[#1A1A1A] border border-transparent hover:border-[#333333]"
            title="Reset to 5-point default keyframes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Timeline Track Bar */}
      <div className="relative pt-6 pb-4">
        {/* Time Tick Ruler */}
        <div className="absolute top-0 left-0 right-0 h-4 flex justify-between text-[9px] text-[#555555] font-mono pointer-events-none px-1">
          <span>0.0s (0%)</span>
          <span className="hidden sm:inline">{(durationSec * 0.25).toFixed(1)}s (25%)</span>
          <span>{(durationSec * 0.5).toFixed(1)}s (50%)</span>
          <span className="hidden sm:inline">{(durationSec * 0.75).toFixed(1)}s (75%)</span>
          <span>{durationSec.toFixed(1)}s (100%)</span>
        </div>

        {/* Ruler Tick Marks Background */}
        <div className="absolute top-4 left-0 right-0 h-1.5 flex justify-between px-1 pointer-events-none">
          {Array.from({ length: 21 }).map((_, i) => (
            <div
              key={i}
              className={`w-[1px] ${i % 5 === 0 ? 'h-2 bg-[#444444]' : 'h-1 bg-[#222222]'}`}
            />
          ))}
        </div>

        {/* Main Interactive Track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative h-6 bg-[#141414] border border-[#2A2A2A] hover:border-[#3A3A3A] cursor-pointer rounded-none overflow-visible flex items-center transition-colors shadow-inner"
        >
          {/* Active progress fill bar */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#00FF00]/10 border-r border-[#00FF00]/30 pointer-events-none"
            style={{ width: `${currentTimePercent}%` }}
          />

          {/* Keyframe Nodes on Track */}
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
                className={`absolute -top-1 bottom-0 transform -translate-x-1/2 z-20 cursor-ew-resize group flex flex-col items-center justify-center`}
                style={{ left: `${node.percentage}%` }}
              >
                {/* Node Handle Diamond */}
                <div
                  className={`w-3.5 h-3.5 rotate-45 border transition-all ${
                    isSelected
                      ? 'bg-[#00FF00] border-[#FFFFFF] scale-110 shadow-[0_0_8px_rgba(0,255,0,0.6)]'
                      : 'bg-[#1E1E1E] border-[#00FF00] hover:bg-[#00FF00]/30'
                  }`}
                />

                {/* Percentage Tag Tooltip */}
                <div
                  className={`absolute -bottom-5 text-[8px] font-mono px-1 py-0.2 whitespace-nowrap border pointer-events-none transition-opacity ${
                    isSelected
                      ? 'bg-[#000000] text-[#00FF00] border-[#00FF00] opacity-100 font-bold z-30'
                      : 'bg-[#111111] text-[#888888] border-[#333333] opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {node.percentage}%
                </div>
              </div>
            );
          })}

          {/* Live Playhead Scrubber Line */}
          <div
            className="absolute top-[-6px] bottom-[-6px] w-[2px] bg-[#00FF00] z-30 pointer-events-none shadow-[0_0_6px_#00FF00]"
            style={{ left: `${currentTimePercent}%` }}
          >
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#00FF00] rotate-45" />
          </div>
        </div>
      </div>

      {/* Selected Keyframe Inspector Strip */}
      {selectedNode && (
        <div className="mt-3 pt-2.5 border-t border-[#1C1C1C] flex flex-wrap items-center justify-between gap-2 text-xs text-[#888888]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#555555] uppercase font-bold">Keyframe:</span>
              <span className="text-[#FFFFFF] font-bold">{selectedNode.label || `${selectedNode.percentage}% Node`}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#555555] uppercase font-bold">Position:</span>
              <span className="text-[#00FF00] font-bold">{selectedNode.percentage}%</span>
              <span className="text-[#555555]">({((selectedNode.percentage / 100) * durationSec).toFixed(2)}s)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedNode.isRemovable !== false ? (
              <button
                onClick={(e) => handleDeleteKeyframe(selectedNode.id, e)}
                className="flex items-center gap-1 text-[10px] text-[#FF4444] hover:text-[#FF6666] hover:bg-[#FF4444]/10 px-2 py-0.5 border border-[#FF4444]/30"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Node</span>
              </button>
            ) : (
              <span className="text-[10px] text-[#555555] italic">Locked Root Anchor</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
