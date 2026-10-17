import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils";

type TopPage = {
  path: string;
  count: number;
};

export function TopPages({ data }: { data: TopPage[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top pages</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          <div className="grid grid-cols-[1fr_auto] gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Path</span>
            <span className="text-right">Views</span>
          </div>
          {data.length === 0 && (
            <p className="px-6 py-6 text-sm text-muted-foreground">
              No data yet.
            </p>
          )}
          {data.map((page) => (
            <div
              key={page.path}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-3 text-sm"
            >
              <span className="truncate font-mono text-xs" title={page.path}>
                {page.path}
              </span>
              <span className="text-right tabular-nums">
                {formatNumber(page.count)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}