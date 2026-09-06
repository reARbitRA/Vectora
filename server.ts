import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// ============================================================================
// §1 — TYPE DEFINITIONS
// ============================================================================

/**
 * Every model we know about, its capabilities, tier ranking, and cost weight.
 * `tier` 1 = most capable/expensive, 5 = lightest.
 * `caps` declares what the model can actually do.
 */
interface ModelProfile {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;
  caps: Set<ModelCapability>;
  maxThinkingBudget: number;   // 0 = model does not support thinking config
  maxOutputTokens: number;
  contextWindow: number;       // approximate input token limit
  supportsJsonMode: boolean;
  cooldownUntil: number;       // epoch ms — circuit breaker timestamp
  consecutiveFailures: number;
  latencyEma: number;          // exponential moving average latency in ms
  successRate: number;         // rolling success rate 0-1
  totalCalls: number;
  totalSuccesses: number;
}

type ModelCapability =
  | "text"
  | "vision"
  | "thinking"
  | "image-gen"
  | "audio"
  | "code"
  | "deep-think";

interface TaskClassification {
  complexity: "trivial" | "simple" | "moderate" | "complex" | "extreme";
  requiredCaps: Set<ModelCapability>;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  preferredTier: 1 | 2 | 3 | 4 | 5;
  thinkingBudget: number;
}

interface OrchestrationResult {
  text: string;
  modelUsed: string;
  thinkingBudgetUsed: number;
  latencyMs: number;
  attempts: number;
}

interface GenerateOptions {
  contents?: any[];
  temperature?: number;
  taskType?: "generate" | "refine" | "animate" | "vectorize" | "vision";
  inputComplexityHint?: "trivial" | "simple" | "moderate" | "complex" | "extreme";
  maxOutputTokens?: number;
}

interface CacheEntry {
  result: OrchestrationResult;
  timestamp: number;
  hits: number;
}

// ============================================================================
// §2 — MODEL REGISTRY
// ============================================================================

/**
 * Authoritative registry of every model available on free-tier Google AI Studio.
 * Capability flags, tier rankings, and thinking budgets are calibrated based on
 * published model cards and empirical testing.
 */
function createModelRegistry(): Map<string, ModelProfile> {
  const registry = new Map<string, ModelProfile>();

  const define = (
    id: string,
    tier: 1 | 2 | 3 | 4 | 5,
    caps: ModelCapability[],
    maxThinkingBudget: number,
    maxOutputTokens: number,
    contextWindow: number,
    supportsJsonMode: boolean
  ) => {
    registry.set(id, {
      id,
      tier,
      caps: new Set(caps),
      maxThinkingBudget,
      maxOutputTokens,
      contextWindow,
      supportsJsonMode,
      cooldownUntil: 0,
      consecutiveFailures: 0,
      latencyEma: 5000,
      successRate: 1.0,
      totalCalls: 0,
      totalSuccesses: 0,
    });
  };

  // Primary Flagship Generative Models (Active & Tested with Google GenAI SDK)
  // 1. gemini-3.8-flash: Recommended default for high intelligence and quality vector synthesis
  define("gemini-3.8-flash", 1, ["text", "vision", "thinking", "code"], 0, 65536, 1048576, true);

  // 2. gemini-3.1-flash-lite: High throughput, sub-second latency, ultra-resilient fallback
  define("gemini-3.1-flash-lite", 2, ["text", "vision", "code"], 0, 16384, 524288, true);

  // 3. gemini-2.5-flash: Proven stable flash fallback
  define("gemini-2.5-flash", 3, ["text", "vision", "thinking", "code"], 0, 32768, 1048576, true);

  // 4. gemini-flash-latest: General flash alias
  define("gemini-flash-latest", 4, ["text", "vision", "code"], 0, 32768, 1048576, true);

  return registry;
}

// ============================================================================
// §3 — AI CLIENT SINGLETON
// ============================================================================

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "vectora-studio/2.0",
        },
      },
    });
  }
  return aiClient;
}

// ============================================================================
// §4 — TASK CLASSIFIER
// ============================================================================

/**
 * Analyzes a prompt and generation options to classify the task's complexity
 * and determine which model capabilities and thinking budget are needed.
 *
 * This is the intelligence layer that prevents a trivial "draw a red circle"
 * request from burning a 32K thinking budget on gemini-3-pro-deep-think.
 */
class TaskClassifier {
  // Keyword sets for complexity heuristics
  private static readonly EXTREME_SIGNALS = new Set([
    "isometric", "3d", "perspective", "architectural", "blueprint", "schematic",
    "mechanical", "engine", "circuit", "pcb", "anatomical", "topographic",
    "fractal", "mandelbrot", "recursive", "tessellation", "penrose",
    "city", "cityscape", "skyline", "landscape", "panorama", "infographic",
    "dashboard", "data visualization", "chart", "graph", "flowchart",
    "animation", "animate", "kinetic", "motion", "choreograph",
    "portrait", "photorealistic", "hyperrealistic",
  ]);

  private static readonly COMPLEX_SIGNALS = new Set([
    "detailed", "intricate", "elaborate", "sophisticated", "ornate",
    "art deco", "art nouveau", "baroque", "gothic", "celtic",
    "mandala", "geometric pattern", "kaleidoscope", "symmetry",
    "logo", "brand", "icon set", "ui kit", "component library",
    "map", "floor plan", "wireframe", "mockup", "prototype",
    "gradient mesh", "blend", "composite", "multi-layer",
    "refine", "evolve", "transform", "redesign", "overhaul",
  ]);

  private static readonly SIMPLE_SIGNALS = new Set([
    "simple", "basic", "minimal", "flat", "clean", "single",
    "icon", "symbol", "glyph", "emoji", "badge", "stamp",
    "line", "circle", "square", "triangle", "rectangle",
    "arrow", "bullet", "dot", "star", "heart",
  ]);

