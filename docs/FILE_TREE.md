# VECTORA STUDIO — COMPLETE PROJECT FILE TREE & DIRECTORY DOCUMENTATION

> **Document:** Project File Tree & Structural Map  
> **Location:** `/docs/FILE_TREE.md`  
> **Status:** Active & Maintained  
> **System Name:** VECTORA — Generative SVG Design Studio  
> **Architecture:** Full-Stack Reactive Vector Studio (React + Vite + Express + Node.js + TypeScript + Tailwind CSS)  
> **Upgrade Policy:** Automatically updated whenever a new file or directory is created, moved, or modified.

---

## 1. Complete ASCII Project File Tree

```text
/ (workspace-root)
├── .env.example                     # Environment variables schema and template
├── .gitignore                       # Git ignore declarations for build outputs & secrets
├── .github/                         # CI quality gate (typecheck, tests, build)
│   └── workflows/ci.yml             # GitHub Actions pipeline for pushes & pull requests
├── AGENTS.md                        # Persistent agent instructions and maintenance rules
├── VERIFICATION_REPORT.md           # System verification, stress-test audit & diagnostic logs
├── bun.lock                         # Bun runtime lockfile
├── index.html                       # HTML application entry point & Google Fonts loading
├── metadata.json                    # Application metadata, permissions & capabilities
├── package.json                     # Project manifest (vectora), npm dependencies & build scripts
├── README.md                        # Honest project overview, setup & status summary
├── server.ts                        # Express backend entry, routes & AI model orchestrator
├── server/                          # Server modules (Phase 0 stabilization split)
│   ├── config.ts                    # Env-driven configuration (PORT, limits, rate budgets, TTLs)
│   ├── ai/contracts.ts              # Runtime validation of AI JSON responses (schema + bounds)
│   └── security/                    # svgGuard, rateLimit, oauthState, sessions modules
├── tsconfig.json                    # TypeScript compiler configuration & path definitions
├── verify_system.ts                 # Automated end-to-end backend verification script
├── vite.config.ts                   # Vite bundler configuration & Tailwind integration
├── vitest.config.ts                 # Test runner configuration (node + jsdom environments)
│
├── docs/                            # Technical reports & system architecture documentation
│   ├── APP_REPORT.md                # Comprehensive feature matrix & application report
│   ├── ARCHITECTURE_REPORT.md       # High-level architecture, SVG standards & engine specs
│   ├── AUDIT.md                     # Verified repository audit, feature status matrix & roadmap
│   └── FILE_TREE.md                 # Living project file tree & directory documentation (this file)
│
├── public/                          # Static web assets served directly by Vite/Express
│   └── assets/
│       └── aistudio/
│           └── .gitignore           # Asset folder tracking rule
│
└── src/                             # Client-side React source code
    ├── App.tsx                      # Top-level React container, global state & view router
    ├── index.css                    # Global CSS styling & Tailwind CSS directives
    ├── main.tsx                     # React client DOM mount entry point
    ├── types.ts                     # Shared TypeScript interfaces, types & data models
    │
    ├── components/                  # UI components and interactive studio panels
    │   ├── AIGeneratorModal.tsx     # Generative prompt modal with style & complexity selectors
    │   ├── AnimatedIntro.tsx        # Kinetic cybernetic splash sequence
    │   ├── AnimationStudio.tsx      # Standalone kinetic vector animation workspace
    │   ├── AnimationSyncManager.tsx # SMIL, CSS keyframe and timeline synchronization engine
    │   ├── CodeEditor.tsx           # Monospace SVG code editor with live two-way binding
    │   ├── CommandPalette.tsx       # Global Cmd/Ctrl+K spotlight command palette & generation triggers
    │   ├── DesignSpecPanel.tsx      # SVG geometry, DOM node metric & AST telemetry inspector
    │   ├── ExportModal.tsx          # Multi-format export (SVG, React TSX, CSS Data URI, PNG)
    │   ├── GenerationLoader.tsx     # Vector synthesis loading screen with animated wireframe
    │   ├── HistoryView.tsx          # Session design history & artwork recovery manager
    │   ├── HomeView.tsx             # Main landing view, blueprint showcase & prompt launcher
    │   ├── ImportModal.tsx          # Multimodal raster-to-vector & brief-to-vector parser
    │   ├── IntroLoader.tsx          # Initial boot loader with diagnostic system telemetry
    │   ├── KeyboardShortcutsModal.tsx # Comprehensive keyboard shortcut reference modal
    │   ├── KeyframeTimeline.tsx     # Motion timeline scrubber, keyframe tracks & playback controls
    │   ├── LayerPanel.tsx           # Hierarchical AST layer tree with lock, solo & blend modes
    │   ├── MainLayout.tsx           # Shell layout container for responsive workspace docking
    │   ├── MasterpieceGallery.tsx   # Pre-rendered vector artwork collection viewer
    │   ├── Navbar.tsx               # Top app header with view switching, layout mode & actions
    │   ├── PaletteManager.tsx       # Vector color harmonic remapper & palette generator
    │   ├── ParametricPanel.tsx      # Real-time stroke width, noise filter & glow controls
    │   ├── PluginGallery.tsx        # Extensible vector filters & generative effects showcase
    │   ├── RefinePromptBar.tsx      # Natural language conversational refinement prompt bar
    │   ├── ReusableComponentShowcase.tsx # Library of modular UI icons, dials & HUD symbols
    │   ├── SafeSvg.tsx              # Sanitized SVG renderer — the only sanctioned inline-SVG path
    │   ├── StudioCanvas.tsx         # Pan/zoom vector artboard with Cartesian/Polar grids
    │   └── UnifiedStudio.tsx        # Integrated master workstation (canonical document + command history)
    │
    ├── document/                     # Canonical document engine (Phase 1) — the editing source of truth
    │   ├── types.ts                  # VectorDocument, PageNode, Element/Text/Comment nodes, schema version
    │   ├── ids.ts                    # Stable node uid generation
    │   ├── tree.ts                   # Immutable tree operations (path copying, no-op identity)
    │   ├── importer.ts               # SVG → document adapter (uid reuse, semantic equality, whitespace policy)
    │   ├── exporter.ts               # Document → canonical pretty-printed SVG adapter
    │   ├── selectors.ts              # Document → LayerSpec[] derivation
    │   ├── commands.ts               # Command-based mutations (attr, reorder, add/remove, replace, palette)
    │   ├── history.ts                # Transactional undo/redo with coalescing
    │   ├── migrations.ts             # Schema version migration chain
    │   ├── persistence.ts            # IndexedDB store + debounced autosaver
    │   ├── index.ts                  # Public surface of the document engine
    │   └── __tests__/                # 66 unit tests: round-trips, commands, history, persistence, selectors
    │
    ├── data/                        # Static datasets, preset themes & vector libraries
    │   ├── masterpieces.ts          # Curated SVG masterpieces with pre-parsed layers & palettes
    │   ├── palettes.ts              # Preset harmonic color palettes (Obsidian, Bauhaus, Cyber)
    │   ├── reusableComponents.ts    # Reusable SVG vector symbols, HUD dials & tech badges
    │   └── vectoraBasePalette.ts    # Design system foundational colors and contrast tokens
    │
    └── utils/                       # Vector math, parsing, rendering & animation utilities
        ├── animations/              # Modular 25-technique kinetic animation engine
        │   ├── helpers/
        │   │   ├── clipPathBuilder.ts   # Procedural SVG <clipPath> masks, wipes & iris definitions
        │   │   └── keyframeGenerator.ts # CSS keyframes for 25 production SVG animation techniques
        │   └── index.ts             # Master animation preset registry & procedural SVG injector
        ├── gifRenderer.ts           # HTML5 Canvas frame-by-frame animated GIF exporter
        ├── spriteSheetRenderer.ts   # Multi-row vector animation sprite sheet generator
        ├── sanitizeSvg.ts           # DOM-based SVG sanitizer (authoritative render gate)
        ├── svgAnimator.ts           # Kinetic SVG animation injection & CSS keyframe engine
        ├── svgParser.ts             # Semantic SVG DOM parser, layer extractor & node counter
        ├── __tests__/               # Sanitizer XSS-vector & layer-persistence regression suites
        └── vectorization/           # 12-engine client-side raster-to-SVG vectorization suite
            ├── asciiMatrixTracer.ts     # Monospace ASCII terminal matrix vector renderer
            ├── cannyLineTracer.ts       # Canny edge detector & architectural blueprint tracer
            ├── colorQuantizer.ts        # K-means color posterization & multi-layer vector tracer
            ├── contourIsolineTracer.ts  # Marching Squares elevation isoline topographic generator
            ├── crossHatchTracer.ts      # Multi-angle intaglio sketch & cross-hatch line generator
            ├── delaunayMeshTracer.ts    # Bowyer-Watson Delaunay triangulation low-poly mesh
            ├── halftoneDotTracer.ts     # Pop-art CMYK-style variable radius halftone dot matrix
            ├── index.ts                 # Unified vectorization orchestrator & preset catalog
            ├── potraceTracer.ts         # Medial skeletonization & boundary polygon contour engine
            ├── tspArtTracer.ts          # Traveling Salesperson single-unbroken-stroke continuous line art
            ├── types.ts                 # Vectorization types, interfaces & algorithm option models
            ├── voronoiStippler.ts       # Centroidal Voronoi / Lloyd-relaxed ink stippling engine
            └── voxel3dTracer.ts         # 2.5D isometric shaded block & voxel vector projection
```

