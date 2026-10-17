// Page shell for v2 pages that are not rendered by V3Page (route pages such as the founder profile, career roles,
// the not-found page and the homepage). V3Page builds the same chrome itself for the V3 renderers.
import type { ReactNode } from "react";
import { StripeNavigation } from "../../stripe-home-chrome";
import { V2Behaviors } from "./behaviors";
import { V2Footer } from "./footer";
import { V2CtaBand, V2IconSprite, V2Styles } from "./ui";

export function V2Shell({
  page,
  home = false,
  paths,
  preview,
  linkMap,
  homeHref,
  contactHref,
  ctaHref = "/contact",
  cta = true,
  mainClassName = "",
  children,
}: {
  /** Page stylesheet public/assets/v2/pages/<page>.css (generated from html-prototype/v2/css/pages and css/live) */
  page?: string;
  /** Also load the homepage stylesheet */
  home?: boolean;
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  homeHref?: string;
  contactHref?: string;
  ctaHref?: string;
  /** Set false on pages that already end with their own form or CTA */
  cta?: boolean;
  mainClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="v2">
      <V2Styles page={page} home={home} />
      <V2IconSprite />
      <StripeNavigation paths={paths} preview={preview} linkMap={linkMap} homeHref={homeHref} contactHref={contactHref} />
      <main id="main" className={mainClassName}>
        {children}
        {cta && <V2CtaBand href={ctaHref} />}
      </main>
      <V2Footer paths={paths} preview={preview} linkMap={linkMap} homeHref={homeHref} contactHref={contactHref} />
      <V2Behaviors />
    </div>
  );
}
