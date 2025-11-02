import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/user.model.js";
import { randomUUID } from "crypto";
import { generateSecureCode } from "../utils/coder.js";
import { sendEmail } from "../utils/mailer.js";
import Message from "../models/message.model.js"

function uid(req: Request) { 
  const raw = req.headers['x-user-id'];
  if (typeof raw === 'string' && Types.ObjectId.isValid(raw)) {
    return new Types.ObjectId(raw);
  }
}

//TODO: Add validation(with connection to frontend), hash password, error handling, etc. 
export async function createUser(req: Request, res: Response) {
    try {
        const userId = randomUUID();
        const { email, userName, password } = req.body;

        const secureCode = generateSecureCode();

        sendEmail(email, 'Verify your email', `Your verification code is: ${secureCode}`)
            .then(() => console.log(`Verification email sent to ${email}`))
            .catch((err) => console.error(`Failed to send verification email to ${email}:`, err));

        const user = await User.create({ email, emailVerified: true, password, userName, roles: ['user'], profile: null, createdAt: new Date(), updatedAt: new Date() });

        res.status(201).json(user);
    }catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
}

export async function listUsers(req: Request, res: Response) {
    try {
        const users = await User.find().limit(50);
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
        
        const user = await User.findOne({ userId })
    
        if (!user) return res.status(404).json({error: 'User not found'})
    
        const userSafe = user.toObject()
        delete userSafe.password
    
        return res.json(userSafe)
    } catch (error) {
        console.error('Error in getUserByuserId', error)
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