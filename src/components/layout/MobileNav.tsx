"use client";

import { cn } from "@/lib/utils";
import {
  BarChart2,
  LayoutDashboard,
  MessageSquare,
  Share2,
  Upload,
  Zap,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingest", label: "Ingest", icon: Upload },
  { href: "/query", label: "Query", icon: MessageSquare },
  { href: "/score", label: "Score", icon: Zap },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/share", label: "Share", icon: Share2 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[rgba(8,12,20,0.96)] px-2 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] transition",
                active ? "bg-white/5 text-[var(--accent)]" : "text-[var(--muted)]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="mt-1">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
