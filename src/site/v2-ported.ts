// Which V3 renderers use the v2 (monday-style) design. A renderer listed as true is wrapped in the .v2 shell
// (src/site/v2/*, styles public/assets/v2/) instead of the .nx shell. The value is the page stylesheet name in
// public/assets/v2/pages/<name>.css, or null when the renderer is not ported yet. Flip one line per renderer.
import type { Renderer } from "./ported";

export const V2_PORTED: Record<Renderer, string | null> = {
  skeleton: "service",
  guide: "guide",
  about: "about",
  contact: "contact",
  engagement: "engagement-models",
  "how-work": "how-we-work",
  "why-choose": "why-choose",
  "blog-index": "blog",
  services: "services",
  careers: "careers",
  faq: "faq",
  generic: "faq",
};