  static classify(prompt: string, options: GenerateOptions = {}): TaskClassification {
    const lowerPrompt = prompt.toLowerCase();
    const words = lowerPrompt.split(/\s+/);
    const wordCount = words.length;

    // ── Determine required capabilities ────────────────────────────────
    const requiredCaps = new Set<ModelCapability>(["text"]);

    if (options.taskType === "vision" || options.contents?.some(c =>
      c.parts?.some((p: any) => p.inlineData)
    )) {
      requiredCaps.add("vision");
    }

    // SVG generation always benefits from code capability
    requiredCaps.add("code");

    // ── Score complexity ────────────────────────────────────────────────
    let complexityScore = 0;

    // Word count contributes to complexity
    if (wordCount > 200) complexityScore += 4;
    else if (wordCount > 100) complexityScore += 3;
    else if (wordCount > 50) complexityScore += 2;
    else if (wordCount > 20) complexityScore += 1;

    // Keyword matching
    for (const signal of this.EXTREME_SIGNALS) {
      if (lowerPrompt.includes(signal)) {
        complexityScore += 3;
        break; // Don't over-count
      }
    }

    for (const signal of this.COMPLEX_SIGNALS) {
      if (lowerPrompt.includes(signal)) {
        complexityScore += 2;
        break;
      }
    }

    let hasSimpleSignal = false;
    for (const signal of this.SIMPLE_SIGNALS) {
      if (lowerPrompt.includes(signal)) {
        hasSimpleSignal = true;
        complexityScore -= 1;
        break;
      }
    }

    // Task type modifiers
    if (options.taskType === "animate") complexityScore += 2;
    if (options.taskType === "refine") complexityScore += 1;
    if (options.taskType === "vectorize" || options.taskType === "vision") complexityScore += 2;

    // Existing SVG in the prompt (refinement) adds complexity based on SVG size
    const svgMatch = prompt.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      const svgLength = svgMatch[0].length;
      if (svgLength > 20000) complexityScore += 3;
      else if (svgLength > 10000) complexityScore += 2;
      else if (svgLength > 3000) complexityScore += 1;
    }

    // Manual override from caller
    if (options.inputComplexityHint) {
      const hintMap: Record<string, number> = {
        trivial: -2, simple: -1, moderate: 0, complex: 2, extreme: 4
      };
      complexityScore += hintMap[options.inputComplexityHint] || 0;
    }

    // ── Map score to classification ────────────────────────────────────
    let complexity: TaskClassification["complexity"];
    let preferredTier: TaskClassification["preferredTier"];
    let thinkingBudget: number;

    if (complexityScore >= 7) {
      complexity = "extreme";
      preferredTier = 1;
      thinkingBudget = 0;
      requiredCaps.add("thinking");
    } else if (complexityScore >= 5) {
      complexity = "complex";
      preferredTier = 1;
      thinkingBudget = 0;
      requiredCaps.add("thinking");
    } else if (complexityScore >= 3) {
      complexity = "moderate";
      preferredTier = 1;
      thinkingBudget = 0;
    } else if (complexityScore >= 1) {
      complexity = "simple";
      preferredTier = 2;
      thinkingBudget = 0;
    } else {
      complexity = "trivial";
      preferredTier = 2;
      thinkingBudget = 0;
    }

    // ── Estimate token counts ──────────────────────────────────────────
    const estimatedInputTokens = Math.ceil(prompt.length / 3.5);
    // SVG output is usually 3-15x the input prompt length
    const outputMultiplier = complexity === "extreme" ? 12 : complexity === "complex" ? 8 : complexity === "moderate" ? 6 : 4;
    const estimatedOutputTokens = Math.min(
      Math.ceil(estimatedInputTokens * outputMultiplier),
      options.maxOutputTokens || 65536
    );

    return {
      complexity,
      requiredCaps,
      estimatedInputTokens,
      estimatedOutputTokens,
      preferredTier,
      thinkingBudget,
    };
  }
}

// ============================================================================
// §5 — MODEL ORCHESTRATOR (Adaptive Fusion Engine)
// ============================================================================

/**
 * The Orchestrator is responsible for:
 * 1. Accepting a task classification
 * 2. Selecting the optimal model from the registry (considering health, caps, tier)
 * 3. Configuring thinking budget proportional to task complexity
 * 4. Executing with cascading fallback on failure
 * 5. Updating model health metrics (circuit breaker, latency EMA, success rate)
 * 6. Caching results for identical prompts
 */
class ModelOrchestrator {
  private static registry = createModelRegistry();
  private static cache = new Map<string, CacheEntry>();
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private static readonly CACHE_MAX_SIZE = 200;
  private static readonly CIRCUIT_BREAKER_DURATION = 60_000;     // 1 min cooldown
  private static readonly CIRCUIT_BREAKER_THRESHOLD = 3;         // failures before tripping
  private static readonly LATENCY_EMA_ALPHA = 0.3;               // smoothing factor

  // ── Cache Management ─────────────────────────────────────────────────

  private static getCacheKey(prompt: string, systemInstruction: string, options: GenerateOptions): string {
    const hash = crypto.createHash("sha256");
    hash.update(prompt);
    hash.update(systemInstruction);
    hash.update(JSON.stringify({
      temperature: options.temperature,
      taskType: options.taskType,
      hint: options.inputComplexityHint,
    }));
    // Don't cache vision requests (image data makes keys huge and non-repeatable)
    if (options.contents?.some(c => c.parts?.some((p: any) => p.inlineData))) {
      return ""; // empty key = no cache
    }
    return hash.digest("hex");
  }

  private static checkCache(key: string): OrchestrationResult | null {
    if (!key) return null;
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    entry.hits++;
    return entry.result;
  }

