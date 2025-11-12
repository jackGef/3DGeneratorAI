import { Router } from 'express';
import * as AnalyticsCtrl from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';

const r = Router();

// All analytics routes require authentication
r.use(requireAuth);

/**
 * @swagger
 * /api/analytics/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *       401:
 *         description: Not authenticated
 */
r.get('/stats', AnalyticsCtrl.getUserStats);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Not authenticated
 */
r.get('/dashboard', AnalyticsCtrl.getUserDashboard);

/**
 * @swagger
 * /api/analytics/generation-metrics:
 *   get:
 *     summary: Get generation metrics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to include
 *     responses:
 *       200:
 *         description: Generation metrics
 *       401:
 *         description: Not authenticated
 */
r.get('/generation-metrics', AnalyticsCtrl.getGenerationMetrics);

/**
 * @swagger
 * /api/analytics/popular-prompts:
 *   get:
 *     summary: Get popular/recent prompts
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of prompts to return
 *     responses:
 *       200:
 *         description: Popular prompts
 *       401:
 *         description: Not authenticated
 */
r.get('/popular-prompts', AnalyticsCtrl.getPopularPrompts);

/**
 * @swagger
 * /api/analytics/chat-stats:
 *   get:
 *     summary: Get chat statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chat statistics
 *       401:
 *         description: Not authenticated
 */
r.get('/chat-stats', AnalyticsCtrl.getChatStats);

export default r;
