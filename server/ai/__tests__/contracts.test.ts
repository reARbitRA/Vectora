import { describe, it, expect } from "vitest";
import {
  validateGenerationResponse,
  ContractViolationError,
} from "../contracts";

const LIMITS = { maxSvgBytes: 1_000_000, maxSvgElements: 5_000 };

const VALID_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="5" height="5"/></svg>`;

function response(overrides: Record<string, unknown> = {}) {
  return {
    title: "Test",
    concept: "A test",
    style: "Bauhaus",
    description: "desc",
    svg: VALID_SVG,
    layers: [{ name: "01_Background", description: "bg" }],
    palette: [{ name: "Ink", hex: "#000000", role: "ink" }],
    animationNotes: "none",
    evolutionIdeas: ["one", "two"],
    ...overrides,
  };
}

describe("validateGenerationResponse", () => {
  it("accepts and normalizes a well-formed response", () => {
    const out = validateGenerationResponse(response(), LIMITS);
    expect(out.title).toBe("Test");
    expect(out.svg).toBe(VALID_SVG);
    expect(out.layers).toHaveLength(1);
    expect(out.palette).toHaveLength(1);
  });

  it("rejects non-object payloads", () => {
    expect(() => validateGenerationResponse("nope", LIMITS)).toThrow(ContractViolationError);
    expect(() => validateGenerationResponse([1, 2], LIMITS)).toThrow(ContractViolationError);
    expect(() => validateGenerationResponse(null, LIMITS)).toThrow(ContractViolationError);
  });

  it("rejects a missing or empty svg field", () => {
    expect(() => validateGenerationResponse(response({ svg: "" }), LIMITS)).toThrow(/svg/i);
    expect(() => validateGenerationResponse(response({ svg: undefined }), LIMITS)).toThrow(/svg/i);
  });

  it("rejects svg that fails the safety guard", () => {
    const malicious = response({
      svg: `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`,
    });
    expect(() => validateGenerationResponse(malicious, LIMITS)).toThrow(/safety/i);
  });

  it("rejects svg that is not an svg document at all", () => {
    expect(() => validateGenerationResponse(response({ svg: "just text" }), LIMITS)).toThrow(/svg/i);
  });

  it("enforces complexity budgets", () => {
    const huge = `<svg xmlns="http://www.w3.org/2000/svg">${"<rect/>".repeat(100)}</svg>`;
    expect(() =>
      validateGenerationResponse(response({ svg: huge }), { ...LIMITS, maxSvgElements: 50 }),
    ).toThrow(/element count/i);
  });

  it("clamps out-of-bounds numeric fields instead of passing them through", () => {
    const out = validateGenerationResponse(
      response({
        layers: [{ name: "L", opacity: 42, elementCount: -5, blendMode: "mix-blend-magic" }],
      }),
      LIMITS,
    );
    expect(out.layers[0].opacity).toBe(1);
    expect(out.layers[0].elementCount).toBe(0);
    expect(out.layers[0].blendMode).toBeUndefined(); // unknown blend mode dropped
  });

  it("drops layers without names and truncates oversized strings", () => {
    const out = validateGenerationResponse(
      response({
        title: "x".repeat(500),
        layers: [{ description: "no name" }, { name: "  " }, { name: "Real" }],
      }),
      LIMITS,
    );
    expect(out.title.length).toBeLessThanOrEqual(200);
    expect(out.layers.map((l) => l.name)).toEqual(["Real"]);
  });

  it("filters palette entries to well-formed hex colors", () => {
    const out = validateGenerationResponse(
      response({
        palette: [
          "#ff0000",
          { hex: "#00ff00", name: "Green" },
          { hex: "not-a-color" },
          { hex: "#12345" },
          "garbage",
        ],
      }),
      LIMITS,
    );
    expect(out.palette.map((p) => p.hex)).toEqual(["#ff0000", "#00ff00"]);
  });

  it("keeps unknown top-level fields out of the validated payload", () => {
    const out = validateGenerationResponse(
      response({ sneakyField: "<script>x</script>" }),
      LIMITS,
    );
    expect((out as unknown as Record<string, unknown>).sneakyField).toBeUndefined();
  });
});
