/**
 * Document selectors: derived views of the canonical document.
 *
 * The layer panel, canvas, and exporters consume these — they never parse
 * the serialized SVG to discover state (that was the Phase 0 workaround).
 */

import type { LayerSpec } from '../types';
import type { ElementNode, VectorDocument, VectorNode } from './types';
import { walkElements } from './tree';

const DRAWABLE = new Set([
  'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'use',
]);

/** Does this element look like a "layer" (top-level layer group)? */
export function isLayerGroup(node: ElementNode): boolean {
  const attrs = node.attrs;
  return (
    attrs['inkscape:groupmode'] === 'layer' ||
    Object.prototype.hasOwnProperty.call(attrs, 'inkscape:label') ||
    (attrs['id']?.toLowerCase().includes('layer') ?? false)
  );
}

function countDrawable(node: ElementNode): number {
  let count = 0;
  const descend = (children: VectorNode[]) => {
    for (const child of children) {
      if (child.type === 'element') {
        if (DRAWABLE.has(child.kind)) count++;
        descend(child.children);
      }
    }
  };
  descend(node.children);
  return count;
}

function blendModeOf(node: ElementNode): string {
  const direct = node.attrs['mix-blend-mode'];
  if (direct) return direct;
  const style = node.attrs['style'] ?? '';
  const match = style.match(/mix-blend-mode\s*:\s*([a-zA-Z-]+)/i);
  if (match) return match[1].toLowerCase();
  return 'normal';
}

/**
 * Derive the layer list (draw order: index 0 paints first / back).
 * Mirrors the semantics of the legacy svgParser.parseSvgLayers so the
 * LayerPanel UI keeps working, but reads from the document tree.
 */
export function layersFromDocument(doc: VectorDocument): LayerSpec[] {
  const layers: LayerSpec[] = [];
  const page = doc.pages[0];
  if (!page) return layers;

  for (const child of page.children) {
    if (child.type !== 'element' || child.kind !== 'g') continue;
    if (!isLayerGroup(child)) continue;
    const name =
      child.attrs['inkscape:label'] || child.attrs['id'] || 'Unnamed_Layer';
    layers.push({
      id: child.uid,
      name,
      description: `Contains ${countDrawable(child)} vector primitives & paths`,
      elementCount: countDrawable(child),
      visible:
        child.attrs['display'] !== 'none' && child.attrs['visibility'] !== 'hidden',
      locked:
        child.attrs['pointer-events'] === 'none' ||
        child.attrs['data-locked'] === 'true',
      opacity: Number.parseFloat(child.attrs['opacity'] ?? '') || 1,
      blendMode: blendModeOf(child),
    });
  }

  if (layers.length === 0) {
    // Parity fallback: a synthetic single layer (matches legacy parseSvgLayers).
    let total = 0;
    walkElements(doc, (node) => {
      if (DRAWABLE.has(node.kind)) total++;
    });
    layers.push({
      id: 'layer-01-base',
      name: '01_Base_Artwork',
      description: 'Single layer containing all root vector nodes',
      elementCount: total,
      visible: true,
      locked: false,
      blendMode: 'normal',
    });
  }
  return layers;
}

/** Find a layer's uid by its (panel-displayed) name. */
export function layerUidByName(doc: VectorDocument, name: string): string | null {
  const page = doc.pages[0];
  if (!page) return null;
  for (const child of page.children) {
    if (child.type !== 'element' || child.kind !== 'g') continue;
    const candidate =
      child.attrs['inkscape:label'] || child.attrs['id'] || 'Unnamed_Layer';
    if (candidate === name) return child.uid;
  }
  return null;
}
