# VECTORA — Repository Audit & Stabilization Report

> **Date:** 2026-09-21 (updated same day after Phase 1)
> **Scope:** Full repository audit (Phase 0 of the elevation program), followed by implementation of the truth-and-stabilization fixes, then the Phase 1 canonical document engine (§4.1).
> **Method:** Every finding below was verified against the actual source before being recorded. Nothing is claimed from component or button presence alone.

---

## 1. Executive summary

VECTORA Studio is a browser-based, AI-driven SVG generation environment with a genuinely distinctive angle: semantic, layered, animation-ready SVG output rather than flattened raster images. The generation pipeline, vectorization algorithms, animation tooling, and export surface are broad.

The core problem is **depth, consistency, and correctness of the editing core** — not feature count. Before this pass:

- The editing model was "SVG string as state" with parallel React state that frequently disagreed with the document (§3).
- Layer operations (visibility, lock, rename, reorder, add, blend) mutated React state but **not the SVG document**, so exports and reloads silently lost user intent. One of these operations (`addNewSvgLayer`) was outright broken; another (reorder) had a type/behavior mismatch that corrupted the layer array.
- No SVG sanitization existed anywhere between untrusted markup (AI output, imports, saved history) and `dangerouslySetInnerHTML` (6 render sites).
- The GitHub OAuth flow generated a CSRF `state` but never validated it, handed the full-privilege access token to the browser (stored in `localStorage`), and accepted arbitrary tokens from any client on the sync endpoint.
- There was no test suite, no CI, no runtime schema enforcement on AI responses, no rate limiting, and a hard-coded port.
- Documentation claimed "Production Ready" for capabilities that were partially wired or UI-only.

This pass implements **Phase 0 (truth and stabilization)**: security hardening, layer-state correctness, runtime contracts, tests, CI, and documentation honesty. Phases 1+ (canonical scene graph, selection/transform kernel, command-based editing) remain open and are the recommended next work — see §6.

---

## 2. Verified architecture map

```text
Browser (React 19 SPA, Vite, Tailwind 4)
├── src/App.tsx                      — top-level routing/state, artwork flow
├── src/components/
│   ├── UnifiedStudio.tsx            — main studio shell (panels, history, GitHub sync)
│   ├── StudioCanvas.tsx             — SVG artboard, pan/zoom, layer visibility applied at render
│   ├── LayerPanel.tsx               — layer tree UI (visibility/lock/rename/reorder/blend)
│   ├── CodeEditor.tsx               — raw SVG text editing
│   ├── AnimationStudio.tsx          — SMIL/CSS animation application + GIF/sprite export
│   ├── ImportModal.tsx              — multimodal import → /api/import-vectorize
│   ├── ExportModal.tsx              — PNG/sprite/React/CSS exports
│   └── ... (gallery, palettes, plugins, specs panels)
├── src/utils/svgParser.ts           — DOM-based layer utilities, metrics, color remap, React export
├── src/utils/vectorization/*        — 14 client-side tracing/vectorization algorithms
├── src/utils/animations/*, svgAnimator.ts, gifRenderer.ts, spriteSheetRenderer.ts
└── src/data/*                       — masterpieces, palettes, reusable component showcase

Server (Express, single file: server.ts)
├── Model registry + orchestrator    — hard-coded Gemini model tiers, retry/fallback, JSON recovery
├── VECTORA_SYSTEM_PROMPT            — doctrine + JSON response schema (prompt-level only)
├── Routes: /api/generate-svg, /api/refine-svg, /api/animate-svg,
│           /api/import-vectorize, /api/generate-unified,
│           /api/auth/github/*, /api/github/sync, /api/health, /api/diagnostics/models
├── GitHub OAuth + sync              — commit SVG files to a user repo
└── Static serving / Vite dev middleware

server/ (new in this pass)
├── config.ts                        — env-driven configuration (port, limits, rate budgets, TTLs)
├── security/rateLimit.ts            — sliding-window per-IP limiter, scoped buckets
├── security/oauthState.ts           — single-use, TTL-bounded CSRF state store
├── security/sessions.ts             — server-side GitHub sessions + HTTP-only cookies
├── security/svgGuard.ts             — deny-list SVG screening + complexity budgets (server side)
└── ai/contracts.ts                  — runtime validation of AI JSON responses
```

