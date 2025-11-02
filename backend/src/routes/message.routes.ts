import { Router } from "express";
import * as MsgCtrl from "../controllers/message.controller.js";
const r = Router();

r.get("/:chatId", MsgCtrl.listByChat);
r.post("/:chatId", MsgCtrl.postMessage);

export default r;
