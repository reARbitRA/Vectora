import gifshot from 'gifshot';

export interface GifRenderOptions {
  width?: number;
  height?: number;
  fps?: number; // e.g., 15-30
  duration?: number; // in seconds
  sampleInterval?: number;
  onProgress?: (progressPercent: number) => void;
}

/**
 * Captures live animated SVG frames and renders them into an animated GIF file.
 * Creates an offscreen canvas and samples the SVG image at calculated timestamps across its cycle.
 */
export async function renderSvgAnimationToGif(
  svgString: string,
  options: GifRenderOptions = {}
): Promise<Blob> {
  const {
    width = 480,
    height = 480,
    fps = 18,
    duration = 3,
    onProgress,
  } = options;

  const totalFrames = Math.max(8, Math.min(120, Math.round(fps * duration)));
  const interval = duration / totalFrames;
  const frameImages: string[] = [];

  // Prepare offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context could not be created');
  }

  // Pre-clean and prepare SVG markup with explicit width/height & viewBox
  let cleanSvg = svgString;
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanSvg, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (svgEl) {
    svgEl.setAttribute('width', `${width}`);
    svgEl.setAttribute('height', `${height}`);
    if (!svgEl.getAttribute('viewBox')) {
      svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    cleanSvg = new XMLSerializer().serializeToString(doc);
  }

  // Create an invisible sandbox iframe / container to allow pure CSS animation playback or frame stepping
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.visibility = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-999';
  container.innerHTML = cleanSvg;
  document.body.appendChild(container);

  try {
    // Collect frames by rasterizing SVG at sequential timestamps
    for (let f = 0; f < totalFrames; f++) {
      const progressPercent = Math.round(((f + 1) / totalFrames) * 60); // 0-60% capture stage
      if (onProgress) {
        onProgress(progressPercent);
      }

      // Clone SVG with adjusted animation negative delay to capture exact phase
      const frameSvgDoc = parser.parseFromString(cleanSvg, 'image/svg+xml');
      const timeOffset = f * interval;

      // Adjust animation delay on all animated elements to offset time
      const animatedEls = frameSvgDoc.querySelectorAll('[class*="vec-anim-"], [class*="vec-orch-"]');
      animatedEls.forEach((el) => {
        const existingStyle = el.getAttribute('style') || '';
        el.setAttribute('style', `${existingStyle}; animation-delay: -${timeOffset.toFixed(4)}s !important;`);
      });

      const frameSvgStr = new XMLSerializer().serializeToString(frameSvgDoc);
      const svgBlob = new Blob([frameSvgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const frameDataUrl = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.clearRect(0, 0, width, height);
          // Dark canvas background to match vector artwork aesthetic
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG frame for rasterization'));
        };
        img.src = url;
      });

      frameImages.push(frameDataUrl);
    }

    if (onProgress) {
      onProgress(70); // Entering GIF compilation
    }

    // Use gifshot to compile images into animated GIF blob
    return await new Promise<Blob>((resolve, reject) => {
      gifshot.createGIF(
        {
          images: frameImages,
          gifWidth: width,
          gifHeight: height,
          interval: interval,
          numFrames: totalFrames,
          frameDuration: Math.round(10 / fps),
          sampleInterval: 10,
          numWorkers: 2,
          progressCallback: (captureProgress: number) => {
            if (onProgress) {
              const compPercent = 70 + Math.round(captureProgress * 28);
              onProgress(Math.min(98, compPercent));
            }
          },
        },
        (obj: any) => {
          if (!obj.error) {
            const base64Data = obj.image;
            // Convert data URI to Blob
            const byteString = atob(base64Data.split(',')[1]);
            const mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            if (onProgress) onProgress(100);
            resolve(blob);
          } else {
            reject(new Error(obj.errorMsg || 'Failed to encode GIF'));
          }
        }
      );
    });
  } finally {
    // Clean up container
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
