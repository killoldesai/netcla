// Shared building blocks for the redesigned public pages. Markup and class names follow
// html-prototype/ (styles in public/assets/nx/, scoped under the .nx wrapper).
import type { ReactNode } from "react";
import { mediaPath } from "../media-path";
import { ICON_SPRITE, type IconName } from "./icon-sprite";

/** Bump when public/assets/nx/* changes so browsers fetch the new files. */
export const NX_VERSION = "20261016";

/** Design stylesheets: the shared site.css plus an optional page stylesheet (public/assets/nx/pages/<page>.css). */
export function SiteStyles({ page }: { page?: string }) {
  return (
    <>
      <link rel="stylesheet" href={`/assets/nx/site.css?v=${NX_VERSION}`} />
      <link rel="stylesheet" href={`/assets/nx/live.css?v=${NX_VERSION}`} />
      {page && <link rel="stylesheet" href={`/assets/nx/pages/${page}.css?v=${NX_VERSION}`} />}
    </>
  );
}

/** Inline icon symbols, rendered once per page (hidden). */
export function IconSprite() {
  return <div hidden dangerouslySetInnerHTML={{ __html: ICON_SPRITE }} />;
}

/** Stroke icon from the inline sprite. */
export function Icon({ name, size = 18, className = "nx-icon" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  );
}

/** Product icon from /assets/nx/icons.svg (code-brackets, mobile-device, brain-circuit, cloud-upload, settings-gear,
 *  layers-stack, shield-check, users-group, rocket-launch, chart-bar, document-text, api-plug, react-atom, ...). */
export function ProductIcon({ name, size = 26 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden="true">
      <use href={`/assets/nx/icons.svg#${name}`} />
    </svg>
  );
}

type Asset = { id: string; name?: string; src?: string; alt: string; width: number; height: number };

/**
 * Hero or section illustration: the page's own generated image when it has one, otherwise the
 * token-based fallback illustration for its page family.
 */
export function HeroArt({ asset, fallback, priority = false, className = "hero__art" }: { asset?: Asset | null; fallback?: ReactNode; priority?: boolean; className?: string }) {
  if (asset) {
    return (
      <figure className={`${className} nx-art--image`}>
        <img
          src={mediaPath(asset)}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
        />
      </figure>
    );
  }
  if (!fallback) return null;
  return <div className={className}>{fallback}</div>;
}

/** Eyebrow + h2 + optional lead, the prototype's section header. */
export function SectionHead({ eyebrow, title, lead, id, children }: { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; id?: string; children?: ReactNode }) {
  return (
    <div className="section-head nx-reveal">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="h-section" id={id}>{title}</h2>
      </div>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </div>
  );
}

/** Breadcrumb trail used above every inner-page hero. */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="nx-crumbs page-crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              {last || !item.href ? <span aria-current={last ? "page" : undefined}>{item.label}</span> : <a href={item.href}>{item.label}</a>}
              {!last && <Icon name="chevron-right" size={14} className="" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Primary/secondary pill button with the arrow nudge. */
export function Button({ href, children, variant = "primary", size, arrow = true, className = "", ...rest }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "lime" | "dark" | "ghost"; size?: "sm" | "lg"; arrow?: boolean; className?: string } & Record<string, unknown>) {
  return (
    <a href={href} className={`nx-btn nx-btn--${variant}${size ? ` nx-btn--${size}` : ""} ${className}`.trim()} {...rest}>
      <span>{children}</span>
      {arrow && <Icon name="arrow-right" size={size === "sm" ? 16 : 18} className="nx-icon nx-btn__arrow" />}
    </a>
  );
}

/** Underlined text link with a sliding arrow. */
export function ArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={`nx-arrowlink ${className}`.trim()}>
      <span>{children}</span>
      <Icon name="arrow-right" size={18} />
    </a>
  );
}

/** FAQ accordion with native <details> (one open at a time, first open), no client JS needed. */
export function FaqList({ items, name = "nx-faq" }: { items: { q: ReactNode; a: ReactNode }[]; name?: string }) {
  return (
    <div className="nx-acc nx-acc--native">
      {items.map((item, i) => (
        <details key={i} className="nx-acc__item" name={name} open={i === 0}>
          <summary className="nx-acc__trigger">
            <span>{item.q}</span>
            <span className="nx-acc__icon" aria-hidden="true">
              <Icon name="plus" size={18} className="" />
            </span>
          </summary>
          <div className="nx-acc__content">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
