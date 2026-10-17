import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  hint?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MetricCard({
  label,
  value,
  change,
  hint,
  className,
  style,
}: MetricCardProps) {
  const hasChange = typeof change === "number" && change !== 0;
  const positive = hasChange && (change as number) > 0;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300",
        "hover:shadow-md hover:-translate-y-0.5",
        className
      )}
      style={style}
    >
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {hasChange ? (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-xs",
              positive ? "text-emerald-600" : "text-red-500"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(change as number).toFixed(1)}% vs prev.
          </p>
        ) : hint ? (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Minus className="h-3 w-3" />
            {hint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}