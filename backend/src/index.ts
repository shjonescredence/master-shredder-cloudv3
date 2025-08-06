import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { logger } from './middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false // Configure for production domains
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(logger);
app.use('/api', router);

app.get('/', (req, res) => {
  res.json({
    name: 'Master Shredder Cloud v3 API',
    version: '3.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (for AWS ALB)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Master Shredder Cloud v3 API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
