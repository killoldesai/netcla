// Site footer for the v2 pages. Server component: link lists come from ../footer-data (same source as the mega menu)
// and only published pages are linked. Layout: brand and project link on the left, the link columns, the places we
// work as pills, then the legal line.
import { company } from "../../company";
import { footerLocations, groups, publicDestination, type ChromeProps } from "../footer-data";
import { V2Icon } from "./ui";

export function V2Footer(props: ChromeProps) {
  const dest = (path: string) => publicDestination(path, props);
  const privacy = dest("/privacy-policy");
  const terms = dest("/terms");
  const contact = props.contactHref ?? dest("/contact");
  const where = footerLocations.flatMap(([label, path]) => {
    const href = dest(path);
    return href ? [[label, href] as const] : [];
  });
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__top">
          <div className="ftr__brand">
            <a className="ftr__logo" href={props.homeHref ?? dest("/") ?? "/"} aria-label="Netofficials home">
              <img src="/assets/logo.png" alt="Netofficials" width={172} height={26} />
            </a>
            <p className="ftr__tag">Software development company in India since {company.foundingYear}.</p>
            <div className="ftr__acts">
              {contact && (
                <a className="ftr__cta" href={contact}>
                  Start a project <V2Icon name="arrow" />
                </a>
              )}
              {company.profiles.map((url) => (
                <a className="ftr__social" href={url} key={url} target="_blank" rel="noopener" aria-label="Netofficials on LinkedIn">
                  <V2Icon name="linkedin" />
                </a>
              ))}
            </div>
          </div>
          <div className="ftr__cols">
            {groups.map(([title, items]) => {
              const visible = items.flatMap(([label, path]) => {
                const href = dest(path);
                return href ? [[label, href] as const] : [];
              });
              if (!visible.length) return null;
              const id = `ft-${title.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <nav aria-labelledby={id} key={title}>
                  <h4 id={id}>{title}</h4>
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
        </div>
        {where.length > 0 && (
          <nav className="ftr__where" aria-labelledby="ft-where">
            <h4 id="ft-where">Where we work</h4>
            <ul>
              {where.map(([label, href]) => (
                <li key={href}>
                  <a href={href}>
                    <V2Icon name="pin" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="ftr__b">
          <span>© {new Date().getFullYear()} Netofficials, software development company in India since {company.foundingYear}</span>
          <nav aria-label="Legal">
            {privacy && <a href={privacy}>Privacy Policy</a>}
            {terms && <a href={terms}>Terms</a>}
            {props.preview && <span>Design preview · Forms do not send enquiries</span>}
          </nav>
        </div>
      </div>
    </footer>
  );
}
