import { Router } from "express";
import * as AuthCtrl from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

r.post("/register", AuthCtrl.startRegistration);


r.post("/login", AuthCtrl.login);


r.post("/refresh", AuthCtrl.refreshAccessToken);


r.post("/logout", AuthCtrl.logout);

r.get("/me", requireAuth, AuthCtrl.getMe);

r.post("/register/verify", AuthCtrl.completeRegistration);
r.post("/register/resend", AuthCtrl.resendVerification);
r.post("/request-password-reset", AuthCtrl.requestPasswordReset);
r.post("/reset-password", AuthCtrl.resetPassword);

export default r;