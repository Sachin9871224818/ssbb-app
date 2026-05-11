import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";

// ── helpers ──────────────────────────────────────────────────────────────────
function mapProduct(p: any) {
  return { ...p, price: Number(p.price), mrp: Number(p.mrp) };
}
function mapOrder(o: any) {
  return {
    ...o,
    subtotal: Number(o.subtotal),
    gst: Number(o.gst),
    deliveryFee: Number(o.deliveryFee),
    discount: Number(o.discount),
    total: Number(o.total),
    items: o.items?.map((i: any) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      unitMrp: Number(i.unitMrp),
      lineTotal: Number(i.lineTotal),
    })),
  };
}

// ── STATS ─────────────────────────────────────────────────────────────────────
export async function getStats(_req: Request, res: Response) {
  const [totalOrders, totalCustomers, totalProducts, revenueAgg, pendingOrders, todayOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
    ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue: Number(revenueAgg._sum.total ?? 0),
      pendingOrders,
      todayOrders,
    },
  });
}

// ── ANALYTICS ────────────────────────────────────────────────────────────────
export async function getAnalytics(_req: Request, res: Response) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
    select: { createdAt: true, total: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  // Revenue by day
  const byDay: Record<string, { revenue: number; orders: number }> = {};
  orders.forEach((o) => {
    const day = o.createdAt.toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { revenue: 0, orders: 0 };
    byDay[day].revenue += Number(o.total);
    byDay[day].orders += 1;
  });
  const revenueByDay = Object.entries(byDay).map(([date, v]) => ({ date, ...v }));

  // Orders by status
  const allOrders = await prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });
  const byStatus = allOrders.map((s) => ({ status: s.status, count: s._count.status }));

  // Top products
  const topProducts = await prisma.orderItem.groupBy({
    by: ["name"],
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: 5,
  });

  res.json({
    success: true,
    data: {
      revenueByDay,
      byStatus,
      topProducts: topProducts.map((p) => ({
        name: p.name,
        quantity: p._sum.quantity ?? 0,
        revenue: Number(p._sum.lineTotal ?? 0),
      })),
    },
  });
}

// ── ORDERS ───────────────────────────────────────────────────────────────────
export async function getOrders(req: Request, res: Response) {
  const { status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (status && status !== "ALL") where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, data: orders.map(mapOrder), total, page: parseInt(page) });
}

const StatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
});

export async function updateOrderStatus(req: Request, res: Response) {
  const { status } = StatusSchema.parse(req.body);
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found" });
    return;
  }
  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
  });
  res.json({ success: true, message: "Order status updated", data: mapOrder(updated) });
}

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
const ProductSchema = z.object({
  name: z.string().min(2).max(120),
  qty: z.string().min(1).max(30),
  price: z.number().min(0),
  mrp: z.number().min(0),
  emoji: z.string().optional().nullable(),
  bg: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  inStock: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  categoryId: z.string().uuid().optional().nullable(),
});

export async function adminGetProducts(req: Request, res: Response) {
  const { search, category, page = "1", limit = "50" } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (category) where.categoryId = category;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, slug: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ success: true, data: products.map(mapProduct), total });
}

export async function createProduct(req: Request, res: Response) {
  const body = ProductSchema.parse(req.body);
  const product = await prisma.product.create({
    data: body,
    include: { category: { select: { id: true, slug: true, name: true } } },
  });
  res.status(201).json({ success: true, message: "Product created", data: mapProduct(product) });
}

export async function updateProduct(req: Request, res: Response) {
  const body = ProductSchema.partial().parse(req.body);
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: body,
    include: { category: { select: { id: true, slug: true, name: true } } },
  });
  res.json({ success: true, message: "Product updated", data: mapProduct(product) });
}

export async function deleteProduct(req: Request, res: Response) {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Product deleted" });
}

