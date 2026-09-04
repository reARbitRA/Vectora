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
  Box,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface LayerPanelProps {
  layers: LayerSpec[];
  svgString?: string;
  onToggleLayer: (layerName: string) => void;
  onToggleLock?: (layerName: string) => void;
  onRenameLayer?: (oldName: string, newName: string) => void;
  onReorderLayer?: (layerName: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onAddNewLayer?: (name: string) => void;
  onStandardizeLayers?: () => void;
  onSetBlendMode?: (layerName: string, blendMode: string) => void;
  onSoloLayer: (layerName: string) => void;
  onShowAllLayers: () => void;
  onClose: () => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  svgString = '',
  onToggleLayer,
  onToggleLock,
  onRenameLayer,
  onReorderLayer,
  onAddNewLayer,
  onStandardizeLayers,
  onSetBlendMode,
  onSoloLayer,
  onShowAllLayers,
  onClose,
}) => {
  const [editingLayerName, setEditingLayerName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [isAddingLayer, setIsAddingLayer] = useState(false);
  const [newLayerInput, setNewLayerInput] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // Parse nested hierarchy tree from SVG
  const hierarchyNodes = useMemo(() => {
    if (!svgString) return [];
    return parseSvgHierarchy(svgString);
  }, [svgString]);

  const visibleCount = layers.filter((l) => l.visible !== false).length;

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

  // Render recursive tree node
  const renderTreeNode = (node: LayerHierarchyNode, index: number, totalAtLevel: number) => {
    const isCollapsed = collapsedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isVisible = node.visible;
    const isLocked = node.locked;
    const isEditing = editingLayerName === node.name;
    const isTopLayer = node.depth === 0;

    return (
      <div key={node.id} className="relative flex flex-col">
        {/* Node Row */}
        <div
          style={{ paddingLeft: `${node.depth * 18 + 8}px` }}
          className={`group relative pr-2 py-1.5 border-b border-[#1A1A1A] transition-all flex items-center justify-between gap-1.5 ${
            isVisible
              ? isLocked
                ? 'bg-[#121212] text-[#888888]'
                : isTopLayer
                ? 'bg-[#161616] hover:bg-[#1C1C1C] text-[#FFFFFF]'
                : 'bg-[#0E0E0E] hover:bg-[#161616] text-[#DDDDDD]'
              : 'bg-[#060606] opacity-40 text-[#555555]'
          }`}
        >
          {/* Tree branching connector guide for nested nodes */}
          {node.depth > 0 && (
            <div
              style={{ left: `${(node.depth - 1) * 18 + 14}px` }}
              className="absolute top-0 bottom-1/2 w-3 border-l border-b border-[#333333] pointer-events-none"
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

            {/* Icon indicating Layer or Sub-group container */}
            {isTopLayer ? (
              <Layers className="w-3.5 h-3.5 text-[#00FF00] shrink-0" />
            ) : hasChildren ? (
              isCollapsed ? (
                <Folder className="w-3.5 h-3.5 text-[#FFAA00] shrink-0" />
              ) : (
                <FolderOpen className="w-3.5 h-3.5 text-[#FFAA00] shrink-0" />
              )
            ) : (
              <Box className="w-3 h-3 text-[#777777] shrink-0" />
            )}

            {/* Visibility Toggle */}
            <button
              onClick={() => onToggleLayer(node.name)}
              title={isVisible ? 'Hide this container' : 'Show this container'}
              className={`p-0.5 transition-colors ${
                isVisible ? 'text-[#00FF00] hover:bg-[#222222]' : 'text-[#444444] hover:text-[#888888]'
              }`}
            >
              {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Lock / Unlock Toggle */}
            {onToggleLock && (
              <button
                onClick={() => onToggleLock(node.name)}
                title={isLocked ? 'Unlock group' : 'Lock group (prevent selection)'}
                className={`p-0.5 transition-colors ${
                  isLocked ? 'text-[#FF5500] hover:bg-[#222222]' : 'text-[#444444] hover:text-[#888888]'
                }`}
              >
                {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
            )}

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

          {/* Right Controls: Nodes count & Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-[#666666] font-mono mr-1">
              {node.elementCount}
            </span>

            {/* Quick Actions (Reorder top-level layers) */}
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
              title="Solo/Isolate"
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
    <aside className="w-88 md:w-96 bg-[#0A0A0A] border-l border-[#333333] flex flex-col h-full z-20 select-none font-mono">
      {/* Header */}
      <div className="p-3 border-b border-[#333333] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00FF00]" />
          <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
            Layer Hierarchy & Groups
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onShowAllLayers}
            title="Show All Layers"
            className="text-[10px] font-mono text-[#00FF00] hover:text-[#33FF33] px-2 py-0.5 bg-[#141414] border border-[#333333]"
          >
            All ({visibleCount}/{layers.length})
          </button>
          <button
            onClick={onClose}
            className="p-1 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer Actions & Hierarchy Toolbar */}
      <div className="px-3 py-1.5 bg-[#141414] border-b border-[#333333] flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAddingLayer(!isAddingLayer)}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#00FF00] text-[10px] font-bold uppercase tracking-wider border border-[#333333]"
          >
            <Plus className="w-3 h-3" />
            <span>New Layer</span>
          </button>

          {onStandardizeLayers && (
            <button
              onClick={onStandardizeLayers}
              title="Automatically format layer names into VECTORA standard 01_..., 02_..."
              className="flex items-center gap-1 px-2 py-0.5 bg-[#1A1A1A] hover:bg-[#252525] text-[#AAAAAA] hover:text-[#FFFFFF] text-[10px] font-bold uppercase tracking-wider border border-[#333333]"
            >
              <Wand2 className="w-3 h-3 text-[#00FF00]" />
              <span className="hidden sm:inline">Standardize</span>
            </button>
          )}
        </div>

        {/* Tree controls */}
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
          <button
            onClick={() => setViewMode(viewMode === 'tree' ? 'flat' : 'tree')}
            title={`Switch to ${viewMode === 'tree' ? 'Flat List' : 'Tree Hierarchy'}`}
            className="text-[9px] px-1.5 py-0.5 bg-[#1E1E1E] text-[#00FF00] border border-[#333333] font-bold uppercase"
          >
            {viewMode === 'tree' ? 'Tree' : 'Flat'}
          </button>
        </div>
      </div>

      {/* Add Layer Quick Input Form */}
      {isAddingLayer && (
        <div className="p-2.5 bg-[#0F0F0F] border-b border-[#333333] flex items-center gap-1.5">
          <input
            type="text"
            value={newLayerInput}
            onChange={(e) => setNewLayerInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateLayer()}
            placeholder="e.g. 05_Details_Accents"
            autoFocus
            className="flex-1 bg-[#1A1A1A] border border-[#333333] focus:border-[#00FF00] px-2 py-1 text-xs text-[#FFFFFF] outline-none font-mono"
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

      {/* Info Tip */}
      <div className="px-3 py-1.5 bg-[#0A0A0A] border-b border-[#222222] flex items-center justify-between text-[10px] text-[#888888]">
        <div className="flex items-center gap-1.5">
          <Info className="w-3 h-3 text-[#00FF00] shrink-0" />
          <span>Hierarchy & Group Nesting</span>
        </div>
        <span className="text-[#00FF00] font-bold text-[9px]">
          {hierarchyNodes.length} Root Layers
        </span>
      </div>

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
              const isVisible = layer.visible !== false;
              const isLocked = layer.locked === true;
              const isEditing = editingLayerName === layer.name;

              return (
                <div
                  key={`${layer.name}-${index}`}
                  className={`group p-2 border transition-all ${
                    isVisible
                      ? isLocked
                        ? 'bg-[#121212] border-[#444444] text-[#888888]'
                        : 'bg-[#141414] border-[#333333] hover:border-[#00FF00] text-[#FFFFFF]'
                      : 'bg-[#050505] border-[#1A1A1A] opacity-40 text-[#666666]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    {/* Visibility Toggle */}
                    <button
                      onClick={() => onToggleLayer(layer.name)}
                      title={isVisible ? 'Hide Layer' : 'Show Layer'}
                      className={`p-1 transition-colors ${
                        isVisible ? 'text-[#00FF00] hover:bg-[#222222]' : 'text-[#444444] hover:text-[#888888]'
                      }`}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Lock / Unlock Toggle */}
                    {onToggleLock && (
                      <button
                        onClick={() => onToggleLock(layer.name)}
                        title={isLocked ? 'Unlock Layer' : 'Lock Layer (Prevent selection)'}
                        className={`p-1 transition-colors ${
                          isLocked ? 'text-[#FF5500] hover:bg-[#222222]' : 'text-[#444444] hover:text-[#888888]'
                        }`}
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    )}

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
                          <p className="text-[10px] text-[#777777] truncate font-mono">
                            {layer.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order & Management Actions */}
                    <div className="flex items-center gap-0.5">
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
                  <div className="mt-1.5 pt-1.5 border-t border-[#222222] flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-[#777777]">
                      <span className="uppercase tracking-wider font-bold text-[9px] text-[#888888]">Blend:</span>
                      <select
                        value={layer.blendMode || 'normal'}
                        onChange={(e) => onSetBlendMode && onSetBlendMode(layer.name, e.target.value)}
                        title={`Blend Mode for ${layer.name}`}
                        className="bg-[#1A1A1A] text-[#00FF00] font-bold border border-[#333333] hover:border-[#00FF00] focus:border-[#00FF00] px-1.5 py-0.5 outline-none cursor-pointer uppercase rounded-none text-[10px]"
                      >
                        <option value="normal" className="bg-[#141414] text-[#FFFFFF]">Normal</option>
                        <option value="multiply" className="bg-[#141414] text-[#00FF00]">Multiply</option>
                        <option value="screen" className="bg-[#141414] text-[#00FF00]">Screen</option>
                        <option value="overlay" className="bg-[#141414] text-[#00FF00]">Overlay</option>
                        <option value="darken" className="bg-[#141414] text-[#00FF00]">Darken</option>
                        <option value="lighten" className="bg-[#141414] text-[#00FF00]">Lighten</option>
                        <option value="color-dodge" className="bg-[#141414] text-[#00FF00]">Color Dodge</option>
                        <option value="color-burn" className="bg-[#141414] text-[#00FF00]">Color Burn</option>
                        <option value="hard-light" className="bg-[#141414] text-[#00FF00]">Hard Light</option>
                        <option value="soft-light" className="bg-[#141414] text-[#00FF00]">Soft Light</option>
                        <option value="difference" className="bg-[#141414] text-[#00FF00]">Difference</option>
                        <option value="exclusion" className="bg-[#141414] text-[#00FF00]">Exclusion</option>
                        <option value="hue" className="bg-[#141414] text-[#00FF00]">Hue</option>
                        <option value="saturation" className="bg-[#141414] text-[#00FF00]">Saturation</option>
                        <option value="color" className="bg-[#141414] text-[#00FF00]">Color</option>
                        <option value="luminosity" className="bg-[#141414] text-[#00FF00]">Luminosity</option>
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

      {/* Footer Specs */}
      <div className="p-3 border-t border-[#333333] bg-[#0A0A0A] text-[11px] font-mono text-[#888888] flex justify-between items-center">
        <span>HIERARCHY ENGINE</span>
        <span className="text-[#00FF00] font-bold">{layers.length} Layers · Tree Active</span>
      </div>
    </aside>
  );
};
