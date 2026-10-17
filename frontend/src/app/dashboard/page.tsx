"use client";

import { useEffect } from "react";
import { useSites } from "@/hooks/useSites";
import { useSiteStore } from "@/stores/siteStore";
import { OverviewClient } from "@/components/dashboard/OverviewClient";
import { Spinner } from "@/components/ui/Spinner";

export default function DashboardPage() {
  const { data: sites, isLoading } = useSites();
  const selectedSiteId = useSiteStore((s) => s.selectedSiteId);
  const setSelectedSite = useSiteStore((s) => s.setSelectedSite);

  // Auto-select the first site if none is selected OR the selected one doesn't exist
  useEffect(() => {
    if (!sites || sites.length === 0) return;

    const stillValid =
      selectedSiteId && sites.some((s) => s.id === selectedSiteId);

    if (!stillValid) {
      setSelectedSite(sites[0].id);
    }
  }, [sites, selectedSiteId, setSelectedSite]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!sites || sites.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">No sites yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first site to start collecting analytics.
        </p>
      </div>
    );
  }

  return <OverviewClient siteId={selectedSiteId ?? sites[0].id} />;
}