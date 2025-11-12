import { Router } from "express";
import * as ChatCtrl from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { createLimiter } from "../middleware/rateLimiter.js";

const r = Router();

// All chat routes require authentication
r.use(requireAuth);

r.get("/", ChatCtrl.listMyChats);
r.post("/", createLimiter, ChatCtrl.createChat);
r.get("/:id", ChatCtrl.getChatById);
r.patch("/:id", ChatCtrl.updateChatById);
r.delete("/:id", ChatCtrl.deleteChatById);

export default r;