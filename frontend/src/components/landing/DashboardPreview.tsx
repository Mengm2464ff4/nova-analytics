"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Activity, Globe2, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const bars = [42, 68, 55, 82, 64, 91, 73, 88, 76, 95, 84, 100];

const sparkline =
  "M0 40 L20 32 L40 38 L60 22 L80 28 L100 12 L120 18 L140 8 L160 14 L180 4";

export function DashboardPreview() {
  const [live, setLive] = useState(12);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 });

  useEffect(() => {
    const id = setInterval(() => {
      setLive((n) => {
        const delta = Math.floor(Math.random() * 5) - 1;
        return Math.min(99, Math.max(3, n + delta));
      });
    }, 2200);
    return () => clearInterval(id);
  }, []);

  function onMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 56 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.95, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="landing-perspective relative mx-auto mt-14 max-w-5xl px-4 sm:mt-20 sm:px-6"
    >
      <div className="landing-dashboard-glow pointer-events-none absolute -inset-12 rounded-[2rem] opacity-80" />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        <motion.div
          initial={{ opacity: 0, x: 24, y: -8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="absolute -right-2 top-8 z-20 hidden rounded-xl border border-emerald-400/25 bg-[#0a120f]/95 px-3 py-2 shadow-xl shadow-emerald-500/10 backdrop-blur-md sm:block lg:-right-8"
        >
          <p className="flex items-center gap-2 text-[11px] text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            New visitor · Tokyo, JP
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -24, y: 16 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.95, duration: 0.5 }}
          className="absolute -left-2 bottom-24 z-20 hidden rounded-xl border border-indigo-400/25 bg-[#0c0f17]/95 px-3 py-2 shadow-xl backdrop-blur-md sm:block lg:-left-10"
        >
          <p className="flex items-center gap-2 text-[11px] text-indigo-200">
            <MousePointerClick className="h-3.5 w-3.5" />
            Conversion +4.2% today
          </p>
        </motion.div>

        <div className="landing-shine relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f17]/95 shadow-2xl shadow-indigo-500/15 backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/5 bg-[#080a10]/90 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-3 truncate text-xs text-zinc-500">
              app.nova-analytics.io — Overview
            </span>
          </div>

          <div className="grid gap-4 p-4 sm:grid-cols-4 sm:p-6">
            {[
              { label: "Pageviews", value: "24.8k", icon: TrendingUp, delta: "+12.4%" },
              { label: "Visitors", value: "8,412", icon: Users, delta: "+8.1%" },
              {
                label: "Live now",
                value: String(live),
                icon: Activity,
                delta: "real-time",
                pulse: true,
              },
              { label: "Countries", value: "47", icon: Globe2, delta: "this week" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-indigo-400/20 sm:p-4"
              >
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-[10px] font-medium uppercase tracking-wider sm:text-xs">
                    {m.label}
                  </span>
                  <m.icon className="h-3.5 w-3.5 text-indigo-400/80" />
                </div>
                <p className="mt-2 text-xl font-semibold tabular-nums text-white sm:text-2xl">
                  {m.value}
                  {m.pulse && (
                    <span className="ml-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  )}
                </p>
                <p className="mt-1 text-[10px] text-emerald-400/90 sm:text-xs">{m.delta}</p>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-white/5 px-4 pb-6 pt-2 sm:px-6">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-zinc-400">Visitors — last 12 hours</p>
                <p className="text-[10px] text-zinc-600">Hover chart for 3D tilt · live demo UI</p>
              </div>
              <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-medium text-indigo-300 ring-1 ring-indigo-400/20">
                Live
              </span>
            </div>
            <div className="relative">
              <svg
                viewBox="0 0 180 44"
                className="pointer-events-none absolute inset-x-0 top-0 h-16 w-full opacity-40"
                preserveAspectRatio="none"
              >
                <motion.path
                  d={sparkline}
                  fill="none"
                  stroke="url(#sparkGrad)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, delay: 0.6, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex h-28 items-end gap-1.5 sm:h-36 sm:gap-2">
                {bars.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-600/50 via-indigo-500/80 to-violet-400/90"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{
                      duration: 0.75,
                      delay: 0.5 + i * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
