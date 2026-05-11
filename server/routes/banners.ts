import { Router } from "express";
import { getBanners } from "../controllers/banners.controller.js";

const router = Router();

router.get("/", getBanners);

export default router;
