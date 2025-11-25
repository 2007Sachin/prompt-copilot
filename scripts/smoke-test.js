// Simple smoke test for Prompt Engine logic
import { buildPrompt, calculateHeuristicScore } from '../src/lib/promptEngine.ts';
import techniquesData from '../src/data/techniques.json' assert { type: "json" };

console.log("🧪 Starting Smoke Test...");

const mockConfig = {
    useCase: techniquesData.useCases[0],
    technique: techniquesData.techniques[0],
    lengthMode: techniquesData.lengthModes[0],
    outputFormat: techniquesData.outputFormats[0],
    context: "Test Context",
    examples: [],
    constraints: "No constraints",
    persona: "Tester",
    goal: "Test",
    modelConfig: {
        model: "test",
        temperature: 0.5,
        topP: 1,
        topK: 40,
        maxTokens: 100
    }
};

try {
    console.log("Building prompt...");
    const prompt = buildPrompt(mockConfig);

    if (!prompt.includes("Test Context")) throw new Error("Context missing");
    if (!prompt.includes("Tester")) throw new Error("Persona missing");

    console.log("✅ Prompt built successfully");

    console.log("Calculating score...");
    const score = calculateHeuristicScore(prompt, mockConfig);

    if (typeof score.total !== 'number') throw new Error("Score calculation failed");

    console.log(`✅ Score calculated: ${score.total}`);
    console.log("🎉 Smoke Test Passed!");

} catch (error) {
    console.error("❌ Test Failed:", error);
    process.exit(1);
}
