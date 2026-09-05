import React, { useState } from 'react';
import { AnimationConfig, AnimationPresetId, AnimationSyncGroup, KeyframeNode, LayerSpec } from '../types';
import { ANIMATION_EASINGS, ANIMATION_PRESETS } from '../utils/svgAnimator';
import {
  Link2,
  Unlink,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Sliders,
  Clock,
  Activity,
  Check,
  Zap,
  Repeat,
  Compass,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnimationSyncManagerProps {
  layers: LayerSpec[];
  config: AnimationConfig;
  onChangeConfig: (partial: Partial<AnimationConfig>) => void;
}

const SYNC_PALETTE_COLORS = [
  '#00FF00', // Neon Matrix Green
  '#00FFFF', // Cyber Cyan
  '#FF00FF', // Magenta / Neon Pink
  '#FFB800', // Electric Amber
  '#38BDF8', // Sky Blue
  '#A855F7', // Ultraviolet Purple
  '#F43F5E', // Rose Crimson
  '#10B981', // Emerald
];

export const AnimationSyncManager: React.FC<AnimationSyncManagerProps> = ({
  layers,
  config,
  onChangeConfig,
}) => {
  const syncGroups: AnimationSyncGroup[] = config.syncGroups || [];
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    config.activeSyncGroupId || (syncGroups.length > 0 ? syncGroups[0].id : null)
  );

  const activeGroup = syncGroups.find((g) => g.id === selectedGroupId) || null;

  // Create a new sync group
  const handleCreateGroup = () => {
    const nextIndex = syncGroups.length + 1;
    const availableColor = SYNC_PALETTE_COLORS[(nextIndex - 1) % SYNC_PALETTE_COLORS.length];
    const newGroup: AnimationSyncGroup = {
      id: `sync-grp-${Date.now()}`,
      name: `Sync Group ${nextIndex}`,
      layerNames: [],
      color: availableColor,
      preset: config.preset || 'pulse-breath',
      duration: config.duration || 4,
      speed: config.speed || 1,
      easing: config.easing || 'ease-in-out',
      delay: 0,
      direction: config.direction || 'normal',
      keyframes: [
        { id: `kf-0-${Date.now()}`, percentage: 0, label: '0% Start', isRemovable: false },
        { id: `kf-50-${Date.now()}`, percentage: 50, label: '50% Peak', isRemovable: true },
        { id: `kf-100-${Date.now()}`, percentage: 100, label: '100% Loop', isRemovable: false },
      ],
      active: true,
    };

    const nextGroups = [...syncGroups, newGroup];
    onChangeConfig({
      syncGroups: nextGroups,
      activeSyncGroupId: newGroup.id,
    });
    setSelectedGroupId(newGroup.id);
  };

  // Delete a sync group
  const handleDeleteGroup = (groupId: string) => {
    const nextGroups = syncGroups.filter((g) => g.id !== groupId);
    const nextActiveId = nextGroups.length > 0 ? nextGroups[0].id : null;
    onChangeConfig({
      syncGroups: nextGroups,
      activeSyncGroupId: nextActiveId,
    });
    setSelectedGroupId(nextActiveId);
  };

  // Update a sync group parameter
  const handleUpdateGroup = (groupId: string, partial: Partial<AnimationSyncGroup>) => {
    const nextGroups = syncGroups.map((g) => (g.id === groupId ? { ...g, ...partial } : g));
    onChangeConfig({ syncGroups: nextGroups });
  };

  // Toggle layer inclusion in active sync group
  const handleToggleLayerInGroup = (layerName: string) => {
    if (!activeGroup) return;

    // Check if layer is in this group
    const isAlreadyInGroup = activeGroup.layerNames.includes(layerName);
    let nextLayerNames: string[];

    if (isAlreadyInGroup) {
      nextLayerNames = activeGroup.layerNames.filter((name) => name !== layerName);
    } else {
      nextLayerNames = [...activeGroup.layerNames, layerName];
    }

    // Remove this layer from any OTHER sync groups to avoid collisions
    const nextGroups = syncGroups.map((g) => {
      if (g.id === activeGroup.id) {
        return { ...g, layerNames: nextLayerNames };
      }
      return {
        ...g,
        layerNames: g.layerNames.filter((name) => name !== layerName),
      };
    });

    onChangeConfig({ syncGroups: nextGroups });
  };

  // Quick auto-link all layers
  const handleLinkAllLayers = () => {
    if (!activeGroup) return;
    const allLayerNames = layers.map((l) => l.name);
    handleUpdateGroup(activeGroup.id, { layerNames: allLayerNames });
  };

  // Quick auto-group presets
  const handleAutoGroupPairings = () => {
    const newGroups: AnimationSyncGroup[] = [];

    // Group 1: Foregrounds & Core
    const coreLayers = layers
      .filter((l) => {
        const name = l.name.toLowerCase();
        return name.includes('core') || name.includes('shape') || name.includes('subject') || name.includes('art');
      })
      .map((l) => l.name);

    if (coreLayers.length > 0) {
      newGroups.push({
        id: `sync-grp-core-${Date.now()}`,
        name: 'Core Dynamics',
        layerNames: coreLayers,
        color: '#00FF00',
        preset: 'pulse-breath',
        duration: 3.5,
        speed: 1,
        easing: 'ease-in-out',
        delay: 0,
        direction: 'normal',
        active: true,
      });
    }

    // Group 2: Backgrounds & Frames
    const bgLayers = layers
      .filter((l) => {
        const name = l.name.toLowerCase();
        return name.includes('bg') || name.includes('background') || name.includes('frame');
      })
      .map((l) => l.name);

    if (bgLayers.length > 0) {
      newGroups.push({
        id: `sync-grp-bg-${Date.now() + 1}`,
        name: 'Background Harmonics',
        layerNames: bgLayers,
        color: '#00FFFF',
        preset: 'orbit-spin',
        duration: 8,
        speed: 1,
        easing: 'linear',
        delay: 0,
        direction: 'normal',
        active: true,
      });
    }

    // Group 3: Accents, Details & FX
    const accentLayers = layers
      .filter((l) => {
        const name = l.name.toLowerCase();
        return name.includes('accent') || name.includes('fx') || name.includes('glow') || name.includes('text') || name.includes('detail');
      })
      .map((l) => l.name);

    if (accentLayers.length > 0) {
      newGroups.push({
        id: `sync-grp-accent-${Date.now() + 2}`,
        name: 'Accents & VFX',
        layerNames: accentLayers,
        color: '#FF00FF',
        preset: 'wiggle',
        duration: 2.2,
        speed: 1.2,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        delay: 0.1,
        direction: 'alternate',
        active: true,
      });
    }

    if (newGroups.length === 0 && layers.length > 0) {
      // Just create one group with all layers
      newGroups.push({
        id: `sync-grp-all-${Date.now()}`,
        name: 'All Master Layers',
        layerNames: layers.map((l) => l.name),
        color: '#00FF00',
        preset: 'pulse-breath',
        duration: 4,
        speed: 1,
        easing: 'ease-in-out',
        delay: 0,
        direction: 'normal',
        active: true,
      });
    }

    onChangeConfig({
      syncGroups: newGroups,
      activeSyncGroupId: newGroups.length > 0 ? newGroups[0].id : null,
    });
    if (newGroups.length > 0) {
      setSelectedGroupId(newGroups[0].id);
    }
  };

  // Add Keyframe to active sync group
  const handleAddGroupKeyframe = () => {
    if (!activeGroup) return;
    const currentKfs = activeGroup.keyframes || [
      { id: 'kf-0', percentage: 0, label: '0% Start', isRemovable: false },
      { id: 'kf-100', percentage: 100, label: '100% Loop', isRemovable: false },
    ];

    const nextPct = Math.min(95, Math.max(5, Math.round(50 + (Math.random() * 20 - 10))));
    const newKf: KeyframeNode = {
      id: `kf-sync-${Date.now()}`,
      percentage: nextPct,
      label: `${nextPct}% Synced Stop`,
      isRemovable: true,
    };

    const nextKfs = [...currentKfs, newKf].sort((a, b) => a.percentage - b.percentage);
    handleUpdateGroup(activeGroup.id, { keyframes: nextKfs });
  };

  // Remove Keyframe from active sync group
  const handleRemoveGroupKeyframe = (kfId: string) => {
    if (!activeGroup || !activeGroup.keyframes) return;
    const nextKfs = activeGroup.keyframes.filter((k) => k.id !== kfId);
    handleUpdateGroup(activeGroup.id, { keyframes: nextKfs });
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs">
      {/* Header & Feature Summary */}
      <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#00FF00]/10 border border-[#00FF00]/40 flex items-center justify-center text-[#00FF00]">
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">Animation Sync Engine</h3>
            <p className="text-[10px] text-[#777777]">Link multiple layers to lock timing, easing & duration</p>
          </div>
        </div>

        <button
          onClick={handleCreateGroup}
          className="px-2.5 py-1.5 bg-[#00FF00] hover:bg-[#00DD00] text-[#000000] font-bold text-[11px] flex items-center gap-1.5 transition-colors uppercase tracking-wider rounded-sm shadow-[0_0_10px_rgba(0,255,0,0.2)]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Sync Group</span>
        </button>
      </div>

      {/* Sync Groups Carousel / Tabs */}
      {syncGroups.length === 0 ? (
        <div className="p-5 bg-[#121212] border border-dashed border-[#2D2D2D] text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-[#888888]">
            <Link2 className="w-5 h-5 text-[#00FF00]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#FFFFFF] uppercase">No Layer Sync Groups Active</h4>
            <p className="text-[11px] text-[#777777] max-w-xs mx-auto leading-relaxed">
              Create a Sync Group to lock multiple SVG layer nodes into an identical keyframe phase, duration, and easing velocity.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={handleCreateGroup}
              className="px-3 py-1.5 bg-[#00FF00] hover:bg-[#00DD00] text-[#000000] font-bold uppercase tracking-wider text-[10px]"
            >
              + Create Blank Group
            </button>
            <button
              onClick={handleAutoGroupPairings}
              className="px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333333] text-[#CCCCCC] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#00FF00]" />
              Auto-Pair Layers
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Group Selector Cards */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {syncGroups.map((group) => {
              const isSelected = selectedGroupId === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    onChangeConfig({ activeSyncGroupId: group.id });
                  }}
                  className={`px-3 py-2 border text-left shrink-0 transition-all flex items-center gap-2.5 rounded-sm ${
                    isSelected
                      ? 'bg-[#181818] border-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.15)]'
                      : 'bg-[#101010] border-[#262626] hover:border-[#3E3E3E] text-[#888888]'
                  }`}
                  style={{
                    borderLeftColor: group.color,
                    borderLeftWidth: '3px',
                  }}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-[#FFFFFF]' : 'text-[#AAAAAA]'}`}>
                        {group.name}
                      </span>
                      {!group.active && (
                        <span className="text-[8px] px-1 bg-[#222222] text-[#666666] border border-[#333333]">
                          MUTED
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-[#666666] font-mono mt-0.5 flex items-center gap-2">
                      <span className="text-[#00FF00] font-bold">{group.layerNames.length} layers</span>
                      <span>•</span>
                      <span>{group.duration}s</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Sync Group Editor */}
          {activeGroup && (
            <motion.div
              key={activeGroup.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-[#121212] border border-[#2A2A2A] space-y-4"
            >
              {/* Group Title, Color & Actions */}
              <div className="flex items-center justify-between pb-2 border-b border-[#222222] gap-2">
                <div className="flex items-center gap-2 flex-1">
                  {/* Color Picker Swatch */}
                  <div className="flex items-center gap-1 shrink-0">
                    {SYNC_PALETTE_COLORS.slice(0, 5).map((col) => (
                      <button
                        key={col}
                        onClick={() => handleUpdateGroup(activeGroup.id, { color: col })}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                          activeGroup.color === col ? 'scale-125 border-[#FFFFFF]' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>

                  <input
                    type="text"
                    value={activeGroup.name}
                    onChange={(e) => handleUpdateGroup(activeGroup.id, { name: e.target.value })}
                    className="bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] px-2 py-1 text-xs text-[#FFFFFF] font-bold outline-none flex-1 max-w-[200px]"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Mute/Unmute */}
                  <button
                    onClick={() => handleUpdateGroup(activeGroup.id, { active: !activeGroup.active })}
                    className={`p-1.5 border text-[10px] flex items-center gap-1 ${
                      activeGroup.active
                        ? 'bg-[#1C1C1C] border-[#333333] text-[#AAAAAA] hover:text-[#FFFFFF]'
                        : 'bg-[#FF0000]/10 border-[#FF0000]/30 text-[#FF4444]'
                    }`}
                    title={activeGroup.active ? 'Mute Sync Group' : 'Enable Sync Group'}
                  >
                    {activeGroup.active ? <Eye className="w-3 h-3 text-[#00FF00]" /> : <EyeOff className="w-3 h-3" />}
                    <span>{activeGroup.active ? 'Active' : 'Muted'}</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteGroup(activeGroup.id)}
                    className="p-1.5 bg-[#1C1C1C] hover:bg-[#FF0000]/20 border border-[#333333] hover:border-[#FF0000]/50 text-[#888888] hover:text-[#FF4444] transition-colors"
                    title="Delete Sync Group"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 1. LAYER LINKING MATRIX */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#CCCCCC] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#00FF00]" />
                    Linked Layers in this Sync Group ({activeGroup.layerNames.length}/{layers.length})
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleLinkAllLayers}
                      className="text-[9px] uppercase px-1.5 py-0.5 bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-[#333333] text-[#00FF00]"
                    >
                      Link All
                    </button>
                    <button
                      onClick={() => handleUpdateGroup(activeGroup.id, { layerNames: [] })}
                      className="text-[9px] uppercase px-1.5 py-0.5 bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-[#333333] text-[#888888]"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1 bg-[#0A0A0A] border border-[#222222]">
                  {layers.map((layer) => {
                    const isLinked = activeGroup.layerNames.includes(layer.name);
                    const otherGroup = syncGroups.find(
                      (g) => g.id !== activeGroup.id && g.layerNames.includes(layer.name)
                    );

                    return (
                      <div
                        key={layer.name}
                        onClick={() => handleToggleLayerInGroup(layer.name)}
                        className={`p-2 border flex items-center justify-between cursor-pointer transition-all ${
                          isLinked
                            ? 'bg-[#00FF00]/10 border-[#00FF00] text-[#FFFFFF]'
                            : otherGroup
                            ? 'bg-[#141414] border-[#222222] text-[#666666] opacity-75'
                            : 'bg-[#101010] border-[#222222] hover:border-[#383838] text-[#AAAAAA]'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                              isLinked
                                ? 'bg-[#00FF00] border-[#00FF00] text-[#000000]'
                                : 'border-[#444444] bg-[#0A0A0A]'
                            }`}
                          >
                            {isLinked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <div className="truncate">
                            <div className="text-[11px] font-mono truncate">{layer.name}</div>
                            <div className="text-[9px] text-[#666666]">{layer.elementCount} nodes</div>
                          </div>
                        </div>

                        {otherGroup && !isLinked && (
                          <span
                            className="text-[8px] px-1 py-0.2 text-[#000000] font-bold rounded-sm truncate shrink-0 max-w-[80px]"
                            style={{ backgroundColor: otherGroup.color }}
                          >
                            {otherGroup.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. SYNCHRONIZED TIMING & MOTION PARAMETERS */}
              <div className="space-y-3 pt-2 border-t border-[#222222]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#00FF00] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Synchronized Parameters (Shared Across All Linked Layers)
                  </span>
                </div>

                {/* Shared Motion Preset */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#777777] flex items-center justify-between">
                    <span>Synchronized Motion Preset</span>
                    <span className="text-[#00FF00] font-mono">{activeGroup.preset}</span>
                  </label>
                  <select
                    value={activeGroup.preset}
                    onChange={(e) => handleUpdateGroup(activeGroup.id, { preset: e.target.value as AnimationPresetId })}
                    className="w-full bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] text-xs px-2.5 py-1.5 text-[#00FF00] font-mono outline-none"
                  >
                    <optgroup label="Standard Essentials">
                      <option value="pulse-breath">Pulse & Breathing Expansion</option>
                      <option value="orbit-spin">Continuous 360° Planetary Rotation</option>
                      <option value="wiggle">High-Energy Elastic Wiggle</option>
                      <option value="bounce">Snappy Gravity Bounce</option>
                      <option value="float-hover">Zero-Gravity Levitation</option>
                    </optgroup>
                    <optgroup label="Kinetic & Dynamics">
                      <option value="path-draw">Laser Stroke Path Trace</option>
                      <option value="radar-sweep">Radar Telemetry Beam Sweep</option>
                      <option value="glitch-surge">Glitch Matrix Surge</option>
                      <option value="wave-oscillate">Morphing Wave Oscillation</option>
                    </optgroup>
                    <optgroup label="Cybernetic & VFX">
                      <option value="color-shimmer">Prismatic Color Wave Shimmer</option>
                      <option value="neon-flicker">Neon Strobe & Cybernetic Flicker</option>
                    </optgroup>
                  </select>
                </div>

                {/* Shared Duration Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="uppercase text-[#888888] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#00FF00]" />
                      Synchronized Cycle Duration
                    </span>
                    <span className="text-[#00FF00] font-bold font-mono">{activeGroup.duration}s</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={16}
                    step={0.25}
                    value={activeGroup.duration}
                    onChange={(e) => handleUpdateGroup(activeGroup.id, { duration: parseFloat(e.target.value) })}
                    className="w-full accent-[#00FF00] bg-[#222222] h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-[#555555]">
                    <span>0.5s Fast</span>
                    <span>4s Standard</span>
                    <span>16s Ambient</span>
                  </div>
                </div>

                {/* Shared Easing Function */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#777777] flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#00FFFF]" />
                      Synchronized Easing Acceleration Curve
                    </span>
                  </label>
                  <select
                    value={activeGroup.easing}
                    onChange={(e) => handleUpdateGroup(activeGroup.id, { easing: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333333] focus:border-[#00FFFF] text-xs px-2.5 py-1.5 text-[#00FFFF] font-mono outline-none"
                  >
                    {ANIMATION_EASINGS.map((easing) => (
                      <option key={easing.id} value={easing.id}>
                        {easing.name} ({easing.curve})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shared Phase Offset & Direction */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[#777777]">Phase Delay Offset</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.1}
                        value={activeGroup.delay || 0}
                        onChange={(e) => handleUpdateGroup(activeGroup.id, { delay: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] text-xs px-2 py-1 text-[#FFFFFF] font-mono outline-none"
                      />
                      <span className="text-[10px] text-[#777777]">s</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[#777777]">Direction</label>
                    <select
                      value={activeGroup.direction}
                      onChange={(e) =>
                        handleUpdateGroup(activeGroup.id, {
                          direction: e.target.value as 'normal' | 'reverse' | 'alternate',
                        })
                      }
                      className="w-full bg-[#0A0A0A] border border-[#333333] focus:border-[#00FF00] text-xs px-2 py-1 text-[#FFFFFF] font-mono outline-none"
                    >
                      <option value="normal">Normal (Forward)</option>
                      <option value="reverse">Reverse (Backward)</option>
                      <option value="alternate">Alternate (Ping-Pong)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. SYNCHRONIZED TIMELINE KEYFRAME NODES */}
              <div className="space-y-2 pt-2 border-t border-[#222222]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#FFB800]" />
                    Linked Timeline Keyframes ({activeGroup.keyframes?.length || 0} Stops)
                  </span>
                  <button
                    onClick={handleAddGroupKeyframe}
                    className="text-[9px] uppercase px-2 py-0.5 bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Stop
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  {(activeGroup.keyframes || []).map((kf) => (
                    <div
                      key={kf.id}
                      className="px-2.5 py-1.5 bg-[#0A0A0A] border border-[#333333] flex items-center gap-2 shrink-0 rounded-sm"
                    >
                      <span className="text-[10px] font-mono font-bold text-[#FFB800]">{kf.percentage}%</span>
                      <span className="text-[9px] text-[#777777]">{kf.label}</span>
                      {kf.isRemovable && (
                        <button
                          onClick={() => handleRemoveGroupKeyframe(kf.id)}
                          className="text-[#666666] hover:text-[#FF4444]"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
