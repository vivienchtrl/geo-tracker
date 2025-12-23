import { ChatMistralAI } from "@langchain/mistralai";

/**
 * Base AI service to centralize Mistral configuration
 */
export function getMistralModel(modelName: string = "mistral-tiny") {
  const apiKey = process.env.MISTRAL_API_KEY;
  
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is missing in environment variables.");
  }

  return new ChatMistralAI({
    apiKey,
    modelName,
    temperature: 0.7,
  });
}
