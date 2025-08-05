import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import chatRouter from './routes/chat';
import uploadRouter from './routes/upload';
import exportPdfRouter from './routes/exportPdf';
import settingsRouter from './routes/settings';
import searchSharePointRouter from './routes/searchSharePoint';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Route mounting
app.use('/chat', chatRouter);
app.use('/upload', uploadRouter);
app.use('/export-pdf', exportPdfRouter);
app.use('/settings', settingsRouter);
app.use('/search-sharepoint', searchSharePointRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
