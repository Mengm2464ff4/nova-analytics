"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ApiClientError } from "@/lib/api";
import { useAuth } from "./useAuth";
import type {
  OverviewMetrics,
  TimeseriesPoint,
  TrafficSource,
  TopPage,
} from "@/types/event";
import type { QuerySpec } from "@/components/dashboard/QueryBuilder";

export type Range = "24h" | "7d" | "30d" | "90d";

const keys = {
  all: ["analytics"] as const,

overview: (siteId: string, range: Range) =>
    [...keys.all, "overview", siteId, range] as const,

timeseries: (siteId: string, range: Range) =>
    [...keys.all, "timeseries", siteId, range] as const,

sources: (siteId: string, range: Range) =>
    [...keys.all, "sources", siteId, range] as const,

pages: (siteId: string, range: Range) =>
    [...keys.all, "pages", siteId, range] as const,
};

function qs(range: Range) {
  return { range } as const;
}

/**
 * Converts API responses such as:
 *
 * [...]
 * { data: [...] }
 * { sources: [...] }
 * { trafficSources: [...] }
 * { pages: [...] }
 * { topPages: [...] }
 * { data: { sources: [...] } }
 *
 * into a plain array.
 */
function extractArray<T>(
  response: unknown,
  keysToSearch: string[]
): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

if (!response || typeof response !== "object") {
    return [];
  }

const objectResponse = response as Record<string, unknown>;

// Search the expected property names first.
  for (const key of keysToSearch) {
    if (key in objectResponse) {
      const result = extractArray<T>(
        objectResponse[key],
        keysToSearch
      );

if (result.length > 0) {
        return result;
      }
    }
  }

// Common API wrapper.
  if ("data" in objectResponse) {
    const result = extractArray<T>(
      objectResponse.data,
      keysToSearch
    );

if (result.length > 0) {
      return result;
    }
  }

// Search nested response objects.
  for (const value of Object.values(objectResponse)) {
    if (value && typeof value === "object") {
      const result = extractArray<T>(value, keysToSearch);

if (result.length > 0) {
        return result;
      }
    }
  }

return [];
}

// ---------- fetchers ----------

async function fetchOverview(
  token: string | null,
  siteId: string,
  range: Range
): Promise<OverviewMetrics> {
  return api.get<OverviewMetrics>("/analytics/overview", {
    token,
    query: { siteId, ...qs(range) },
  });
}

async function fetchTimeseries(
  token: string | null,
  siteId: string,
  range: Range
): Promise<TimeseriesPoint[]> {
  const response = await api.get<unknown>("/analytics/timeseries", {
    token,
    query: { siteId, ...qs(range) },
  });

return extractArray<TimeseriesPoint>(response, [
    "timeseries",
    "series",
    "points",
  ]);
}

async function fetchSources(
  token: string | null,
  siteId: string,
  range: Range
): Promise<TrafficSource[]> {
  const response = await api.get<unknown>("/analytics/sources", {
    token,
    query: { siteId, ...qs(range) },
  });

return extractArray<TrafficSource>(response, [
    "sources",
    "trafficSources",
  ]);
}

async function fetchTopPages(
  token: string | null,
  siteId: string,
  range: Range
): Promise<TopPage[]> {
  const response = await api.get<unknown>("/analytics/pages", {
    token,
    query: { siteId, ...qs(range) },
  });

return extractArray<TopPage>(response, [
    "pages",
    "topPages",
  ]);
}

async function runQuery(
  token: string | null,
  siteId: string,
  spec: QuerySpec
): Promise<{
  columns: string[];
  rows: Array<Record<string, string | number>>;
}> {
  return api.post(
    `/analytics/query?siteId=${encodeURIComponent(siteId)}`,
    spec,
    { token }
  );
}

// ---------- public hooks ----------

export function useOverview(
  siteId?: string,
  range: Range = "7d"
) {
  const { accessToken, isAuthenticated } = useAuth();

return useQuery<OverviewMetrics>({
    queryKey: siteId
      ? keys.overview(siteId, range)
      : ["analytics", "overview", "none"],

queryFn: () =>
      fetchOverview(accessToken, siteId as string, range),

enabled: isAuthenticated && Boolean(siteId),
  });
}

export function useTimeseries(
  siteId?: string,
  range: Range = "7d"
) {
  const { accessToken, isAuthenticated } = useAuth();

return useQuery<TimeseriesPoint[]>({
    queryKey: siteId
      ? keys.timeseries(siteId, range)
      : ["analytics", "timeseries", "none"],

queryFn: () =>
      fetchTimeseries(accessToken, siteId as string, range),

enabled: isAuthenticated && Boolean(siteId),
  });
}

export function useTrafficSources(
  siteId?: string,
  range: Range = "7d"
) {
  const { accessToken, isAuthenticated } = useAuth();

return useQuery<TrafficSource[]>({
    queryKey: siteId
      ? keys.sources(siteId, range)
      : ["analytics", "sources", "none"],

queryFn: () =>
      fetchSources(accessToken, siteId as string, range),

enabled: isAuthenticated && Boolean(siteId),
  });
}

export function useTopPages(
  siteId?: string,
  range: Range = "7d"
) {
  const { accessToken, isAuthenticated } = useAuth();

return useQuery<TopPage[]>({
    queryKey: siteId
      ? keys.pages(siteId, range)
      : ["analytics", "pages", "none"],

queryFn: () =>
      fetchTopPages(accessToken, siteId as string, range),

enabled: isAuthenticated && Boolean(siteId),
  });
}

export function useQueryRun() {
  const { accessToken } = useAuth();

return useMutation({
    mutationFn: ({
      siteId,
      spec,
    }: {
      siteId: string;
      spec: QuerySpec;
    }) => runQuery(accessToken, siteId, spec),

onError: (error) => {
      if (error instanceof ApiClientError) {
        console.error(error.message);
      }
    },
  });
}

export const analyticsKeys = keys;
