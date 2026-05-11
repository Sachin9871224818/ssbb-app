import axios from "axios";

export const adminApi = axios.create({
  baseURL: typeof window !== "undefined" ? import.meta.env.VITE_API_URL ?? "" : "",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

export function unwrap<T>(res: any): T {
  return res.data.data as T;
}
