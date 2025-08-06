import express from 'express';
import { testApiKey, validateApiKey } from '../services/openaiClient.cloud.js';

const router = express.Router();

/**
 * POST /api/settings/validate-token
 * Validate user-provided OpenAI API key
 * Enhanced security: API keys are never logged or stored
 */
router.post('/validate-token', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    // First check format (without logging the actual key)
    if (!validateApiKey(apiKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API key format. OpenAI keys should start with "sk-" and be at least 20 characters long.'
      });
    }

    console.log('🔑 Validating user API key (format valid, testing with OpenAI...)');

    // Test the key with OpenAI
    const isValid = await testApiKey(apiKey);

    if (isValid) {
      console.log('✅ User API key validated successfully');
      res.json({
        success: true,
        message: 'API key is valid and working'
      });
    } else {
      console.log('❌ User API key validation failed');
      res.status(401).json({
        success: false,
        error: 'API key is invalid or has insufficient permissions'
      });
    }
  } catch (error: any) {
    // Never log the actual error details that might contain API key info
    console.error('🚨 Token validation failed - OpenAI rejected the key');
    
    // Provide user-friendly error messages based on error type
    let errorMessage = 'Failed to validate API key';
    
    if (error.code === 'insufficient_quota') {
      errorMessage = 'API key is valid but has insufficient quota. Please check your OpenAI account balance.';
    } else if (error.code === 'invalid_api_key' || error.status === 401) {
      errorMessage = 'Invalid API key. Please check your OpenAI API key.';
    } else if (error.message && error.message.toLowerCase().includes('network')) {
      errorMessage = 'Network error connecting to OpenAI. Please try again.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * GET /api/settings/models
 * Get available OpenAI models for a given API key with smart recommendations
 */
router.post('/models', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    // Import the function here to avoid circular dependencies
    const { getAvailableModels } = await import('../services/openaiClient.cloud.js');
    const { SmartModelSelector } = await import('../services/smartModelSelector.js');
    
    const models = await getAvailableModels(apiKey);
    const selector = SmartModelSelector.getInstance();
    const report = selector.getModelReport(models);

    res.json({
      success: true,
      models,
      smart_analysis: {
        total_models: report.total,
        categories: report.by_category,
        recommendations: report.recommendations,
        top_ranked: report.top_models.slice(0, 5),
        future_ready: report.future_ready,
        auto_update_ready: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Models fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available models'
    });
  }
});

/**
 * POST /api/settings/model-recommendation
 * Get smart model recommendation for specific use case
 */
router.post('/model-recommendation', async (req, res) => {
  try {
    const { apiKey, useCase = 'chat_primary' } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is required'
      });
    }

    const { getAvailableModels } = await import('../services/openaiClient.cloud.js');
    const { SmartModelSelector } = await import('../services/smartModelSelector.js');
    
    const models = await getAvailableModels(apiKey);
    const selector = SmartModelSelector.getInstance();
    
    const recommendedModel = selector.getModelForUseCase(useCase, models);
    const recommendations = selector.getRecommendations(models);

    res.json({
      success: true,
      recommended_model: recommendedModel,
      use_case: useCase,
      all_recommendations: recommendations,
      available_use_cases: [
        'chat_primary',
        'chat_fallback', 
        'document_analysis',
        'fast_responses',
        'cost_effective',
        'reasoning_heavy',
        'audio_capable',
        'search_capable',
        'image_capable'
      ]
    });
  } catch (error: any) {
    console.error('Model recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model recommendation'
    });
  }
});

/**
 * GET /api/settings/config
 * Get current system configuration
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      defaultModel: process.env.DEFAULT_MODEL || 'gpt-4o',
      allowUserTokens: true,
      systemTokenAvailable: !!process.env.OPENAI_SECRET_NAME,
      environment: process.env.NODE_ENV || 'development',
      version: '3.0.0'
    }
  });
});

export default router;
