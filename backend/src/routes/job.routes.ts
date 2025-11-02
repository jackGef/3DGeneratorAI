import { Router } from "express";
import * as JobCtrl from "../controllers/job.controller.js";
const r = Router();

r.get("/", JobCtrl.listMyJobs);
r.post("/", JobCtrl.createJob);
r.get("/:id", JobCtrl.getJob);
r.patch("/:id", JobCtrl.updateJobStatus);

export default r;
