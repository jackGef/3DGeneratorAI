import { Router } from "express";
import * as UserCtrl from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

// Public routes (for now - in production you might want to restrict these too)
r.post("/", UserCtrl.createUser);

// Protected routes
r.get("/", requireAuth, UserCtrl.listUsers);
r.get("/:email", requireAuth, UserCtrl.getUserByEmail);
r.get("/id/:id", requireAuth, UserCtrl.getUserById);
r.patch("/:id", requireAuth, UserCtrl.updateUserById);
r.delete("/:id", requireAuth, UserCtrl.deleteUserById);

export default r;