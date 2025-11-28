import { Router } from "express";
import * as ChatCtrl from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All chat routes require authentication
router.use(requireAuth);

// GET /api/chats - Get all chats for the user
router.get("/", ChatCtrl.getUserChats);

// GET /api/chats/:chatId - Get a specific chat with messages
router.get("/:chatId", ChatCtrl.getChat);

// POST /api/chats - Create a new chat
router.post("/", ChatCtrl.createChat);

// PATCH /api/chats/:chatId - Update chat (title, pin status)
router.patch("/:chatId", ChatCtrl.updateChat);

// DELETE /api/chats/:chatId - Delete a chat
router.delete("/:chatId", ChatCtrl.deleteChat);

// POST /api/chats/:chatId/messages - Add a message to a chat
router.post("/:chatId/messages", ChatCtrl.addMessage);

export default router;