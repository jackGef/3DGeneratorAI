import { Request, Response } from "express";
import Asset from "../models/asset.model.js";

function uid(req: Request) { return (req.headers["x-user-id"] as string) }

export async function listMyAssets(req: Request, res: Response) {
  try {
    const userId = uid(req);
    const { jobId } = req.query;
    const q: any = { userId };

    if (jobId) q.jobId = jobId;

    const assets = await Asset.find(q).sort({ createdAt: -1 }).limit(200);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list assets' });
  }
}

export async function createAsset(req: Request, res: Response) {
  try {
    const userId = uid(req);
    const a = await Asset.create({ ...req.body, userId });
    res.status(201).json(a);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create asset' });
  }
}
