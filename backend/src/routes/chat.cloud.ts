import { Router } from 'express';
import { createChatCompletion } from '../services/openaiClient.cloud.js';

const router = Router();

/**
 * Enhanced chat endpoint with user token support
 * POST /api/chat
 * Body: { message, context?, model?, userApiKey?, temperature?, maxTokens? }
 */
router.post('/', async (req, res) => {
  try {
    const { 
      message, 
      context = [], 
      model,
      userApiKey,
      temperature,
      maxTokens,
      systemPrompt = 'You are Master Shredder, a helpful and intelligent document processing assistant. You help users analyze, summarize, and extract insights from their documents with precision and clarity.'
    } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'No message provided' 
      });
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context,
      { role: 'user', content: message }
    ];

    // Create chat completion with user or system token
    const result = await createChatCompletion(messages, {
      model,
      userApiKey,
      temperature,
      maxTokens
    });

    // Return successful response
    res.json({
      success: true,
      reply: result.response.choices[0].message.content,
      tokenSource: result.tokenSource,
      model: result.response.model,
      usage: result.response.usage
    });

  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    
    // Handle specific error cases
    if (error.message.includes('Invalid API key')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key provided',
        code: 'INVALID_API_KEY'
      });
    }
    
    if (error.message.includes('insufficient quota')) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient quota for the provided API key',
        code: 'INSUFFICIENT_QUOTA'
      });
    }
    
    if (error.message.includes('Model') && error.message.includes('not found')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'MODEL_NOT_FOUND'
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to generate response',
      code: 'CHAT_ERROR'
    });
  }
});

/**
 * Health check endpoint
 * GET /api/chat/health
 */
router.get('/health', async (req, res) => {
  try {
    const { healthCheck } = await import('../services/openaiClient.cloud.js');
    const health = await healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

/**
 * Stream chat endpoint (for future implementation)
 * POST /api/chat/stream
 */
router.post('/stream', async (req, res) => {
  // TODO: Implement streaming response for real-time chat
  res.status(501).json({
    success: false,
    error: 'Streaming not yet implemented',
    code: 'NOT_IMPLEMENTED'
  });
});

export default router;