**State model (as found):** `UnifiedStudio` holds `layers` (React state) and a local undo stack of SVG strings; `App` owns the `VectorArtwork` (including `svg`). The SVG string is the de-facto document; layers/visibility/lock exist in parallel React state. This is the root architectural weakness — the Phase 1 target is a canonical scene graph.

---

## 3. Findings (verified, with severity)

Severity: 🔴 critical · 🟠 high · 🟡 medium · 🔵 low

### Security

| # | Severity | Finding | Location (before fix) | Status |
|---|---|---|---|---|
| S1 | 🔴 | OAuth `state` generated but never validated on callback → CSRF / confused deputy | `server.ts` `/api/auth/github/callback` | ✅ Fixed: single-use TTL-bounded state store + 403 on mismatch |
| S2 | 🔴 | GitHub token stored in `localStorage.github_token` → any XSS steals a full `repo`-scope token | `src/components/UnifiedStudio.tsx:44,259` | ✅ Fixed: token lives in server-side session; browser holds only an HTTP-only cookie |
| S3 | 🔴 | `/api/github/sync` accepts arbitrary client-provided tokens → confused deputy / token laundering | `server.ts` `/api/github/sync` | ✅ Fixed: session-authenticated; client tokens ignored; origin check |
| S4 | 🔴 | Six `dangerouslySetInnerHTML` sites render untrusted SVG (AI output, imports, history, showcase) with zero sanitization | `StudioCanvas.tsx`, `AnimationStudio.tsx`, `ExportModal.tsx`, `HistoryView.tsx`, `MasterpieceGallery.tsx`, `ReusableComponentShowcase.tsx` | ✅ Fixed: DOM-based allowlist/deny-list sanitizer + `SafeSvg` component at every site |
| S5 | 🟠 | No rate limiting on any endpoint; AI endpoints are paid and abuse-prone; `express.json` accepted 50 MB bodies | `server.ts:11-13` | ✅ Fixed: scoped sliding-window limits (ai/github/light), body limit 10 MB (configurable) |
| S6 | 🟠 | AI responses passed through after bare `JSON.parse` — no schema, bounds, or safety validation of model output | all 6 AI route handlers | ✅ Fixed: `validateModelPayload` chokepoint (contract + SVG guard + strip) |
| S7 | 🟠 | Direct SVG import (`type: "svg"`) returned raw file content unscreened | `/api/import-vectorize` | ✅ Fixed: screened + stripped before entering the studio |
| S8 | 🟡 | Imported documents/images are interpolated into AI prompts without untrusted-content separation | route prompt builders | ⚠️ Open (Phase 0.5): needs structured prompt framing + explicit data/instruction separation |

### Correctness

| # | Severity | Finding | Location (before fix) | Status |
|---|---|---|---|---|
| C1 | 🔴 | Layer visibility/lock/rename/blend/add mutated React state only — never the SVG document → exports, reloads, and code view disagree with the canvas | `UnifiedStudio.tsx` `handleToggleLayer` et al. (svgParser had the persistence functions but they were never called) | ✅ Fixed: every layer op now mutates the SVG through the undoable history path |
| C2 | 🔴 | `LayerPanel` calls `onReorderLayer(node.name, 'up')` while `UnifiedStudio` treated args as numeric indexes (`splice(from, 1)`) → array corruption | `LayerPanel.tsx:265,273` ↔ `UnifiedStudio.tsx:491` | ✅ Fixed: name+direction handler; array semantics aligned with `reorderSvgLayer` (back-to-front order) |
| C3 | 🟠 | `addNewSvgLayer` threw `InvalidStateError` (namespaced attribute set via `setAttribute`) and was silently swallowed → "Add layer" never worked | `src/utils/svgParser.ts` | ✅ Fixed: `setAttributeNS` helper for all Inkscape attributes |
| C4 | 🟠 | Palette application round-tripped through the AI (nondeterministic, network-dependent) despite a local deterministic remapper existing | `UnifiedStudio.handleApplyPalette` | ✅ Fixed: local `remapSvgColors` + undo history |
| C5 | 🟡 | Undo/redo history is local to `UnifiedStudio`, resets on artwork id change, and (before C1) didn't include layer ops | `UnifiedStudio.tsx` | ✅ Layer ops now recorded; broader transaction model remains Phase 1 |
| C6 | 🟡 | Rate limiter buckets (as introduced) would have been shared across endpoint groups — caught and fixed during this pass with a regression test | `server/security/rateLimit.ts` | ✅ Fixed: scoped keys |

