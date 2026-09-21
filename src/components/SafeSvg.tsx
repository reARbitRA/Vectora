import React, { useMemo } from "react";
import { sanitizeSvg } from "../utils/sanitizeSvg";

/**
 * Renders untrusted SVG markup safely.
 *
 * This is the ONLY sanctioned way to put SVG markup into the DOM in
 * Vectora. It sanitizes the input (see `src/utils/sanitizeSvg.ts`) before
 * it reaches `dangerouslySetInnerHTML`, regardless of whether the markup
 * came from the AI backend, an imported file, saved history, or a bundled
 * sample. Never bypass it with a raw `dangerouslySetInnerHTML` call.
 */

export interface SafeSvgProps {
  /** Raw SVG markup. Sanitized before insertion into the DOM. */
  svg: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  title?: string;
}

export const SafeSvg: React.FC<SafeSvgProps> = ({ svg, className, style, id, title }) => {
  const { svg: safeMarkup, report } = useMemo(() => sanitizeSvg(svg), [svg]);

  if (process.env.NODE_ENV !== "production" && report.removedElements.length + report.removedAttributes.length > 0) {
    // Diagnostic only: surfaces that markup was altered by the sanitizer.
    console.warn(
      `[SafeSvg] sanitized markup: removed elements [${report.removedElements.join(", ")}], attributes [${report.removedAttributes.join(", ")}]`,
    );
  }

  return (
    <div
      id={id}
      className={className}
      style={style}
      title={title}
      dangerouslySetInnerHTML={{ __html: safeMarkup }}
    />
  );
};
