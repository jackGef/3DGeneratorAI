import { Request, Response } from 'express'
import { Types } from 'mongoose'
import Chat from '../models/chat.model.js'
import Message from '../models/message.model.js'
import { z } from 'zod'

// Get userId from authenticated user (req.user is set by auth middleware)
function uid(req: Request): Types.ObjectId {
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return new Types.ObjectId(userId);
}

const createChatSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

const updateChatSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export async function listMyChats(req: Request, res: Response) {
  try {
    const userId = uid(req);
    const chats = await Chat.find({userId}).sort({lastMessageAt: -1}).limit(25);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list chats' });
  }
}

export async function createChat(req: Request, res: Response) {
  try {
    const parsed = createChatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const userId = uid(req);
    const { title = "New Chat" } = parsed.data;
    const chat = await Chat.create({userId, title});
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
}

export async function getChatById(req: Request, res: Response) {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.sendStatus(404);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chat' });
  }  
}

export async function updateChatById(req: Request, res: Response) {
  try {
    const parsed = updateChatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }

    const chat = await Chat.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
    if (!chat) return res.sendStatus(404);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update chat' });
  }
}

export async function deleteChatById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await Promise.all([Chat.findByIdAndDelete(id), Message.deleteMany({ chatId: id })]);
    res.sendStatus(204); 
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat' });
  }
}