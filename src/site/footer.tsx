// Site footer for the redesigned pages (html-prototype/partials/footer.html), light theme only.
// Server component: link lists come from ./footer-data and only published pages are linked.
import { company } from "../company";
import { Icon } from "./ui";
import { footerLocations, groups, publicDestination, type ChromeProps } from "./footer-data";

export function SiteFooter(props: ChromeProps) {
  const dest = (path: string) => publicDestination(path, props);
  const contact = props.contactHref ?? dest("/contact") ?? "/contact";
  const services = dest("/services");
  const privacy = dest("/privacy-policy");
  const terms = dest("/terms");
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__cta">
          <div>
            <h2>
              Ready to scope your project? <span>Tell us what you need built.</span>
            </h2>
            <p>Share a short brief. We reply with questions, a proposed scope and the team your project needs.</p>
          </div>
          <div className="footer__cta-actions">
            <a className="nx-btn nx-btn--lime nx-btn--lg" href={contact} data-track="consultation_click">
              <span>Start a project</span>
              <Icon name="arrow-right" className="nx-icon nx-btn__arrow" />
            </a>
            {services && (
              <a className="nx-btn nx-btn--secondary nx-btn--lg" href={services}>
                <span>Explore services</span>
              </a>
            )}
          </div>
        </div>

        <div className="footer__main">
          <div className="footer__brand">
            <a className="footer__brand-name" href={props.homeHref ?? dest("/") ?? "/"}>
              <img src="/assets/logo-white.png" alt="Netofficials" width={170} height={28} />
            </a>
            <p>
              India-based software development for business applications, mobile products, AI, DevOps and cloud. Serving
              clients in the US, UK and Australia.
            </p>
            <div className="footer__contact">
              <a href={contact}>
                <Icon name="mail" />
                Tell us about your project
              </a>
              {company.profiles.map((url) => (
                <a href={url} key={url} target="_blank" rel="noopener">
                  <Icon name="external" />
                  Netofficials on LinkedIn
                </a>
              ))}
            </div>
          </div>
          {groups.map(([title, items]) => {
            const visible = items.flatMap(([label, path]) => {
              const href = dest(path);
              return href ? [[label, href] as const] : [];
            });
            if (!visible.length) return null;
            const id = `ft-${title.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <nav aria-labelledby={id} key={title}>
                <h3 id={id}>{title}</h3>
                <ul>
                  {visible.map(([label, href]) => (
                    <li key={href}>
                      <a href={href}>{label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        <nav className="footer__where" aria-labelledby="ft-where">
          <h3 id="ft-where">Where we work</h3>
          {footerLocations.flatMap(([label, path]) => {
            const href = dest(path);
            return href ? [<a href={href} key={path}>{label}</a>] : [];
          })}
        </nav>

        <div className="footer__bar">
          <span>© {new Date().getFullYear()} Netofficials · India</span>
          <nav aria-label="Legal">
            {privacy && <a href={privacy}>Privacy Policy</a>}
            {terms && <a href={terms}>Terms</a>}
            {props.preview && <span>Design preview · Forms do not send enquiries</span>}
            <button type="button" className="to-top" data-to-top>
              <Icon name="arrow-up" size={16} className="" />
              Back to top
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
