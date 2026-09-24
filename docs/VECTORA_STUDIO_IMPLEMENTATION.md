# VECTORA Studio implementation map

This repository implements the production-safe, dependency-free portion of the 2027 encyclopedia in the browser. GPU/neural entries are represented as extension points rather than fake local implementations.

## Image → SVG

The unified registry now includes centerline thinning, Potrace-style region tracing, color quantization, Delaunay, halftone, Voronoi, contours, ASCII, isometric voxels, cross hatch, TSP, Canny, marching squares, Sobel gradient fields, and Fourier contour approximation. `VectorizationEngine` is the async orchestration API and emits progress, SVG, layers, and metadata.

Shared algorithms live under `src/utils/vectorization/helpers`: grayscale/blur/Otsu/Sobel/Canny, Zhang–Suen, RDP, Chaikin, Bezier fitting, color math, topology, path normalization, and SVG construction.

## Animation

The existing 25 presets are supplemented with scroll timelines, IntersectionObserver staggering, spring motion, MorphSVG/GSAP adapters, variable-font animation, View Transitions, filter composition, Lottie export metadata, WAAPI control, SMIL builders, easing constants, wave keyframes, and reduced-motion fallbacks.

`AnimationEngine.bake(svg, preset)` provides a framework-neutral baking entry point; `AnimationEngine.apply()` provides WAAPI runtime control.

## Extension boundaries

DiffVG, LIVE, SAM, StarVector, diffusion, Lottie encoding, and WebGPU compute are not silently emulated. The registry and engine are intentionally ready for adapters, while classical methods remain fully local, deterministic, testable, and worker-compatible.
