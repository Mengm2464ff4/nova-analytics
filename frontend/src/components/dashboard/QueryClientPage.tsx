"use client";

import { useState } from "react";
import { useSites } from "@/hooks/useSites";
import { useSiteStore } from "@/stores/siteStore";
import { useQueryRun } from "@/hooks/useAnalytics";
import {
  QueryBuilder,
  type QuerySpec,
} from "@/components/dashboard/QueryBuilder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

interface QueryResult {
  columns: string[];
  rows: Array<Record<string, string | number>>;
}

export function QueryClientPage() {
  const { data: sites, isLoading } = useSites();
  const selectedSiteId = useSiteStore((s) => s.selectedSiteId);
  const setSelectedSite = useSiteStore((s) => s.setSelectedSite);
  const run = useQueryRun();
  const [result, setResult] = useState<QueryResult | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const siteId = selectedSiteId ?? sites?.[0]?.id;

  if (!siteId) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
        Create a site first.
      </div>
    );
  }

  // ✅ siteId is now narrowed to `string` in this scope.
  // Capture it in a new const so the closure keeps the narrowed type.
  const resolvedSiteId: string = siteId;

  async function handleRun(spec: QuerySpec) {
    const data = await run.mutateAsync({ siteId: resolvedSiteId, spec });
    setResult(data as QueryResult);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Query builder</h1>

      <QueryBuilder onRun={handleRun} loading={run.isPending} />

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {result.rows.length === 0 ? (
              <p className="px-6 py-6 text-sm text-muted-foreground">No rows.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {result.columns.map((c) => (
                      <th
                        key={c}
                        className="px-4 py-2 text-left font-medium text-muted-foreground"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {result.columns.map((c) => (
                        <td key={c} className="px-4 py-2 tabular-nums">
                          {String(row[c] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}