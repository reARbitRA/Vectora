import { LayerSpec, LayerHierarchyNode, PaletteColor, SvgMetrics } from '../types';

/**
 * Inkscape layer attributes are namespaced. Setting them via plain
 * `setAttribute('inkscape:label', …)` is invalid on programmatically created
 * elements (throws InvalidStateError in some environments — including the
 * previous silent failure in addNewSvgLayer) and is not namespace-correct
 * in any environment. Always use these helpers.
 */
const INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape";

function setInkscapeAttr(el: Element, qualifiedName: 'inkscape:groupmode' | 'inkscape:label', value: string): void {
  el.setAttributeNS(INKSCAPE_NS, qualifiedName, value);
}

export function parseSvgLayers(svgString: string): LayerSpec[] {
  if (!svgString) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    // Check for parser errors
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      console.warn('SVG Parse Error in parseSvgLayers:', errorNode.textContent);
      return [];
    }

    const layers: LayerSpec[] = [];

    // Find all <g> elements with inkscape:groupmode="layer" or inkscape:label or id starting with layer
    const allGroups = doc.querySelectorAll('g');
    allGroups.forEach((group) => {
      const isLayer =
        group.getAttribute('inkscape:groupmode') === 'layer' ||
        group.hasAttribute('inkscape:label') ||
        (group.id && group.id.toLowerCase().includes('layer'));

      if (isLayer) {
        const label =
          group.getAttribute('inkscape:label') ||
          group.id ||
          'Unnamed_Layer';
        
        // Count direct and descendant drawable elements
        const count = group.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon, text, use').length;
        const isLocked = group.getAttribute('pointer-events') === 'none' || group.getAttribute('data-locked') === 'true';

        // Extract blend mode from style attribute or attribute
        const styleAttr = group.getAttribute('style') || '';
        let blendMode = group.getAttribute('mix-blend-mode') || '';
        if (!blendMode && styleAttr) {
          const match = styleAttr.match(/mix-blend-mode\s*:\s*([a-zA-Z-]+)/i);
          if (match) blendMode = match[1].toLowerCase();
        }
        if (!blendMode) blendMode = 'normal';

        layers.push({
          id: group.id || label,
          name: label,
          description: `Contains ${count} vector primitives & paths`,
          elementCount: count,
          visible: group.getAttribute('display') !== 'none' && group.getAttribute('visibility') !== 'hidden',
          locked: isLocked,
          blendMode: blendMode,
        });
      }
    });

    if (layers.length === 0) {
      // Fallback: group top-level elements or create a default layer
      layers.push({
        id: 'layer-01-base',
        name: '01_Base_Artwork',
        description: 'Single layer containing all root vector nodes',
        elementCount: doc.querySelectorAll('path, rect, circle, ellipse, line, polygon, text').length,
        visible: true,
        locked: false,
        blendMode: 'normal',
      });
    }

    return layers;
  } catch (err) {
    console.error('Error parsing SVG layers:', err);
    return [];
  }
}

/**
 * Parses full nested tree hierarchy of <g> elements within the SVG,
 * capturing multi-level groups, sub-groups, child nodes, blend modes, and states.
 */
export function parseSvgHierarchy(svgString: string): LayerHierarchyNode[] {
  if (!svgString) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      console.warn('SVG Parse Error in parseSvgHierarchy:', errorNode.textContent);
      return [];
    }

    const rootSvg = doc.querySelector('svg');
    if (!rootSvg) return [];

    let autoIdCounter = 1;

    function buildNode(el: Element, depth: number, parentId?: string): LayerHierarchyNode {
      const isLayer =
        el.getAttribute('inkscape:groupmode') === 'layer' ||
        el.hasAttribute('inkscape:label') ||
        (el.id && el.id.toLowerCase().includes('layer'));

      const id = el.id || `node-${depth}-${autoIdCounter++}`;
      const label =
        el.getAttribute('inkscape:label') ||
        el.id ||
        (depth === 0 ? `Layer_${autoIdCounter}` : `Group_${el.tagName.toLowerCase()}_${autoIdCounter}`);

      const count = el.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon, text, use').length;
      const isLocked = el.getAttribute('pointer-events') === 'none' || el.getAttribute('data-locked') === 'true';

      const styleAttr = el.getAttribute('style') || '';
      let blendMode = el.getAttribute('mix-blend-mode') || '';
      if (!blendMode && styleAttr) {
        const match = styleAttr.match(/mix-blend-mode\s*:\s*([a-zA-Z-]+)/i);
        if (match) blendMode = match[1].toLowerCase();
      }
      if (!blendMode) blendMode = 'normal';

      // Find direct child <g> elements only
      const childGroupElements: Element[] = [];
      Array.from(el.children).forEach((child) => {
        if (child.tagName.toLowerCase() === 'g') {
          childGroupElements.push(child);
        }
      });

      const children = childGroupElements.map((childEl) => buildNode(childEl, depth + 1, id));

      return {
        id,
        name: label,
        label,
        description: `${count} vector elements${children.length > 0 ? ` (${children.length} sub-groups)` : ''}`,
        elementCount: count,
        visible: el.getAttribute('display') !== 'none' && el.getAttribute('visibility') !== 'hidden',
        locked: isLocked,
        blendMode,
        depth,
        isGroup: true,
        isLayer: depth === 0 && isLayer,
        parentId,
        children,
      };
    }

    // Top-level groups directly under <svg>
    const topLevelGroups = Array.from(rootSvg.children).filter(
      (c) => c.tagName.toLowerCase() === 'g'
    );

    if (topLevelGroups.length > 0) {
      return topLevelGroups.map((g) => buildNode(g, 0));
    }

    // Fallback if no top-level <g>
    return [
      {
        id: 'layer-root',
        name: '01_Base_Artwork',
        label: '01_Base_Artwork',
        description: `${rootSvg.querySelectorAll('path, rect, circle, ellipse, line, polygon, text').length} nodes`,
        elementCount: rootSvg.querySelectorAll('path, rect, circle, ellipse, line, polygon, text').length,
        visible: true,
        locked: false,
        blendMode: 'normal',
        depth: 0,
        isGroup: true,
        isLayer: true,
        children: [],
      },
    ];
  } catch (err) {
    console.error('Error parsing SVG hierarchy:', err);
    return [];
  }
}