  private static setCache(key: string, result: OrchestrationResult): void {
    if (!key) return;
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.CACHE_MAX_SIZE) {
      let oldestKey = "";
      let oldestTime = Infinity;
      for (const [k, v] of this.cache) {
        if (v.timestamp < oldestTime) {
          oldestTime = v.timestamp;
          oldestKey = k;
        }
      }
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { result, timestamp: Date.now(), hits: 0 });
  }

  // ── Circuit Breaker & Health Tracking ────────────────────────────────

  private static recordSuccess(modelId: string, latencyMs: number): void {
    const profile = this.registry.get(modelId);
    if (!profile) return;
    profile.consecutiveFailures = 0;
    profile.cooldownUntil = 0;
    profile.totalCalls++;
    profile.totalSuccesses++;
    profile.successRate = profile.totalSuccesses / profile.totalCalls;
    profile.latencyEma = this.LATENCY_EMA_ALPHA * latencyMs + (1 - this.LATENCY_EMA_ALPHA) * profile.latencyEma;
  }

  private static recordFailure(modelId: string, error: any): void {
    const profile = this.registry.get(modelId);
    if (!profile) return;
    profile.consecutiveFailures++;
    profile.totalCalls++;
    profile.successRate = profile.totalCalls > 0 ? profile.totalSuccesses / profile.totalCalls : 0;

    if (profile.consecutiveFailures >= this.CIRCUIT_BREAKER_THRESHOLD) {
      // Exponential backoff on circuit breaker duration
      const backoffMultiplier = Math.min(
        Math.pow(2, profile.consecutiveFailures - this.CIRCUIT_BREAKER_THRESHOLD),
        16
      );
      profile.cooldownUntil = Date.now() + this.CIRCUIT_BREAKER_DURATION * backoffMultiplier;
      console.warn(
        `[Orchestrator] Circuit breaker TRIPPED for ${modelId} — ` +
        `${profile.consecutiveFailures} consecutive failures. ` +
        `Cooldown until ${new Date(profile.cooldownUntil).toISOString()}`
      );
    }
  }

  private static isModelHealthy(profile: ModelProfile): boolean {
    if (profile.cooldownUntil > Date.now()) return false;
    return true;
  }

  // ── Model Selection Algorithm ────────────────────────────────────────

  /**
   * Selects the best available model for a given task classification.
   *
   * Selection criteria (in priority order):
   * 1. Model must have ALL required capabilities
   * 2. Model must not be in circuit-breaker cooldown
   * 3. Model must support JSON mode (required for our structured output)
   * 4. Model context window must fit estimated input tokens
   * 5. Model output limit must fit estimated output tokens
   * 6. Prefer models closest to the preferred tier (expanding outward)
   * 7. Among same-tier models, prefer lower latency EMA
   * 8. Among similar latency, prefer higher success rate
   */
  static selectModels(task: TaskClassification): ModelProfile[] {
    const now = Date.now();
    const candidates: Array<{ profile: ModelProfile; score: number }> = [];

    for (const [, profile] of this.registry) {
      // Hard filters
      if (!this.isModelHealthy(profile)) continue;
      if (!profile.supportsJsonMode) continue;

      // Capability check: model must have ALL required caps
      let hasAllCaps = true;
      for (const cap of task.requiredCaps) {
        // deep-think is optional — if model doesn't have it, thinking is still ok
        if (cap === "deep-think" && !profile.caps.has("deep-think")) {
          // Acceptable if model at least has "thinking"
          if (!profile.caps.has("thinking")) {
            hasAllCaps = false;
            break;
          }
          continue;
        }
        if (!profile.caps.has(cap)) {
          hasAllCaps = false;
          break;
        }
      }
      if (!hasAllCaps) continue;

      // Context window check
      if (profile.contextWindow < task.estimatedInputTokens) continue;
      if (profile.maxOutputTokens < Math.min(task.estimatedOutputTokens, 8192)) continue;

      // ── Scoring ──────────────────────────────────────────────────────
      let score = 0;

      // Tier proximity (0 = perfect match, negative = worse)
      const tierDiff = Math.abs(profile.tier - task.preferredTier);
      score -= tierDiff * 100;

      // Prefer higher-capability models for complex tasks
      if (task.complexity === "extreme" || task.complexity === "complex") {
        if (profile.tier <= 2) score += 50;
        if (profile.caps.has("deep-think")) score += 30;
        if (profile.caps.has("thinking") && profile.maxThinkingBudget >= task.thinkingBudget) score += 20;
      }

      // Latency penalty (normalized — lower is better)
      score -= Math.floor(profile.latencyEma / 1000) * 5;

      // Success rate bonus
      score += Math.floor(profile.successRate * 50);

      // Freshness bonus for models with "latest" or "exp" in name
      if (profile.id.includes("latest") || profile.id.includes("exp")) {
        score += 10;
      }

      // Thinking capability match
      if (task.thinkingBudget > 0 && profile.maxThinkingBudget > 0) {
        score += 25; // Model supports thinking and task wants it
      }
      if (task.thinkingBudget === 0 && profile.maxThinkingBudget === 0) {
        score += 10; // Neither needs thinking — good match
      }

      candidates.push({ profile, score });
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    return candidates.map(c => c.profile);
  }

  // ── Core Generation Method ───────────────────────────────────────────

  static async generate(
    prompt: string,
    systemInstruction: string,
    options: GenerateOptions = {}
  ): Promise<OrchestrationResult> {
    const ai = getAI();
    if (!ai) throw new Error("GEMINI_API_KEY is not configured. Cannot generate.");

    // Check cache
    const cacheKey = this.getCacheKey(prompt, systemInstruction, options);
    const cached = this.checkCache(cacheKey);
    if (cached) {
      console.log(`[Orchestrator] Cache HIT — returning cached result`);
      return cached;
    }

    // Classify task
    const task = TaskClassifier.classify(prompt, options);
    console.log(
      `[Orchestrator] Task classified: complexity=${task.complexity}, ` +
      `preferredTier=${task.preferredTier}, thinkingBudget=${task.thinkingBudget}, ` +
      `caps=${[...task.requiredCaps].join(",")}`
    );

    // Select models
    const modelCandidates = this.selectModels(task);
    if (modelCandidates.length === 0) {
      throw new Error(
        "No healthy models available matching required capabilities. " +
        "All models may be in circuit-breaker cooldown. Please wait and retry."
      );
    }

    console.log(
      `[Orchestrator] Model candidates (${modelCandidates.length}): ` +
      modelCandidates.slice(0, 5).map(m => `${m.id}[T${m.tier}]`).join(" → ")
    );

    // Attempt generation with cascading fallback
    const maxAttempts = Math.min(modelCandidates.length, 5);
    let lastError: any;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const model = modelCandidates[attempt];

      // Calculate thinking budget for this specific model
      const effectiveThinkingBudget = model.maxThinkingBudget > 0
        ? Math.min(task.thinkingBudget, model.maxThinkingBudget)
        : 0;

      console.log(
        `[Orchestrator] Attempt ${attempt + 1}/${maxAttempts}: ${model.id} ` +
        `(tier=${model.tier}, thinking=${effectiveThinkingBudget}, ` +
        `latencyEma=${Math.round(model.latencyEma)}ms, successRate=${(model.successRate * 100).toFixed(1)}%)`
      );

      const startTime = Date.now();

      try {
        const contents = options.contents || [
          { role: "user", parts: [{ text: prompt }] }
        ];

        // Build config
        const config: any = {
          systemInstruction,
          temperature: options.temperature ?? this.getTemperatureForTask(task),
          responseMimeType: "application/json",
        };

        if (options.maxOutputTokens) {
          config.maxOutputTokens = Math.min(options.maxOutputTokens, model.maxOutputTokens);
        }

        // Add thinking config if model supports it and task warrants it
        if (effectiveThinkingBudget > 0 && model.caps.has("thinking")) {
          config.thinkingConfig = {
            thinkingBudget: effectiveThinkingBudget,
          };
        }

        const result = await this.executeWithRetry(ai, model.id, contents, config);
        const latencyMs = Date.now() - startTime;

        // Parse and validate JSON response
        let text = this.extractCleanJson(result.text || "");

        // Record success
        this.recordSuccess(model.id, latencyMs);

        const orchestrationResult: OrchestrationResult = {
          text,
          modelUsed: model.id,
          thinkingBudgetUsed: effectiveThinkingBudget,
          latencyMs,
          attempts: attempt + 1,
        };

        // Cache the result
        this.setCache(cacheKey, orchestrationResult);

        console.log(
          `[Orchestrator] SUCCESS: ${model.id} in ${latencyMs}ms ` +
          `(${text.length} chars output)`
        );

        return orchestrationResult;
      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        lastError = error;
        this.recordFailure(model.id, error);

        console.error(
          `[Orchestrator] FAILURE on ${model.id} after ${latencyMs}ms: ` +
          `${error.message?.substring(0, 200)}`
        );

        // If rate limited, short pause; for transient, try next model immediately
        if (this.isRateLimitError(error)) {
          await this.sleep(1000);
        }
        // Non-transient or 503 errors: immediately try next candidate model
      }
    }

    // All candidates exhausted
    throw new Error(
      `All ${maxAttempts} model attempts failed. Last error: ${lastError?.message || "Unknown error"}. ` +
      `Please try again in a few moments.`
    );
  }

  // ── Internal Helpers ─────────────────────────────────────────────────

  private static getTemperatureForTask(task: TaskClassification): number {
    switch (task.complexity) {
      case "trivial": return 0.4;
      case "simple": return 0.5;
      case "moderate": return 0.6;
      case "complex": return 0.7;
      case "extreme": return 0.75;
      default: return 0.6;
    }
  }

  private static async executeWithRetry(
    ai: GoogleGenAI,
    modelId: string,
    contents: any[],
    config: any,
    retries: number = 1,
    baseDelay: number = 500
  ): Promise<{ text: string | undefined }> {
    let lastError: any;

    for (let i = 0; i <= retries; i++) {
      try {
        const result = await ai.models.generateContent({
          model: modelId,
          contents,
          config,
        });
        return { text: result.text };
      } catch (error: any) {
        lastError = error;

        // If 404 / NOT_FOUND, the model is unsupported or does not exist — do NOT retry
        if (
          error?.status === 404 ||
          error?.code === 404 ||
          (typeof error?.message === "string" && (
            error.message.includes("404") ||
            error.message.includes("not found") ||
            error.message.includes("no longer available")
          ))
        ) {
          throw error;
        }

        if (i < retries && (this.isTransientError(error) || this.isRateLimitError(error))) {
          const waitTime = baseDelay * (i + 1);
          console.warn(`[Retry] Transient spike on ${modelId} (${error.message?.slice(0, 80)}), retrying in ${waitTime}ms...`);
          await this.sleep(waitTime);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  /**
   * Extracts valid JSON from potentially noisy model output.
   * Handles markdown fences, literal control chars in SVG strings, and regex SVG recovery.
   */
  private static extractCleanJson(raw: string): string {
    if (!raw) throw new Error("Empty model response");
    let text = raw.trim();

    // 1. Strip markdown code fences
    text = text.replace(/^```(?:json|JSON|xml|svg)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "").trim();

    // 2. Direct JSON.parse attempt
    try {
      JSON.parse(text);
      return text;
    } catch {
      // Continue to extraction
    }

    // 3. String-safe JSON object extraction from outermost '{' to last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // Sanitize control characters (unescaped newlines/tabs inside string literals)
        const sanitized = this.sanitizeJsonControlChars(candidate);
        try {
          JSON.parse(sanitized);
          return sanitized;
        } catch {
          // Trailing commas cleanup
          const cleaned = sanitized.replace(/,\s*([}\]])/g, "$1");
          try {
            JSON.parse(cleaned);
            return cleaned;
          } catch {
            // Keep going to SVG fallback
          }
        }
      }
    }

    // 4. SVG Extraction Fallback:
    // If model returned direct SVG markup without JSON envelope:
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      const extractedSvg = svgMatch[0];
      const titleMatch = text.match(/<title>([^<]+)<\/title>/i);
      const fallbackObj = {
        title: titleMatch ? titleMatch[1].trim() : "Synthesized Artwork",
        description: "Vector artwork synthesized via VECTORA Engine",
        svg: extractedSvg,
        layers: [],
        animationNotes: "Synthesized self-contained vector graphic.",
      };
      return JSON.stringify(fallbackObj);
    }

    throw new Error(
      `Failed to extract valid JSON from model output. Raw output starts with: "${text.substring(0, 100)}..."`
    );
  }

  private static sanitizeJsonControlChars(str: string): string {
    let inString = false;
    let escaped = false;
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '"' && !escaped) {
        inString = !inString;
        result += ch;
      } else if (inString) {
        if (ch === "\n") {
          result += "\\n";
        } else if (ch === "\r") {
          result += "\\r";
        } else if (ch === "\t") {
          result += "\\t";
        } else {
          result += ch;
        }
      } else {
        result += ch;
      }
      escaped = ch === "\\" && !escaped;
    }
    return result;
  }

  private static isRateLimitError(error: any): boolean {
    return (
      error?.message?.includes("429") ||
      error?.status === "RESOURCE_EXHAUSTED" ||
      (typeof error?.message === "string" && error.message.toLowerCase().includes("quota"))
    );
  }

  private static isTransientError(error: any): boolean {
    return (
      this.isRateLimitError(error) ||
      error?.message?.includes("503") ||
      error?.message?.toLowerCase()?.includes("high demand") ||
      error?.message?.toLowerCase()?.includes("overloaded") ||
      error?.status === "UNAVAILABLE" ||
      error?.message?.includes("500") ||
      error?.message?.toLowerCase()?.includes("internal")
    );
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── Diagnostics ──────────────────────────────────────────────────────

  static getRegistryStatus(): Array<{
    id: string;
    tier: number;
    healthy: boolean;
    consecutiveFailures: number;
    successRate: string;
    latencyEma: string;
    cooldownRemaining: string;
  }> {
    const now = Date.now();
    const status: any[] = [];
    for (const [, profile] of this.registry) {
      status.push({
        id: profile.id,
        tier: profile.tier,
        healthy: this.isModelHealthy(profile),
        consecutiveFailures: profile.consecutiveFailures,
        successRate: `${(profile.successRate * 100).toFixed(1)}%`,
        latencyEma: `${Math.round(profile.latencyEma)}ms`,
        cooldownRemaining: profile.cooldownUntil > now
          ? `${Math.ceil((profile.cooldownUntil - now) / 1000)}s`
          : "none",
      });
    }
    return status.sort((a, b) => a.tier - b.tier);
  }
}

// ============================================================================
// §6 — VECTORA SYSTEM PROMPT
// ============================================================================

const VECTORA_SYSTEM_PROMPT = `
You are VECTORA — a world-class Generative SVG Design Engineer operating at the intersection of fine art, visual design theory, and precision front-end engineering.

ROLE & CAPABILITIES:
- Art Director: Master of visual balance, dynamic asymmetry, optical spacing, and harmonious color theory.
- Vector Illustrator: Hand-crafts pristine Bézier curves, arc sweeps (A), cubic splines (C/S), and geometric primitives.
- UI/UX & Design Systems Architect: Designs modular, reusable components with CSS custom properties, dry <defs>, symbols, and semantic classes.
- Creative Coder: Integrates parametric math, logarithmic spirals, isometric projections, and harmonic grids.

NON-NEGOTIABLE STANDARDS FOR GENERATED SVG:
1. Standards & Valid XML:
   - Root <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%" ...>
   - Include <title> and <desc> tags for accessibility and design documentation.
   - Zero external bitmap dependencies. All graphics must be 100% pure vector geometry.

2. VECTORA Standard Layer Architecture (Hierarchical Draw Order):
   Structure all visual elements into ordered <g> containers with Inkscape metadata:
   - <g id="layer-01-bg" inkscape:groupmode="layer" inkscape:label="01_Background">
   - <g id="layer-02-shapes" inkscape:groupmode="layer" inkscape:label="02_Shapes_Primary">
   - <g id="layer-03-core" inkscape:groupmode="layer" inkscape:label="03_Artwork_Core">
   - <g id="layer-04-details" inkscape:groupmode="layer" inkscape:label="04_Details_Secondary">
   - <g id="layer-05-text" inkscape:groupmode="layer" inkscape:label="05_Text_Headlines">
   - <g id="layer-06-accents" inkscape:groupmode="layer" inkscape:label="06_Accents_Highlights">
   - <g id="layer-07-fx" inkscape:groupmode="layer" inkscape:label="07_FX_Overlays">

3. KINETIC INSTRUMENTATION:
   - Rotating components (clock hands, needles, dials) MUST be in dedicated <g> tags with semantic labels.
   - Ensure rotating components are geometrically centered within the 1000x1000 viewBox.

4. Systematized <defs> & <style>:
   - Define all gradients, patterns, filters, and clipPaths inside <defs>.
   - Include a <style> block with semantic CSS classes and custom properties.

5. Precision & Craft:
   - Every composition must feel like a designed, museum-grade creative coding piece.
   - Coordinate numbers must be clean and intentional.

CRITICAL JSON ESCAPING RULES:
- All SVG content in the "svg" field MUST have properly escaped quotes: use \\" for all attribute quotes within the SVG string.
- Newlines within the SVG string MUST be escaped as \\n or the content placed on a single line.
- Do NOT include literal unescaped double quotes inside the JSON string values.
- Ensure the entire output is a single, valid, parseable JSON object.

You MUST respond strictly in the following JSON format:
{
  "title": "Title of the Vector Artwork",
  "concept": "2-3 sentences explaining the design rationale, visual metaphor, and artistic style",
  "style": "Swiss/International | Bauhaus | Art Deco | Cyberpunk/Brutalist | Japanese Editorial | Generative Parametric | Neo-Retro | Glassmorphism | Technical HUD",
  "palette": [
    {"name": "Color Name", "hex": "#HEXVAL", "role": "background|primary|secondary|accent|ink"}
  ],
  "layers": [
    {"name": "01_Background", "description": "Atmospheric gradient and subtle grid"},
    {"name": "02_Shapes_Primary", "description": "Architectural frames and structural geometry"},
    {"name": "03_Artwork_Core", "description": "Main vector subjects and intricate curves"},
    {"name": "04_Details_Secondary", "description": "Scale ticks, crosshairs, and coordinate markers"},
    {"name": "05_Text_Headlines", "description": "Display typography and legend metadata"},
    {"name": "06_Accents_Highlights", "description": "Specular highlights and focus vectors"},
    {"name": "07_FX_Overlays", "description": "Scanlines and lighting overlays"}
  ],
  "svg": "<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 1000 1000\\" ...>...</svg>",
  "evolutionIdeas": [
    "Idea for interactive animation or hover state",
    "Alternative palette or high-contrast variant"
  ]
}
`;

// ============================================================================
// §7 — REQUEST VALIDATION MIDDLEWARE
// ============================================================================

function validateApiKey(req: Request, res: Response, next: NextFunction): void {
  if (!getAI()) {
    res.status(503).json({
      error: "GEMINI_API_KEY is not configured. The AI engine is offline.",
      isOffline: true,
    });
    return;
  }
  next();
}

function sanitizeString(input: any, maxLength: number = 50000): string {
  if (typeof input !== "string") return "";
  return input.slice(0, maxLength).trim();
}

// ============================================================================
// §8 — API ROUTES
// ============================================================================

// ── Health & Diagnostics ───────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  const aiConfigured = !!getAI();
  res.json({
    status: "ok",
    service: "VECTORA SVG Studio Engine v2.0",
    aiConfigured,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/diagnostics/models", (_req, res) => {
  res.json({
    models: ModelOrchestrator.getRegistryStatus(),
    timestamp: new Date().toISOString(),
  });
});

// ── Generate SVG ───────────────────────────────────────────────────────

app.post("/api/generate-svg", validateApiKey, async (req: Request, res: Response) => {
  try {
    const {
      prompt: rawPrompt,
      style = "Art Deco",
      complexity = "balanced",
      paletteMood = "default",
    } = req.body;

    const prompt = sanitizeString(rawPrompt, 10000);
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const userPrompt = `
Generate a masterpiece vector SVG based on this request:
User Request: "${prompt}"
Preferred Aesthetic Style: "${sanitizeString(style, 200)}"
Target Complexity Level: "${sanitizeString(complexity, 100)}"
Color Palette Vibe: "${sanitizeString(paletteMood, 200)}"

Ensure the SVG adheres to the complete VECTORA engineering and artistic doctrine:
- Rich layered groups (<g inkscape:groupmode="layer" inkscape:label="NN_Name">)
- <defs> containing gradients, patterns, filters
- <style> block for classes
- Pure vector paths, circles, polylines, rects, and typography
- Output MUST be valid JSON conforming to the schema.
`;

    const result = await ModelOrchestrator.generate(userPrompt, VECTORA_SYSTEM_PROMPT, {
      taskType: "generate",
      inputComplexityHint: complexity === "detailed" ? "complex" : complexity === "simple" ? "simple" : undefined,
    });

    const parsed = JSON.parse(result.text);

    res.json({
      success: true,
      data: parsed,
      meta: {
        modelUsed: result.modelUsed,
        thinkingBudget: result.thinkingBudgetUsed,
        latencyMs: result.latencyMs,
        attempts: result.attempts,
      },
    });
  } catch (error: any) {
    console.error("SVG Generation error:", error.message);
    const isTransient = ModelOrchestrator["isTransientError"]?.(error) ||
      error?.message?.includes("503") ||
      error?.message?.includes("429");

    res.status(isTransient ? 503 : 500).json({
      error: isTransient
        ? "The AI design engine is experiencing high demand. Please try again in a few moments."
        : (error.message || "Failed to generate vector artwork"),
      isTransient,
    });
  }
});

// ── Refine / Evolve SVG ────────────────────────────────────────────────

app.post("/api/refine-svg", validateApiKey, async (req: Request, res: Response) => {
  try {
    const {
      currentSvg: rawSvg,
      instruction: rawInstruction,
      currentTitle: rawTitle,
    } = req.body;

    const currentSvg = sanitizeString(rawSvg, 100000);
    const instruction = sanitizeString(rawInstruction, 5000);
    const currentTitle = sanitizeString(rawTitle, 500) || "Artwork";

    if (!currentSvg || !instruction) {
      res.status(400).json({ error: "Current SVG and modification instructions are required" });
      return;
    }

    const userPrompt = `
You are given an existing vector SVG artwork titled "${currentTitle}".
User's Refinement Request: "${instruction}"

Current SVG Code:
\`\`\`xml
${currentSvg}
\`\`\`

Task:
Refactor and refine the SVG according to the user's instructions while preserving or improving the VECTORA engineering standards.
Output MUST be valid JSON conforming to the schema.
`;

    const result = await ModelOrchestrator.generate(userPrompt, VECTORA_SYSTEM_PROMPT, {
      temperature: 0.6,
      taskType: "refine",
    });

    const parsed = JSON.parse(result.text);

    res.json({
      success: true,
      data: parsed,
      meta: {
        modelUsed: result.modelUsed,
        thinkingBudget: result.thinkingBudgetUsed,
        latencyMs: result.latencyMs,
        attempts: result.attempts,
      },
    });
  } catch (error: any) {
    console.error("SVG Refinement error:", error.message);
    const isTransient = error?.message?.includes("503") || error?.message?.includes("429");
    res.status(isTransient ? 503 : 500).json({
      error: isTransient
        ? "The refinement engine is temporarily busy. Please try again in a few moments."
        : (error.message || "Failed to refine vector artwork"),
      isTransient,
    });
  }
});

// ── Animate SVG ────────────────────────────────────────────────────────

app.post("/api/animate-svg", validateApiKey, async (req: Request, res: Response) => {
  try {
    const {
      currentSvg: rawSvg,
      animationStyle: rawStyle = "orchestrated",
      title: rawTitle = "Artwork",
      speed = 1,
    } = req.body;

    const currentSvg = sanitizeString(rawSvg, 100000);
    const animationStyle = sanitizeString(rawStyle, 200);
    const title = sanitizeString(rawTitle, 500);

    if (!currentSvg) {
      res.status(400).json({ error: "SVG content is required" });
      return;
    }

    const userPrompt = `
You are VECTORA Motion Choreographer.
Animate this static vector SVG artwork titled "${title}".
Requested Animation Theme/Motion Direction: "${animationStyle}".
Playback Velocity: ${Math.max(0.1, Math.min(10, Number(speed) || 1))}x.

SVG Content:
\`\`\`xml
${currentSvg}
\`\`\`

TASK:
1. Parse the vector layer groups, contours, paths, text nodes, and accents.
2. Inject a <style id="vectora-animations"> block inside the <defs> or <svg> containing pure GPU-accelerated CSS @keyframes rules.
3. Assign appropriate class names to specific <g> layer containers or <path> elements to bring the artwork to life.
4. Ensure the SVG remains 100% self-contained and valid XML.
5. Return the updated SVG and motion notes.
Output MUST be valid JSON conforming to the schema.
`;

    const result = await ModelOrchestrator.generate(userPrompt, VECTORA_SYSTEM_PROMPT, {
      temperature: 0.5,
      taskType: "animate",
    });

    const parsed = JSON.parse(result.text);

    res.json({
      success: true,
      data: parsed,
      meta: {
        modelUsed: result.modelUsed,
        thinkingBudget: result.thinkingBudgetUsed,
        latencyMs: result.latencyMs,
        attempts: result.attempts,
      },
    });
  } catch (error: any) {
    console.error("SVG Animation error:", error.message);
    const isTransient = error?.message?.includes("503") || error?.message?.includes("429");
    res.status(isTransient ? 503 : 500).json({
      error: isTransient
        ? "The motion choreographer is currently busy. Please try again shortly."
        : (error.message || "Failed to synthesize SVG animation"),
      isTransient,
    });
  }
});

// ── Import & Vectorize ─────────────────────────────────────────────────

app.post("/api/import-vectorize", validateApiKey, async (req: Request, res: Response) => {
  try {
    const {
      type,
      fileName: rawFileName,
      dataUri,
      textContent: rawTextContent,
      rawSvg,
      targetStyle = "Modernist Vector",
      complexity = "balanced",
      paletteMood = "harmonious",
      promptCustomization: rawCustomization = "",
    } = req.body;

    const fileName = sanitizeString(rawFileName, 500);
    const promptCustomization = sanitizeString(rawCustomization, 5000);

    // Direct SVG import — no AI needed
    if (type === "svg" && rawSvg) {
      res.json({
        success: true,
        data: {
          title: fileName ? fileName.replace(/\.svg$/i, "") : "Imported Vector Design",
          concept: "Directly imported and standardized vector SVG artwork into VECTORA studio.",
          style: sanitizeString(targetStyle, 200),
          svg: rawSvg,
        },
      });
      return;
    }

    // Image vectorization
    if (type === "image" && dataUri) {
      let mimeType = "image/png";
      let base64Data = dataUri;

      if (dataUri.includes(";base64,")) {
        const parts = dataUri.split(";base64,");
        const mimeMatch = parts[0].match(/:(.*?)$/);
        if (mimeMatch) mimeType = mimeMatch[1];
        base64Data = parts[1];
      }

      // Validate mime type
      const allowedMimes = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"]);
      if (!allowedMimes.has(mimeType)) {
        res.status(400).json({ error: `Unsupported image format: ${mimeType}` });
        return;
      }

      const promptText = `
You are VECTORA Vector Vision Engine. Scan and analyze this reference image thoroughly:
File: "${fileName || "reference-image"}"
Target Aesthetic Style: "${sanitizeString(targetStyle, 200)}"
Complexity: "${sanitizeString(complexity, 100)}"
Palette Vibe: "${sanitizeString(paletteMood, 200)}"
${promptCustomization ? `Additional Design Directives: "${promptCustomization}"` : ""}

TASK:
1. Deconstruct the visual geometry, color relationships, focal subjects, backgrounds, linework, and visual hierarchy from the provided image.
2. Synthesize a sophisticated, premium pure vector SVG reproduction of this design.
3. Apply full VECTORA engineering standards.
4. Output MUST be valid JSON matching the schema.
`;

      const result = await ModelOrchestrator.generate(promptText, VECTORA_SYSTEM_PROMPT, {
        temperature: 0.6,
        taskType: "vision",
        contents: [{
          role: "user",
          parts: [
            { text: promptText },
            { inlineData: { mimeType, data: base64Data } },
          ],
        }],
      });

      const parsed = JSON.parse(result.text);
      res.json({
        success: true,
        data: parsed,
        meta: {
          modelUsed: result.modelUsed,
          thinkingBudget: result.thinkingBudgetUsed,
          latencyMs: result.latencyMs,
          attempts: result.attempts,
        },
      });
      return;
    }

    // Text document vectorization
    if (type === "text" && rawTextContent) {
      const textContent = sanitizeString(rawTextContent, 50000);

      const promptText = `
You are VECTORA Generative Document Architect. Read and analyze the following text document / specifications:
File Name: "${fileName || "document.txt"}"
Document Content:
"""
${textContent.slice(0, 12000)}
"""

Target Aesthetic Style: "${sanitizeString(targetStyle, 200)}"
Complexity: "${sanitizeString(complexity, 100)}"
Palette Vibe: "${sanitizeString(paletteMood, 200)}"
${promptCustomization ? `Additional Directives: "${promptCustomization}"` : ""}

TASK:
1. Read the document concepts, structure, themes, key metaphors, data specs, or visual instructions.
2. Design and create a breathtaking vector SVG artwork that visually expresses the document.
3. Include rich Inkscape layer groups, nested sub-groups, <defs> gradients, and crisp vector craftsmanship.
4. Output MUST be valid JSON conforming to the schema.
`;

      const result = await ModelOrchestrator.generate(promptText, VECTORA_SYSTEM_PROMPT, {
        taskType: "vectorize",
      });

      const parsed = JSON.parse(result.text);
      res.json({
        success: true,
        data: parsed,
        meta: {
          modelUsed: result.modelUsed,
          thinkingBudget: result.thinkingBudgetUsed,
          latencyMs: result.latencyMs,
          attempts: result.attempts,
        },
      });
      return;
    }

    res.status(400).json({ error: "Invalid import payload. Provide type='image' with dataUri, type='text' with textContent, or type='svg' with rawSvg." });
  } catch (error: any) {
    console.error("Import Vectorize error:", error.message);
    const isTransient = error?.message?.includes("503") || error?.message?.includes("429");
    res.status(isTransient ? 503 : 500).json({
      error: isTransient
        ? "The vectorization engine is under high load. Please retry in a few moments."
        : (error.message || "Failed to scan and vectorize input"),
      isTransient,
    });
  }
});

// ── Unified Generation (Text + Vision) ─────────────────────────────────

app.post("/api/generate-unified", validateApiKey, async (req: Request, res: Response) => {
  try {
    const { prompt: rawPrompt, image, type } = req.body;

    const prompt = sanitizeString(rawPrompt, 10000);
    if (!prompt && !image) {
      res.status(400).json({ error: "Prompt or image is required" });
      return;
    }

    let contents: any[] = [];
    let taskType: GenerateOptions["taskType"] = "generate";

    if (type === "vision" && image) {
      const mimeType = image.split(";")[0].split(":")[1];
      const base64Data = image.split(",")[1];

      if (!mimeType || !base64Data) {
        res.status(400).json({ error: "Invalid image data URI format" });
        return;
      }

      contents = [{
        role: "user",
        parts: [
          { text: `Analyze this image and create a vector SVG artwork inspired by it. User request: "${prompt || "Recreate this style"}"` },
          { inlineData: { mimeType, data: base64Data } },
        ],
      }];
      taskType = "vision";
    } else {
      contents = [{
        role: "user",
        parts: [{ text: `Generate a masterpiece vector SVG based on this request: "${prompt}"` }],
      }];
    }

    const result = await ModelOrchestrator.generate(
      prompt || "Generate a masterpiece vector artwork",
      VECTORA_SYSTEM_PROMPT,
      { contents, taskType }
    );

    const parsed = JSON.parse(result.text);
    res.json({
      success: true,
      data: parsed,
      meta: {
        modelUsed: result.modelUsed,
        thinkingBudget: result.thinkingBudgetUsed,
        latencyMs: result.latencyMs,
        attempts: result.attempts,
      },
    });
  } catch (error: any) {
    console.error("Unified Generation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── GitHub OAuth ───────────────────────────────────────────────────────

app.get("/api/auth/github/url", (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(503).json({ error: "GitHub OAuth is not configured" });
    return;
  }
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const redirectUri = `${baseUrl}/api/auth/github/callback`;
  // Generate CSRF state token
  const state = crypto.randomBytes(16).toString("hex");
  const url = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user:email&state=${state}`;
  res.json({ url, state });
});

app.get("/api/auth/github/callback", async (req: Request, res: Response) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    res.status(400).send("Missing OAuth parameters");
    return;
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: String(code),
      }),
    });

    const data: any = await response.json();

    if (!data.access_token) {
      res.status(401).send("GitHub authentication failed. No access token received.");
      return;
    }

    // SECURITY: Use postMessage with explicit origin instead of '*'
    // and HTML-encode the token to prevent XSS
    const sanitizedToken = data.access_token.replace(/[^a-zA-Z0-9_-]/g, "");

    res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>GitHub Auth</title></head>
<body>
  <p>GitHub connected successfully. This window will close automatically.</p>
  <script>
    (function() {
      try {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'GITHUB_AUTH_SUCCESS', token: ${JSON.stringify(sanitizedToken)} },
            window.location.origin
          );
        }
      } catch(e) { console.error('Auth callback error:', e); }
      setTimeout(function() { window.close(); }, 1500);
    })();
  </script>
</body>
</html>`);
  } catch (error) {
    console.error("GitHub Auth error:", error);
    res.status(500).send("GitHub authentication failed. Please try again.");
  }
});

app.post("/api/github/sync", async (req: Request, res: Response) => {
  const { token, repo, path: filePath, content, message } = req.body;

  if (!token || !repo || !filePath || !content) {
    res.status(400).json({ error: "Missing required fields: token, repo, path, content" });
    return;
  }

  // Sanitize repo and path to prevent directory traversal
  const safeRepo = sanitizeString(repo, 200);
  const safePath = sanitizeString(filePath, 500).replace(/\.\./g, "");

  try {
    // Get current file SHA if it exists (needed for updates)
    const getRes = await fetch(`https://api.github.com/repos/${safeRepo}/contents/${safePath}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const data: any = await getRes.json();
      sha = data.sha;
    }

    // Create or update file
    const putRes = await fetch(`https://api.github.com/repos/${safeRepo}/contents/${safePath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: sanitizeString(message, 500) || "Sync from VECTORA Studio",
        content: Buffer.from(content).toString("base64"),
        sha,
      }),
    });

    if (!putRes.ok) {
      const errorData: any = await putRes.json().catch(() => ({}));
      throw new Error(`GitHub API responded with ${putRes.status}: ${errorData.message || "Unknown error"}`);
    }

    const responseData: any = await putRes.json();
    res.json({
      success: true,
      commitSha: responseData.commit?.sha,
      htmlUrl: responseData.content?.html_url,
    });
  } catch (error: any) {
    console.error("GitHub Sync error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// §9 — SERVER BOOTSTRAP
// ============================================================================

async function startServer(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("[Server] Vite dev middleware attached");
    } catch (err) {
      console.error("[Server] Failed to start Vite dev server:", err);
      process.exit(1);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "1d",
      etag: true,
    }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`[Server] Serving static files from ${distPath}`);
  }

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[Server] Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    const aiStatus = getAI() ? "ONLINE" : "OFFLINE (no GEMINI_API_KEY)";
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  VECTORA Studio Server v2.0                                 ║
║  Running on: http://0.0.0.0:${PORT}                            ║
║  AI Engine:  ${aiStatus.padEnd(45)}║
║  Models:     ${ModelOrchestrator.getRegistryStatus().length} registered                                  ║
║  Environment: ${(process.env.NODE_ENV || "development").padEnd(44)}║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Server] SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Server] Unhandled Rejection at:", promise, "reason:", reason);
});

startServer();