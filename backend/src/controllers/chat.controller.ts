import { Request, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import Chat from "../models/chat.model.js";
import type { Types } from 'mongoose';
import axios from 'axios';

interface ModelData {
  modelId: string;
  glbUrl: string;
  objUrl: string;
  plyUrl: string;
  mtlUrl: string;
}

interface ChatDocument {
  _id: Types.ObjectId;
  title: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'text' | '3d-model';
    modelData?: ModelData;
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

// Get model server URL from environment
const MODEL_SERVER_URL = process.env.MODEL_SERVER_URL || 'http://localhost:5000';
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || 'http://localhost:8081';

// Function to generate 3D model via model-server
async function generate3DModel(chatId: string, prompt: string) {
  try {
    console.log(`Generating 3D model for prompt: "${prompt}"`);
    
    // Call model-server to generate 3D model
    const response = await axios.post(`${MODEL_SERVER_URL}/generate3D`, {
      prompt,
      guidanceScale: 15.0,
      steps: 64,
      frameSize: 256
    }, {
      timeout: 300000 // 5 minutes timeout for model generation
    });

    const { id: modelId } = response.data;
    
    if (!modelId) {
      throw new Error('Model server did not return a model ID');
    }

    console.log(`3D model generated successfully: ${modelId}`);

    // Construct URLs for the generated files
    const modelData: ModelData = {
      modelId,
      glbUrl: `${PUBLIC_BASE_URL}/data/assets/${modelId}/mesh.glb`,
      objUrl: `${PUBLIC_BASE_URL}/data/assets/${modelId}/mesh.obj`,
      plyUrl: `${PUBLIC_BASE_URL}/data/assets/${modelId}/mesh.ply`,
      mtlUrl: `${PUBLIC_BASE_URL}/data/assets/${modelId}/mesh.mtl`
    };

    // Create assistant message with 3D model
    const botMessage = {
      id: uuidv4(),
      role: 'assistant' as const,
      content: `I've generated a 3D model based on your prompt: "${prompt}"`,
      timestamp: new Date(),
      type: '3d-model' as const,
      modelData
    };

    // Add the bot message to the chat
    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: botMessage },
      $set: { updatedAt: new Date() }
    });

    console.log(`3D model message added to chat ${chatId}`);
  } catch (error) {
    console.error('Error generating 3D model:', error);
    throw error;
  }
}

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

    // If it's a user message, generate 3D model
    if (role === 'user') {
      // Don't wait - generate model asynchronously
      generate3DModel(chatId, content).catch(err => {
        console.error('Failed to generate 3D model:', err);
        // Send error message to chat
        const errorMessage = {
          id: uuidv4(),
          role: 'assistant' as const,
          content: 'Sorry, I encountered an error generating the 3D model. Please try again.',
          timestamp: new Date(),
          type: 'text' as const
        };
        Chat.findByIdAndUpdate(chatId, {
          $push: { messages: errorMessage },
          $set: { updatedAt: new Date() }
        }).catch(console.error);
      });
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