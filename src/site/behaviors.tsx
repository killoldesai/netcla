"use client";
// Client behaviour for the redesigned pages, ported from html-prototype/js/app.js.
// Everything is driven by data attributes in server-rendered markup, so pages stay
// server components and work without JavaScript (content is visible, links work).
import { useEffect } from "react";

export function SiteBehaviors() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $$ = <T extends Element>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
    const cleanups: (() => void)[] = [];
    const on = (el: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn, opts);
      cleanups.push(() => el.removeEventListener(type, fn, opts));
    };

    // Sliding indicator under the active tab or segment
    const place = (list: Element, ind: HTMLElement | null) => {
      const active = list.querySelector<HTMLElement>('[aria-selected="true"], [aria-checked="true"]');
      if (!active || !ind) return;
      ind.style.width = `${active.offsetWidth}px`;
      ind.style.transform = `translateX(${active.offsetLeft}px)`;
    };

    // Tabs: [data-tabs] > [role=tablist] > [role=tab][aria-controls]
    $$<HTMLElement>("[data-tabs]").forEach((root) => {
      const list = root.querySelector('[role="tablist"]');
      const ind = root.querySelector<HTMLElement>(".nx-tabs__ind");
      const tabs = $$<HTMLElement>('[role="tab"]', root);
      if (!list) return;
      const select = (tab: HTMLElement, focus = false) => {
        tabs.forEach((t) => {
          const isOn = t === tab;
          t.setAttribute("aria-selected", String(isOn));
          t.tabIndex = isOn ? 0 : -1;
          const panel = document.getElementById(t.getAttribute("aria-controls") || "");
          if (panel) panel.hidden = !isOn;
        });
        place(list, ind);
        if (focus) tab.focus();
      };
      tabs.forEach((t, i) => {
        on(t, "click", () => select(t));
        on(t, "keydown", (e) => {
          const k = (e as KeyboardEvent).key;
          const n = k === "ArrowRight" ? (i + 1) % tabs.length : k === "ArrowLeft" ? (i - 1 + tabs.length) % tabs.length : k === "Home" ? 0 : k === "End" ? tabs.length - 1 : -1;
          if (n < 0) return;
          e.preventDefault();
          select(tabs[n], true);
        });
      });
      place(list, ind);
      on(window, "resize", () => place(list, ind));
    });

    // Segmented control: [data-seg] options switch [data-model] panels inside the same section
    $$<HTMLElement>("[data-seg]").forEach((root) => {
      const ind = root.querySelector<HTMLElement>(".nx-seg__thumb");
      const opts = $$<HTMLElement>('[role="radio"]', root);
      const scope = root.closest("section") || document;
      const select = (opt: HTMLElement, focus = false) => {
        opts.forEach((o) => {
          const isOn = o === opt;
          o.setAttribute("aria-checked", String(isOn));
          o.tabIndex = isOn ? 0 : -1;
        });
        place(root, ind);
        $$<HTMLElement>("[data-model]", scope).forEach((m) => {
          m.hidden = m.getAttribute("data-model") !== opt.getAttribute("data-value");
        });
        if (focus) opt.focus();
      };
      opts.forEach((o, i) => {
        on(o, "click", () => select(o));
        on(o, "keydown", (e) => {
          const k = (e as KeyboardEvent).key;
          const d = k === "ArrowRight" || k === "ArrowDown" ? 1 : k === "ArrowLeft" || k === "ArrowUp" ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          select(opts[(i + d + opts.length) % opts.length], true);
        });
      });
      place(root, ind);
      on(window, "resize", () => place(root, ind));
    });

    // Carousel: [data-carousel] with .nx-car__track, slides, [data-car-prev]/[data-car-next], [data-car-progress]
    $$<HTMLElement>("[data-carousel]").forEach((root) => {
      const track = root.querySelector<HTMLElement>(".nx-car__track");
      const slides = $$<HTMLElement>(".nx-car__slide", root);
      const prev = root.querySelector<HTMLButtonElement>("[data-car-prev]");
      const next = root.querySelector<HTMLButtonElement>("[data-car-next]");
      const bar = root.querySelector<HTMLElement>("[data-car-progress]");
      if (!track || !prev || !next) return;
      let idx = 0;
      const per = () => parseInt(getComputedStyle(root).getPropertyValue("--nx-per"), 10) || 1;
      const max = () => Math.max(0, slides.length - per());
      const render = () => {
        const p = per();
        idx = Math.min(idx, max());
        track.style.transform = `translateX(${(-idx * 100) / p}%)`;
        slides.forEach((s, i) => {
          const vis = i >= idx && i < idx + p;
          s.toggleAttribute("inert", !vis);
          if (vis) s.removeAttribute("aria-hidden");
          else s.setAttribute("aria-hidden", "true");
        });
        prev.disabled = idx === 0;
        next.disabled = idx >= max();
        if (bar) bar.style.width = `${((idx + p) / slides.length) * 100}%`;
      };
      const go = (n: number) => { idx = Math.max(0, Math.min(max(), n)); render(); };
      on(prev, "click", () => go(idx - 1));
      on(next, "click", () => go(idx + 1));
      on(root, "keydown", (e) => {
        const k = (e as KeyboardEvent).key;
        if (k === "ArrowRight") go(idx + 1);
        if (k === "ArrowLeft") go(idx - 1);
      });
      on(window, "resize", render);
      render();
    });

    // Scroll reveal (.nx-reveal) and process steps filling in order ([data-steps] .nx-step)
    const reveals = $$<HTMLElement>(".nx-reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("nx-reveal--in"));
      $$("[data-steps] .nx-step").forEach((s) => s.classList.add("nx-step--active"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          el.classList.add("nx-reveal--in");
          if (el.classList.contains("nx-step")) {
            const delay = parseInt(el.style.getPropertyValue("--nx-delay"), 10) || 0;
            setTimeout(() => el.classList.add("nx-step--active"), delay + 300);
          }
          io.unobserve(el);
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach((el) => io.observe(el));
      $$("[data-steps] .nx-step").forEach((el) => { if (!el.classList.contains("nx-reveal")) io.observe(el); });
      cleanups.push(() => io.disconnect());
    }

    // Sticky section sub-nav highlights the section in view
    const subnav = document.querySelector("[data-subnav]");
    if (subnav && "IntersectionObserver" in window) {
      const links = $$<HTMLAnchorElement>('a[href^="#"]', subnav);
      const targets = links.map((a) => document.getElementById(a.getAttribute("href")!.slice(1))).filter(Boolean) as HTMLElement[];
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((a) => {
            const isOn = a.getAttribute("href") === `#${en.target.id}`;
            if (isOn) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-40% 0px -55% 0px" });
      targets.forEach((t) => spy.observe(t));
      cleanups.push(() => spy.disconnect());
    }

    // Mobile sticky CTA: visible after the hero, hidden while a form is on screen
    const mcta = document.querySelector<HTMLElement>("[data-mcta]");
    const hero = document.querySelector(".hero, .page-hero");
    if (mcta && hero && "IntersectionObserver" in window) {
      const form = document.querySelector("#contact, [data-form]");
      let heroGone = false, formOn = false;
      const sync = () => mcta.classList.toggle("is-visible", heroGone && !formOn);
      const a = new IntersectionObserver((en) => { heroGone = !en[0].isIntersecting; sync(); });
      a.observe(hero);
      cleanups.push(() => a.disconnect());
      if (form) {
        const b = new IntersectionObserver((en) => { formOn = en[0].isIntersecting; sync(); }, { threshold: 0.1 });
        b.observe(form);
        cleanups.push(() => b.disconnect());
      }
    }

    // Back to top
    $$("[data-to-top]").forEach((btn) => on(btn, "click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })));

    return () => cleanups.forEach((fn) => fn());
  }, []);
  return null;
}
