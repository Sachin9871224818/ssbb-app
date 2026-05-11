import { supabase } from "@/integrations/supabase/client";

export type DbCategory = {
  id: string; slug: string; name: string; emoji: string | null; bg: string | null; sort_order: number;
};
export type DbProduct = {
  id: string; category_id: string | null; name: string; qty: string;
  price: number; mrp: number; emoji: string | null; bg: string | null;
  in_stock: boolean; description: string | null;
};

export async function fetchCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data as DbCategory[];
}

export async function fetchProducts(): Promise<DbProduct[]> {
  const { data, error } = await supabase.from("products").select("*").order("created_at");
  if (error) throw error;
  return (data as any[]).map((p) => ({ ...p, price: Number(p.price), mrp: Number(p.mrp) })) as DbProduct[];
}

export async function fetchProduct(id: string): Promise<DbProduct | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, price: Number(data.price), mrp: Number(data.mrp) } as DbProduct;
}

export async function fetchMyAddresses() {
  const { data, error } = await supabase.from("addresses").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function fetchMyOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}
