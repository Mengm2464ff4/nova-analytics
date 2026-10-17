"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User as UserIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { AppUser } from "@/types/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useDashboardStore } from "@/stores/dashboardStore";

function Avatar({
  src,
  name,
}: {
  src?: string | null;
  name?: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && src.trim() !== "" && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        className="h-7 w-7 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
      <UserIcon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

export function Header({
  user,
}: {
  user:
    | AppUser
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMobileMenu = useDashboardStore((s) => s.toggleMobileMenu);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileMenu}
          className="rounded-md p-2 hover:bg-accent md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden text-sm text-muted-foreground md:inline">
          Live analytics for your sites
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
          >
            <Avatar src={user.image} name={user.name} />
            <span className="hidden text-sm font-medium sm:inline">
              {user.name ?? user.email}
            </span>
          </button>

          {menuOpen && (
            <div
              onMouseLeave={() => setMenuOpen(false)}
              className="absolute right-0 top-full z-30 mt-2 w-56 rounded-md border bg-card p-2 shadow-lg"
            >
              <div className="border-b px-2 py-2">
                <p className="truncate text-sm font-medium">
                  {user.name ?? "Account"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <div className="px-2 py-2">
                <Badge variant="secondary">Pro plan</Badge>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}