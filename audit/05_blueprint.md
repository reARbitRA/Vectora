# VECTORA SVG Studio — Technical Blueprint & Architecture (v2.6.0)

## 1. System Overview
VECTORA SVG Studio is an end-to-end vector design and synthesis workstation that pairs high-fidelity client-side vector manipulation with multi-tier generative vector intelligence.

```
Client (Browser)                                    Server (Node.js 22 / Express)
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│ React 19 UI & Studio Shell      │                 │ Security Perimeter              │
│ ├─ UnifiedStudio / Canvas       │                 │ ├─ Sliding Window RateLimiter   │
│ ├─ LayerPanel (AST Sync)        │                 │ ├─ SessionStore (HTTP-only)     │
│ └─ AnimationStudio (Keyframes)  │                 │ ├─ OAuthStateStore (Single-use) │
│                                 │                 │ └─ SvgGuard (DoS / AST Budgets) │
│ Canonical Document Engine       │                 │                                 │
│ ├─ Immutable Tree & Commands    │                 │ Model Orchestrator              │
│ ├─ Undo/Redo History Stack      │◄─── HTTP API ──►│ ├─ Tier 1: gemini-3.8-flash     │
│ ├─ Dexie / IndexedDB Autosave   │                 │ ├─ Tier 2: gemini-3.1-flash-lite│
│ └─ Multi-Format Serializers     │                 │ ├─ Tier 3: gemini-2.5-flash     │
│                                 │                 │ └─ Tier 4: gemini-flash-latest  │
│ Algorithmic Vectorization Core  │                 │                                 │
│ └─ 17 Pure TypeScript Tracers   │                 │ AI Runtime Validation           │
│    (Potrace, Delaunay, Voronoi, │                 │ └─ contracts.ts runtime schema  │
│     Contour, Centerline, etc.)  │                 └─────────────────────────────────┘
└─────────────────────────────────┘
```

## 2. Key Modules & Boundaries

### 2.1 Canonical Document Engine (`src/document/*`)
- **`tree.ts`**: Pure AST nodes representing SVG `<svg>`, `<g>`, `<path>`, `<rect>`, `<circle>`, `<polygon>`, etc.
- **`commands.ts`**: Undoable commands modifying AST nodes with structural integrity.
- **`history.ts`**: Bounded command history supporting branch navigation and non-destructive rollbacks.
- **`persistence.ts`**: Automatic background persistence into IndexedDB with automatic local storage fallback.
- **`importer.ts` / `exporter.ts`**: Lossless translation between DOM SVG markup and canonical AST representation.

### 2.2 Algorithmic Vectorization Pipeline (`src/utils/vectorization/*`)
- 17 distinct client-side vectorization engines executing without external dependencies:
  - `potraceTracer`: High-fidelity silhouette and threshold tracing
  - `centerlineTracer`: Medial axis centerline extraction for line art
  - `cannyLineTracer`: Edge-detected contour line extraction
  - `delaunayTriangulator`: Low-poly geometric triangulation
  - `voronoiStippler`: Lloyd-relaxed Voronoi point stippling
  - `colorQuantizer`: Octree & k-means perceptual color reduction
  - `halftoneDither`: Cyan/Magenta/Yellow/Black raster halftone simulation
  - `isometricVoxelTracer`: 2.5D isometric extrusion tracer
  - `tspArtTracer`: Traveling salesperson continuous pen-plotter line art
  - `crossHatchTracer`: Classical etching and hatching generator
  - `regionTracer`: Connected-component region segmentation
  - `contourExtractor`: Marching squares border detection
  - `fourierApproximator`, `sobelGradientTracer`, `slicSuperpixels`, `neuralVectorizerBase`, `diffvgOptimizer`
- **Decoupled Engine**: Lazily resolved catalog preventing initialization deadlocks and circular dependencies.

### 2.3 Server-Side Model Orchestrator (`server.ts`, `server/`)
- Four-tier fallback pool guaranteeing continuous service uptime even during upstream model degradation.
- Strict JSON envelope sanitization and regex-based SVG extraction recovery.
- Runtime response validation (`server/ai/contracts.ts`) confirming output matches design specifications.
- Hardened OAuth token handling utilizing server-side memory sessions and secure HTTP-only cookies.
