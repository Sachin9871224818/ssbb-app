import { Router } from "express";
import { applyCoupon } from "../controllers/coupons.controller.js";

const router = Router();

router.post("/apply", applyCoupon);

export default router;
