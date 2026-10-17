"use client";

const brands = [
  "Northwind Labs",
  "Orbit Health",
  "Stackbase",
  "Lumen AI",
  "Acme Commerce",
  "Pixel Forge",
  "Nova Teams",
  "Cloudline",
];

export function LogoMarquee() {
  const row = [...brands, ...brands];

  return (
    <section className="relative border-y border-zinc-200/80 py-12 dark:border-white/5">
  <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-700 dark:text-zinc-600">
    Trusted by product teams worldwide
  </p>

<div className="landing-marquee-mask relative mt-8 overflow-hidden">
    <div className="landing-marquee-track flex w-max gap-16 px-8">
      {row.map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="whitespace-nowrap text-sm font-semibold tracking-wide text-zinc-700/80 transition hover:text-indigo-600 dark:text-zinc-500/80 dark:hover:text-zinc-300"
        >
          {name}
        </span>
      ))}
    </div>
  </div>
</section>

  );
}
