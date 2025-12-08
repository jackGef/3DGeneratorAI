import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { connectDB } from './services/db.js';

import "dotenv/config";
import emailRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import adminRouter from './routes/admin.routes.js';
import type { Request, Response, NextFunction } from 'express';
import logger, { httpLoggerStream } from './utils/logger.js';
import { requestLogger, errorLogger } from './middleware/logging.js';

const app = express();
const PORT = process.env.PORT || 8081;

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

if (allowedOrigins.length === 0) {
  logger.warn('No ALLOWED_ORIGINS set for CORS. All origins will be blocked except in development.');
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined', { stream: httpLoggerStream })); // Use Winston for HTTP logs
app.use(requestLogger); // Custom request/response logging

app.get('/health', (_req, res) => res.json({ ok: true }));

// Serve static assets (3D models)
const ASSETS_DIR = process.env.ASSETS_DIR || './data/assets';
app.use('/data/assets', express.static(path.resolve(ASSETS_DIR)));

app.use('/api/auth', emailRouter);
app.use('/api/chats', chatRouter);
app.use('/api/admin', adminRouter);

// Start
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Backend server started on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch((err) => {
  logger.error('Fatal start error', err);
  process.exit(1);
});

// Global error handler (must be after routes)
app.use(errorLogger); // Log errors with Winston
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const msg = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: msg });
});
