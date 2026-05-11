import type { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { hashPassword, comparePassword } from "../lib/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.js";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function safeUser(u: any) {
  const { password: _, ...rest } = u;
  return rest;
}

export async function register(req: Request, res: Response) {
  const body = RegisterSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) {
    res.status(409).json({ success: false, message: "Email already registered" });
    return;
  }
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: await hashPassword(body.password),
    },
  });
  const payload = { userId: user.id, email: user.email, role: user.role };
  res.status(201).json({
    success: true,
    message: "Account created",
    data: {
      user: safeUser(user),
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    },
  });
}

export async function login(req: Request, res: Response) {
  const body = LoginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await comparePassword(body.password, user.password))) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }
  const payload = { userId: user.id, email: user.email, role: user.role };
  res.json({
    success: true,
    message: "Login successful",
    data: {
      user: safeUser(user),
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    },
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, message: "Refresh token required" });
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }
    const newPayload = { userId: user.id, email: user.email, role: user.role };
    res.json({
      success: true,
      data: {
        accessToken: signAccessToken(newPayload),
        refreshToken: signRefreshToken(newPayload),
      },
    });
  } catch {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }
  res.json({ success: true, data: safeUser(user) });
}

export async function logout(_req: Request, res: Response) {
  res.json({ success: true, message: "Logged out" });
}
