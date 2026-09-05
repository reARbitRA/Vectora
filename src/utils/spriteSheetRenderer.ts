import { downloadBlob } from './svgParser';

export interface SpriteSheetOptions {
  cols?: number; // e.g. 4
  rows?: number; // e.g. 4 (16 total frames)
  frameWidth?: number; // e.g. 256
  frameHeight?: number; // e.g. 256
  duration?: number; // animation cycle duration in seconds
  backgroundColor?: string; // e.g. '#000000' or 'transparent'
  onProgress?: (percent: number) => void;
}

export interface SpriteSheetResult {
  svgSpriteSheet: string;
  totalFrames: number;
  cols: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  totalWidth: number;
  totalHeight: number;
  cssSnippet: string;
}

/**
 * Generates an SVG Sprite Sheet containing sequential keyframe steps arranged in a grid.
 */
export function generateSvgSpriteSheet(
  svgString: string,
  options: SpriteSheetOptions = {}
): SpriteSheetResult {
  const {
    cols = 4,
    rows = 4,
    frameWidth = 256,
    frameHeight = 256,
    duration = 4,
    backgroundColor = '#0A0A0A',
  } = options;

  const totalFrames = cols * rows;
  const totalWidth = cols * frameWidth;
  const totalHeight = rows * frameHeight;
  const interval = duration / totalFrames;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  // Extract inner content and style from source SVG
  const styleEl = doc.getElementById('vectora-animations');
  const styleContent = styleEl ? styleEl.textContent || '' : '';

  const framesXml: string[] = [];
  const symbolsXml: string[] = [];

  for (let i = 0; i < totalFrames; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * frameWidth;
    const y = row * frameHeight;
    const timeOffset = (i * interval).toFixed(4);

    // Clone and offset animation phase for this frame
    const frameDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const animatedEls = frameDoc.querySelectorAll('[class*="vec-anim-"], [class*="vec-orch-"], [class*="vec-trail-"]');
    
    animatedEls.forEach((el) => {
      const existingStyle = el.getAttribute('style') || '';
      el.setAttribute('style', `${existingStyle}; animation-delay: -${timeOffset}s !important; animation-play-state: paused !important;`);
    });

    const rootSvg = frameDoc.querySelector('svg');
    let innerSvgContent = '';
    if (rootSvg) {
      innerSvgContent = rootSvg.innerHTML;
    }

    // Build frame group
    framesXml.push(`
    <!-- Frame ${i + 1} / ${totalFrames} (Phase: ${timeOffset}s) -->
    <g id="frame-${i}" transform="translate(${x}, ${y})">
      <rect width="${frameWidth}" height="${frameHeight}" fill="${backgroundColor}" stroke="#222222" stroke-width="1" />
      <g transform="scale(${frameWidth / 800}, ${frameHeight / 800})">
        ${innerSvgContent}
      </g>
      <text x="8" y="${frameHeight - 8}" fill="#555555" font-family="monospace" font-size="10">F${i + 1} (${timeOffset}s)</text>
    </g>`);

    symbolsXml.push(`
    <symbol id="sprite-frame-${i}" viewBox="0 0 ${frameWidth} ${frameHeight}">
      <g transform="scale(${frameWidth / 800}, ${frameHeight / 800})">
        ${innerSvgContent}
      </g>
    </symbol>`);
  }

  // Generate CSS Step-animation snippet
  const cssSnippet = `/* VECTORA CSS Sprite Sheet Step Animation */
.vectora-sprite {
  width: ${frameWidth}px;
  height: ${frameHeight}px;
  background-image: url('spritesheet.svg');
  background-size: ${totalWidth}px ${totalHeight}px;
  animation: play-spritesheet ${duration}s steps(${cols}) infinite;
}

@keyframes play-spritesheet {
  from { background-position: 0px 0px; }
  to { background-position: -${totalWidth}px 0px; }
}`;

  // Assemble master SVG spritesheet
  const svgSpriteSheet = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${totalWidth} ${totalHeight}" 
     width="${totalWidth}" 
     height="${totalHeight}">
  <title>VECTORA Animated Vector Sprite Sheet (${totalFrames} Frames - ${cols}x${rows})</title>
  <defs>
    <style>
      ${styleContent}
      .grid-line { stroke: #222222; stroke-width: 1; stroke-dasharray: 4 4; }
    </style>
    ${symbolsXml.join('\n')}
  </defs>

  <!-- Background Grid Canvas -->
  <rect width="${totalWidth}" height="${totalHeight}" fill="${backgroundColor}" />

  <!-- Sequential Animation Frames -->
  ${framesXml.join('\n')}
</svg>`;

  return {
    svgSpriteSheet,
    totalFrames,
    cols,
    rows,
    frameWidth,
    frameHeight,
    totalWidth,
    totalHeight,
    cssSnippet,
  };
}

/**
 * Renders an offscreen raster PNG Sprite Sheet from animated SVG frames.
 */
export async function renderPngSpriteSheet(
  svgString: string,
  options: SpriteSheetOptions = {}
): Promise<Blob> {
  const {
    cols = 4,
    rows = 4,
    frameWidth = 256,
    frameHeight = 256,
    duration = 4,
    backgroundColor = '#0A0A0A',
    onProgress,
  } = options;

  const totalFrames = cols * rows;
  const totalWidth = cols * frameWidth;
  const totalHeight = rows * frameHeight;
  const interval = duration / totalFrames;

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to obtain canvas 2D context');

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  const parser = new DOMParser();

  for (let i = 0; i < totalFrames; i++) {
    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalFrames) * 95));
    }

    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * frameWidth;
    const y = row * frameHeight;
    const timeOffset = i * interval;

    const frameDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const animatedEls = frameDoc.querySelectorAll('[class*="vec-anim-"], [class*="vec-orch-"], [class*="vec-trail-"]');
    
    animatedEls.forEach((el) => {
      const existingStyle = el.getAttribute('style') || '';
      el.setAttribute('style', `${existingStyle}; animation-delay: -${timeOffset.toFixed(4)}s !important;`);
    });

    const rootSvg = frameDoc.querySelector('svg');
    if (rootSvg) {
      rootSvg.setAttribute('width', `${frameWidth}`);
      rootSvg.setAttribute('height', `${frameHeight}`);
    }

    const frameSvgStr = new XMLSerializer().serializeToString(frameDoc);
    const svgBlob = new Blob([frameSvgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw frame bounding border
        ctx.strokeStyle = '#222222';
        ctx.strokeRect(x, y, frameWidth, frameHeight);
        ctx.drawImage(img, x, y, frameWidth, frameHeight);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(); // proceed even if one frame rasterization fails
      };
      img.src = url;
    });
  }

  if (onProgress) onProgress(100);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas PNG export failed'));
    }, 'image/png');
  });
}
