import { Request, Response } from "express";
import Job from "../models/job.model.js";
import { Types } from "mongoose";
import { z } from "zod";

function uid(req: Request): Types.ObjectId {
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return new Types.ObjectId(userId);
}

const createJobSchema = z.object({
  chatId: z.string().optional().nullable(),
  prompt: z.string().min(1),
  params: z.record(z.string(), z.any()).optional().default({}),
});

const updateJobSchema = z.object({
  status: z.enum(["queued", "running", "succeeded", "failed", "canceled"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  error: z.any().optional(),
  outputs: z.array(z.string()).optional(),
  computeMs: z.number().optional(),
  costCredits: z.number().optional(),
  startedAt: z.date().optional(),
  finishedAt: z.date().optional(),
});

export async function listMyJobs(req: Request, res: Response) {
  try {
    const userId = uid(req);
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 }).limit(100);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list jobs' });
  }
}

export async function createJob(req: Request, res: Response) {
  try {
    const parsed = createJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const userId = uid(req);
    const { chatId = null, prompt, params = {} } = parsed.data;
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
    const parsed = updateJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const job = await Job.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
    if (!job) return res.sendStatus(404);
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job' });
  }
}

export async function cancelJob(req: Request, res: Response) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.sendStatus(404);

    // Only allow canceling queued or running jobs
    if (job.status !== "queued" && job.status !== "running") {
      return res.status(400).json({ error: 'Cannot cancel job in current state' });
    }

    job.status = "canceled";
    job.finishedAt = new Date();
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel job' });
  }
}