---

## 2. Directory & Module Breakdown

### 2.1 Root Configuration & Infrastructure

| File / Path | Role & Technology | Key Responsibilities |
| :--- | :--- | :--- |
| **`server.ts`** | Backend Entry (Express + Vite + TypeScript) | Serves the REST API on `process.env.PORT` (fallback 3000), mounts Vite dev middleware, defines `/api/generate-svg`, `/api/refine-svg`, `/api/animate-svg`, `/api/import-vectorize`, `/api/generate-unified`, GitHub OAuth/sync routes, and orchestrates the multi-model pool with retry/backoff. Security modules, runtime AI contracts, and configuration live in **`server/`** (`config.ts`, `security/rateLimit.ts`, `security/oauthState.ts`, `security/sessions.ts`, `security/svgGuard.ts`, `ai/contracts.ts`) with unit tests under `server/**/__tests__/`. |
| **`package.json`** | Manifest & Scripts (npm) | Package `vectora`; defines runtime packages (`@google/genai`, `motion`, `lucide-react`, `sonner`, `express`) and scripts (`dev`, `build`, `start`, `lint`, `test`, `test:watch`). |
| **`tsconfig.json`** | TypeScript Configuration | Strict type-checking rules, modern ES modules target, JSX processing (`react-jsx`), and module resolution paths. |
| **`vite.config.ts`** | Bundler & Dev Config | Configures Vite development server, binds port `3000`, and attaches `@tailwindcss/vite` plugin. |
| **`metadata.json`** | Platform App Identity | Sets application name (*VECTORA — Generative SVG Design Studio*), capabilities (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`), and permissions. |
| **`index.html`** | Web Entry Point | Served to the browser; loads web fonts (JetBrains Mono, Inter, Plus Jakarta Sans), sets responsive viewport, and mounts `#root`. |
| **`.env.example`** | Environment Contract | Documents `GEMINI_API_KEY`, `APP_URL`, `PORT`, GitHub OAuth keys, and all security/capacity limits (body size, SVG budgets, rate limits, TTLs) without committing credentials. |
| **`verify_system.ts`** | Diagnostic Suite | Standalone test runner that queries all server endpoints with cooldown pacing to verify API integrity and quota status. |
| **`AGENTS.md`** | Agent Rules & Conventions | Persistent instructions enforcing continuous updates to `/docs/FILE_TREE.md` whenever new files are created or altered. |

---

### 2.2 Documentation Hub (`/docs`)

| File / Path | Purpose & Content |
| :--- | :--- |
| **`docs/FILE_TREE.md`** | Living directory tree map, module breakdown, file descriptions, and maintenance guidelines (this document). |
| **`docs/ARCHITECTURE_REPORT.md`** | Deep technical architecture report detailing the SVG DOM generation pipeline, Inkscape grouping specs, parametric math, and multi-tier UI layouts. |
| **`docs/APP_REPORT.md`** | Full functional capabilities breakdown, feature matrix, UX flows, and keyboard shortcut specifications. |
| **`VERIFICATION_REPORT.md`** | System health verification audit covering endpoints, test payloads, response schemas, and error mitigation strategies. |

---

### 2.3 Application Core & Entry (`/src`)

| File / Path | Purpose & Functionality |
| :--- | :--- |
| **`src/main.tsx`** | Initializes React 19 createRoot, attaches the root component to `#root`, and applies strict mode. |
| **`src/App.tsx`** | Master application coordinator. Manages top-level routing between views (`home`, `studio`, `animation`, `gallery`), handles generation flows, tracks current artwork, and hosts global toasts (`Toaster`). |
| **`src/index.css`** | Global stylesheet defining Tailwind CSS imports, custom scrollbar styling, grid background patterns, and monospace typography utility classes. |
| **`src/types.ts`** | Central TypeScript definitions including `VectorArtwork`, `SvgLayer`, `ColorPalette`, `ParametricSettings`, `KineticAnimation`, `StudioLayout`, and export options. |

---

### 2.4 UI Components (`/src/components`)

| Component | Responsibility |
| :--- | :--- |
| **`UnifiedStudio.tsx`** | Central workstation integrating the interactive artboard, layer hierarchy, parametric drawer, code view, animation preview, and refinement bar. Owns the canonical `VectorDocument` + command history; all views derive from it (Phase 1). |
| **`StudioCanvas.tsx`** | Vector canvas viewport with transform matrix pan and zoom, mouse-wheel zoom, coordinate crosshair readout, aspect ratio framing, and switchable Cartesian / Polar / Isometric drafting grids. |
| **`CommandPalette.tsx`** | Global spotlight command palette (Cmd/Ctrl+K) for workspace navigation, quick prompt synthesis, direct SVG/PNG export, and shortcut reference. |
| **`KeyboardShortcutsModal.tsx`** | Visual modal displaying keybindings for navigation (Ctrl+1/2/3), generation (Ctrl+N), export (Ctrl+Shift+S/P), and editing tools. |
| **`LayerPanel.tsx`** | Tree-like AST layer viewer. Supports recursive sub-group inspection, layer visibility toggling, locking, solo/isolate mode, drag reordering, inline renaming, and CSS blend-mode selection. |
| **`ParametricPanel.tsx`** | Real-time parametric tuning controls for stroke width multipliers, procedural SVG filter grain synthesis, and neon specular glow sliders. |
| **`PaletteManager.tsx`** | Palette extraction, color harmonic remapping, swatch inspector, and live SVG fill/stroke replacement across preset themes. |
| **`CodeEditor.tsx`** | In-browser SVG XML code editor with syntax formatting, node counter, error detection, and bidirectional document synchronization (semantic change detection + echo suppression). |
| **`DesignSpecPanel.tsx`** | Engineering metrics HUD displaying viewBox parameters, total elements, path count, memory footprint, and gradient definitions. |
| **`KeyframeTimeline.tsx`** | Kinetic animation timeline featuring a playhead scrubber, time markers, playback speed multipliers (0.5x to 2x), and loop controls. |
| **`AnimationStudio.tsx`** | Dedicated motion graphics view for designing, testing, and previewing CSS/SMIL kinetic animations on SVG paths. |
| **`AnimationSyncManager.tsx`** | Real-time synchronization layer ensuring playhead position and timeline scrub events correlate with active SVG element transformations. |
| **`AIGeneratorModal.tsx`** | Creation modal offering custom text prompts, aesthetic style presets (Bauhaus, Sci-Fi HUD, Cyberpunk, etc.), complexity tiers, and sample blueprints. |
| **`ImportModal.tsx`** | Multimodal import dialog accepting raster image uploads (`.png`, `.jpg`, `.webp`) for vectorization, alongside text briefs and design specs. |
| **`ExportModal.tsx`** | Export pipeline supporting raw `.svg` files, typed React `.tsx` components, standalone CSS Data URIs, and high-res raster `.png` exports. |
| **`HomeView.tsx`** | Welcoming portal with hero showcase, instant prompt synthesizer, curated sample artboards, and feature navigation. |
| **`HistoryView.tsx`** | Session design history, artwork duplication, thumbnail preview grid, and localStorage persistence manager. |
| **`MasterpieceGallery.tsx`** | Curated catalog of pre-engineered vector artworks with one-click loading into the active studio session. |
| **`Navbar.tsx`** | Top header navigation featuring view switching, workspace layout presets (`full`, `minimalist`, `canvas-focus`), undo/redo buttons, and quick actions. |
| **`RefinePromptBar.tsx`** | Floating contextual prompt bar at the studio base for conversational iterative AI refinement of the active graphic. |
| **`GenerationLoader.tsx`** | Animated synthesis overlay with procedural vector wireframe visuals and step-by-step progress telemetry. |
| **`IntroLoader.tsx`** | Initial platform initialization sequence with hardware and canvas capability telemetry. |
| **`AnimatedIntro.tsx`** | Kinetic visual introduction with cybernetic typography and particle accents. |
| **`PluginGallery.tsx`** | Marketplace of modular vector filters, parametric algorithms, and design extensions. |
| **`ReusableComponentShowcase.tsx`**| Visual gallery of reusable vector elements (telemetry gauges, circular HUD meters, tech borders, status pills). |
| **`MainLayout.tsx`** | Responsive structural wrapper orchestrating drawer positioning, sidebar collapse states, and viewport containment. |

---

### 2.4b Canonical Document Engine (`/src/document`) — Phase 1

The authoritative editing model. SVG strings are inputs/outputs here, never the editing state.

| File / Path | Role & Responsibility |
| :--- | :--- |
| **`src/document/types.ts`** | Defines `VectorDocument`, `PageNode`, and the `VectorNode` union (`ElementNode`/`TextNode`/`CommentNode`) with namespaced attribute preservation and the schema version constant. |
| **`src/document/tree.ts`** | Immutable tree operations (find/update/insert/remove/move) with structural path sharing; identity-preserving no-ops let the history manager skip empty transactions. |
| **`src/document/importer.ts`** | SVG → document adapter: stable uid assignment, uid reuse by element id across re-imports (AI refinement, code edits), insignificant-whitespace policy, `svgSemanticallyEqual` cosmetic-change detection. |
| **`src/document/exporter.ts`** | Document → canonical, pretty-printed SVG serialization with namespace-correct attributes and verbatim text content. |
| **`src/document/commands.ts`** | The command set: `SetNodeAttr`, `SetNodeText`, `AddNode`, `RemoveNode`, `ReorderNode`, `ReplaceDocument`, `ApplyPalette`, plus factories for rename/blend/new-layer — each captures its precise inverse during apply. |
| **`src/document/history.ts`** | Transactional undo/redo manager: one apply = one undo step, no-op skipping, coalescing of rapid source edits into a single entry. |
| **`src/document/selectors.ts`** | Derives `LayerSpec[]` (visibility, lock, blend, element counts) directly from document attributes. |
| **`src/document/migrations.ts`** | Ordered schema-version migration chain (v0→v1) with loud rejection of future versions. |
| **`src/document/persistence.ts`** | IndexedDB document store and debounced autosaver used by the studio for crash recovery. |
| **`src/document/__tests__/`** | 66 unit tests covering import/export round-trips (namespaces, SMIL, styles, comments), command apply/undo, history semantics, persistence, and migrations. |

### 2.5 Static Datasets & Palettes (`/src/data`)

| File / Path | Contents & Usage |
| :--- | :--- |
| **`src/data/masterpieces.ts`** | Pre-computed, production-ready vector graphics with complete SVG markup, parsed layer groups, color swatches, and metadata tags. |
| **`src/data/palettes.ts`** | Harmonic color definitions including Obsidian Terminal, Cyberpunk Neon, Bauhaus Primary, Solar Flare, Vaporwave Pastel, and Emerald Circuit. |
| **`src/data/reusableComponents.ts`**| Library of modular vector primitives (HUD crosshairs, circular dials, circuit nodes, telemetry cards) ready for instant canvas injection. |
| **`src/data/vectoraBasePalette.ts`** | Foundational grayscale ramps, neon highlight tokens, and theme-neutral contrast constants. |

---

### 2.6 Vector Math & Utilities (`/src/utils`)

| File / Path | Functionality |
| :--- | :--- |
| **`src/utils/svgParser.ts`** | Parses raw SVG strings into a clean DOM tree, extracts `<g>` groups and Inkscape layers, calculates path counts, identifies used color palettes, and validates viewBox coordinates. |
| **`src/utils/svgAnimator.ts`** | Master SVG animation coordinator. Delegates extended animations to the modular kinetic engine while maintaining legacy preset compatibility. |
| **`src/utils/gifRenderer.ts`** | Renders dynamic SVG animations frame-by-frame onto a hidden HTML5 canvas and compiles them into downloadable animated GIF binaries. |
| **`src/utils/spriteSheetRenderer.ts`** | Captures animated vector frames and stitches them into a horizontal/vertical sprite sheet image with JSON coordinate metadata. |
| **`src/utils/animations/index.ts`** | Complete 25-technique kinetic motion engine. Procedurally injects `<defs>`, dynamic masks, filters, keyframes, and timing properties into SVG nodes. |
| **`src/utils/animations/helpers/clipPathBuilder.ts`** | Builds procedural SVG `<clipPath>`, `<mask />`, linear wipe gradients, iris circles, diagonal gates, and matrix glitch filters. |
| **`src/utils/animations/helpers/keyframeGenerator.ts`** | Generates CSS `@keyframes` and class selectors for pen writing, typewriter, liquid morph, particle fountains, neon sweeps, and 3D kinetic turns. |
| **`src/utils/vectorization/index.ts`** | Unified raster-to-SVG vectorization facade and engine catalog. Translates pixel buffers into structured multi-layer vector artworks. |
| **`src/utils/vectorization/potraceTracer.ts`** | Medial axis skeletonization and Marching Squares boundary tracer with Douglas-Peucker bezier fitting. |
| **`src/utils/vectorization/colorQuantizer.ts`** | K-means color clustering and stratified luminosity grouping for layered posterization vector art. |
| **`src/utils/vectorization/delaunayMeshTracer.ts`** | Bowyer-Watson Delaunay triangulation engine for low-poly gradient vector geometry. |
| **`src/utils/vectorization/halftoneDotTracer.ts`** | Pop-art variable radius circle grid modulated by pixel darkness. |
| **`src/utils/vectorization/voronoiStippler.ts`** | Centroidal Voronoi / Lloyd relaxation ink stipple dot generator. |
| **`src/utils/vectorization/contourIsolineTracer.ts`** | Marching Squares topographic elevation isoline generator. |
| **`src/utils/vectorization/crossHatchTracer.ts`** | Multi-angle intaglio engraving and cross-hatch line vector engine. |
| **`src/utils/vectorization/tspArtTracer.ts`** | Traveling Salesperson single-unbroken-stroke continuous line art tracer. |
| **`src/utils/vectorization/cannyLineTracer.ts`** | Canny gradient edge detector and architectural blueprint tracer. |
| **`src/utils/vectorization/voxel3dTracer.ts`** | 2.5D isometric shaded block and voxel vector projection. |
| **`src/utils/vectorization/asciiMatrixTracer.ts`** | Monospace ASCII matrix vector typography generator. |
| **`src/utils/vectorization/types.ts`** | Type definitions for vectorization options, trace algorithms, and layer metadata. |

---

## 3. Maintenance & Continuous Upgrade Policy

To guarantee that this document remains a single source of truth across development cycles:

1. **Mandatory Sync**: Whenever a file or directory is added, renamed, moved, or deleted, `/docs/FILE_TREE.md` must be updated immediately in the same turn.
2. **Consistent Categorization**: New files must be logged in both the **ASCII Tree** (Section 1) and the corresponding **Module Breakdown** table (Section 2).
3. **Persistent Convention**: This rule is persisted in `/AGENTS.md` to ensure seamless continuation across all future AI and developer interactions.
