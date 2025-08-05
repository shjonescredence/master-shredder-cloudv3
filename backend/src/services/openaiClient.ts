
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Wraps OpenAI chat completion with dynamically selected model.
 */
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions/completions.js';
export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model?: string
) {
  // Use provided model, env default, or fallback
  const selectedModel = model || process.env.DEFAULT_MODEL || 'gpt-4-turbo-16k';
  const response = await openai.chat.completions.create({
    model: selectedModel,
    messages: messages as ChatCompletionMessageParam[],
    temperature: 0.7
  });
  return response;
}
