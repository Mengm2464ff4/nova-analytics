"use client";

import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Check,
  Code2,
  Globe,
  LineChart,
  Lock,
  Menu,
  Quote,
  Radio,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useSectionNav } from "./useSectionNav";
import { AnimatedCounter } from "./AnimatedCounter";
import { DashboardPreview } from "./DashboardPreview";
import { FaqSection } from "./FaqSection";
import { HeroBackground } from "./HeroBackground";
import { LogoMarquee } from "./LogoMarquee";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  {
    icon: Radio,
    title: "Real-time pulse",
    desc: "Watch sessions stream in over WebSockets — no refresh, no delay.",
    className: "md:col-span-2 md:row-span-1",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by default",
    desc: "No cookies, no fingerprinting. GDPR-friendly out of the box.",
    className: "",
  },
  {
    icon: Zap,
    title: "Featherweight script",
    desc: "Sub‑1KB loader. Your Core Web Vitals stay green.",
    className: "",
  },
  {
    icon: Globe,
    title: "Geo & devices",
    desc: "Countries, browsers, referrers — one dashboard, full context.",
    className: "",
  },
  {
    icon: Code2,
    title: "Query builder",
    desc: "Slice events by path, referrer, or custom properties visually.",
    className: "md:col-span-2",
  },
  {
    icon: LineChart,
    title: "Reports & exports",
    desc: "Schedule digests and export CSV or JSON for your data stack.",
    className: "",
  },
];

const steps = [
  { n: "01", title: "Add your site", body: "Create a property and paste one script tag." },
  { n: "02", title: "Collect events", body: "Pageviews and custom events flow in instantly." },
  { n: "03", title: "Act on insight", body: "Realtime, funnels, and exports — all in one place." },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    blurb: "Perfect for side projects and staging.",
    perks: ["1 site", "50k events / mo", "7-day retention", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$29",
    blurb: "For teams shipping serious products.",
    perks: ["10 sites", "2M events / mo", "1-year retention", "Email reports", "Priority support"],
    cta: "Get Growth",
    highlight: true,
  },
  {
    name: "Scale",
    price: "Custom",
    blurb: "Self-host, SSO, and dedicated SLA.",
    perks: ["Unlimited sites", "Custom volume", "SSO & RBAC", "Dedicated success"],
    cta: "Talk to us",
    highlight: false,
  },
];

const testimonials = [
  {
    quote:
      "We replaced a bloated analytics stack in an afternoon. Nova feels like the product analytics should have been all along.",
    name: "Sarah Chen",
    role: "Head of Product · Lumen AI",
  },
  {
    quote:
      "Real-time without the cookie banner drama. Legal loved it, engineering loved how small the script is.",
    name: "Marcus Webb",
    role: "Staff Engineer · Orbit Health",
  },
  {
    quote:
      "The query builder is deceptively powerful — our growth team stopped exporting CSVs every week.",
    name: "Elena Ruiz",
    role: "Growth Lead · Stackbase",
  },
];

const navLinks = [
  {
    id: "features",
    label: "Features",
    path: "/features",
  },
  {
    id: "how-it-works",
    label: "How it works",
    path: "/how-it-works",
  },
  {
    id: "pricing",
    label: "Pricing",
    path: "/pricing",
  },
  {
    id: "faq",
    label: "FAQ",
    path: "/faq",
  },
] as const;

const sectionIds = navLinks.map((l) => l.id);

