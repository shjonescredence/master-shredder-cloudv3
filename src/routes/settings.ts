import { Router } from 'express';

const router = Router();
const availableModels = [
  'gpt-4-turbo-16k',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-4o',
  'gpt-4o-mini'
];

/**
 * Returns available models and current default.
 */
router.get('/models', (_, res) => {
  res.json({
    models: availableModels,
    default: process.env.DEFAULT_MODEL || 'gpt-4-turbo-16k'
  });
});

export default router;
