import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAdmin } from "../middleware/adminAuth.js";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ok = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.originalname);
    cb(null, ok);
    if (!ok) cb(new Error("Only image files are allowed"));
  },
});

const router = Router();

router.post("/", requireAdmin, upload.single("image"), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

export default router;
