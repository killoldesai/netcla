"use client";
import { useState, type CSSProperties } from "react";
import { Button, FaqList, HeroArt, Icon, SectionHead } from "../site/ui";
import { HomeHeroArt } from "../site/art/home-hero-art";
import {
  CloudArt,
  AiArt,
  DevOpsArt,
  MobileArt,
  SoftwareArt,
} from "../site/art/home-service-art";
import { HomeWhyArt } from "../site/art/home-why-art";
import {
  faqs,
  hubs,
  indiaPoints,
  industries,
  roleGroups,
  stack,
  stackLinks,
  steps,
  supporting,
} from "./copy";
import {
  Block,
  DiscussLink,
  PageLink,
  Section,
  T,
  selectService,
  useDestination,
  useText,
  useTrack,
} from "./ui";

const hubById = (id: string) => hubs.find((hub) => hub.id === id)!;

// The five practice cards in prototype order. DevOps and cloud are separate cards with their own sub-links.
const devopsLinks = [
  ["DevOps and CI/CD", "/devops-services"],
  ["Kubernetes", "/kubernetes-services"],
  ["Docker", "/docker-containerisation-services"],
  ["Terraform", "/terraform-infrastructure-services"],
] as const;

const practices = [
  {
    id: "software",
    wide: true,
    art: SoftwareArt,
    tag: "hub-software-tag",
    title: "t21",
    body: "t23",
    cta: "svc-software-cta",
    service: "Custom software",
    links: hubById("software").links,
  },
  {
    id: "ai",
    wide: true,
    art: AiArt,
    tag: "home-201",
    title: "stripe-ai-title",
    body: "stripe-ai-body",
    cta: "svc-ai-cta",
    service: "AI & business automation",
    links: hubById("ai").links,
  },
  {
    id: "devops",
    wide: false,
    art: DevOpsArt,
    tag: "svc-devops-tag",
    title: "svc-devops-title",
    body: "svc-devops-body",
    cta: "svc-devops-cta",
    service: "Cloud & DevOps",
    links: devopsLinks,
  },
  {
    id: "mobile",
    wide: false,
    art: MobileArt,
    tag: "hub-mobile-tag",
    title: "t35",
    body: "t37",
    cta: "svc-mobile-cta",
    service: "Mobile application development",
    links: hubById("mobile").links,
  },
  {
    id: "cloud",
    wide: false,
    art: CloudArt,
    tag: "svc-cloud-tag",
    title: "stripe-cloud-title",
    body: "stripe-cloud-body",
    cta: "svc-cloud-cta",
    service: "Cloud & DevOps",
    links: hubById("cloud").links.slice(0, 4),
  },
] as const;

export function Hero() {
  const track = useTrack();
  return (
    <Section id="hero" labelledBy="hero-title" className="hero">
      <div className="container hero__grid">
        <div>
          <span className="eyebrow">
            <T k="t0" />
          </span>
          <h1 id="hero-title">
            <T k="t1" />{" "}
            <span className="hl">
              <T k="t2" />
            </span>
          </h1>
          <Block k="t4" className="lead" />
          <div className="hero__actions">
            <Button
              href="#contact"
              size="lg"
              data-track="consultation_click"
              onClick={() => track("consultation_click", "hero", "#contact")}
            >
              <T k="home-49" />
            </Button>
            <Button
              href="#services"
              variant="secondary"
              size="lg"
              arrow={false}
            >
              <T k="hero-secondary" />
            </Button>
          </div>
        </div>
        <HeroArt fallback={<HomeHeroArt />} priority />
      </div>
    </Section>
  );
}

// "What do you need built?" tiles. Choosing a tile and then "Start my brief" preselects that service in the form.
const briefOptions = [
  { label: "brief-opt-1", service: "t13", icon: "code-brackets" },
  { label: "brief-opt-2", service: "home-48", icon: "brain-circuit" },
  { label: "brief-opt-3", service: "service-cloud", icon: "cloud-upload" },
  { label: "brief-opt-4", service: "home-130", icon: "mobile-device" },
  { label: "brief-opt-5", service: "t185", icon: "users-group" },
] as const;

