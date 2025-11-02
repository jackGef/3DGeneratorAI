import { Router } from 'express';
import { handleGenerate } from '../controllers/generate.controller.js';

const r = Router();
r.post('/generate', handleGenerate);
export default r;