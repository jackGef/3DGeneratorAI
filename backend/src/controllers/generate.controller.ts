import { Request, Response } from 'express';
import { callModelServer } from '../services/modelService.js';
import { AssetModel } from '../models/generate.model.js';

export async function handleGenerate(req: Request, res: Response) {
  try {
    const { prompt, guidanceScale = 15.0, steps = 64, frameSize = 256 } = req.body ?? {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    const { id } = await callModelServer({ prompt, guidanceScale, steps, frameSize });

    const files = {
      glb: `/assets/${id}/mesh.glb`,
      obj: `/assets/${id}/mesh.obj`,
      mtl: `/assets/${id}/mesh.mtl`,
      ply: `/assets/${id}/mesh.ply`
    };

    await AssetModel.create({ _id: id, prompt, files });

    return res.json({ id, prompt, files });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Generation failed', details: err?.message });
  }
}