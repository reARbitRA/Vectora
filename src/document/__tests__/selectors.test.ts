// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { importSvg, layersFromDocument, layerUidByName, isLayerGroup } from '../index';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100">
  <g id="layer-01" inkscape:groupmode="layer" inkscape:label="01_Background"><rect width="5" height="5"/><circle r="2"/></g>
  <g id="layer-02" inkscape:groupmode="layer" inkscape:label="02_Shapes" style="mix-blend-mode: screen"><path d="M0 0"/></g>
  <g id="hidden-layer" inkscape:groupmode="layer" inkscape:label="03_Hidden" display="none" pointer-events="none" data-locked="true"><rect width="1" height="1"/></g>
</svg>`;

describe('layersFromDocument', () => {
  it('derives layers in draw order with uid identities', () => {
    const doc = importSvg(SAMPLE, { documentId: 't' })!;
    const layers = layersFromDocument(doc);
    expect(layers.map((l) => l.name)).toEqual(['01_Background', '02_Shapes', '03_Hidden']);
    expect(layers[0].id).toBe(doc.pages[0].children[0].uid);
  });

  it('reads visibility and lock state from document attributes', () => {
    const layers = layersFromDocument(importSvg(SAMPLE, { documentId: 't' })!);
    expect(layers[0].visible).toBe(true);
    expect(layers[0].locked).toBe(false);
    expect(layers[2].visible).toBe(false);
    expect(layers[2].locked).toBe(true);
  });

  it('reads blend mode from the style attribute', () => {
    const layers = layersFromDocument(importSvg(SAMPLE, { documentId: 't' })!);
    expect(layers[1].blendMode).toBe('screen');
    expect(layers[0].blendMode).toBe('normal');
  });

  it('counts drawable descendants', () => {
    const layers = layersFromDocument(importSvg(SAMPLE, { documentId: 't' })!);
    expect(layers[0].elementCount).toBe(2);
    expect(layers[1].elementCount).toBe(1);
  });

  it('falls back to a synthetic base layer when no layer groups exist', () => {
    const doc = importSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="2" height="2"/><circle r="1"/></svg>`,
      { documentId: 't' },
    )!;
    const layers = layersFromDocument(doc);
    expect(layers).toHaveLength(1);
    expect(layers[0].name).toBe('01_Base_Artwork');
    expect(layers[0].elementCount).toBe(2);
  });
});

describe('layerUidByName', () => {
  it('resolves a layer uid from its panel name', () => {
    const doc = importSvg(SAMPLE, { documentId: 't' })!;
    const uid = layerUidByName(doc, '02_Shapes');
    expect(uid).toBe(doc.pages[0].children[1].uid);
  });

  it('returns null for unknown names', () => {
    expect(layerUidByName(importSvg(SAMPLE, { documentId: 't' })!, 'nope')).toBeNull();
  });
});

describe('isLayerGroup', () => {
  it('accepts inkscape layer groups and layer-prefixed ids', () => {
    const doc = importSvg(SAMPLE, { documentId: 't' })!;
    for (const child of doc.pages[0].children) {
      expect(child.type === 'element' && isLayerGroup(child)).toBe(true);
    }
  });
});
