import { Router } from 'express';
import chatRouter from './chat.cloud.js';
import settingsRouter from './settings.js';

const router = Router();

// Cloud-ready chat routes with user token support
router.use('/chat', chatRouter);

// Settings and token management routes
router.use('/settings', settingsRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
