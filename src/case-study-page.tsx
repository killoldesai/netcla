import { V2Shell } from "./site/v2/shell";
import { V2Crumbs, V2Icon, V2Img, V2_VERSION, type V2IconName } from "./site/v2/ui";
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
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
const SECTION_ICON: Record<string, V2IconName> = { challenge: "flag", approach: "layers", solution: "bolt", results: "chart" };
const TINTS = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)", "var(--p-pink)", "var(--p-peri)"];

function Figure({ img }: { img: Img }) {
  return (
    <figure className="cs-figure">
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
    <V2Shell page="case-studies" paths={paths} cta={false}>
      <link rel="stylesheet" href={`/assets/v2/home.css?v=${V2_VERSION}`} />
      <link rel="stylesheet" href={`/assets/v2/pages/showcase.css?v=${V2_VERSION}`} />
      <section className="hero sc-hero cs-hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <V2Crumbs trail={[{ label: "Home", href: "/" }, { label: "Case studies", href: "/case-studies" }, { label: c.headline || title }]} />
            {preview && <p className="cs-preview" role="status">Preview. This case study is not published, so only you can see this page.</p>}
            <p className="eyebrow">Case study</p>
            <h1>{c.headline || title}</h1>
            {c.summary && <p className="hero__sub">{c.summary}</p>}
            {(c.client.industry || c.client.location) && (
              <ul className="cs-meta">
                {c.client.industry && <li>{c.client.industry}</li>}
                {c.client.location && <li>{c.client.location}</li>}
                {c.timeline && <li>{c.timeline}</li>}
              </ul>
            )}
            {c.services.length > 0 && (
              <div className="skills cs-chips">
                {c.services.map((s) => (
                  <span key={s}>{serviceHref[s] ? <a href={serviceHref[s]}>{s}</a> : s}</span>
                ))}
              </div>
            )}
          </div>
          {cover && (
            <div className="cs-visual rv">
              <figure className="cs-cover">
                <img src={src(cover)} alt={cover.alt || cover.asset_alt} width={cover.width} height={cover.height} />
              </figure>
              {c.outcomes.slice(0, 2).map((o, i) => (
                <div key={i} className={`cs-float cs-float--${i + 1}`} style={{ animationDelay: `${0.4 + i * 0.5}s` }}>
                  <b>{o.value}</b>
                  <span>{o.metric}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {c.outcomes.length > 0 && (
        <section className="sec cs-results-sec" aria-label="Key results">
          <div className="wrap">
            <div className="cs-stats">
              {c.outcomes.map((o, i) => (
                <div key={i} className={"cs-stat rv" + (o.value.length > 16 ? " cs-stat--long" : "")} style={{ background: TINTS[i % TINTS.length], transitionDelay: `${(i % 3) * 0.08}s` }}>
                  <span className="cs-stat__k">
                    {o.metric}
                  </span>
                  <b>{o.value}</b>
                  {o.note ? <span className="cs-note">{o.note}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap cs-layout">
          <article className="prose cs-main">
            {blocks.map((b) => (
              <div key={b.key} className="cs-block rv">
                <div className="cs-block__head">
                  <span className="cs-block__ico">
                    <V2Icon name={SECTION_ICON[b.key] ?? "check"} />
                  </span>
                  <h2>{b.heading}</h2>
                </div>
                {b.text.map((p, i) => (
                  <p key={i}>{autoLink(p, targets, budget)}</p>
                ))}
                {b.figures.map((f) => <Figure key={f.id} img={f} />)}
              </div>
            ))}
            {c.testimonial.quote && (
              <blockquote className="cs-quote">
                <p>{c.testimonial.quote}</p>
                {c.testimonial.attribution && <footer>{c.testimonial.attribution}</footer>}
              </blockquote>
            )}
          </article>

          <aside className="cs-side" aria-label="Project summary">
            <div className="frame cs-card">
              <h2 className="h3">At a glance</h2>
              <dl className="cs-facts">
                {facts.map(([k, v, href]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{href ? <a href={href}>{v}</a> : v}</dd>
                  </div>
                ))}
                {c.services.length > 0 && (
                  <div>
                    <dt>Services</dt>
                    <dd>
                      {c.services.map((s, i) => {
                        const link = related.links.services.find((x) => x.text === s);
                        return (
                          <span key={s}>
                            {i > 0 && ", "}
                            {link ? <a href={link.path}>{s}</a> : s}
                          </span>
                        );
                      })}
                    </dd>
                  </div>
                )}
              </dl>
              {c.techStack.length > 0 && (
                <>
                  <h3 className="h3 cs-facts__sub">Technology</h3>
                  <div className="skills cs-tech">
                    {c.techStack.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </>
              )}
              <a className="btn btn--grad cs-side__cta" href="/contact">
                Discuss a similar project <V2Icon name="arrow" />
              </a>
            </div>
          </aside>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="sec sec--cloud">
          <div className="wrap">
            <div className="sec__head rv">
              <h2 className="h2">Screens and diagrams</h2>
            </div>
            <div className="cs-gallery">
              {gallery.map((g) => (
                <Figure key={g.id} img={g} />
              ))}
            </div>
          </div>
        </section>
      )}

      {hasRelated && (
        <section className="sec cs-related">
          <div className="wrap">
            {related.links.services.length > 0 && (
              <div className="cs-rel-group">
                <div className="sec__head rv">
                  <h2 className="h2">Services used in this project</h2>
                </div>
                <div className="kit-cards kit-cards--3">
                  {related.links.services.map((l, i) => (
                    <a key={l.path} className="kit-card kit-card--link rv" href={l.path} style={{ background: TINTS[i % 4], transitionDelay: `${i * 0.08}s` }}>
                      <h3>{l.text}</h3>
                      <span className="kit-card__go">
                        Explore the service <V2Icon name="arrow" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {related.studies.length > 0 && (
              <div className="cs-rel-group">
                <div className="sec__head rv">
                  <h2 className="h2">More case studies</h2>
                </div>
                <div className="bgrid">
                  {related.studies.map((s, i) => (
                    <a key={s.slug} className="bcard rv" href={`/case-studies/${s.slug}`} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                      {s.cover && (
                        <span className="bcard__img">
                          <img src={src(s.cover)} alt={s.cover.alt} width={s.cover.width} height={s.cover.height} loading="lazy" decoding="async" />
                        </span>
                      )}
                      <h3>{s.content.headline || s.title}</h3>
                      {s.content.summary && <p>{s.content.summary}</p>}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {related.guides.length > 0 && (
              <div className="cs-rel-group">
                <div className="sec__head rv">
                  <h2 className="h2">Keep reading</h2>
                </div>
                <div className="bgrid">
                  {related.guides.map((g, i) => (
                    <a key={g.path} className="bcard rv" href={g.path} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                      {g.tag && <span className="bcard__tag">{g.tag}</span>}
                      <h3>{g.title}</h3>
                      {g.description && <p>{g.description}</p>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {c.disclosure && (
        <section className="sec cs-disclosure">
          <div className="wrap">
            <p className="muted">{c.disclosure}</p>
          </div>
        </section>
      )}

      <section className="sec cs-end">
        <div className="wrap">
          <div className="cs-end__box rv">
            <h2 className="h2">Planning something similar?</h2>
            <p className="lead">Tell us what you need built and we will scope it with you.</p>
            <div className="hero__acts">
              <a className="btn btn--grad" href="/contact">
                Start a project <V2Icon name="arrow" />
              </a>
              <a className="tlink" href="/case-studies">
                <span>All case studies</span>
                <V2Icon name="arrow" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </V2Shell>
  );
}

export function CaseStudyIndex({ studies, paths }: { studies: Card[]; paths: string[] }) {
  return (
    <V2Shell page="case-studies" paths={paths}>
      <SceneHero
        labelId="cs-h1"
        trail={[{ label: "Home", href: "/" }, { label: "Case studies" }]}
        eyebrow="Case studies"
        h1="How projects were scoped and delivered"
        sub="Stories of businesses that had software built with us: the problem, what we built and what changed."
        actions={
          <a className="btn btn--grad" href="#studies">
            Read the studies <V2Icon name="arrow" />
          </a>
        }
        scene={<HeroScene kind="gallery" title="Case studies" items={[]} stack={["All", "Software", "Mobile", "AI"]} bubble="Problem, build, result" />}
      />
      <section className="sec" id="studies">
        <div className="wrap">
          {studies.length === 0 ? (
            <p className="lead muted">Case studies are being added. Check back soon.</p>
          ) : (
            <div className="cs-cards">
              {studies.map((s, i) => {
                const meta = [s.content.client.industry, s.content.client.location].filter(Boolean);
                return (
                  <a key={s.slug} className="cs-card rv" href={`/case-studies/${s.slug}`} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                    {s.cover && (
                      <span className="cs-card__img" style={{ background: TINTS[i % TINTS.length] }}>
                        <img src={src(s.cover)} alt={s.cover.alt} width={s.cover.width} height={s.cover.height} loading="lazy" decoding="async" />
                      </span>
                    )}
                    <span className="cs-card__body">
                      {meta.length > 0 && (
                        <span className="cs-card__meta">
                          {meta.map((m) => (
                            <i key={m}>{m}</i>
                          ))}
                        </span>
                      )}
                      <h2>{s.content.headline || s.title}</h2>
                      {s.content.summary && <p>{s.content.summary}</p>}
                      <span className="cs-card__go">
                        Read the case study <V2Icon name="arrow" />
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </V2Shell>
  );
}
