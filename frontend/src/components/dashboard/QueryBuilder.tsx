"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";

export type QueryOperator =
  | "eq"
  | "neq"
  | "contains"
  | "gt"
  | "lt"
  | "in";

export interface QueryFilter {
  id: string;
  field: string;
  op: QueryOperator;
  value: string;
}

export interface QuerySpec {
  metric: "visitors" | "pageviews" | "sessions";
  groupBy: "none" | "path" | "country" | "referrer" | "browser" | "device";
  filters: Omit<QueryFilter, "id">[];
  range: "24h" | "7d" | "30d" | "90d";
}

const FIELDS = [
  "path",
  "country",
  "referrer",
  "browser",
  "os",
  "device",
  "utm_source",
] as const;

const OPERATORS: { value: QueryOperator; label: string }[] = [
  { value: "eq", label: "=" },
  { value: "neq", label: "≠" },
  { value: "contains", label: "contains" },
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "in", label: "in" },
];

let idCounter = 0;
const newFilter = (): QueryFilter => ({
  id: String(++idCounter),
  field: "path",
  op: "eq",
  value: "",
});

export function QueryBuilder({
  onRun,
  loading,
}: {
  onRun: (spec: QuerySpec) => void;
  loading?: boolean;
}) {
  const [metric, setMetric] = useState<QuerySpec["metric"]>("visitors");
  const [groupBy, setGroupBy] = useState<QuerySpec["groupBy"]>("path");
  const [range, setRange] = useState<QuerySpec["range"]>("7d");
  const [filters, setFilters] = useState<QueryFilter[]>([]);

  function update(id: string, patch: Partial<QueryFilter>) {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  }

  function remove(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function run() {
    onRun({
      metric,
      groupBy,
      range,
      filters: filters.map(({ id: _id, ...rest }) => rest),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query builder</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Metric / GroupBy / Range */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="metric">Metric</Label>
            <select
              id="metric"
              value={metric}
              onChange={(e) => setMetric(e.target.value as any)}
              className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="visitors">Visitors</option>
              <option value="pageviews">Pageviews</option>
              <option value="sessions">Sessions</option>
            </select>
          </div>

          <div>
            <Label htmlFor="groupBy">Group by</Label>
            <select
              id="groupBy"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="none">None</option>
              <option value="path">Path</option>
              <option value="country">Country</option>
              <option value="referrer">Referrer</option>
              <option value="browser">Browser</option>
              <option value="device">Device</option>
            </select>
          </div>

          <div>
            <Label htmlFor="range">Range</Label>
            <select
              id="range"
              value={range}
              onChange={(e) => setRange(e.target.value as any)}
              className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Filters</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFilters((p) => [...p, newFilter()])}
            >
              <Plus className="h-4 w-4" /> Add filter
            </Button>
          </div>

          {filters.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No filters. Click &ldquo;Add filter&rdquo; to narrow results.
            </p>
          )}

          {filters.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-[1fr_auto_1.5fr_auto] items-center gap-2"
            >
              <select
                value={f.field}
                onChange={(e) => update(f.id, { field: e.target.value })}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                {FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>

              <select
                value={f.op}
                onChange={(e) =>
                  update(f.id, { op: e.target.value as QueryOperator })
                }
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                {OPERATORS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <Input
                value={f.value}
                onChange={(e) => update(f.id, { value: e.target.value })}
                placeholder="value"
                className="h-9"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(f.id)}
                aria-label="Remove filter"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button onClick={run} loading={loading}>
          Run query
        </Button>
      </CardFooter>
    </Card>
  );
}