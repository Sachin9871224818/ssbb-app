import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

type Ctx = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ssbb_token") : null;
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.data);
    } catch {
      localStorage.removeItem("ssbb_token");
      localStorage.removeItem("ssbb_refresh");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, []);

  const signIn = async (email: string, password: string) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    const { user: u, accessToken, refreshToken } = data.data;
    localStorage.setItem("ssbb_token", accessToken);
    localStorage.setItem("ssbb_refresh", refreshToken);
    setUser(u);
  };

  const signUp = async (name: string, email: string, password: string, phone?: string) => {
    const { data } = await api.post("/api/auth/register", { name, email, password, phone });
    const { user: u, accessToken, refreshToken } = data.data;
    localStorage.setItem("ssbb_token", accessToken);
    localStorage.setItem("ssbb_refresh", refreshToken);
    setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem("ssbb_token");
    localStorage.removeItem("ssbb_refresh");
    setUser(null);
    toast.success("Logged out");
  };

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser: loadUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
