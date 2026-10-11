import React, { useState, useMemo } from 'react';
import { LayerSpec, LayerHierarchyNode } from '../types';
import { parseSvgHierarchy } from '../utils/svgParser';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Crosshair,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  Plus,
  Wand2,
  Info,
  X,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderPlus,
  Box,
  Minimize2,
  Maximize2,
  Compass,
  FolderTree,
  Sparkles,
  Sliders,
  Palette
} from 'lucide-react';

interface LayerPanelProps {
  layers: LayerSpec[];
  svgString?: string;
  onToggleLayer: (layerName: string, layerId?: string) => void;
  onToggleLock?: (layerName: string, layerId?: string) => void;
  onRenameLayer?: (oldName: string, newName: string) => void;
  onReorderLayer?: (layerName: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onAddNewLayer?: (name: string) => void;
  onAddNewFolder?: (folderName: string) => void;
  onStandardizeLayers?: () => void;
  onSetBlendMode?: (layerName: string, blendMode: string, layerId?: string) => void;
  onSetPerspective?: (layerName: string, perspectiveType: string, layerId?: string) => void;
  onSoloLayer: (layerName: string) => void;
  onShowAllLayers: () => void;
  onClose?: () => void;
}

const BLEND_MODES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
];

const PERSPECTIVE_PRESETS = [
  { id: 'isometric-left', label: 'Isometric Left (30°)', desc: '30° isometric left projection' },
  { id: 'isometric-right', label: 'Isometric Right (30°)', desc: '30° isometric right projection' },
  { id: 'isometric-top', label: 'Isometric Top (30°)', desc: 'Top-down isometric projection' },
  { id: 'perspective-tilt', label: '3D Dynamic Tilt (25°)', desc: '25° dynamic skewed perspective' },
  { id: 'cabinet-oblique', label: 'Cabinet Oblique (45°)', desc: '45° cabinet elevation oblique' },
  { id: 'reset', label: 'Reset Perspective', desc: 'Clear 3D / isometric matrix transform' },
];

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  svgString = '',
  onToggleLayer,
  onToggleLock,
  onRenameLayer,
  onReorderLayer,
  onAddNewLayer,
  onAddNewFolder,
  onStandardizeLayers,
  onSetBlendMode,
  onSetPerspective,
  onSoloLayer,
  onShowAllLayers,
  onClose,
}) => {
  const [editingLayerName, setEditingLayerName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [isAddingLayer, setIsAddingLayer] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newLayerInput, setNewLayerInput] = useState('');
  const [newFolderInput, setNewFolderInput] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [activePerspectiveMenu, setActivePerspectiveMenu] = useState<string | null>(null);

  // Local state overrides for instantaneous UI feedback on toggles
  const [localVisibility, setLocalVisibility] = useState<Record<string, boolean>>({});
  const [localLocks, setLocalLocks] = useState<Record<string, boolean>>({});

  // Parse nested hierarchy tree from SVG
  const hierarchyNodes = useMemo(() => {
    if (!svgString) return [];
    return parseSvgHierarchy(svgString);
  }, [svgString]);

  const visibleCount = layers.filter((l) => {
    if (localVisibility[l.name] !== undefined) return localVisibility[l.name];
    if (localVisibility[l.id] !== undefined) return localVisibility[l.id];
    return l.visible !== false;
  }).length;

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const collapseAll = () => {
    const allIds = new Set<string>();
    const collect = (nodes: LayerHierarchyNode[]) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length > 0) {
          allIds.add(n.id);
          collect(n.children);
        }
      });
    };
    collect(hierarchyNodes);
    setCollapsedNodes(allIds);
  };

  const expandAll = () => {
    setCollapsedNodes(new Set());
  };

  const handleStartRename = (name: string) => {
    setEditingLayerName(name);
    setTempName(name);
  };

  const handleSaveRename = (oldName: string) => {
    if (tempName.trim() && tempName.trim() !== oldName && onRenameLayer) {
      onRenameLayer(oldName, tempName.trim());
    }
    setEditingLayerName(null);
  };

  const handleCreateLayer = () => {
    if (newLayerInput.trim() && onAddNewLayer) {
      onAddNewLayer(newLayerInput.trim());
      setNewLayerInput('');
      setIsAddingLayer(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderInput.trim()) {
      if (onAddNewFolder) {
        onAddNewFolder(newFolderInput.trim());
      } else if (onAddNewLayer) {
        onAddNewLayer(`Group_${newFolderInput.trim()}`);
      }
      setNewFolderInput('');
      setIsAddingFolder(false);
    }
  };

  const handleToggleNodeVisibility = (name: string, id: string, currentVisible: boolean) => {
    setLocalVisibility((prev) => ({
      ...prev,
      [name]: !currentVisible,
      [id]: !currentVisible,
    }));
    onToggleLayer(name, id);
  };

  const handleToggleNodeLock = (name: string, id: string, currentLocked: boolean) => {
    if (!onToggleLock) return;
    setLocalLocks((prev) => ({
      ...prev,
      [name]: !currentLocked,
      [id]: !currentLocked,
    }));
    onToggleLock(name, id);
  };

  const handleApplyPerspective = (name: string, perspectiveType: string, id: string) => {
    if (onSetPerspective) {
      onSetPerspective(name, perspectiveType, id);
    }
    setActivePerspectiveMenu(null);
  };

  // Render recursive tree node
  const renderTreeNode = (node: LayerHierarchyNode, index: number, totalAtLevel: number) => {
    const isCollapsed = collapsedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    // Check visibility with local override support
    const isVisible =
      localVisibility[node.name] !== undefined
        ? localVisibility[node.name]
        : localVisibility[node.id] !== undefined
        ? localVisibility[node.id]
        : node.visible;

    // Check lock with local override support
    const isLocked =
      localLocks[node.name] !== undefined
        ? localLocks[node.name]
        : localLocks[node.id] !== undefined
        ? localLocks[node.id]
        : node.locked;

    const isEditing = editingLayerName === node.name;
    const isTopLayer = node.depth === 0;
    const isPerspectiveOpen = activePerspectiveMenu === node.id;

    return (
      <div key={node.id} className="relative flex flex-col">
        {/* Node Row */}
        <div
          style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
          className={`group relative pr-2 py-1.5 border-b border-[#1A1A1A] transition-all flex items-center justify-between gap-1.5 ${
            isVisible
              ? isLocked
                ? 'bg-[#121212] text-[#888888]'
                : isTopLayer
                ? 'bg-[#161616] hover:bg-[#1E1E1E] text-[#FFFFFF]'
                : 'bg-[#0E0E0E] hover:bg-[#181818] text-[#DDDDDD]'
              : 'bg-[#060606] opacity-40 text-[#555555]'
          }`}
        >
          {/* Tree branching connector guide for nested nodes */}
          {node.depth > 0 && (
            <div
              style={{ left: `${(node.depth - 1) * 16 + 14}px` }}
              className="absolute top-0 bottom-1/2 w-2.5 border-l border-b border-[#333333] pointer-events-none"
            />
          )}

          {/* Left: Expand/Collapse Chevron & Container Icon */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleCollapse(node.id)}
                title={isCollapsed ? 'Expand Group' : 'Collapse Group'}
                className="p-0.5 text-[#888888] hover:text-[#00FF00] transition-transform"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#00FF00]" />
                )}
              </button>
            ) : (
              <span className="w-4 h-4 flex items-center justify-center text-[#444444] text-[10px]">
                •
              </span>
            )}

            {/* Folder / Layer Icon Button (Interactive: clicks to expand/collapse if has children) */}
            <button
              onClick={() => hasChildren && toggleCollapse(node.id)}
              className="focus:outline-none"
              title={hasChildren ? (isCollapsed ? 'Expand Folder' : 'Collapse Folder') : 'Layer Container'}
            >
              {isTopLayer ? (
                <Layers className="w-3.5 h-3.5 text-[#00FF00] shrink-0" />
              ) : hasChildren ? (
                isCollapsed ? (
                  <Folder className="w-3.5 h-3.5 text-[#FFAA00] shrink-0 hover:text-[#FFCC00]" />
                ) : (
                  <FolderOpen className="w-3.5 h-3.5 text-[#FFAA00] shrink-0 hover:text-[#FFCC00]" />
                )
              ) : (
                <Box className="w-3 h-3 text-[#777777] shrink-0" />
              )}
            </button>

            {/* Visibility Toggle (Eye Button) */}
            <button
              onClick={() => handleToggleNodeVisibility(node.name, node.id, isVisible)}
              title={isVisible ? 'Hide layer / group (turn OFF)' : 'Show layer / group (turn ON)'}
              className={`p-1 rounded-sm transition-colors ${
                isVisible ? 'text-[#00FF00] hover:bg-[#222222]' : 'text-[#444444] hover:text-[#888888]'
              }`}
            >
              {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Lock / Unlock Toggle */}
            <button
              onClick={() => handleToggleNodeLock(node.name, node.id, isLocked)}
              title={isLocked ? 'Unlock container' : 'Lock container (prevent selection)'}
              className={`p-1 rounded-sm transition-colors ${
                isLocked ? 'text-[#FF5500] hover:bg-[#222222]' : 'text-[#444444] hover:text-[#888888]'
              }`}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>

            {/* Label / Inline Rename */}
            <div className="flex-1 min-w-0 px-1">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(node.name);
                      if (e.key === 'Escape') setEditingLayerName(null);
                    }}
                    autoFocus
                    className="w-full bg-[#000000] border border-[#00FF00] px-1 py-0.5 text-xs text-[#00FF00] outline-none font-mono"
                  />
                  <button
                    onClick={() => handleSaveRename(node.name)}
                    className="p-0.5 bg-[#00FF00] text-[#000000]"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    onDoubleClick={() => handleStartRename(node.name)}
                    title="Double-click to rename"
                    className={`text-xs truncate cursor-pointer hover:text-[#00FF00] ${
                      isTopLayer ? 'font-bold text-[#FFFFFF]' : 'font-medium text-[#CCCCCC]'
                    }`}
                  >
                    {node.name}
                  </span>
                  {hasChildren && (
                    <span className="text-[9px] bg-[#222222] text-[#888888] px-1 py-0.2 rounded border border-[#333333]">
                      {node.children.length}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Blend mode, Perspective, Reorder, Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Blending Mode selector in Tree Node */}
            <select
              value={node.blendMode || 'normal'}
              onChange={(e) => onSetBlendMode && onSetBlendMode(node.name, e.target.value, node.id)}
              title={`Blend Mode for ${node.name}`}
              className="bg-[#141414] text-[#00FF00] font-mono text-[9px] uppercase border border-[#2B2B2B] hover:border-[#00FF00] px-1 py-0.5 outline-none cursor-pointer rounded-none max-w-[68px]"
            >
              {BLEND_MODES.map((bm) => (
                <option key={bm} value={bm} className="bg-[#141414] text-[#FFFFFF]">
                  {bm}
                </option>
              ))}
            </select>

            {/* Perspective Tool Button */}
            <div className="relative">
              <button
                onClick={() => setActivePerspectiveMenu(isPerspectiveOpen ? null : node.id)}
                title="Apply 3D / Isometric Perspective Transform"
                className={`p-1 text-[10px] border transition-colors ${
                  isPerspectiveOpen
                    ? 'bg-[#00FFFF]/20 border-[#00FFFF] text-[#00FFFF]'
                    : 'text-[#666666] border-transparent hover:border-[#333333] hover:text-[#00FFFF]'
                }`}
              >
                <Compass className="w-3 h-3" />
              </button>

              {/* Perspective Dropdown Popover */}
              {isPerspectiveOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-[#0E0E0E] border border-[#333333] shadow-2xl p-1.5 flex flex-col gap-1 text-left font-mono">
                  <div className="text-[9px] text-[#00FFFF] font-bold uppercase tracking-wider px-1 py-0.5 border-b border-[#222222]">
                    Perspective & 3D Matrix
                  </div>
                  {PERSPECTIVE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPerspective(node.name, p.id, node.id)}
                      className="text-left px-1.5 py-1 text-[10px] hover:bg-[#1A1A1A] hover:text-[#00FFFF] transition-colors flex flex-col"
                    >
                      <span className="font-bold text-[#FFFFFF]">{p.label}</span>
                      <span className="text-[8px] text-[#777777]">{p.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reorder top-level layers */}
            {isTopLayer && onReorderLayer && (
              <>
                <button
                  disabled={index === 0}
                  onClick={() => onReorderLayer(node.name, 'down')}
                  title="Send Backward"
                  className="p-0.5 text-[#555555] hover:text-[#FFFFFF] disabled:opacity-10"
                >
                  <ArrowDown className="w-2.5 h-2.5" />
                </button>
                <button
                  disabled={index === totalAtLevel - 1}
                  onClick={() => onReorderLayer(node.name, 'up')}
                  title="Bring Forward"
                  className="p-0.5 text-[#555555] hover:text-[#FFFFFF] disabled:opacity-10"
                >
                  <ArrowUp className="w-2.5 h-2.5" />
                </button>
              </>
            )}

            {/* Rename */}
            <button
              onClick={() => handleStartRename(node.name)}
              title="Rename container"
              className="p-0.5 text-[#555555] hover:text-[#00FF00] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>

            {/* Solo */}
            <button
              onClick={() => onSoloLayer(node.name)}
              title="Solo / Isolate this layer"
              className="p-0.5 text-[#555555] hover:text-[#00FF00] opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Crosshair className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Render Child Sub-groups if expanded */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col">
            {node.children.map((childNode, childIdx) =>
              renderTreeNode(childNode, childIdx, node.children.length)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0C0C0C] text-[#E0E0E0] select-none font-mono">
      {/* Header */}
      <div className="p-3 border-b border-[#222222] bg-[#0E0E0E] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00FF00]" />
          <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
            Layer Hierarchy & Groups
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onShowAllLayers}
            title="Show All Layers"
            className="text-[10px] font-mono text-[#00FF00] hover:text-[#33FF33] px-2 py-0.5 bg-[#141414] border border-[#2B2B2B]"
          >
            All ({visibleCount}/{layers.length})
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Layer Actions & Hierarchy Toolbar */}
      <div className="px-3 py-2 bg-[#121212] border-b border-[#222222] flex flex-wrap items-center justify-between gap-1.5 shrink-0">
        <div className="flex items-center gap-1">
          {/* New Layer Button */}
          <button
            onClick={() => {
              setIsAddingLayer(!isAddingLayer);
              setIsAddingFolder(false);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#00FF00] text-[10px] font-bold uppercase tracking-wider border border-[#333333]"
            title="Create a new drawing layer"
          >
            <Plus className="w-3 h-3" />
            <span>New Layer</span>
          </button>

          {/* New Folder / Group Button */}
          <button
            onClick={() => {
              setIsAddingFolder(!isAddingFolder);
              setIsAddingLayer(false);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#FFAA00] text-[10px] font-bold uppercase tracking-wider border border-[#333333]"
            title="Create a new group folder container"
          >
            <FolderPlus className="w-3 h-3" />
            <span>Folder</span>
          </button>

          {/* Standardize Button */}
          {onStandardizeLayers && (
            <button
              onClick={onStandardizeLayers}
              title="Automatically standardize layer names into VECTORA 01_..., 02_... format"
              className="flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#AAAAAA] hover:text-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider border border-[#333333]"
            >
              <Wand2 className="w-3 h-3 text-[#00FF00]" />
              <span className="hidden sm:inline">Standardize</span>
            </button>
          )}
        </div>

        {/* Tree / Hierarchy Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={collapseAll}
            title="Collapse all nested groups"
            className="p-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#888888] hover:text-[#FFFFFF] border border-[#333333]"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            onClick={expandAll}
            title="Expand all nested groups"
            className="p-1 bg-[#1A1A1A] hover:bg-[#252525] text-[#888888] hover:text-[#FFFFFF] border border-[#333333]"
          >
            <Maximize2 className="w-3 h-3" />
          </button>

          {/* Hierarchy Mode Button */}
          <button
            onClick={() => setViewMode(viewMode === 'tree' ? 'flat' : 'tree')}
            title={`Switch to ${viewMode === 'tree' ? 'Flat List' : 'Tree Hierarchy'}`}
            className={`flex items-center gap-1 text-[9px] px-2 py-1 border font-bold uppercase transition-colors ${
              viewMode === 'tree'
                ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]'
                : 'bg-[#1E1E1E] text-[#888888] border-[#333333]'
            }`}
          >
            <FolderTree className="w-3 h-3" />
            <span>{viewMode === 'tree' ? 'Hierarchy' : 'Flat'}</span>
          </button>
        </div>
      </div>

      {/* Add Layer Quick Input Form */}
      {isAddingLayer && (
        <div className="p-2.5 bg-[#0F0F0F] border-b border-[#2B2B2B] flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            value={newLayerInput}
            onChange={(e) => setNewLayerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateLayer()}
            placeholder="e.g. 05_Details_Accents"
            autoFocus
            className="flex-1 bg-[#181818] border border-[#333333] focus:border-[#00FF00] px-2 py-1 text-xs text-[#FFFFFF] outline-none font-mono"
          />
          <button
            onClick={handleCreateLayer}
            className="px-2.5 py-1 bg-[#00FF00] text-[#000000] text-xs font-bold uppercase"
          >
            Add
          </button>
          <button
            onClick={() => setIsAddingLayer(false)}
            className="p-1 text-[#888888] hover:text-[#FFFFFF]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add Folder Quick Input Form */}
      {isAddingFolder && (
        <div className="p-2.5 bg-[#0F0F0F] border-b border-[#2B2B2B] flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            value={newFolderInput}
            onChange={(e) => setNewFolderInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            placeholder="e.g. Folder_Components"
            autoFocus
            className="flex-1 bg-[#181818] border border-[#333333] focus:border-[#FFAA00] px-2 py-1 text-xs text-[#FFFFFF] outline-none font-mono"
          />
          <button
            onClick={handleCreateFolder}
            className="px-2.5 py-1 bg-[#FFAA00] text-[#000000] text-xs font-bold uppercase"
          >
            Create
          </button>
          <button
            onClick={() => setIsAddingFolder(false)}
            className="p-1 text-[#888888] hover:text-[#FFFFFF]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tree Hierarchy or Flat Layer View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {viewMode === 'tree' && hierarchyNodes.length > 0 ? (
          <div className="flex flex-col">
            {hierarchyNodes.map((node, idx) =>
              renderTreeNode(node, idx, hierarchyNodes.length)
            )}
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            {layers.map((layer, index) => {
              const isVisible =
                localVisibility[layer.name] !== undefined
                  ? localVisibility[layer.name]
                  : localVisibility[layer.id] !== undefined
                  ? localVisibility[layer.id]
                  : layer.visible !== false;

              const isLocked =
                localLocks[layer.name] !== undefined
                  ? localLocks[layer.name]
                  : localLocks[layer.id] !== undefined
                  ? localLocks[layer.id]
                  : layer.locked === true;

              const isEditing = editingLayerName === layer.name;
              const isPerspectiveOpen = activePerspectiveMenu === layer.id;

              return (
                <div
                  key={`${layer.name}-${index}`}
                  className={`group p-2 border transition-all ${
                    isVisible
                      ? isLocked
                        ? 'bg-[#121212] border-[#383838] text-[#888888]'
                        : 'bg-[#141414] border-[#2B2B2B] hover:border-[#00FF00] text-[#FFFFFF]'
                      : 'bg-[#050505] border-[#181818] opacity-40 text-[#666666]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    {/* Visibility Toggle */}
                    <button
                      onClick={() => handleToggleNodeVisibility(layer.name, layer.id, isVisible)}
                      title={isVisible ? 'Hide Layer (turn OFF)' : 'Show Layer (turn ON)'}
                      className={`p-1 transition-colors ${
                        isVisible ? 'text-[#00FF00] hover:bg-[#222222]' : 'text-[#444444] hover:text-[#888888]'
                      }`}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Lock / Unlock Toggle */}
                    <button
                      onClick={() => handleToggleNodeLock(layer.name, layer.id, isLocked)}
                      title={isLocked ? 'Unlock Layer' : 'Lock Layer (prevent selection)'}
                      className={`p-1 transition-colors ${
                        isLocked ? 'text-[#FF5500] hover:bg-[#222222]' : 'text-[#444444] hover:text-[#888888]'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    {/* Layer Name & Inline Editor */}
                    <div className="flex-1 min-w-0 px-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(layer.name);
                              if (e.key === 'Escape') setEditingLayerName(null);
                            }}
                            autoFocus
                            className="w-full bg-[#000000] border border-[#00FF00] px-1.5 py-0.5 text-xs text-[#00FF00] outline-none font-mono"
                          />
                          <button
                            onClick={() => handleSaveRename(layer.name)}
                            className="p-1 bg-[#00FF00] text-[#000000]"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-[#666666] font-bold">
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                            <span
                              onDoubleClick={() => handleStartRename(layer.name)}
                              title="Double-click to rename"
                              className="text-xs font-bold truncate text-[#FFFFFF] cursor-pointer hover:text-[#00FF00]"
                            >
                              {layer.name}
                            </span>
                          </div>
                          {layer.description && (
                            <p className="text-[10px] text-[#777777] truncate font-mono">
                              {layer.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Order & Perspective Actions */}
                    <div className="flex items-center gap-0.5">
                      {/* Perspective Tool */}
                      <div className="relative">
                        <button
                          onClick={() => setActivePerspectiveMenu(isPerspectiveOpen ? null : layer.id)}
                          title="Apply 3D / Isometric Perspective"
                          className="p-1 text-[#666666] hover:text-[#00FFFF] hover:bg-[#222222]"
                        >
                          <Compass className="w-3 h-3" />
                        </button>

                        {isPerspectiveOpen && (
                          <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-[#0E0E0E] border border-[#333333] shadow-2xl p-1.5 flex flex-col gap-1 text-left font-mono">
                            <div className="text-[9px] text-[#00FFFF] font-bold uppercase tracking-wider px-1 py-0.5 border-b border-[#222222]">
                              Perspective & 3D Matrix
                            </div>
                            {PERSPECTIVE_PRESETS.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => handleApplyPerspective(layer.name, p.id, layer.id)}
                                className="text-left px-1.5 py-1 text-[10px] hover:bg-[#1A1A1A] hover:text-[#00FFFF] transition-colors flex flex-col"
                              >
                                <span className="font-bold text-[#FFFFFF]">{p.label}</span>
                                <span className="text-[8px] text-[#777777]">{p.desc}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {onReorderLayer && (
                        <>
                          <button
                            disabled={index === 0}
                            onClick={() => onReorderLayer(layer.name, 'down')}
                            title="Send Backward"
                            className="p-1 text-[#666666] hover:text-[#FFFFFF] hover:bg-[#222222] disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            disabled={index === layers.length - 1}
                            onClick={() => onReorderLayer(layer.name, 'up')}
                            title="Bring Forward"
                            className="p-1 text-[#666666] hover:text-[#FFFFFF] hover:bg-[#222222] disabled:opacity-20 disabled:hover:bg-transparent"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleStartRename(layer.name)}
                        title="Rename Layer"
                        className="p-1 text-[#666666] hover:text-[#00FF00] hover:bg-[#222222] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onSoloLayer(layer.name)}
                        title="Solo this layer"
                        className="p-1 text-[#666666] hover:text-[#00FF00] hover:bg-[#222222] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Crosshair className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Blend Mode Selector */}
                  <div className="mt-1.5 pt-1.5 border-t border-[#1F1F1F] flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-[#777777]">
                      <span className="uppercase tracking-wider font-bold text-[9px] text-[#888888]">Blend:</span>
                      <select
                        value={layer.blendMode || 'normal'}
                        onChange={(e) => onSetBlendMode && onSetBlendMode(layer.name, e.target.value, layer.id)}
                        title={`Blend Mode for ${layer.name}`}
                        className="bg-[#1A1A1A] text-[#00FF00] font-bold border border-[#333333] hover:border-[#00FF00] focus:border-[#00FF00] px-1.5 py-0.5 outline-none cursor-pointer uppercase rounded-none text-[10px]"
                      >
                        {BLEND_MODES.map((bm) => (
                          <option key={bm} value={bm} className="bg-[#141414] text-[#FFFFFF]">
                            {bm}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[#666666] font-mono text-[9px]">{layer.elementCount || 0} nodes</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-[#222222] bg-[#0A0A0A] text-[11px] font-mono text-[#888888] flex justify-between items-center shrink-0">
        <span className="uppercase tracking-wider text-[10px]">HIERARCHY ENGINE</span>
        <span className="text-[#00FF00] font-bold text-[10px]">
          {layers.length} Layers · {viewMode === 'tree' ? 'Tree Active' : 'Flat List'}
        </span>
      </div>
    </div>
  );
};
