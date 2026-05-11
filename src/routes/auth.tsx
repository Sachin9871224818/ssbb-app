import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Lock, User as UserIcon, Phone, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const Search = z.object({ next: z.string().optional() }).partial();

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => Search.parse(s),
  head: () => ({ meta: [{ title: "Sign in — Shri Shyam Bachat Bazaar" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate({ to: (next as any) || "/" });
    return null;
  }

  const submit = async () => {
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(name, email, password, phone || undefined);
        toast.success("Account created! Welcome to Shri Shyam Bachat Bazaar.");
        navigate({ to: (next as any) || "/" });
      } else {
        await signIn(email, password);
        toast.success("Welcome back!");
        navigate({ to: (next as any) || "/" });
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary text-secondary-foreground">
      <div className="flex flex-1 flex-col px-6 pb-8 pt-16">
        <Link to="/" className="self-start text-[11px] font-bold uppercase tracking-widest text-secondary-foreground/60">← Skip</Link>
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Shri Shyam Bachat Bazaar</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight">Sasta Bhi,<br/>Best Bhi.</h1>
          <p className="mt-2 text-sm text-secondary-foreground/70">{mode === "signin" ? "Welcome back. Sign in to continue." : "Create your account in seconds."}</p>
        </div>

        <div className="mt-8 space-y-3">
          {mode === "signup" && (
            <>
              <Field icon={<UserIcon className="h-4 w-4" />} placeholder="Full name" value={name} onChange={setName} />
              <Field icon={<Phone className="h-4 w-4" />} placeholder="Mobile number" value={phone} onChange={setPhone} type="tel" />
            </>
          )}
          <Field icon={<Mail className="h-4 w-4" />} placeholder="Email address" value={email} onChange={setEmail} type="email" />
          <Field icon={<Lock className="h-4 w-4" />} placeholder="Password" value={password} onChange={setPassword} type="password" />

          <button
            onClick={submit}
            disabled={loading || !email || !password || (mode === "signup" && !name)}
            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground mustard-shadow disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-secondary-foreground/40">
          <span className="h-px flex-1 bg-white/10" /> Or continue with <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <a href="https://wa.me/919728640896" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-success py-3 text-sm font-bold text-success-foreground">
            <MessageCircle className="h-4 w-4" /> Order via WhatsApp
          </a>
        </div>

        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 text-center text-xs text-secondary-foreground/70">
          {mode === "signin" ? "New here? " : "Already have an account? "}
          <span className="font-bold text-primary">{mode === "signin" ? "Create an account" : "Sign in"}</span>
        </button>

        <p className="mt-auto pt-6 text-center text-[10px] uppercase tracking-widest text-secondary-foreground/40">Powered by SK Digitaltech</p>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 backdrop-blur">
      <span className="text-secondary-foreground/50">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-sm text-secondary-foreground outline-none placeholder:text-secondary-foreground/40"
      />
    </div>
  );
}
