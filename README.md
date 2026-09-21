# VECTORA Studio

**Generative SVG design studio and semantic vector engineering environment** for hand-crafted and AI-driven vector art. Unlike raster image generators, VECTORA synthesizes pure, layered, resolution-independent SVG.

> 📋 **Status: actively stabilizing — not production-ready.**
> For the verified state of every capability, read [`docs/AUDIT.md`](docs/AUDIT.md).
> It contains the honest feature-status matrix, the security/correctness audit, and the roadmap.

## What it does

- **AI vector synthesis** — text, image, and document prompts → layered, semantic SVG (Gemini via `@google/genai`)
- **Studio canvas** — pan/zoom artboard, layer panel (visibility / lock / rename / reorder / blend — command-based and undoable), bidirectional code editor, palettes, animation studio, plugin gallery
- **Canonical document engine** — edits target a typed, immutable scene graph (`src/document/`) with stable node ids, transactional command history (undo/redo across every mutation source), and IndexedDB autosave with crash recovery; SVG is an import/export format, not the editing state
- **14 client-side vectorization engines** — centerline tracing, color quantization, Delaunay, Voronoi stippling, halftone, Canny blueprints, and more (experimental, artistic rather than faithful tracing)
- **Animation** — SMIL/CSS keyframe injection, GIF and sprite-sheet export (experimental)
- **Exports** — SVG, PNG (browser-canvas raster), React component, CSS data URI, sprite sheets
- **GitHub sync** — commit designs to a repo via a hardened OAuth flow (server-side sessions; the token never touches the browser)

## Quick start

```bash
npm install
cp .env.example .env       # add GEMINI_API_KEY (required for AI routes)
npm run dev                # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Express + Vite dev server |
| `npm run lint` | `tsc --noEmit` typecheck |
| `npm test` | Vitest unit + integration suite (147 tests) |
| `npm run build` | Client bundle + server bundle (`dist/`) |
| `npm start` | Run the built server (`PORT` env respected) |

## Security posture (Phase 0 hardening)

- **Every SVG is sanitized before inline rendering** (`src/utils/sanitizeSvg.ts` + the `SafeSvg` component — no raw `dangerouslySetInnerHTML` paths remain)
- **AI responses pass a runtime contract** (schema, bounds, SVG safety/complexity) before reaching clients
- **Rate limiting** on all API groups; payload and SVG complexity budgets
- **GitHub OAuth**: single-use CSRF `state`, server-side sessions, HTTP-only cookies, origin checks
- CI runs typecheck, the full test suite, and the build on every push/PR

See [`docs/AUDIT.md §7`](docs/AUDIT.md) for known limitations (in-memory session/rate stores, partial server split, prompt-injection hardening pending).

## Repository layout

See [`docs/FILE_TREE.md`](docs/FILE_TREE.md) for the complete living file map. Highlights:

```text
server.ts               Express entry: routes + AI orchestration
server/                 config, security (rate limit, OAuth state, sessions, SVG guard), AI contracts
src/document/           Canonical document engine: types, immutable tree, SVG adapters,
                        commands, transactional history, migrations, IndexedDB persistence
src/components/         Studio UI (UnifiedStudio, LayerPanel, StudioCanvas, CodeEditor, SafeSvg, …)
src/utils/sanitizeSvg.ts  Authoritative browser-side SVG sanitizer
src/utils/vectorization/ Client-side tracing engines
docs/AUDIT.md           Verified audit, feature status matrix, roadmap
```

## Roadmap

The editing core is the priority — not more presets:

1. ~~Canonical document engine~~ ✅ shipped (typed scene graph, stable node IDs, command-based undo/redo, IndexedDB persistence)
2. **Editing kernel** — selection, transforms, shape/pen/node tools, snapping, alignment
3. **AI as a safe editing agent** — validated operation plans instead of whole-document replacement
4. **Evaluation harness** — SVG validity, visual diffing, accessibility and determinism scoring

Full plan: [`docs/AUDIT.md §6`](docs/AUDIT.md).
