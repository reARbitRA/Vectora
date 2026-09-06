/**
 * VECTORA Vectorization Engine — ASCII Art Vector Typography Grid
 * Converts raster images into cybernetic ASCII / terminal text matrix vector art.
 * Maps block luminance to monospace typographic glyph density.
 */

import { imageToGrayscale } from './helpers/imageProcessing';

export interface AsciiOptions {
  charWidth?: number; // 6 to 14 px
  charHeight?: number; // 10 to 22 px
  charSet?: string;
  textColor?: string;
  backgroundColor?: string;
  invert?: boolean;
}

const DEFAULT_CHARSET = ' .:-=+*#%@'; // Low to high density

export function traceAsciiArt(
  imageData: ImageData,
  options: AsciiOptions = {}
): { svg: string; lineCount: number } {
  const {
    charWidth = 7,
    charHeight = 12,
    charSet = DEFAULT_CHARSET,
    textColor = '#00FF00',
    backgroundColor = '#0A0A0A',
    invert = false,
  } = options;

  const width = imageData.width;
  const height = imageData.height;
  const gray = imageToGrayscale(imageData);

  const cols = Math.floor(width / charWidth);
  const rows = Math.floor(height / charHeight);

  const textLines: { y: number; text: string }[] = [];

  for (let r = 0; r < rows; r++) {
    let line = '';
    const yCenter = r * charHeight + charHeight / 2;

    for (let c = 0; c < cols; c++) {
      const xCenter = c * charWidth + charWidth / 2;

      // Sample average luminance in char cell
      let sum = 0;
      let count = 0;
      for (let dy = -charHeight / 2; dy < charHeight / 2; dy += 2) {
        for (let dx = -charWidth / 2; dx < charWidth / 2; dx += 2) {
          const sx = Math.min(width - 1, Math.max(0, Math.round(xCenter + dx)));
          const sy = Math.min(height - 1, Math.max(0, Math.round(yCenter + dy)));
          sum += gray.data[sy * width + sx];
          count++;
        }
      }

      const lum = sum / (count || 1);
      const density = invert ? lum : 1 - lum;
      const charIdx = Math.min(charSet.length - 1, Math.max(0, Math.floor(density * charSet.length)));
      line += charSet[charIdx];
    }

    textLines.push({
      y: (r + 1) * charHeight,
      text: line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    });
  }

  const textTags = textLines
    .map(
      (tl, i) =>
        `    <text id="ascii-line-${i}" x="0" y="${tl.y.toFixed(1)}">${tl.text}</text>`
    )
    .join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" />
  <g id="ascii-matrix-layer" font-family="'JetBrains Mono', 'Fira Code', 'Courier New', monospace" font-size="${charHeight * 0.9}px" fill="${textColor}" xml:space="preserve">
${textTags}
  </g>
</svg>`;

  return { svg, lineCount: textLines.length };
}
