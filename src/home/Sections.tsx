"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  engagements,
  faqs,
  hubs,
  indiaPoints,
  industries,
  roleGroups,
  stack,
  startPoints,
  stats,
  steps,
  supporting,
} from "./copy";
import { HeroMockup } from "./HeroMockup";
import { TechIcon } from "../brand-icon";
import { Icon } from "./icons";
import {
  Arrow,
  Block,
  ButtonLink,
  Cta,
  PageLink,
  Section,
  SectionHead,
  T,
  container,
  selectService,
  useDestination,
  useHome,
  useText,
} from "./ui";

const mono =
  "font-n-mono text-[12px] uppercase tracking-[0.08em] text-n-muted";
const card =
  "rounded-n-card border border-n-ink/[0.07] bg-white shadow-n-card";
const lift =
  "transition-all duration-300 hover:-translate-y-1 hover:shadow-n-float";

export function Hero() {
  const { content } = useHome();
  const facts = [
    ["home-86", "home-105", "software"],
    ["home-106", "home-110", "mobile"],
    ["home-111", "home-112", "travel"],
    ["home-131", "home-137", "team"],
  ];
  return (
    <Section
      id="hero"
      labelledBy="hero-title"
      className="relative overflow-hidden border-b border-n-ink/[0.06] bg-white"
    >
      <div className={`${container} relative pt-16 pb-20 text-center lg:pt-24 lg:pb-28`}>
        <p
          data-reveal
          className="inline-flex items-center gap-2.5 rounded-full border border-n-ink/10 bg-white px-4 py-1.5 text-[13px] font-medium text-n-ink/80"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-n-lime" />
          <T k="t0" />
        </p>
        <h1
          id="hero-title"
          data-reveal="1"
          className="mx-auto mt-8 max-w-[16ch] text-[clamp(2.375rem,7vw,5.25rem)] leading-[1] font-semibold tracking-[-0.045em]"
        >
          <T k="t1" />
          <br />
          <span className="text-n-indigo">
            <T k="t2" />
          </span>
        </h1>
        <div data-reveal="2">
          <Block
            k="t4"
            className="mx-auto mt-7 max-w-[60ch] text-[18px] leading-[1.6] text-n-muted lg:text-[19px]"
          />
        </div>
        <div data-reveal="3" className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Cta hub="hero">
            <T k="home-49" />
          </Cta>
          <ButtonLink href="#services">
            <T k="hero-secondary" />
          </ButtonLink>
        </div>
        <div data-reveal="4" className="mt-16 lg:mt-20">
          <HeroMockup />
        </div>
      </div>
      {!content.hiddenSections?.includes("section-0") && (
        <div className="relative border-t border-n-ink/[0.06] bg-n-paper" data-section="section-0">
          <dl className={`${container} grid gap-y-6 py-8 sm:grid-cols-2 lg:grid-cols-4`}>
            {facts.map(([title, detail, icon], i) => (
              <div
                key={title}
                data-reveal={i}
                className="flex items-start gap-3.5 pr-4"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-n-indigo-50 text-n-indigo">
                  <Icon name={icon} className="size-5" />
                </span>
                <div>
                  <dt className="text-[16px] font-semibold tracking-[-0.01em]">
                    <T k={title} />
                  </dt>
                  <dd className="mt-0.5 text-[14px] leading-[1.45] text-n-muted">
                    <T k={detail} />
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Section>
  );
}

// Arrow-key navigation shared by the tab sets on the page.
function useTabKeys<T extends { id: string }>(
  items: readonly T[],
  active: string,
  setActive: (id: string) => void,
  idFor: (id: string) => string,
) {
  return (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = items.findIndex((p) => p.id === active);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (index +
              (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) +
              items.length) %
            items.length;
    setActive(items[next].id);
    document.getElementById(idFor(items[next].id))?.focus();
  };
}

const hubTheme = {
  software: { panel: "bg-n-indigo-50", accent: "bg-n-indigo text-white" },
  mobile: { panel: "bg-n-lime-50", accent: "bg-n-lime text-n-ink" },
  ai: { panel: "bg-n-sky-50", accent: "bg-[#1f5f86] text-white" },
  cloud: { panel: "bg-n-sand-50", accent: "bg-n-ink text-white" },
} as const;

function HubVisual({ id }: { id: keyof typeof hubTheme }) {
  const frame = `${card} w-full max-w-[420px] p-5`;
  if (id === "mobile")
    return (
      <div className="flex items-end justify-center gap-5">
        {[0, 1].map((n) => (
          <div
            key={n}
            className={`w-[168px] rounded-[30px] border-[6px] border-n-ink bg-white p-3 shadow-n-float ${n ? "mb-10 hidden sm:block" : ""}`}
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-n-ink/80" />
            <p className="mt-4 text-[11px] text-n-muted">{n ? "Bookings" : "Good morning"}</p>
            <p className="text-[14px] font-semibold">{n ? "Today, 4 visits" : "Your orders"}</p>
            <div className="mt-3 space-y-2">
              {[0, 1, 2].map((r) => (
                <div key={r} className="flex items-center gap-2 rounded-xl bg-n-paper p-2">
                  <span className={`size-6 rounded-lg ${r === 0 ? "bg-n-lime" : "bg-n-indigo-100"}`} />
                  <span className="flex-1 space-y-1">
                    <span className="block h-1.5 w-4/5 rounded bg-n-ink/20" />
                    <span className="block h-1.5 w-1/2 rounded bg-n-ink/10" />
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-full bg-n-indigo py-2 text-center text-[11px] font-medium text-white">
              {n ? "Confirm visit" : "Track delivery"}
            </div>
          </div>
        ))}
      </div>
    );
  if (id === "ai")
    return (
      <div className={frame}>
        <p className="flex items-center gap-2 text-[12px] font-semibold">
          <span className="inline-flex size-6 items-center justify-center rounded-lg bg-[#1f5f86] text-white">
            <Icon name="ai" className="size-3.5" />
          </span>
          Operations assistant
        </p>
        <div className="mt-4 space-y-2.5 text-[12.5px] leading-[1.45]">
          <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-n-ink px-3.5 py-2 text-white">
            Which invoices are still waiting on approval?
          </p>
          <p className="max-w-[88%] rounded-2xl rounded-bl-md bg-n-sky-50 px-3.5 py-2">
            7 invoices are pending. 3 are over 14 days old. I&apos;ve drafted reminders for review.
          </p>
          <div className="flex gap-2 pt-1">
            <span className="rounded-full border border-n-line px-2.5 py-1 text-[11px]">Review drafts</span>
            <span className="rounded-full border border-n-line px-2.5 py-1 text-[11px]">Show oldest</span>
          </div>
        </div>
      </div>
    );
  if (id === "cloud")
    return (
      <div className={frame}>
        <p className="text-[12px] font-semibold">Deployment pipeline</p>
        <ol className="mt-4 space-y-2.5">
          {[
            ["Build & test", "2m 14s", true],
            ["Security scan", "48s", true],
            ["Deploy to staging", "1m 02s", true],
            ["Production release", "running", false],
          ].map(([step, time, done]) => (
            <li key={step as string} className="flex items-center gap-3 rounded-xl bg-n-paper px-3 py-2.5 text-[12.5px]">
              <span
                className={`inline-flex size-5 items-center justify-center rounded-full ${done ? "bg-n-lime" : "border-2 border-n-indigo border-t-transparent animate-spin"}`}
              >
                {done && (
                  <svg viewBox="0 0 10 10" className="size-2.5">
                    <path d="m2 5 2 2 4-4" fill="none" stroke="#0f1420" strokeWidth="1.6" />
                  </svg>
                )}
              </span>
              <span className="flex-1 font-medium">{step}</span>
              <span className="font-n-mono text-[11px] text-n-muted">{time}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  return (
    <div className={frame}>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold">Operations dashboard</p>
        <span className="rounded-full bg-n-lime-50 px-2 py-0.5 text-[10px] font-medium text-[#5b6a00]">Live</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Orders", "1,284"],
          ["Pending", "32"],
          ["On time", "97%"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-n-paper p-2.5">
            <p className="text-[10px] text-n-muted">{label}</p>
            <p className="text-[15px] font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-24 items-end gap-1.5 rounded-xl bg-n-paper p-3">
        {[30, 45, 38, 60, 52, 70, 64, 82, 76, 90].map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={`flex-1 rounded-t-[3px] ${i > 7 ? "bg-n-indigo" : "bg-n-indigo-100"}`}
          />
        ))}
      </div>
    </div>
  );
}

function StartPoint() {
  const [active, setActive] = useState<string>("product");
  const onKey = useTabKeys(startPoints, active, setActive, (id) => `goal-${id}`);
  return (
    <div data-reveal className={`${card} mt-8 grid overflow-hidden lg:grid-cols-12`}>
      <div className="border-b border-n-line/70 bg-n-paper/60 p-6 lg:col-span-4 lg:border-r lg:border-b-0 lg:p-8">
        <p className={mono}>
          <T k="home-29" />
        </p>
        <div
          role="tablist"
          aria-label="Choose your project starting point"
          aria-orientation="vertical"
          className="mt-5 flex flex-col gap-1"
        >
          {startPoints.map((point) => (
            <button
              key={point.id}
              type="button"
              role="tab"
              id={`goal-${point.id}`}
              aria-selected={active === point.id}
              aria-controls={`panel-${point.id}`}
              tabIndex={active === point.id ? 0 : -1}
              onClick={() => setActive(point.id)}
              onKeyDown={onKey}
              className={`rounded-xl px-4 py-3 text-left text-[16px] transition-all duration-200 ${active === point.id ? "bg-white font-medium text-n-ink shadow-n-card" : "text-n-muted hover:bg-white/70 hover:text-n-ink"}`}
            >
              <T k={point.tab} />
            </button>
          ))}
        </div>
      </div>
      {startPoints.map((point) => (
        <div
          key={point.id}
          role="tabpanel"
          id={`panel-${point.id}`}
          aria-labelledby={`goal-${point.id}`}
          hidden={active !== point.id}
          className="flex flex-col justify-between gap-10 p-6 lg:col-span-8 lg:p-10"
        >
          <div>
            <h3 className="max-w-[24ch] text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.15] font-semibold tracking-[-0.025em]">
              <T k={point.title} />
            </h3>
            <Block
              k={point.body}
              className="mt-4 max-w-[56ch] text-[16px] leading-[1.6] text-n-muted"
            />
          </div>
          <div>
            <Cta service={point.service} hub={`project-finder-${point.id}`}>
              <T k={point.cta} />
            </Cta>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Services() {
  const [active, setActive] = useState<string>(hubs[0].id);
  const onKey = useTabKeys(hubs, active, setActive, (id) => `hub-tab-${id}`);
  // Older links point at #software, #mobile-ai etc.; open the matching tab.
  useEffect(() => {
    const open = () => {
      const hub = hubs.find((h) => `#${h.anchor}` === window.location.hash);
      if (!hub) return;
      setActive(hub.id);
      requestAnimationFrame(() =>
        document.getElementById(`hub-panel-${hub.id}`)?.scrollIntoView({ block: "start" }),
      );
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return (
    <Section id="services" labelledBy="services-title" className="scroll-mt-20 bg-white py-20 lg:py-28">
      <div className={container}>
        <SectionHead
          center
          section="services"
          id="services-title"
          eyebrow="home-138"
          title={
            <>
              <T k="services-title-1" />
              <br />
              <span className="text-n-muted">
                <T k="services-title-2" />
              </span>
            </>
          }
          intro="home-4"
        />
        <div
          role="tablist"
          aria-label="Choose a service area"
          data-reveal
          className="no-scrollbar mx-auto mt-12 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-n-ink/[0.08] bg-n-paper p-1.5"
        >
          {hubs.map((hub) => (
            <button
              key={hub.id}
              type="button"
              role="tab"
              id={`hub-tab-${hub.id}`}
              aria-selected={active === hub.id}
              aria-controls={`hub-panel-${hub.id}`}
              tabIndex={active === hub.id ? 0 : -1}
              onClick={() => setActive(hub.id)}
              onKeyDown={onKey}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-medium whitespace-nowrap transition-all duration-200 sm:px-5 ${active === hub.id ? "bg-white text-n-ink shadow-n-card" : "text-n-muted hover:text-n-ink"}`}
            >
              <Icon name={hub.id} className="size-4" />
              <T k={hub.tag} />
            </button>
          ))}
        </div>
        {hubs.map((hub) => (
          <div
            key={hub.id}
            id={`hub-panel-${hub.id}`}
            role="tabpanel"
            aria-labelledby={`hub-tab-${hub.id}`}
            hidden={active !== hub.id}
            data-hub={hub.id}
            className={`hub-card mt-8 grid scroll-mt-24 items-center gap-10 overflow-hidden rounded-[28px] p-7 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14 ${hubTheme[hub.id].panel}`}
          >
            <span id={hub.anchor} className="sr-only" />
            <div>
              <span className={`inline-flex size-12 items-center justify-center rounded-2xl ${hubTheme[hub.id].accent}`}>
                <Icon name={hub.id} className="size-6" />
              </span>
              <h3 className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.03em]">
                <T k={hub.title} />
              </h3>
              <Block
                k={hub.body}
                className="mt-4 max-w-[50ch] text-[17px] leading-[1.6] text-n-ink/70"
              />
              <ul className="mt-7 flex flex-wrap gap-2">
                {hub.links.map(([label, path]) => (
                  <li key={path}>
                    <PageLink
                      path={path}
                      hub={hub.id}
                      planned
                      className="inline-flex items-center gap-1.5 rounded-full border border-n-ink/10 bg-white/80 px-3.5 py-1.5 text-[14px] transition-colors duration-150 hover:border-n-indigo hover:text-n-indigo"
                    >
                      {label}
                    </PageLink>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <PageLink
                  path={hub.parent}
                  hub={hub.id}
                  className="inline-flex h-12 items-center gap-3 rounded-full bg-n-ink px-6 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-n-ink-2"
                >
                  <T k={hub.explore} />
                  <Arrow />
                </PageLink>
                <Cta service={hub.service} hub={hub.id} variant="text">
                  Discuss your project
                </Cta>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <HubVisual id={hub.id} />
            </div>
          </div>
        ))}
        <StartPoint />
      </div>
    </Section>
  );
}

export function Results() {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (direction: number) => {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  };
  const nav =
    "inline-flex size-11 items-center justify-center rounded-full border border-n-ink/15 bg-white text-n-ink transition-colors duration-150 hover:border-n-ink/40";
  return (
    <Section id="results" labelledBy="results-title" className="overflow-hidden py-20 lg:py-28">
      <div className={container}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            section="results"
            id="results-title"
            eyebrow="results-eyebrow"
            title={
              <>
                <T k="results-title" />
                <br />
                <span className="text-n-muted">
                  <T k="results-title-2" />
                </span>
              </>
            }
          />
          <div className="flex gap-2">
            <button type="button" aria-label="Previous" onClick={() => scroll(-1)} className={nav}>
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" aria-label="Next" onClick={() => scroll(1)} className={nav}>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <Block
          k="results-intro"
          className="mt-6 max-w-[60ch] text-[18px] leading-[1.6] text-n-muted"
        />
      </div>
      <ul
        ref={track}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-6 sm:scroll-px-8 sm:px-8 xl:scroll-px-[calc((100vw-1200px)/2+32px)] xl:px-[calc((100vw-1200px)/2+32px)]"
      >
        {stats.map(([value, label, href], i) => (
          <li
            key={value + label}
            data-reveal={i}
            className={`${card} ${lift} flex w-[280px] shrink-0 snap-start flex-col p-7 sm:w-[300px]`}
          >
            <p className="flex items-start text-[64px] leading-none font-semibold tracking-[-0.05em] text-n-indigo">
              <T k={value} />
              <span aria-hidden="true" className="mt-2 ml-1 size-3 rounded-full bg-n-lime" />
            </p>
            <p className="mt-5 flex-1 text-[16px] leading-[1.5] text-n-ink/80">
              <T k={label} />
            </p>
            <a
              href={href}
              className="group/btn mt-7 inline-flex items-center gap-2 text-[14px] font-medium text-n-indigo"
            >
              Learn more <Arrow />
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const supportIcons: Record<string, string> = {
  design: "demand",
  quality: "insurance",
  transformation: "factory",
  team: "team",
  web: "retail",
  search: "finance",
};

export function Supporting() {
  return (
    <Section id="supporting-services" labelledBy="supporting-title" className="bg-white py-20 lg:py-28">
      <div className={container}>
        <SectionHead
          center
          section="supporting-services"
          id="supporting-title"
          eyebrow="home-244"
          title={
            <>
              <T k="home-245" />
              <br />
              <T k="home-246" />
            </>
          }
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {supporting.map((item, i) => (
            <article
              key={item.title}
              data-hub={item.hub}
              data-reveal={i % 3}
              className={`${"service" in item ? "hub-card " : ""}${card} ${lift} group flex flex-col p-7 lg:p-8`}
            >
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-n-indigo-50 text-n-indigo transition-colors duration-300 group-hover:bg-n-indigo group-hover:text-white">
                <Icon name={supportIcons[item.hub]} className="size-6" />
              </span>
              <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.015em]">
                <T k={item.title} />
              </h3>
              <Block
                k={item.body}
                className="mt-3 flex-1 text-[15px] leading-[1.6] text-n-muted"
              />
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px]">
                <PageLink
                  path={item.path}
                  hub={item.hub}
                  className="inline-flex items-center gap-2 font-medium text-n-indigo"
                >
                  Learn more <Arrow />
                </PageLink>
                {"service" in item && (
                  <Cta service={item.service} hub={item.hub} variant="text" className="text-[14px]!">
                    Discuss your project
                  </Cta>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Process() {
  const text = useText();
  return (
    <Section id="delivery" labelledBy="delivery-title" className="scroll-mt-20 py-20 lg:py-28">
      <div className={container}>
        <SectionHead
          section="delivery"
          id="delivery-title"
          eyebrow="home-287"
          title={
            <>
              <T k="home-288" />
              <br />
              <span className="text-n-muted">
                <T k="home-289" />
              </span>
            </>
          }
        />
        <ol className="relative mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <span
            aria-hidden="true"
            className="absolute top-[27px] right-[12%] left-[12%] hidden h-px border-t-2 border-dashed border-n-indigo/25 lg:block"
          />
          {steps.map(([title, body, deliverables], i) => (
            <li key={title} data-reveal={i} className="relative flex flex-col">
              <span className="relative z-10 inline-flex size-14 items-center justify-center self-start rounded-2xl bg-n-indigo text-[18px] font-semibold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={`${card} mt-5 flex flex-1 flex-col p-6`}>
                <h3 className="text-[20px] font-semibold tracking-[-0.02em]">
                  <T k={title} />
                </h3>
                <Block
                  k={body}
                  className="mt-3 flex-1 text-[15px] leading-[1.6] text-n-muted"
                />
                <div className="mt-6 rounded-xl bg-n-paper p-4">
                  <p className={mono}>You receive</p>
                  <ul className="mt-3 space-y-2">
                    {text(deliverables)
                      .split("·")
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[14px]">
                          <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-n-lime" />
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}


export function Stack() {
  return (
    <Section id="section-1" labelledBy="stack-title" className="border-y border-n-ink/[0.06] bg-white py-20 lg:py-28">
      <div className={container}>
        <SectionHead
          center
          section="section-1"
          id="stack-title"
          eyebrow="home-228"
          title={<T k="stack-title" />}
        />
        <dl className="mt-14 grid gap-5 sm:grid-cols-2">
          {stack.map(([group, items], i) => (
            <div key={group} data-reveal={i % 2} className={`${card} p-6 lg:p-7`}>
              <dt className="text-[17px] font-semibold">
                <T k={group} />
              </dt>
              <dd className="mt-4 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-n-ink/[0.08] bg-n-paper px-3 py-1.5 text-[14px]"
                  >
                    <TechIcon name={item} className="size-4" />
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

export function India() {
  return (
    <Section id="india" labelledBy="india-title" className="scroll-mt-20 py-20 lg:py-28">
      <div className={container}>
        <SectionHead
          section="india"
          id="india-title"
          eyebrow="home-271"
          title={
            <>
              <T k="home-272" />
              <br />
              <span className="text-n-muted">
                <T k="home-273" /> <T k="home-274" />
              </span>
            </>
          }
          intro="home-275"
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {indiaPoints.map(([label, title, body], i) => (
            <article key={label} data-reveal={i} className={`${card} ${lift} p-7 lg:p-8`}>
              <p className="inline-flex rounded-full bg-n-lime-50 px-3 py-1 text-[13px] font-medium text-[#5b6a00]">
                <T k={label} />
              </p>
              <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.02em]">
                <T k={title} />
              </h3>
              <Block
                k={body}
                className="mt-3 text-[15px] leading-[1.6] text-n-muted"
              />
            </article>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="#delivery">How we work</ButtonLink>
        </div>
      </div>
    </Section>
  );
}

export function Hire() {
  const destination = useDestination();
  const fallback = destination("/hire-developers") ?? "#contact";
  return (
    <Section id="hire" labelledBy="hire-title" className="scroll-mt-20 bg-white py-20 lg:py-28">
      <div className={container}>
        <SectionHead
          section="hire"
          id="hire-title"
          eyebrow="home-314"
          title={
            <>
              <T k="home-315" />
              <br />
              <span className="text-n-muted">
                <T k="home-316" />
              </span>
            </>
          }
          intro="home-317"
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {engagements.map(([title, body], i) => (
            <article
              key={title}
              data-reveal={i}
              className={`${lift} rounded-n-card p-7 lg:p-8 ${i === 1 ? "bg-n-ink text-white shadow-n-float" : "border border-n-ink/[0.07] bg-n-paper"}`}
            >
              <span
                className={`inline-flex size-10 items-center justify-center rounded-xl text-[15px] font-semibold ${i === 1 ? "bg-n-lime text-n-ink" : "bg-white text-n-indigo shadow-n-card"}`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <h3 className="mt-6 text-[21px] font-semibold tracking-[-0.02em]">
                <T k={title} />
              </h3>
              <Block
                k={body}
                className={`mt-3 text-[15px] leading-[1.6] ${i === 1 ? "text-white/70" : "text-n-muted"}`}
              />
            </article>
          ))}
        </div>
        <div className="role-grid mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roleGroups.map(([group, roles]) => (
            <div key={group} className={`${card} p-5`}>
              <h3 className={mono}>{group}</h3>
              <ul className="mt-3">
                {roles.map(([label, path]) => {
                  const href = destination(path);
                  return (
                    <li key={path} className="border-b border-n-line/70 last:border-b-0">
                      <a
                        href={href ?? fallback}
                        data-published-link={href ? "true" : undefined}
                        data-service={href ? undefined : "Help defining the scope"}
                        title={href ? undefined : "Discuss this developer role and project requirements"}
                        onClick={href ? undefined : () => selectService("Help defining the scope")}
                        className="group/btn flex items-center justify-between py-2.5 text-[15px] transition-colors duration-150 hover:text-n-indigo"
                      >
                        {label}
                        <Arrow />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Cta service="Help defining the scope" hub="hire" variant="outline">
            <T k="home-348" />
          </Cta>
          <PageLink
            path="/hire-developers"
            className="inline-flex items-center gap-2 text-[15px] font-medium text-n-indigo"
          >
            <T k="home-350" />
            <Arrow />
          </PageLink>
        </div>
      </div>
    </Section>
  );
}

export function Industries() {
  return (
    <Section id="industries" labelledBy="industries-title" className="scroll-mt-20 py-20 lg:py-28">
      <div className={container}>
        <SectionHead
          center
          section="industries"
          id="industries-title"
          eyebrow="home-298"
          title={
            <>
              <T k="home-299" />
              <br />
              <T k="home-300" />
            </>
          }
          intro="home-301"
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map(([name, detail, icon], i) => (
            <li
              key={name}
              data-reveal={i % 4}
              className={`${card} ${lift} group flex items-start gap-4 p-5`}
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-n-indigo-50 text-n-indigo transition-colors duration-300 group-hover:bg-n-indigo group-hover:text-white">
                <Icon name={icon} className="size-5" />
              </span>
              <div>
                <p className="text-[15px] font-semibold">
                  <T k={name} />
                </p>
                <p className="mt-0.5 text-[13.5px] leading-[1.45] text-n-muted">
                  <T k={detail} />
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

export function Work({
  listing,
}: {
  listing: { path: string; kind: string; title: string; description: string }[];
}) {
  const destination = useDestination();
  const studies = listing.flatMap((page) => {
    const href = page.path.startsWith("/case-studies/")
      ? destination(page.path)
      : undefined;
    return href ? [{ ...page, href }] : [];
  });
  if (!studies.length) return null;
  const tints = ["bg-n-indigo-50", "bg-n-lime-50", "bg-n-sky-50", "bg-n-sand-50"];
  return (
    <Section id="work" labelledBy="work-title" className="scroll-mt-20 bg-white py-20 lg:py-28">
      <div className={container}>
        <SectionHead
          section="work"
          id="work-title"
          eyebrow="home-0"
          title={
            <>
              <T k="home-353" />
              <br />
              <T k="home-354" />
            </>
          }
          intro="home-1"
        />
        <div className="proof-grid mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study, i) => (
            <a
              key={study.path}
              href={study.href}
              data-reveal={i % 3}
              className={`proof-card group/btn ${card} ${lift} flex flex-col overflow-hidden`}
            >
              <span className={`flex h-36 items-end p-6 ${tints[i % tints.length]}`}>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-n-ink uppercase">
                  Case study
                </span>
              </span>
              <span className="flex flex-1 flex-col p-6">
                <h3 className="text-[20px] font-semibold tracking-[-0.02em]">
                  {study.title}
                </h3>
                <p className="mt-3 flex-1 text-[15px] leading-[1.6] text-n-muted">
                  {study.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-n-indigo">
                  Read the case study <Arrow />
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Faq() {
  return (
    <Section id="faq" labelledBy="faq-title" className="py-20 lg:py-28">
      <div className={`${container} grid gap-12 lg:grid-cols-12`}>
        <div className="lg:col-span-5">
          <SectionHead
            section="faq"
            id="faq-title"
            eyebrow="faq-eyebrow"
            title={<T k="faq-title" />}
          />
        </div>
        <div className="space-y-3 lg:col-span-7">
          {faqs.map(([question, answer], i) => (
            <details
              key={question}
              data-reveal={i}
              className="group rounded-2xl border border-n-ink/[0.07] bg-white px-6 transition-shadow duration-200 open:shadow-n-card"
            >
              <summary className="flex items-center justify-between gap-6 py-5 text-[clamp(1.0625rem,1.6vw,1.25rem)] font-medium tracking-[-0.015em]">
                <T k={question} />
                <span
                  aria-hidden="true"
                  className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-n-indigo-50 transition-transform duration-200 group-open:rotate-45"
                >
                  <span className="absolute h-[1.5px] w-3 bg-n-indigo" />
                  <span className="absolute h-3 w-[1.5px] bg-n-indigo" />
                </span>
              </summary>
              <Block
                k={answer}
                className="max-w-[68ch] pb-6 text-[16px] leading-[1.65] text-n-muted"
              />
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
