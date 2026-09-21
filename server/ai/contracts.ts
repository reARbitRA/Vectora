import { inspectSvg, type SvgGuardLimits } from "../security/svgGuard";

/**
 * Runtime contracts for AI (Gemini) responses.
 *
 * The system prompt asks the model for a JSON shape, but prompts are not
 * validation. Every model response that will be surfaced to the client is
 * checked here BEFORE it leaves the server. Anything that fails is either
 * normalized (missing optional fields) or rejected (bad SVG, wrong types,
 * out-of-bounds values) — never passed through as-is.
 */

export interface ValidatedGeneration {
  title: string;
  concept: string;
  style: string;
  description: string;
  svg: string;
  layers: GenerationLayer[];
  palette: GenerationPaletteEntry[];
  animationNotes?: string;
  evolutionIdeas?: string[];
  designSpec?: unknown;
}

export interface GenerationLayer {
  name: string;
  description?: string;
  elementCount?: number;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  blendMode?: string;
}

export interface GenerationPaletteEntry {
  name?: string;
  hex?: string;
  role?: string;
}

export class ContractViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractViolationError";
  }
}

const MAX_TITLE_LENGTH = 200;
const MAX_TEXT_LENGTH = 5000;
const MAX_LAYERS = 64;
const MAX_PALETTE = 32;
const VALID_BLEND_MODES = new Set([
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
  "exclusion", "hue", "saturation", "color", "luminosity",
]);

function str(value: unknown, max: number, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.slice(0, max);
}

function validateLayers(raw: unknown): GenerationLayer[] {
  if (!Array.isArray(raw)) return [];
  const layers: GenerationLayer[] = [];
  for (const item of raw.slice(0, MAX_LAYERS)) {
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const name = str(record.name, 120);
    if (!name) continue;
    const layer: GenerationLayer = { name };
    const description = str(record.description, 1000);
    if (description) layer.description = description;
    if (typeof record.elementCount === "number" && Number.isFinite(record.elementCount)) {
      layer.elementCount = Math.max(0, Math.min(100_000, Math.round(record.elementCount)));
    }
    if (typeof record.visible === "boolean") layer.visible = record.visible;
    if (typeof record.locked === "boolean") layer.locked = record.locked;
    if (typeof record.opacity === "number" && Number.isFinite(record.opacity)) {
      layer.opacity = Math.max(0, Math.min(1, record.opacity));
    }
    const blendMode = str(record.blendMode, 40);
    if (blendMode && VALID_BLEND_MODES.has(blendMode)) layer.blendMode = blendMode;
    layers.push(layer);
  }
  return layers;
}

function validatePalette(raw: unknown): GenerationPaletteEntry[] {
  if (!Array.isArray(raw)) return [];
  const palette: GenerationPaletteEntry[] = [];
  for (const item of raw.slice(0, MAX_PALETTE)) {
    if (typeof item === "string" && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(item.trim())) {
      palette.push({ hex: item.trim() });
      continue;
    }
    if (typeof item !== "object" || item === null) continue;
    const record = item as Record<string, unknown>;
    const hex = str(record.hex, 32);
    if (!/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(hex)) continue;
    const entry: GenerationPaletteEntry = { hex };
    const name = str(record.name, 80);
    if (name) entry.name = name;
    const role = str(record.role, 40);
    if (role) entry.role = role;
    palette.push(entry);
  }
  return palette;
}

function validateStringList(raw: unknown, maxItems: number, maxItemLength: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string")
    .slice(0, maxItems)
    .map((item) => item.trim().slice(0, maxItemLength))
    .filter((item) => item.length > 0);
}

/**
 * Validate a parsed generation/refinement response object.
 * Throws `ContractViolationError` with a client-safe message on failure.
 */
export function validateGenerationResponse(
  parsed: unknown,
  limits: SvgGuardLimits,
): ValidatedGeneration {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ContractViolationError("Model response was not a JSON object");
  }
  const record = parsed as Record<string, unknown>;

  const svg = typeof record.svg === "string" ? record.svg : "";
  if (!svg.trim()) {
    throw new ContractViolationError("Model response is missing the required `svg` field");
  }

  const verdict = inspectSvg(svg, limits);
  if (!verdict.ok) {
    throw new ContractViolationError(
      `Model-generated SVG failed safety/complexity validation: ${verdict.reason}`,
    );
  }

  const title = str(record.title, MAX_TITLE_LENGTH, "Untitled Artwork") || "Untitled Artwork";
  const description = str(record.description, MAX_TEXT_LENGTH);
  const concept = str(record.concept, MAX_TEXT_LENGTH) || description;
  const style = str(record.style, 200);

  return {
    title,
    concept,
    style,
    description,
    svg,
    layers: validateLayers(record.layers),
    palette: validatePalette(record.palette),
    animationNotes: str(record.animationNotes, MAX_TEXT_LENGTH) || undefined,
    evolutionIdeas: validateStringList(record.evolutionIdeas, 12, 500),
    designSpec: record.designSpec ?? undefined,
  };
}
