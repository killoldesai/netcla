import { sanitizeRichHTML } from "./rich-text";
import { legacyIcon, type SiteIconName } from "./icon-set";
import type { ReactNode } from "react";
import { ProductIcon } from "./site/ui";
import { V2Icon } from "./site/v2/ui";

/** Body copy: plain text becomes one paragraph; rich HTML is sanitised inside the .prose wrapper. */
export function GenProse({ value, paths, className }: { value?: string; paths?: string[]; className?: string }) {
  if (!value) return null;
  if (!/<[a-z][\s\S]*>/i.test(value)) return <p className={className}>{value}</p>;
  return (
    <div
      className={"prose " + (className ?? "")}
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

/** An answer: rich HTML is sanitised, plain text is one paragraph. */
export function FAQAnswer({ value }: { value: string }) {
  return isRich(value) ? <div className="prose" dangerouslySetInnerHTML={{ __html: sanitizeRichHTML(value) }} /> : <p>{value}</p>;
}

/** Native exclusive accordion (details with one shared name), the same markup as html-prototype/v2 .acc. */
export function FAQAccordion({ items, name }: { items: { q: ReactNode; a: ReactNode }[]; name: string }) {
  return (
    <div className="acc">
      {items.map((item, i) => (
        <details key={i} name={name}>
          <summary>
            {item.q}
            <i aria-hidden="true">
              <V2Icon name="plus" />
            </i>
          </summary>
          {item.a}
        </details>
      ))}
    </div>
  );
}

export function FAQList({ fields }: { fields: Record<string, string> }) {
  return faqGroups(fields).map((group, i) => (
    <div key={group.title ?? i} className={group.title ? "gen-faq-group" : undefined}>
      {group.title && <h3 className="gen-faq-group__title">{group.title}</h3>}
      <FAQAccordion
        name="service-faq"
        items={group.keys.map((key) => ({
          q: fields[key],
          a: <FAQAnswer value={fields[key.replace(/q(\d+)$/, "a$1")]} />,
        }))}
      />
    </div>
  ));
}

export function Comparison({ groups }: { groups: Record<string, string>[] }) {
  const isModels = groups.some((g) => g.name);
  return (
    <div className="cmp__wrap" role="region" tabIndex={0} aria-label="Comparison">
      <table className="cmp">
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
              <figure key={key} className="quote">
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
        <ul className="ticks">
          {awards.map((key) => (
            <li key={key}>{fields[key]}</li>
          ))}
        </ul>
      )}
      {offices.length > 0 && (
        <div className="catgrid catgrid--2 gen-offices">
          {offices.map((key) => {
            const prefix = key.replace(/city$/, "");
            return (
              <div key={key} className="cat">
                <h3>{fields[key]}</h3>
                <p>{fields[prefix + "address"]}</p>
                <p>{fields[prefix + "timezone"]}</p>
                {fields[prefix + "email"] && (
                  <a className="tlink" href={"mailto:" + fields[prefix + "email"]}>
                    {fields[prefix + "email"]}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
