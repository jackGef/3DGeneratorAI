import { Router } from 'express';
import { handleGenerate } from '../controllers/generate.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { generateLimiter } from '../middleware/rateLimiter.js';

const r = Router();

// Generate route requires authentication and has strict rate limiting
r.post('/generate', requireAuth, generateLimiter, handleGenerate);

export default r;