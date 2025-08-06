/**
 * Auto-Updating Model Configuration
 * This file automatically adapts to new OpenAI model releases
 */

export interface ModelConfig {
  defaultModels: {
    chat: string;
    document_analysis: string;
    fast_response: string;
    cost_effective: string;
    reasoning: string;
  };
  
  // Automatic backdoor configuration
  autoUpdate: {
    enabled: boolean;
    checkInterval: number; // hours
    preferenceOrder: string[]; // Model preference patterns
    fallbackStrategy: 'newest' | 'proven' | 'cost-effective';
  };
  
  // Future-proofing rules
  futureModels: {
    gpt5_patterns: string[];
    gpt41_patterns: string[];
    specialized_patterns: {
      audio: string[];
      vision: string[];
      search: string[];
      reasoning: string[];
    };
  };
}

// Dynamic configuration that updates automatically
export const getModelConfig = (availableModels: string[]): ModelConfig => {
  // Detect latest model generations
  const hasGPT5 = availableModels.some(m => m.includes('gpt-5'));
  const hasGPT41 = availableModels.some(m => m.includes('gpt-4.1'));
  const hasGPT4o = availableModels.some(m => m.includes('gpt-4o'));
  
  // Smart defaults that adapt to available models
  const getLatestModel = (patterns: string[], fallback: string): string => {
    for (const pattern of patterns) {
      const matches = availableModels.filter(m => m.includes(pattern));
      if (matches.length > 0) {
        // Return the most recent version (usually the one without date suffix first)
        return matches.find(m => !m.match(/-\d{4}-\d{2}-\d{2}$/)) || matches[0];
      }
    }
    return availableModels.find(m => m.includes(fallback)) || fallback;
  };

  return {
    defaultModels: {
      // Always use the most advanced available model for chat
      chat: getLatestModel(
        hasGPT5 ? ['gpt-5'] : 
        hasGPT41 ? ['gpt-4.1', 'gpt-4.1-2025'] :
        hasGPT4o ? ['gpt-4o', 'gpt-4o-2024'] : ['gpt-4o'],
        'gpt-4o'
      ),
      
      // Document analysis needs reasoning power
      document_analysis: getLatestModel(
        hasGPT5 ? ['gpt-5'] :
        hasGPT41 ? ['gpt-4.1'] :
        ['gpt-4o', 'gpt-4-turbo'],
        'gpt-4o'
      ),
      
      // Fast responses prioritize mini models
      fast_response: getLatestModel(
        hasGPT41 ? ['gpt-4.1-nano', 'gpt-4.1-mini'] :
        ['gpt-4o-mini', 'gpt-3.5-turbo'],
        'gpt-4o-mini'
      ),
      
      // Cost effective balances capability and cost
      cost_effective: getLatestModel(
        ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-3.5-turbo'],
        'gpt-4o-mini'
      ),
      
      // Reasoning tasks need the most powerful model
      reasoning: getLatestModel(
        hasGPT5 ? ['gpt-5'] :
        hasGPT41 ? ['gpt-4.1'] :
        ['gpt-4o'],
        'gpt-4o'
      )
    },

    autoUpdate: {
      enabled: true,
      checkInterval: 24, // Check for new models daily
      preferenceOrder: [
        'gpt-5',           // Future GPT-5
        'gpt-4.2',         // Future GPT-4.2
        'gpt-4.1',         // Current advanced reasoning
        'gpt-4o',          // Current flagship
        'gpt-4-turbo',     // Fallback
        'gpt-3.5-turbo'    // Last resort
      ],
      fallbackStrategy: 'newest'
    },

    futureModels: {
      gpt5_patterns: [
        'gpt-5',
        'gpt-5-turbo',
        'gpt-5-mini',
        'gpt-5.0',
        'gpt-5.1'
      ],
      gpt41_patterns: [
        'gpt-4.1',
        'gpt-4.2',
        'gpt-4.1-mini',
        'gpt-4.1-nano',
        'gpt-4.1-turbo'
      ],
      specialized_patterns: {
        audio: [
          'gpt-5-audio',
          'gpt-4.1-audio',
          'gpt-4o-audio',
          'audio-preview'
        ],
        vision: [
          'gpt-5-vision',
          'gpt-4.1-vision',
          'gpt-4o-vision',
          'vision-preview'
        ],
        search: [
          'gpt-5-search',
          'gpt-4.1-search',
          'gpt-4o-search',
          'search-preview'
        ],
        reasoning: [
          'gpt-5-reasoning',
          'gpt-4.1-reasoning',
          'o1-preview',
          'o1-mini'
        ]
      }
    }
  };
};

// Backdoor function to automatically update model selection
export const getOptimalModel = (
  useCase: 'chat' | 'document_analysis' | 'fast_response' | 'cost_effective' | 'reasoning',
  availableModels: string[]
): string => {
  const config = getModelConfig(availableModels);
  const selectedModel = config.defaultModels[useCase];
  
  // Verify the selected model is actually available
  if (availableModels.includes(selectedModel)) {
    return selectedModel;
  }
  
  // Fallback to first available model from preference order
  for (const preferred of config.autoUpdate.preferenceOrder) {
    const match = availableModels.find(m => m.includes(preferred));
    if (match) return match;
  }
  
  // Last resort: return the first available model
  return availableModels[0] || 'gpt-4o';
};

// Auto-detection for new model categories
export const detectModelCapabilities = (modelName: string): {
  category: 'premium' | 'balanced' | 'fast' | 'specialized';
  capabilities: string[];
  tier: 'flagship' | 'advanced' | 'standard' | 'budget';
} => {
  const name = modelName.toLowerCase();
  
  // Future model detection
  if (name.includes('gpt-5')) {
    return {
      category: 'premium',
      capabilities: ['advanced_reasoning', 'multimodal', 'future_ready'],
      tier: 'flagship'
    };
  }
  
  if (name.includes('gpt-4.1') || name.includes('gpt-4.2')) {
    return {
      category: 'premium',
      capabilities: ['enhanced_reasoning', 'complex_tasks'],
      tier: 'flagship'
    };
  }
  
  if (name.includes('gpt-4o')) {
    const capabilities = ['advanced_reasoning'];
    if (name.includes('mini')) capabilities.push('fast_response', 'cost_effective');
    if (name.includes('audio')) capabilities.push('audio_processing');
    if (name.includes('search')) capabilities.push('web_search');
    
    return {
      category: name.includes('mini') ? 'balanced' : 'premium',
      capabilities,
      tier: name.includes('mini') ? 'advanced' : 'flagship'
    };
  }
  
  // Default categorization
  return {
    category: 'balanced',
    capabilities: ['general_purpose'],
    tier: 'standard'
  };
};

// Export configuration for easy access
export default {
  getModelConfig,
  getOptimalModel,
  detectModelCapabilities
};
