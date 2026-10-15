// Page shell for redesigned pages that are not rendered by V3Page (route pages such as the
// founder profile, career roles and the not-found page, and later the homepage).
import type { ReactNode } from "react";
import { StripeNavigation } from "../stripe-home-chrome";
import { SiteBehaviors } from "./behaviors";
import { SiteFooter } from "./footer";
import { Button, IconSprite, SiteStyles } from "./ui";

export function NxShell({
  page,
  paths,
  preview,
  linkMap,
  homeHref,
  contactHref,
  ctaHref = "/contact",
  mainClassName = "",
  children,
}: {
  /** Page stylesheet in public/assets/nx/pages/<page>.css */
  page?: string;
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  homeHref?: string;
  contactHref?: string;
  ctaHref?: string;
  mainClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="nx">
      <SiteStyles page={page} />
      <IconSprite />
      <StripeNavigation paths={paths} preview={preview} linkMap={linkMap} homeHref={homeHref} contactHref={contactHref} />
      <main id="main" className={mainClassName}>
        {children}
      </main>
      <SiteFooter paths={paths} preview={preview} linkMap={linkMap} homeHref={homeHref} contactHref={contactHref} />
      <div className="mcta" data-mcta>
        <Button href={ctaHref} data-track="consultation_click">Start a project</Button>
      </div>
      <SiteBehaviors />
    </div>
  );
}
