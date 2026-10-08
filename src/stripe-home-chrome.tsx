"use client";
import { MegaNavigation } from "./mega-navigation";
import { pillars, sitePage } from "./site-structure";

type ChromeProps = {
  paths: string[];
  preview?: boolean;
  linkMap?: Record<string, string>;
  homeHref?: string;
  contactHref?: string;
};
export function publicDestination(
  path: string,
  { paths, preview, linkMap = {} }: ChromeProps,
) {
  return preview ? linkMap[path] : paths.includes(path) ? path : undefined;
}
export function StripeNavigation(props: ChromeProps) {
  return <MegaNavigation {...props} />;
}
// Footer columns come from site-structure so they match the mega menu.
const footerLinks = (paths: string[]): [string, string][] =>
  paths.flatMap((path) => {
    const page = sitePage(path);
    return page ? [[page.label, page.path] as [string, string]] : [];
  });
export const groups: [string, [string, string][]][] = [
  [
    "Services",
    pillars
      .filter((p) => p.inServicesMenu)
      .map((p) => [p.label, p.hub] as [string, string]),
  ],
  [
    "Hire Developers",
    footerLinks(["/hire-developers", "/dedicated-development-team", "/hire-react-developer", "/hire-nodejs-developer", "/hire-flutter-developer", "/hire-ai-ml-developer"]),
  ],
  [
    "Industries",
    footerLinks(["/industries", "/healthcare-software-development", "/fintech-software-development", "/edtech-software-development", "/logistics-software-development", "/retail-software-development"]),
  ],
  [
    "Company",
    footerLinks(["/about", "/how-we-work", "/engagement-models", "/case-studies", "/blog", "/careers", "/contact"]),
  ],
];
export function StripeFooter(props: ChromeProps) {
  const privacy = publicDestination("/privacy-policy", props),
    terms = publicDestination("/terms-and-conditions", props);
  return (
    <footer className="stripe-footer">
      <link rel="stylesheet" href="/assets/site-unified.css?v=20261008" />
      <div className="stripe-wrap">
        <div className="stripe-footer-grid">
          <div className="stripe-footer-brand">
            <a href={props.linkMap?.["/"] ?? "/"} className="stripe-wordmark">
              <img
                src="/assets/logo.png"
                alt="Netofficials"
                width={184}
                height={30}
              />
            </a>
            <p>
              Software, mobile, AI and cloud development from India. Start with
              your business, your users and the work ahead.
            </p>
          </div>
          {groups.map(([title, items]) => {
            const visible = items.flatMap(([label, path]) => {
              const href = path.startsWith("#")
                ? (props.homeHref ?? "") + path
                : publicDestination(path, props);
              return href ? [[label, href]] : [];
            });
            return (
              <div className="footer-group" key={title}>
                <h3>{title}</h3>
                {visible.map(([label, url]) => (
                  <a href={url} key={label}>
                    {label}
                  </a>
                ))}
                {!visible.length && (
                  <a
                    href={
                      (props.homeHref ?? "") +
                      (title === "Industries"
                        ? "#industries"
                        : title === "Hire Developers"
                          ? "#hire"
                          : "#services")
                    }
                  >
                    Explore {title.toLowerCase()}
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <div className="stripe-footer-bottom">
          <span>© {new Date().getFullYear()} Netofficials. India.</span>
          <div>
            {privacy && <a href={privacy}>Privacy Policy</a>}
            {privacy && terms && " · "}
            {terms && <a href={terms}>Terms</a>}
            {!privacy && !terms && (
              <span>
                {props.preview
                  ? "Design preview · Forms do not send enquiries"
                  : "Software · Mobile · AI · Cloud"}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
