import { NxShell } from "./site/shell";
import { ArrowLink, Breadcrumbs, Button, Icon } from "./site/ui";
import { autoLink, linkTargets } from "./case-study-autolink";
import { studyPaths, type RelatedLinks, type StudyCard } from "./case-study-related";
import type { BlogPost } from "./blog-types";
import { mediaPath } from "./media-path";
import { servicePathByName } from "./case-study-catalog";
import type { CaseStudyContent } from "./case-studies";

type Img = { id: string; slot: string; alt: string; ratio: string; asset_id: string; width: number; height: number; asset_alt: string; seo_name: string | null };
type Card = { slug: string; title: string; content: CaseStudyContent; cover: { asset_id: string; alt: string; width: number; height: number; seo_name: string | null } | null };

const serviceHref = servicePathByName;
const paragraphs = (value: string) => value.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
const src = (i: { asset_id: string; seo_name: string | null }) => mediaPath({ id: i.asset_id, name: i.seo_name ?? undefined });

const sections = [
  ["challenge", "The challenge"],
  ["approach", "The approach"],
  ["solution", "The solution"],
  ["results", "The results"],
] as const;

function Figure({ img }: { img: Img }) {
  return (
    <figure className="gen-figure cs-figure">
      <img src={src(img)} alt={img.alt || img.asset_alt} width={img.width} height={img.height} loading="lazy" />
    </figure>
  );
}

/** Detail page for one case study. Everything shown comes from the saved study; nothing is added at render time. */
export type Related = { links: RelatedLinks; studies: StudyCard[]; guides: BlogPost[] };

