import { Router } from "express";
import authRouter from "./auth.routes.js";

const r = Router();

r.use("/", authRouter);

export default r;