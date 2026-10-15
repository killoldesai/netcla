"use client";
import { MegaNavigation } from "./mega-navigation";
import { publicDestination, groups, footerLocations, type ChromeProps } from "./site/footer-data";

// Footer data now lives in ./site/footer-data (shared with server components); re-exported for existing imports.
export { publicDestination, footerLocations, groups } from "./site/footer-data";

export function StripeNavigation(props: ChromeProps) {
  return <MegaNavigation {...props} />;
}
export function StripeFooter(props: ChromeProps) {
  const privacy = publicDestination("/privacy-policy", props),
    terms = publicDestination("/terms", props);
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
        <nav className="footer-locations" aria-label="Where we work">
          <span>Where we work</span>
          {footerLocations.flatMap(([label, path]) => {
            const href = publicDestination(path, props);
            return href ? [<a href={href} key={path}>{label}</a>] : [];
          })}
        </nav>
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
