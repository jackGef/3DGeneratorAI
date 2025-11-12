import { Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Asset from '../models/asset.model.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import logger from '../utils/logger.js';

// Get all users (admin only)
export async function getAllUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    logger.info(`Admin ${(req as any).user.userId} fetched ${users.length} users`);

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error('Error in getAllUsers:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Update user roles
const updateUserRoleSchema = z.object({
  roles: z.array(z.enum(['user', 'admin', 'moderator'])),
});

export async function updateUserRole(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const parsed = updateUserRoleSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: parsed.error.flatten(),
      });
    }

    const { roles } = parsed.data;

    const user = await User.findByIdAndUpdate(
      userId,
      { roles },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Admin ${(req as any).user.userId} updated roles for user ${userId} to ${roles.join(', ')}`);

    return res.json({ ok: true, user });
  } catch (err) {
    logger.error('Error in updateUserRole:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Soft delete user (deactivate)
export async function deactivateUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.warn(`Admin ${(req as any).user.userId} deactivated user ${userId}`);

    return res.json({ ok: true, message: 'User deactivated', user });
  } catch (err) {
    logger.error('Error in deactivateUser:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Reactivate user
export async function reactivateUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Admin ${(req as any).user.userId} reactivated user ${userId}`);

    return res.json({ ok: true, message: 'User reactivated', user });
  } catch (err) {
    logger.error('Error in reactivateUser:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// System statistics
export async function getSystemStats(req: Request, res: Response) {
  try {
    const [
      totalUsers,
      activeUsers,
      totalJobs,
      totalAssets,
      totalChats,
      totalMessages,
      jobsByStatus,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      Job.countDocuments(),
      Asset.countDocuments(),
      Chat.countDocuments(),
      Message.countDocuments(),
      Job.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5),
      Job.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'userName email'),
    ]);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      jobs: {
        total: totalJobs,
        byStatus: jobsByStatus.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
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
        users: recentUsers,
        jobs: recentJobs,
      },
    };

    logger.info(`Admin ${(req as any).user.userId} fetched system statistics`);

    return res.json(stats);
  } catch (err) {
    logger.error('Error in getSystemStats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete user permanently (dangerous operation)
export async function deleteUserPermanently(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const adminId = (req as any).user.userId;

    // Prevent self-deletion
    if (userId === adminId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's related data
    await Promise.all([
      Chat.deleteMany({ userId }),
      Message.deleteMany({ userId }),
      Job.deleteMany({ userId }),
      Asset.deleteMany({ userId }),
      User.deleteOne({ _id: userId }),
    ]);

    logger.warn(`Admin ${adminId} permanently deleted user ${userId} (${user.email})`);

    return res.json({ 
      ok: true, 
      message: 'User and all related data deleted permanently' 
    });
  } catch (err) {
    logger.error('Error in deleteUserPermanently:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
