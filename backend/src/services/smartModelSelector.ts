/**
 * Smart Model Selection Service
 * Automatically selects the best available models and adapts to new releases
 */

interface ModelRanking {
  model: string;
  score: number;
  category: 'premium' | 'balanced' | 'fast' | 'specialized';
  features: string[];
  costTier: 'high' | 'medium' | 'low';
  use_cases: string[];
}

interface ModelRecommendations {
  chat_primary: string;
  chat_fallback: string;
  document_analysis: string;
  fast_responses: string;
  cost_effective: string;
  audio_capable?: string;
  search_capable?: string;
  image_capable?: string;
  reasoning_heavy: string;
}

export class SmartModelSelector {
  private static instance: SmartModelSelector;
  private modelCache: ModelRanking[] = [];
  private lastUpdate: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  // Model scoring patterns (higher score = better)
  private readonly MODEL_PATTERNS = [
    // GPT-4o series (newest, most capable)
    { pattern: /^gpt-4o$/, baseScore: 100, category: 'premium' as const },
    { pattern: /^gpt-4o-2024-11-20$/, baseScore: 98, category: 'premium' as const },
    { pattern: /^gpt-4o-2024-08-06$/, baseScore: 95, category: 'premium' as const },
    { pattern: /^gpt-4o-mini$/, baseScore: 85, category: 'balanced' as const },
    { pattern: /^gpt-4o-mini-2024-07-18$/, baseScore: 83, category: 'balanced' as const },
    
    // GPT-4.1 series (latest reasoning models)
    { pattern: /^gpt-4\.1$/, baseScore: 105, category: 'premium' as const },
    { pattern: /^gpt-4\.1-2025-04-14$/, baseScore: 103, category: 'premium' as const },
    { pattern: /^gpt-4\.1-mini$/, baseScore: 88, category: 'balanced' as const },
    { pattern: /^gpt-4\.1-nano$/, baseScore: 75, category: 'fast' as const },
    
    // Specialized models
    { pattern: /audio-preview/, baseScore: 80, category: 'specialized' as const },
    { pattern: /search-preview/, baseScore: 82, category: 'specialized' as const },
    { pattern: /transcribe/, baseScore: 70, category: 'specialized' as const },
    { pattern: /tts/, baseScore: 65, category: 'specialized' as const },
    
    // GPT-3.5 series (fallback)
    { pattern: /^gpt-3\.5-turbo$/, baseScore: 50, category: 'fast' as const },
    { pattern: /^gpt-3\.5-turbo-0125$/, baseScore: 48, category: 'fast' as const },
    { pattern: /^gpt-3\.5-turbo-16k$/, baseScore: 52, category: 'fast' as const },
    
    // Image models
    { pattern: /gpt-image/, baseScore: 60, category: 'specialized' as const },
    
    // Future-proofing patterns
    { pattern: /^gpt-5/, baseScore: 120, category: 'premium' as const }, // Future GPT-5
    { pattern: /^gpt-4\.2/, baseScore: 110, category: 'premium' as const }, // Future GPT-4.2
    { pattern: /-2025-/, baseScore: 5, category: 'premium' as const }, // 2025 models get bonus
    { pattern: /-2026-/, baseScore: 10, category: 'premium' as const }, // 2026 models get bigger bonus
  ];

  private constructor() {}

  public static getInstance(): SmartModelSelector {
    if (!SmartModelSelector.instance) {
      SmartModelSelector.instance = new SmartModelSelector();
    }
    return SmartModelSelector.instance;
  }

