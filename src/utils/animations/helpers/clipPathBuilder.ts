/**
 * VECTORA Animation Engine — ClipPath & Filter Procedural Builder
 * Injects procedural SVG <defs> for advanced animation techniques:
 * - Directional wipe clipPaths (LTR, RTL, TTB, Diagonal)
 * - Radial aperture / Iris reveal masks
 * - Displacement filters (feTurbulence + feDisplacementMap)
 * - Ink bleed & chromatic aberration color filters
 * - Liquid wave fill clipPaths
 */

export function ensureDefsElement(doc: Document): SVGDefsElement {
  const svgEl = doc.querySelector('svg');
  if (!svgEl) throw new Error('SVG root not found');

  let defs = svgEl.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svgEl.insertBefore(defs, svgEl.firstChild);
  }
  return defs;
}

/**
 * Injects procedural animation defs into SVG DOM
 */
export function injectAnimationDefs(doc: Document, width: number, height: number): void {
  const defs = ensureDefsElement(doc);

  // Remove existing vectora animation defs to prevent duplicates
  const existingDefs = defs.querySelectorAll('[id^="vec-anim-def-"]');
  existingDefs.forEach((el) => el.remove());

  // 1. Wipe Reveal ClipPath (horizontal swipe)
  const wipeClip = doc.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  wipeClip.setAttribute('id', 'vec-anim-def-wipe-clip');
  wipeClip.innerHTML = `<rect id="vec-wipe-rect" x="-${width}" y="0" width="${width}" height="${height}" class="vec-anim-wipe-rect" />`;
  defs.appendChild(wipeClip);

  // 2. Iris Aperture Reveal ClipPath (radial circle wipe)
  const maxR = Math.sqrt(width * width + height * height) / 2;
  const irisClip = doc.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  irisClip.setAttribute('id', 'vec-anim-def-iris-clip');
  irisClip.innerHTML = `<circle id="vec-iris-circle" cx="${width / 2}" cy="${height / 2}" r="0" class="vec-anim-iris-circle" />`;
  defs.appendChild(irisClip);

  // 3. Liquid Fill ClipPath (rising waterline with wave)
  const liquidClip = doc.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  liquidClip.setAttribute('id', 'vec-anim-def-liquid-clip');
  liquidClip.innerHTML = `<rect id="vec-liquid-rect" x="0" y="${height}" width="${width}" height="${height}" class="vec-anim-liquid-rect" />`;
  defs.appendChild(liquidClip);

  // 4. Ink Bleed Filter (feGaussianBlur delayed expansion)
  const inkFilter = doc.createElementNS('http://www.w3.org/2000/svg', 'filter');
  inkFilter.setAttribute('id', 'vec-anim-def-ink-bleed');
  inkFilter.setAttribute('x', '-20%');
  inkFilter.setAttribute('y', '-20%');
  inkFilter.setAttribute('width', '140%');
  inkFilter.setAttribute('height', '140%');
  inkFilter.innerHTML = `
    <feGaussianBlur in="SourceGraphic" stdDeviation="0" id="vec-ink-blur" class="vec-anim-ink-blur" result="blur" />
    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="contrast" />
    <feComposite in="SourceGraphic" in2="contrast" operator="over" />
  `;
  defs.appendChild(inkFilter);

  // 5. Path Warp & Displacement (feTurbulence + feDisplacementMap)
  const warpFilter = doc.createElementNS('http://www.w3.org/2000/svg', 'filter');
  warpFilter.setAttribute('id', 'vec-anim-def-path-warp');
  warpFilter.setAttribute('x', '-20%');
  warpFilter.setAttribute('y', '-20%');
  warpFilter.setAttribute('width', '140%');
  warpFilter.setAttribute('height', '140%');
  warpFilter.innerHTML = `
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" result="noise" id="vec-warp-turbulence">
      <animate attributeName="baseFrequency" dur="6s" values="0.01 0.02; 0.04 0.08; 0.01 0.02" repeatCount="indefinite" />
    </feTurbulence>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
  `;
  defs.appendChild(warpFilter);

  // 6. Liquid Gradient Flow
  const flowGrad = doc.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  flowGrad.setAttribute('id', 'vec-anim-def-gradient-flow');
  flowGrad.setAttribute('x1', '0%');
  flowGrad.setAttribute('y1', '0%');
  flowGrad.setAttribute('x2', '100%');
  flowGrad.setAttribute('y2', '100%');
  flowGrad.innerHTML = `
    <stop offset="0%" stop-color="#00FF00">
      <animate attributeName="stop-color" values="#00FF00;#00FFFF;#FF00FF;#00FF00" dur="5s" repeatCount="indefinite" />
    </stop>
    <stop offset="50%" stop-color="#00FFFF">
      <animate attributeName="stop-color" values="#00FFFF;#FF00FF;#00FF00;#00FFFF" dur="5s" repeatCount="indefinite" />
    </stop>
    <stop offset="100%" stop-color="#FF00FF">
      <animate attributeName="stop-color" values="#FF00FF;#00FF00;#00FFFF;#FF00FF" dur="5s" repeatCount="indefinite" />
    </stop>
  `;
  defs.appendChild(flowGrad);

  // 7. Hue Rotation Filter
  const hueFilter = doc.createElementNS('http://www.w3.org/2000/svg', 'filter');
  hueFilter.setAttribute('id', 'vec-anim-def-hue-rotate');
  hueFilter.innerHTML = `
    <feColorMatrix type="hueRotate" values="0" id="vec-hue-matrix">
      <animate attributeName="values" from="0" to="360" dur="6s" repeatCount="indefinite" />
    </feColorMatrix>
  `;
  defs.appendChild(hueFilter);
}
