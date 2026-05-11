import type { Response } from "express";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }
  return cart;
}

function mapCart(cart: any) {
  return {
    ...cart,
    items: cart.items.map((item: any) => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
        mrp: Number(item.product.mrp),
      },
    })),
  };
}

export async function getCart(req: AuthRequest, res: Response) {
  const cart = await getOrCreateCart(req.user!.userId);
  res.json({ success: true, message: "Cart fetched", data: mapCart(cart) });
}

export async function addToCart(req: AuthRequest, res: Response) {
  const { productId, quantity = 1 } = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99).optional(),
  }).parse(req.body);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.inStock) {
    res.status(404).json({ success: false, message: "Product not found or out of stock" });
    return;
  }

  const cart = await getOrCreateCart(req.user!.userId);

  const existing = cart.items.find((i: any) => i.productId === productId);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + (quantity ?? 1) },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: quantity ?? 1 },
    });
  }

  const updated = await getOrCreateCart(req.user!.userId);
  res.json({ success: true, message: "Added to cart", data: mapCart(updated) });
}

export async function updateCartItem(req: AuthRequest, res: Response) {
  const { quantity } = z.object({ quantity: z.number().int().min(0).max(99) }).parse(req.body);
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
  if (!cart) {
    res.status(404).json({ success: false, message: "Cart not found" });
    return;
  }

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { id: req.params.itemId, cartId: cart.id } });
  } else {
    await prisma.cartItem.updateMany({
      where: { id: req.params.itemId, cartId: cart.id },
      data: { quantity },
    });
  }

  const updated = await getOrCreateCart(req.user!.userId);
  res.json({ success: true, message: "Cart updated", data: mapCart(updated) });
}

export async function removeFromCart(req: AuthRequest, res: Response) {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
  if (!cart) {
    res.status(404).json({ success: false, message: "Cart not found" });
    return;
  }
  await prisma.cartItem.deleteMany({ where: { id: req.params.itemId, cartId: cart.id } });
  const updated = await getOrCreateCart(req.user!.userId);
  res.json({ success: true, message: "Item removed", data: mapCart(updated) });
}

export async function clearCart(req: AuthRequest, res: Response) {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
  res.json({ success: true, message: "Cart cleared" });
}
