import OpenAI from 'openai';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions/completions.js';
import { analyzeAndSelectModel, ModelSelectionResult } from './modelSelector.js';

// AWS Secrets Manager client
const secretsClient = new SecretsManagerClient({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

// Cache for OpenAI clients (per user token)
const clientCache = new Map<string, OpenAI>();

/**
 * Get OpenAI API key from AWS Secrets Manager (fallback for system-wide key)
 */
async function getSystemOpenAIKey(): Promise<string> {
  try {
    const secretName = process.env.OPENAI_SECRET_NAME || 'master-shredder-v3/openai-api-key';
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await secretsClient.send(command);
    
    if (response.SecretString) {
      const secret = JSON.parse(response.SecretString);
      return secret.api_key;
    }
    throw new Error('No secret string found');
  } catch (error) {
    console.error('Failed to retrieve system OpenAI key from Secrets Manager:', error);
    throw new Error('System OpenAI key not available');
  }
}

/**
 * Get or create OpenAI client for a specific API key
 * @param userApiKey - User-provided API key (optional)
 * @returns OpenAI client instance
 */
async function getOpenAIClient(userApiKey?: string): Promise<OpenAI> {
  let apiKey: string;
  
  if (userApiKey) {
    // Use user-provided key
    apiKey = userApiKey;
    
    // Cache client for this user key
    if (!clientCache.has(apiKey)) {
      clientCache.set(apiKey, new OpenAI({ apiKey }));
    }
    return clientCache.get(apiKey)!;
  } else {
    // Use system key from AWS Secrets Manager
    apiKey = await getSystemOpenAIKey();
    
    if (!clientCache.has('system')) {
      clientCache.set('system', new OpenAI({ apiKey }));
    }
    return clientCache.get('system')!;
  }
}

/**
 * Validate OpenAI API key format
 * @param apiKey - API key to validate
 * @returns boolean indicating if key format is valid
 */
export function validateApiKey(apiKey: string): boolean {
  // OpenAI API keys can be:
  // - Legacy format: sk-[48+ characters]
  // - New format: sk-proj-[100+ characters]
  // Both should start with 'sk-' and contain only alphanumeric characters, hyphens, and underscores
  const apiKeyRegex = /^sk-[a-zA-Z0-9\-_]{20,200}$/;
  return apiKeyRegex.test(apiKey) && apiKey.length >= 20;
}

/**
 * Test if an API key is valid by making a simple API call
 * @param apiKey - API key to test
 * @returns Promise<boolean> indicating if key is valid
 */
export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    if (!validateApiKey(apiKey)) {
      return false;
    }
    
    const client = new OpenAI({ apiKey });
    // Make a minimal API call to test the key
    await client.models.list();
    return true;
  } catch (error) {
    // Log error without exposing API key details
    console.error('API key validation failed - key is invalid or has insufficient permissions');
    return false;
  }
}

/**
 * Create chat completion with user-provided or system OpenAI key
 * @param messages - Chat messages
 * @param options - Configuration options
 * @returns Chat completion response with model selection info
 */
export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options: {
    model?: string;
    userApiKey?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    enableDynamicSelection?: boolean;
  } = {}
) {
  const {
    model: userSpecifiedModel,
    userApiKey,
    temperature = 0.7,
    maxTokens = 4000,
    systemPrompt = '',
    enableDynamicSelection = true
  } = options;

  try {
    // Get appropriate OpenAI client
    const openai = await getOpenAIClient(userApiKey);
    
    let selectedModel = userSpecifiedModel || process.env.DEFAULT_MODEL || 'gpt-4-turbo';
    let modelSelection: ModelSelectionResult | null = null;

    // Use dynamic model selection if enabled and no specific model requested
    if (enableDynamicSelection && !userSpecifiedModel) {
      const userMessage = messages[messages.length - 1]?.content || '';
      const context = messages.slice(1, -1); // Exclude system prompt and current message
      
      modelSelection = analyzeAndSelectModel(userMessage, context, systemPrompt);
      selectedModel = modelSelection.model;
      
      console.log(`Dynamic model selection: ${selectedModel} - ${modelSelection.reasoning}`);
    }
    
    // Create chat completion
    const response = await openai.chat.completions.create({
      model: selectedModel,
      messages: messages as ChatCompletionMessageParam[],
      temperature,
      max_tokens: maxTokens,
    });

    return {
      success: true,
      response,
      tokenSource: userApiKey ? 'user' : 'system',
      modelUsed: selectedModel,
      modelSelection: modelSelection,
      dynamicSelectionEnabled: enableDynamicSelection
    };
  } catch (error: any) {
    console.error('Chat completion failed:', error);
    
    // Provide helpful error messages
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid API key provided. Please check your OpenAI API key.');
    } else if (error.code === 'insufficient_quota') {
      throw new Error('Insufficient quota for the provided API key. Please check your OpenAI account.');
    } else if (error.code === 'model_not_found') {
      const usedModel = userSpecifiedModel || process.env.DEFAULT_MODEL || 'gpt-4-turbo';
      throw new Error(`Model '${usedModel}' not found. Please check the model name.`);
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Get available models for a given API key
 * @param userApiKey - User-provided API key (optional)
 * @returns List of available models
 */
export async function getAvailableModels(userApiKey?: string): Promise<string[]> {
  try {
    const openai = await getOpenAIClient(userApiKey);
    const models = await openai.models.list();
    
    // Filter to only chat models and sort by name
    return models.data
      .filter(model => model.id.includes('gpt'))
      .map(model => model.id)
      .sort();
  } catch (error) {
    console.error('Failed to get available models:', error);
    return ['gpt-4-turbo', 'gpt-3.5-turbo']; // Fallback list
  }
}

/**
 * Clear cached clients (useful for memory management)
 */
export function clearClientCache(): void {
  clientCache.clear();
}

// Health check endpoint
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString()
  };
}
