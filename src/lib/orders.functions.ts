import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PlaceOrderInput = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(100),
  paymentMethod: z.enum(["cod", "upi", "card"]),
  deliverySlot: z.enum(["morning", "afternoon", "evening", "night"]),
  addressId: z.string().uuid(),
  couponCode: z.string().max(40).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PlaceOrderInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const productIds = data.items.map((i) => i.productId);
    const { data: products, error: prodErr } = await supabase
      .from("products").select("*").in("id", productIds);
    if (prodErr) throw new Error(prodErr.message);
    if (!products || products.length !== productIds.length) throw new Error("One or more products not found");

    const { data: address, error: addrErr } = await supabase
      .from("addresses").select("*").eq("id", data.addressId).maybeSingle();
    if (addrErr) throw new Error(addrErr.message);
    if (!address) throw new Error("Address not found");

    let subtotal = 0;
    const items = data.items.map((i) => {
      const p = products.find((x) => x.id === i.productId)!;
      const lineTotal = Number(p.price) * i.quantity;
      subtotal += lineTotal;
      return {
        product_id: p.id, name: p.name, qty_label: p.qty, emoji: p.emoji, bg: p.bg,
        unit_price: p.price, unit_mrp: p.mrp, quantity: i.quantity, line_total: lineTotal,
      };
    });

    const discount = data.couponCode === "BACHAT50" ? Math.min(50, Math.round(subtotal * 0.1)) : 0;
    const gst = Math.round(subtotal * 0.05);
    const delivery_fee = subtotal >= 299 ? 0 : 25;
    const total = subtotal + gst + delivery_fee - discount;

    const { data: order, error: orderErr } = await supabase
      .from("orders").insert({
        user_id: userId,
        payment_method: data.paymentMethod,
        delivery_slot: data.deliverySlot,
        address_snapshot: address,
        subtotal, gst, delivery_fee, discount, total,
        coupon_code: data.couponCode ?? null,
        notes: data.notes ?? null,
      }).select().single();
    if (orderErr) throw new Error(orderErr.message);

    const { error: itemsErr } = await supabase
      .from("order_items").insert(items.map((it) => ({ ...it, order_id: order.id })));
    if (itemsErr) throw new Error(itemsErr.message);

    return { orderId: order.id, orderNumber: order.order_number };
  });
