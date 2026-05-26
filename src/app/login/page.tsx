"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonClassName, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back to your brain.");
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <form className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl shadow-black/20" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-lg">
            🧠
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-[var(--white)]">BrandBrain</div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Sign in
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block space-y-2 text-sm text-[var(--muted)]">
            <span>Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              required
            />
          </label>
          <label className="block space-y-2 text-sm text-[var(--muted)]">
            <span>Password</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
        </div>

        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <p className="mt-5 text-center text-sm text-[var(--muted)]">
          No account yet?{" "}
          <Link href="/signup" className="text-[var(--accent)]">
            Create one
          </Link>
        </p>
      </form>
    </main>
  );
}
