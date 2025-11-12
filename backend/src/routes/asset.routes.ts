import { Router } from "express";
import * as AssetCtrl from "../controllers/asset.controller.js";
import { requireAuth } from "../middleware/auth.js";
const r = Router();

// All asset routes require authentication
r.use(requireAuth);

r.get("/", AssetCtrl.listMyAssets);
r.post("/", AssetCtrl.createAsset);
export default r;
