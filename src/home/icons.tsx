import { SiteIcon, type SiteIconName } from "../icon-set";

// Homepage and mega-menu names, drawn from the shared site icon set.
const names: Record<string, SiteIconName> = {
  software: "code",
  mobile: "mobile",
  ai: "ai",
  cloud: "cloud",
  health: "health",
  finance: "bank",
  education: "book",
  building: "building",
  logistics: "truck",
  demand: "clock",
  retail: "bag",
  travel: "map",
  legal: "scale",
  team: "users",
  insurance: "umbrella",
  factory: "factory",
};

export function Icon({ name, className = "size-6" }: { name: string; className?: string }) {
  return <SiteIcon name={names[name] ?? name} className={className} />;
}
