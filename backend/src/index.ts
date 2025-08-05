import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
import { logger } from './middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(logger);
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Capture Assistant backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
