#!/usr/bin/env node
/**
 * VECTORA README asset generator.
 *
 * Single source of truth for every SVG under assets/readme/.
 * Regenerating is deterministic — same input, same bytes:
 *
 *   node scripts/generate-readme-assets.mjs
 *
 * Every asset is a hand-composed diagram in the VECTORA product language
 * (Carbon #080A0D · Vector Cyan #19D3C5 · Signal Violet #8B6BFF · Ink #F4F1EB).
 * Builders enforce layout invariants at generation time: text runs are
 * width-checked against a conservative monospace metric and every box is
 * bounds-checked against its canvas, so a broken asset cannot be emitted.
 */

import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { hero, statusBar, sceneGraph, documentEngine, commandHistory } from './readme-assets/assets-core.mjs';
import {
  vectorizationMatrix, rasterPipeline, aiPipeline, securityGate,
  exportRail, verificationConsole, deployment, footer,
} from './readme-assets/assets-flow.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'assets', 'readme');

const BUILDERS = [
  hero, statusBar, sceneGraph, documentEngine, commandHistory,
  vectorizationMatrix, rasterPipeline, aiPipeline, securityGate,
  exportRail, verificationConsole, deployment, footer,
];

const EXPECTED = new Set(BUILDERS.map((b) => b().name));

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const written = [];
  for (const build of BUILDERS) {
    const { name, svg } = build();
    if (!svg.startsWith('<svg') || !svg.trimEnd().endsWith('</svg>')) {
      throw new Error(`${name}: emitted document is not a complete <svg> element`);
    }
    const path = join(OUT_DIR, name);
    writeFileSync(path, svg, 'utf8');
    written.push({ name, bytes: Buffer.byteLength(svg, 'utf8') });
  }

  // Guard against orphaned assets left from earlier generations.
  for (const entry of readdirSync(OUT_DIR)) {
    if (!EXPECTED.has(entry)) {
      throw new Error(`assets/readme/${entry} is not produced by any builder — remove it or register a builder`);
    }
  }

  const total = written.reduce((a, w) => a + w.bytes, 0);
  console.log(`VECTORA README assets — ${written.length} generated in assets/readme/`);
  for (const w of written) console.log(`  ${w.name.padEnd(26)} ${(w.bytes / 1024).toFixed(1)} KB`);
  console.log(`  ${'total'.padEnd(26)} ${(total / 1024).toFixed(1)} KB`);
}

main();