export function Brief() {
  const text = useText();
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <Section id="brief" labelledBy="brief-title" className="brief">
      <div className="container">
        <div className="brief__card">
          <div>
            <h2 id="brief-title" className="brief__title">
              <T k="brief-title" />
            </h2>
            <p className="brief__sub">
              <T k="brief-sub" />
            </p>
          </div>
          <div
            className="brief__opts"
            role="group"
            aria-labelledby="brief-title"
          >
            {briefOptions.map((option) => {
              const on = chosen === option.service;
              return (
                <button
                  key={option.service}
                  type="button"
                  className="brief-opt"
                  aria-pressed={on}
                  onClick={() => setChosen(on ? null : option.service)}
                >
                  <svg
                    className="brief-opt__icon"
                    width={28}
                    height={28}
                    aria-hidden="true"
                  >
                    <use href={`/assets/nx/icons.svg#${option.icon}`} />
                  </svg>
                  <span>
                    <T k={option.label} />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="brief__foot">
            <Block k="brief-note" className="brief__note" />
            <Button
              href="#contact"
              size="lg"
              onClick={() => {
                if (chosen) selectService(text(chosen));
              }}
            >
              <T k="brief-go" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Assurance() {
  const items = [
    { n: 1, icon: "flag" },
    { n: 2, icon: "check" },
    { n: 3, icon: "clock" },
    { n: 4, icon: "file" },
  ] as const;
  return (
    <Section id="assurance" labelledBy="assure-label" className="assure">
      <h2 id="assure-label" className="nx-sr">
        <T k="assure-label" />
      </h2>
      <div className="container assure__grid">
        {items.map((item) => (
          <div key={item.n} className="assure__item">
            <span className="assure__icon">
              <Icon name={item.icon} size={18} className="nx-icon" />
            </span>
            <div>
              <p className="assure__title">
                <T k={`assure-${item.n}-title`} />
              </p>
              <Block k={`assure-${item.n}-text`} className="assure__text" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// Technology marquee. Published technology pages are linked from the screen-reader list.
export function Stack() {
  const destination = useDestination();
  const names = stack.flatMap(([, items]) => items);
  return (
    <Section id="section-1" labelledBy="stack-title" className="strip">
      <h2 id="stack-title" className="nx-sr">
        <T k="stack-title" />
      </h2>
      <div
        className="nx-marquee nx-marquee--pause"
        style={{ "--nx-speed": "50s" } as CSSProperties}
      >
        <ul className="nx-sr">
          {names.map((item) => {
            const href = stackLinks[item]
              ? destination(stackLinks[item])
              : undefined;
            return (
              <li key={item}>
                {href ? (
                  <a href={href} data-published-link="true">
                    {item}
                  </a>
                ) : (
                  item
                )}
              </li>
            );
          })}
        </ul>
        <div className="nx-marquee__track" aria-hidden="true">
          {names.map((item) => (
            <span key={item} className="nx-marquee__item">
              {item}
            </span>
          ))}
          {names.map((item) => (
            <span
              key={`${item}-copy`}
              className="nx-marquee__item nx-marquee__dup"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Services() {
  const destination = useDestination();
  return (
    <Section id="services" labelledBy="services-title" className="section">
      <div className="container">
        <SectionHead
          id="services-title"
          eyebrow={<T k="home-138" />}
          title={
            <>
              <T k="services-title-1" /> <T k="services-title-2" />
            </>
          }
          lead={<T k="home-4" />}
        />
        <div className="svc-grid">
          {practices.map((practice, i) => {
            const Art = practice.art;
            return (
              <article
                key={practice.id}
                id={practice.id}
                data-hub={practice.id}
                className={`svc${practice.wide ? " svc--wide" : ""} nx-reveal`}
                style={{ "--nx-delay": `${(i % 3) * 100}ms` } as CSSProperties}
              >
                <div className="svc__art">
                  <Art />
                </div>
                <div className="svc__body">
                  <span className="svc__tag">
                    <T k={practice.tag} />
                  </span>
                  <h3 className="svc__title">
                    <T k={practice.title} />
                  </h3>
                  <Block k={practice.body} className="svc__text" />
                  <ul className="svc__links">
                    {practice.links.map(([label, path]) => (
                      <li key={path}>
                        <PageLink path={path} hub={practice.id} planned>
                          {label}
                        </PageLink>
                      </li>
                    ))}
                  </ul>
                  <DiscussLink
                    service={practice.service}
                    hub={practice.id}
                    className="svc__cta"
                  >
                    <T k={practice.cta} />
                  </DiscussLink>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export function Supporting() {
  return (
    <Section
      id="supporting-services"
      labelledBy="supporting-title"
      className="section"
    >
      <div className="container">
        <div className="nx-reveal">
          <h2 id="supporting-title" className="more__head">
            <T k="home-245" /> <T k="home-246" />
          </h2>
        </div>
        <div className="more nx-reveal">
          {supporting.map((item) => (
            <PageLink key={item.path} path={item.path} hub={item.hub}>
              <div>
                <strong>
                  <T k={item.title} />
                </strong>
                <span>
                  <T k={item.body} />
                </span>
              </div>
              <Icon name="arrow-right" size={20} className="nx-icon" />
            </PageLink>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Process() {
  const text = useText();
  return (
    <Section id="delivery" labelledBy="delivery-title" className="section band">
      <div className="container">
        <SectionHead
          id="delivery-title"
          eyebrow={<T k="home-287" />}
          title={
            <>
              <T k="home-288" /> <T k="home-289" />
            </>
          }
          lead={<T k="delivery-lead" />}
        />
        <ol className="nx-steps" data-steps>
          {steps.map(([title, body, deliverables], i) => (
            <li
              key={title}
              className="nx-step nx-reveal"
              style={{ "--nx-delay": `${i * 100}ms` } as CSSProperties}
            >
              <h3 className="nx-step__title">
                <T k={title} />
              </h3>
              <Block k={body} className="nx-step__desc" />
              <p className="deliver-label">
                <T k="deliver-label" />
              </p>
              <ul className="deliver">
                {text(deliverables)
                  .split("·")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function India() {
  return (
    <Section id="india" labelledBy="india-title" className="section">
      <div className="container why">
        <div className="why__art nx-reveal">
          <HomeWhyArt />
        </div>
        <div className="nx-reveal">
          <span className="eyebrow">
            <T k="home-271" />
          </span>
          <h2 id="india-title" className="h-section">
            <T k="home-272" /> <T k="home-273" /> <T k="home-274" />
          </h2>
          <Block k="home-275" className="lead" />
          <ul className="why__list">
            {indiaPoints.map(([label, title, body]) => (
              <li key={label}>
                <span className="why__label">
                  <T k={label} />
                </span>
                <div>
                  <h3>
                    <T k={title} />
                  </h3>
                  <Block k={body} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// Engagement models switcher (data-seg / data-model are wired by SiteBehaviors).
const models = [
  {
    value: "project",
    title: "engage-1-title",
    body: "engage-1-body",
    best: "engage-1-best",
    cta: "model-1-cta",
    service: "Help defining the scope",
    link: ["model-compare", "/engagement-models"],
  },
  {
    value: "team",
    title: "engage-2-title",
    body: "engage-2-body",
    best: "engage-2-best",
    cta: "model-2-cta",
    service: "Help defining the scope",
    link: ["model-compare", "/engagement-models"],
  },
  {
    value: "ext",
    title: "engage-3-title",
    body: "engage-3-body",
    best: "engage-3-best",
    cta: "model-3-cta",
    service: "Help defining the scope",
    link: ["home-350", "/hire-developers"],
  },
] as const;

const roleIcons = [
  "react-atom",
  "nodejs-hexagon",
  "flutter-diamond",
  "kubernetes-wheel",
] as const;
const roleSubs = [
  "role-group-1-sub",
  "role-group-2-sub",
  "role-group-3-sub",
  "role-group-4-sub",
] as const;

export function Hire() {
  const destination = useDestination();
  const text = useText();
  const fallback = destination("/hire-developers") ?? "#contact";
  return (
    <Section
      id="hire"
      labelledBy="hire-title"
      className="section section--white"
    >
      <div className="container">
        <div className="engage">
          <div className="nx-reveal">
            <span className="eyebrow">
              <T k="home-314" />
            </span>
            <h2 id="hire-title" className="h-section">
              <T k="home-315" />
            </h2>
            <Block k="home-317" className="lead" />
          </div>
          <div className="nx-reveal">
            <div
              className="nx-seg"
              role="radiogroup"
              aria-label={text("home-314")}
              data-seg
            >
              <span className="nx-seg__thumb" aria-hidden="true" />
              {models.map((model, i) => (
                <button
                  key={model.value}
                  type="button"
                  className="nx-seg__opt"
                  role="radio"
                  aria-checked={i === 0}
                  tabIndex={i === 0 ? 0 : -1}
                  data-value={model.value}
                >
                  <T k={model.title} />
                </button>
              ))}
            </div>
            {models.map((model, i) => (
              <div
                key={model.value}
                className="model"
                data-model={model.value}
                hidden={i !== 0}
              >
                <h3>
                  <T k={model.title} />
                </h3>
                <p>
                  <T k={model.body} />
                </p>
                <span className="nx-badge nx-badge--lime model__best">
                  <span className="nx-badge__dot" />
                  <T k={model.best} />
                </span>
                <div className="model__actions">
                  <Button
                    href="#contact"
                    data-service={model.service}
                    onClick={() => selectService(model.service)}
                  >
                    <T k={model.cta} />
                  </Button>
                  <PageLink path={model.link[1]} className="nx-arrowlink">
                    <span>
                      <T k={model.link[0]} />
                    </span>
                    <Icon name="arrow-right" size={18} className="nx-icon" />
                  </PageLink>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="roles-head nx-reveal">
          <div>
            <span className="eyebrow">
              <T k="roles-eyebrow" />
            </span>
            <h3 className="roles-head__title">
              <T k="roles-title" />
            </h3>
          </div>
          <PageLink path="/hire-developers" className="nx-arrowlink">
            <span>
              <T k="roles-all" />
            </span>
            <Icon name="arrow-right" size={18} className="nx-icon" />
          </PageLink>
        </div>
        <div className="roles">
          {roleGroups.map(([group, roles], i) => (
            <article key={group} className="rc nx-reveal">
              <div className="rc__top">
                <span className="rc__icon" aria-hidden="true">
                  <svg width={26} height={26}>
                    <use href={`/assets/nx/icons.svg#${roleIcons[i]}`} />
                  </svg>
                </span>
              </div>
              <h4 className="rc__title">{group}</h4>
              <p className="rc__sub">
                <T k={roleSubs[i]} />
              </p>
              <ul className="rc__list">
                {roles.map(([label, path]) => {
                  const href = destination(path);
                  return (
                    <li key={path}>
                      <a
                        className="rc__link"
                        href={href ?? fallback}
                        data-published-link={href ? "true" : undefined}
                        data-service={
                          href ? undefined : "Help defining the scope"
                        }
                        title={
                          href
                            ? undefined
                            : "Discuss this developer role and project requirements"
                        }
                        onClick={
                          href
                            ? undefined
                            : () => selectService("Help defining the scope")
                        }
                      >
                        <span>{label}</span>
                        <Icon
                          name="arrow-right"
                          size={16}
                          className="nx-icon"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
        <Block k="roles-note" className="roles-note nx-reveal" />
      </div>
    </Section>
  );
}

export function Industries() {
  const destination = useDestination();
  const href = destination("/industries");
  return (
    <Section id="industries" labelledBy="industries-title" className="section">
      <div className="container">
        <SectionHead
          id="industries-title"
          eyebrow={<T k="home-298" />}
          title={
            <>
              <T k="home-299" /> <T k="home-300" />
            </>
          }
          lead={<T k="home-301" />}
        />
        <div className="ind-grid nx-reveal">
          {industries.map(([name, detail, icon]) => {
            const body = (
              <>
                <div className="ind__main">
                  <span className="ind__icon" aria-hidden="true">
                    <svg width={26} height={26}>
                      <use href={`/assets/nx/icons.svg#${icon}`} />
                    </svg>
                  </span>
                  <div>
                    <strong>
                      <T k={name} />
                    </strong>
                    <span>
                      <T k={detail} />
                    </span>
                  </div>
                </div>
                <Icon name="arrow-right" size={18} className="nx-icon" />
              </>
            );
            return href ? (
              <a
                key={name}
                className="ind"
                href={href}
                data-published-link="true"
              >
                {body}
              </a>
            ) : (
              <div key={name} className="ind">
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export function Work({
  listing,
}: {
  listing: { path: string; kind: string; title: string; description: string }[];
}) {
  const destination = useDestination();
  const studies = listing.flatMap((page) => {
    const href = page.path.startsWith("/case-studies/")
      ? destination(page.path)
      : undefined;
    return href ? [{ ...page, href }] : [];
  });
  if (!studies.length) return null;
  return (
    <Section
      id="work"
      labelledBy="work-title"
      className="section section--white"
    >
      <div className="container">
        <SectionHead
          id="work-title"
          eyebrow={<T k="home-0" />}
          title={
            <>
              <T k="home-353" /> <T k="home-354" />
            </>
          }
          lead={<T k="home-1" />}
        />
        <div className="proof-grid">
          {studies.map((study) => (
            <a
              key={study.path}
              href={study.href}
              className="proof-card nx-reveal"
            >
              <span className="proof-card__tag">Case study</span>
              <h3>{study.title}</h3>
              <p>{study.description}</p>
              <span className="nx-arrowlink">
                <span>Read the case study</span>
                <Icon name="arrow-right" size={18} className="nx-icon" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Faq() {
  return (
    <Section id="faq" labelledBy="faq-title" className="section section--white">
      <div className="container faq">
        <div className="faq__aside nx-reveal">
          <span className="eyebrow">
            <T k="faq-eyebrow" />
          </span>
          <h2 id="faq-title" className="h-section">
            <T k="faq-title" />
          </h2>
          <Button href="#contact" variant="secondary">
            <T k="faq-cta" />
          </Button>
        </div>
        <div className="nx-reveal">
          <FaqList
            name="home-faq"
            items={faqs.map(([question, answer]) => ({
              q: <T k={question} />,
              a: <Block k={answer} />,
            }))}
          />
        </div>
      </div>
    </Section>
  );
}
