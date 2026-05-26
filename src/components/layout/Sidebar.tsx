"use client";

import { cn } from "@/lib/utils";
import {
  BarChart2,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Share2,
  Upload,
  Zap,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingest", label: "Ingest", icon: Upload },
  { href: "/query", label: "Query", icon: MessageSquare },
  { href: "/score", label: "Score", icon: Zap },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/share", label: "Share", icon: Share2 },
];

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="hidden h-screen w-[240px] flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5 md:flex lg:w-[240px]">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/5 text-lg">
          🧠
        </div>
        <div className="min-w-0">
          <div className="font-display text-xl font-bold text-[var(--white)]">BrandBrain</div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Company Brain
          </div>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl border-l-2 px-3 py-3 text-sm transition",
                active
                  ? "border-l-[var(--accent)] bg-white/5 text-[var(--white)]"
                  : "border-l-transparent text-[var(--muted)] hover:bg-white/5 hover:text-[var(--white)]"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-[var(--accent)]" : "")} />
              <span className="hidden lg:inline">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-4">
        <div className="rounded-xl border border-[var(--border)] bg-white/5 px-3 py-3">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Signed in</div>
          <div className="mt-1 break-words text-xs text-[var(--white)]">{userEmail}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm text-[var(--white)] transition hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
