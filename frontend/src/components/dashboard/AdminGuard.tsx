"use client";

import { useAuth } from "@/hooks/useAuth";
import { FullPageSpinner } from "@/components/ui/Spinner";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  if (!isAdmin) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Access denied</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You need administrator privileges to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}