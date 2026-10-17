export interface RealtimeEvent {
  id: string;
  siteId: string;
  type: "pageview" | "event";
  path: string;
  referrer?: string | null;
  country?: string | null;
  city?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
  timestamp: string;
}

export interface OverviewMetrics {
  pageviews: number;
  uniqueVisitors: number;
  sessions: number;
  bounces: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface TimeseriesPoint {
   time: string;
  count: number;
}

export interface TrafficSource {
  referrer: string;
  count: number;
}

export interface TopPage {
  path: string;
  count: number;
}
