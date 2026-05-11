import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Lock, Mail, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — SSBB" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@ssbb.in");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      const { user, accessToken } = data.data;
      if (user.role !== "ADMIN") {
        toast.error("Access denied. Admin only.");
        return;
      }
      localStorage.setItem("admin_token", accessToken);
      localStorage.setItem("admin_user", JSON.stringify(user));
      toast.success("Welcome back, Admin!");
      navigate({ to: "/admin/dashboard" });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400 mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">SSBB Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Shri Shyam Bachat Bazaar</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to continue</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="admin@ssbb.in"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="text-xs text-gray-600 text-center mt-5">
            Default: admin@ssbb.in / Admin@ssbb2024
          </p>
        </div>
      </div>
    </div>
  );
}
