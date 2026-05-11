import { api } from "@/lib/apiClient";

export async function placeOrderApi(data: {
  items: { productId: string; quantity: number }[];
  paymentMethod: "cod" | "upi" | "card";
  deliverySlot: "morning" | "afternoon" | "evening" | "night";
  addressId: string;
  couponCode?: string | null;
  notes?: string | null;
}) {
  const response = await api.post("/api/orders", data);
  return response.data.data;
}
