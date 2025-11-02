import { Router } from "express";
import * as AssetCtrl from "../controllers/asset.controller.js";
const r = Router();
r.get("/", AssetCtrl.listMyAssets);
r.post("/", AssetCtrl.createAsset);
export default r;
