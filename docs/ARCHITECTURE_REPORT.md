# VECTORA STUDIO — TECHNICAL DOCUMENTATION & SYSTEM ARCHITECTURE REPORT

```
========================================================================================
██╗   ██╗███████╗ ██████╗████████╗ ██████╗ ██████╗  █████╗     ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
██║   ██║██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔══██╗    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
██║   ██║█████╗  ██║        ██║   ██║   ██║██████╔╝███████║    ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
╚██╗ ██╔╝██╔══╝  ██║        ██║   ██║   ██║██╔══██╗██╔══██║    ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
 ╚████╔╝ ███████╗╚██████╗   ██║   ╚██████╔╝██║  ██║██║  ██║    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
  ╚═══╝  ╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 
========================================================================================
```

> **System Name:** VECTORA Studio  
> **Release Version:** v2.6.0 Production Workstation  
> **Architecture:** Full-Stack Reactive Vector Studio (React + Vite + Express + Node.js + Gemini Flash Vision & AI)  
> **Authors & Engineering:** VECTORA System Core Engineering  
> **Documentation Target:** `/docs/ARCHITECTURE_REPORT.md`  

---

## 1. Executive Summary & Design Philosophy

### 1.1 What is VECTORA?
**VECTORA Studio** is a browser-native vector design environment, parametric workstation, and generative AI vector synthesis engine. While conventional generative AI image models output flat, non-editable pixel matrices (PNG, JPEG, WebP), VECTORA constructs **pure, resolution-independent, mathematically precise Scalable Vector Graphics (SVG)**. 

Every visual asset in VECTORA is generated as clean, semantic SVG DOM code structured with:
- **Inkscape Layer Standards** (`inkscape:groupmode="layer"`, `inkscape:label="01_Background"`, etc.)
- **Nested Component Sub-groups** (`<g id="...">`)
- **Semantic CSS Variable Bindings** (`var(--color-primary)`)
- **Mathematical Bezier Contours** (`M`, `C`, `S`, `Q`, `A`, `Z`)
- **Rich Vector Definitions** (`<defs>`, linear/radial gradients, dynamic filter primitives, pattern tiles)

### 1.2 Design Philosophy: Precision, Craftsmanship & The "Anti-Slop" Standard
VECTORA was designed under strict aesthetic and engineering mandates:
1. **Mathematical Precision Over Raster Approximations**: Every graphic maintains infinite scalability from small favicon sizes (16×16) to massive architectural vector billboards (8000×8000) without pixelation or compression artifacts.
2. **Terminal & Technical HUD Aesthetics**: High-contrast obsidian backgrounds (`#000000`, `#0A0A0A`, `#141414`), laser-etched neon accents (`#00FF00`, `#00FFFF`, `#FF0055`), and utilitarian monospace typography (`font-mono`).
3. **Transparent & Accessible Code**: Designers and engineers have direct, bidirectional access to the underlying vector code, node metrics, AST nodes, and layers.
4. **Interoperability**: Native export presets for modern production pipelines—from raw SVGs for Inkscape, Adobe Illustrator, and Figma, to typed **React TSX components**, standalone **CSS Data URIs**, and **ultra-high-resolution raster PNGs**.

---

## 2. Technology Stack & Framework Architecture

