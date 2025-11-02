import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './services/db.js';
import generateRouter from './routes/generate.routes.js';

import "dotenv/config";
import userRoutes from  './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';``
import jobRoutes from './routes/job.routes.js';
import assetRoutes from './routes/asset.routes.js';
import emailRouter from './routes/email.routes.js';
// import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

const app = express();
const PORT = process.env.PORT || 8081;
const ASSETS_DIR = process.env.ASSETS_DIR || '/data/assets';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/assets', express.static(ASSETS_DIR));

app.use('/api', generateRouter);

app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/send-email', emailRouter);

// Start
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend listening on:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal start error', err);
  process.exit(1);
});

// app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
//   console.error('Unhandled error:', err);
//   const msg = err instanceof Error ? err.message : 'Internal server error';
//   res.status(500).json({ error: msg });
// });
