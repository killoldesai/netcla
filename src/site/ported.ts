// Which V3 renderers use the redesigned shell (.nx wrapper, public/assets/nx styles, SiteFooter).
// Each value is the page stylesheet in public/assets/nx/pages/<value>.css, or null when the
// renderer is not ported yet (it keeps the previous design). Flip one line per renderer.
export type Renderer = "skeleton" | "guide" | "about" | "contact" | "engagement" | "how-work" | "why-choose" | "blog-index" | "services" | "careers" | "faq" | "generic";

export const PORTED: Record<Renderer, string | null> = {
  skeleton: "skeleton",
  guide: "guide",
  about: "about",
  contact: "contact",
  engagement: "engagement",
  "how-work": "how-work",
  "why-choose": "why-choose",
  "blog-index": "blog-index",
  services: "services",
  careers: "generic",
  faq: "generic",
  generic: "generic",
};
