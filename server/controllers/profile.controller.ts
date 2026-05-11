import type { Response } from "express";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";
import { hashPassword, comparePassword } from "../lib/password.js";

const UpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

function safeUser(u: any) {
  const { password: _, ...rest } = u;
  return rest;
}

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
      _count: { select: { orders: true, addresses: true } },
    },
  });
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  res.json({ success: true, message: "Profile fetched", data: safeUser(user) });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const body = UpdateSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: body,
  });
  res.json({ success: true, message: "Profile updated", data: safeUser(user) });
}

export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user || !(await comparePassword(currentPassword, user.password))) {
    res.status(400).json({ success: false, message: "Current password is incorrect" });
    return;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(newPassword) },
  });
  res.json({ success: true, message: "Password changed successfully" });
}
