import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AuthLayout({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="flex min-h-screen">
        <Sidebar userEmail={userEmail} />
        <main className="min-w-0 flex-1 pb-24 md:pb-0">
          <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
