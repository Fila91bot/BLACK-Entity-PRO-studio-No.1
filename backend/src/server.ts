import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';

import chatRouter from './routes/chat.js';
import imageRouter from './routes/image.js';
import videoRouter from './routes/video.js';
import subscriptionRouter from './routes/subscription.js';
import adminRouter from './routes/admin.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/image', imageRouter);
app.use('/api/video', videoRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/admin', adminRouter);

// Global error handler (MORA biti zadnji)
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  const message = err instanceof Error ? err.message : 'Unknown error';
  res.status(500).json({
    error: 'Internal server error',
    message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 BLACK Entity Studio Backend running on http://localhost:${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/api/admin/stats`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🎨 Image endpoint: http://localhost:${PORT}/api/image`);
  console.log(`🎬 Video endpoint: http://localhost:${PORT}/api/video`);
});

export default app;

