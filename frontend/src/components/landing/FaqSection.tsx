"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "Do I need cookie banners with Nova?",
    a: "Nova is designed cookie-free for core analytics. You still need to comply with local laws, but you avoid third-party ad trackers and fingerprinting.",
  },
  {
    q: "Can I self-host?",
    a: "Yes. Run the backend and database on your infrastructure, point the tracking script at your domain, and keep data in your region.",
  },
  {
    q: "How heavy is the tracking script?",
    a: "The default loader is under 1KB gzipped and loads asynchronously so it won’t block your LCP.",
  },
  {
    q: "Does it work with Next.js and SPAs?",
    a: "Pageviews fire on load today; you can hook router events for client-side navigations with a one-line custom call.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
   <section
  id="faq"
  className="scroll-mt-24 border-t border-zinc-200/80 py-24 dark:border-white/5"
>
  <div className="mx-auto max-w-3xl px-5 sm:px-6">
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
        Questions, answered
      </h2>

<p className="mt-4 text-zinc-700 dark:text-zinc-400">
        Everything teams ask before they flip the switch.
      </p>
    </div>

<ul className="mt-12 space-y-3">
      {faqs.map((item, i) => {
        const isOpen = open === i;

return (
          <li
            key={item.q}
            className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 dark:border-white/8 dark:bg-white/[0.02]"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 sm:text-base dark:text-zinc-100 dark:hover:bg-white/[0.03]"
            >
              {item.q}

<ChevronDown
                className={`h-5 w-5 shrink-0 text-zinc-500 transition ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

<AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="border-t border-zinc-200 px-5 pb-4 pt-2 text-sm leading-relaxed text-zinc-700 dark:border-white/5 dark:text-zinc-400">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  </div>
</section>

  );
}