/**
 * Toggle visibility of any node in the SVG tree by its ID or inkscape:label
 */
export function setSvgNodeVisibility(svgString: string, nodeIdOrName: string, visible: boolean): string {
  if (!svgString || !nodeIdOrName) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const groups = doc.querySelectorAll('g');

    groups.forEach((g) => {
      if (
        g.id === nodeIdOrName ||
        g.getAttribute('inkscape:label') === nodeIdOrName ||
        g.id === nodeIdOrName.toLowerCase().replace(/_/g, '-')
      ) {
        if (visible) {
          g.removeAttribute('display');
          g.removeAttribute('visibility');
        } else {
          g.setAttribute('display', 'none');
        }
      }
    });

    const rootSvg = doc.querySelector('svg');
    return rootSvg ? rootSvg.outerHTML : svgString;
  } catch (err) {
    console.error('Error toggling SVG node visibility:', err);
    return svgString;
  }
}

/**
 * Toggle lock of any node in the SVG tree by its ID or inkscape:label
 */
export function setSvgNodeLock(svgString: string, nodeIdOrName: string, locked: boolean): string {
  if (!svgString || !nodeIdOrName) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const groups = doc.querySelectorAll('g');

    groups.forEach((g) => {
      if (
        g.id === nodeIdOrName ||
        g.getAttribute('inkscape:label') === nodeIdOrName ||
        g.id === nodeIdOrName.toLowerCase().replace(/_/g, '-')
      ) {
        if (locked) {
          g.setAttribute('pointer-events', 'none');
          g.setAttribute('data-locked', 'true');
        } else {
          g.removeAttribute('pointer-events');
          g.removeAttribute('data-locked');
        }
      }
    });

    const rootSvg = doc.querySelector('svg');
    return rootSvg ? rootSvg.outerHTML : svgString;
  } catch (err) {
    console.error('Error setting SVG node lock:', err);
    return svgString;
  }
}

// Rename layer in SVG
export function renameSvgLayer(svgString: string, oldName: string, newName: string): string {
  if (!svgString || !oldName || !newName) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const groups = doc.querySelectorAll('g');
    
    let matched = false;
    groups.forEach((g) => {
      if (
        g.getAttribute('inkscape:label') === oldName ||
        g.id === oldName ||
        g.id === oldName.toLowerCase().replace(/_/g, '-')
      ) {
        setInkscapeAttr(g, 'inkscape:label', newName);
        setInkscapeAttr(g, 'inkscape:groupmode', 'layer');
        if (g.id) {
          g.id = newName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
        }
        matched = true;
      }
    });

    if (matched) {
      const rootSvg = doc.querySelector('svg');
      return rootSvg ? rootSvg.outerHTML : svgString;
    }
    return svgString;
  } catch (err) {
    console.error('Error renaming SVG layer:', err);
    return svgString;
  }
}

// Toggle layer visibility in SVG string
export function setSvgLayerVisibility(svgString: string, layerName: string, visible: boolean): string {
  if (!svgString || !layerName) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const groups = doc.querySelectorAll('g');
    
    groups.forEach((g) => {
      if (
        g.getAttribute('inkscape:label') === layerName ||
        g.id === layerName ||
        g.id === layerName.toLowerCase().replace(/_/g, '-')
      ) {
        if (visible) {
          g.removeAttribute('display');
          g.removeAttribute('visibility');
        } else {
          g.setAttribute('display', 'none');
        }
      }
    });

    const rootSvg = doc.querySelector('svg');
    return rootSvg ? rootSvg.outerHTML : svgString;
  } catch (err) {
    console.error('Error toggling SVG layer visibility:', err);
    return svgString;
  }
}

