import { Router } from 'express';
import { createChatCompletion } from '../services/openaiClient';

const router = Router();

/**
 * Free-form chat endpoint. Accepts { message, context, model, apiKey }.
 */
router.post('/', async (req, res) => {
  const { message, context, model, apiKey } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const messages = [
    { role: 'system', content: 'You are a helpful capture-management assistant.' },
    ...(context || []),
    { role: 'user', content: message }
  ];
  
  try {
    const completion = await createChatCompletion(messages, model, apiKey);
    res.json(completion.choices[0].message);
  } catch (error: any) {
    console.error('Error in chat endpoint:', error);
    const errorMessage = error.response?.data?.error?.message || 'Failed to generate response';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