### Engineering

| # | Severity | Finding | Location | Status |
|---|---|---|---|---|
| E1 | 🟠 | No test suite of any kind (`verify_system.ts` is an external smoke script requiring a live key) | repo root | ✅ Fixed: 81 unit/integration tests (vitest), incl. security, sanitizer, layer persistence, live-server API tests |
| E2 | 🟠 | No CI | — | ✅ Fixed: GitHub Actions workflow (typecheck, tests, build) |
| E3 | 🟠 | `server.ts` is a 56 KB monolith (models, orchestration, prompts, routes, OAuth, static serving) | `server.ts` | ◐ Partial: security/AI-contract/config extracted into `server/`; full route/registry split is planned Phase 1 |
| E4 | 🟡 | `const PORT = 3000` hard-coded despite env expectations | `server.ts:11` | ✅ Fixed: `process.env.PORT` (fallback 3000) |
| E5 | 🟡 | Package named `react-example`; docs say "React 18+" while `package.json` uses React 19 | `package.json`, `docs/*.md` | ✅ Fixed: package `vectora@2.6.0`; docs corrected |
| E6 | 🟡 | Docs describe the product as "v2.6.0 Production Ready" for partially-wired capabilities | `docs/APP_REPORT.md`, `docs/ARCHITECTURE_REPORT.md` | ✅ Fixed: status banners + feature-status matrix (this document, §5) |
| E7 | 🔵 | Model registry hard-coded; availability drift risk | `server.ts` model profiles | ⚠️ Open (Phase 2): configurable registry + health checks |

### Product gaps confirmed (not fixed in Phase 0 — by design)

These match the strategic assessment: no selection model, no direct geometry manipulation (pen/node tools), no boolean geometry, no snapping/measurement, no typography system, no canonical scene graph or command/transaction model, GIF as primary animation target, string-based SVG processing as a performance ceiling, and no import/export compatibility matrix. These define Phases 1–7 of the roadmap (§6).

---

## 4. What changed in this pass (Phase 0)

**Server**
- `server/config.ts` — all tunables env-driven (`PORT`, body limit, SVG byte/element budgets, rate budgets, TTLs); documented in `.env.example`.
- `server/security/rateLimit.ts` — sliding-window per-IP limiter with **scoped** buckets; `429` + `Retry-After`; regression test for scope isolation.
- `server/security/oauthState.ts` — single-use, TTL-bounded OAuth state store; callback rejects missing/forged/expired/replayed states with 403.
- `server/security/sessions.ts` — server-side GitHub sessions; token never leaves the server; HTTP-only `SameSite=Lax` cookie (`Secure` in production); `/api/auth/github/status` + `/logout`; origin check on cookie-authenticated routes.
- `server/security/svgGuard.ts` — deny-list screening (script/event-handler/`javascript:`/`foreignObject`/external entity…) + complexity budgets (2 MB / 20k elements default).
- `server/ai/contracts.ts` — runtime validation of every AI response: required fields, types, string caps, numeric clamps (opacity, element counts), blend-mode allowlist, palette hex validation, SVG safety/complexity gate; unknown fields dropped.
- `server.ts` — imports the above; all routes rate-limited; all 6 AI parse sites routed through `validateModelPayload`; direct SVG import screened; `PORT` from env; body limit 10 MB.

**Client**
- `src/utils/sanitizeSvg.ts` — DOM-based sanitizer: removes `script`/`foreignObject`/`iframe`/`embed`/`object`, all `on*` handlers, unsafe URLs (`javascript:`, `vbscript:`, `data:text/html`), scrubs `@import`/unsafe `url()` from `<style>` and style attributes, blocks external `url(...)` paint references, neutralizes SMIL animations that target `href`/`on*` attributes; preserves Inkscape metadata and legit SMIL animation.
- `src/components/SafeSvg.tsx` — the only sanctioned path for inline SVG rendering; wired into all six former `dangerouslySetInnerHTML` sites.
- `UnifiedStudio.tsx` — layer ops (toggle/lock/rename/solo/show-all/reorder/add/blend) now persist into the SVG document and are undoable; reorder signature bug fixed with correct back-to-front semantics; palette application is local + deterministic; GitHub flow uses server sessions (no token in the browser, origin-checked `postMessage`, 401-aware reconnect, shift-click disconnect).
- `src/utils/svgParser.ts` — namespaced-attribute fix (`setAttributeNS`) that un-breaks `addNewSvgLayer`/`standardizeSvgLayers`; slug normalization.

