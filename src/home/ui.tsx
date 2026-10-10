"use client";
import React, { createContext, useContext } from "react";
import type { Content } from "../content";
import { RichContent } from "../rich-content";
import { homeTexts } from "./copy";

export type HomeContextValue = {
  content: Content;
  paths: string[];
  preview: boolean;
  linkMap: Record<string, string>;
  order: string[];
};
export const HomeContext = createContext<HomeContextValue | null>(null);
export function useHome() {
  const value = useContext(HomeContext);
  if (!value) throw new Error("Homepage context missing");
  return value;
}

export function useText() {
  const { content } = useHome();
  return (slot: string) =>
    (content.texts[slot] ?? homeTexts[slot] ?? "").trim();
}

export function T({ k }: { k: string }) {
  const { content } = useHome();
  const text = useText();
  return <RichContent content={content} field={`texts.${k}`} text={text(k)} />;
}

export function Block({
  k,
  as: Tag = "p",
  className,
}: {
  k: string;
  as?: "p" | "div";
  className?: string;
}) {
  const { content } = useHome();
  const text = useText();
  if (content.richText?.[`texts.${k}`])
    return (
      <div className={className}>
        <RichContent
          content={content}
          field={`texts.${k}`}
          text={text(k)}
          block
        />
      </div>
    );
  return (
    <Tag className={className}>
      <RichContent content={content} field={`texts.${k}`} text={text(k)} />
    </Tag>
  );
}

export function useDestination() {
  const { paths, preview, linkMap } = useHome();
  return (path: string): string | undefined => {
    if (path.startsWith("#")) return path;
    const [base, fragment] = path.split("#");
    const href = preview
      ? linkMap[base]
      : paths.includes(base)
        ? base
        : undefined;
    return href && fragment ? `${href}#${fragment}` : href;
  };
}

type Gtag = { gtag?: (...args: unknown[]) => void };
export function useTrack() {
  const { preview } = useHome();
  return (event: string, hub: string, destination: string) => {
    if (!preview)
      (window as unknown as Gtag).gtag?.("event", event, {
        hub,
        destination: destination.split("?")[0],
      });
  };
}

export function selectService(service: string) {
  const select = document.querySelector<HTMLSelectElement>("#service");
  if (!select) return;
  select.value = service;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

export const container = "mx-auto w-full max-w-[1200px] px-5 sm:px-8";

const buttonStyles = {
  primary:
    "h-12 rounded-full bg-n-indigo px-6 text-white hover:bg-n-indigo-dark",
  outline:
    "h-12 rounded-full border border-n-ink/15 bg-white px-6 text-n-ink hover:border-n-ink/40 hover:bg-n-paper",
  light: "h-12 rounded-full bg-white px-6 text-n-ink hover:bg-n-indigo-50",
  lime: "h-12 rounded-full bg-n-lime px-6 text-n-ink hover:bg-white",
  ghost: "h-12 rounded-full border border-white/40 px-6 text-white hover:bg-white/10",
  text: "text-n-indigo underline decoration-n-indigo/30 underline-offset-[6px] hover:decoration-n-indigo",
} as const;

export function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="inline-block transition-transform duration-150 group-hover/btn:translate-x-0.5"
    >
      →
    </span>
  );
}

export function Cta({
  children,
  service = "",
  hub = "general",
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  service?: string;
  hub?: string;
  variant?: keyof typeof buttonStyles;
  className?: string;
}) {
  const track = useTrack();
  return (
    <a
      href="#contact"
      data-track="consultation_click"
      data-hub={hub}
      data-service={service || undefined}
      onClick={() => {
        if (service) selectService(service);
        track("consultation_click", hub, "#contact");
      }}
      className={`group/btn inline-flex items-center gap-3 text-[15px] font-medium transition-all duration-200 ${buttonStyles[variant]} ${className}`}
    >
      {children}
      <Arrow />
    </a>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "outline",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof buttonStyles;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group/btn inline-flex items-center gap-3 text-[15px] font-medium transition-all duration-200 ${buttonStyles[variant]} ${className}`}
    >
      {children}
      <Arrow />
    </a>
  );
}

// Unpublished destinations render as plain text so visitors never hit a 404.
export function PageLink({
  path,
  children,
  hub,
  className = "",
  planned = false,
}: {
  path: string;
  children: React.ReactNode;
  hub?: string;
  className?: string;
  planned?: boolean;
}) {
  const href = useDestination()(path);
  const track = useTrack();
  if (!href)
    return planned ? (
      <span
        className={`planned-topic ${className.replace(/\bhover:\S+/g, "")} [&>[aria-hidden]]:hidden`}
      >
        {children}
      </span>
    ) : null;
  return (
    <a
      href={href}
      data-published-link="true"
      data-track={hub ? "service_hub_click" : undefined}
      data-hub={hub}
      onClick={hub ? () => track("service_hub_click", hub, href) : undefined}
      className={`group/btn ${className}`}
    >
      {children}
    </a>
  );
}

export function Section({
  id,
  children,
  className = "",
  labelledBy,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  const { content } = useHome();
  if (content.hiddenSections?.includes(id)) return null;
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={labelledBy}
      className={className}
    >
      {children}
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  intro,
  id,
  dark = false,
  center = false,
  small = false,
}: {
  section?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  id: string;
  dark?: boolean;
  center?: boolean;
  /** Smaller heading for secondary sections. */
  small?: boolean;
}) {
  return (
    <header
      data-reveal
      className={
        center
          ? "mx-auto max-w-[820px] text-center"
          : intro
            ? "grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10"
            : "max-w-[880px]"
      }
    >
      <div className={center || !intro ? "" : "lg:col-span-7"}>
        <p
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-medium ${dark ? "bg-white/10 text-white/80" : "bg-n-indigo-50 text-n-indigo"}`}
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-n-lime" />
          <T k={eyebrow} />
        </p>
        <h2
          id={id}
          className={`mt-5 font-semibold tracking-[-0.035em] ${small ? "text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.1]" : "text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.05]"}`}
        >
          {title}
        </h2>
      </div>
      {intro && (
        <Block
          k={intro}
          className={`text-[18px] leading-[1.6] ${center ? "mx-auto mt-5 max-w-[60ch]" : "max-w-[46ch] lg:col-span-5 lg:justify-self-end"} ${dark ? "text-white/70" : "text-n-muted"}`}
        />
      )}
    </header>
  );
}
