"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { BarChart2, LayoutDashboard, LogOut, MessageSquare, Share2, Upload, Zap } from "lucide-react";
import { BrandMark } from "@/components/shared/BrandMark";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Main" },
  { href: "/ingest", label: "Ingest", icon: Upload, section: "Brain" },
  { href: "/query", label: "Query", icon: MessageSquare, section: "Brain" },
  { href: "/score", label: "Score Copy", icon: Zap, section: "Brain" },
  { href: "/analytics", label: "Analytics", icon: BarChart2, section: "Workspace" },
  { href: "/share", label: "Share Brain", icon: Share2, section: "Workspace" },
];

type SidebarProps = {
  userEmail: string;
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ userEmail, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className={cn("sidebar-shell", open ? "open" : "")}>
      <div className="sidebar-logo">
        <BrandMark size={34} />
      </div>

      <div className="nav-section">Main</div>
      {navItems
        .filter((item) => item.section === "Main")
        .map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn("nav-item", active && "active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

      <div className="nav-section">Brain</div>
      {navItems
        .filter((item) => item.section === "Brain")
        .map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn("nav-item", active && "active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

      <div className="nav-section">Workspace</div>
      {navItems
        .filter((item) => item.section === "Workspace")
        .map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn("nav-item", active && "active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-label">Signed in</div>
          <div className="user-email">{userEmail}</div>
        </div>
        <button type="button" onClick={handleLogout} className="logout-btn">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