// Toggle layer lock in SVG string
export function setSvgLayerLock(svgString: string, layerName: string, locked: boolean): string {
  if (!svgString || !layerName) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const groups = doc.querySelectorAll('g');
    
    groups.forEach((g) => {
      if (
        g.getAttribute('inkscape:label') === layerName ||
        g.id === layerName ||
        g.id === layerName.toLowerCase().replace(/_/g, '-')
      ) {
        if (locked) {
          g.setAttribute('pointer-events', 'none');
          g.setAttribute('data-locked', 'true');
        } else {
          g.removeAttribute('pointer-events');
          g.removeAttribute('data-locked');
        }
      }
    });

    const rootSvg = doc.querySelector('svg');
    return rootSvg ? rootSvg.outerHTML : svgString;
  } catch (err) {
    console.error('Error setting SVG layer lock:', err);
    return svgString;
  }
}

// Update layer blend mode in SVG string
export function setSvgLayerBlendMode(svgString: string, layerName: string, blendMode: string): string {
  if (!svgString || !layerName) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const groups = doc.querySelectorAll('g');

    groups.forEach((g) => {
      if (
        g.getAttribute('inkscape:label') === layerName ||
        g.id === layerName ||
        g.id === layerName.toLowerCase().replace(/_/g, '-')
      ) {
        let styleStr = g.getAttribute('style') || '';
        // Remove existing mix-blend-mode definition
        styleStr = styleStr.replace(/mix-blend-mode\s*:\s*[^;]+;?/gi, '').trim();

        if (blendMode && blendMode !== 'normal') {
          if (styleStr && !styleStr.endsWith(';')) {
            styleStr += ';';
          }
          styleStr = styleStr ? `${styleStr} mix-blend-mode: ${blendMode};` : `mix-blend-mode: ${blendMode};`;
          g.setAttribute('style', styleStr.trim());
          g.setAttribute('mix-blend-mode', blendMode);
        } else {
          g.removeAttribute('mix-blend-mode');
          if (styleStr) {
            g.setAttribute('style', styleStr);
          } else {
            g.removeAttribute('style');
          }
        }
      }
    });

    const rootSvg = doc.querySelector('svg');
    return rootSvg ? rootSvg.outerHTML : svgString;
  } catch (err) {
    console.error('Error setting SVG layer blend mode:', err);
    return svgString;
  }
}

// Move layer position (Draw Order) in SVG
export function reorderSvgLayer(svgString: string, layerName: string, direction: 'up' | 'down' | 'top' | 'bottom'): string {
  if (!svgString || !layerName) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const rootSvg = doc.querySelector('svg');
    if (!rootSvg) return svgString;

    // Get layer groups
    const layerGroups: Element[] = [];
    const allGroups = rootSvg.querySelectorAll('g');
    allGroups.forEach((g) => {
      if (
        g.getAttribute('inkscape:groupmode') === 'layer' ||
        g.hasAttribute('inkscape:label') ||
        (g.id && g.id.toLowerCase().includes('layer'))
      ) {
        // Ensure it's a top-level layer or directly under svg
        if (g.parentElement?.tagName.toLowerCase() === 'svg') {
          layerGroups.push(g);
        }
      }
    });

    if (layerGroups.length <= 1) return svgString;

    const currentIndex = layerGroups.findIndex(
      (g) =>
        g.getAttribute('inkscape:label') === layerName ||
        g.id === layerName ||
        g.id === layerName.toLowerCase().replace(/_/g, '-')
    );

    if (currentIndex === -1) return svgString;

    const targetNode = layerGroups[currentIndex];

    if (direction === 'up' && currentIndex < layerGroups.length - 1) {
      // In SVG painters algorithm, later siblings render ON TOP of earlier siblings.
      // Moving "up" in layer hierarchy (towards top/front) means moving later in DOM.
      const nextNode = layerGroups[currentIndex + 1];
      rootSvg.insertBefore(nextNode, targetNode);
    } else if (direction === 'down' && currentIndex > 0) {
      // Moving "down" in layer hierarchy (towards back) means moving earlier in DOM.
      const prevNode = layerGroups[currentIndex - 1];
      rootSvg.insertBefore(targetNode, prevNode);
    } else if (direction === 'top') {
      // Bring to top (append to end of svg)
      rootSvg.appendChild(targetNode);
    } else if (direction === 'bottom') {
      // Send to bottom (insert before first child or after <defs>)
      const defs = rootSvg.querySelector('defs');
      if (defs && defs.nextSibling) {
        rootSvg.insertBefore(targetNode, defs.nextSibling);
      } else {
        rootSvg.insertBefore(targetNode, rootSvg.firstChild);
      }
    }

    return rootSvg.outerHTML;
  } catch (err) {
    console.error('Error reordering SVG layer:', err);
    return svgString;
  }
}

