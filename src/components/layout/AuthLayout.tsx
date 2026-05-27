"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";

export function AuthLayout({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <div className="flex min-h-screen">
        <Sidebar userEmail={userEmail} open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="main-shell min-w-0 pb-24 md:pb-0">
          <div className="topbar">
            <button className="hamburger" type="button" onClick={() => setMobileOpen((open) => !open)}>
              <Menu className="h-5 w-5" />
            </button>
            <BrandMark size={28} showName={false} />
          </div>
          <div className="w-full">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