  /**
   * Analyze and rank available models
   */
  public analyzeModels(availableModels: string[]): ModelRanking[] {
    return availableModels.map(model => {
      let score = 30; // Base score
      let category: ModelRanking['category'] = 'balanced';
      const features: string[] = [];
      let costTier: ModelRanking['costTier'] = 'medium';
      const use_cases: string[] = [];

      // Apply pattern scoring
      for (const { pattern, baseScore, category: patternCategory } of this.MODEL_PATTERNS) {
        if (pattern.test(model)) {
          score = Math.max(score, baseScore);
          category = patternCategory;
          break;
        }
      }

      // Feature detection
      if (model.includes('audio')) {
        features.push('audio_processing');
        use_cases.push('voice_chat', 'transcription');
      }
      if (model.includes('search')) {
        features.push('web_search');
        use_cases.push('research', 'real_time_data');
      }
      if (model.includes('mini')) {
        features.push('fast_response');
        costTier = 'low';
        use_cases.push('chat', 'quick_tasks');
      }
      if (model.includes('nano')) {
        features.push('ultra_fast');
        costTier = 'low';
        use_cases.push('real_time_chat');
      }
      if (model.includes('gpt-4')) {
        features.push('advanced_reasoning');
        use_cases.push('document_analysis', 'complex_tasks');
        if (!model.includes('mini') && !model.includes('nano')) {
          costTier = 'high';
        }
      }
      if (model.includes('image')) {
        features.push('image_generation');
        use_cases.push('visual_content');
      }

      // Recency bonus (newer date strings get higher scores)
      const dateMatch = model.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        const [, year, month, day] = dateMatch;
        const releaseDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const now = new Date();
        const daysSinceRelease = (now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Newer models get bonus points (max 15 points for models less than 30 days old)
        if (daysSinceRelease < 30) {
          score += Math.max(0, 15 - (daysSinceRelease / 2));
        }
      }

      return {
        model,
        score,
        category,
        features,
        costTier,
        use_cases
      };
    }).sort((a, b) => b.score - a.score); // Sort by score descending
  }

  /**
   * Get smart model recommendations based on available models
   */
  public getRecommendations(availableModels: string[]): ModelRecommendations {
    const rankings = this.analyzeModels(availableModels);
    
    // Find best models for each use case
    const findBestFor = (criteria: (model: ModelRanking) => boolean, fallback?: string): string => {
      const match = rankings.find(criteria);
      return match?.model || fallback || rankings[0]?.model || 'gpt-4o';
    };

    return {
      // Primary chat model - best overall premium model
      chat_primary: findBestFor(
        m => m.category === 'premium' && m.features.includes('advanced_reasoning'),
        rankings.find(m => m.category === 'premium')?.model
      ),

      // Fallback chat model - reliable and fast
      chat_fallback: findBestFor(
        m => (m.category === 'balanced' || m.category === 'fast') && m.score > 80,
        'gpt-4o-mini'
      ),

      // Document analysis - best reasoning model
      document_analysis: findBestFor(
        m => m.features.includes('advanced_reasoning') && m.score > 90,
        rankings.find(m => m.category === 'premium')?.model
      ),

      // Fast responses - optimized for speed
      fast_responses: findBestFor(
        m => m.features.includes('fast_response') || m.category === 'fast',
        'gpt-4o-mini'
      ),

      // Cost effective - best value
      cost_effective: findBestFor(
        m => m.costTier === 'low' && m.score > 70,
        'gpt-4o-mini'
      ),

      // Reasoning heavy tasks - highest scoring premium model
      reasoning_heavy: findBestFor(
        m => m.category === 'premium' && m.score >= 100,
        rankings[0]?.model
      ),

      // Specialized capabilities
      audio_capable: rankings.find(m => m.features.includes('audio_processing'))?.model,
      search_capable: rankings.find(m => m.features.includes('web_search'))?.model,
      image_capable: rankings.find(m => m.features.includes('image_generation'))?.model,
    };
  }

  /**
   * Get the auto-selected model for a specific use case
   */
  public getModelForUseCase(useCase: keyof ModelRecommendations, availableModels: string[]): string {
    const recommendations = this.getRecommendations(availableModels);
    return recommendations[useCase] || recommendations.chat_primary;
  }

  /**
   * Check if cache needs refresh and update model rankings
   */
  public shouldUpdateCache(): boolean {
    return Date.now() - this.lastUpdate > this.CACHE_DURATION;
  }

  /**
   * Get detailed model analysis report
   */
  public getModelReport(availableModels: string[]): {
    total: number;
    by_category: Record<string, number>;
    recommendations: ModelRecommendations;
    top_models: ModelRanking[];
    future_ready: boolean;
  } {
    const rankings = this.analyzeModels(availableModels);
    const recommendations = this.getRecommendations(availableModels);
    
    const by_category = rankings.reduce((acc, model) => {
      acc[model.category] = (acc[model.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check if we have future models (GPT-4.1+, GPT-5, or 2025+ models)
    const future_ready = rankings.some(m => 
      m.model.includes('gpt-4.1') || 
      m.model.includes('gpt-5') || 
      m.model.includes('-2025-') ||
      m.model.includes('-2026-')
    );

    return {
      total: rankings.length,
      by_category,
      recommendations,
      top_models: rankings.slice(0, 10),
      future_ready
    };
  }
}
