import express from 'express';
import { testApiKey, validateApiKey } from '../services/openaiClient.cloud.js';

const router = express.Router();

/**
 * POST /api/settings/validate-token
 * Validate user-provided OpenAI API key
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

    // First check format
    if (!validateApiKey(apiKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid API key format. OpenAI keys should start with "sk-" and be at least 49 characters long.'
      });
    }

    // Test the key with OpenAI
    const isValid = await testApiKey(apiKey);

    if (isValid) {
      res.json({
        success: true,
        message: 'API key is valid and working'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'API key is invalid or has insufficient permissions'
      });
    }
  } catch (error: any) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate API key'
    });
  }
});

/**
 * GET /api/settings/models
 * Get available OpenAI models for a given API key
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
    const models = await getAvailableModels(apiKey);

    res.json({
      success: true,
      models
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
 * GET /api/settings/config
 * Get current system configuration
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      defaultModel: process.env.DEFAULT_MODEL || 'gpt-4-turbo',
      allowUserTokens: true,
      systemTokenAvailable: !!process.env.OPENAI_SECRET_NAME,
      environment: process.env.NODE_ENV || 'development',
      version: '3.0.0'
    }
  });
});

export default router;
