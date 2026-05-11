import type { Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import type { AuthRequest } from "./auth.js";

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    if (payload.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
