import axios from "axios";

const BASE_URL =
  (typeof window !== "undefined"
    ? import.meta.env.VITE_API_URL
    : process.env.VITE_API_URL) ?? "";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("ssbb_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = typeof window !== "undefined"
        ? localStorage.getItem("ssbb_refresh")
        : null;
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = data.data;
          localStorage.setItem("ssbb_token", accessToken);
          localStorage.setItem("ssbb_refresh", newRefresh);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api(error.config);
        } catch {
          localStorage.removeItem("ssbb_token");
          localStorage.removeItem("ssbb_refresh");
        }
      }
    }
    return Promise.reject(error);
  }
);

export function apiSuccess<T>(res: any): T {
  return res.data.data as T;
}
