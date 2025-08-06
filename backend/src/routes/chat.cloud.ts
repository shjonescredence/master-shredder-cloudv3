import { Router } from 'express';
import { createChatCompletion } from '../services/openaiClient.cloud.js';
import { CAPTURE_ASSISTANT_SYSTEM_PROMPT } from '../prompts/captureAssistant.js';

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
      systemPrompt = CAPTURE_ASSISTANT_SYSTEM_PROMPT
    } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: 'No message provided' 
      });
    }

    // Debug: Log API key information (without exposing full key)
    if (userApiKey) {
      console.log(`Using user API key: ${userApiKey.substring(0, 8)}...${userApiKey.slice(-4)} (length: ${userApiKey.length})`);
    } else {
      console.log('No user API key provided, will attempt to use system key');
    }

    // Smart model selection based on message characteristics
    let selectedModel = model;
    if (!selectedModel && userApiKey) {
      try {
        const { getAvailableModels } = await import('../services/openaiClient.cloud.js');
        const { SmartModelSelector } = await import('../services/smartModelSelector.js');
        
        const availableModels = await getAvailableModels(userApiKey);
        const selector = SmartModelSelector.getInstance();
        
        // Determine use case based on message content and context
        let useCase = 'chat_primary';
        
        if (message.length > 1000 || context.length > 5) {
          useCase = 'document_analysis'; // Long messages or complex context
        } else if (message.includes('quick') || message.includes('fast')) {
          useCase = 'fast_responses'; // User wants quick response
        } else if (context.length > 0) {
          useCase = 'reasoning_heavy'; // Continued conversation
        }
        
        selectedModel = selector.getModelForUseCase(useCase as any, availableModels);
        console.log(`Smart model selection: ${useCase} -> ${selectedModel}`);
      } catch (error) {
        console.warn('Smart model selection failed, using fallback:', error);
        selectedModel = 'gpt-4o'; // Fallback
      }
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...context,
      { role: 'user', content: message }
    ];

    // Create chat completion with smart model selection
    const result = await createChatCompletion(messages, {
      model: selectedModel || 'gpt-4o',
      userApiKey,
      temperature,
      maxTokens,
      systemPrompt,
      enableDynamicSelection: false // Smart selection replaces dynamic selection
    });

    // Return successful response
    res.json({
      success: true,
      reply: result.response.choices[0].message.content,
      tokenSource: result.tokenSource,
      model: result.response.model,
      modelUsed: result.modelUsed,
      modelSelection: result.modelSelection,
      dynamicSelectionEnabled: result.dynamicSelectionEnabled,
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
        error: 'Insufficient quota for the provided API key. Please check your OpenAI billing.',
        code: 'INSUFFICIENT_QUOTA',
        suggestions: [
          'Check your OpenAI billing dashboard at https://platform.openai.com/usage',
          'Add payment method or upgrade plan',
          'Wait for monthly quota reset',
          'Try using GPT-3.5-Turbo (cheaper alternative)'
        ]
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
