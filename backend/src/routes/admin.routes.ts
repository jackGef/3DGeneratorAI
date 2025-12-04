import { Router } from 'express';
import * as AdminCtrl from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const r = Router();

// All admin routes require authentication and admin role
r.use(requireAuth);
r.use(requireAdmin);

// User management
r.get('/users', AdminCtrl.getAllUsers);
r.patch('/users/:id/roles', AdminCtrl.updateUserRole);
r.post('/users/:id/deactivate', AdminCtrl.deactivateUser);
r.post('/users/:id/reactivate', AdminCtrl.reactivateUser);
r.delete('/users/:id', AdminCtrl.deleteUserPermanently);

// System statistics
r.get('/stats', AdminCtrl.getSystemStats);

export default r;
