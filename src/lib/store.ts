import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./data";

export type CartItem = { product: Product; qty: number };

type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
};

type SlotId = "morning" | "afternoon" | "evening" | "night";

type State = {
  cart: Record<string, CartItem>;
  addresses: Address[];
  selectedAddressId: string | null;
  selectedSlot: SlotId | null;
  wishlist: Record<string, Product>;
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  addAddress: (a: Address) => void;
  selectAddress: (id: string) => void;
  setSlot: (s: SlotId) => void;
  toggleWishlist: (p: Product) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      cart: {},
      wishlist: {},
      addresses: [
        { id: "a1", label: "Home", line1: "B-12, Rajokri Road", line2: "Near Metro Pillar 14", city: "New Delhi", pincode: "110038" },
      ],
      selectedAddressId: "a1",
      selectedSlot: null,
      add: (p) =>
        set((s) => {
          const existing = s.cart[p.id];
          return { cart: { ...s.cart, [p.id]: { product: p, qty: (existing?.qty ?? 0) + 1 } } };
        }),
      remove: (id) =>
        set((s) => {
          const c = { ...s.cart };
          delete c[id];
          return { cart: c };
        }),
      setQty: (id, qty) =>
        set((s) => {
          if (qty <= 0) {
            const c = { ...s.cart };
            delete c[id];
            return { cart: c };
          }
          const existing = s.cart[id];
          if (!existing) return s;
          return { cart: { ...s.cart, [id]: { ...existing, qty } } };
        }),
      clear: () => set({ cart: {} }),
      addAddress: (a) => set((s) => ({ addresses: [...s.addresses, a], selectedAddressId: a.id })),
      selectAddress: (id) => set({ selectedAddressId: id }),
      setSlot: (s) => set({ selectedSlot: s }),
      toggleWishlist: (p) =>
        set((s) => {
          const w = { ...s.wishlist };
          if (w[p.id]) { delete w[p.id]; } else { w[p.id] = p; }
          return { wishlist: w };
        }),
    }),
    { name: "ssbb-store" }
  )
);

export const cartTotals = (cart: Record<string, CartItem>) => {
  const items = Object.values(cart);
  const itemsCount = items.reduce((a, c) => a + c.qty, 0);
  const subtotal = items.reduce((a, c) => a + c.product.price * c.qty, 0);
  const mrp = items.reduce((a, c) => a + c.product.mrp * c.qty, 0);
  const savings = mrp - subtotal;
  const delivery = subtotal >= 299 || subtotal === 0 ? 0 : 25;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + gst;
  return { items, itemsCount, subtotal, mrp, savings, delivery, gst, total };
};
