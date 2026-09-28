#!/usr/bin/env node
/**
 * VECTORA README asset verifier.
 *
 *   node scripts/verify-readme-assets.mjs
 *
 * Fails the build (exit 1) when any of these invariants break:
 *
 *   1. every image reference in README.md resolves to a real file on disk;
 *   2. every reference is a repo-relative path — external images are
 *      rejected outright (self-contained assets only, no badge farms);
 *   3. every SVG in assets/readme/ is referenced by README.md (no orphans);
 *   4. every SVG is well-formed XML with an intrinsic width/height/viewBox;
 *   5. every SVG is GitHub Camo-safe: no scripts, no event-handler
 *      attributes, no external URLs, no external font imports, no
 *      remote <image>/<use> references — it renders fully inside an
 *      <img> context;
 *   6. every internal #anchor link in README.md has a matching heading.
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const README = join(ROOT, 'README.md');
const ASSET_DIR = join(ROOT, 'assets', 'readme');

const failures = [];
const passes = [];
const ok = (msg) => passes.push(msg);
const bad = (msg) => failures.push(msg);

/* ───────────────────────── XML well-formedness ───────────────────────── */

const NAMED_ENTITIES = new Set(['amp', 'lt', 'gt', 'quot', 'apos', '#39']);

function assertWellFormedXml(source, label) {
  // Strip comments first so their contents are not parsed.
  const xml = source.replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  let i = 0;
  const len = xml.length;
  while (i < len) {
    if (xml[i] !== '<') {
      const next = xml.indexOf('<', i);
      const text = xml.slice(i, next === -1 ? len : next);
      for (const m of text.matchAll(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);?/g)) {
        const ent = m[1];
        const valid = NAMED_ENTITIES.has(ent) || /^#\d+$/.test(ent) || /^#x[0-9a-fA-F]+$/.test(ent);
        if (!valid) bad(`${label}: stray or unterminated entity "&${m[0].slice(1)}"`);
      }
      if (next === -1) break;
      i = next;
      continue;
    }
    if (xml.startsWith('<![CDATA[', i)) {
      const end = xml.indexOf(']]>', i);
      if (end === -1) return bad(`${label}: unterminated CDATA section`);
      i = end + 3;
      continue;
    }
    if (xml.startsWith('<?', i) || xml.startsWith('<!', i)) {
      // processing instruction / doctype — require a closing bracket
      const end = xml.indexOf('>', i);
      if (end === -1) return bad(`${label}: unterminated declaration`);
      i = end + 1;
      continue;
    }
    const end = xml.indexOf('>', i);
    if (end === -1) return bad(`${label}: unterminated tag at offset ${i}`);
    let raw = xml.slice(i + 1, end);
    i = end + 1;
    const isClose = raw.startsWith('/');
    const isSelfClose = raw.endsWith('/');
    if (isClose) raw = raw.slice(1);
    if (isSelfClose) raw = raw.slice(0, -1);
    const nameMatch = raw.match(/^([a-zA-Z_][\w.:-]*)/);
    if (!nameMatch) return bad(`${label}: malformed tag "<${raw.slice(0, 24)}…>"`);
    const name = nameMatch[1];
    const attrs = raw.slice(name.length);

    // attribute well-formedness: every attribute must be a quoted name="value" pair
    const attrRe = /([a-zA-Z_][\w.:-]*)\s*=\s*("([^"<]*)"|'([^']*)')|([^\s=/>]+)/g;
    for (const m of attrs.matchAll(attrRe)) {
      if (m[5]) return bad(`${label}: attribute "${m[5]}" in <${name}> has no quoted value`);
    }

    if (isClose) {
      const open = stack.pop();
      if (open !== name) return bad(`${label}: mismatched closing tag — expected </${open ?? 'EOF'}>, found </${name}>`);
    } else if (!isSelfClose) {
      stack.push(name);
    }
  }
  if (stack.length) bad(`${label}: unclosed elements ${stack.join(', ')}`);
}

/* ─────────────────────────── Camo-safety rules ─────────────────────────── */

const W3 = /^https?:\/\/www\.w3\.org\//i;

