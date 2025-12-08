import { Router } from 'express';
import {
  getAllUsers,
  getUserDetails,
  updateUserRoles,
  toggleUserStatus,
  deleteUser,
  getSystemStats
} from '../controllers/admin.controller.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// System statistics
router.get('/stats', getSystemStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/roles', updateUserRoles);
router.patch('/users/:userId/toggle-status', toggleUserStatus);
router.delete('/users/:userId', deleteUser);

export default router;
