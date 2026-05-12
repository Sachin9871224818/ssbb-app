import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";

export async function listCoupons(_req: Request, res: Response) {
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
  res.json({ success: true, data: coupons });
}

const ApplySchema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().positive(),
});

export async function applyCoupon(req: Request, res: Response) {
  const { code, subtotal } = ApplySchema.parse(req.body);

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
      isActive: true,
    },
  });

  if (!coupon) {
    res.status(404).json({ success: false, message: "Invalid or expired coupon" });
    return;
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    res.status(400).json({ success: false, message: "Coupon has expired" });
    return;
  }

  if (subtotal < coupon.minOrder) {
    res.status(400).json({
      success: false,
      message: `Minimum order ₹${coupon.minOrder} required for this coupon`,
    });
    return;
  }

  let discount = coupon.isPercent
    ? Math.round(subtotal * (coupon.discount / 100))
    : coupon.discount;

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  res.json({
    success: true,
    message: "Coupon applied",
    data: {
      code: coupon.code,
      description: coupon.description,
      discount,
      finalTotal: subtotal - discount,
    },
  });
}
