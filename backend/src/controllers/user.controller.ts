import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/user.model.js";
import { randomUUID } from "crypto";
import { generateSecureCode } from "../utils/coder.js";
import { sendEmail } from "../utils/mailer.js";
import Message from "../models/message.model.js"
import { create } from "domain";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Verification from "../models/verification.model.js"

function uid(req: Request) { 
  const raw = req.headers['x-user-id'];
  if (typeof raw === 'string' && Types.ObjectId.isValid(raw)) {
    return new Types.ObjectId(raw);
  }
}

//TODO: Add validation(with connection to frontend), hash password, error handling, etc.


const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  userName: z.string().min(3, { message: "User name too short" }).max(20, { message: "User name too long" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export async function createUser(req: Request, res: Response) {
    try {
        const parsed = createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid user data', details: parsed.error.flatten() }); 
        }
        const { email, userName, password } = parsed.data;
        const existing = await User.findOne({ email }).lean();
        if (existing) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        const passwordHash = await bcrypt.hash(password, 12)

        const verificationCode = generateSecureCode();
        const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

        //TODO: I want it here
        
        const user = await User.create({
            email,
            emailVerified: true,
            password: passwordHash,
            userName,
            roles: ['user'],
            profile: {
                avatarUrl: '',
                bio: ''
            },
            settings: {
                theme: 'dark',
                language: 'en',
                notifications: { 
                    jobFinished: true, 
                    newMessage: true }
            },
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
        })

        try {
            await sendEmail(email, 'Verify your email', `Your verification code is ${verificationCode}`);
            console.log(`Verification code sent to ${email}`);
        } catch (err) {
            console.error(`Failed to send verification code to ${email}:`, err);
        }

        const { _id, roles, emailVerified, settings, profile, createdAt, updatedAt } = user.toObject()

        return res.status(201).json({
            _id,
            email,
            userName,
            roles,
            emailVerified,
            profile,
            settings,
            createdAt,
            updatedAt
        })
        
    } catch (error) {
        console.error('Error in createUser', error)
        const msg = error instanceof Error ? error.message : 'Internal server error'
        return res.status(500).json({ error: msg})
    }

}

export async function listUsers(req: Request, res: Response) {
    try {
        const limit = req.query.limit ? Number(req.query.limit) : 100;
        const users = await User.find().limit(limit).select('-password').lean();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to list users' });
    }
}

export async function getUserByEmail(req: Request, res: Response) { 
    try {
        const email = req.params.email || req.query.email || req.body.email
    
        if (!email) return res.status(400).json({error: 'Email is required'})
        
        const user = await User.findOne({ email })
    
        if (!user) return res.status(404).json({error: 'User not found'})
    
        const userSafe = user.toObject()
        delete userSafe.password
    
        return res.json(userSafe)
    } catch (error) {
        console.error('Error in getUserByEmail', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return res.status(500).json({error: message})
    }
}

export async function getUserById(req: Request, res: Response) { 
    try {
        const userId = req.params.id || req.query.id || req.body.id
    
        if (!userId) return res.status(400).json({error: 'user ID is required'})
        
        const user = await User.findById(userId).select('-password')
    
        if (!user) return res.status(404).json({error: 'User not found'})
    
        return res.json(user)
    } catch (error) {
        console.error('Error in getUserById', error)
        const message = error instanceof Error ? error.message : 'Internal server error'
        return res.status(500).json({error: message})
    }
}

export async function updateUserById(req: Request, res: Response) { 
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true})
        if (!user) return res.sendStatus(404)
        res.json(user)
    } catch (error) {
        res.status(500).json({error: 'Failed to update user'})
    }
}

export async function deleteUserById(req: Request, res: Response) { 
    try {
        await Promise.all([User.findByIdAndDelete(req.params.id), Message.deleteMany({ chatId: req.params.id })])
    } catch (error) {
        res.status(500).json({error: 'Failed to delete user'})
    }
} 