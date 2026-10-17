"use client";
import React, { createContext, useContext } from "react";
import type { Content } from "../content";
import { RichContent } from "../rich-content";
import { V2Icon } from "../site/v2/ui";
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

// Sets the enquiry form's service field (the form listens to it through the select element).
export function selectService(service: string) {
  const select = document.querySelector<HTMLSelectElement>("#f-svc");
  if (!select) return;
  select.value = service;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

// Unpublished destinations render as plain text (when planned) or are left out, so visitors never hit a 404.
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
      <span className={`planned-topic ${className}`.trim()}>{children}</span>
    ) : null;
  return (
    <a
      href={href}
      data-published-link="true"
      data-track={hub ? "service_hub_click" : undefined}
      data-hub={hub}
      onClick={hub ? () => track("service_hub_click", hub, href) : undefined}
      className={className || undefined}
    >
      {children}
    </a>
  );
}

// Button that opens the enquiry form with a service preselected (data-pre is read by the v2 behaviours too).
export function DiscussLink({
  service,
  hub,
  className = "",
  children,
}: {
  service: string;
  hub: string;
  className?: string;
  children: React.ReactNode;
}) {
  const track = useTrack();
  return (
    <a
      href="#contact"
      data-track="consultation_click"
      data-hub={hub}
      data-service={service}
      data-pre={service}
      onClick={() => {
        selectService(service);
        track("consultation_click", hub, "#contact");
      }}
      className={`btn btn--violet ${className}`.trim()}
    >
      {children} <V2Icon name="arrow" />
    </a>
  );
}

export function Section({
  id,
  children,
  className = "",
  labelledBy,
  attrs = {},
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
  /** Extra attributes for the wrapper, such as data-parallax or data-scroller. */
  attrs?: Record<string, string>;
}) {
  const { content } = useHome();
  if (content.hiddenSections?.includes(id)) return null;
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={labelledBy}
      className={className || undefined}
      {...attrs}
    >
      {children}
    </section>
  );
}
