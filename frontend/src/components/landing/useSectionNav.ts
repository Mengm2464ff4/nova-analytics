"use client";

import { useCallback, useEffect, useState } from "react";

const HEADER_OFFSET = 88;

export function useSectionNav(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState("");

const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);

if (!element) {
      console.warn(`Section not found: ${id}`);
      return;
    }

const top =
      element.getBoundingClientRect().top +
      window.scrollY -
      HEADER_OFFSET;

window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });

setActiveId(id);

// window.history.pushState(
//     null,
//     "",
//     `${window.location.pathname}#${id}`
//   );
  }, []);

useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

if (elements.length === 0) return;

const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => b.intersectionRatio - a.intersectionRatio
          );

const currentId = visible[0]?.target.id;

if (currentId) {
          setActiveId(currentId);
        }
      },
      {
        rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`,
        threshold: [0.08, 0.2, 0.4],
      }
    );

elements.forEach((element) => observer.observe(element));

return () => observer.disconnect();
  }, [sectionIds]);

return {
    activeId,
    scrollToSection,
  };
}
