"use client";
import { Fragment } from "react";
import { brandId, TechIcon } from "../brand-icon";
import { V2Icon, V2Img, V2ProductIcon, V2SectionHead, v2img } from "../site/v2/ui";
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
import { HeroBoard, type BriefOption } from "./v2/hero-board";
import {
  AiMock,
  CloudMock,
  DevOpsMock,
  MobileMock,
  SoftwareMock,
} from "./v2/practice-mocks";
import { PlanMock, RosterMock, TeamToolsMock } from "./v2/model-mocks";

// Technologies with a product icon when there is no brand mark.
const productIcons: Record<string, string> = {
  React: "react-atom",
  "Node.js": "nodejs-hexagon",
  Python: "python-snake",
  AWS: "aws-cloud",
  Docker: "docker-whale",
  Kubernetes: "kubernetes-wheel",
  Terraform: "terraform-blocks",
  Flutter: "flutter-diamond",
};

function TechLogo({ name }: { name: string }) {
  if (brandId(name)) return <TechIcon name={name} className="marquee__logo" />;
  const icon = productIcons[name];
  return icon ? <V2ProductIcon name={icon} size={22} /> : null;
}

// Chip order matches the hero boards in v2/hero-board.tsx.
const briefChips = [
  { key: "software", label: "brief-opt-1", service: "t13" },
  { key: "ai", label: "brief-opt-2", service: "home-48" },
  { key: "cloud", label: "brief-opt-3", service: "service-cloud" },
  { key: "mobile", label: "brief-opt-4", service: "home-130" },
  { key: "scope", label: "brief-opt-5", service: "t185" },
] as const;

export function Hero() {
  const text = useText();
  const track = useTrack();
  const options: BriefOption[] = briefChips.map((chip) => ({
    key: chip.key,
    label: <T k={chip.label} />,
    service: text(chip.service),
  }));
  return (
    <Section id="hero" labelledBy="hero-title" className="hero">
      <HeroBoard
        intro={
          <>
            <p className="label">
              <T k="t0" />
            </p>
            <h1 id="hero-title">
              <T k="t1" />{" "}
              <span className="hl">
                <T k="t2" />
              </span>
            </h1>
            <Block k="t4" className="hero__sub" />
          </>
        }
        options={options}
        briefTitle={<T k="brief-title" />}
        briefSub={<T k="brief-sub" />}
        goLabel={<T k="brief-go" />}
        note={<Block k="brief-note" as="div" />}
        secondary={
          <div className="hero__acts">
            <a
              className="btn btn--ghost"
              href="#contact"
              data-track="consultation_click"
              onClick={() => track("consultation_click", "hero", "#contact")}
            >
              <T k="home-49" />
            </a>
            <a className="hero__link" href="#services">
              <T k="hero-secondary" /> <V2Icon name="arrow" />
            </a>
          </div>
        }
      />
    </Section>
  );
}