function assertCamoSafe(svg, label) {
  if (/<\s*script/.test(svg.toLowerCase())) bad(`${label}: contains a <script> element`);
  if (/<\s*image\b/i.test(svg)) bad(`${label}: contains an <image> element — raster embeds are not self-contained`);

  // Attributes are the only place SVG fetches resources from — scan values, not visible text.
  for (const m of svg.matchAll(/\s([a-zA-Z_][\w.:-]*)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    const name = m[1].toLowerCase();
    const value = (m[3] ?? m[4] ?? '').trim();
    if (/^on[a-z]+$/.test(name)) bad(`${label}: event-handler attribute "${m[1]}"`);
    if (/^(href|xlink:href|src|srcset)$/.test(name)) {
      if (/^(https?:)?\/\//i.test(value) && !W3.test(value)) {
        bad(`${label}: external reference ${m[1]}="${value.slice(0, 60)}" — assets must be self-contained`);
      }
      if (/^\s*data:(?!image\/)/i.test(value)) {
        bad(`${label}: non-image data URI in ${m[1]} is not needed for self-contained assets`);
      }
    }
  }

  // CSS inside <style> blocks may also pull remote resources.
  for (const m of svg.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = m[1];
    if (/@import|@font-face/i.test(css)) bad(`${label}: CSS font/import rule in <style> — external fonts are a render hazard`);
    for (const u of css.matchAll(/url\(\s*['"]?([^'")]+)/gi)) {
      const v = u[1].trim();
      if (/^(https?:)?\/\//i.test(v) && !W3.test(v)) {
        bad(`${label}: external CSS url("${v.slice(0, 60)}") — assets must be self-contained`);
      }
    }
  }
}

function assertSvgShape(svg, label) {
  if (!svg.startsWith('<svg')) bad(`${label}: file must start with an <svg> root element`);
  if (!svg.trimEnd().endsWith('</svg>')) bad(`${label}: file must end with </svg>`);
  if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(svg)) bad(`${label}: missing SVG namespace declaration`);
  const size = svg.match(/width="(\d+)" height="(\d+)" viewBox="0 0 \1 \2"/);
  if (!size) bad(`${label}: missing or inconsistent width/height/viewBox (needed for responsive GitHub scaling)`);
  if (!/<title id="/.test(svg)) bad(`${label}: missing accessible <title>`);
  const bytes = Buffer.byteLength(svg, 'utf8');
  if (bytes < 500) bad(`${label}: suspiciously small (${bytes} B)`);
  if (bytes > 400_000) bad(`${label}: too large for Camo-friendly serving (${(bytes / 1024).toFixed(0)} KB)`);
}

/* ──────────────────────── README cross-reference ──────────────────────── */

function extractImageRefs(md) {
  const refs = [];
  // markdown ![alt](src) and [label](src) — capture image form only
  for (const m of md.matchAll(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) refs.push(m[1]);
  // HTML <img src>, <source srcset>, <image href>
  for (const m of md.matchAll(/<(?:img|source|image)\b[^>]*?(?:src|srcset|href)\s*=\s*"([^"]+)"/gi)) {
    refs.push(...m[1].split(',').map((s) => s.trim().split(/\s+/)[0]));
  }
  return refs;
}

function headingAnchors(md) {
  const anchors = new Set();
  for (const m of md.matchAll(/^#{1,6}[ \t]+(.+)$/gm)) {
    const slug = m[1]
      .toLowerCase()
      .replace(/[`*_]/g, '')
      .trim()
      .replace(/[^\w\- ]/g, '')
      .replace(/\s/g, '-');
    if (slug) anchors.add(slug);
  }
  return anchors;
}

function main() {
  if (!existsSync(README)) {
    console.error('README.md not found');
    process.exit(1);
  }
  const md = readFileSync(README, 'utf8');

  /* 1–2 · image references resolve locally */
  const refs = [...new Set(extractImageRefs(md))];
  if (!refs.length) bad('README.md contains no image references at all');
  const resolved = [];
  for (const ref of refs) {
    if (/^(https?:|data:|\/\/)/i.test(ref)) {
      bad(`external image rejected: ${ref} — README assets must live in this repository`);
      continue;
    }
    if (ref.startsWith('/')) {
      bad(`absolute image path rejected: ${ref} — use a repository-relative path`);
      continue;
    }
    if (ref.includes(' ')) bad(`image path contains a space: ${ref}`);
    const target = join(ROOT, ref);
    if (!existsSync(target) || !statSync(target).isFile()) {
      bad(`broken image path: ${ref}`);
      continue;
    }
    if (statSync(target).size === 0) bad(`empty image file: ${ref}`);
    resolved.push(ref);
    ok(`image resolves: ${ref}`);
  }

  /* 3 · every asset is referenced (no orphans) */
  if (existsSync(ASSET_DIR)) {
    for (const entry of readdirSync(ASSET_DIR)) {
      const rel = `assets/readme/${entry}`;
      if (!refs.includes(rel)) bad(`orphaned asset: ${rel} is not referenced by README.md`);
    }
  }

  /* 4–5 · every referenced SVG is well-formed and Camo-safe */
  for (const ref of resolved.filter((r) => r.endsWith('.svg'))) {
    const svg = readFileSync(join(ROOT, ref), 'utf8');
    assertSvgShape(svg, ref);
    assertWellFormedXml(svg, ref);
    assertCamoSafe(svg, ref);
    if (!failures.length) ok(`valid + camo-safe: ${ref}`);
  }

  /* 6 · internal anchors resolve */
  const anchors = headingAnchors(md);
  for (const m of md.matchAll(/\]\(#([^)]+)\)/g)) {
    if (!anchors.has(m[1])) bad(`broken README anchor: #${m[1]} has no matching heading`);
  }

  /* report */
  for (const p of passes) console.log(`  ✓ ${p}`);
  if (failures.length) {
    console.error(`\n${failures.length} asset verification failure(s):`);
    for (const f of failures) console.error(`  ✗ ${f}`);
    process.exit(1);
  }
  console.log(`\nASSET VERIFICATION PASSED — ${resolved.length} images referenced, all local, all Camo-safe.`);
}

main();
