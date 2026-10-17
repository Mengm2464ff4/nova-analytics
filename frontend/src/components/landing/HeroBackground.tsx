"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroBackground() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="landing-aurora absolute inset-0 opacity-90" />
      <div className="landing-grid absolute inset-0 opacity-40" />

      {!reduce && (
        <>
          <motion.div
            className="landing-orb landing-orb-indigo absolute -left-24 top-20 h-72 w-72 rounded-full blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="landing-orb landing-orb-violet absolute -right-16 top-40 h-96 w-96 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="landing-orb landing-orb-cyan absolute bottom-0 left-1/3 h-64 w-64 rounded-full blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="landing-beam absolute left-1/2 top-0 h-[480px] w-px -translate-x-1/2 bg-gradient-to-b from-indigo-400/50 via-indigo-400/10 to-transparent" />
        </>
      )}
    </div>
  );
}
