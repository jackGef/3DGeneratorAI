import { Request, Response } from 'express';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Asset from '../models/asset.model.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import logger from '../utils/logger.js';

// User's personal statistics
export async function getUserStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const [totalJobs, completedJobs, totalAssets, totalChats, totalMessages, recentJobs] =
      await Promise.all([
        Job.countDocuments({ userId }),
        Job.countDocuments({ userId, status: 'completed' }),
        Asset.countDocuments({ userId }),
        Chat.countDocuments({ userId }),
        Message.countDocuments({ userId }),
        Job.find({ userId }).sort({ createdAt: -1 }).limit(10),
      ]);

    const stats = {
      jobs: {
        total: totalJobs,
        completed: completedJobs,
        failed: await Job.countDocuments({ userId, status: 'failed' }),
        running: await Job.countDocuments({ userId, status: 'running' }),
        queued: await Job.countDocuments({ userId, status: 'queued' }),
      },
      assets: {
        total: totalAssets,
      },
      chats: {
        total: totalChats,
      },
      messages: {
        total: totalMessages,
      },
      recent: {
        jobs: recentJobs,
      },
    };

    return res.json(stats);
  } catch (err) {
    logger.error('Error in getUserStats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Usage analytics for dashboard
export async function getUserDashboard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Jobs over time
    const jobsOverTime = await Job.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Asset generation by format
    const assetsByFormat = await Asset.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$format',
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent activity
    const recentActivity = await Promise.all([
      Job.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('prompt status createdAt finishedAt'),
      Chat.find({ userId })
        .sort({ lastMessageAt: -1 })
        .limit(5)
        .select('title lastMessageAt createdAt'),
    ]);

    return res.json({
      period: {
        start: startDate,
        end: new Date(),
        days,
      },
      jobsOverTime,
      assetsByFormat,
      recentJobs: recentActivity[0],
      recentChats: recentActivity[1],
    });
  } catch (err) {
    logger.error('Error in getUserDashboard:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Generation success rate
export async function getGenerationMetrics(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await Job.aggregate([
      {
        $match: {
          userId: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          canceled: {
            $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] },
          },
          avgDuration: {
            $avg: {
              $cond: [
                { $and: ['$startedAt', '$finishedAt'] },
                { $subtract: ['$finishedAt', '$startedAt'] },
                null,
              ],
            },
          },
        },
      },
    ]);

    const result = metrics[0] || {
      total: 0,
      completed: 0,
      failed: 0,
      canceled: 0,
      avgDuration: 0,
    };

    return res.json({
      period: { start: startDate, end: new Date(), days },
      total: result.total,
      completed: result.completed,
      failed: result.failed,
      canceled: result.canceled,
      successRate: result.total > 0 ? (result.completed / result.total) * 100 : 0,
      avgDurationMs: result.avgDuration || 0,
      avgDurationSec: result.avgDuration ? result.avgDuration / 1000 : 0,
    });
  } catch (err) {
    logger.error('Error in getGenerationMetrics:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Popular prompts (user's own)
export async function getPopularPrompts(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;
    const limit = parseInt(req.query.limit as string) || 10;

    const recentJobs = await Job.find({ userId, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('prompt createdAt');

    return res.json({
      prompts: recentJobs.map((job) => ({
        prompt: job.prompt,
        createdAt: job.createdAt,
        id: job._id,
      })),
    });
  } catch (err) {
    logger.error('Error in getPopularPrompts:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Chat statistics
export async function getChatStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const chats = await Chat.find({ userId });
    const chatIds = chats.map((c) => c._id);

    const messageStats = await Message.aggregate([
      {
        $match: {
          chatId: { $in: chatIds },
        },
      },
      {
        $group: {
          _id: '$chatId',
          messageCount: { $sum: 1 },
          lastMessage: { $max: '$createdAt' },
        },
      },
    ]);

    const statsMap = new Map(messageStats.map((s) => [s._id.toString(), s]));

    const chatsWithStats = chats.map((chat) => {
      const stats = statsMap.get(chat._id.toString());
      return {
        _id: chat._id,
        title: chat.title,
        messageCount: stats?.messageCount || 0,
        lastMessageAt: stats?.lastMessage || chat.createdAt,
        createdAt: chat.createdAt,
      };
    });

    return res.json({
      totalChats: chats.length,
      totalMessages: messageStats.reduce((sum, s) => sum + s.messageCount, 0),
      chats: chatsWithStats.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      ),
    });
  } catch (err) {
    logger.error('Error in getChatStats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