```
+-------------------------------------------------------------------------------+
|                             CLIENT-SIDE ARCHITECTURE                          |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                           React 18.3 (TypeScript)                       |  |
|  |   - Declarative reactive state management (Layers, AST, Canvas, Presets)|  |
|  |   - Modular component hierarchy & custom hooks                          |  |
|  +-------------------------------------------------------------------------+  |
|  |                           Tailwind CSS v4 & Theming                     |  |
|  |   - Utility-first dark studio palette (#000000, #0A0A0A, #00FF00)       |  |
|  |   - Monospace typography & micro-metric HUD styling                     |  |
|  +-------------------------------------------------------------------------+  |
|  |                           Motion (Framer Motion API)                    |  |
|  |   - Spring physics for layer drawers, modal sheets & tabs               |  |
|  |   - AnimatePresence for smooth transitions without layout shifts        |  |
|  +-------------------------------------------------------------------------+  |
|  |                           Browser DOMParser & XMLSerializer             |  |
|  |   - Native in-memory SVG AST parsing, layer extraction, DOM sync        |  |
|  +-------------------------------------------------------------------------+  |
|  |                           Lucide-React                                  |  |
|  |   - Crisp vector iconography for all studio toolbars and canvas actions  |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------------+---------------------------------------+
                                        | (Internal REST API / JSON Payloads)
+---------------------------------------v---------------------------------------+
|                             SERVER-SIDE ARCHITECTURE                          |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                      Express.js on Node.js (TypeScript)                 |  |
|  |   - Port 3000 container reverse proxy binding                           |  |
|  |   - Vite Middleware in development / Static bundle serving in prod      |  |
|  +-------------------------------------------------------------------------+  |
|  |                      Google GenAI SDK (@google/genai)                   |  |
|  |   - Gemini 2.5 / 3.0 Flash multi-modal models                           |  |
|  |   - Structured JSON schema enforcement & temperature tuning             |  |
|  |   - Multimodal Image Deconstruction & Vector Synthesis                  |  |
|  +-------------------------------------------------------------------------+  |
|  |                      Security & Key Isolation                           |  |
|  |   - Zero API key exposure to browser DevTools                           |  |
|  |   - Server-side rate limiting & structured error fallbacks              |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

### 2.1 React & TypeScript
- Built with **React 18.3** utilizing strictly typed interfaces (`src/types.ts`) for artwork data structures, layer nodes, canvas viewport transformations, export profiles, and generative payloads.
- State is compartmentalized to prevent unnecessary re-renders during high-frequency zoom and pan operations.

### 2.2 Tailwind CSS
- Styled entirely using Tailwind CSS utility classes configured for high density and contrast.
- Custom custom-scrollbar styling, crisp 1px borders (`border-[#333333]`), and distinct focus rings (`focus:border-[#00FF00]`).

### 2.3 Motion (Framer Motion API)
- Smooth animated drawers for the **Layer Hierarchy Panel** and **Parametric Tuner Panel** using physical spring dynamics (`damping: 26`, `stiffness: 280`, `mass: 0.8`).
- Modals, tooltips, and tab transitions utilize `AnimatePresence` for unmount transitions.

---

## 3. Core Subsystems & Technical Mechanics

### 3.1 Advanced In-Memory SVG Parser & AST Engine (`src/utils/svgParser.ts`)
Rather than treating SVG files as opaque strings, VECTORA operates on the live SVG DOM tree using browser-native `DOMParser` and `XMLSerializer`:
- **`parseSvgLayers(svgString)`**: Scans top-level `<g>` elements for `inkscape:groupmode="layer"` or `inkscape:label` attributes, quantifying child elements and visibility states.
- **`parseSvgHierarchy(svgString)`**: Recursively analyzes the full depth of `<g>` groupings, generating a nested `LayerHierarchyNode[]` tree representing top-level layers, sub-groups, child geometries, and active CSS blend modes.
- **`extractSvgColors(svgString)`**: Regex and DOM-based extraction of unique hex, RGB, and named colors across `fill`, `stroke`, `stop-color`, and inline styles.
- **`remapSvgColors(svgString, targetPalette)`**: Mathematical color-space mapper that computes luminance and visual order to remap existing vector artwork into target palette themes.
- **`setSvgLayerVisibility(svgString, layerName, visible)`**: Surgically toggles `display="none"` or removes visibility overrides on matching layer nodes.
- **`setSvgLayerLock(svgString, layerName, locked)`**: Applies `pointer-events="none"` and `data-locked="true"` to prevent inadvertent canvas manipulation.
- **`setSvgLayerBlendMode(svgString, layerName, blendMode)`**: Updates CSS `mix-blend-mode` on the target container `<g>` element.
- **`standardizeSvgLayers(svgString)`**: Automatically reformats unstructured SVG groups into standardized VECTORA layer sequences (`01_Background`, `02_Shapes_Primary`, `03_Artwork_Core`, `04_Details_Secondary`, `05_Text_Headlines`, `06_Accents_Highlights`, `07_FX_Overlays`).

### 3.2 Multimodal AI Vector Generator & Vision Engine (`server.ts`)
The server encapsulates the modern `@google/genai` TypeScript SDK:
- **Text-to-Vector Synthesis (`/api/generate-svg`)**: Uses Gemini Flash with structured JSON schema output to synthesize full vector masterworks containing `<defs>`, `<style>`, and layered `<g>` nodes.
- **Natural Language Refinement (`/api/refine-svg`)**: Modifies specific layers or geometric attributes of an existing SVG based on contextual user instructions without regenerating the entire artwork from scratch.
- **Multimodal Image & Document Vectorization (`/api/import-vectorize`)**:
  - **Image Input**: Scans uploaded base64 bitmap images, extracting primary visual hierarchy, bounding forms, and color palettes, generating an authentic vector reproduction.
  - **Document Input**: Analyzes specifications, markdown docs, and telemetry data to generate illustrative or diagrammatic vector compositions.

### 3.7 Kinetic Animation Studio (`src/components/AnimationStudio.tsx`)
VECTORA features a professional-grade SVG animation workstation that compiles complex motion into pure CSS keyframes:
- **`injectSvgAnimations(svgString, config)`**: Surgically injects `<style>` blocks containing `@keyframes` and class assignments without bloating the SVG structure.
- **Motion Presets**: Catalog of 15+ curated effects including *Laser Path Trace*, *Cybernetic Glitch*, *Radar Telemetry Beam*, and *Cinematic Levitation*.
- **Motion Trail Engine**: Automatically generates staggered opacity clones of animated paths to simulate cinematic motion blur.
- **Global Playback Controls**: Real-time speed scaling, easing function selection (Cubic Bezier, Stepped, Linear), and loop mode configuration (*Infinite*, *Once*, *Alternate*).
- **GIF Encoding (`src/utils/gifRenderer.ts`)**: Utilizes `gif.js` to capture high-fidelity 60FPS timeline slices and encode them into standalone animated GIFs directly in the browser.

### 3.8 Animation Sync Engine (`src/components/AnimationSyncManager.tsx`)
Enables complex relationship mapping between disparate vector layers:
- **Sync Groups**: Linking multiple layers to shared timing, duration, and easing parameters.
- **Phase Offsetting**: Maintaining group synchronization while introducing relative timing shifts.

### 3.9 Robust AI Reliability & Error Handling (`server.ts` & `App.tsx`)
- **Exponential Backoff Retries**: Server-side AI calls are wrapped in a `withRetry` utility that automatically handles transient 503 "High Demand" errors with jittered backoff.
- **Graceful Procedural Fallbacks**: If the AI engine remains busy after all retries, the system seamlessly transitions to local procedural synthesis to maintain a continuous creative workflow.
- **Global Notification System**: Real-time visual toasts providing status updates on AI generation, refinement successes, and detailed technical error reporting.

### 3.3 Visual Layer Hierarchy & Tree Management (`src/components/LayerPanel.tsx`)
- **Hierarchical Tree Display**: Visual branch connectors depicting nested depth.
- **Interactive Container Controls**: Expand/collapse buttons (`ChevronDown` / `ChevronRight`), **Collapse All**, and **Expand All**.
- **Real-Time Group Toggles**: Visibility eye icons, lock toggles, solo isolate crosshairs, and inline double-click renaming.
- **Layer Draw Ordering**: Bring Forward (`ArrowUp`) and Send Backward (`ArrowDown`) re-ordering top-level layers in the DOM.
- **16-State CSS Blend Mode Selector**: Dynamic selector for `normal`, `multiply`, `screen`, `overlay`, `darken`, `color-dodge`, `difference`, `exclusion`, etc.

### 3.4 Interactive Palette Manager & Color Engine (`src/components/PaletteManager.tsx`)
- **Palette Extraction**: Instantly extracts every active color in the current artwork, displaying hex codes, RGB values, and element usage frequency.
- **Curated Palette Library**: Access to signature palettes (*Cyberpunk Neon*, *Bauhaus Constructivist*, *Terminal Monochrome*, *Earthen Editorial*, *Solar Flare*, *Vaporwave Aesthetic*).
- **Procedural Harmony Generator**: Generates complementary, triadic, analogous, and monochromatic palettes on the fly.
- **1-Click Artwork Remap**: Immediately recalculates and repaints the vector DOM with the selected color scheme.

### 3.5 High-Precision Studio Canvas (`src/components/StudioCanvas.tsx`)
- **Matrix Transformation Engine**: Smooth coordinate pan and zoom (10% to 500%) with mouse-wheel and multi-touch support.
- **Grid Overlays**:
  - **Cartesian Grid**: High-precision metric square subdivisions.
  - **Isometric Grid**: 30-degree isometric diamond guides for axonometric art.
  - **Polar Grid**: Concentric circular rings with 45-degree angle crosshairs.
- **Aspect Ratio Selector**: Dynamically re-frames the SVG viewbox for `1:1`, `16:9`, `9:16`, or `4:5`.
- **Keyboard Navigation**: `Space + Drag` pan canvas, `Ctrl+0` reset view, `Ctrl+Z` undo, `Ctrl+Y` redo, `Ctrl+S` export.

### 3.6 Preset-Driven Export Workstation (`src/components/ExportModal.tsx`)
- **Raw SVG Source**: Clean, standalone vector code with semantic layer groups.
- **Retina & High-DPI PNGs**: High-resolution client-side canvas rasterization at 1x, 2x (2000px), 4x (4000px), and 8x (8000px Ultra HD).
- **React TSX Component**: Auto-generated functional React component with typed props (`className`, `width`, `height`).
- **CSS Data URI**: URL-encoded background asset ready for embedding into CSS stylesheets.
- **Custom Profile Manager**: Save and persist custom export configurations in `localStorage`.

---

## 4. Predefined Workspace Layout Modes

VECTORA adapts to different workflows via three dedicated layout configurations:

| Layout Mode | Identifier | Visual Chrome | Ideal Use Case | Shortcut |
|---|---|---|---|---|
| **Full Studio** | `full` | Complete top navbar, right layer drawer, parametric drawer, bottom prompt bar | In-depth editing, AI generation, and AST inspection | `Alt + 1` |
| **Minimalist** | `minimalist` | Slim navigation bar, collapsible bottom refine pill, clean artboard | Distraction-free composition and manual drawing | `Alt + 2` |
| **Canvas Focus** | `canvas-focus` | Hidden top bar, immersive artboard, floating translucent HUD | Presentation, large monitors, maximum visual space | `Alt + 3` |

---

## 5. Summary of Built-in Masterpiece Gallery

VECTORA comes bundled with production-grade vector blueprints demonstrating the engine's capabilities:
1. **Cyberpunk Neural Interface HUD** (`cyberpunk-hud`): High-density technical schematic with concentric telemetry rings, coordinate tickers, and glow filters.
2. **Bauhaus Geometric Construct** (`bauhaus-geometric`): Bold constructivist poster balancing Cadmium Red, Deep Navy, and Goldenrod geometries.
3. **Quantum Processor Telemetry** (`quantum-processor`): Hexagonal polar grid featuring cryogenic phase rings and laser crosshairs.
4. **Bio-Mechanical Cyber Skull** (`bio-skull`): Intricate organic-mechanical vector fusion with circuit traces and specular neon accents.
5. **Retro Synthwave Grid Horizon** (`synthwave-horizon`): 80s wireframe perspective grid with neon sun and chrome typography.
6. **Sacred Geometry Stargate** (`sacred-geometry`): Golden ratio logarithmic spirals and interlocking mandala vector rings.

---

## 6. Directory Structure & File Map

```
/
├── server.ts                       # Express server, Vite middleware, Gemini AI Vision & Synthesis APIs
├── package.json                    # Project dependencies, build scripts (Vite + esbuild)
├── metadata.json                   # Applet configuration, frame permissions, capabilities
├── index.html                      # HTML5 entry point with dark studio metadata
├── docs/
│   ├── ARCHITECTURE_REPORT.md      # Comprehensive technical architecture & system documentation
│   └── APP_REPORT.md               # Executive summary report
├── src/
│   ├── main.tsx                    # React application bootstrap
│   ├── App.tsx                     # Main Studio workspace, state management, notification system
│   ├── index.css                   # Global styles & custom scrollbars
│   ├── types.ts                    # Global TypeScript interfaces, enums, and sync group types
│   ├── data/
│   │   ├── masterpieces.ts         # Pre-configured SVG masterpiece catalog
│   │   ├── palettes.ts             # Curated color palettes & harmonic schemes
│   │   ├── reusableComponents.ts   # Reusable vector patterns & component library
│   │   └── vectoraBasePalette.ts   # Core VECTORA studio color definitions
│   ├── utils/
│   │   ├── svgParser.ts            # Live DOMParser, AST tree parser, color remapper, layer engine
│   │   ├── svgAnimator.ts          # CSS Keyframe injection engine & motion preset library
│   │   └── gifRenderer.ts          # Browser-side GIF encoding & capturing utility
│   └── components/
│       ├── StudioCanvas.tsx        # High-performance vector canvas, zoom/pan matrix, grid HUD
│       ├── Navbar.tsx              # Workspace mode switcher, layout dropdown, quick actions
│       ├── LayerPanel.tsx          # Multi-level Inkscape layer hierarchy & tree inspector
│       ├── ParametricPanel.tsx     # Stroke scaling, procedural noise/grain, glow tuner
│       ├── PaletteManager.tsx      # Color extraction, harmony generator, instant remapping
│       ├── ReusableComponentShowcase.tsx # Vector component injection library
│       ├── CodeEditor.tsx          # Bidirectional live SVG code editor & AST metrics
│       ├── DesignSpecPanel.tsx     # Design specs, geometry audits, contrast scores
│       ├── MasterpieceGallery.tsx  # Gallery view with filter tags and instant loading
│       ├── ImportModal.tsx         # Multimodal image & text document vectorization engine
│       ├── AIGeneratorModal.tsx    # Generative AI modal with style & complexity selectors
│       ├── RefinePromptBar.tsx     # Contextual AI natural language refinement bar
│       ├── ExportModal.tsx         # Multi-format preset export workstation (SVG, PNG, TSX, CSS)
│       ├── AnimationStudio.tsx     # Kinetic SVG animation workstation & GIF renderer
│       ├── KeyframeTimeline.tsx    # Visual animation timeline & playback controller
│       └── AnimationSyncManager.tsx # UI for managing layer animation synchronization
```

---

*Documentation compiled and verified by VECTORA Engineering System v2.6.*
