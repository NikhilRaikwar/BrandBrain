"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/shared/BrandMark";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
    toast.success("Password reset link sent.");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(26,107,60,0.10),_transparent_32%),linear-gradient(180deg,var(--cream)_0%,#f7f2e8_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <form
          className="w-full rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-10"
          onSubmit={handleSubmit}
        >
          <BrandMark size={42} />
          <h1 className="mt-8 font-display text-4xl font-bold text-[var(--ink)]">Reset your password</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--ink3)]">
            Enter your BrandBrain email and we&apos;ll send a secure reset link.
          </p>

          <div className="mt-8 space-y-4">
            <label className="block space-y-2 text-sm text-[var(--muted)]">
              <span>Email</span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@agency.com"
                required
                disabled={sent}
              />
            </label>
          </div>

          {sent ? (
            <div className="mt-5 rounded-[14px] border border-[var(--green-border)] bg-[var(--green-bg)] p-4 text-sm leading-7 text-[var(--green)]">
              Reset link sent. Open your email, click the link, and set a new password.
            </div>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={loading || sent}>
            {loading ? "Sending..." : sent ? "Reset link sent" : "Send Reset Link"}
          </Button>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            Remember your password?{" "}
            <Link href="/login" className="text-[var(--accent)]">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
