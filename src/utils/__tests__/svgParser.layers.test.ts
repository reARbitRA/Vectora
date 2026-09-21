// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import {
  parseSvgLayers,
  setSvgLayerVisibility,
  setSvgLayerLock,
  renameSvgLayer,
  reorderSvgLayer,
  addNewSvgLayer,
  remapSvgColors,
} from "../svgParser";

/**
 * Regression tests for the layer-persistence bugs found in the audit:
 * layer operations must mutate the SVG document itself, not just React
 * state, so exports and reloads agree with what the user saw on canvas.
 */

const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100">
  <g id="layer-01" inkscape:groupmode="layer" inkscape:label="01_Background"><rect width="10" height="10"/></g>
  <g id="layer-02" inkscape:groupmode="layer" inkscape:label="02_Shapes"><circle r="5"/></g>
  <g id="layer-03" inkscape:groupmode="layer" inkscape:label="03_Core"><path d="M0 0"/></g>
</svg>`;

describe("parseSvgLayers", () => {
  it("extracts Inkscape-style layers with names", () => {
    const layers = parseSvgLayers(SAMPLE);
    expect(layers.map((l) => l.name)).toEqual([
      "01_Background",
      "02_Shapes",
      "03_Core",
    ]);
  });
});

describe("setSvgLayerVisibility", () => {
  it("persists display:none into the SVG document", () => {
    const hidden = setSvgLayerVisibility(SAMPLE, "02_Shapes", false);
    const doc = new DOMParser().parseFromString(hidden, "image/svg+xml");
    const layer = doc.querySelector('g[inkscape\\:label="02_Shapes"]');
    expect(layer?.getAttribute("display")).toBe("none");
  });

  it("removes display:none when re-shown", () => {
    const hidden = setSvgLayerVisibility(SAMPLE, "02_Shapes", false);
    const shown = setSvgLayerVisibility(hidden, "02_Shapes", true);
    const doc = new DOMParser().parseFromString(shown, "image/svg+xml");
    const layer = doc.querySelector('g[inkscape\\:label="02_Shapes"]');
    expect(layer?.getAttribute("display")).toBeNull();
  });

  it("does not touch other layers", () => {
    const hidden = setSvgLayerVisibility(SAMPLE, "01_Background", false);
    const doc = new DOMParser().parseFromString(hidden, "image/svg+xml");
    expect(doc.querySelector('g[inkscape\\:label="03_Core"]')?.getAttribute("display")).toBeNull();
  });
});

describe("setSvgLayerLock", () => {
  it("persists pointer-events:none and a data-locked flag", () => {
    const locked = setSvgLayerLock(SAMPLE, "01_Background", true);
    const doc = new DOMParser().parseFromString(locked, "image/svg+xml");
    const layer = doc.querySelector('g[inkscape\\:label="01_Background"]');
    expect(layer?.getAttribute("pointer-events")).toBe("none");
    expect(layer?.getAttribute("data-locked")).toBe("true");
  });
});

describe("renameSvgLayer", () => {
  it("renames inkscape:label and derives a clean id", () => {
    const renamed = renameSvgLayer(SAMPLE, "01_Background", "01_Backdrop & Sky");
    const doc = new DOMParser().parseFromString(renamed, "image/svg+xml");
    const layer = doc.querySelector('g[inkscape\\:label="01_Backdrop & Sky"]');
    expect(layer).not.toBeNull();
    expect(layer?.id).toBe("01_backdrop-sky");
  });

  it("returns the original string when the layer does not exist", () => {
    expect(renameSvgLayer(SAMPLE, "nope", "x")).toBe(SAMPLE);
  });
});

describe("reorderSvgLayer", () => {
  // The layers array / document order is back-to-front: index 0 paints first
  // (back). "Up"/Bring Forward therefore means moving to a LATER position.
  it("moves a layer forward ('up') in draw order", () => {
    const reordered = reorderSvgLayer(SAMPLE, "02_Shapes", "up");
    const layers = parseSvgLayers(reordered);
    expect(layers.map((l) => l.name)).toEqual([
      "01_Background",
      "03_Core",
      "02_Shapes",
    ]);
  });

  it("moves a layer backward ('down') in draw order", () => {
    const reordered = reorderSvgLayer(SAMPLE, "02_Shapes", "down");
    const layers = parseSvgLayers(reordered);
    expect(layers.map((l) => l.name)).toEqual([
      "02_Shapes",
      "01_Background",
      "03_Core",
    ]);
  });

  it("is a no-op at the boundaries", () => {
    expect(parseSvgLayers(reorderSvgLayer(SAMPLE, "01_Background", "down")).map((l) => l.name))
      .toEqual(["01_Background", "02_Shapes", "03_Core"]);
    expect(parseSvgLayers(reorderSvgLayer(SAMPLE, "03_Core", "up")).map((l) => l.name))
      .toEqual(["01_Background", "02_Shapes", "03_Core"]);
  });
});

describe("addNewSvgLayer", () => {
  it("inserts a new layer group that round-trips through the parser", () => {
    const extended = addNewSvgLayer(SAMPLE, "04_New", "top");
    const layers = parseSvgLayers(extended);
    expect(layers.map((l) => l.name)).toContain("04_New");
  });
});

describe("remapSvgColors (local palette application)", () => {
  it("remaps existing hex colors onto the target palette deterministically", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect fill="#111111"/><rect fill="#222222"/></svg>`;
    const out = remapSvgColors(svg, ["#ff0000", "#00ff00"]);
    expect(out).not.toContain("#111111");
    expect(out).not.toContain("#222222");
    expect(out).toContain("#ff0000");
    expect(out).toContain("#00ff00");
  });
});
