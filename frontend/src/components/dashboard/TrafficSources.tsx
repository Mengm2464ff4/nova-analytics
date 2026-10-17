import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { formatNumber, formatPercent } from "@/lib/utils";

type TrafficSource = {
  referrer: string;
  count: number;
};

type TrafficSourcesProps = {
  data: unknown;
};

function normalizeTrafficSources(data: unknown): TrafficSource[] {
  // API returns: { sources: [...] }
  if (
    data &&
    typeof data === "object" &&
    "sources" in data &&
    Array.isArray((data as { sources?: unknown }).sources)
  ) {
    return (data as { sources: TrafficSource[] }).sources;
  }
  // Bare array
  if (Array.isArray(data)) {
    return data as TrafficSource[];
  }
  return [];
}

export function TrafficSources({ data }: TrafficSourcesProps) {
  const sources = normalizeTrafficSources(data);

  const total = sources.reduce(
    (sum, s) => sum + Number(s.count ?? 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic sources</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          sources.map((source, index) => {
            const count = Number(source.count ?? 0);
            const percentage = total ? (count / total) * 100 : 0;

            return (
              <div key={`${source.referrer}-${index}`} className="space-y-1">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate font-medium">
                    {source.referrer || "Direct"}
                  </span>

                  <span className="text-muted-foreground">
                    {formatNumber(count)}{" "}
                    <span className="text-xs">
                      ({formatPercent(count, total)})
                    </span>
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}