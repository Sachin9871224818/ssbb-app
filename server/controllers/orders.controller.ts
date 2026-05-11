import type { Response } from "express";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

const PlaceOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1),
  paymentMethod: z.enum(["cod", "upi", "card"]).default("cod"),
  deliverySlot: z.enum(["morning", "afternoon", "evening", "night"]),
  addressId: z.string().uuid(),
  couponCode: z.string().max(40).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

function generateOrderNumber(): string {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `SSBB${rand}`;
}

function mapOrder(order: any) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    gst: Number(order.gst),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    items: order.items?.map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      unitMrp: Number(item.unitMrp),
      lineTotal: Number(item.lineTotal),
    })),
  };
}

export async function placeOrder(req: AuthRequest, res: Response) {
  const body = PlaceOrderSchema.parse(req.body);
  const userId = req.user!.userId;

  const productIds = body.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    res.status(400).json({ success: false, message: "One or more products not found" });
    return;
  }

  const address = await prisma.address.findFirst({ where: { id: body.addressId, userId } });
  if (!address) {
    res.status(400).json({ success: false, message: "Address not found" });
    return;
  }

  let subtotal = 0;
  const orderItems = body.items.map((i) => {
    const p = products.find((x) => x.id === i.productId)!;
    const lineTotal = Number(p.price) * i.quantity;
    subtotal += lineTotal;
    return {
      productId: p.id,
      name: p.name,
      qtyLabel: p.qty,
      emoji: p.emoji,
      bg: p.bg,
      unitPrice: Number(p.price),
      unitMrp: Number(p.mrp),
      quantity: i.quantity,
      lineTotal,
    };
  });

  let couponDiscount = 0;
  if (body.couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: body.couponCode, isActive: true },
    });
    if (coupon && subtotal >= coupon.minOrder) {
      if (coupon.isPercent) {
        couponDiscount = Math.round(subtotal * (coupon.discount / 100));
      } else {
        couponDiscount = coupon.discount;
      }
      if (coupon.maxDiscount) {
        couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
      }
    }
  }

  const gst = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const total = subtotal + gst + deliveryFee - couponDiscount;

  let orderNumber = generateOrderNumber();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await prisma.order.findUnique({ where: { orderNumber } });
    if (!exists) break;
    orderNumber = generateOrderNumber();
    attempts++;
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      addressId: address.id,
      addressSnapshot: address as any,
      paymentMethod: body.paymentMethod,
      deliverySlot: body.deliverySlot,
      subtotal,
      gst,
      deliveryFee,
      discount: couponDiscount,
      total,
      couponCode: body.couponCode ?? null,
      notes: body.notes ?? null,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  await prisma.cartItem.deleteMany({
    where: { cart: { userId }, productId: { in: productIds } },
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: mapOrder(order),
  });
}

export async function getOrders(req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json({ success: true, message: "Orders fetched", data: orders.map(mapOrder) });
}

export async function getOrder(req: AuthRequest, res: Response) {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { items: true, address: true },
  });
  if (!order) {
    res.status(404).json({ success: false, message: "Order not found" });
    return;
  }
  res.json({ success: true, message: "Order fetched", data: mapOrder(order) });
}
