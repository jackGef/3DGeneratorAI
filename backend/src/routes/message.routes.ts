import { Router } from "express";
import * as MsgCtrl from "../controllers/message.controller.js";
import { requireAuth } from "../middleware/auth.js";
const r = Router();

// All message routes require authentication
r.use(requireAuth);

r.get("/:chatId", MsgCtrl.listByChat);
r.post("/:chatId", MsgCtrl.postMessage);

export default r;
