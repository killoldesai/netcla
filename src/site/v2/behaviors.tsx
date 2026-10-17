"use client";
// Client behaviour for the v2 pages, ported from html-prototype/v2/js/core.js. Driven by data attributes in
// server-rendered markup, so pages stay server components and content works without JavaScript.
// Everything registered here is removed again on route change.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function V2Behaviors() {
  const pathname = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $ = <T extends Element>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
    const $$ = <T extends Element>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
    const undo: (() => void)[] = [];
    const on = (el: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn, opts);
      undo.push(() => el.removeEventListener(type, fn, opts));
    };
    const every = (fn: () => void, ms: number) => {
      const t = window.setInterval(fn, ms);
      undo.push(() => window.clearInterval(t));
      return t;
    };

    // Hidden-until-revealed elements only hide once script is running (see scripts/build-v2-css.mjs)
    $$<HTMLElement>(".v2").forEach((w) => w.classList.add("js-on"));

    // Header shadow: [data-hdr]
    const hdr = $<HTMLElement>("[data-hdr]");
    if (hdr) {
      const f = () => hdr.classList.toggle("is-scrolled", window.scrollY > 8);
      on(window, "scroll", f, { passive: true });
      f();
    }

    // Enquiry pre-fill: links with [data-pre="Service name"], or ?svc= in the URL, set the #f-svc select
    const svc = $<HTMLSelectElement>("#f-svc");
    const form = $<HTMLElement>("[data-form]");
    const prefill = (v?: string | null) => {
      if (!v || !svc) return;
      const opt = Array.from(svc.options).find((o) => o.value === v || o.text === v);
      if (!opt) return;
      svc.value = opt.value || opt.text;
      if (form) {
        form.classList.remove("flash");
        void form.offsetWidth;
        form.classList.add("flash");
      }
    };
    $$<HTMLElement>("[data-pre]").forEach((a) => on(a, "click", () => window.setTimeout(() => prefill(a.dataset.pre), 500)));
    prefill(new URLSearchParams(window.location.search).get("svc"));

    // Choice chips: [data-chips] with .chip[data-svc]; a [data-chips-go] link inside the same parent pre-fills the form
    $$<HTMLElement>("[data-chips]:not([data-chips-custom])").forEach((g) => {
      const chips = $$<HTMLElement>(".chip", g);
      chips.forEach((c) => on(c, "click", () => chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)))));
      const go = g.parentElement?.querySelector<HTMLElement>("[data-chips-go]");
      if (go) on(go, "click", () => {
        const c = chips.find((x) => x.getAttribute("aria-pressed") === "true");
        window.setTimeout(() => prefill(c?.dataset.svc), 500);
      });
    });

    // Tabs: [data-tabs] > [role=tab][aria-controls]
    $$<HTMLElement>("[data-tabs]").forEach((root) => {
      const tabs = $$<HTMLElement>("[role=tab]", root);
      const pick = (i: number, focus = false) =>
        tabs.forEach((t, j) => {
          const panel = document.getElementById(t.getAttribute("aria-controls") || ""), isOn = i === j;
          t.setAttribute("aria-selected", String(isOn));
          t.tabIndex = isOn ? 0 : -1;
          if (panel) {
            panel.hidden = !isOn;
            if (isOn) { panel.classList.remove("in"); void panel.offsetWidth; panel.classList.add("in"); }
          }
          if (isOn && focus) t.focus();
        });
      tabs.forEach((t, i) => {
        on(t, "click", () => pick(i));
        on(t, "keydown", (e) => {
          const k = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 } as Record<string, number>)[(e as KeyboardEvent).key];
          if (k) { e.preventDefault(); pick((i + k + tabs.length) % tabs.length, true); }
        });
      });
      const start = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      pick(start < 0 ? 0 : start);
    });

    // Feature accordion with a changing visual: [data-accs] > .accs__item > .accs__btn and .accs__vis > [data-vis="n"]
    $$<HTMLElement>("[data-accs]").forEach((root) => {
      const items = $$<HTMLElement>(".accs__item", root), vis = $$<HTMLElement>(".accs__vis > [data-vis]", root);
      let i = 0, timer = 0;
      const show = (n: number) => {
        i = (n + items.length) % items.length;
        items.forEach((it, j) => {
          it.setAttribute("aria-expanded", String(j === i));
          it.querySelector(".accs__btn")?.setAttribute("aria-expanded", String(j === i));
        });
        vis.forEach((v) => v.classList.toggle("on", Number(v.dataset.vis) === i));
      };
      const auto = () => {
        window.clearInterval(timer);
        if (!reduce && root.dataset.accs !== "manual") timer = every(() => show(i + 1), 6000);
      };
      items.forEach((it, j) => on(it.querySelector(".accs__btn") as HTMLElement, "click", () => { show(j); auto(); }));
      on(root, "mouseenter", () => { window.clearInterval(timer); root.classList.add("is-paused"); });
      on(root, "mouseleave", () => { root.classList.remove("is-paused"); auto(); });
      show(0);
      auto();
    });

    // Card carousel: [data-carousel] > .car__track, [data-prev], [data-next], .car__dots, optional [data-goto="n"] buttons
    $$<HTMLElement>("[data-carousel]").forEach((root) => {
      const track = $<HTMLElement>(".car__track", root);
      if (!track) return;
      const cards = Array.from(track.children) as HTMLElement[], dots = $<HTMLElement>(".car__dots", root), list = $$<HTMLElement>("[data-goto]", root);
      if (dots) dots.innerHTML = cards.map(() => "<i></i>").join("");
      const dd = dots ? (Array.from(dots.children) as HTMLElement[]) : [];
      let ci = 0, timer = 0;
      const go = (n: number) => {
        ci = (n + cards.length) % cards.length;
        const cs = getComputedStyle(track), gap = parseFloat(cs.columnGap || cs.gap) || 0;
        const w = cards[0].offsetWidth + gap, view = (track.parentElement as HTMLElement).offsetWidth;
        const max = Math.max(0, cards.length * w - gap - view);
        track.style.transform = `translateX(${-Math.min(ci * w, max)}px)`;
        cards.forEach((c, j) => c.classList.toggle("on", j === ci));
        dd.forEach((d, j) => d.classList.toggle("on", j === ci));
        list.forEach((b) => b.setAttribute("aria-selected", String(Number(b.dataset.goto) === ci)));
      };
      const restart = () => {
        window.clearInterval(timer);
        if (!reduce && root.hasAttribute("data-autoplay")) timer = every(() => go(ci + 1), 5000);
      };
      $$<HTMLElement>("[data-prev]", root).forEach((b) => on(b, "click", () => { go(ci - 1); restart(); }));
      $$<HTMLElement>("[data-next]", root).forEach((b) => on(b, "click", () => { go(ci + 1); restart(); }));
      list.forEach((b) => on(b, "click", () => { go(Number(b.dataset.goto)); restart(); }));
      cards.forEach((c, j) => on(c, "click", (e) => { if (j !== ci) { e.preventDefault(); go(j); restart(); } }));
      on(window, "resize", () => go(ci));
      go(0);
      restart();
    });

    // Horizontal scroller with buttons: [data-scroller] > .irow and [data-scroll="-1"|"1"]
    $$<HTMLElement>("[data-scroller]").forEach((root) => {
      const row = $<HTMLElement>(".irow", root) || $<HTMLElement>("[data-scroll-track]", root);
      if (!row) return;
      $$<HTMLElement>("[data-scroll]", root).forEach((b) => on(b, "click", () => row.scrollBy({ left: Number(b.dataset.scroll) * 368, behavior: "smooth" })));
    });

    // Parallax: [data-parallax] section with children [data-speed="0.1"]
    $$<HTMLElement>("[data-parallax]").forEach((sec) => {
      const els = $$<HTMLElement>("[data-speed]", sec);
      const f = () => {
        if (window.innerWidth < 960) { els.forEach((e) => (e.style.transform = "")); return; }
        const r = sec.getBoundingClientRect(), mid = r.top + r.height / 2 - window.innerHeight / 2;
        els.forEach((e) => (e.style.transform = `translateY(${Math.max(-70, Math.min(70, mid * Number(e.dataset.speed)))}px)`));
      };
      if (!reduce) { on(window, "scroll", f, { passive: true }); on(window, "resize", f); f(); }
    });

    // Marquee: [data-marquee] track is duplicated for a seamless loop (the copy is hidden from assistive tech)
    $$<HTMLElement>("[data-marquee]").forEach((t) => {
      if (t.dataset.duped) return;
      t.dataset.duped = "1";
      const before = t.children.length;
      t.insertAdjacentHTML("beforeend", t.innerHTML);
      Array.from(t.children).slice(before).forEach((c) => c.setAttribute("aria-hidden", "true"));
      undo.push(() => { Array.from(t.children).slice(before).forEach((c) => c.remove()); delete t.dataset.duped; });
    });

    // Typing text: [data-typing="text"]
    $$<HTMLElement>("[data-typing]").forEach((el) => {
      const txt = el.dataset.typing || "";
      if (reduce) { el.textContent = txt; return; }
      let started = false;
      const io = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting || started) return;
        started = true;
        let i = 0;
        const t = every(() => { el.textContent = txt.slice(0, ++i); if (i >= txt.length) window.clearInterval(t); }, 32);
      });
      io.observe(el);
      undo.push(() => io.disconnect());
    });

    // Counters for real numbers only: [data-count="2011"] with optional data-from
    $$<HTMLElement>("[data-count]").forEach((el) => {
      const end = Number(el.dataset.count), start = Number(el.dataset.from || 0);
      if (reduce) { el.textContent = String(end); return; }
      const io = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / 1400);
          el.textContent = String(Math.round(start + (end - start) * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      io.observe(el);
      undo.push(() => io.disconnect());
    });

    // Filters: one or more [data-filter] groups of button[data-f]; items [data-cat="a b"] inside [data-filter-items]
    const groups = $$<HTMLElement>("[data-filter]"), items = $$<HTMLElement>("[data-filter-items] [data-cat]");
    const apply = () => {
      const picks = groups.map((g) => g.querySelector<HTMLElement>('button[aria-pressed="true"]')?.dataset.f || "all");
      items.forEach((it) => {
        const tags = (it.dataset.cat || "").split(" ");
        it.classList.toggle("is-hidden", !picks.every((f) => f === "all" || tags.includes(f)));
      });
    };
    groups.forEach((g) => $$<HTMLElement>("button[data-f]", g).forEach((b) => on(b, "click", () => {
      $$<HTMLElement>("button[data-f]", g).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      apply();
    })));

    // Table of contents highlight: [data-toc] with links to #ids
    $$<HTMLElement>("[data-toc]").forEach((nav) => {
      const links = $$<HTMLAnchorElement>('a[href^="#"]', nav), map = new Map(links.map((a) => [a.getAttribute("href")!.slice(1), a]));
      const io = new IntersectionObserver(
        (es) => es.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.classList.remove("on"));
          map.get(e.target.id)?.classList.add("on");
        }),
        { rootMargin: "-20% 0px -70% 0px" },
      );
      map.forEach((_, id) => { const t = document.getElementById(id); if (t) io.observe(t); });
      undo.push(() => io.disconnect());
    });

    // Reveal on scroll (.rv) and line drawing ([data-wf], [data-draw])
    const rio = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    $$<HTMLElement>(".rv, [data-wf], [data-draw]").forEach((el) => rio.observe(el));
    undo.push(() => rio.disconnect());

    // Mobile menu button for the simple header, if a page uses it: [data-menu] controlling #mnav
    const mb = $<HTMLElement>("[data-menu]"), mn = $<HTMLElement>("#mnav");
    if (mb && mn) on(mb, "click", () => {
      const open = mn.classList.toggle("open");
      mb.setAttribute("aria-expanded", String(open));
      mb.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // Demo form validation is NOT used on the live site: real forms submit through their own handlers.
    return () => undo.forEach((fn) => fn());
  }, [pathname]);
  return null;
}
