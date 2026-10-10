import { pillar, pillarGroups, sitePage, sitePages, pillars } from "./site-structure";
import { company } from "./company";

type Link = { path: string; text: string; blurb?: string };
type Block = { heading: string; sections: { title?: string; links: Link[] }[] };

/** A hire page and the service page for the same technology: each should link to the other. */
const hireToService: Record<string, string> = {
  "/hire-react-developer": "/react-development-services",
  "/hire-angular-developer": "/angular-development-services",
  "/hire-vuejs-developer": "/vuejs-development-services",
  "/hire-nodejs-developer": "/nodejs-development-services",
  "/hire-python-developer": "/python-development-services",
  "/hire-java-developer": "/java-development-services",
  "/hire-dotnet-developer": "/dotnet-development-services",
  "/hire-php-developer": "/php-development-services",
  "/hire-laravel-developer": "/laravel-development-services",
  "/hire-django-developer": "/django-development-services",
  "/hire-mobile-app-developer": "/mobile-app-development",
  "/hire-ios-developer": "/ios-app-development",
  "/hire-android-developer": "/android-app-development",
  "/hire-flutter-developer": "/flutter-app-development",
  "/hire-react-native-developer": "/react-native-app-development",
  "/hire-ai-ml-developer": "/ai-development-services",
  "/hire-data-scientist": "/data-science-services",
  "/hire-aws-developer": "/aws-services",
  "/hire-blockchain-developer": "/blockchain-development-services",
  "/hire-wordpress-developer": "/wordpress-development-services",
  "/hire-shopify-developer": "/shopify-development-services",
  "/hire-woocommerce-developer": "/woocommerce-development-services",
  "/hire-magento-developer": "/magento-development-services",
};
const serviceToHire = Object.fromEntries(Object.entries(hireToService).map(([hire, service]) => [service, hire]));

/** Pages that cover neighbouring intents and should point at each other. */
const sameTopic: string[][] = [
  ["/software-development-outsourcing", "/software-outsourcing-services", "/offshore-software-development"],
];

/** Locations that contain one another. */
const locationPairs: [string, string][] = [
  ["/software-development-company-usa", "/software-development-company-new-york"],
  ["/software-development-company-uk", "/software-development-company-london"],
];

const link = (path: string, text?: string): Link | undefined => {
  const page = sitePage(path);
  return page ? { path, text: text ?? page.label, blurb: page.blurb } : undefined;
};
const keep = (links: (Link | undefined)[], live: Set<string>, self: string) => {
  const seen = new Set<string>();
  return links.filter((l): l is Link => {
    if (!l || !live.has(l.path) || l.path === self || seen.has(l.path)) return false;
    seen.add(l.path);
    return true;
  });
};

const locations = sitePages.filter((p) => p.type === "location").map((p) => p.path);
const locationText = (path: string) => `Software development company in ${sitePage(path)!.label}`;

/**
 * Contextual links the page's own content does not carry, built from the site structure: hubs list every child,
 * hire and service pages for one technology point at each other, and industries, locations and sibling pages cross-link.
 */
export function relatedPages(path: string, paths: string[]): Block | null {
  const live = new Set(paths);
  const page = sitePage(path);
  if (path === "/about") {
    const links = keep(locations.map((p) => link(p, locationText(p))), live, path);
    const founder = { path: company.founder.path, text: `${company.founder.name}, founder of Netofficials` };
    return { heading: "Founder and locations", sections: [{ title: "Founder", links: [founder] }, ...(links.length ? [{ title: "Where we work", links }] : [])] };
  }
  if (!page) return null;

  if (page.type === "pillar" && page.pillar) {
    const sections = pillarGroups(page.pillar)
      .map((g) => ({ title: g.group, links: keep(g.pages.map((p) => link(p.path)), live, path) }))
      .filter((s) => s.links.length);
    const hire = serviceToHire[path];
    const hireLinks = keep([hire ? link(hire, `Hire ${sitePage(hire)!.label}`) : undefined], live, path);
    if (hireLinks.length) sections.push({ title: "Hire developers", links: hireLinks });
    return sections.length ? { heading: `All ${pillar(page.pillar).label.toLowerCase()} pages`, sections } : null;
  }

  if (page.type === "hire") {
    const service = hireToService[path];
    const counterpart = service && sitePage(service) ? [link(service, `${sitePage(service)!.label} development services`)] : [];
    const siblings = sitePages.filter((p) => p.type === "hire" && p.group === page.group).map((p) => link(p.path));
    const links = keep([...counterpart, ...siblings], live, path);
    return links.length ? { heading: "Related developers and services", sections: [{ links }] } : null;
  }

  if (page.type === "service" || page.type === "technology") {
    const hire = serviceToHire[path];
    const topic = sameTopic.find((g) => g.includes(path)) ?? [];
    const siblings = sitePages.filter((p) => p.pillar === page.pillar && p.group === page.group && p.type !== "pillar").map((p) => link(p.path));
    const links = keep(
      [hire ? link(hire, `Hire ${sitePage(hire)!.label}`) : undefined, ...topic.map((p) => link(p)), ...siblings.slice(0, 6)],
      live,
      path,
    );
    return links.length ? { heading: "Related services", sections: [{ links }] } : null;
  }

  if (page.type === "industry") {
    const links = keep(
      sitePages.filter((p) => p.type === "industry").map((p) => link(p.path, `${p.label} software development`)),
      live,
      path,
    );
    return links.length ? { heading: "Other industries we build for", sections: [{ links }] } : null;
  }

  if (page.type === "location") {
    const pair = locationPairs.find((p) => p.includes(path))?.find((p) => p !== path);
    const others = locations.filter((p) => p !== pair);
    const places = keep([pair, ...others].map((p) => (p ? link(p, locationText(p)) : undefined)), live, path);
    const services = keep(pillars.filter((p) => p.inServicesMenu).map((p) => link(p.hub)), live, path);
    const sections = [
      { title: "Other places we work", links: places },
      { title: "Services", links: services },
    ].filter((s) => s.links.length);
    return sections.length ? { heading: "Where we work and what we build", sections } : null;
  }
  return null;
}

export function RelatedPages({ path, paths }: { path: string; paths: string[] }) {
  const block = relatedPages(path, paths);
  if (!block) return null;
  return (
    <section className="v3-related-pages" aria-labelledby="related-pages-title">
      <div className="v3-wrap">
        <h2 id="related-pages-title">{block.heading}</h2>
        {block.sections.map((s, i) => (
          <div key={s.title ?? i} className="v3-related-pages-group">
            {s.title && <p className="v3-related-pages-title">{s.title}</p>}
            <ul>
              {s.links.map((l) => (
                <li key={l.path}>
                  <a href={l.path}>{l.text}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
