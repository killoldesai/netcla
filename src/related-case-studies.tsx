import { ArrowLink } from "./site/ui";
import { V2Icon } from "./site/v2/ui";
import { mediaPath } from "./media-path";
import { relatedStudiesFor } from "./case-study-related";

/** "Case studies" block for service, industry, location and hub pages: the published studies that are about this page. `v2` renders bgrid bcard cards. */
export async function RelatedCaseStudies({ path, v2 = false }: { path: string; v2?: boolean }) {
  const studies = await relatedStudiesFor(path, 3).catch(() => []);
  if (!studies.length) return null;
  if (v2) {
    const [lead, ...rest] = studies;
    const cover = (c: NonNullable<(typeof studies)[number]["cover"]>) => (
      <img src={mediaPath({ id: c.asset_id, name: c.seo_name ?? undefined })} alt={c.alt} width={c.width} height={c.height} loading="lazy" decoding="async" />
    );
    return (
      <section className="sec sec--cloud v3-related-case-studies csr" aria-labelledby="related-case-studies-title">
        <div className="wrap">
          <div className="csr__head rv">
            <div>
              <span className="eyebrow">Our work</span>
              <h2 className="h2" id="related-case-studies-title">Case studies</h2>
            </div>
            <a className="btn btn--ghost" href="/case-studies">
              All case studies <V2Icon name="arrow" />
            </a>
          </div>
          <a className="csr__lead rv" href={`/case-studies/${lead.slug}`}>
            {lead.cover && <span className="csr__img">{cover(lead.cover)}</span>}
            <span className="csr__body">
              {lead.content.services.length > 0 && (
                <span className="csr__tags">
                  {lead.content.services.slice(0, 3).map((t) => (
                    <i key={t}>{t}</i>
                  ))}
                </span>
              )}
              <h3>{lead.content.headline || lead.title}</h3>
              {lead.content.summary && <p>{lead.content.summary}</p>}
              <span className="csr__go">
                Read the case study <V2Icon name="arrow" />
              </span>
            </span>
          </a>
          {rest.length > 0 && (
            <div className="csr__more">
              {rest.map((s, i) => (
                <a key={s.slug} className="csr__card rv" href={`/case-studies/${s.slug}`} style={{ transitionDelay: `${i * 0.1}s` }}>
                  {s.cover && <span className="csr__thumb">{cover(s.cover)}</span>}
                  <span className="csr__txt">
                    {s.content.services.length > 0 && <small>{s.content.services.slice(0, 2).join(", ")}</small>}
                    <h3>{s.content.headline || s.title}</h3>
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }
  return (
    <section className="v3-related-guides gen-guides" aria-labelledby="related-case-studies-title">
      <link rel="stylesheet" href="/assets/nx/related.css?v=20261017" />
      <div className="v3-wrap container">
        <h2 id="related-case-studies-title" className="related__title">Case studies</h2>
        <ul className="related__cards">
          {studies.map((s) => (
            <li key={s.slug}>
              <a className={"related__card" + (s.cover ? " related__card--cover" : "")} href={`/case-studies/${s.slug}`}>
                {s.cover && <img className="related__thumb" src={mediaPath({ id: s.cover.asset_id, name: s.cover.seo_name ?? undefined })} alt={s.cover.alt} width={s.cover.width} height={s.cover.height} loading="lazy" />}
                <span className="related__text">
                  <strong>{s.content.headline || s.title}</strong>
                  {s.content.summary && <span>{s.content.summary}</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="related__more">
          <ArrowLink href="/case-studies">All case studies</ArrowLink>
        </p>
      </div>
    </section>
  );
}
