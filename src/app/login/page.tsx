"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buttonClassName, Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/shared/BrandMark";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,84,26,0.10),_transparent_32%),linear-gradient(180deg,var(--cream)_0%,#f7f2e8_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.65)] p-8 shadow-[0_20px_70px_rgba(26,21,16,0.12)] backdrop-blur md:block lg:p-10">
            <BrandMark size={48} />
            <h1 className="mt-8 max-w-xl font-display text-5xl leading-tight text-[var(--ink)]">
              Your agency&apos;s memory, ready when you need it.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--ink3)]">
              Sign in to query your company brain, score copy against your own history, and keep every client
              insight in one living system.
            </p>
          </section>

          <form
            className="w-full rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-10"
            onSubmit={handleSubmit}
          >
            <div className="md:hidden">
              <BrandMark size={32} />
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
        </div>
      </div>
    </main>
  );
}
