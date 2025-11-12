import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { connectDB } from './services/db.js';
import generateRouter from './routes/generate.routes.js';
import { swaggerSpec } from './config/swagger.js';

import "dotenv/config";
import userRoutes from  './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import jobRoutes from './routes/job.routes.js';
import assetRoutes from './routes/asset.routes.js';
import emailRouter from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import type { Request, Response, NextFunction } from 'express';
import logger, { httpLoggerStream } from './utils/logger.js';
import { requestLogger, errorLogger } from './middleware/logging.js';

const app = express();
const PORT = process.env.PORT || 8081;
const ASSETS_DIR = process.env.ASSETS_DIR || '/data/assets';

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173']; // Default for development

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

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: '3D Generator API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
}));

app.use('/assets', express.static(ASSETS_DIR));

app.use('/api', generateRouter);

app.use('/api/auth', emailRouter);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Backend server started on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Assets directory: ${ASSETS_DIR}`);
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
