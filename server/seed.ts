import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding Shri Shyam Bachat Bazaar database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.deliverySlot.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const categories = await prisma.category.createMany({
    data: [
      { slug: "vegetables", name: "Fresh Vegetables", emoji: "🥬", bg: "#E8F5D6", sortOrder: 1 },
      { slug: "fruits",     name: "Fresh Fruits",     emoji: "🍎", bg: "#FFE0DA", sortOrder: 2 },
      { slug: "dairy",      name: "Dairy & Eggs",     emoji: "🥛", bg: "#F2EAFE", sortOrder: 3 },
      { slug: "snacks",     name: "Snacks & Drinks",  emoji: "🍿", bg: "#FFF1C9", sortOrder: 4 },
      { slug: "essentials", name: "Daily Essentials", emoji: "🍚", bg: "#FFE7BD", sortOrder: 5 },
      { slug: "wholesale",  name: "Wholesale Bazaar", emoji: "📦", bg: "#FFD9A8", sortOrder: 6 },
      { slug: "household",  name: "Household",        emoji: "🧴", bg: "#DCEEFF", sortOrder: 7 },
      { slug: "beauty",     name: "Beauty & Care",    emoji: "💄", bg: "#FFD9EC", sortOrder: 8 },
      { slug: "dryfruits",  name: "Dry Fruits",       emoji: "🥜", bg: "#F1E1C6", sortOrder: 9 },
    ],
  });
  console.log(`✅ Created ${categories.count} categories`);

  const catMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id])
  );

  const products = await prisma.product.createMany({
    data: [
      { name: "Tomato (Local)",        qty: "1 kg",       price: 28,   mrp: 40,   emoji: "🍅", bg: "#FFE0DA", categoryId: catMap.vegetables, isBestseller: true },
      { name: "Onion",                 qty: "1 kg",       price: 32,   mrp: 45,   emoji: "🧅", bg: "#FBE3C7", categoryId: catMap.vegetables, isBestseller: true },
      { name: "Potato",                qty: "1 kg",       price: 25,   mrp: 35,   emoji: "🥔", bg: "#F1E1C6", categoryId: catMap.vegetables },
      { name: "Green Capsicum",        qty: "500 g",      price: 45,   mrp: 60,   emoji: "🫑", bg: "#E8F5D6", categoryId: catMap.vegetables },
      { name: "Banana Robusta",        qty: "6 pcs",      price: 38,   mrp: 50,   emoji: "🍌", bg: "#FFF1C9", categoryId: catMap.fruits,     isBestseller: true },
      { name: "Royal Apple",           qty: "1 kg",       price: 149,  mrp: 220,  emoji: "🍎", bg: "#FFE0DA", categoryId: catMap.fruits },
      { name: "Pomegranate",           qty: "500 g",      price: 89,   mrp: 120,  emoji: "🍇", bg: "#FFD9EC", categoryId: catMap.fruits },
      { name: "Amul Taaza Milk",       qty: "1 L",        price: 66,   mrp: 70,   emoji: "🥛", bg: "#F2EAFE", categoryId: catMap.dairy,      isBestseller: true },
      { name: "Farm Eggs",             qty: "6 pcs",      price: 55,   mrp: 72,   emoji: "🥚", bg: "#FFF1C9", categoryId: catMap.dairy },
      { name: "Amul Butter",           qty: "100 g",      price: 58,   mrp: 62,   emoji: "🧈", bg: "#FFE7BD", categoryId: catMap.dairy },
      { name: "Lay's Magic Masala",    qty: "52 g",       price: 18,   mrp: 20,   emoji: "🍿", bg: "#FFF1C9", categoryId: catMap.snacks },
      { name: "Coca Cola",             qty: "750 ml",     price: 40,   mrp: 45,   emoji: "🥤", bg: "#FFD9DC", categoryId: catMap.snacks },
      { name: "Parle-G Biscuit",       qty: "Pack of 4",  price: 40,   mrp: 50,   emoji: "🍪", bg: "#FFE7BD", categoryId: catMap.snacks },
      { name: "Aashirvaad Atta",       qty: "5 kg",       price: 245,  mrp: 310,  emoji: "🌾", bg: "#FFE7BD", categoryId: catMap.essentials,  isBestseller: true },
      { name: "India Gate Basmati",    qty: "1 kg",       price: 119,  mrp: 160,  emoji: "🍚", bg: "#FFF1C9", categoryId: catMap.essentials },
      { name: "Fortune Sunflower Oil", qty: "1 L",        price: 145,  mrp: 175,  emoji: "🛢️", bg: "#FFE7BD", categoryId: catMap.essentials },
      { name: "Wholesale Toor Dal",    qty: "10 kg",      price: 1290, mrp: 1600, emoji: "🫘", bg: "#FFD9A8", categoryId: catMap.wholesale },
      { name: "Wholesale Sugar",       qty: "25 kg",      price: 1090, mrp: 1300, emoji: "🍬", bg: "#FFD9A8", categoryId: catMap.wholesale },
      { name: "Surf Excel Easy Wash",  qty: "1 kg",       price: 132,  mrp: 165,  emoji: "🧺", bg: "#DCEEFF", categoryId: catMap.household },
      { name: "Vim Dishwash Bar",      qty: "300 g",      price: 28,   mrp: 35,   emoji: "🧼", bg: "#DCEEFF", categoryId: catMap.household },
      { name: "Dove Shampoo",          qty: "180 ml",     price: 175,  mrp: 220,  emoji: "🧴", bg: "#FFD9EC", categoryId: catMap.beauty },
      { name: "Colgate MaxFresh",      qty: "150 g",      price: 92,   mrp: 110,  emoji: "🪥", bg: "#DCEEFF", categoryId: catMap.beauty },
      { name: "Premium Almonds",       qty: "500 g",      price: 449,  mrp: 599,  emoji: "🥜", bg: "#F1E1C6", categoryId: catMap.dryfruits },
      { name: "Cashew W320",           qty: "250 g",      price: 299,  mrp: 410,  emoji: "🌰", bg: "#F1E1C6", categoryId: catMap.dryfruits },
    ],
  });
  console.log(`✅ Created ${products.count} products`);

  await prisma.banner.createMany({
    data: [
      { title: "Sasta Bhi, Best Bhi",  sub: "Up to 40% off on daily essentials",  cta: "Shop now",      bg: "linear-gradient(135deg,#1a1a1a,#2a2a2a)", fg: "#FFC83D", sortOrder: 1 },
      { title: "Wholesale Bazaar",      sub: "Bulk orders at unbeatable prices",    cta: "Order in bulk", bg: "linear-gradient(135deg,#FFC83D,#F4A800)", fg: "#1a1a1a", sortOrder: 2 },
      { title: "Free delivery",         sub: "On orders above ₹299",               cta: "Add more",      bg: "linear-gradient(135deg,#22c55e,#15803d)", fg: "#ffffff",  sortOrder: 3 },
    ],
  });
  console.log("✅ Created banners");

  await prisma.coupon.createMany({
    data: [
      { code: "BACHAT50", description: "Save up to ₹50 on your order", discount: 10, maxDiscount: 50, minOrder: 0,   isPercent: true },
      { code: "FIRST100", description: "₹100 off on first order",       discount: 100, minOrder: 299,               isPercent: false },
      { code: "SAVE20",   description: "20% off on orders above ₹500",  discount: 20, maxDiscount: 200, minOrder: 500, isPercent: true },
    ],
  });
  console.log("✅ Created coupons");

  await prisma.deliverySlot.createMany({
    data: [
      { slotKey: "morning",   label: "Morning",   time: "7 AM – 10 AM",  icon: "🌅", capacity: "Available",    sortOrder: 1 },
      { slotKey: "afternoon", label: "Afternoon", time: "10 AM – 1 PM",  icon: "☀️", capacity: "Filling fast", sortOrder: 2 },
      { slotKey: "evening",   label: "Evening",   time: "4 PM – 7 PM",   icon: "🌇", capacity: "Available",    sortOrder: 3 },
      { slotKey: "night",     label: "Night",     time: "7 PM – 10 PM",  icon: "🌙", capacity: "Available",    sortOrder: 4 },
    ],
  });
  console.log("✅ Created delivery slots");

  const demoPassword = await bcrypt.hash("demo1234", 12);
  const demoUser = await prisma.user.create({
    data: {
      name: "Nikku Yadav",
      email: "demo@ssbb.in",
      phone: "+91 9871224818",
      password: demoPassword,
      addresses: {
        create: {
          label: "Home",
          line1: "B-12, Rajokri Road",
          line2: "Near Metro Pillar 14",
          city: "New Delhi",
          pincode: "110038",
          isDefault: true,
        },
      },
    },
  });
  console.log(`✅ Created demo user: ${demoUser.email} (password: demo1234)`);
  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => Promise.all([prisma.$disconnect(), pool.end()]));
