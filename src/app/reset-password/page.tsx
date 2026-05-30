"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/shared/BrandMark";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const errorDescription = params.get("error_description");
    if (errorDescription) {
      setLinkError(errorDescription.replace(/\+/g, " "));
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setComplete(true);
    toast.success("Password updated.");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,84,26,0.10),_transparent_32%),linear-gradient(180deg,var(--cream)_0%,#f7f2e8_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <form
          className="w-full rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-10"
          onSubmit={handleSubmit}
        >
          <BrandMark size={42} />
          <h1 className="mt-8 font-display text-4xl font-bold text-[var(--ink)]">Create a new password</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--ink3)]">
            Set a new password for your BrandBrain account.
          </p>

          {linkError ? (
            <div className="mt-6 rounded-[14px] border border-[rgba(192,57,26,0.22)] bg-[rgba(192,57,26,0.08)] p-4 text-sm leading-7 text-[#c0391a]">
              {linkError}
            </div>
          ) : null}

          <div className="mt-8 space-y-4">
            <label className="block space-y-2 text-sm text-[var(--muted)]">
              <span>New Password</span>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                disabled={complete}
              />
            </label>
            <label className="block space-y-2 text-sm text-[var(--muted)]">
              <span>Confirm Password</span>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                required
                disabled={complete}
              />
            </label>
          </div>

          {complete ? (
            <div className="mt-5 rounded-[14px] border border-[var(--green-border)] bg-[var(--green-bg)] p-4 text-sm leading-7 text-[var(--green)]">
              Password updated. You can now sign in with your new password.
            </div>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={loading || complete}>
            {loading ? "Updating..." : complete ? "Password Updated" : "Update Password"}
          </Button>

          <p className="mt-5 text-center text-sm text-[var(--muted)]">
            <Link href="/login" className="text-[var(--accent)]">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