// Add a new empty layer group to SVG
export function addNewSvgLayer(svgString: string, layerName: string, position: 'top' | 'bottom' = 'top'): string {
  if (!svgString) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const rootSvg = doc.querySelector('svg');
    if (!rootSvg) return svgString;

    const newGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    setInkscapeAttr(newGroup, 'inkscape:groupmode', 'layer');
    setInkscapeAttr(newGroup, 'inkscape:label', layerName);
    newGroup.setAttribute('id', layerName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-'));

    if (position === 'top') {
      rootSvg.appendChild(newGroup);
    } else {
      const defs = rootSvg.querySelector('defs');
      if (defs && defs.nextSibling) {
        rootSvg.insertBefore(newGroup, defs.nextSibling);
      } else {
        rootSvg.insertBefore(newGroup, rootSvg.firstChild);
      }
    }

    return rootSvg.outerHTML;
  } catch (err) {
    console.error('Error adding new SVG layer:', err);
    return svgString;
  }
}

// Standardize all layer names to follow VECTORA conventions (01_Background, 02_Shapes_Primary, etc.)
export function standardizeSvgLayers(svgString: string): string {
  if (!svgString) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const rootSvg = doc.querySelector('svg');
    if (!rootSvg) return svgString;

    const groups: Element[] = [];
    rootSvg.querySelectorAll('g').forEach((g) => {
      if (
        g.getAttribute('inkscape:groupmode') === 'layer' ||
        g.hasAttribute('inkscape:label') ||
        (g.id && g.id.toLowerCase().includes('layer'))
      ) {
        if (g.parentElement?.tagName.toLowerCase() === 'svg') {
          groups.push(g);
        }
      }
    });

    if (groups.length === 0) return svgString;

    // Standard naming template based on position
    const standardCategories = [
      'Background_Grid',
      'Geometry_Structural',
      'Shapes_Primary',
      'Artwork_Core',
      'Details_Secondary',
      'Typography_Labels',
      'Accents_Highlights',
      'FX_Overlays',
    ];

    groups.forEach((g, index) => {
      const prefix = String(index + 1).padStart(2, '0');
      const currentLabel = g.getAttribute('inkscape:label') || g.id || 'Layer';
      
      // Strip old numeric prefix if any
      const stripped = currentLabel.replace(/^\d+[\s_-]*/, '');
      const category = standardCategories[index % standardCategories.length];
      const newLabel = stripped.length > 2 ? `${prefix}_${stripped}` : `${prefix}_${category}`;

      setInkscapeAttr(g, 'inkscape:groupmode', 'layer');
      setInkscapeAttr(g, 'inkscape:label', newLabel);
      g.id = newLabel.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
    });

    return rootSvg.outerHTML;
  } catch (err) {
    console.error('Error standardizing SVG layers:', err);
    return svgString;
  }
}

// Inject Reusable Component into SVG (<defs> + <use>)
export function injectReusableComponent(
  svgString: string,
  defsSnippet: string,
  useSnippet: string
): string {
  if (!svgString) return svgString;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const rootSvg = doc.querySelector('svg');
    if (!rootSvg) return svgString;

    // Ensure <defs> exists
    let defs = rootSvg.querySelector('defs');
    if (!defs) {
      defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
      rootSvg.insertBefore(defs, rootSvg.firstChild);
    }

    // Append to defs by parsing defsSnippet
    const tempDefsDoc = parser.parseFromString(`<defs>${defsSnippet}</defs>`, 'image/svg+xml');
    const defsNodes = tempDefsDoc.querySelector('defs')?.children;
    if (defsNodes) {
      Array.from(defsNodes).forEach((node) => {
        defs.appendChild(doc.importNode(node, true));
      });
    }

    // Append to root SVG or active layer
    const tempUseDoc = parser.parseFromString(`<g>${useSnippet}</g>`, 'image/svg+xml');
    const useNodes = tempUseDoc.querySelector('g')?.children;
    if (useNodes) {
      const targetLayer = rootSvg.querySelector('g[inkscape\\:groupmode="layer"]:last-of-type') || rootSvg;
      Array.from(useNodes).forEach((node) => {
        targetLayer.appendChild(doc.importNode(node, true));
      });
    }

    return rootSvg.outerHTML;
  } catch (err) {
    console.error('Error injecting reusable component:', err);
    return svgString;
  }
}

