import OpenAI from "openai";
import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export function getLLMClient(provider: string, apiKey: string) {
    if (provider === "openai")
        return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    if (provider === "groq")
        return new Groq({ apiKey, dangerouslyAllowBrowser: true });

    if (provider === "anthropic")
        return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    if (provider === "gemini")
        return new GoogleGenerativeAI(apiKey);

    throw new Error(`Unknown provider: ${provider}`);
}
