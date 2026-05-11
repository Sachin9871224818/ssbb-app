import type { Request, Response } from "express";
import { prisma } from "../prisma.js";

export async function getBanners(_req: Request, res: Response) {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  res.json({ success: true, message: "Banners fetched", data: banners });
}
