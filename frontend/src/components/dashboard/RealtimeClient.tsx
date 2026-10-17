"use client";

import { useEffect } from "react";
import { useSites } from "@/hooks/useSites";
import { useSiteStore } from "@/stores/siteStore";
import { LiveFeed } from "./LiveFeed";
import { Spinner } from "@/components/ui/Spinner";

export function RealtimeClient() {
  const { data: sites, isLoading } = useSites();
  const selectedSiteId = useSiteStore((s) => s.selectedSiteId);
  const setSelectedSite = useSiteStore((s) => s.setSelectedSite);

  useEffect(() => {
    if (!selectedSiteId && sites && sites.length > 0) {
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

  const siteId = selectedSiteId ?? sites?.[0]?.id;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Real-time</h1>
      <div className="grid grid-cols-1 gap-4">
        <LiveFeed siteId={siteId} />
      </div>
    </div>
  );
}