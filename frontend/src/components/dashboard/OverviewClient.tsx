"use client";

import { useDashboardStore, type TimeRange } from "@/stores/dashboardStore";
import {
  useOverview,
  useTimeseries,
  useTrafficSources,
  useTopPages,
} from "@/hooks/useAnalytics";
import { useEffect } from "react";

import { MetricCard } from "./MetricCard";
import { VisitorsChart } from "./VisitorsChart";
import { TrafficSources } from "./TrafficSources";
import { TopPages } from "./TopPages";
import { Spinner } from "@/components/ui/Spinner";
import { formatDuration, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TopPage, TrafficSource } from "@/types/event";

const RANGES: TimeRange[] = ["24h", "7d", "30d", "90d"];

type VisitorsChartData = Parameters<typeof VisitorsChart>[0]["data"];
type ChartItem = VisitorsChartData[number];

function normalizeArray<T>(
  value: unknown,
  possibleKeys: string[] = []
): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;

    if (Array.isArray(objectValue.data)) {
      return objectValue.data as T[];
    }

    for (const key of possibleKeys) {
      if (Array.isArray(objectValue[key])) {
        return objectValue[key] as T[];
      }
    }
  }

  return [];
}

export function OverviewClient({ siteId }: { siteId?: string }) {
  const range = useDashboardStore((state) => state.range);
  const setRange = useDashboardStore((state) => state.setRange);

  const overview = useOverview(siteId, range);
  const timeseries = useTimeseries(siteId, range);
  const sources = useTrafficSources(siteId, range);
  const pages = useTopPages(siteId, range);

  const chartData = normalizeArray<ChartItem>(timeseries.data, [
    "timeseries",
    "series",
  ]);

  const trafficSourceData = normalizeArray<TrafficSource>(sources.data, [
    "sources",
    "trafficSources",
  ]);

  const topPageData = normalizeArray<TopPage>(pages.data, [
    "pages",
    "topPages",
  ]);

  useEffect(() => {

    console.log("ERRORS:", {
      overview: overview.error,
      timeseries: timeseries.error,
      sources: sources.error,
      pages: pages.error,
    });
  }, [
    siteId,
    range,
    overview.data,
    timeseries.data,
    sources.data,
    pages.data,
    overview.error,
    timeseries.error,
    sources.error,
    pages.error,
  ]);

  if (!siteId) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
        Select a site to view analytics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>

        <div className="flex gap-1 rounded-md border bg-card p-1">
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium transition",
                range === item
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      {overview.isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-6 w-6" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Visitors"
            value={formatNumber(overview.data?.uniqueVisitors ?? 0)}
            className="animate-fade-in"
            style={{ animationDelay: "0ms" }}
          />

          <MetricCard
            label="Pageviews"
            value={formatNumber(overview.data?.pageviews ?? 0)}
            className="animate-fade-in"
            style={{ animationDelay: "50ms" }}
          />

          <MetricCard
            label="Bounce rate"
            value={`${(overview.data?.bounceRate ?? 0).toFixed(1)}%`}
            className="animate-fade-in"
            style={{ animationDelay: "100ms" }}
          />

          <MetricCard
            label="Avg. session"
            value={formatDuration(
              overview.data?.avgSessionDuration ?? 0
            )}
            className="animate-fade-in"
            style={{ animationDelay: "150ms" }}
          />
        </div>
      )}

      {/* Visitors Chart */}
      <div
        className="animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        <VisitorsChart
          data={chartData}
          loading={timeseries.isLoading}
        />
      </div>

      {/* Traffic Sources + Top Pages */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          className="animate-fade-in"
          style={{ animationDelay: "250ms" }}
        >
          <TrafficSources data={trafficSourceData} />
        </div>
        <div
          className="animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          <TopPages data={topPageData} />
        </div>
      </div>
    </div>
  );
}