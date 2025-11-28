import type { Response } from 'express';
import { z } from 'zod';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import type { AuthenticatedRequest } from '../middleware/adminAuth.js';

// Get all users
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user details with chats
export const getUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    
    res.json({ user, chats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

// Update user roles
const updateUserRolesSchema = z.object({
  roles: z.array(z.string())
});

export const updateUserRoles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { roles } = updateUserRolesSchema.parse(req.body);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.roles = roles;
    await user.save();
    
    res.json({ message: 'User roles updated successfully', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid roles data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update user roles' });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, 
      user: { ...user.toObject(), password: undefined } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Delete user and their chats
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Don't allow deleting yourself
    if (userId === req.user?.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user's chats
    await Chat.deleteMany({ userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get system statistics
export const getSystemStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ roles: 'admin' });
    const totalChats = await Chat.countDocuments();
    
    // Recent registrations (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    
    res.json({
      totalUsers,
      activeUsers,
      adminUsers,
      totalChats,
      recentRegistrations
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
};
