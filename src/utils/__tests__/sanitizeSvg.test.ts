// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { sanitizeSvg } from "../sanitizeSvg";

const BASE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`;

describe("sanitizeSvg", () => {
  it("keeps a clean document untouched (structurally)", () => {
    const input = `${BASE}<g id="layer-01"><rect x="0" y="0" width="10" height="10" fill="#123456"/></g></svg>`;
    const { svg, report } = sanitizeSvg(input);
    expect(report.ok).toBe(true);
    expect(report.removedElements).toHaveLength(0);
    expect(report.removedAttributes).toHaveLength(0);
    expect(svg).toContain("<rect");
    expect(svg).toContain('fill="#123456"');
  });

  it("rejects non-SVG roots", () => {
    const { svg, report } = sanitizeSvg("<html><body>nope</body></html>");
    expect(report.ok).toBe(false);
    expect(svg).not.toContain("body");
  });

  it("rejects empty input", () => {
    const { report } = sanitizeSvg("   ");
    expect(report.ok).toBe(false);
  });

  it("removes <script> elements including their payloads", () => {
    const input = `${BASE}<script>alert(1)</script><rect width="5" height="5"/></svg>`;
    const { svg, report } = sanitizeSvg(input);
    expect(report.removedElements).toContain("script");
    expect(svg).not.toContain("alert(1)");
    expect(svg).not.toContain("<script");
  });

  it("removes event-handler attributes from any element", () => {
    const input = `${BASE}<rect onload="alert(1)" width="5" height="5" onclick="steal()"/></svg>`;
    const { svg, report } = sanitizeSvg(input);
    expect(report.removedAttributes).toContain("rect[onload]");
    expect(report.removedAttributes).toContain("rect[onclick]");
    expect(svg.toLowerCase()).not.toContain("onload");
    expect(svg.toLowerCase()).not.toContain("onclick");
  });

  it("neutralizes javascript: URLs in href/src", () => {
    const input = `${BASE}<a href="javascript:alert(1)"><text>click</text></a><image href="javascript:alert(2)"/></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg.toLowerCase()).not.toContain("javascript:");
  });

  it("neutralizes data:text/html URLs", () => {
    const input = `${BASE}<a href="data:text/html,<script>alert(1)</script>">x</a></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg.toLowerCase()).not.toContain("data:text/html");
  });

  it("allows safe link and image URLs", () => {
    const input = `${BASE}<a href="https://example.com/page">x</a><image href="data:image/png;base64,iVBORw0KGgo="/></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg).toContain("https://example.com/page");
    expect(svg).toContain("data:image/png");
  });

  it("removes <foreignObject> (HTML injection container)", () => {
    const input = `${BASE}<foreignObject width="50" height="50"><div xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></div></foreignObject></svg>`;
    const { svg, report } = sanitizeSvg(input);
    expect(report.removedElements).toContain("foreignobject");
    expect(svg.toLowerCase()).not.toContain("foreignobject");
    expect(svg).not.toContain("alert(1)");
  });

  it("keeps SMIL animation elements (core product feature)", () => {
    const input = `${BASE}<circle cx="50" cy="50" r="10"><animate attributeName="r" values="10;20;10" dur="2s" repeatCount="indefinite"/></circle></svg>`;
    const { svg, report } = sanitizeSvg(input);
    expect(report.removedElements).toHaveLength(0);
    expect(svg).toContain("<animate");
    expect(svg).toContain('values="10;20;10"');
  });

  it("removes SMIL animations that target href-like attributes (href injection vector)", () => {
    const input = `${BASE}<a href="#safe"><animate attributeName="href" to="javascript:alert(1)" dur="1s"/></a></svg>`;
    const { svg, report } = sanitizeSvg(input);
    expect(report.removedElements).toContain("animate");
    expect(svg).not.toContain("<animate");
    expect(svg).not.toContain("javascript:");
  });

  it("removes SMIL animations that target event-handler attributes", () => {
    const input = `${BASE}<rect width="5" height="5"><set attributeName="onmouseover" to="alert(1)"/></rect></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg).not.toContain("<set");
    expect(svg).not.toContain("onmouseover");
  });

  it("scrubs dangerous constructs out of <style> blocks", () => {
    const input = `${BASE}<style>@import url("http://evil.example.com/x.css"); .a { fill: url(javascript:alert(1)); } .b { fill: #ff0000; }</style><rect class="b" width="5" height="5"/></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg).not.toContain("@import");
    expect(svg).not.toContain("javascript:");
    expect(svg).toContain(".b");
  });

  it("scrubs dangerous constructs out of style attributes", () => {
    const input = `${BASE}<rect style="fill:url(javascript:alert(1));stroke:#000" width="5" height="5"/></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg).not.toContain("javascript:");
  });

  it("drops external url() references in paint attributes but keeps local ones", () => {
    const input = `${BASE}<defs><linearGradient id="g1"/></defs><rect fill="url(#g1)" width="5" height="5"/><rect fill="url(http://evil.example.com/g)" width="5" height="5"/></svg>`;
    const { svg, report } = sanitizeSvg(input);
    expect(svg).toContain("url(#g1)");
    expect(svg.toLowerCase()).not.toContain("evil.example.com");
    expect(report.removedAttributes.length).toBeGreaterThan(0);
  });

  it("removes embedded iframe/object/embed elements", () => {
    const input = `${BASE}<iframe src="https://evil.example.com"/><object data="x"/><embed src="y"/></svg>`;
    const { svg, report } = sanitizeSvg(input);
    expect(report.removedElements).toContain("iframe");
    expect(report.removedElements).toContain("object");
    expect(report.removedElements).toContain("embed");
  });

  it("preserves Inkscape namespace metadata on layer groups (interoperability)", () => {
    const input = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" viewBox="0 0 100 100"><g id="layer-01" inkscape:groupmode="layer" inkscape:label="01_Background"><rect width="5" height="5"/></g></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg).toContain("inkscape:label");
    expect(svg).toContain("01_Background");
  });

  it("handles deeply nested payloads inside defs and symbols", () => {
    const input = `${BASE}<defs><symbol id="s1"><script>bad()</script></symbol></defs><use href="#s1"/></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg).not.toContain("bad()");
  });

  it("sanitizes inside <mask> and <clipPath> too", () => {
    const input = `${BASE}<mask id="m1"><rect onload="alert(1)" width="5" height="5"/></mask></svg>`;
    const { svg } = sanitizeSvg(input);
    expect(svg.toLowerCase()).not.toContain("onload");
  });
});
