import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import crypto from "crypto";
import Verification from "../models/verification.model.js";
import { sendEmail } from "../utils/mailer.js";
import User from "../models/user.model.js";
import { signToken, generateRefreshToken, getRefreshTokenExpiry } from "../utils/jwt.js";
import PasswordReset from "../models/passwordReset.model.js";
import { RefreshToken } from "../models/refreshToken.model.js";

const generateSecureCode = () =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const startRegistrationSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(2),
  password: z.string().min(8),
});

export async function startRegistration(req: Request, res: Response) {
  try {
    const parsed = startRegistrationSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid data", details: parsed.error.flatten() });

    const { email, userName, password } = parsed.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser)
      return res
        .status(409)
        .json({ error: "User already exists with this email" });

    // avoid duplicates in pending verifications
    const existing = await Verification.findOne({ email }).lean();
    if (existing)
      return res
        .status(409)
        .json({ error: "Verification already pending for this email" });

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateSecureCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await Verification.create({ email, userName, passwordHash, code, expiresAt });

    // send the code. await and catch errors so an SMTP failure doesn't
    // crash the whole process (we still return success to the client).
    try {
      await sendEmail(
        email,
        "Verify your email",
        `Your verification code is: ${code}`,
        `<p>Your verification code is: <b>${code}</b></p>`
      );
      console.log(`Verification email queued/sent to ${email}`);
    } catch (mailErr) {
      // Log the failure but don't treat email send failure as fatal for registration.
      console.warn(`Failed to send verification email to ${email}:`, mailErr);
    }

    return res.json({ ok: true, message: "Verification code sent to email" });
  } catch (err) {
    console.error("Error in startRegistration:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export async function resendVerification(req: Request, res: Response) {
  try {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid data", details: parsed.error.flatten() });

    const { email } = parsed.data;

    // Find pending verification
    const pending = await Verification.findOne({ email });
    if (!pending) {
      return res.status(404).json({ 
        error: "No pending verification found", 
        message: "Please start registration process first" 
      });
    }

    // Check if verification is expired
    if (pending.expiresAt.getTime() < Date.now()) {
      // Clean up expired record
      await Verification.deleteOne({ email });
      return res.status(410).json({ 
        error: "Verification expired", 
        message: "Please register again" 
      });
    }

    // Generate new code and update expiry
    const code = generateSecureCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    await Verification.updateOne(
      { email },
      { code, expiresAt }
    );

    // Send the new code
    try {
      await sendEmail(
        email,
        "Verify your email - Resent",
        `Your new verification code is: ${code}`,
        `<p>Your new verification code is: <b>${code}</b></p><p><small>This code expires in 15 minutes.</small></p>`
      );
      console.log(`Verification email resent to ${email}`);
    } catch (mailErr) {
      console.warn(`Failed to resend verification email to ${email}:`, mailErr);
      return res.status(500).json({ 
        error: "Failed to send email", 
        message: "Please try again later" 
      });
    }

    return res.json({ 
      ok: true, 
      message: "New verification code sent to email" 
    });
  } catch (err) {
    console.error("Error in resendVerification:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const completeRegistrationSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export async function completeRegistration(req: Request, res: Response) {
  try {
    const parsed = completeRegistrationSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });

    const { email, code } = parsed.data;

    const pending = await Verification.findOne({ email });
    if (!pending)
      return res.status(404).json({ error: "No pending verification found" });

    if (pending.expiresAt.getTime() < Date.now())
      return res.status(410).json({ error: "Verification code expired" });

    if (pending.code !== code)
      return res.status(400).json({ error: "Incorrect verification code" });

    // Check if user already exists before creating
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Clean up verification record
      await Verification.deleteOne({ email });
      return res.status(409).json({ error: "User already exists with this email" });
    }

    // Passed → create user
    const user = await User.create({
      email,
      emailVerified: true,
      password: pending.passwordHash,
      userName: pending.userName,
      roles: ["user"],
      profile: { avatarUrl: "", bio: "" },
      settings: {
        theme: "dark",
        language: "en",
        notifications: { jobFinished: true, newMessage: true },
      },
    });

    // cleanup
    await Verification.deleteOne({ email });

    return res.status(201).json({
      ok: true,
      message: "User created and verified",
      user: { id: user._id, email: user.email, userName: user.userName },
    });
  } catch (err) {
    console.error("Error in completeRegistration:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ error: "Invalid email or password" });

    // Generate JWT access token (short-lived)
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    });

    // Generate refresh token (long-lived)
    const refreshTokenString = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    // Store refresh token in database
    await RefreshToken.create({
      userId: user._id,
      token: refreshTokenString,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.json({
      ok: true,
      token,
      refreshToken: refreshTokenString,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        roles: user.roles,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    // req.user is attached by auth middleware
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Error in getMe:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const parsed = requestPasswordResetSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });

    const { email } = parsed.data;

    // Check if user exists
    const user = await User.findOne({ email });
    // Don't reveal if user exists or not (security best practice)
    // Always return success even if email doesn't exist
    
    if (user) {
      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing reset tokens for this email
      await PasswordReset.deleteMany({ email });

      // Create new reset token
      await PasswordReset.create({ email, token, expiresAt });

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      
      try {
        await sendEmail(
          email,
          "Password Reset Request",
          `You requested a password reset. Click this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
          `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a></p><p>This link expires in 1 hour.</p><p>If you didn't request this, please ignore this email.</p>`
        );
        console.log(`Password reset email sent to ${email}`);
      } catch (mailErr) {
        console.warn(`Failed to send password reset email to ${email}:`, mailErr);
      }
    }

    // Always return success (don't reveal if user exists)
    return res.json({ 
      ok: true, 
      message: "If an account exists with that email, a password reset link has been sent." 
    });
  } catch (err) {
    console.error("Error in requestPasswordReset:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function resetPassword(req: Request, res: Response) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });

    const { token, newPassword } = parsed.data;

    // Find valid reset token
    const resetRequest = await PasswordReset.findOne({ 
      token,
      expiresAt: { $gt: new Date() } // Token must not be expired
    });

    if (!resetRequest) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Find user
    const user = await User.findOne({ email: resetRequest.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user password
    user.password = passwordHash;
    await user.save();

    // Delete used reset token
    await PasswordReset.deleteOne({ _id: resetRequest._id });

    console.log(`Password reset successful for ${user.email}`);

    return res.json({ 
      ok: true, 
      message: "Password has been reset successfully. You can now log in with your new password." 
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function refreshAccessToken(req: Request, res: Response) {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.flatten() });

    const { refreshToken: tokenString } = parsed.data;

    // Find the refresh token
    const refreshToken = await RefreshToken.findOne({ token: tokenString });

    if (!refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Check if token is active (not revoked and not expired)
    if (!(refreshToken as any).isActive()) {
      return res.status(401).json({ error: "Refresh token expired or revoked" });
    }

    // Find user
    const user = await User.findById(refreshToken.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new access token
    const newAccessToken = signToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    });

    // Implement token rotation for security
    // Generate new refresh token
    const newRefreshTokenString = generateRefreshToken();
    const expiresAt = getRefreshTokenExpiry();

    // Mark old token as replaced
    refreshToken.revokedAt = new Date();
    refreshToken.replacedByToken = newRefreshTokenString;
    await refreshToken.save();

    // Create new refresh token
    await RefreshToken.create({
      userId: user._id,
      token: newRefreshTokenString,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.json({
      ok: true,
      token: newAccessToken,
      refreshToken: newRefreshTokenString,
    });
  } catch (err) {
    console.error("Error in refreshAccessToken:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      // If no refresh token provided, just return success
      // (client can delete access token on their side)
      return res.json({ ok: true, message: "Logged out successfully" });
    }

    const { refreshToken: tokenString } = parsed.data;

    // Find and revoke the refresh token
    const refreshToken = await RefreshToken.findOne({ token: tokenString });
    
    if (refreshToken && !(refreshToken as any).isActive()) {
      refreshToken.revokedAt = new Date();
      await refreshToken.save();
    }

    return res.json({ ok: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Error in logout:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}