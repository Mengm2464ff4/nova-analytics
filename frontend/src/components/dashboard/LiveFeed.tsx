"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import type { RealtimeEvent } from "@/types/event";

const MAX_EVENTS = 50;

export function LiveFeed({ siteId }: { siteId?: string }) {
  const { socket, connected } = useSocket();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    // Reset when site changes
    setEvents([]);

    // Subscribe to the appropriate room
    if (siteId) socket.emit("subscribe:site", siteId);

    // const onEvent = (e: RealtimeEvent) => {
    //   if (siteId && e.siteId !== siteId) return;
    //   setEvents((prev) => [e, ...prev].slice(0, MAX_EVENTS));
    // };
    const onEvent = (e: RealtimeEvent) => {
       setEvents((prev) => [e, ...prev].slice(0, MAX_EVENTS));
    };
    const onCount = (payload: { siteId: string; count: number }) => {
      if (!siteId || payload.siteId === siteId) setActiveVisitors(payload.count);
    };

    socket.on("event", onEvent);
    socket.on("visitors:count", onCount);

    return () => {
      socket.off("event", onEvent);
      socket.off("visitors:count", onCount);
      if (siteId) socket.emit("unsubscribe:site", siteId);
    };
  }, [socket, siteId]);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Radio
            className={cn(
              "h-4 w-4",
              connected ? "text-emerald-500" : "text-muted-foreground"
            )}
          />
          Live feed
        </CardTitle>
        <Badge variant={connected ? "success" : "secondary"}>
          {connected ? `${activeVisitors} online` : "offline"}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
            <Spinner className="h-5 w-5" />
            Waiting for visitors…
          </div>
        ) : (
          <ul className="max-h-[420px] divide-y overflow-y-auto scrollbar-thin">
            {events.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 px-6 py-3 text-sm animate-fade-in"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs">{e.path}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[e.country, e.city, e.browser, e.os]
                      .filter(Boolean)
                      .join(" · ") || "unknown"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}