// ── CATEGORIES ───────────────────────────────────────────────────────────────
const CategorySchema = z.object({
  slug: z.string().min(2).max(40).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(60),
  emoji: z.string().optional().nullable(),
  bg: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function adminGetCategories(_req: Request, res: Response) {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  res.json({ success: true, data: cats });
}

export async function createCategory(req: Request, res: Response) {
  const body = CategorySchema.parse(req.body);
  const cat = await prisma.category.create({ data: body });
  res.status(201).json({ success: true, message: "Category created", data: cat });
}

export async function updateCategory(req: Request, res: Response) {
  const body = CategorySchema.partial().parse(req.body);
  const cat = await prisma.category.update({ where: { id: req.params.id }, data: body });
  res.json({ success: true, message: "Category updated", data: cat });
}

export async function deleteCategory(req: Request, res: Response) {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Category deleted" });
}

// ── BANNERS ──────────────────────────────────────────────────────────────────
const BannerSchema = z.object({
  title: z.string().min(2).max(80),
  sub: z.string().optional().nullable(),
  cta: z.string().optional().nullable(),
  bg: z.string().optional().nullable(),
  fg: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function adminGetBanners(_req: Request, res: Response) {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
  res.json({ success: true, data: banners });
}

export async function createBanner(req: Request, res: Response) {
  const body = BannerSchema.parse(req.body);
  const banner = await prisma.banner.create({ data: body });
  res.status(201).json({ success: true, message: "Banner created", data: banner });
}

export async function updateBanner(req: Request, res: Response) {
  const body = BannerSchema.partial().parse(req.body);
  const banner = await prisma.banner.update({ where: { id: req.params.id }, data: body });
  res.json({ success: true, message: "Banner updated", data: banner });
}

export async function deleteBanner(req: Request, res: Response) {
  await prisma.banner.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Banner deleted" });
}

// ── COUPONS ──────────────────────────────────────────────────────────────────
const CouponSchema = z.object({
  code: z.string().min(2).max(40).toUpperCase(),
  description: z.string().optional().nullable(),
  discount: z.number().int().min(1),
  maxDiscount: z.number().int().optional().nullable(),
  minOrder: z.number().int().default(0),
  isPercent: z.boolean().default(true),
  isActive: z.boolean().default(true),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function adminGetCoupons(_req: Request, res: Response) {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: coupons });
}

export async function createCoupon(req: Request, res: Response) {
  const body = CouponSchema.parse(req.body);
  const coupon = await prisma.coupon.create({
    data: { ...body, expiresAt: body.expiresAt ? new Date(body.expiresAt) : null },
  });
  res.status(201).json({ success: true, message: "Coupon created", data: coupon });
}

export async function updateCoupon(req: Request, res: Response) {
  const body = CouponSchema.partial().parse(req.body);
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: { ...body, expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined },
  });
  res.json({ success: true, message: "Coupon updated", data: coupon });
}

export async function deleteCoupon(req: Request, res: Response) {
  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Coupon deleted" });
}

// ── CUSTOMERS ────────────────────────────────────────────────────────────────
export async function getCustomers(req: Request, res: Response) {
  const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = { role: "CUSTOMER" };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, phone: true, createdAt: true,
        _count: { select: { orders: true, addresses: true } },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, data: customers, total });
}

// ── DELIVERY SLOTS ───────────────────────────────────────────────────────────
const SlotSchema = z.object({
  slotKey: z.string().min(2).max(30),
  label: z.string().min(2).max(30),
  time: z.string().min(2).max(40),
  icon: z.string().optional().nullable(),
  capacity: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function adminGetSlots(_req: Request, res: Response) {
  const slots = await prisma.deliverySlot.findMany({ orderBy: { sortOrder: "asc" } });
  res.json({ success: true, data: slots });
}

export async function createSlot(req: Request, res: Response) {
  const body = SlotSchema.parse(req.body);
  const slot = await prisma.deliverySlot.create({ data: body });
  res.status(201).json({ success: true, message: "Slot created", data: slot });
}

export async function updateSlot(req: Request, res: Response) {
  const body = SlotSchema.partial().parse(req.body);
  const slot = await prisma.deliverySlot.update({ where: { id: req.params.id }, data: body });
  res.json({ success: true, message: "Slot updated", data: slot });
}

export async function deleteSlot(req: Request, res: Response) {
  await prisma.deliverySlot.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Slot deleted" });
}