export function LandingShell() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  const sectionList = useMemo(() => [...sectionIds], []);
  const { activeId, scrollToSection } = useSectionNav(sectionList);

  // Scroll to the correct section when the route changes
  useEffect(() => {
    const routeToSection = {
      "/features": "features",
      "/how-it-works": "how-it-works",
      "/pricing": "pricing",
      "/faq": "faq",
    } as const;

    const sectionId = routeToSection[pathname as keyof typeof routeToSection];

    if (!sectionId) return;

    const timer = window.setTimeout(() => {
      scrollToSection(sectionId);
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname, scrollToSection]);

  // Mobile nav helper – close menu + scroll to section
  const handleMobileNav = useCallback(
    (id: string) => {
      setMobileOpen(false);
      // Small delay so the menu closes smoothly before scrolling
      window.setTimeout(() => {
        scrollToSection(id);
      }, 100);
    },
    [scrollToSection]
  );

  return (
    <div className="landing-page relative min-h-screen overflow-x-hidden bg-slate-50 text-zinc-900 transition-colors duration-300 dark:bg-[#06080d] dark:text-zinc-100">
      <div
        className="landing-mesh pointer-events-none fixed inset-0 opacity-80 dark:opacity-60"
        aria-hidden
      />

      {/* ───────────────────── Header ───────────────────── */}
      <motion.header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/70 bg-slate-50/90 backdrop-blur-xl dark:border-white/5 dark:bg-[#06080d]/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollToSection("top")}
            className="group flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/30 transition group-hover:bg-indigo-500/25 group-hover:ring-indigo-400/50">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
            </span>
            <span>Nova Analytics</span>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 text-sm md:flex">
  {navLinks.map((link) => (
    <Link
      key={link.id}
      href={link.path}
      className={cn(
        "rounded-lg px-3 py-2 transition",
        activeId === link.id
          ? "bg-indigo-100 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200"
          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
      )}
    >
      {link.label}
    </Link>
  ))}
</nav>


          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle variant="landing" />

            <Link href="/login" className="hidden sm:block">
             <Button
  variant="ghost"
  size="sm"
  className="text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
>
  Sign in
</Button>

            </Link>

            <Link href="/register" className="hidden sm:block">
              <Button
                size="sm"
                className="rounded-full bg-indigo-500 px-4 shadow-lg shadow-indigo-500/25 hover:bg-indigo-400"
              >
                Get started
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <button
  type="button"
  onClick={() => setMobileOpen((current) => !current)}
  aria-label={mobileOpen ? "Close menu" : "Open menu"}
  aria-expanded={mobileOpen}
  className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-800 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 md:hidden"
>
  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
</button>

          </div>
        </div>

        {/* Mobile menu */}

<AnimatePresence>
  {mobileOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-zinc-200/70 dark:border-white/5 md:hidden"
    >
      <nav className="flex flex-col gap-1 px-5 py-4">
        {navLinks.map((l) => (
          <Link
            key={l.id}
            href={l.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "w-full rounded-lg px-3 py-3 text-left text-sm transition",
              activeId === l.id
                ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
            )}
          >
            {l.label}
          </Link>
        ))}

        <Link href="/login" onClick={() => setMobileOpen(false)} className="mt-2">
          <Button variant="outline" className="w-full border-white/15 bg-white/5">
            Sign in
          </Button>
        </Link>

        <Link href="/register" onClick={() => setMobileOpen(false)}>
          <Button className="mt-2 w-full rounded-full bg-indigo-500">
            Get started
          </Button>
        </Link>
      </nav>
    </motion.div>
  )}
</AnimatePresence>
      </motion.header>

      {/* ───────────────────── Main content ───────────────────── */}
      <main>
        {/* Hero */}
        <section id="top" className="relative scroll-mt-24 pt-28 pb-4 sm:pt-36">
          <HeroBackground />
          <motion.div style={{ y: heroY }} className="relative">
            <div className="mx-auto max-w-6xl px-5 text-center sm:px-6">
              <motion.div
  custom={0}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-400/25 dark:bg-indigo-500/10 dark:text-indigo-200"
>
  <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" />
  Privacy-first · Cookie-free · Real-time
  <span className="hidden h-1 w-1 rounded-full bg-emerald-500 sm:inline-block dark:bg-emerald-400" />
  <span className="hidden text-emerald-600/90 sm:inline dark:text-emerald-300/90">
    Public beta
  </span>
</motion.div>


              <motion.h1
                custom={1}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mx-auto mt-8 max-w-4xl text-4xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.25rem]"
              >
                The analytics platform
                <br />
                <span className="landing-gradient-text">built for modern teams</span>
              </motion.h1>

            <motion.p
  custom={2}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-700 dark:text-zinc-400 sm:text-lg"
>
  Clarity without surveillance. Ship a tiny script, self-host in minutes, and watch
  insights update live — with animations, exports, and privacy your users will trust.
</motion.p>


              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <Link href="/register">
                  <Button
                    size="lg"
                    className="group h-12 rounded-full bg-indigo-500 px-8 text-base shadow-xl shadow-indigo-500/30 hover:bg-indigo-400 hover:shadow-indigo-500/40"
                  >
                    Start free
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login">
               <Button
  size="lg"
  variant="outline"
  className="h-12 rounded-full border-zinc-300 bg-white px-8 text-base text-zinc-800 shadow-sm backdrop-blur-sm hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/15 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
>
  View demo
</Button>

                </Link>
              </motion.div>

             <motion.ul
  custom={4}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-zinc-700 dark:text-zinc-500 sm:text-sm"
>
  {["No credit card", "Self-hostable", "Open metrics API", "SOC2-ready patterns"].map(
    (t) => (
      <li key={t} className="flex items-center gap-2">
        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500/80" />
        {t}
      </li>
    )
  )}
</motion.ul>

            </div>

            <DashboardPreview />
          </motion.div>
        </section>

        {/* Stats */}
        <section className="relative border-y border-white/5 bg-[#080a10]/80 py-14">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 sm:grid-cols-4 sm:px-6">
            {[
              { label: "Events processed", value: 2400000, suffix: "+" },
              { label: "Avg. script size", value: 1, suffix: " KB" },
              { label: "Uptime SLA", value: 99, suffix: ".9%" },
              { label: "Teams onboarded", value: 1200, suffix: "+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <LogoMarquee />

        {/* Features */}
       <section id="features" className="scroll-mt-24 py-24 sm:py-28">
  <div className="mx-auto max-w-6xl px-5 sm:px-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl text-center md:text-left"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400/90">
        Platform
      </p>

<h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
        Everything you need. Nothing you don&apos;t.
      </h2>

<p className="mt-4 text-zinc-700 dark:text-zinc-400">
        A focused analytics stack — realtime dashboard, query tools, and exports —
        without ad-tech bloat.
      </p>
    </motion.div>

<div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.06, duration: 0.45 }}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-indigo-400/30 hover:bg-indigo-50 dark:border-white/8 dark:bg-white/[0.03] dark:hover:bg-white/[0.05] ${f.className}`}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:bg-indigo-500/20" />

<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20 transition group-hover:bg-indigo-500/25">
            <f.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>

<h3 className="mt-4 text-lg font-semibold text-zinc-950 dark:text-white">
            {f.title}
          </h3>

<p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-400">
            {f.desc}
          </p>
        </motion.div>
      ))}
    </div>
  </div>
</section>


        {/* Comparison */}
        <section className="border-y border-white/5 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
             <div>
  <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
    Why teams switch to Nova
  </h2>

<p className="mt-4 text-zinc-700 dark:text-zinc-400">
    Less script weight, clearer data ownership, and dashboards that feel fast — not
    like legacy enterprise tools.
  </p>

<ul className="mt-8 space-y-4">
    {[
      "Cookie-free core tracking",
      "Self-host or cloud — your data stays yours",
      "Realtime + historical in one UI",
      "Role-based access for admins and viewers",
    ].map((item) => (
      <li
        key={item}
        className="flex items-start gap-3 text-sm text-zinc-800 dark:text-zinc-300"
      >
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" />
        </span>

{item}
      </li>
    ))}
  </ul>
</div>


              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-6"
              >
                <div className="grid grid-cols-3 gap-3 text-center text-xs text-zinc-500">
                  <span />
                  <span className="font-medium text-zinc-400">Legacy tools</span>
                  <span className="font-medium text-indigo-300">Nova</span>
                  {[
                    ["Script size", "45+ KB", "< 1 KB"],
                    ["Cookie banner", "Often required", "Not required"],
                    ["Self-host", "Rare", "First-class"],
                    ["Realtime", "Add-on", "Built-in"],
                  ].map(([row, a, b]) => (
                    <div key={row} className="contents">
                      <span className="py-3 text-left text-zinc-400">{row}</span>
                      <span className="border-t border-white/5 py-3">{a}</span>
                      <span className="border-t border-white/5 py-3 font-medium text-emerald-400/90">
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Live in three steps</h2>
              <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                From zero to realtime charts faster than your coffee cools.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="relative rounded-2xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-transparent p-6"
                >
                  <span className="text-4xl font-bold text-indigo-500/35">{s.n}</span>
                  <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{s.body}</p>
                  {i < steps.length - 1 && (
                    <div className="pointer-events-none absolute -right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-indigo-500/40 to-transparent md:block" />
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-10 flex justify-center"
            >
             <div className="flex max-w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 font-mono text-xs text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-black/50 dark:text-zinc-400 sm:text-sm">
  <Lock className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />

<code className="overflow-x-auto whitespace-nowrap">
    {`<script defer src="/track.js" data-site="YOUR_KEY"></script>`}
  </code>
</div>

            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
       <section className="py-20">
  <div className="mx-auto max-w-6xl px-5 sm:px-6">
    <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
      Loved by builders
    </h2>

<div className="mt-12 grid gap-6 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <motion.blockquote
          key={t.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/8 dark:bg-white/[0.02]"
        >
          <Quote className="h-8 w-8 text-indigo-600/50 dark:text-indigo-500/40" />

<p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            &ldquo;{t.quote}&rdquo;
          </p>

<footer className="mt-6 border-t border-zinc-200 pt-4 dark:border-white/5">
            <p className="text-sm font-medium text-zinc-950 dark:text-white">
              {t.name}
            </p>

<p className="text-xs text-zinc-600 dark:text-zinc-500">
              {t.role}
            </p>
          </footer>
        </motion.blockquote>
      ))}
    </div>
  </div>
</section>


        {/* Pricing */}
        <section
  id="pricing"
  className="scroll-mt-24 border-t border-zinc-200 py-24 dark:border-white/5 sm:py-28"
>
  <div className="mx-auto max-w-6xl px-5 sm:px-6">
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
        Simple, honest pricing
      </h2>

<p className="mx-auto mt-4 max-w-lg text-zinc-700 dark:text-zinc-400">
        Start free. Upgrade when your traffic — and ambition — grows.
      </p>
    </div>

<div className="mt-14 grid gap-6 lg:grid-cols-3">
      {plans.map((plan, i) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -4 }}
          className={`relative flex flex-col rounded-2xl border p-8 transition ${
            plan.highlight
              ? "border-indigo-400/40 bg-indigo-50 shadow-xl shadow-indigo-500/10 dark:bg-indigo-500/10"
              : "border-zinc-200 bg-white dark:border-white/8 dark:bg-white/[0.02]"
          }`}
        >
          {plan.highlight && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-medium text-white shadow-lg shadow-indigo-500/30">
              Popular
            </span>
          )}

<h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
            {plan.name}
          </h3>

<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-500">
            {plan.blurb}
          </p>

<p className="mt-6 text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {plan.price}

{plan.price.startsWith("$") && (
              <span className="text-base font-normal text-zinc-600 dark:text-zinc-500">
                /mo
              </span>
            )}
          </p>

<ul className="mt-8 flex-1 space-y-3 text-sm text-zinc-700 dark:text-zinc-400">
            {plan.perks.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                {p}
              </li>
            ))}
          </ul>

<Link href="/register" className="mt-8 block">
            <Button
              className={`w-full rounded-full ${
                plan.highlight
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-400"
                  : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              }`}
            >
              {plan.cta}
            </Button>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
</section>


        <FaqSection />

        {/* Final CTA */}
        <section className="pb-24 pt-8">
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="mx-auto max-w-5xl px-5 sm:px-6"
  >
    <div className="relative overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-8 py-16 text-center dark:border-indigo-400/25 dark:from-indigo-600/25 dark:via-[#0c0f17] dark:to-violet-600/15 sm:px-16">
      <div className="landing-cta-glow pointer-events-none absolute inset-0" aria-hidden />

<motion.div
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
          Ready to see what&apos;s really happening?
        </h2>

<p className="relative mx-auto mt-4 max-w-lg text-zinc-700 dark:text-zinc-400">
          Join teams using Nova to ship faster with clearer, privacy-respecting data.
        </p>

<div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button
              size="lg"
              className="rounded-full bg-indigo-500 px-8 text-white shadow-xl shadow-indigo-500/25 hover:bg-indigo-400"
            >
              Create your account
            </Button>
          </Link>

<Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-zinc-300 bg-white px-8 text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
            >
              Sign in
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </motion.div>
</section>

      </main>

      {/* ───────────────────── Footer ───────────────────── */}
      <footer className="border-t border-zinc-200/80 bg-slate-100 py-14 dark:border-white/5 dark:bg-[#05070b]">
  <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
    <div className="lg:col-span-2">
      <button
        type="button"
        onClick={() => scrollToSection("top")}
        className="flex items-center gap-2 font-semibold text-zinc-950 dark:text-white"
      >
        <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        Nova Analytics
      </button>

<p className="mt-3 max-w-sm text-sm text-zinc-600 dark:text-zinc-500">
        Privacy-first web analytics for teams who ship fast and respect their visitors.
      </p>
    </div>

<div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
        Product
      </p>

<ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-400">
        <li>
          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="hover:text-indigo-600 dark:hover:text-white"
          >
            Features
          </button>
        </li>

<li>
          <button
            type="button"
            onClick={() => scrollToSection("pricing")}
            className="hover:text-indigo-600 dark:hover:text-white"
          >
            Pricing
          </button>
        </li>

<li>
          <Link
            href="/login"
            className="hover:text-indigo-600 dark:hover:text-white"
          >
            Dashboard
          </Link>
        </li>
      </ul>
    </div>

<div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-500">
        Company
      </p>

<ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-400">
        <li>
          <button
            type="button"
            onClick={() => scrollToSection("faq")}
            className="hover:text-indigo-600 dark:hover:text-white"
          >
            FAQ
          </button>
        </li>

<li>
          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-indigo-600 dark:hover:text-white"
          >
            How it works
          </button>
        </li>
      </ul>
    </div>
  </div>

<p className="mx-auto mt-10 max-w-6xl px-5 text-center text-xs text-zinc-500 dark:text-zinc-600 sm:px-6">
    © {new Date().getFullYear()} Nova Analytics. Built for privacy.
  </p>
</footer>

    </div>
  );
}