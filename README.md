# PromptCopilot - Advanced Prompt Engineering Workbench

PromptCopilot is a professional-grade IDE for crafting, testing, and optimizing LLM prompts. It implements best practices from Google's Prompt Engineering whitepaper and other leading research.

## 🚀 Features

- **Advanced Prompt Builder**: Combine Use Cases, Techniques (CoT, Few-Shot, etc.), and Output Formats.
- **Auto-Prompt Engineering (APE)**: Automatically generate and score prompt variants using heuristic algorithms.
- **Mega Prompt Mode**: Create comprehensive, multi-section prompts (1-2 pages) with structured schemas.
- **Model Comparison**: Run prompts against mock adapters (OpenAI, Claude, Llama) side-by-side with cost/token estimates.
- **Heuristic Scoring**: Real-time evaluation of prompt quality (Clarity, Structure, Schema Compliance).
- **History & Versioning**: Save, load, and manage prompt iterations locally.

## 🛠️ Setup & Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🔑 API Configuration

This MVP uses **mock model adapters** for security and ease of testing. To connect real APIs:

1. Open `src/lib/promptEngine.ts`
2. Locate `runMockModel` function.
3. Replace the mock logic with actual API calls using your keys:

```typescript
// Example for OpenAI
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_KEY}` },
  // ...
});
```

Create a `.env` file in the root:
```
VITE_OPENAI_KEY=sk-...
VITE_ANTHROPIC_KEY=sk-...
```

## 📚 Reference Documentation

This project is built based on the following core references:

- **Google TechAI Whitepaper**: `file:///mnt/data/2025-01-18-pdf-1-TechAI-Goolge-whitepaper_Prompt Engineering_v4-af36dcc7a49bb7269a58b1c9b89a8ae1.pdf`
- **Prompt Engineering Guide**: `file:///mnt/data/book_english_version.pdf`

## 🧠 APE Heuristics

The Auto-Prompt Engineering (APE) engine scores prompts based on:
- **Schema Presence**: (+30) Ensures structured output.
- **Clarity**: (-10 per ambiguity) Penalizes vague words like "maybe", "try".
- **Constraint Respect**: (+10) Verifies constraints are included.
- **Structure**: (+2 per section) Rewards clear markdown structure.

## 📦 Deployment

To deploy to Vercel or Netlify:

1. Run `npm run build`
2. Upload the `dist/` folder or connect your Git repository.
3. Ensure build command is `npm run build` and output dir is `dist`.

## 🧪 Testing

Run the smoke test to verify the prompt engine logic:
```bash
npm test
```
