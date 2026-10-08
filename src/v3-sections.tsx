import { sanitizeRichHTML } from "./rich-text";
export function FAQList({ fields }: { fields: Record<string, string> }) {
  const pairs = Object.keys(fields).filter(
    (k) =>
      /^(?:q\d+|cat_\d+_q\d+)$/.test(k) &&
      fields[k] &&
      fields[k.replace(/q(\d+)$/, "a$1")],
  );
  return (
    <div className="v3-faq">
      {pairs.map((key) => (
        <details key={key} name="service-faq">
          <summary>
            {fields[key]}
            <span aria-hidden="true">+</span>
          </summary>
          {/<[a-z][\s\S]*>/i.test(fields[key.replace(/q(\d+)$/, "a$1")]) ? (
            <div
              className="v3-prose"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHTML(fields[key.replace(/q(\d+)$/, "a$1")]) }}
            />
          ) : (
            <p>{fields[key.replace(/q(\d+)$/, "a$1")]}</p>
          )}
        </details>
      ))}
    </div>
  );
}
export function Comparison({ groups }: { groups: Record<string, string>[] }) {
  const isModels = groups.some((g) => g.name);
  return (
    <div className="v3-table-scroll">
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
        <div className="v3-quotes">
          {quotes.map((key) => {
            const n = key.split("_")[1];
            return (
              <figure key={key}>
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
        <ul className="v3-outcomes">
          {awards.map((key) => (
            <li key={key}>{fields[key]}</li>
          ))}
        </ul>
      )}
      {offices.length > 0 && (
        <div className="v3-cards">
          {offices.map((key) => {
            const prefix = key.replace(/city$/, "");
            return (
              <article key={key}>
                <h3>{fields[key]}</h3>
                <p>{fields[prefix + "address"]}</p>
                <p>{fields[prefix + "timezone"]}</p>
                {fields[prefix + "email"] && (
                  <a href={"mailto:" + fields[prefix + "email"]}>
                    {fields[prefix + "email"]}
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
