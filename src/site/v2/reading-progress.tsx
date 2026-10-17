"use client";
// A thin bar at the top of the window that fills as the article is read. Decorative (aria-hidden); no bar without JS.
import { useEffect, useRef } from "react";

export function ReadingProgress({ targetId = "guide" }: { targetId?: string }) {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(1, Math.max(0, (window.innerHeight * 0.3 - rect.top) / Math.max(total, 1)));
      if (bar.current) bar.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);
  return (
    <div className="readbar" aria-hidden="true">
      <span ref={bar} />
    </div>
  );
}
