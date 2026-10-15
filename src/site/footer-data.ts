// Footer and chrome data shared by server and client components (no "use client" here,
// so server components can read these values).
import { pillars, sitePage } from "../site-structure";

export type ChromeProps = {
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  homeHref?: string;
  contactHref?: string;
};

/** A link target only when the page is published (or mapped in a preview). */
export function publicDestination(path: string, { paths, preview, linkMap = {} }: ChromeProps) {
  return preview ? linkMap[path] : paths.includes(path) ? path : undefined;
}

// Footer columns come from site-structure so they match the mega menu.
const footerLinks = (paths: string[]): [string, string][] =>
  paths.flatMap((path) => {
    const page = sitePage(path);
    return page ? [[page.label, page.path] as [string, string]] : [];
  });

/** Location pages, linked from every footer so they are reachable without the menu. */
export const footerLocations: [string, string][] = [
  ["USA", "/software-development-company-usa"],
  ["New York", "/software-development-company-new-york"],
  ["United Kingdom", "/software-development-company-uk"],
  ["London", "/software-development-company-london"],
  ["Canada", "/software-development-company-canada"],
  ["Australia", "/software-development-company-australia"],
  ["Dubai", "/software-development-company-dubai"],
  ["India", "/software-development-company-india"],
];

export const groups: [string, [string, string][]][] = [
  ["Services", pillars.filter((p) => p.inServicesMenu).map((p) => [p.label, p.hub] as [string, string])],
  ["Hire Developers", footerLinks(["/hire-developers", "/dedicated-development-team", "/hire-react-developer", "/hire-nodejs-developer", "/hire-flutter-developer", "/hire-ai-ml-developer"])],
  ["Industries", footerLinks(["/industries", "/healthcare-software-development", "/fintech-software-development", "/edtech-software-development", "/logistics-software-development", "/retail-software-development"])],
  ["Company", footerLinks(["/about", "/how-we-work", "/engagement-models", "/case-studies", "/blog", "/careers", "/contact"])],
];
