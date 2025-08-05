/**
 * Dynamic Model Selection Service
 * Automatically selects the most appropriate OpenAI model based on request type and complexity
 */

export interface ModelSelectionResult {
  model: string;
  reasoning: string;
  confidence: number;
}

export interface RequestAnalysis {
  complexity: 'low' | 'medium' | 'high';
  type: 'simple_chat' | 'document_analysis' | 'opportunity_shred' | 'competitive_analysis' | 'compliance_review' | 'research_task';
  tokenEstimate: number;
  requiresReasoning: boolean;
  requiresAccuracy: boolean;
}

/**
 * Available models with their characteristics
 */
const MODELS = {
  'gpt-4o': {
    name: 'GPT-4o',
    capabilities: ['complex_reasoning', 'document_analysis', 'high_accuracy', 'multimodal'],
    costTier: 'high',
    maxTokens: 128000,
    bestFor: ['opportunity_shred', 'competitive_analysis', 'complex_document_analysis', 'compliance_review'],
    description: 'Most advanced model for complex analysis requiring high accuracy and reasoning'
  },
  'gpt-4': {
    name: 'GPT-4',
    capabilities: ['complex_reasoning', 'document_analysis', 'high_accuracy'],
    costTier: 'high',
    maxTokens: 8192,
    bestFor: ['opportunity_shred', 'competitive_analysis', 'research_task'],
    description: 'Strong reasoning and accuracy for complex tasks'
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    capabilities: ['basic_reasoning', 'fast_response'],
    costTier: 'low',
    maxTokens: 4096,
    bestFor: ['simple_chat', 'basic_questions'],
    description: 'Fast and cost-effective for simple interactions'
  }
};

/**
 * Analyze the incoming request to determine its characteristics
 */
export function analyzeRequest(message: string, context: any[] = [], systemPrompt = ''): RequestAnalysis {
  const messageText = message.toLowerCase();
  const fullText = `${systemPrompt} ${message} ${context.map(c => c.content || '').join(' ')}`.toLowerCase();
  
  // Determine request type based on keywords and context
  let type: RequestAnalysis['type'] = 'simple_chat';
  let complexity: RequestAnalysis['complexity'] = 'low';
  let requiresReasoning = false;
  let requiresAccuracy = false;

  // Document analysis patterns
  if (messageText.includes('analyze') || messageText.includes('review') || messageText.includes('examine')) {
    type = 'document_analysis';
    complexity = 'medium';
    requiresAccuracy = true;
  }

  // Opportunity shred patterns
  if (fullText.includes('opportunity shred') || 
      fullText.includes('executive summary') || 
      fullText.includes('detailed shred') ||
      fullText.includes('competitive analysis') ||
      messageText.includes('pws') ||
      messageText.includes('rfp') ||
      messageText.includes('solicitation')) {
    type = 'opportunity_shred';
    complexity = 'high';
    requiresReasoning = true;
    requiresAccuracy = true;
  }

  // Competitive analysis patterns
  if (messageText.includes('competitive') || 
      messageText.includes('competitor') ||
      messageText.includes('market analysis') ||
      messageText.includes('incumbent')) {
    type = 'competitive_analysis';
    complexity = 'high';
    requiresReasoning = true;
    requiresAccuracy = true;
  }

  // Compliance review patterns
  if (messageText.includes('compliance') ||
      messageText.includes('requirement') ||
      messageText.includes('regulation') ||
      messageText.includes('far') ||
      messageText.includes('nist') ||
      messageText.includes('fedramp')) {
    type = 'compliance_review';
    complexity = 'high';
    requiresAccuracy = true;
  }

  // Research task patterns
  if (messageText.includes('research') ||
      messageText.includes('find information') ||
      messageText.includes('gather data') ||
      messageText.includes('background') ||
      messageText.includes('history')) {
    type = 'research_task';
    complexity = 'medium';
    requiresReasoning = true;
  }

  // Estimate token usage
  const tokenEstimate = Math.ceil((fullText.length / 4) * 1.2); // Rough estimation

  // Adjust complexity based on content length and context
  if (tokenEstimate > 10000 || context.length > 5) {
    complexity = 'high';
  } else if (tokenEstimate > 3000 || context.length > 2) {
    complexity = 'medium';
  }

  return {
    complexity,
    type,
    tokenEstimate,
    requiresReasoning,
    requiresAccuracy
  };
}

/**
 * Select the most appropriate model based on request analysis
 */
export function selectModel(analysis: RequestAnalysis): ModelSelectionResult {
  const { complexity, type, tokenEstimate, requiresReasoning, requiresAccuracy } = analysis;

  // High-complexity tasks that require advanced reasoning
  if (complexity === 'high' && requiresReasoning && requiresAccuracy) {
    if (tokenEstimate > 8000) {
      return {
        model: 'gpt-4o',
        reasoning: `Selected GPT-4o for ${type} requiring high accuracy, complex reasoning, and large context window (${tokenEstimate} tokens estimated)`,
        confidence: 0.95
      };
    } else {
      return {
        model: 'gpt-4',
        reasoning: `Selected GPT-4 for ${type} requiring high accuracy and complex reasoning`,
        confidence: 0.9
      };
    }
  }

  // Medium complexity tasks
  if (complexity === 'medium' || requiresAccuracy) {
    if (type === 'opportunity_shred' || type === 'competitive_analysis' || type === 'compliance_review') {
      return {
        model: 'gpt-4',
        reasoning: `Selected GPT-4 for ${type} requiring accuracy and structured analysis`,
        confidence: 0.85
      };
    } else {
      return {
        model: 'gpt-4',
        reasoning: `Selected GPT-4 for medium complexity ${type}`,
        confidence: 0.8
      };
    }
  }

  // Simple tasks
  if (complexity === 'low' && type === 'simple_chat' && !requiresReasoning && !requiresAccuracy) {
    return {
      model: 'gpt-3.5-turbo',
      reasoning: `Selected GPT-3.5 Turbo for simple chat interaction - cost-effective and fast`,
      confidence: 0.7
    };
  }

  // Default fallback to GPT-4 for unknown patterns
  return {
    model: 'gpt-4',
    reasoning: `Selected GPT-4 as balanced choice for ${type} with ${complexity} complexity`,
    confidence: 0.75
  };
}

/**
 * Get model information
 */
export function getModelInfo(modelName: string) {
  return MODELS[modelName as keyof typeof MODELS] || null;
}

/**
 * Get all available models
 */
export function getAvailableModels() {
  return Object.keys(MODELS);
}

/**
 * Main function to analyze request and select model
 */
export function analyzeAndSelectModel(
  message: string, 
  context: any[] = [], 
  systemPrompt = '',
  userPreference?: string
): ModelSelectionResult {
  // If user has specified a preference, use it
  if (userPreference && MODELS[userPreference as keyof typeof MODELS]) {
    return {
      model: userPreference,
      reasoning: `Using user-specified model: ${userPreference}`,
      confidence: 1.0
    };
  }

  // Analyze the request
  const analysis = analyzeRequest(message, context, systemPrompt);
  
  // Select the most appropriate model
  return selectModel(analysis);
}
