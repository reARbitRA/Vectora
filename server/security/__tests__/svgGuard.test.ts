import { describe, it, expect } from "vitest";
import { inspectSvg, stripUnsafeSvg } from "../svgGuard";

const LIMITS = { maxSvgBytes: 1_000_000, maxSvgElements: 5_000 };
const BASE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`;

describe("inspectSvg", () => {
  it("accepts a clean SVG", () => {
    const verdict = inspectSvg(`${BASE}<rect width="5" height="5"/></svg>`, LIMITS);
    expect(verdict.ok).toBe(true);
    expect(verdict.violations).toHaveLength(0);
  });

  it("rejects empty or non-SVG input", () => {
    expect(inspectSvg("", LIMITS).ok).toBe(false);
    expect(inspectSvg("hello world", LIMITS).ok).toBe(false);
  });

  it("rejects oversized documents (byte budget)", () => {
    const huge = `${BASE}${"<rect width=\"1\" height=\"1\"/>".repeat(100_000)}</svg>`;
    const smallLimits = { ...LIMITS, maxSvgBytes: 1_000 };
    expect(inspectSvg(huge, smallLimits).ok).toBe(false);
  });

  it("rejects excessive element counts (complexity budget)", () => {
    const many = `${BASE}${"<rect/>".repeat(100)}</svg>`;
    const strictLimits = { ...LIMITS, maxSvgElements: 50 };
    const verdict = inspectSvg(many, strictLimits);
    expect(verdict.ok).toBe(false);
    expect(verdict.violations).toContain("complexity-budget");
  });

  it("flags scripts, event handlers, and unsafe URLs", () => {
    const cases: Array<[string, string]> = [
      [`${BASE}<script>x()</script></svg>`, "script-element"],
      [`${BASE}<rect onload="x()"/></svg>`, "event-handler-attribute"],
      [`${BASE}<a href="javascript:x()">y</a></svg>`, "javascript-url"],
      [`${BASE}<a href="vbscript:x()">y</a></svg>`, "vbscript-url"],
      [`${BASE}<a href="data:text/html,x">y</a></svg>`, "data-html-url"],
      [`${BASE}<foreignObject/></svg>`, "foreign-object"],
      [`${BASE}<embed src="x"/></svg>`, "embed-element"],
      [`${BASE}<iframe src="x"/></svg>`, "iframe-element"],
    ];
    for (const [svg, violation] of cases) {
      const verdict = inspectSvg(svg, LIMITS);
      expect(verdict.ok, `expected violation ${violation} for ${svg}`).toBe(false);
      expect(verdict.violations).toContain(violation);
    }
  });
});

describe("stripUnsafeSvg", () => {
  it("removes script elements and their payloads", () => {
    const { svg, removed } = stripUnsafeSvg(`${BASE}<script>alert(1)</script><rect/></svg>`);
    expect(svg).not.toContain("alert(1)");
    expect(removed).toContain("<script>");
  });

  it("removes event handler attributes", () => {
    const { svg, removed } = stripUnsafeSvg(`${BASE}<rect onload="x()" width="5"/></svg>`);
    expect(svg.toLowerCase()).not.toContain("onload");
    expect(removed).toContain("event-handler");
  });

  it("neutralizes javascript: URLs", () => {
    const { svg, removed } = stripUnsafeSvg(`${BASE}<a href="javascript:x()">y</a></svg>`);
    expect(svg.toLowerCase()).not.toContain("javascript:");
    expect(removed).toContain("unsafe-url");
  });

  it("leaves clean documents untouched", () => {
    const clean = `${BASE}<g id="a"><rect fill="#fff" width="5"/><animate attributeName="opacity" values="0;1"/></g></svg>`;
    const { svg, removed } = stripUnsafeSvg(clean);
    expect(removed).toHaveLength(0);
    expect(svg).toContain("<animate");
  });
});
