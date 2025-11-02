import { Router } from "express";
import { sendEmailHandler } from "../controllers/email.controller.js";

const r = Router();

r.post("/", sendEmailHandler);

export default r;