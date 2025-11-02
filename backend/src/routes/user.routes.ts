import { Router } from "express";
import * as UserCtrl from "../controllers/user.controller.js";

const r = Router();

r.post("/", UserCtrl.createUser);
r.get("/", UserCtrl.listUsers);
r.get("/:email", UserCtrl.getUserByEmail);
r.get("/id/:id", UserCtrl.getUserById);
r.patch("/:id", UserCtrl.updateUserById);
r.delete("/:id", UserCtrl.deleteUserById);

export default r;