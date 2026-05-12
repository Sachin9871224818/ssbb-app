import { Router } from "express";
import { applyCoupon, listCoupons } from "../controllers/coupons.controller.js";

const router = Router();

router.get("/", listCoupons);
router.post("/apply", applyCoupon);

export default router;
