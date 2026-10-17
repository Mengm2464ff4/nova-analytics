"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Radio,
  Search,
  FileText,
  Settings,
  Shield,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStore } from "@/stores/dashboardStore";

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const mobileMenuOpen = useDashboardStore((s) => s.mobileMenuOpen);
  const closeMobileMenu = useDashboardStore((s) => s.closeMobileMenu);

  const NAV = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/sites", label: "Sites", icon: Globe },
    { href: "/dashboard/realtime", label: "Real-time", icon: Radio },
    { href: "/dashboard/query", label: "Query", icon: Search },
    { href: "/dashboard/reports", label: "Reports", icon: FileText },
    ...(isAdmin
      ? [{ href: "/dashboard/admin", label: "Admin", icon: Shield }]
      : []),
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop with fade animation */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Sidebar with slide animation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 shrink-0 border-r bg-card",
          "transition-transform duration-300 ease-out",
          "md:static md:translate-x-0 md:flex md:flex-col",
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b px-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <Link
              href="/dashboard"
              className="font-semibold"
              onClick={closeMobileMenu}
            >
              Nova Analytics
            </Link>
          </div>
          <button
            onClick={closeMobileMenu}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {NAV.map(({ href, label, icon: Icon }, index) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobileMenu}
                style={{
                  animationDelay: mobileMenuOpen ? `${index * 30}ms` : "0ms",
                }}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                  "hover:translate-x-0.5",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  mobileMenuOpen && "animate-fade-in"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    "group-hover:scale-110"
                  )}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}