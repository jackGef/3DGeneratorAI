import { Request, Response } from 'express'
import { Types } from 'mongoose'
import Chat from '../models/chat.model.js'
import Message from '../models/message.model.js'

// TODO: replace with real auth; for now read userId from header for testing
function uid(req: Request) { 
  const raw = req.headers['x-user-id']
  if (typeof raw === 'string' && Types.ObjectId.isValid(raw)) {
    return new Types.ObjectId(raw)
  }
}

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
    const userId = uid(req)
    const chat = await Chat.create({userId, title: req.body.title || "New Chat"})
    res.status(201).json(chat)
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
    const chat = await Chat.findByIdAndUpdate(req.params.id, req.body, { new: true });
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