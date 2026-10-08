"use client";
import { useEffect, type RefObject } from "react";

// Fades [data-reveal] elements in as they scroll into view. The root only gets
// `reveal-ready` once the observer exists, so server-rendered content is never
// hidden from visitors without JavaScript or from crawlers.
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = root.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const items = node.querySelectorAll<HTMLElement>("[data-reveal]");
    items.forEach((item) => {
      const step = Number(item.dataset.reveal) || 0;
      item.style.setProperty("--reveal-delay", `${step * 80}ms`);
      observer.observe(item);
    });
    node.classList.add("reveal-ready");
    return () => observer.disconnect();
  }, [root]);
}