export function computeSvgMetrics(svgString: string): SvgMetrics {
  if (!svgString) {
    return {
      totalElements: 0,
      pathCount: 0,
      circleCount: 0,
      rectCount: 0,
      polygonCount: 0,
      textCount: 0,
      groupCount: 0,
      defsCount: 0,
      byteSize: 0,
      formattedSize: '0 B',
      gzipEstimate: '0 B',
      complianceScore: 0,
      complianceChecks: {
        hasXmlns: false,
        hasViewBox: false,
        hasLayerGroups: false,
        hasDefs: false,
        hasTitle: false,
        hasDesc: false,
        noExternalRasters: true,
        hasStyleBlock: false,
      },
    };
  }

  const byteSize = new Blob([svgString]).size;
  const formattedSize =
    byteSize < 1024
      ? `${byteSize} B`
      : `${(byteSize / 1024).toFixed(1)} KB`;
  const gzipEstimate = `${Math.max(1, Math.round(byteSize * 0.32 / 1024 * 10) / 10)} KB`;

  let totalElements = 0;
  let pathCount = 0;
  let circleCount = 0;
  let rectCount = 0;
  let polygonCount = 0;
  let textCount = 0;
  let groupCount = 0;
  let defsCount = 0;

  const hasXmlns = svgString.includes('xmlns=');
  const hasViewBox = svgString.includes('viewBox=');
  const hasLayerGroups = svgString.includes('inkscape:label=') || svgString.includes('inkscape:groupmode="layer"');
  const hasDefs = svgString.includes('<defs>');
  const hasTitle = svgString.includes('<title>');
  const hasDesc = svgString.includes('<desc>');
  const hasStyleBlock = svgString.includes('<style>');
  const noExternalRasters = !svgString.includes('http://') && !svgString.includes('https://') && !svgString.includes('<image');

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    pathCount = doc.querySelectorAll('path').length;
    circleCount = doc.querySelectorAll('circle, ellipse').length;
    rectCount = doc.querySelectorAll('rect').length;
    polygonCount = doc.querySelectorAll('polygon, polyline').length;
    textCount = doc.querySelectorAll('text').length;
    groupCount = doc.querySelectorAll('g').length;
    defsCount = doc.querySelectorAll('defs').length;
    totalElements = doc.querySelectorAll('*').length;
  } catch {
    // fallback regex counts
    pathCount = (svgString.match(/<path/g) || []).length;
    circleCount = (svgString.match(/<circle|<ellipse/g) || []).length;
    rectCount = (svgString.match(/<rect/g) || []).length;
    polygonCount = (svgString.match(/<polygon|<polyline/g) || []).length;
    textCount = (svgString.match(/<text/g) || []).length;
    groupCount = (svgString.match(/<g/g) || []).length;
  }

  // Calculate compliance score (0 - 100)
  const checks = [
    hasXmlns,
    hasViewBox,
    hasLayerGroups,
    hasDefs,
    hasTitle,
    hasDesc,
    noExternalRasters,
    hasStyleBlock,
  ];
  const passedCount = checks.filter(Boolean).length;
  const complianceScore = Math.round((passedCount / checks.length) * 100);

  return {
    totalElements,
    pathCount,
    circleCount,
    rectCount,
    polygonCount,
    textCount,
    groupCount,
    defsCount,
    byteSize,
    formattedSize,
    gzipEstimate,
    complianceScore,
    complianceChecks: {
      hasXmlns,
      hasViewBox,
      hasLayerGroups,
      hasDefs,
      hasTitle,
      hasDesc,
      noExternalRasters,
      hasStyleBlock,
    },
  };
}

export function extractSvgColors(svgString: string): PaletteColor[] {
  if (!svgString) return [];
  const colorMap = new Map<string, number>();

  // Match hex colors #RGB and #RRGGBB
  const hexMatches = svgString.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || [];
  hexMatches.forEach((hex) => {
    const normalized = hex.toLowerCase();
    colorMap.set(normalized, (colorMap.get(normalized) || 0) + 1);
  });

  // Sort by frequency
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const roleList: PaletteColor['role'][] = ['background', 'primary', 'secondary', 'accent', 'ink', 'surface', 'glow'];

  return sorted.map(([hex, _count], index) => {
    return {
      name: `Color ${index + 1} (${hex.toUpperCase()})`,
      hex: hex.toUpperCase(),
      role: roleList[index % roleList.length],
    };
  });
}

// Remap colors in SVG based on a target theme palette
export function remapSvgColors(svgString: string, targetColors: string[]): string {
  if (!svgString || !targetColors || targetColors.length === 0) return svgString;

  const currentColors = Array.from(new Set(svgString.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/gi) || []));
  if (currentColors.length === 0) return svgString;

  let modified = svgString;

  // Map each unique color to target color in order
  currentColors.forEach((sourceColor, idx) => {
    const target = targetColors[idx % targetColors.length];
    const regex = new RegExp(sourceColor, 'gi');
    modified = modified.replace(regex, target);
  });

  return modified;
}

// Format/Beautify XML indentation
export function formatSvgXml(xml: string): string {
  if (!xml) return '';
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Remove existing unnecessary newlines/whitespace between tags
  const cleanXml = xml.replace(/>\s*</g, '><').trim();
  const tokens = cleanXml.split(/(<[^>]+>)/g).filter(Boolean);

  tokens.forEach((token) => {
    if (token.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      formatted += `${tab.repeat(indent)}${token}\n`;
    } else if (token.startsWith('<') && !token.endsWith('/>') && !token.startsWith('<?') && !token.startsWith('<!')) {
      formatted += `${tab.repeat(indent)}${token}\n`;
      if (!token.startsWith('<link') && !token.startsWith('<meta') && !token.startsWith('<input')) {
        indent += 1;
      }
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      formatted += `${tab.repeat(indent)}${token}\n`;
    } else if (token.trim()) {
      formatted += `${tab.repeat(indent)}${token.trim()}\n`;
    }
  });

  return formatted.trim();
}