**Tooling**
- `vitest.config.ts`, 8 test files, 81 tests: sanitizer XSS vector suite, layer-persistence regressions, rate limiter (incl. scope-isolation regression), OAuth state, sessions/cookies/origin, SVG guard, AI contracts, and a live-server integration suite (health, 503 offline gate, 401 session enforcement, forged-token rejection, 403 state validation + replay, 429 rate limiting).
- `.github/workflows/ci.yml` — typecheck + tests + build on push/PR.
- `package.json` — `vectora@2.6.0`; `test` / `test:watch` scripts.

---

## 4.1 Phase 1 — Canonical document engine (implemented)

**Objective achieved: SVG is no longer the primary editing state.** The studio now edits a typed, immutable `VectorDocument`; SVG is an import/export format produced by adapters.

### Architecture (`src/document/`)

| Module | Responsibility |
|---|---|
| `types.ts` | `VectorDocument`, `PageNode`, `ElementNode`/`TextNode`/`CommentNode`, schema version |
| `ids.ts` | Stable node uid generation (element ids stay in `attrs` — they are reference targets, not identity) |
| `tree.ts` | Immutable tree ops with path copying; no-op mutations return the SAME instance (identity check drives history) |
| `importer.ts` | SVG → document adapter; preserves namespaces, comments, `<style>`/text content; skips insignificant inter-element whitespace; uid reuse by element id across re-imports; `svgSemanticallyEqual` for cosmetic-change detection |
| `exporter.ts` | Document → canonical pretty-printed SVG (namespaced attrs via `setAttributeNS`, verbatim text in `<text>`/`<style>`) |
| `commands.ts` | `SetNodeAttr`, `SetNodeText`, `AddNode`, `RemoveNode`, `ReorderNode`, `ReplaceDocument`, `ApplyPalette` + factories (rename, blend mode, new layer) — each captures its precise inverse on apply |
| `history.ts` | Transactional undo/redo: one `apply(commands, {label})` = one undo step; no-ops skipped; consecutive source edits coalesce (one undo per typing burst) |
| `migrations.ts` | Ordered schema-version chain (v0→v1 registered; future versions rejected loudly) |
| `persistence.ts` | IndexedDB store + debounced autosaver; loads pass through migrations |
| `selectors.ts` | Document → `LayerSpec[]` derivation (visibility/lock/blend read from document attrs, not SVG re-parsing) |

### Integration (`UnifiedStudio`, `CodeEditor`)

- `UnifiedStudio` holds the `HistoryManager` + document as the single source of truth; `layers` and the exported SVG are **derived views**. The canvas, layer panel, palette manager, code editor, exporters, GitHub sync, and share all read the same document (directly or via its serialization).
- Every layer operation (visibility, lock, rename, solo, show-all, reorder, add, blend) and palette application is now a **command transaction** — undoable, with precise inverse (not string snapshots).
- Code editor and animation studio changes import into the document (uid-preserving) as a single `ReplaceDocumentCommand`; **cosmetic-only edits are detected semantically and skipped** (they no longer dirty the document or history); typing bursts coalesce into one undo step. The code editor suppresses echo-sync so the canonical serialization never clobbers the user's mid-typing text.
- AI refinement likewise imports into the document and applies as one undoable command; model-reported layer lists are no longer trusted (layers are document-derived).
- **IndexedDB autosave** on every mutation (800 ms debounce, flush on unmount) with a restore offer on reopen (crash recovery).
- Undo/redo now works on commands across ALL mutation sources (previously code/animation edits bypassed history entirely).

### Exit criteria status

| Criterion | Status |
|---|---|
| Canvas, code editor, layer panel, and export all read from the same document | ✅ all views derived from `VectorDocument` |
| Layer rename, reorder, visibility, and lock operations persist | ✅ command-mutated attrs, autosaved to IndexedDB |
| Every mutation is undoable | ✅ transactions incl. code edits, animation bakes, AI refinements, palette |
| SVG export is generated from the canonical document | ✅ `documentToSvg` drives export/share/sync |

**Verification:** 66 new unit tests (importer/exporter round-trips incl. namespaces & SMIL, tree immutability, command apply/undo for every command, history transactions/coalescing/redo, IndexedDB persistence + autosaver + migrations, layer selectors) + a smoke pass over all six bundled masterpieces (import → export → re-import → undo stability). Suite total: **147 tests green**.

