import type { Request, Response } from "express";
import { prisma } from "../prisma.js";

export async function getSlots(_req: Request, res: Response) {
  const slots = await prisma.deliverySlot.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  res.json({ success: true, message: "Slots fetched", data: slots });
}