// Generate React Component Code
export function svgToReactComponent(svgString: string, componentName = 'VectorGraphic'): string {
  if (!svgString) return '';
  // Convert standard SVG attributes to React camelCase
  let jsx = svgString
    .replace(/xmlns:inkscape="[^"]*"/g, '')
    .replace(/inkscape:[a-z]+="[^"]*"/gi, '')
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')
    .replace(/stroke-dasharray/g, 'strokeDasharray')
    .replace(/stroke-dashoffset/g, 'strokeDashoffset')
    .replace(/stroke-opacity/g, 'strokeOpacity')
    .replace(/fill-opacity/g, 'fillOpacity')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/clip-rule/g, 'clipRule')
    .replace(/stop-color/g, 'stopColor')
    .replace(/stop-opacity/g, 'stopOpacity')
    .replace(/font-family/g, 'fontFamily')
    .replace(/font-size/g, 'fontSize')
    .replace(/font-weight/g, 'fontWeight')
    .replace(/letter-spacing/g, 'letterSpacing')
    .replace(/text-anchor/g, 'textAnchor')
    .replace(/pointer-events/g, 'pointerEvents')
    .replace(/patternUnits/g, 'patternUnits')
    .replace(/patternContentUnits/g, 'patternContentUnits')
    .replace(/preserveAspectRatio/g, 'preserveAspectRatio');

  return `import React from 'react';

export interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  size = '100%',
  className = '',
  ...props
}) => {
  return (
    ${jsx.replace('<svg', `<svg width={size} height={size} className={className} {...props}`)}
  );
};

export default ${componentName};
`;
}

/**
 * Sanitizes and normalizes SVG markup for robust canvas rasterization.
 * Ensures namespaces, explicit viewBox, dimensions, and XML validity.
 */
export function sanitizeSvgForRasterization(svgString: string): {
  cleanSvg: string;
  width: number;
  height: number;
} {
  if (!svgString || typeof svgString !== 'string') {
    throw new Error('Invalid SVG markup provided for rasterization');
  }

  let width = 1000;
  let height = 1000;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');
    const svgEl = doc.querySelector('svg');

    if (!svgEl || parserError) {
      // Fallback regex detection if DOMParser failed on unusual syntax
      const viewBoxMatch = svgString.match(/viewBox=["']\s*([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s*["']/i);
      const widthMatch = svgString.match(/width=["']\s*([0-9.]+)(?:px)?\s*["']/i);
      const heightMatch = svgString.match(/height=["']\s*([0-9.]+)(?:px)?\s*["']/i);

      if (viewBoxMatch) {
        width = parseFloat(viewBoxMatch[3]) || 1000;
        height = parseFloat(viewBoxMatch[4]) || 1000;
      } else if (widthMatch && heightMatch) {
        width = parseFloat(widthMatch[1]) || 1000;
        height = parseFloat(heightMatch[1]) || 1000;
      }

      let fixed = svgString;
      if (!fixed.includes('xmlns=')) {
        fixed = fixed.replace(/<svg/i, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      return { cleanSvg: fixed, width, height };
    }

    // Ensure standard SVG XML namespaces are set
    if (!svgEl.getAttribute('xmlns')) {
      svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    if (!svgEl.getAttribute('xmlns:xlink')) {
      svgEl.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }

    // Resolve explicit dimensions
    const viewBox = svgEl.getAttribute('viewBox');
    const wAttr = svgEl.getAttribute('width');
    const hAttr = svgEl.getAttribute('height');

    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    } else if (wAttr && hAttr) {
      const parsedW = parseFloat(wAttr);
      const parsedH = parseFloat(hAttr);
      if (!isNaN(parsedW) && parsedW > 0) width = parsedW;
      if (!isNaN(parsedH) && parsedH > 0) height = parsedH;
    }

    // Force explicit attributes so img loader measures exact layout
    svgEl.setAttribute('width', `${width}`);
    svgEl.setAttribute('height', `${height}`);
    if (!viewBox) {
      svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    const cleanSvg = new XMLSerializer().serializeToString(doc);
    return { cleanSvg, width, height };
  } catch {
    return { cleanSvg: svgString, width: 1000, height: 1000 };
  }
}

// Rasterize SVG to PNG Blob at specific resolution (1x = 1000px, 2x = 2000px, 4x = 4000px, etc.)
export async function exportSvgToPng(svgString: string, scale = 2): Promise<Blob> {
  const { cleanSvg, width: baseW, height: baseH } = sanitizeSvgForRasterization(svgString);
  const targetScale = Math.max(0.25, Math.min(scale || 2, 8));
  const targetWidth = Math.max(16, Math.round(baseW * targetScale));
  const targetHeight = Math.max(16, Math.round(baseH * targetScale));

  const loadSvgImage = async (): Promise<HTMLImageElement> => {
    // Strategy 1: Data URI with Base64 encoding (most reliable in iframes & sandbox)
    try {
      const b64 = btoa(unescape(encodeURIComponent(cleanSvg)));
      const dataUri = `data:image/svg+xml;base64,${b64}`;
      return await createImageFromSrc(dataUri);
    } catch {
      // Strategy 2: URL encoded Data URI
      try {
        const utf8DataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
        return await createImageFromSrc(utf8DataUri);
      } catch {
        // Strategy 3: Object Blob URL
        const blob = new Blob([cleanSvg], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        try {
          const img = await createImageFromSrc(blobUrl);
          URL.revokeObjectURL(blobUrl);
          return img;
        } catch {
          URL.revokeObjectURL(blobUrl);
          throw new Error('Vector rasterization failed: browser image engine rejected SVG markup.');
        }
      }
    }
  };

  const img = await loadSvgImage();

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D rendering context could not be initialized');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const byteString = atob(dataUrl.split(',')[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          resolve(new Blob([ab], { type: 'image/png' }));
        } catch {
          reject(new Error('Canvas PNG export failed during pixel buffer serialization'));
        }
      }
    }, 'image/png');
  });
}

function createImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      reject(new Error('Failed to load SVG source into raster image element'));
    };
    img.src = src;
  });
}

