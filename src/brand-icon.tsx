import { brandIndex, brandTitles } from "./brand-icons.generated";
import { SiteIcon, iconFor } from "./icon-set";
import { normalizeTech } from "./tech-name";

export { normalizeTech };

export function brandId(name: string) {
  return brandIndex[normalizeTech(name)];
}

/**
 * Official brand mark when the tool has one (served as a cached SVG from
 * /brand/<id>.svg), otherwise the matching line icon from the shared set.
 */
export function TechIcon({
  name,
  context = "",
  className,
  eager = false,
}: {
  name: string;
  context?: string;
  className?: string;
  /** Inside hidden panels (the mega menu) lazy images only start loading on open. */
  eager?: boolean;
}) {
  const id = brandId(name);
  if (!id) return <SiteIcon name={iconFor(name, context)} className={className} />;
  return <img src={`/brand/${id}.svg`} alt="" title={brandTitles[id]} width={20} height={20} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "low" : undefined} decoding="async" className={className} />;
}
