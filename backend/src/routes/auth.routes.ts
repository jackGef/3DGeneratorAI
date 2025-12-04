import e, { Router } from "express";
import * as AuthCtrl from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter, registerLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";

const r = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Start user registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, userName, password]
 *             properties:
 *               email: { type: string, format: email }
 *               userName: { type: string, minLength: 2 }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Verification code sent
 *       409:
 *         description: Email already registered
 */
r.post("/register", registerLimiter, AuthCtrl.startRegistration);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean }
 *                 token: { type: string }
 *                 refreshToken: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Invalid credentials
 */
r.post("/login", authLimiter, AuthCtrl.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 */
r.post("/refresh", authLimiter, AuthCtrl.refreshAccessToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logout successful
 */
r.post("/logout", AuthCtrl.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
r.get("/me", requireAuth, AuthCtrl.getMe);

r.post("/register/verify", authLimiter, AuthCtrl.completeRegistration);
r.post("/request-password-reset", passwordResetLimiter, AuthCtrl.requestPasswordReset);
r.post("/reset-password", passwordResetLimiter, AuthCtrl.resetPassword);

export default r;