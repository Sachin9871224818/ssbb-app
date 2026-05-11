import { Router } from "express";
import { placeOrder, getOrders, getOrder } from "../controllers/orders.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/", placeOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);

export default router;
