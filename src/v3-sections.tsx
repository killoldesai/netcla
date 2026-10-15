import { sanitizeRichHTML } from "./rich-text";
import { legacyIcon, type SiteIconName } from "./icon-set";
import { Icon, ProductIcon } from "./site/ui";

/** Body copy: plain text becomes one paragraph; rich HTML is sanitised inside .nx-prose. */
export function GenProse({ value, paths, className }: { value?: string; paths?: string[]; className?: string }) {
  if (!value) return null;
  if (!/<[a-z][\s\S]*>/i.test(value)) return <p className={className}>{value}</p>;
  return (
    <div
      className={"nx-prose " + (className ?? "")}
      dangerouslySetInnerHTML={{ __html: sanitizeRichHTML(value, false, paths?.length ? paths : undefined) }}
    />
  );
}

/** Product icon for each line-icon name the content uses (iconFor() and legacy icon keys). */
const PRODUCT_ICON: Partial<Record<SiteIconName, string>> = {
  code: "code-brackets",
  mobile: "mobile-device",
  ai: "brain-circuit",
  cloud: "cloud-upload",
  settings: "settings-gear",
  layers: "layers-stack",
  shield: "shield-check",
  users: "users-group",
  rocket: "rocket-launch",
  chart: "chart-bar",
  document: "document-text",
  api: "api-plug",
  web: "react-atom",
  container: "docker-whale",
};

/** Card or step icon drawn from the product icon set; unknown names fall back to the layers mark. */
export function GenIcon({ name }: { name: string }) {
  const site = (legacyIcon[name] ?? name) as SiteIconName;
  return <ProductIcon name={PRODUCT_ICON[site] ?? "layers-stack"} size={26} />;
}

const isRich = (value: string) => /<[a-z][\s\S]*>/i.test(value);

/** Questions and answers, grouped by category when the content has categories (cat_N_name, cat_N_qM / cat_N_aM). */
export function faqGroups(fields: Record<string, string>) {
  const pairs = Object.keys(fields).filter(
    (k) => /^(?:q\d+|cat_\d+_q\d+)$/.test(k) && fields[k] && fields[k.replace(/q(\d+)$/, "a$1")],
  );
  const groups = new Map<string, { title?: string; keys: string[] }>();
  for (const key of pairs) {
    const cat = key.match(/^cat_(\d+)_q\d+$/)?.[1] ?? "";
    if (!groups.has(cat)) groups.set(cat, { title: cat ? fields[`cat_${cat}_name`] || undefined : undefined, keys: [] });
    groups.get(cat)!.keys.push(key);
  }
  return [...groups.values()];
}

export function FAQList({ fields }: { fields: Record<string, string> }) {
  const item = (key: string) => {
    const answer = fields[key.replace(/q(\d+)$/, "a$1")];
    return (
      <details key={key} name="service-faq" className="nx-acc__item">
        <summary className="nx-acc__trigger">
          <span>{fields[key]}</span>
          <span className="nx-acc__icon" aria-hidden="true">
            <Icon name="plus" size={18} className="" />
          </span>
        </summary>
        <div className="nx-acc__content">
          {isRich(answer) ? <div className="nx-prose" dangerouslySetInnerHTML={{ __html: sanitizeRichHTML(answer) }} /> : <p>{answer}</p>}
        </div>
      </details>
    );
  };
  return faqGroups(fields).map((group, i) => (
    <div key={group.title ?? i} className={group.title ? "gen-faq-group" : undefined}>
      {group.title && <h3 className="gen-faq-group__title">{group.title}</h3>}
      <div className="nx-acc nx-acc--native">{group.keys.map(item)}</div>
    </div>
  ));
}

export function Comparison({ groups }: { groups: Record<string, string>[] }) {
  const isModels = groups.some((g) => g.name);
  return (
    <div className="gen-table" data-allow-overflow="true" role="region" tabIndex={0} aria-label="Comparison">
      <table>
        <thead>
          <tr>
            {(isModels
              ? ["Engagement", "Best for", "Timeline", "Pricing approach"]
              : ["Consideration", "Netofficials", "Freelancer", "Agency"]
            ).map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g, i) => (
            <tr key={i}>
              <th scope="row">{g.name || g.attribute}</th>
              {(isModels
                ? [g.best_for, g.timeline, g.pricing]
                : [g.netofficials, g.freelancer, g.agency]
              ).map((value, j) => (
                <td key={j}>{value || "Discuss your requirements"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VerifiedEvidence({
  fields,
}: {
  fields: Record<string, string>;
}) {
  const quotes = Object.keys(fields).filter(
    (key) => /^quote_\d+$/.test(key) && fields[key],
  );
  const awards = Object.keys(fields).filter(
    (key) => /^(?:award|certification)_\d+$/.test(key) && fields[key],
  );
  const offices = Object.keys(fields).filter(
    (key) => /^office_\d+_city$/.test(key) && fields[key],
  );
  return (
    <>
      {quotes.length > 0 && (
        <div className="gen-quotes">
          {quotes.map((key) => {
            const n = key.split("_")[1];
            return (
              <figure key={key} className="gen-quote">
                <blockquote>{fields[key]}</blockquote>
                <figcaption>
                  {[
                    fields["client_" + n + "_name"],
                    fields["client_" + n + "_title"],
                    fields["client_" + n + "_company"],
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
      {awards.length > 0 && (
        <ul className="gen-checks">
          {awards.map((key) => (
            <li key={key}>
              <span className="gen-check" aria-hidden="true">
                <Icon name="check" size={16} className="" />
              </span>
              <span>{fields[key]}</span>
            </li>
          ))}
        </ul>
      )}
      {offices.length > 0 && (
        <div className="sk-cards gen-offices">
          {offices.map((key) => {
            const prefix = key.replace(/city$/, "");
            return (
              <article key={key} className="sk-card">
                <h3 className="sk-card__title">{fields[key]}</h3>
                <p className="sk-card__text">{fields[prefix + "address"]}</p>
                <p className="sk-card__text">{fields[prefix + "timezone"]}</p>
                {fields[prefix + "email"] && (
                  <a className="nx-arrowlink" href={"mailto:" + fields[prefix + "email"]}>
                    <span>{fields[prefix + "email"]}</span>
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
