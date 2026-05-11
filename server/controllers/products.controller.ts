import type { Request, Response } from "express";
import { prisma } from "../prisma.js";

function mapProduct(p: any) {
  return {
    ...p,
    price: Number(p.price),
    mrp: Number(p.mrp),
  };
}

export async function getProducts(req: Request, res: Response) {
  const { category, search, bestseller, offers, limit = "50", offset = "0" } = req.query as Record<string, string>;

  const where: any = { inStock: true };
  if (bestseller === "true") where.isBestseller = true;
  if (offers === "true") where.NOT = { mrp: { equals: prisma.product.fields.price } };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: { select: { slug: true, name: true } } },
    orderBy: { createdAt: "asc" },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  res.json({ success: true, message: "Products fetched", data: products.map(mapProduct) });
}

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: { select: { slug: true, name: true } } },
  });
  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }
  res.json({ success: true, message: "Product fetched", data: mapProduct(product) });
}

export async function searchProducts(req: Request, res: Response) {
  const q = (req.query.q as string) || "";
  if (!q.trim()) {
    res.json({ success: true, data: [] });
    return;
  }
  const products = await prisma.product.findMany({
    where: {
      inStock: true,
      name: { contains: q.trim(), mode: "insensitive" },
    },
    include: { category: { select: { slug: true } } },
    take: 30,
  });
  res.json({ success: true, message: "Search results", data: products.map(mapProduct) });
}

export async function getOffers(_req: Request, res: Response) {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    include: { category: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });
  const offers = products
    .filter((p) => Number(p.mrp) - Number(p.price) >= 30)
    .slice(0, 10)
    .map(mapProduct);
  res.json({ success: true, message: "Offers fetched", data: offers });
}
