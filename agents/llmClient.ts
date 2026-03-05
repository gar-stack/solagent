import * as dotenv from "dotenv";
import { ChatOllama } from "@langchain/ollama";
import { ChatGroq } from "@langchain/groq";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

dotenv.config();

const HUGGINGFACEHUB_API_TOKEN = process.env.HUGGINGFACEHUB_API_TOKEN;

// --- 2. Hugging Face (Cloud Free API) ---
const hf = HUGGINGFACEHUB_API_TOKEN ? new HuggingFaceInference({
    model: "meta-llama/Meta-Llama-3-8B-Instruct", // You can swap this for any model
    apiKey: HUGGINGFACEHUB_API_TOKEN,
    temperature: 0.1,
}) : null;


export async function askLLM(prompt: string): Promise<string | null> {
    const messages = [
        new SystemMessage("You are an autonomous Solana Agent. Output only raw JSON."),
        new HumanMessage(prompt),
    ];
    // 2. Try Hugging Face (API)
    if (hf) {
        try {
            console.log("  [LLM] Requesting via Hugging Face Hub...");
            // HF Inference LLM uses simple string prompt
            const response = await hf.invoke(prompt);
            if (response) return response.trim();
        } catch (e: any) {
            console.error(`  [LLM] HF failed: ${e.message}`);
        }
    }
    return null;
}



