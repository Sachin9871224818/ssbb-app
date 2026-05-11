import { Router } from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import {
  getStats, getAnalytics,
  getOrders, updateOrderStatus,
  adminGetProducts, createProduct, updateProduct, deleteProduct,
  adminGetCategories, createCategory, updateCategory, deleteCategory,
  adminGetBanners, createBanner, updateBanner, deleteBanner,
  adminGetCoupons, createCoupon, updateCoupon, deleteCoupon,
  getCustomers,
  adminGetSlots, createSlot, updateSlot, deleteSlot,
} from "../controllers/admin.controller.js";

const router = Router();
router.use(requireAdmin);

// Stats & Analytics
router.get("/stats", getStats);
router.get("/analytics", getAnalytics);

// Orders
router.get("/orders", getOrders);
router.put("/orders/:id/status", updateOrderStatus);

// Products
router.get("/products", adminGetProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Categories
router.get("/categories", adminGetCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// Banners
router.get("/banners", adminGetBanners);
router.post("/banners", createBanner);
router.put("/banners/:id", updateBanner);
router.delete("/banners/:id", deleteBanner);

// Coupons
router.get("/coupons", adminGetCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);

// Customers
router.get("/customers", getCustomers);

// Slots
router.get("/slots", adminGetSlots);
router.post("/slots", createSlot);
router.put("/slots/:id", updateSlot);
router.delete("/slots/:id", deleteSlot);

export default router;
