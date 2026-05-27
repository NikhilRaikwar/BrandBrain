"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/shared/BrandMark";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const confirmed = window.confirm(
      "Create your BrandBrain account with this email?"
    );
    if (!confirmed) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Check your email to continue.");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(26,107,60,0.10),_transparent_32%),linear-gradient(180deg,var(--cream)_0%,#f7f2e8_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.65)] p-8 shadow-[0_20px_70px_rgba(26,21,16,0.12)] backdrop-blur md:block lg:p-10">
            <BrandMark size={48} />
            <h1 className="mt-8 max-w-xl font-display text-5xl leading-tight text-[var(--ink)]">
              Turn every campaign into reusable agency memory.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--ink3)]">
              Create your account to start ingesting briefs, querying knowledge, and scoring copy with your
              own judgment layer.
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="mt-5 text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--accent)]">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
