import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { V2Icon, V2Img } from "./site/v2/ui";
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
import { FaqExplorer, type FaqCategory } from "./faq-explorer";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The FAQ page on the v2 design: scene hero, a searchable explorer with a tab per topic, and the "still have a
// question" routes as colour cards. All questions and answers are the page's own copy.

/** True for FAQ content generated from the FAQ spec; anything older keeps the generic renderer. */
export function isFaqContent(content: Content, path: string) {
  return path === "/faq" && !!content.pageSections?.some((s) => s.id === "faq-categories" && !s.omitted);
}

type Props = { content: Content; path: string; paths: string[]; preview?: boolean; linkMap?: Record<string, string> };

const TINTS = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)"];
const OPTION_SPOTS = ["ic-scope", "ic-handover"];

export function FaqSections({ content, path, paths, preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const h = f("hero");
  const heroTitle = h.h1 || content.title;
  const trail = breadcrumbs(path, heroTitle);
  const contact = go("/contact") + "?service=" + encodeURIComponent("Question about services");
  const cats = f("faq-categories");
  const still = f("still-have-questions");
  const clean = (html: string) => sanitizeRichHTML(/<[a-z][\s\S]*>/i.test(html) ? html : `<p>${html.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`, false, paths.length ? paths : undefined);

  const categories: FaqCategory[] = [];
  for (let c = 1; c <= 8; c++) {
    const name = cats[`cat_${c}_name`]?.trim();
    const items: FaqCategory["items"] = [];
    for (let n = 1; n <= 12; n++) {
      const q = cats[`cat_${c}_q${n}`]?.trim();
      const a = cats[`cat_${c}_a${n}`]?.trim();
      if (q && a) items.push({ q, a: clean(a) });
    }
    if (name && items.length) categories.push({ name, items });
  }
  const total = categories.reduce((n, c) => n + c.items.length, 0);
  const options = [1, 2, 3]
    .map((n) => ({ label: still[`option_${n}_label`]?.trim(), cta: still[`option_${n}_cta`]?.trim(), url: still[`option_${n}_url`]?.trim() }))
    .filter((o) => o.label);

  return (
    <>
      <SceneHero
        labelId="faq-h1"
        trail={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))}
        eyebrow={h.tag_pill || "FAQ"}
        h1={heroTitle}
        sub={h.subheadline}
        actions={
          <>
            <a className="btn btn--grad" href="#questions">
              Browse the questions <V2Icon name="arrow" />
            </a>
            <TrackedLink href={contact} event="consultation_click" service="FAQ" className="btn btn--ghost">
              Ask the team
            </TrackedLink>
          </>
        }
        scene={<HeroScene kind="faq" title="Questions" items={[]} bubble={total ? `${total} questions answered` : undefined} />}
      />

      {categories.length > 0 && (
        <section id="questions" className="sec" aria-label="Questions and answers">
          <div className="wrap">
            <FaqExplorer categories={categories} />
          </div>
        </section>
      )}

      {(still.heading || options.length > 0) && (
        <section id="still-have-questions" className="sec sec--cloud">
          <div className="wrap">
            <div className="sec__head rv">
              {still.heading && <h2 className="h2">{still.heading}</h2>}
              {still.subheadline && <p className="lead">{still.subheadline}</p>}
            </div>
            <div className="kit-cards kit-cards--2">
              {options.map((o, i) => (
                <a key={o.label} className="kit-card kit-card--link rv" href={o.url ? go(o.url) : contact} style={{ background: TINTS[(i + 1) % TINTS.length], transitionDelay: `${i * 0.1}s` }}>
                  <V2Img name={OPTION_SPOTS[i % OPTION_SPOTS.length]} className="kit-card__ico" />
                  <h3>{o.label}</h3>
                  <span className="kit-card__go">
                    {o.cta || "Learn more"} <V2Icon name="arrow" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
