import { Router } from "express";
import { getProducts, getProduct, searchProducts, getOffers } from "../controllers/products.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/offers", getOffers);
router.get("/:id", getProduct);

export default router;
