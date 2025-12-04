import { Request, Response } from 'express';
import { callModelServer } from '../services/modelService.js';
import Asset from '../models/asset.model.js';
import { Types } from 'mongoose';

export async function handleGenerate(req: Request, res: Response) {
  try {
    const { prompt, guidanceScale = 15.0, steps = 64, frameSize = 256 } = req.body ?? {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Get userId from authenticated user (set by auth middleware)
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = await callModelServer({ prompt, guidanceScale, steps, frameSize });

    // Create asset records for each generated file format
    const baseUrl = `/assets/${id}`;
    const formats = ['glb', 'obj', 'mtl', 'ply'];
    
    const assetPromises = formats.map(format =>
      Asset.create({
        userId,
        jobId: null, // Can link to job if you create a Job record first
        kind: 'model',
        format,
        url: `${baseUrl}/mesh.${format}`,
        meta: { prompt, guidanceScale, steps, frameSize }
      })
    );

    const assets = await Promise.all(assetPromises);

    const files = {
      glb: `${baseUrl}/mesh.glb`,
      obj: `${baseUrl}/mesh.obj`,
      mtl: `${baseUrl}/mesh.mtl`,
      ply: `${baseUrl}/mesh.ply`
    };

    return res.json({ 
      id, 
      prompt, 
      files,
      assets: assets.map(a => ({ id: a._id, format: a.format, url: a.url }))
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Generation failed', details: err?.message });
  }
}