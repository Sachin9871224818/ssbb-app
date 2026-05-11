import type { Response } from "express";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

const AddressSchema = z.object({
  label: z.string().default("Home"),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  pincode: z.string().min(4).max(10),
  isDefault: z.boolean().optional(),
});

export async function getAddresses(req: AuthRequest, res: Response) {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  res.json({ success: true, message: "Addresses fetched", data: addresses });
}

export async function addAddress(req: AuthRequest, res: Response) {
  const body = AddressSchema.parse(req.body);
  const userId = req.user!.userId;

  if (body.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const existing = await prisma.address.findFirst({ where: { userId } });
  const address = await prisma.address.create({
    data: { ...body, userId, isDefault: body.isDefault ?? !existing },
  });
  res.status(201).json({ success: true, message: "Address saved", data: address });
}

export async function updateAddress(req: AuthRequest, res: Response) {
  const body = AddressSchema.partial().parse(req.body);
  const userId = req.user!.userId;

  const addr = await prisma.address.findFirst({ where: { id: req.params.id, userId } });
  if (!addr) {
    res.status(404).json({ success: false, message: "Address not found" });
    return;
  }

  if (body.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const updated = await prisma.address.update({ where: { id: req.params.id }, data: body });
  res.json({ success: true, message: "Address updated", data: updated });
}

export async function deleteAddress(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const addr = await prisma.address.findFirst({ where: { id: req.params.id, userId } });
  if (!addr) {
    res.status(404).json({ success: false, message: "Address not found" });
    return;
  }
  await prisma.address.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Address deleted" });
}
