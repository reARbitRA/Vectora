import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

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
   - <g id="layer-01-bg" inkscape:groupmode="layer" inkscape:label="01_Background"> (Backdrop rects, radial glow, ambient grid)
   - <g id="layer-02-shapes" inkscape:groupmode="layer" inkscape:label="02_Shapes_Primary"> (Structural frames, boundary geometry, primary containers)
   - <g id="layer-03-core" inkscape:groupmode="layer" inkscape:label="03_Artwork_Core"> (Focal subject, central bezier illustrations, hero glyphs)
   - <g id="layer-04-details" inkscape:groupmode="layer" inkscape:label="04_Details_Secondary"> (Telemetry ticks, sub-paths, crosshairs, coordinate markers)
   - <g id="layer-05-text" inkscape:groupmode="layer" inkscape:label="05_Text_Headlines"> (Crisp monospace/display typography with letter-spacing)
   - <g id="layer-06-accents" inkscape:groupmode="layer" inkscape:label="06_Accents_Highlights"> (Specular highlights, neon nodes, contrasting accent points)
   - <g id="layer-07-fx" inkscape:groupmode="layer" inkscape:label="07_FX_Overlays"> (Grain/noise overlays, scanlines, atmospheric filters)

3. Systematized <defs> & <style>:
   - Define all linearGradient, radialGradient, pattern, filter (feDropShadow, feGaussianBlur), and clipPath elements cleanly inside <defs>.
   - Include a <style> block declaring semantic CSS classes and CSS custom properties (e.g. --bg-color, --primary-accent, --grid-stroke).

4. Precision & Craft:
   - Avoid generic clip-art or low-effort shapes. Every composition must feel like a designed, museum-grade creative coding piece or high-end UI/UX telemetry asset.
   - Coordinate numbers must be clean and intentional.

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "VECTORA SVG Studio Engine" });
});

// Generate SVG endpoint
app.post("/api/generate-svg", async (req, res) => {
  try {
    const { prompt, style = "Art Deco", complexity = "balanced", paletteMood = "default" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured",
        isOffline: true,
      });
    }

    const userPrompt = `
Generate a masterpiece vector SVG based on this request:
User Request: "${prompt}"
Preferred Aesthetic Style: "${style}"
Target Complexity Level: "${complexity}"
Color Palette Vibe: "${paletteMood}"

Ensure the SVG adheres to the complete VECTORA engineering and artistic doctrine:
- Rich layered groups (<g inkscape:groupmode="layer" inkscape:label="NN_Name">)
- <defs> containing gradients, patterns, filters (drop shadows, blur, or noise if appropriate)
- <style> block for classes
- Pure vector paths, circles, polylines, rects, and typography
- Output MUST be valid JSON conforming to the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: VECTORA_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("SVG Generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate vector artwork",
      fallbackAvailable: true,
    });
  }
});

// Refine / Evolve existing SVG
app.post("/api/refine-svg", async (req, res) => {
  try {
    const { currentSvg, modificationInstruction, currentTitle } = req.body;

    if (!currentSvg || !modificationInstruction) {
      return res.status(400).json({ error: "Current SVG and modification instructions are required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured",
        isOffline: true,
      });
    }

    const userPrompt = `
You are given an existing vector SVG artwork titled "${currentTitle || 'Artwork'}".
User's Refinement Request: "${modificationInstruction}"

Current SVG Code:
\`\`\`xml
${currentSvg}
\`\`\`

Task:
Refactor and refine the SVG according to the user's instructions while preserving or improving the VECTORA engineering standards (Inkscape layer groupings, <defs>, <style>, valid coordinates, viewBox, <title>, <desc>).
Output MUST be valid JSON conforming to the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: VECTORA_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("SVG Refinement error:", error);
    return res.status(500).json({
      error: error.message || "Failed to refine vector artwork",
    });
  }
});

// Import & Vectorize Endpoint (Image Scanning or Document Interpretation)
app.post("/api/import-vectorize", async (req, res) => {
  try {
    const {
      type, // 'image' | 'text' | 'svg'
      fileName,
      dataUri,
      textContent,
      rawSvg,
      targetStyle = "Modernist Vector",
      complexity = "balanced",
      paletteMood = "harmonious",
      promptCustomization = "",
    } = req.body;

    if (type === "svg" && rawSvg) {
      // Direct SVG handling
      return res.json({
        success: true,
        data: {
          title: fileName ? fileName.replace(/\.svg$/i, "") : "Imported Vector Design",
          concept: "Directly imported and standardized vector SVG artwork into VECTORA studio.",
          style: targetStyle,
          svg: rawSvg,
        },
      });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured",
        isOffline: true,
      });
    }

    if (type === "image" && dataUri) {
      // Parse base64 and mime type
      let mimeType = "image/png";
      let base64Data = dataUri;

      if (dataUri.includes(";base64,")) {
        const parts = dataUri.split(";base64,");
        const mimeMatch = parts[0].match(/:(.*?)$/);
        if (mimeMatch) mimeType = mimeMatch[1];
        base64Data = parts[1];
      }

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      const promptText = `
You are VECTORA Vector Vision Engine. Scan and analyze this reference image thoroughly:
File: "${fileName || 'reference-image'}"
Target Aesthetic Style: "${targetStyle}"
Complexity: "${complexity}"
Palette Vibe: "${paletteMood}"
${promptCustomization ? `Additional Design Directives: "${promptCustomization}"` : ""}

TASK:
1. Deconstruct the visual geometry, color relationships, focal subjects, backgrounds, linework, and visual hierarchy from the provided image.
2. Synthesize an IDENTICALLY SOPHISTICATED, premium pure vector SVG reproduction of this design.
3. Apply full VECTORA engineering standards:
   - Structured <g inkscape:groupmode="layer" inkscape:label="01_Background">, 02_Shapes_Primary, 03_Artwork_Core, 04_Details_Secondary, 05_Text_Headlines, 06_Accents_Highlights, 07_FX_Overlays with nested sub-groups.
   - Rich <defs> (linear/radial gradients, drop-shadow filters, patterns).
   - <style> block with semantic CSS variables and classes.
   - Crisp bezier curves (M, C, S, Q, A, Z), geometric shapes, and harmonious visual weight.
4. Output MUST be valid JSON matching the schema.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [imagePart, { text: promptText }],
        },
        config: {
          systemInstruction: VECTORA_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed });
    } else if (type === "text" && textContent) {
      const promptText = `
You are VECTORA Generative Document Architect. Read and analyze the following text document / specifications:
File Name: "${fileName || 'document.txt'}"
Document Content:
"""
${textContent.slice(0, 12000)}
"""

Target Aesthetic Style: "${targetStyle}"
Complexity: "${complexity}"
Palette Vibe: "${paletteMood}"
${promptCustomization ? `Additional Directives: "${promptCustomization}"` : ""}

TASK:
1. Read the document concepts, structure, themes, key metaphors, data specs, or visual instructions.
2. Design and create a breathtaking, sophisticated vector SVG artwork that visually expresses, charts, illustrates, or conceptualizes the entire document.
3. Include rich Inkscape layer groups, nested sub-groups, <defs> gradients, and crisp vector craftsmanship.
4. Output MUST be valid JSON conforming to the schema.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptText,
        config: {
          systemInstruction: VECTORA_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({ success: true, data: parsed });
    } else {
      return res.status(400).json({ error: "Invalid import payload or missing data" });
    }
  } catch (error: any) {
    console.error("Import Vectorize error:", error);
    return res.status(500).json({
      error: error.message || "Failed to scan and vectorize input",
      fallbackAvailable: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VECTORA Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