**Known limitations (Phase 1):** history entries are not persisted (only document state); the LayerPanel still addresses layers by name at the callback boundary (uids resolved internally); nested-group layer ops are not yet exposed; multi-page documents are representable but the UI edits page 0.

---

## 5. Feature status matrix (honest labels)

Legend: **Implemented** (works end-to-end, tested where feasible) · **Partial** (works with meaningful caveats) · **UI prototype** (surface exists, underlying behavior missing/incomplete) · **Experimental** (works but not production-safe)

| Capability | Status | Notes |
|---|---|---|
| AI SVG generation (text→SVG) | Partial | Requires `GEMINI_API_KEY`; output now contract-validated + sanitized; nondeterministic by nature |
| AI refinement / animation / vectorization | Partial | Same contract/sanitization path; model-availability dependent |
| Direct SVG import | Partial | Screened + stripped; fidelity vs. Inkscape/Illustrator files unverified (no compatibility matrix yet) |
| Layer panel (view, visibility, lock, rename, reorder, blend, add) | Implemented | Command-mutated on the canonical document, undoable, autosaved; nested hierarchy is display-only |
| Canvas pan/zoom/grid/grain/glow | Implemented | Viewport transforms only — not object transforms |
| Code editor ↔ canvas sync | Implemented | Bidirectional through the canonical document; semantic change detection (cosmetic edits skipped); echo suppression |
| Undo/redo | Implemented | Command-based transactions with precise inverses across all mutation sources; typing coalescing; not yet persisted across sessions |
| Local palette application | Implemented | Deterministic remap (this pass); was previously an AI round-trip |
| Animation studio (SMIL/CSS keyframes, GIF, sprite sheets) | Experimental | No interpolation compatibility validation; GIF is a weak primary target |
| Client-side vectorization algorithms | Experimental | Artistic transformations, not faithful tracing; no fidelity scoring |
| Exports (SVG/PPNG/React/CSS/sprite) | Partial | Browser-canvas raster limits at high scale; no headless export |
| GitHub sync | Implemented | Server-side session, CSRF-protected OAuth, rate-limited (this pass) |
| React component export | Partial | Generates presentational components; untested against real projects |
| Selection / direct manipulation / boolean ops / typography / snapping | **Not implemented** | The Phase 2 editing kernel |
| Multi-user collaboration / comments / versioning | **Not implemented** | Phase 6 |
| Offline/local editing mode | Partial | Documents autosave to IndexedDB with crash-recovery restore (Phase 1); AI-free editing still limited to layer/color/code operations until Phase 2 |

---

## 6. Recommended next phases

1. ~~**Phase 1 — Canonical document engine**~~ ✅ **implemented** (see §4.1): typed scene graph with stable node IDs; SVG import/export adapters; command-based mutations with transactional undo/redo; IndexedDB persistence + crash recovery.
2. **Phase 2 — Editing kernel (next):** selection + hit testing, transforms, shape/pen/node tools, snapping, alignment. Exit: a user can build an icon from primitives without AI or the code editor.
3. **Phase 3 — AI as a safe editing agent:** validated operation plans (set-property/translate/create-shape…) against node IDs, with preview/accept/reject — AI stops replacing whole documents.
4. **Phase 4 — Evaluation harness:** benchmark corpus, visual diffing, SVG validity/accessibility scoring, determinism controls.
5. **Phase 5+ — Workers, components/tokens, collaboration, headless export.**

See the elevation program brief for the full target architecture (`packages/` layout: `document-model`, `editor-core`, `svg-engine`, `renderer`, `ai-engine`, `collaboration`, `app`, `server`).

---

## 7. Known limitations after this pass

- Sessions, OAuth states, and rate-limit counters are **in-memory** — correct for single-instance deployments, insufficient for horizontal scaling (swap for Redis/DB).
- The server-side SVG guard is a deny-list screen, not a parser-based sanitizer; the browser-side DOM sanitizer is the authoritative render gate (defense in depth by design).
- The server split is partial (security/contracts/config extracted); route and model-registry decomposition is deferred to avoid an untested big-bang refactor.
- Prompt-injection hardening for imported document content (S8) is scoped but not yet implemented.
- Client bundle is 860 KB minified (243 KB gzip); code-splitting recommended.
