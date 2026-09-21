// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { importSvg, emptyDocument, documentToSvg } from '../index';
import { resetUidPool } from '../ids';

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 100" width="200" height="100">
  <!-- imported from illustrator -->
  <defs>
    <linearGradient id="grad1"><stop offset="0" stop-color="#112233"/></linearGradient>
    <style>.a { fill: #ff0000; stroke: url(#grad1); }</style>
  </defs>
  <g id="layer-01" inkscape:groupmode="layer" inkscape:label="01_Background">
    <rect x="1" y="2" width="3" height="4" fill="#aabbcc"/>
    <text>hello <tspan>world</tspan></text>
  </g>
  <g id="layer-02" inkscape:groupmode="layer" inkscape:label="02_Shapes">
    <circle r="5" fill="url(#grad1)" xlink:href="#layer-01"/>
    <animate attributeName="r" values="5;10;5" dur="2s"/>
  </g>
</svg>`;

beforeEach(() => {
  resetUidPool();
});

describe('importSvg', () => {
  it('builds a document with one page and the root attributes', () => {
    const doc = importSvg(SAMPLE, { documentId: 'test' })!;
    expect(doc).not.toBeNull();
    expect(doc.schemaVersion).toBe(1);
    expect(doc.pages).toHaveLength(1);
    const page = doc.pages[0];
    expect(page.viewBox).toEqual({ x: 0, y: 0, width: 200, height: 100 });
    expect(page.width).toBe(200);
    expect(page.attrs['xmlns:inkscape']).toBe('http://www.inkscape.org/namespaces/inkscape');
  });

  it('assigns unique uids to every node', () => {
    const doc = importSvg(SAMPLE, { documentId: 'test' })!;
    const uids: string[] = [];
    const walk = (children: any[]) => {
      for (const child of children) {
        uids.push(child.uid);
        if (child.children) walk(child.children);
      }
    };
    walk(doc.pages[0].children);
    expect(new Set(uids).size).toBe(uids.length);
    expect(uids.length).toBeGreaterThan(10);
  });

  it('preserves element ids as attrs (reference targets stay intact)', () => {
    const doc = importSvg(SAMPLE, { documentId: 'test' })!;
    const defs = doc.pages[0].children.find((c) => c.type === 'element' && c.kind === 'defs') as any;
    const linear = defs.children.find((c: any) => c.kind === 'linearGradient');
    expect(linear.attrs['id']).toBe('grad1');
  });

  it('preserves namespaced attributes with their namespace URIs', () => {
    const doc = importSvg(SAMPLE, { documentId: 'test' })!;
    const layers = doc.pages[0].children.filter((c: any) => c.type === 'element' && c.kind === 'g');
    const layer1 = layers[0] as any;
    expect(layer1.attrs['inkscape:label']).toBe('01_Background');
    expect(layer1.nsByAttr?.['inkscape:label']).toBe(
      'http://www.inkscape.org/namespaces/inkscape',
    );
  });

  it('preserves comments and text content', () => {
    const doc = importSvg(SAMPLE, { documentId: 'test' })!;
    const flat: any[] = [];
    const walk = (children: any[]) => {
      for (const child of children) {
        flat.push(child);
        if (child.children) walk(child.children);
      }
    };
    walk(doc.pages[0].children);
    expect(flat.some((n) => n.type === 'comment' && n.text.includes('illustrator'))).toBe(true);
    expect(flat.some((n) => n.type === 'text' && n.text.includes('hello'))).toBe(true);
    expect(flat.some((n) => n.type === 'element' && n.kind === 'style')).toBe(true);
  });

  it('preserves xlink:href namespace information', () => {
    const doc = importSvg(SAMPLE, { documentId: 'test' })!;
    const layers = doc.pages[0].children.filter((c: any) => c.type === 'element' && c.kind === 'g');
    const circle = (layers[1] as any).children.find((c: any) => c.kind === 'circle');
    expect(circle.attrs['xlink:href']).toBe('#layer-01');
    expect(circle.nsByAttr?.['xlink:href']).toBe('http://www.w3.org/1999/xlink');
  });

  it('reuses uids for elements with matching ids when preserveUidsFrom is given', () => {
    const first = importSvg(SAMPLE, { documentId: 'test' })!;
    const second = importSvg(SAMPLE, { documentId: 'test', preserveUidsFrom: first })!;
    const uidOf = (doc: any, id: string): string | undefined => {
      let found: string | undefined;
      const walk = (children: any[]) => {
        for (const child of children) {
          if (child.type === 'element' && child.attrs?.id === id) found = child.uid;
          if (child.children) walk(child.children);
        }
      };
      walk(doc.pages[0].children);
      return found;
    };
    expect(uidOf(second, 'layer-01')).toBe(uidOf(first, 'layer-01'));
    expect(uidOf(second, 'grad1')).toBe(uidOf(first, 'grad1'));
  });

  it('returns null for unparseable or non-SVG input', () => {
    expect(importSvg('', {})).toBeNull();
    expect(importSvg('not svg at all', {})).toBeNull();
    expect(importSvg('<html><body>x</body></html>', {})).toBeNull();
    expect(importSvg('<svg><unclosed></svg>', {})).toBeNull();
  });
});

describe('documentToSvg', () => {
  it('produces parseable SVG that re-imports to a deep-equal document', () => {
    const first = importSvg(SAMPLE, { documentId: 'test' })!;
    const exported = documentToSvg(first);
    const reparsed = new DOMParser().parseFromString(exported, 'image/svg+xml');
    expect(reparsed.getElementsByTagName('parsererror').length).toBe(0);
    expect(reparsed.documentElement.localName).toBe('svg');

    const second = importSvg(exported, { documentId: 'test' })!;
    expect(second).not.toBeNull();
    // Structural equality (uids differ by design; compare a normalized projection).
    expect(normalize(second)).toEqual(normalize(first));
  });

  it('keeps inkscape layer labels, gradients, styles and SMIL intact in output', () => {
    const doc = importSvg(SAMPLE, { documentId: 'test' })!;
    const out = documentToSvg(doc);
    expect(out).toContain('inkscape:label');
    expect(out).toContain('01_Background');
    expect(out).toContain('linearGradient');
    expect(out).toContain('url(#grad1)');
    expect(out).toContain('.a');
    expect(out).toContain('<animate');
    expect(out).toContain('xlink:href');
  });

  it('round-trips the viewBox and dimensions', () => {
    const doc = importSvg(SAMPLE, { documentId: 'test' })!;
    const out = documentToSvg(doc);
    const reparsed = new DOMParser().parseFromString(out, 'image/svg+xml');
    expect(reparsed.documentElement.getAttribute('viewBox')).toBe('0 0 200 100');
  });

  it('exports an empty document to valid svg', () => {
    const doc = emptyDocument({ documentId: 'e' });
    const out = documentToSvg(doc);
    expect(out).toContain('<svg');
    const reparsed = new DOMParser().parseFromString(out, 'image/svg+xml');
    expect(reparsed.getElementsByTagName('parsererror').length).toBe(0);
  });
});

/** Strip uids and volatile timestamps for structural comparison. */
function normalize(doc: any): any {
  const clean = (node: any): any => {
    if (Array.isArray(node)) return node.map(clean);
    if (node && typeof node === 'object') {
      const { uid, ...rest } = node;
      void uid;
      const out: any = {};
      for (const [k, v] of Object.entries(rest)) {
        // Timestamps are stamped per import; exclude from structural equality.
        if (k === 'createdAt' || k === 'updatedAt') continue;
        out[k] = clean(v);
      }
      return out;
    }
    return node;
  };
  return clean(doc);
}
