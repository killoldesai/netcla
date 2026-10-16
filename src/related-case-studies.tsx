import { ArrowLink } from "./site/ui";
import { mediaPath } from "./media-path";
import { relatedStudiesFor } from "./case-study-related";

/** "Case studies" block for service, industry, location and hub pages: the published studies that are about this page. */
export async function RelatedCaseStudies({ path }: { path: string }) {
  const studies = await relatedStudiesFor(path, 3).catch(() => []);
  if (!studies.length) return null;
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
