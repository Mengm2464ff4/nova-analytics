"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  variant?: "default" | "landing";
};

export function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: server doesn't know the theme yet
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-9 w-9" aria-hidden />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    // <button
    //   type="button"
    //   onClick={() => setTheme(isDark ? "light" : "dark")}
    //   className={cn(
    //     "inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
    //     variant === "landing"
    //       ? "border border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
    //       : "text-muted-foreground hover:bg-accent hover:text-foreground"
    //   )}
    //   aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    //   title={isDark ? "Switch to light" : "Switch to dark"}
    // >
    //   {isDark ? (
    //     <Sun className="h-4 w-4" />
    //   ) : (
    //     <Moon className="h-4 w-4" />
    //   )}
    // </button>
    <button
  onClick={() => setTheme(isDark ? "light" : "dark")}
  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 active:scale-90"
  aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
>
  {isDark ? (
    <Sun className="h-4 w-4 animate-in fade-in zoom-in-50 duration-200" />
  ) : (
    <Moon className="h-4 w-4 animate-in fade-in zoom-in-50 duration-200" />
  )}
</button>
  );
}