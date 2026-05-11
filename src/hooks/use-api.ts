import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export type ApiProduct = {
  id: string;
  name: string;
  qty: string;
  price: number;
  mrp: number;
  emoji: string | null;
  bg: string | null;
  inStock: boolean;
  isBestseller: boolean;
  description: string | null;
  categoryId: string | null;
  category?: { slug: string; name: string } | null;
};

export type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  bg: string | null;
  sortOrder: number;
  products?: ApiProduct[];
};

export type ApiBanner = {
  id: string;
  title: string;
  sub: string | null;
  cta: string | null;
  bg: string | null;
  fg: string | null;
};

export type ApiSlot = {
  id: string;
  slotKey: string;
  label: string;
  time: string;
  icon: string | null;
  capacity: string;
};

export type ApiAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  pincode: string;
  isDefault: boolean;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  status: string;
  deliverySlot: string;
  paymentMethod: string;
  subtotal: number;
  gst: number;
  deliveryFee: number;
  discount: number;
  total: number;
  createdAt: string;
  addressSnapshot: any;
  items: {
    id: string;
    name: string;
    qtyLabel: string;
    emoji: string | null;
    bg: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
};

function unwrap<T>(res: any): T {
  return res.data.data as T;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/api/categories").then(unwrap<ApiCategory[]>),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryProducts(slug: string) {
  return useQuery({
    queryKey: ["categories", slug],
    queryFn: () => api.get(`/api/categories/${slug}`).then(unwrap<ApiCategory>),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProducts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api.get("/api/products", { params }).then(unwrap<ApiProduct[]>),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => api.get(`/api/products/${id}`).then(unwrap<ApiProduct>),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useProductSearch(q: string) {
  return useQuery({
    queryKey: ["products", "search", q],
    queryFn: () => api.get("/api/products/search", { params: { q } }).then(unwrap<ApiProduct[]>),
    enabled: q.trim().length > 0,
    staleTime: 30 * 1000,
  });
}

export function useOffers() {
  return useQuery({
    queryKey: ["products", "offers"],
    queryFn: () => api.get("/api/products/offers").then(unwrap<ApiProduct[]>),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => api.get("/api/banners").then(unwrap<ApiBanner[]>),
    staleTime: 10 * 60 * 1000,
  });
}

export function useSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: () => api.get("/api/slots").then(unwrap<ApiSlot[]>),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.get("/api/address").then(unwrap<ApiAddress[]>),
    staleTime: 0,
  });
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ApiAddress, "id" | "isDefault">) =>
      api.post("/api/address", data).then(unwrap<ApiAddress>),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get("/api/orders").then(unwrap<ApiOrder[]>),
    staleTime: 0,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => api.get(`/api/orders/${id}`).then(unwrap<ApiOrder>),
    enabled: !!id,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/api/profile").then(unwrap<any>),
    staleTime: 0,
  });
}
