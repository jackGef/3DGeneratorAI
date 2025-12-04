import { Request, Response } from "express";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { z } from "zod";

function now() {return new Date()}

const postMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]).default("user"),
  type: z.enum(["text", "image", "file", "event"]).default("text"),
  content: z.string().default(""),
  attachments: z.array(z.object({
    assetId: z.string(),
    kind: z.string(),
    url: z.string()
  })).optional().default([]),
});

export async function listByChat(req: Request, res: Response) {
    try {
        const { chatId } = req.params
        const page = Number(req.query.page ?? 1)
        const limit = Math.min(Number(req.query.limit ?? 50), 200)
        const msgs = await Message.find({ chatId })
            .sort({ createdAt: -1 })
            .skip((page -1) * limit)
            .limit(limit)
        res.json(msgs.reverse())
    } catch (error) {
        res.status(500).json({ error: 'Failed to list messages' });
    }
}

export async function postMessage(req: Request, res: Response) {
    try {
        const parsed = postMessageSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
        }

        const { chatId } = req.params
        const { role, type, content, attachments } = parsed.data;
        const msg = await Message.create({ chatId, role, type, content, attachments });
        await Chat.findByIdAndUpdate(chatId, {
            $inc: { messageCount: 1 },
            $set: { lastMessageAt: now(), preview: content.slice(0, 140) }
        });
        res.status(201).json(msg);
    } catch (error) {
        res.status(500).json({ error: 'Failed to post message' });
    }
}