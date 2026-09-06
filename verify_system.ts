
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function runSystemVerification() {
  console.log("🛠️ STARTING VECTORA SYSTEM VERIFICATION...");
  const results: any[] = [];

  const testEndpoint = async (name: string, url: string, payload: any) => {
    console.log(`📡 Testing: ${name}...`);
    try {
      const response = await fetch(`http://0.0.0.0:3000${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        console.log(`✅ ${name} PASSED`);
        results.push({ name, status: 'PASS', details: 'Valid response received' });
      } else {
        console.error(`❌ ${name} FAILED`, data);
        results.push({ name, status: 'FAIL', details: data.error || 'Unknown error' });
      }
    } catch (e: any) {
      console.error(`❌ ${name} ERROR`, e.message);
      results.push({ name, status: 'ERROR', details: e.message });
    }
    // Respect Free Tier rate limits (RPM is very low)
    console.log("⏳ Cooling down for 20 seconds...");
    await new Promise(resolve => setTimeout(resolve, 20000));
  };

  // 1. Unified Generation (Swarm Orchestration)
  await testEndpoint('Synthesis Swarm (Text)', '/api/generate-unified', {
    prompt: "A geometric constructivist masterpiece",
    type: "text"
  });

  // 2. AI Refinement
  await testEndpoint('Refinement Engine', '/api/refine-svg', {
    currentSvg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" /></svg>',
    instruction: "Add a red triangle",
    currentTitle: "Test Design"
  });

  // 3. Vision Vectorization
  await testEndpoint('Vision Vectorization', '/api/import-vectorize', {
    type: 'text',
    textContent: 'Create a Bauhaus layout with primary colors',
    targetStyle: 'Modernist'
  });

  // 4. Kinetic Animation
  await testEndpoint('Kinetic Binding', '/api/animate-svg', {
    currentSvg: '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" /></svg>',
    animationStyle: "orchestrated"
  });

  console.log("\n📊 FINAL VERIFICATION SUMMARY:");
  results.forEach(r => {
    console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.name}: ${r.status} (${r.details})`);
  });

  if (results.every(r => r.status === 'PASS')) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSystemVerification();
