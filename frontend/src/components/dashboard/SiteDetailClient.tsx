"use client";

import { useSite } from "@/hooks/useSites";
import { OverviewClient } from "./OverviewClient";
import { Spinner } from "@/components/ui/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export function SiteDetailClient({ siteId }: { siteId: string }) {
  const { data: site, isLoading } = useSite(siteId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
        Site not found.
      </div>
    );
  }

 const snippet = `<script defer src="${typeof window !== "undefined" ? window.location.origin : ""}/track.js" data-site="${site.trackingKey}"></script>`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{site.name}</h1>
        <Badge variant="secondary">{site.domain}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tracking snippet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Paste this just before <code>&lt;/head&gt;</code> on every page.
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-md border bg-muted px-4 py-3 text-xs">
              <code>{snippet}</code>
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(snippet);
                toast.success("Copied");
              }}
              className="absolute right-2 top-2 rounded-md border bg-card px-2 py-1 text-xs hover:bg-accent"
            >
              Copy
            </button>
          </div>
        </CardContent>
      </Card>

      <OverviewClient siteId={site.id} />
    </div>
  );
}