// Download file utility
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// PATH DATA OPTIMIZER & CLEANER
// ---------------------------------------------------------------------------

export interface PathOptimizationResult {
  optimizedSvg: string;
  originalBytes: number;
  optimizedBytes: number;
  bytesSaved: number;
  savingsPct: number;
  pathsOptimized: number;
  pointsSimplified: number;
}

/**
 * Simplifies an SVG path `d` string by:
 * - Rounding all coordinates to 1 decimal place
 * - Removing redundant trailing zeros and leading zeros where beneficial
 * - Collapsing multiple consecutive spaces and trailing whitespace
 * - Standardizing command spacing
 */
export function simplifyPathString(d: string): { simplified: string; pointsChanged: number } {
  if (!d) return { simplified: '', pointsChanged: 0 };

  let pointsChanged = 0;

  // Regex matches SVG path commands and numerical coordinates
  // Matches floats like 123.456, -0.789, .45, etc.
  const numberRegex = /[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g;

  const simplifiedNumbers = d.replace(numberRegex, (match) => {
    const num = parseFloat(match);
    if (isNaN(num)) return match;

    const rounded = Math.round(num * 10) / 10;
    // Format without redundant trailing zeros
    const formatted = rounded === 0 ? '0' : rounded.toString();

    if (formatted !== match) {
      pointsChanged++;
    }
    return formatted;
  });

  // Standardize spaces: collapse whitespace, fix command delimiters
  const cleaned = simplifiedNumbers
    .replace(/\s*([a-zA-Z])\s*/g, '$1 ')
    .replace(/\s+/g, ' ')
    .replace(/\s*,/g, ',')
    .replace(/,\s*/g, ',')
    .replace(/\s*-\s*/g, ' -')
    .trim();

  return { simplified: cleaned, pointsChanged };
}

/**
 * Optimizes all path elements, polyline/polygon points, and geometric coordinates
 * in an SVG string, returning the cleaned SVG and detailed savings analytics.
 */
export function optimizePathData(svgString: string): PathOptimizationResult {
  if (!svgString) {
    return {
      optimizedSvg: svgString,
      originalBytes: 0,
      optimizedBytes: 0,
      bytesSaved: 0,
      savingsPct: 0,
      pathsOptimized: 0,
      pointsSimplified: 0,
    };
  }

  const originalBytes = new Blob([svgString]).size;
  let pathsOptimized = 0;
  let totalPointsSimplified = 0;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    // 1. Optimize all <path d="..."> attributes
    const paths = doc.querySelectorAll('path');
    paths.forEach((path) => {
      const d = path.getAttribute('d');
      if (d) {
        const { simplified, pointsChanged } = simplifyPathString(d);
        if (simplified && simplified !== d) {
          path.setAttribute('d', simplified);
          pathsOptimized++;
          totalPointsSimplified += pointsChanged;
        }
      }
    });

    // 2. Optimize <polygon> and <polyline> points="..."
    const polyElements = doc.querySelectorAll('polygon, polyline');
    polyElements.forEach((poly) => {
      const points = poly.getAttribute('points');
      if (points) {
        const { simplified, pointsChanged } = simplifyPathString(points);
        if (simplified && simplified !== points) {
          poly.setAttribute('points', simplified);
          pathsOptimized++;
          totalPointsSimplified += pointsChanged;
        }
      }
    });

    // 3. Clean floating point geometric coordinates on circles, rects, lines
    const geomElements = doc.querySelectorAll('circle, ellipse, rect, line');
    const coordAttrs = ['cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2'];
    geomElements.forEach((el) => {
      coordAttrs.forEach((attr) => {
        const val = el.getAttribute(attr);
        if (val && !isNaN(Number(val)) && val.includes('.')) {
          const rounded = (Math.round(parseFloat(val) * 10) / 10).toString();
          if (rounded !== val) {
            el.setAttribute(attr, rounded);
            totalPointsSimplified++;
          }
        }
      });
    });

    // Serialize cleaned XML
    const serializer = new XMLSerializer();
    let optimizedSvg = serializer.serializeToString(doc);

    // Minor cleanup on serialized string (e.g. redundant empty lines)
    optimizedSvg = optimizedSvg.replace(/\n\s*\n/g, '\n').trim();

    const optimizedBytes = new Blob([optimizedSvg]).size;
    const bytesSaved = Math.max(0, originalBytes - optimizedBytes);
    const savingsPct = originalBytes > 0 ? Math.round((bytesSaved / originalBytes) * 1000) / 10 : 0;

    return {
      optimizedSvg,
      originalBytes,
      optimizedBytes,
      bytesSaved,
      savingsPct,
      pathsOptimized,
      pointsSimplified: totalPointsSimplified,
    };
  } catch (err) {
    console.error('Error optimizing path data:', err);
    return {
      optimizedSvg: svgString,
      originalBytes,
      optimizedBytes: originalBytes,
      bytesSaved: 0,
      savingsPct: 0,
      pathsOptimized: 0,
      pointsSimplified: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// PALETTE USAGE ANALYZER
// ---------------------------------------------------------------------------

export interface ColorUsageItem {
  hex: string;
  isUsed: boolean;
  count: number;
  elements: { tag: string; attr: string; count: number }[];
}

export interface PaletteUsageAnalysis {
  usedColors: ColorUsageItem[];
  unusedColors: ColorUsageItem[];
  totalPaletteColors: number;
  usedCount: number;
  unusedCount: number;
  coveragePct: number;
  allSvgColorsFound: string[];
}

/**
 * Normalizes hex string for consistent comparison (e.g. #00ff00 -> #00FF00, #0f0 -> #00FF00)
 */
export function normalizeHex(hex: string): string {
  if (!hex) return '';
  let clean = hex.trim().toUpperCase();
  if (!clean.startsWith('#')) clean = `#${clean}`;
  if (clean.length === 4) {
    // #RGB -> #RRGGBB
    clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return clean;
}

/**
 * Analyzes which colors in a provided palette are actively utilized across
 * the SVG DOM elements (fill, stroke, stop-color, style properties).
 */
export function analyzePaletteColorUsage(
  svgString: string,
  paletteColors: string[]
): PaletteUsageAnalysis {
  const normPalette = Array.from(new Set(paletteColors.map(normalizeHex)));
  const usageMap: Record<
    string,
    { count: number; elements: Record<string, { tag: string; attr: string; count: number }> }
  > = {};

  normPalette.forEach((hex) => {
    usageMap[hex] = { count: 0, elements: {} };
  });

  const allSvgColorsFound = new Set<string>();

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const allElements = doc.querySelectorAll('*');

    allElements.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (['defs', 'svg', 'title', 'desc', 'metadata'].includes(tag)) return;

      const checkAttr = (attr: string, value: string | null) => {
        if (!value || value === 'none' || value.startsWith('url(')) return;

        // Match all HEX colors inside attribute
        const hexMatches = value.match(/#(?:[0-9a-fA-F]{3}){1,2}\b/g) || [];
        hexMatches.forEach((m) => {
          const normFound = normalizeHex(m);
          allSvgColorsFound.add(normFound);

          if (usageMap[normFound]) {
            usageMap[normFound].count++;
            const elKey = `${tag}-${attr}`;
            if (!usageMap[normFound].elements[elKey]) {
              usageMap[normFound].elements[elKey] = { tag, attr, count: 0 };
            }
            usageMap[normFound].elements[elKey].count++;
          }
        });
      };

      checkAttr('fill', el.getAttribute('fill'));
      checkAttr('stroke', el.getAttribute('stroke'));
      checkAttr('stop-color', el.getAttribute('stop-color'));
      checkAttr('flood-color', el.getAttribute('flood-color'));
      checkAttr('style', el.getAttribute('style'));
    });
  } catch (e) {
    console.error('Error analyzing palette usage in SVG:', e);
  }

  const usedColors: ColorUsageItem[] = [];
  const unusedColors: ColorUsageItem[] = [];

  normPalette.forEach((hex) => {
    const info = usageMap[hex];
    const isUsed = info && info.count > 0;
    const item: ColorUsageItem = {
      hex,
      isUsed,
      count: info ? info.count : 0,
      elements: info ? Object.values(info.elements) : [],
    };

    if (isUsed) {
      usedColors.push(item);
    } else {
      unusedColors.push(item);
    }
  });

  const total = normPalette.length;
  const usedCount = usedColors.length;
  const unusedCount = unusedColors.length;
  const coveragePct = total > 0 ? Math.round((usedCount / total) * 100) : 0;

  return {
    usedColors,
    unusedColors,
    totalPaletteColors: total,
    usedCount,
    unusedCount,
    coveragePct,
    allSvgColorsFound: Array.from(allSvgColorsFound),
  };
}
