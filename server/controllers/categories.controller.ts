import type { Request, Response } from "express";
import { prisma } from "../prisma.js";

export async function getCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  res.json({ success: true, message: "Categories fetched", data: categories });
}

export async function getCategoryBySlug(req: Request, res: Response) {
  const category = await prisma.category.findUnique({
    where: { slug: req.params.slug },
    include: {
      products: {
        where: { inStock: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!category) {
    res.status(404).json({ success: false, message: "Category not found" });
    return;
  }
  res.json({ success: true, message: "Category fetched", data: category });
}
