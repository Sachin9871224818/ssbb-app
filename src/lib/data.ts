export type Product = {
  id: string;
  name: string;
  qty: string;
  price: number;
  mrp: number;
  emoji: string;
  bg: string;
  imageUrl?: string | null;
  category: string;
  description?: string;
};

export type Category = {
  slug: string;
  name: string;
  emoji: string;
  bg: string;
};

export const categories: Category[] = [
  { slug: "vegetables", name: "Fresh Vegetables", emoji: "🥬", bg: "#E8F5D6" },
  { slug: "fruits", name: "Fresh Fruits", emoji: "🍎", bg: "#FFE0DA" },
  { slug: "dairy", name: "Dairy & Eggs", emoji: "🥛", bg: "#F2EAFE" },
  { slug: "snacks", name: "Snacks & Drinks", emoji: "🍿", bg: "#FFF1C9" },
  { slug: "essentials", name: "Daily Essentials", emoji: "🍚", bg: "#FFE7BD" },
  { slug: "wholesale", name: "Wholesale Bazaar", emoji: "📦", bg: "#FFD9A8" },
  { slug: "household", name: "Household", emoji: "🧴", bg: "#DCEEFF" },
  { slug: "beauty", name: "Beauty & Care", emoji: "💄", bg: "#FFD9EC" },
  { slug: "dryfruits", name: "Dry Fruits", emoji: "🥜", bg: "#F1E1C6" },
];

export const products: Product[] = [
  { id: "p1", name: "Tomato (Local)", qty: "1 kg", price: 28, mrp: 40, emoji: "🍅", bg: "#FFE0DA", category: "vegetables" },
  { id: "p2", name: "Onion", qty: "1 kg", price: 32, mrp: 45, emoji: "🧅", bg: "#FBE3C7", category: "vegetables" },
  { id: "p3", name: "Potato", qty: "1 kg", price: 25, mrp: 35, emoji: "🥔", bg: "#F1E1C6", category: "vegetables" },
  { id: "p4", name: "Green Capsicum", qty: "500 g", price: 45, mrp: 60, emoji: "🫑", bg: "#E8F5D6", category: "vegetables" },
  { id: "p5", name: "Banana Robusta", qty: "6 pcs", price: 38, mrp: 50, emoji: "🍌", bg: "#FFF1C9", category: "fruits" },
  { id: "p6", name: "Royal Apple", qty: "1 kg", price: 149, mrp: 220, emoji: "🍎", bg: "#FFE0DA", category: "fruits" },
  { id: "p7", name: "Pomegranate", qty: "500 g", price: 89, mrp: 120, emoji: "🍇", bg: "#FFD9EC", category: "fruits" },
  { id: "p8", name: "Amul Taaza Milk", qty: "1 L", price: 66, mrp: 70, emoji: "🥛", bg: "#F2EAFE", category: "dairy" },
  { id: "p9", name: "Farm Eggs", qty: "6 pcs", price: 55, mrp: 72, emoji: "🥚", bg: "#FFF1C9", category: "dairy" },
  { id: "p10", name: "Amul Butter", qty: "100 g", price: 58, mrp: 62, emoji: "🧈", bg: "#FFE7BD", category: "dairy" },
  { id: "p11", name: "Lay's Magic Masala", qty: "52 g", price: 18, mrp: 20, emoji: "🍿", bg: "#FFF1C9", category: "snacks" },
  { id: "p12", name: "Coca Cola", qty: "750 ml", price: 40, mrp: 45, emoji: "🥤", bg: "#FFD9DC", category: "snacks" },
  { id: "p13", name: "Parle-G Biscuit", qty: "Pack of 4", price: 40, mrp: 50, emoji: "🍪", bg: "#FFE7BD", category: "snacks" },
  { id: "p14", name: "Aashirvaad Atta", qty: "5 kg", price: 245, mrp: 310, emoji: "🌾", bg: "#FFE7BD", category: "essentials" },
  { id: "p15", name: "India Gate Basmati", qty: "1 kg", price: 119, mrp: 160, emoji: "🍚", bg: "#FFF1C9", category: "essentials" },
  { id: "p16", name: "Fortune Sunflower Oil", qty: "1 L", price: 145, mrp: 175, emoji: "🛢️", bg: "#FFE7BD", category: "essentials" },
  { id: "p17", name: "Wholesale Toor Dal", qty: "10 kg", price: 1290, mrp: 1600, emoji: "🫘", bg: "#FFD9A8", category: "wholesale" },
  { id: "p18", name: "Wholesale Sugar", qty: "25 kg", price: 1090, mrp: 1300, emoji: "🍬", bg: "#FFD9A8", category: "wholesale" },
  { id: "p19", name: "Surf Excel Easy Wash", qty: "1 kg", price: 132, mrp: 165, emoji: "🧺", bg: "#DCEEFF", category: "household" },
  { id: "p20", name: "Vim Dishwash Bar", qty: "300 g", price: 28, mrp: 35, emoji: "🧼", bg: "#DCEEFF", category: "household" },
  { id: "p21", name: "Dove Shampoo", qty: "180 ml", price: 175, mrp: 220, emoji: "🧴", bg: "#FFD9EC", category: "beauty" },
  { id: "p22", name: "Colgate MaxFresh", qty: "150 g", price: 92, mrp: 110, emoji: "🪥", bg: "#DCEEFF", category: "beauty" },
  { id: "p23", name: "Premium Almonds", qty: "500 g", price: 449, mrp: 599, emoji: "🥜", bg: "#F1E1C6", category: "dryfruits" },
  { id: "p24", name: "Cashew W320", qty: "250 g", price: 299, mrp: 410, emoji: "🌰", bg: "#F1E1C6", category: "dryfruits" },
];

export const banners = [
  { id: "b1", title: "Sasta Bhi, Best Bhi", sub: "Up to 40% off on daily essentials", cta: "Shop now", bg: "linear-gradient(135deg,#1a1a1a,#2a2a2a)", fg: "#FFC83D" },
  { id: "b2", title: "Wholesale Bazaar", sub: "Bulk orders at unbeatable prices", cta: "Order in bulk", bg: "linear-gradient(135deg,#FFC83D,#F4A800)", fg: "#1a1a1a" },
  { id: "b3", title: "Free delivery", sub: "On orders above ₹299", cta: "Add more", bg: "linear-gradient(135deg,#22c55e,#15803d)", fg: "#ffffff" },
];

export const slots = [
  { id: "morning", label: "Morning", time: "7 AM – 10 AM", icon: "🌅", capacity: "Available" },
  { id: "afternoon", label: "Afternoon", time: "12 PM – 3 PM", icon: "☀️", capacity: "Filling fast" },
  { id: "evening", label: "Evening", time: "4 PM – 7 PM", icon: "🌇", capacity: "Available" },
  { id: "night", label: "Night", time: "8 PM – 11 PM", icon: "🌙", capacity: "Available" },
] as const;

export const findProduct = (id: string) => products.find((p) => p.id === id);
export const productsByCategory = (slug: string) => products.filter((p) => p.category === slug);
