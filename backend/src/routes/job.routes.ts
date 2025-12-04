import { Router } from "express";
import * as JobCtrl from "../controllers/job.controller.js";
import { requireAuth } from "../middleware/auth.js";
const r = Router();

// All job routes require authentication
r.use(requireAuth);

r.get("/", JobCtrl.listMyJobs);
r.post("/", JobCtrl.createJob);
r.get("/:id", JobCtrl.getJob);
r.patch("/:id", JobCtrl.updateJobStatus);
r.post("/:id/cancel", JobCtrl.cancelJob);

export default r;
