import { Router } from "express";
import * as ChatCtrl from "../controllers/chat.controller.js";

const r = Router();

r.get("/", ChatCtrl.listMyChats);
r.post("/", ChatCtrl.createChat);
r.get("/:id", ChatCtrl.getChatById);
r.patch("/:id", ChatCtrl.updateChatById);
r.delete("/:id", ChatCtrl.deleteChatById);

export default r;