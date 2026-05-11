import { Router } from "express";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "../controllers/addresses.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", getAddresses);
router.post("/", addAddress);
router.patch("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