export function Stack() {
  const destination = useDestination();
  const names = stack.flatMap(([, items]) => items);
  return (
    <Section id="section-1" labelledBy="stack-title" className="trust">
      <p id="stack-title">
        <T k="stack-title" />
      </p>
      <div className="marquee">
        <ul className="marquee__track" data-marquee>
          {names.map((item) => {
            const href = stackLinks[item]
              ? destination(stackLinks[item])
              : undefined;
            return (
              <li key={item}>
                <TechLogo name={item} />
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
      </div>
    </Section>
  );
}

// The five practices, in prototype order. DevOps and cloud are separate panels with their own sub-links.
const devopsLinks = [
  ["DevOps and CI/CD", "/devops-services"],
  ["Kubernetes", "/kubernetes-services"],
  ["Docker", "/docker-containerisation-services"],
  ["Terraform", "/terraform-infrastructure-services"],
] as const;

const hubById = (id: string) => hubs.find((hub) => hub.id === id)!;

const practices = [
  {
    id: "software",
    tag: "hub-software-tag",
    title: "t21",
    body: "t23",
    cta: "svc-software-cta",
    service: "Custom software",
    links: hubById("software").links,
    Mock: SoftwareMock,
  },
  {
    id: "ai",
    tag: "home-201",
    title: "stripe-ai-title",
    body: "stripe-ai-body",
    cta: "svc-ai-cta",
    service: "AI & business automation",
    links: hubById("ai").links,
    Mock: AiMock,
  },
  {
    id: "devops",
    tag: "svc-devops-tag",
    title: "svc-devops-title",
    body: "svc-devops-body",
    cta: "svc-devops-cta",
    service: "Cloud & DevOps",
    links: devopsLinks,
    Mock: DevOpsMock,
  },
  {
    id: "mobile",
    tag: "hub-mobile-tag",
    title: "t35",
    body: "t37",
    cta: "svc-mobile-cta",
    service: "Mobile application development",
    links: hubById("mobile").links,
    Mock: MobileMock,
  },
  {
    id: "cloud",
    tag: "svc-cloud-tag",
    title: "stripe-cloud-title",
    body: "stripe-cloud-body",
    cta: "svc-cloud-cta",
    service: "Cloud & DevOps",
    links: hubById("cloud").links.slice(0, 4),
    Mock: CloudMock,
  },
] as const;

export function Services() {
  const text = useText();
  return (
    <Section id="services" labelledBy="services-title" className="sec">
      <div className="wrap">
        <V2SectionHead
          id="services-title"
          eyebrow={<T k="home-138" />}
          title={
            <>
              <T k="services-title-1" /> <T k="services-title-2" />
            </>
          }
          lead={<T k="home-4" />}
        />
        <div
          className="seg rv"
          role="tablist"
          aria-label={text("home-138")}
          data-tabs
        >
          {practices.map((practice, i) => (
            <button
              key={practice.id}
              type="button"
              role="tab"
              id={`tab-${practice.id}`}
              aria-controls={practice.id}
              aria-selected={i === 0}
              tabIndex={i === 0 ? 0 : -1}
            >
              <T k={practice.tag} />
            </button>
          ))}
        </div>
        {practices.map((practice, i) => {
          const Mock = practice.Mock;
          return (
            <article
              key={practice.id}
              id={practice.id}
              data-hub={practice.id}
              role="tabpanel"
              aria-labelledby={`tab-${practice.id}`}
              hidden={i !== 0}
              className={i === 0 ? "xp in" : "xp"}
            >
              <div className="xp__copy">
                <h3>
                  <T k={practice.title} />
                </h3>
                <Block k={practice.body} />
                <ul className="xp__links">
                  {practice.links.map(([label, path]) => (
                    <li key={path}>
                      <PageLink path={path} hub={practice.id} planned>
                        {label}
                      </PageLink>
                    </li>
                  ))}
                </ul>
                <DiscussLink service={practice.service} hub={practice.id}>
                  <T k={practice.cta} />
                </DiscussLink>
              </div>
              <div className="xp__frame" aria-hidden="true">
                <Mock />
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

export function Supporting() {
  return (
    <Section
      id="supporting-services"
      labelledBy="supporting-title"
      className="sec sec--cloud"
    >
      <div className="wrap">
        <h2 className="big rv" id="supporting-title">
          <T k="home-245" /> <T k="home-246" />
        </h2>
        <div className="catgrid">
          {supporting.map((item) => (
            <PageLink
              key={item.path}
              path={item.path}
              hub={item.hub}
              className="cat rv"
            >
              <h3>
                <T k={item.title} />
              </h3>
              <p>
                <T k={item.body} />
              </p>
              <span className="more">
                <V2Icon name="arrow" />
              </span>
            </PageLink>
          ))}
        </div>
      </div>
    </Section>
  );
}

// Team carousel: role cards with illustrated characters (prototype roles and copy).
const roleCards = [
  {
    name: "Frontend developer",
    desc: "Interfaces and client apps, in React and Next.js.",
    char: "react",
    alt: "Illustrated frontend developer character",
    chip: "Building your interface",
    path: "/hire-react-developer",
    icons: ["react-atom", "code-brackets"],
  },
  {
    name: "Backend developer",
    desc: "APIs, services and data, in Node.js, Python and Laravel.",
    char: "node",
    alt: "Illustrated backend developer character",
    chip: "Designing your API",
    path: "/hire-nodejs-developer",
    icons: ["nodejs-hexagon", "python-snake", "api-plug"],
  },
  {
    name: "Mobile developer",
    desc: "iOS, Android and cross-platform apps in Flutter, Swift and Kotlin.",
    char: "mobile",
    alt: "Illustrated mobile developer character",
    chip: "Shipping your app build",
    path: "/hire-flutter-developer",
    icons: ["flutter-diamond", "mobile-device"],
  },
  {
    name: "AI/ML developer",
    desc: "LLM features, machine learning models and data pipelines.",
    char: "ai",
    alt: "Illustrated AI and machine learning developer character",
    chip: "Connecting your documents",
    path: "/hire-ai-ml-developer",
    icons: ["brain-circuit", "python-snake"],
  },
  {
    name: "DevOps engineer",
    desc: "CI/CD pipelines, containers and Infrastructure as Code.",
    char: "devops",
    alt: "Illustrated DevOps engineer character",
    chip: "Automating your releases",
    path: "/hire-devops-engineer",
    icons: ["kubernetes-wheel", "terraform-blocks", "docker-whale"],
  },
  {
    name: "UI/UX designer",
    desc: "Product interfaces, user journeys and prototypes that clarify what needs to be built.",
    char: "design",
    alt: "Illustrated UI and UX designer character",
    chip: "Mapping your user flows",
    path: "/hire-ui-ux-designer",
    icons: ["layers-stack"],
  },
] as const;

const roleFallback = "Help defining the scope";

export function Team() {
  const destination = useDestination();
  const text = useText();
  return (
    <Section id="team" labelledBy="team-title" className="sec">
      <div className="wrap">
        <div className="team rv" data-carousel data-autoplay>
          <div>
            <p className="label">
              <T k="roles-eyebrow" />
            </p>
            <h2 className="team__h" id="team-title">
              <T k="roles-title" />
            </h2>
            <ul className="rlist" role="tablist" aria-label={text("roles-eyebrow")}>
              {roleCards.map((role, i) => (
                <li key={role.name}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={i === 0}
                    data-goto={i}
                  >
                    <i>
                      <V2Icon name="plus" />
                    </i>
                    <span>
                      {role.name}
                      <small>{role.desc}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="car">
            <div className="car__view">
              <div className="car__track">
                {roleCards.map((role) => {
                  const href = destination(role.path);
                  return (
                    <article key={role.name} className="rcard">
                      <div className="rcard__img">
                        <img src={v2img(`char-${role.char}`)} alt={role.alt} loading="lazy" />
                        <span className="rcard__pill">
                          <img src={v2img(`char-${role.char}`)} alt="" />
                          {role.chip}
                        </span>
                      </div>
                      <h3>{role.name}</h3>
                      <p>{role.desc}</p>
                      <div className="rcard__f">
                        <span className="hex">
                          {role.icons.map((icon) => (
                            <span key={icon}>
                              <V2ProductIcon name={icon} size={20} />
                            </span>
                          ))}
                        </span>
                        {href ? (
                          <a className="btn btn--ghost" href={href} data-published-link="true">
                            Hire <V2Icon name="arrow" />
                          </a>
                        ) : (
                          <a
                            className="btn btn--ghost"
                            href="#contact"
                            data-service={roleFallback}
                            onClick={() => selectService(roleFallback)}
                          >
                            Hire <V2Icon name="arrow" />
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <div className="car__nav">
              <button className="arr" type="button" aria-label="Previous role" data-prev>
                <V2Icon name="left" />
              </button>
              <span className="car__dots" aria-hidden="true" />
              <button className="arr" type="button" aria-label="Next role" data-next>
                <V2Icon name="arrow" />
              </button>
            </div>
          </div>
        </div>
        <div className="team__all">
          <PageLink path="/hire-developers" className="btn btn--ghost">
            <T k="roles-all" /> <V2Icon name="arrow" />
          </PageLink>
        </div>
      </div>
    </Section>
  );
}

// Floating cards around the "why" statement (live India points; the first is the scope card).
const indiaCards = [
  { style: { left: "3%", top: 70 }, speed: "-0.08", hide: false },
  { style: { right: "3%", top: 110 }, speed: "-0.12", hide: false },
  { style: { left: "16%", top: 330 }, speed: "0.1", hide: true },
] as const;

export function India() {
  return (
    <Section
      id="india"
      labelledBy="india-title"
      className="ctx"
      attrs={{ "data-parallax": "" }}
    >
      <div className="wrap">
        <div className="ctx__top">
          <div>
            <p className="label">
              <T k="home-271" />
            </p>
            <h2 className="huge rv" id="india-title">
              <T k="home-272" /> <T k="home-273" /> <T k="home-274" />
            </h2>
          </div>
          <div className="rv">
            <Block k="home-275" />
            <PageLink path="/why-choose-netofficials" className="btn btn--black">
              <T k="home-271" /> <V2Icon name="arrow" />
            </PageLink>
          </div>
        </div>
        <div className="ctx__stage">
          <div className="ctx__hero">
            <V2Img
              name="hero-crew"
              priority
              alt="Illustrated software engineer character with headphones"
              width={1200}
              height={900}
            />
          </div>
          {indiaPoints.map(([label, title, body], i) => (
            <div
              key={label}
              className={`fc${indiaCards[i].hide ? " fc--hide-md" : ""}`}
              style={indiaCards[i].style}
              data-speed={indiaCards[i].speed}
            >
              <b>
                <T k={label} />
              </b>
              <div className="fc__in">
                <span className="fc__title">
                  <T k={title} />
                </span>
                <Block k={body} className="fc__text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Assurance() {
  const items = [
    { n: 1, img: "ic-scope" },
    { n: 2, img: "ic-milestones" },
    { n: 3, img: "ic-timezone" },
    { n: 4, img: "ic-handover" },
  ] as const;
  return (
    <Section id="assurance" labelledBy="assure-label" className="feat">
      <h2 id="assure-label" className="sr-only">
        <T k="assure-label" />
      </h2>
      <div className="wrap feat__g feat__g--4">
        {items.map((item) => (
          <div key={item.n} className="rv">
            <V2Img name={item.img} className="spot" />
            <h3>
              <T k={`assure-${item.n}-title`} />
            </h3>
            <Block k={`assure-${item.n}-text`} />
          </div>
        ))}
      </div>
    </Section>
  );
}

const stepColours = [
  "var(--p-lime)",
  "var(--p-sky)",
  "var(--p-lavender)",
  "var(--p-peach)",
] as const;

// Delivery stages. The numbers are a real sequence, so they stay.
export function Process() {
  const text = useText();
  return (
    <Section id="delivery" labelledBy="delivery-title" className="flow">
      <div className="wrap">
        <p className="label rv">
          <T k="home-287" />
        </p>
        <h2 className="huge rv" id="delivery-title">
          <T k="home-288" /> <T k="home-289" />
        </h2>
        <Block k="delivery-lead" className="flow__sub rv" />
        <div className="wf" data-wf>
          <div className="wf__trig">
            <span className="wf__bolt">
              <V2Icon name="bolt" />
            </span>
            <i>
              <V2Icon name="brief" />
            </i>
            When your brief arrives
          </div>
          {steps.map(([title, body, deliverables], i) => {
            const delay = `${0.1 + i * 0.2}s`;
            const lineDelay = `${0.2 + (i - 1) * 0.2}s`;
            return (
              <Fragment key={title}>
                {i > 0 && (
                  <>
                    <span className="wf__ln" style={{ transitionDelay: lineDelay }} />
                    <span className="wf__tag">You review</span>
                    <span className="wf__ln" style={{ transitionDelay: lineDelay }} />
                  </>
                )}
                <div className="wf__step" style={{ transitionDelay: delay }}>
                  <div>
                    <span className="n" style={{ background: stepColours[i] }}>
                      {i + 1}
                    </span>
                    <div>
                      <h3>
                        <T k={title} />
                      </h3>
                      <Block k={body} />
                    </div>
                    <p className="deliver-label">
                      <T k="deliver-label" />
                    </p>
                    <ul>
                      {text(deliverables)
                        .split("·")
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .map((item) => (
                          <li key={item}>
                            <V2Icon name="doc" />
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </Fragment>
            );
          })}
          <PageLink path="/how-we-work" className="btn btn--black wf__end">
            See how we work <V2Icon name="arrow" />
          </PageLink>
        </div>
      </div>
    </Section>
  );
}

// Engagement models: stacked cards (copy from the live engage-* slots).
const models = [
  {
    value: "project",
    title: "engage-1-title",
    body: "engage-1-body",
    best: "engage-1-best",
    cta: "model-1-cta",
    service: "Help defining the scope",
    link: ["model-compare", "/engagement-models"],
    icons: ["brief", "flag", "check", "key"],
    Mock: PlanMock,
  },
  {
    value: "team",
    title: "engage-2-title",
    body: "engage-2-body",
    best: "engage-2-best",
    cta: "model-2-cta",
    service: "Help defining the scope",
    link: ["model-compare", "/engagement-models"],
    icons: ["users", "flag", "flag", "flag"],
    Mock: RosterMock,
  },
  {
    value: "ext",
    title: "engage-3-title",
    body: "engage-3-body",
    best: "engage-3-best",
    cta: "model-3-cta",
    service: "Help defining the scope",
    link: ["home-350", "/hire-developers"],
    icons: ["users", "users"],
    Mock: TeamToolsMock,
  },
] as const;

const roleSubs = [
  "role-group-1-sub",
  "role-group-2-sub",
  "role-group-3-sub",
  "role-group-4-sub",
] as const;

export function Hire() {
  const destination = useDestination();
  const fallback = destination("/hire-developers") ?? "#contact";
  return (
    <Section id="hire" labelledBy="hire-title" className="models">
      <div className="wrap">
        <p className="label rv">
          <T k="home-314" />
        </p>
        <h2 className="big rv models__head" id="hire-title">
          <T k="home-315" />
        </h2>
        <Block k="home-317" className="lead models__lead rv" />
        {models.map((model) => {
          const Mock = model.Mock;
          return (
            <article key={model.value} className="mcard">
              <div className="mcard__c">
                <div className="ovl" aria-hidden="true">
                  {model.icons.map((icon, j) => (
                    <Fragment key={`${icon}-${j}`}>
                      {j > 0 && (
                        <span className="arrow">
                          <V2Icon name="arrow" />
                        </span>
                      )}
                      <span>
                        <V2Icon name={icon as "brief"} />
                      </span>
                    </Fragment>
                  ))}
                </div>
                <h3>
                  <T k={model.title} />
                </h3>
                <Block k={model.body} />
                <small>
                  <T k={model.best} />
                </small>
                <div className="model__actions">
                  <a
                    className="btn btn--black"
                    href="#contact"
                    data-pre={model.service}
                    onClick={() => selectService(model.service)}
                  >
                    <T k={model.cta} /> <V2Icon name="arrow" />
                  </a>
                  <PageLink path={model.link[1]} className="btn btn--ghost">
                    <T k={model.link[0]} />
                  </PageLink>
                </div>
              </div>
              <Mock />
            </article>
          );
        })}
        <div className="roles">
          {roleGroups.map(([group, roles], i) => (
            <div key={group} className="roles__g rv">
              <h3>{group}</h3>
              <p>
                <T k={roleSubs[i]} />
              </p>
              <ul>
                {roles.map(([label, path]) => {
                  const href = destination(path);
                  return (
                    <li key={path}>
                      <a
                        href={href ?? fallback}
                        data-published-link={href ? "true" : undefined}
                        data-service={href ? undefined : roleFallback}
                        title={
                          href
                            ? undefined
                            : "Discuss this developer role and project requirements"
                        }
                        onClick={
                          href ? undefined : () => selectService(roleFallback)
                        }
                      >
                        {label} <V2Icon name="arrow" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <Block k="roles-note" className="roles-note rv" />
      </div>
    </Section>
  );
}

// Coloured industry cards: dark cards at the same positions as the prototype.
const industryTints = [
  "dark",
  "var(--p-pink)",
  "var(--p-lime)",
  "var(--p-sky)",
  "var(--p-peach)",
  "dark",
  "var(--p-peri)",
  "var(--p-lime)",
  "var(--p-pink)",
  "var(--p-sky)",
  "dark",
  "var(--p-peach)",
] as const;

const industryImages = [
  "ic-healthcare",
  "ic-fintech",
  "ic-edtech",
  "ic-realestate",
  "ic-logistics",
  "ic-ondemand",
  "ic-retail",
  "ic-travel",
  "ic-legal",
  "ic-hr",
  "ic-insurance",
  "ic-manufacturing",
] as const;

export function Industries() {
  const destination = useDestination();
  const href = destination("/industries");
  return (
    <Section
      id="industries"
      labelledBy="industries-title"
      className="ind"
      attrs={{ "data-scroller": "" }}
    >
      <div className="wrap ind__h">
        <div>
          <h2 className="rv" id="industries-title">
            <T k="home-299" /> <T k="home-300" />
          </h2>
          <Block k="home-301" className="rv" />
        </div>
        {href && (
          <a className="btn btn--ghost rv" href={href} data-published-link="true">
            All industries <V2Icon name="arrow" />
          </a>
        )}
      </div>
      <div className="irow">
        {industries.map(([name, detail], i) => {
          const tint = industryTints[i];
          const isDark = tint === "dark";
          const className = `icard${isDark ? " icard--dark" : ""}`;
          const style = isDark ? undefined : { background: tint };
          const inner = (
            <>
              <V2Img name={industryImages[i]} className="spot" />
              <h3>
                <T k={name} />
              </h3>
              <p>
                <T k={detail} />
              </p>
              <span className="tlink" aria-hidden="true">
                <V2Icon name="arrow" />
              </span>
            </>
          );
          return href ? (
            <a key={name} className={className} style={style} href={href} data-published-link="true">
              {inner}
            </a>
          ) : (
            <div key={name} className={className} style={style}>
              {inner}
            </div>
          );
        })}
      </div>
      <div className="wrap ind__nav">
        <button type="button" aria-label="Scroll industries left" data-scroll="-1">
          <V2Icon name="left" />
        </button>
        <button type="button" aria-label="Scroll industries right" data-scroll="1">
          <V2Icon name="arrow" />
        </button>
      </div>
    </Section>
  );
}

// Decorative word marquee between the industries and the case studies.
const words = [
  { word: "Software", tiles: ["char-fullstack", "char-design"] },
  { word: "AI", tiles: ["char-ai"] },
  { word: "DevOps", tiles: ["char-devops", "char-cloud"] },
  { word: "Mobile", tiles: ["char-mobile"] },
  { word: "Cloud", tiles: ["char-cloud", "char-ai"] },
] as const;

export function Words() {
  return (
    <section className="words" aria-hidden="true">
      <div className="words__track" data-marquee>
        {words.map((item) => (
          <Fragment key={item.word}>
            <span>{item.word}</span>
            <span className="tiles">
              {item.tiles.map((tile) => (
                <V2Img key={tile} name={tile} />
              ))}
            </span>
          </Fragment>
        ))}
      </div>
    </section>
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
    <Section id="work" labelledBy="work-title" className="sec sec--cloud">
      <div className="wrap">
        <V2SectionHead
          id="work-title"
          eyebrow={<T k="home-0" />}
          title={
            <>
              <T k="home-353" /> <T k="home-354" />
            </>
          }
          lead={<T k="home-1" />}
        />
        <div className="catgrid">
          {studies.map((study) => (
            <a key={study.path} href={study.href} className="cat proof-card rv">
              <span className="cat__tag">
                <i />
                Case study
              </span>
              <h3>{study.title}</h3>
              <p>{study.description}</p>
              <span className="more">
                Read the case study <V2Icon name="arrow" />
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
    <Section id="faq" labelledBy="faq-title" className="sec">
      <div className="wrap faq">
        <div className="faq__aside rv">
          <p className="label">
            <T k="faq-eyebrow" />
          </p>
          <h2 id="faq-title">
            <T k="faq-title" />
          </h2>
          <a className="btn btn--ghost" href="#contact">
            <T k="faq-cta" /> <V2Icon name="arrow" />
          </a>
        </div>
        <div className="acc rv">
          {faqs.map(([question, answer], i) => (
            <details key={question} open={i === 0}>
              <summary>
                <T k={question} />
                <i aria-hidden="true">
                  <V2Icon name="plus" />
                </i>
              </summary>
              <Block k={answer} />
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
