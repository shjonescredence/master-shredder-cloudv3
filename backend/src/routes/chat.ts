import { Router } from 'express';
import { createChatCompletion } from '../services/openaiClient';

const router = Router();

/**
 * Free-form chat endpoint. Accepts { message, context, model }.
 */
router.post('/', async (req, res) => {
  const { message, context, model } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const messages = [
    { role: 'system', content: 'You are a helpful capture-management assistant.' },
    ...(context || []),
    { role: 'user', content: message }
  ];
  try {
    const completion = await createChatCompletion(messages, model);
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

export default router;
