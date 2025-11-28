import { Request, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import Chat from "../models/chat.model.js";
import type { Types } from 'mongoose';

interface ChatDocument {
  _id: Types.ObjectId;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  userId: Types.ObjectId;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Validation schemas
const createChatSchema = z.object({
  title: z.string().min(1).max(30),
});

const updateChatSchema = z.object({
  title: z.string().min(1).max(30).optional(),
  isPinned: z.boolean().optional(),
});

const addMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

// Get all chats for the authenticated user
export async function getUserChats(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const chats = await Chat.find({ userId })
      .sort({ isPinned: -1, updatedAt: -1 })
      .select('title messages isPinned createdAt updatedAt')
      .lean() as ChatDocument[];

    // Add preview and lastMessage info
    const chatsWithPreview = chats.map(chat => ({
      ...chat,
      id: chat._id.toString(),
      lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
      preview: chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + 
          (chat.messages[chat.messages.length - 1].content.length > 50 ? '...' : '')
        : '',
      messageCount: chat.messages.length
    }));

    return res.json(chatsWithPreview);
  } catch (err) {
    console.error("Error in getUserChats:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get a specific chat with all messages
export async function getChat(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const chat = await Chat.findOne({ _id: chatId, userId }).lean() as ChatDocument | null;
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    return res.json({
      ...chat,
      id: chat._id.toString()
    });
  } catch (err) {
    console.error("Error in getChat:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Create a new chat
export async function createChat(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = createChatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid data", 
        details: parsed.error.flatten() 
      });
    }

    const { title } = parsed.data;

    const chat = await Chat.create({
      userId,
      title,
      messages: [],
      isPinned: false
    });

    return res.status(201).json({
      id: chat._id.toString(),
      title: chat.title,
      messages: chat.messages,
      isPinned: chat.isPinned,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    });
  } catch (err) {
    console.error("Error in createChat:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Update chat (title, pin status)
export async function updateChat(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = updateChatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid data", 
        details: parsed.error.flatten() 
      });
    }

    const updateData = parsed.data;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      updateData,
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    return res.json({
      id: chat._id.toString(),
      title: chat.title,
      isPinned: chat.isPinned,
      updatedAt: chat.updatedAt
    });
  } catch (err) {
    console.error("Error in updateChat:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Delete a chat
export async function deleteChat(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const result = await Chat.deleteOne({ _id: chatId, userId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    return res.json({ ok: true, message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Error in deleteChat:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Add a message to a chat
export async function addMessage(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = addMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        error: "Invalid data", 
        details: parsed.error.flatten() 
      });
    }

    const { role, content } = parsed.data;

    const message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { 
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // If it's a user message, generate bot response
    if (role === 'user') {
      setTimeout(async () => {
        const botMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          content: `This is a response to: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          timestamp: new Date()
        };

        await Chat.findByIdAndUpdate(chatId, {
          $push: { messages: botMessage },
          $set: { updatedAt: new Date() }
        });
      }, 1000);
    }

    return res.json({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp
    });
  } catch (err) {
    console.error("Error in addMessage:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}