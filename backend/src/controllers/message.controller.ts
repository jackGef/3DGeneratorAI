import { Request, Response } from "express";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";

function now() {return new Date()}

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
        const { chatId } = req.params
        const { role = "user", type = "text", content = "", attachments = [] } = req.body
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