export function CaseStudyView({ title, content: c, images, paths, preview, related }: { title: string; content: CaseStudyContent; images: Img[]; paths: string[]; preview: boolean; related: Related }) {
  // Phrases in the text that name a live service, technology or industry page become links, once each.
  const targets = linkTargets(new Set(paths), studyPaths(c));
  const budget = { used: new Set<string>(), left: 8 };
  const cover = images.find((i) => i.slot === "cover") ?? images[0];
  const placed = new Set<string>();
  const after = (key: string) => {
    const match = images.filter((i) => i.id !== cover?.id && !placed.has(i.id) && i.slot.toLowerCase().includes(key));
    match.forEach((i) => placed.add(i.id));
    return match;
  };
  const blocks = sections.map(([key, heading]) => ({ key, heading, text: paragraphs(c[key]), figures: after(key) })).filter((b) => b.text.length);
  const gallery = images.filter((i) => i.id !== cover?.id && !placed.has(i.id));
  const facts: [string, string, string?][] = [
    ["Client", c.client.size],
    ["Industry", c.client.industry, related.links.industry?.path],
    ["Location", c.client.location, related.links.location?.path],
    ["Timeline", c.timeline],
  ].filter((f): f is [string, string, string?] => !!f[1]);
  const hasRelated = related.links.services.length > 0 || related.studies.length > 0 || related.guides.length > 0;
  return (
    <NxShell page="generic" paths={paths}>
      <link rel="stylesheet" href="/assets/nx/pages/case-study.css" />
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Case studies", href: "/case-studies" }, { label: c.headline || title }]} />
          {preview && <p className="cs-preview" role="status">Preview. This case study is not published, so only you can see this page.</p>}
          <div className="gen-hero--text">
            <div>
              <span className="tag-pill">Case study</span>
              <h1>{c.headline || title}</h1>
              {c.summary && <p className="lead">{c.summary}</p>}
              {c.services.length > 0 && (
                <div className="cs-chips">
                  {c.services.map((s) =>
                    serviceHref[s] ? <a key={s} className="nx-badge nx-badge--lime" href={serviceHref[s]}>{s}</a> : <span key={s} className="nx-badge nx-badge--lime">{s}</span>,
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {cover && (
        <section className="cs-cover-wrap">
          <div className="container">
            <figure className="cs-cover"><img src={src(cover)} alt={cover.alt || cover.asset_alt} width={cover.width} height={cover.height} /></figure>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container cs-layout">
          <article className="cs-main">
            {blocks.map((b) => (
              <div key={b.key} className="cs-block nx-reveal">
                <h2 className="cs-h2">{b.heading}</h2>
                <div className="gen-body">{b.text.map((p, i) => <p key={i}>{autoLink(p, targets, budget)}</p>)}</div>
                {b.figures.map((f) => <Figure key={f.id} img={f} />)}
              </div>
            ))}
            {c.outcomes.length > 0 && (
              <dl className="gen-stats cs-outcomes">
                {c.outcomes.map((o, i) => (
                  <div key={i}><dt>{o.metric}{o.note ? <span className="cs-note">{o.note}</span> : null}</dt><dd>{o.value}</dd></div>
                ))}
              </dl>
            )}
            {c.testimonial.quote && (
              <blockquote className="cs-quote"><p>{c.testimonial.quote}</p>{c.testimonial.attribution && <footer>{c.testimonial.attribution}</footer>}</blockquote>
            )}
          </article>

          <aside className="cs-facts" aria-label="Project summary">
            <h2 className="cs-facts__title">At a glance</h2>
            <dl>
              {facts.map(([k, v, href]) => <div key={k}><dt>{k}</dt><dd>{href ? <a href={href}>{v}</a> : v}</dd></div>)}
              {c.services.length > 0 && (
                <div><dt>Services</dt><dd>{c.services.map((s, i) => {
                  const link = related.links.services.find((x) => x.text === s);
                  return <span key={s}>{i > 0 && ", "}{link ? <a href={link.path}>{s}</a> : s}</span>;
                })}</dd></div>
              )}
            </dl>
            {c.techStack.length > 0 && (
              <>
                <h3 className="cs-facts__sub">Technology</h3>
                <ul className="cs-tech">{c.techStack.map((t) => <li key={t}>{t}</li>)}</ul>
              </>
            )}
            <Button href="/contact" className="cs-facts__cta">Discuss a similar project</Button>
          </aside>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="section cs-gallery-section">
          <div className="container">
            <h2 className="cs-h2">Screens and diagrams</h2>
            <div className="cs-gallery">{gallery.map((g) => <Figure key={g.id} img={g} />)}</div>
          </div>
        </section>
      )}

      {hasRelated && (
        <section className="section cs-related">
          <link rel="stylesheet" href="/assets/nx/related.css?v=20261017" />
          <div className="container">
            {related.links.services.length > 0 && (
              <div className="related__group">
                <p className="related__label">Services used in this project</p>
                <ul className="more related__list">
                  {related.links.services.map((l) => (
                    <li key={l.path}><a href={l.path}><strong>{l.text}</strong><Icon name="arrow-right" size={16} /></a></li>
                  ))}
                </ul>
              </div>
            )}
            {related.studies.length > 0 && (
              <div className="related__group">
                <p className="related__label">More case studies</p>
                <ul className="related__cards">
                  {related.studies.map((s) => (
                    <li key={s.slug}><a className={"related__card" + (s.cover ? " related__card--cover" : "")} href={`/case-studies/${s.slug}`}>{s.cover && <img className="related__thumb" src={src(s.cover)} alt={s.cover.alt} width={s.cover.width} height={s.cover.height} loading="lazy" />}<span className="related__text"><strong>{s.content.headline || s.title}</strong>{s.content.summary && <span>{s.content.summary}</span>}</span></a></li>
                  ))}
                </ul>
              </div>
            )}
            {related.guides.length > 0 && (
              <div className="related__group">
                <p className="related__label">Keep reading</p>
                <ul className="related__cards">
                  {related.guides.map((g) => (
                    <li key={g.path}><a className="related__card" href={g.path}><strong>{g.title}</strong>{g.description && <span>{g.description}</span>}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {c.disclosure && (
        <section className="cs-disclosure">
          <div className="container"><p>{c.disclosure}</p></div>
        </section>
      )}

      <section className="section cs-end">
        <div className="container">
          <h2 className="h-section">Planning something similar?</h2>
          <p className="lead">Tell us what you need built and we will scope it with you.</p>
          <div className="hero__actions"><Button href="/contact" size="lg">Start a project</Button><ArrowLink href="/case-studies">All case studies</ArrowLink></div>
        </div>
      </section>
    </NxShell>
  );
}

export function CaseStudyIndex({ studies, paths }: { studies: Card[]; paths: string[] }) {
  return (
    <NxShell page="generic" paths={paths}>
      <link rel="stylesheet" href="/assets/nx/pages/case-study.css" />
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Case studies" }]} />
          <div className="gen-hero--text">
            <div>
              <span className="tag-pill">Case studies</span>
              <h1>How projects were scoped and delivered</h1>
              <p className="lead">Stories of businesses that had software built with us: the problem, what we built and what changed.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {studies.length === 0 ? (
            <p className="gen-note">Case studies are being added. Check back soon.</p>
          ) : (
            <div className="cs-grid">
              {studies.map((s) => (
                <a key={s.slug} className="cs-card" href={`/case-studies/${s.slug}`}>
                  {s.cover && <img src={src(s.cover)} alt={s.cover.alt} width={s.cover.width} height={s.cover.height} loading="lazy" />}
                  <div className="cs-card__body">
                    <p className="cs-card__meta">{[s.content.client.industry, s.content.client.location].filter(Boolean).join(" · ")}</p>
                    <h2>{s.content.headline || s.title}</h2>
                    {s.content.summary && <p>{s.content.summary}</p>}
                    <span className="nx-arrowlink"><span>Read the case study</span></span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </NxShell>
  );
}
