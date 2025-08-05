import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

/**
 * Wraps OpenAI chat completion with dynamically selected model.
 */
export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>, 
  model?: string,
  apiKey?: string
) {
  // Use provided API key or fallback to env variable
  const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY;
  
  // Create a new configuration if a custom API key is provided
  const effectiveOpenai = apiKey 
    ? new OpenAIApi(new Configuration({ apiKey: effectiveApiKey }))
    : openai;
  
  // Use provided model, localStorage setting, or fallback to env default
  const selectedModel = model || process.env.DEFAULT_MODEL || 'gpt-4-turbo-16k';
  
  const response = await effectiveOpenai.createChatCompletion({
    model: selectedModel,
    messages,
    temperature: 0.7
  });
  return response.data;
}
