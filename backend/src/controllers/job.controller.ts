import { Request, Response } from "express";
import Job from "../models/job.model.js";

function uid(req: Request) { return (req.headers["x-user-id"] as string) }

export async function listMyJobs(req: Request, res: Response) {
  try {
    const jobs = await Job.find({ userId: uid(req) }).sort({ createdAt: -1 }).limit(100);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list jobs' });
  }
}

export async function createJob(req: Request, res: Response) {
  try {
    const userId = uid(req);
    const { chatId = null, prompt, params = {} } = req.body;
    const job = await Job.create({ userId, chatId, prompt, params, status: "queued", progress: 0 });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job' });
  }
}

export async function getJob(req: Request, res: Response) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.sendStatus(404);
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get job' });
  }
}

export async function updateJobStatus(req: Request, res: Response) {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.sendStatus(404);
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' });
  }
}
