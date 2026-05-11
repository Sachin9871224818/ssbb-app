import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "ssbb-jwt-secret-change-in-production";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "ssbb-refresh-secret-change-in-production";

export type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
}
