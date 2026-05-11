import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const email = "admin@ssbb.in";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
    console.log(`✅ Updated ${email} to ADMIN`);
  } else {
    const password = await bcrypt.hash("Admin@ssbb2024", 12);
    await prisma.user.create({
      data: { name: "SSBB Admin", email, password, role: "ADMIN" },
    });
    console.log(`✅ Created admin: ${email} / Admin@ssbb2024`);
  }
}

main()
  .catch((e) => { console.error("❌", e); process.exit(1); })
  .finally(() => Promise.all([prisma.$disconnect(), pool.end()]));
