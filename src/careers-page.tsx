import { TrackedLink } from "./v3-interactions";
import { breadcrumbs } from "./site-structure";
import { sanitizeRichHTML } from "./rich-text";
import { V2Icon, V2Img } from "./site/v2/ui";
import { SceneHero } from "./site/v2/scene-hero";
import { HeroScene } from "./site/v2/hero-scenes";
import type { Content } from "./content";
import type { PageSection } from "./page-spec-schema";

// The Careers page on the v2 design: scene hero, why join as colour cards, open roles (or a plain empty state), the
// culture as value cards plus the full text. Copy is the page's own; nothing is added. V3Page supplies the shell and the
// closing band. Styles: the kit rules in public/assets/v2/pages/showcase.css (loaded by the hero) and css/live/careers.css.

/** True for careers content generated from the careers spec; anything older keeps the generic renderer. */
export function isCareersContent(content: Content, path: string) {
  return path === "/careers" && !!content.pageSections?.some((s) => s.id === "why-join" && !s.omitted);
}

export type Vacancy = { id: string; slug: string; title: string; department: string; location: string; employment_type: string };
type Props = { content: Content; path: string; paths: string[]; vacancies?: Vacancy[]; preview?: boolean; linkMap?: Record<string, string> };

const TINTS = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)"];
const BENEFIT_SPOTS = ["ic-software", "ic-ai", "ic-team", "ic-milestones"];
const VALUE_SPOTS = ["ic-security", "ic-handover", "ic-scope"];

const clean = (html: string, paths: string[]) => sanitizeRichHTML(html, false, paths.length ? paths : undefined);
const hasHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value);

function rows(fields: Record<string, string>, prefix: string, keys: string[], max: number) {
  const out: Record<string, string>[] = [];
  for (let n = 1; n <= max; n++) {
    const row = Object.fromEntries(keys.map((k) => [k, (fields[`${prefix}_${n}_${k}`] ?? "").trim()]));
    if (keys.some((k) => row[k])) out.push(row);
  }
  return out;
}

/** "Technical excellence, code is reviewed..." becomes a title ("Technical excellence") and the sentence that follows. */
function splitValue(text: string) {
  const i = text.indexOf(", ");
  if (i < 2 || i > 40) return { title: "", body: text };
  const rest = text.slice(i + 2);
  return { title: text.slice(0, i), body: rest.charAt(0).toUpperCase() + rest.slice(1) };
}

function Head({ label, heading, id }: { label?: string; heading?: string; id?: string }) {
  if (!label && !heading) return null;
  return (
    <div className="sec__head rv">
      {label && <span className="eyebrow">{label}</span>}
      {heading && (
        <h2 className="h2" id={id}>
          {heading}
        </h2>
      )}
    </div>
  );
}

export function CareersSections({ content, path, paths, vacancies = [], preview = false, linkMap = {} }: Props) {
  const go = (url: string) => (preview ? (linkMap[url] ?? url) : url);
  const by = (id: string): PageSection | undefined => (content.pageSections ?? []).find((s) => s.id === id && !s.omitted);
  const f = (id: string) => by(id)?.fields ?? {};
  const h = f("hero");
  const heroTitle = h.h1 || content.title;
  const trail = breadcrumbs(path, heroTitle);
  const contact = go("/contact") + "?service=" + encodeURIComponent("Careers");
  const signals = [h.culture_1, h.culture_2, h.culture_3].map((t) => t?.trim()).filter(Boolean);
  const why = f("why-join");
  const benefits = rows(why, "benefit", ["title", "body"], 4);
  const rolesSec = f("open-roles");
  const culture = f("team-culture");
  const values = [culture.value_1, culture.value_2, culture.value_3].map((t) => t?.trim()).filter(Boolean).map(splitValue);
  const paras = (culture.culture_paragraph ?? "").match(/<p[\s>][\s\S]*?<\/p>/gi) ?? (culture.culture_paragraph ? [culture.culture_paragraph] : []);

  return (
    <>
      <SceneHero
        labelId="careers-h1"
        trail={trail.map((c, i) => ({ label: c.label, href: i === trail.length - 1 ? undefined : go(c.path) }))}
        eyebrow={h.tag_pill || "Careers"}
        h1={heroTitle}
        sub={h.subheadline}
        signals={signals}
        actions={
          <>
            <a className="btn btn--grad" href="#open-roles">
              See open roles <V2Icon name="arrow" />
            </a>
            <TrackedLink href={contact} event="consultation_click" service="Careers" className="btn btn--ghost">
              Talk to the team
            </TrackedLink>
          </>
        }
        scene={<HeroScene kind="crew" title="Netofficials" items={benefits.map((b) => b.title).filter(Boolean)} bubble="Building real products" />}
      />

      {benefits.length > 0 && (
        <section id="why-join" className="sec">
          <div className="wrap">
            <Head label={why.section_label} heading={why.heading} id="why-join-h" />
            <div className="kit-cards kit-cards--2">
              {benefits.map((b, i) => (
                <article key={b.title} className="kit-card rv" style={{ background: TINTS[i % TINTS.length], transitionDelay: `${i * 0.08}s` }}>
                  <V2Img name={BENEFIT_SPOTS[i % BENEFIT_SPOTS.length]} className="kit-card__ico" />
                  <h3>{b.title}</h3>
                  <p>{b.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="open-roles" className="sec sec--cloud">
        <div className="wrap">
          <Head label={rolesSec.section_label} heading={rolesSec.heading} id="roles-h" />
          {vacancies.length === 0 ? (
            <div className="kit-panel rv">
              <V2Img name="char-lead" className="kit-panel__char" />
              <div>
                <h3>There are no open positions listed at the moment.</h3>
                <TrackedLink href={contact} event="consultation_click" service="Careers" className="btn btn--violet">
                  Talk to the team <V2Icon name="arrow" />
                </TrackedLink>
              </div>
            </div>
          ) : (
            <div className="kit-cards kit-cards--2">
              {vacancies.map((v, i) => (
                <a key={v.id} className="kit-card kit-card--link rv" href={preview ? "#open-roles" : "/careers/" + v.slug} style={{ background: TINTS[i % TINTS.length] }}>
                  {v.department && <span className="kit-card__tag">{v.department}</span>}
                  <h3>{v.title}</h3>
                  {(v.location || v.employment_type) && <p>{[v.location, v.employment_type].filter(Boolean).join(" · ")}</p>}
                  <span className="kit-card__go">
                    View role <V2Icon name="arrow" />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {(values.length > 0 || paras.length > 0) && (
        <section id="team-culture" className="sec">
          <div className="wrap">
            <Head label={culture.section_label} heading={culture.heading} id="culture-h" />
            {values.length > 0 && (
              <div className="kit-cards kit-cards--3">
                {values.map((v, i) => (
                  <article key={i} className="kit-card kit-card--plain rv" style={{ transitionDelay: `${i * 0.08}s` }}>
                    <V2Img name={VALUE_SPOTS[i % VALUE_SPOTS.length]} className="kit-card__ico" />
                    {v.title && <h3>{v.title}</h3>}
                    <p>{v.body}</p>
                  </article>
                ))}
              </div>
            )}
            {paras.length > 0 && (
              <div className="kit-text rv">
                {paras.map((p, i) => (
                  <div key={i} className="prose" dangerouslySetInnerHTML={{ __html: hasHtml(p) ? clean(p, paths) : `<p>${p}</p>` }} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
