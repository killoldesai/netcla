import type { Content } from "./content";
import { RichContent } from "./rich-content";
import type { Presentation } from "./presentation";
import { presentationFor } from "./presentation";
import { LeadForm } from "./render";
import { AutomationArtwork, CapabilityArtwork } from "./automation-artwork";
import { FoundationArtwork } from "./foundation-artwork";
import { WorkArtwork } from "./work-artwork";
import { WorkFilter } from "./work-filter";
import { coreServicePaths, coreServiceMode } from "./core-services";
import { CoreArtwork } from "./core-artwork";
import { MobileArtwork } from "./mobile-artwork";
import { AIArtwork, aiVisualMode } from "./ai-artwork";
import { CloudArtwork } from "./cloud-artwork";
import { specialistPaths, specialistMode } from "./specialist-services";
import { SpecialistArtwork } from "./specialist-artwork";
import { HireArtwork } from "./hire-artwork";
import { TechnologyArtwork, technologyMode } from "./technology-artwork";
import { IndustryArtwork, industryMode } from "./industry-artwork";
import { solutionPaths } from "./solution-services";
import { SolutionArtwork } from "./solution-artwork";
import { LocationArtwork } from "./location-artwork";
import { MarketingArtwork } from "./marketing-artwork";
import { trustPaths } from "./trust-pages";
import { TrustArtwork } from "./trust-artwork";
type Section = NonNullable<Content["sections"]>[number];
export function WorkflowArtwork({ family }: { family: string }) {
  if (family === "mobile")
    return (
      <svg
        className="csv-art"
        viewBox="0 0 620 530"
        role="img"
        aria-label="Mobile app interface illustration"
      >
        <circle cx="320" cy="265" r="205" fill="#ffffff04" stroke="#ffffff13" />
        <g transform="translate(113 100) rotate(-10 110 170)">
          <rect width="204" height="345" rx="33" fill="#edeffd" />
          <rect x="9" y="10" width="186" height="325" rx="26" fill="#d8defb" />
          <rect x="66" y="14" width="75" height="17" rx="8" fill="#353052" />
          <circle cx="100" cy="97" r="37" fill="#afcc18" />
          <path
            d="M84 96l12 13 25-29"
            stroke="#2b3041"
            strokeWidth="5"
            fill="none"
          />
          <rect x="26" y="161" width="152" height="53" rx="14" fill="#fff" />
          <rect x="26" y="231" width="152" height="53" rx="14" fill="#fff" />
        </g>
        <g transform="translate(302 65) rotate(9 105 185)">
          <rect
            width="215"
            height="371"
            rx="34"
            fill="#6978d8"
            stroke="#a3adf8"
            strokeWidth="2"
          />
          <rect x="9" y="10" width="197" height="351" rx="27" fill="#f7f8ff" />
          <rect x="65" y="14" width="84" height="17" rx="8" fill="#3c3658" />
          <text x="25" y="82" fontSize="15" fontWeight="600" fill="#4553b2">
            YOUR NEXT IDEA
          </text>
          <path
            d="M27 110h157M27 132h97"
            stroke="#d6daf0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="26" y="160" width="163" height="94" rx="17" fill="#e6ebcf" />
          <path
            d="M46 219l26-24 24 12 40-31 29 19"
            fill="none"
            stroke="#8d9d35"
            strokeWidth="4"
          />
          <rect x="26" y="277" width="163" height="46" rx="23" fill="#4553b2" />
          <text x="107" y="306" textAnchor="middle" fontSize="12" fill="#fff">
            CONNECTED EXPERIENCE
          </text>
        </g>
        <rect
          x="57"
          y="351"
          width="161"
          height="64"
          rx="20"
          fill="#37304e"
          stroke="#6b618b"
        />
        <circle cx="84" cy="383" r="7" fill="#afcc18" />
        <text x="102" y="388" fontSize="11" fill="#eee">
          BUILT FOR PEOPLE
        </text>
      </svg>
    );
  if (family === "marketing")
    return (
      <svg
        className="csv-art"
        viewBox="0 0 620 530"
        role="img"
        aria-label="Search marketing planning illustration"
      >
        <circle cx="302" cy="265" r="217" fill="#ffffff04" />
        <g transform="translate(51 122) rotate(-4 250 150)">
          <rect width="510" height="295" rx="29" fill="#f8f9ff" />
          <rect width="510" height="50" rx="29" fill="#e4e7fb" />
          <circle cx="28" cy="25" r="5" fill="#8e98d8" />
          <circle cx="47" cy="25" r="5" fill="#8e98d8" />
          <circle cx="66" cy="25" r="5" fill="#8e98d8" />
          <rect
            x="34"
            y="77"
            width="435"
            height="50"
            rx="25"
            fill="#fff"
            stroke="#d6dbef"
          />
          <circle
            cx="61"
            cy="101"
            r="9"
            fill="none"
            stroke="#4553b2"
            strokeWidth="3"
          />
          <path d="M67 107l7 7" stroke="#4553b2" strokeWidth="3" />
          <text x="93" y="107" fontSize="13" fill="#4553b2">
            CONNECT WITH THE RIGHT BUYERS
          </text>
          <path
            d="M39 161h199m-199 23h142m-142 23h172"
            stroke="#d4d9ee"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <rect x="321" y="154" width="37" height="85" rx="7" fill="#e7eccf" />
          <rect x="369" y="127" width="37" height="112" rx="7" fill="#c8d794" />
          <rect x="417" y="170" width="37" height="69" rx="7" fill="#aabd65" />
          <text x="40" y="265" fontSize="11" fill="#4553b2">
            INTENT · CONTENT · MEASUREMENT
          </text>
        </g>
        <rect
          x="284"
          y="61"
          width="245"
          height="63"
          rx="22"
          fill="#363354"
          stroke="#77749b"
        />
        <circle cx="312" cy="93" r="8" fill="#afcc18" />
        <text x="332" y="98" fontSize="12" fill="#fff">
          PURPOSEFUL SEARCH MARKETING
        </text>
      </svg>
    );
  const labels =
    family === "mobile"
      ? ["IDEA", "APP EXPERIENCE", "REVIEW", "RELEASE"]
      : family === "marketing"
        ? ["SEARCH INTENT", "GROWTH PLAN", "MEASURE", "IMPROVE"]
        : family === "cloud"
          ? ["APPLICATION", "CLOUD PLATFORM", "MONITOR", "DELIVER"]
          : family === "ai"
            ? ["DOCUMENTS", "AI WORKFLOW", "HUMAN REVIEW", "CONNECTED SYSTEMS"]
            : ["YOUR IDEA", "DIGITAL SYSTEM", "COLLABORATE", "DELIVER"];
  return (
    <svg
      className="csv-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label={`${family} workflow illustration`}
    >
      <defs>
        <linearGradient id="csvArtGradient" x2="1" y2="1">
          <stop stopColor="#7583ef" />
          <stop offset="1" stopColor="#454fad" />
        </linearGradient>
        <pattern
          id="csvArtDots"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" fill="#fff" opacity=".12" />
        </pattern>
      </defs>
      <rect x="10" y="10" width="600" height="510" rx="42" fill="#ffffff04" />
      <rect
        x="10"
        y="10"
        width="600"
        height="510"
        rx="42"
        fill="url(#csvArtDots)"
      />
      <path
        d="M136 147H300V240M300 240H495V348M300 240V390H165"
        fill="none"
        stroke="#afcc18"
        strokeWidth="3"
        strokeDasharray="7 9"
      />
      <g transform="translate(46 70) rotate(-7 90 75)">
        <rect width="182" height="137" rx="22" fill="#f8f9ff" />
        <rect x="22" y="23" width="38" height="43" rx="7" fill="#e5e8fc" />
        <path d="M31 38h20m-20 8h13" stroke="#4553b2" strokeWidth="3" />
        <path
          d="M78 29h76m-76 14h48M23 87h128m-128 13h84"
          stroke="#d1d6ee"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="23" y="122" fill="#4553b2" fontSize="10" fontWeight="600">
          {labels[0]}
        </text>
      </g>
      <g transform="translate(223 200)">
        <rect
          width="166"
          height="147"
          rx="32"
          fill="url(#csvArtGradient)"
          stroke="#aab4ff"
          strokeWidth="1.5"
        />
        <path
          d="M62 36l-13 23 13 22h27l13-22-13-23z"
          fill="none"
          stroke="#d5e48a"
          strokeWidth="3"
        />
        <circle cx="76" cy="59" r="8" fill="#d5e48a" />
        <text
          x="83"
          y="116"
          textAnchor="middle"
          fill="#fff"
          fontSize="11"
          fontWeight="600"
        >
          {labels[1]}
        </text>
      </g>
      <g transform="translate(406 75) rotate(5 75 60)">
        <rect
          width="161"
          height="125"
          rx="23"
          fill="#363052"
          stroke="#6d638d"
        />
        <circle cx="39" cy="42" r="19" fill="#afcc18" />
        <path
          d="M31 42l6 6 10-12"
          fill="none"
          stroke="#27233e"
          strokeWidth="3"
        />
        <path
          d="M74 35h57m-57 15h37"
          stroke="#a6a0bb"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text x="22" y="99" fill="#e8e4f5" fontSize="10" fontWeight="600">
          {labels[2]}
        </text>
      </g>
      <g transform="translate(398 340)">
        <rect width="175" height="130" rx="24" fill="#eef3d9" />
        <rect x="22" y="23" width="131" height="60" rx="10" fill="#fff" />
        <path
          d="M39 56h23l11-18 19 28 12-15h31"
          fill="none"
          stroke="#7e9b13"
          strokeWidth="3"
        />
        <text x="23" y="109" fill="#44500f" fontSize="10" fontWeight="600">
          {labels[3]}
        </text>
      </g>
      <g transform="translate(62 350) rotate(-3)">
        <rect width="158" height="91" rx="19" fill="#352f51" stroke="#5b5279" />
        <circle cx="30" cy="31" r="5" fill="#afcc18" />
        <path
          d="M47 31h88m-109 21h92m-92 13h62"
          stroke="#9d96b5"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
      <circle cx="321" cy="116" r="13" fill="#afcc18" />
      <path d="M315 116h12m-6-6v12" stroke="#24203b" strokeWidth="2" />
      <circle cx="302" cy="459" r="5" fill="#8e9af0" />
    </svg>
  );
}
function SectionBody({
  s,
  content,
  variant,
  link,
  rich = false,
}: {
  s: Section;
  content: Content;
  variant: string;
  link: (path: string) => string | null;
  rich?: boolean;
}) {
  return (
    <>
      {!!s.paragraphs.length && (
        <div className="csv-prose">
          <RichContent
            content={content}
            field={`sections.${s.id}.paragraphs`}
            text={s.paragraphs.join("\n\n")}
            block
          />
        </div>
      )}
      {!!s.items.length && (
        <ul className={variant === "technology" ? "csv-tech-list" : "csv-list"}>
          {s.items.map((item, i) => (
            <li key={i}>
              {!content.richText?.[`sections.${s.id}.items.${i}`] &&
              rich &&
              variant === "technology" &&
              item.includes(":") ? (
                <>
                  <span className="automation-tech-symbol" aria-hidden="true">
                    {item.split(":")[0].trim().slice(0, 2)}
                  </span>
                  <div>
                    <strong>{item.slice(0, item.indexOf(":"))}</strong>
                    <p>{item.slice(item.indexOf(":") + 1).trim()}</p>
                  </div>
                </>
              ) : (
                <RichContent
                  content={content}
                  field={`sections.${s.id}.items.${i}`}
                  text={item}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {!!s.cards.length && (
        <div className={"csv-cards csv-cards-" + variant}>
          {s.cards.map((card, i) => (
            <article key={i}>
              <span className="csv-card-mark" aria-hidden="true">
                {rich && variant === "process" ? (
                  <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path
                      d={
                        [
                          "M21 21l7 7M23 13a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
                          "M5 5h22v22H5zM5 13h22M13 13v14",
                          "M16 3l13 7v13l-13 7-13-7V10zM3 10l13 7 13-7M16 17v13",
                          "M5 16l7 7L27 7",
                          "M5 25l8-2 13-13-4-4-13 13zM19 3l7 7",
                        ][Math.min(i, 4)]
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  "↗"
                )}
              </span>
              <h4>
                {content.richText?.[`sections.${s.id}.cards.${i}.title`] ? (
                  <RichContent
                    content={content}
                    field={`sections.${s.id}.cards.${i}.title`}
                    text={card.title}
                  />
                ) : variant === "process" ? (
                  card.title.replace(/^\d+[.)]\s*/, "")
                ) : (
                  card.title
                )}
              </h4>
              <RichContent
                content={content}
                field={`sections.${s.id}.cards.${i}.body`}
                text={card.body}
                block
              />
            </article>
          ))}
        </div>
      )}
      {!!s.table.rows.length && (
        <div className="csv-table-scroll">
          <table>
            <thead>
              <tr>
                {s.table.columns.map((c, i) => (
                  <th scope="col" key={i}>
                    <RichContent
                      content={content}
                      field={`sections.${s.id}.table.columns.${i}`}
                      text={c}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <RichContent
                        content={content}
                        field={`sections.${s.id}.table.rows.${i}.${j}`}
                        text={cell}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!!s.faqs.length && (
        <div className="csv-faqs">
          {s.faqs.map((f, i) => (
            <details
              key={i}
              name={rich ? "faq-" + s.id : undefined}
              open={rich && i === 0 ? true : undefined}
            >
              <summary>
                <RichContent
                  content={content}
                  field={`sections.${s.id}.faqs.${i}.question`}
                  text={f.question}
                />
                <span aria-hidden="true">+</span>
              </summary>
              <RichContent
                content={content}
                field={`sections.${s.id}.faqs.${i}.answer`}
                text={f.answer}
                block
              />
            </details>
          ))}
        </div>
      )}
      {!!s.links.length && (
        <div className="csv-links">
          {s.links.map((l, i) => {
            const href = link(l.path);
            return href ? (
              <a key={i} href={href}>
                <RichContent
                  content={content}
                  field={`sections.${s.id}.links.${i}.label`}
                  text={l.label}
                />
                <span aria-hidden="true">↗</span>
              </a>
            ) : null;
          })}
        </div>
      )}
    </>
  );
}
export function StructuredPage({
  content,
  presentation,
  preview = false,
  linkMap = {},
  allowedPaths = [],
  listing = [],
}: {
  content: Content;
  presentation: Presentation;
  preview?: boolean;
  linkMap?: Record<string, string>;
  allowedPaths?: string[];
  listing?: { path: string; title: string; kind: string }[];
}) {
  const sections = content.sections ?? [];
  const core = coreServicePaths.includes(presentation.path);
  const mobile = presentation.family === "mobile";
  const cloud = presentation.family === "cloud";
  const specialist = specialistPaths.includes(presentation.path);
  const hire = presentation.family === "hire";
  const technology = presentation.family === "technology";
  const industry = presentation.family === "industry";
  const solution = solutionPaths.includes(presentation.path) && !specialist;
  const location = presentation.family === "location";
  const marketing = presentation.family === "marketing" && !core;
  const trust = trustPaths.includes(presentation.path);
  const ai =
    presentation.family === "ai" &&
    presentation.path !== "/ai-automation-services";
  const foundation = ["/", "/services", "/contact", "/about"].includes(
    presentation.path,
  );
  const link = (path: string) =>
    preview
      ? (linkMap[path] ?? null)
      : allowedPaths.includes(path)
        ? path
        : null;
  const contact = link(content.hero?.ctaPath ?? "/contact");
  const contactHref = contact
    ? presentation.family === "contact"
      ? "#project-enquiry"
      : ["home", "directory", "company", "work"].includes(presentation.family)
        ? contact
        : contact +
          (contact.includes("?") ? "&" : "?") +
          "service=" +
          encodeURIComponent(content.hero?.heading ?? content.title)
    : null;
  const variant = (id: string) =>
    presentation.sections.find((s) => s.id === id)?.variant ?? "editorial";
  const roots = sections.filter(
    (s) => !presentation.sections.find((p) => p.id === s.id)?.parent,
  );
  const hasContent = (s: Section) =>
    s.paragraphs.length +
      s.items.length +
      s.cards.length +
      s.faqs.length +
      s.table.rows.length +
      s.links.length >
    0;
  const directoryItems = (s: Section) => {
    if (presentation.family === "home" && s.id === "section-1") {
      const order = [
        "/custom-software-development",
        "/mobile-app-development",
        "/web-development",
        "/web-design",
        "/ai-development-services",
        "/seo-services",
        "/google-ads-management",
      ];
      return listing
        .filter((p) => order.includes(p.path))
        .sort((a, b) => order.indexOf(a.path) - order.indexOf(b.path));
    }
    if (presentation.family !== "directory") return [];
    const family = /mobile/i.test(s.heading)
      ? "mobile"
      : /website|web design/i.test(s.heading)
        ? "web"
        : /\bAI\b|machine learning/i.test(s.heading)
          ? "ai"
          : /SEO|paid search/i.test(s.heading)
            ? "marketing"
            : /hire/i.test(s.heading)
              ? "hire"
              : "software";
    return listing.filter((p) => {
      const pFamily = presentationFor(p.path)?.family;
      if (family === "web")
        return (
          pFamily !== "marketing" &&
          /web-(?:design|development|application)|wordpress|ecommerce/.test(
            p.path,
          )
        );
      if (family === "software")
        return (
          ["software", "cloud", "technology", "industry", "location"].includes(
            pFamily ?? "",
          ) &&
          !/web-(?:design|development|application)|wordpress|ecommerce/.test(
            p.path,
          )
        );
      return pFamily === family;
    });
  };
  const pageSections = roots.map((s) => {
    const children = sections.filter(
      (child) =>
        presentation.sections.find((p) => p.id === child.id)?.parent === s.id,
    );
    const style = variant(s.id);
    if (!hasContent(s) && !children.some(hasContent) && !preview) return null;
    return (
      <section
        id={s.id}
        key={s.id}
        className={
          "csv-section csv-section-" +
          style +
          (children.length ? " csv-has-children" : "")
        }
      >
        <div className="csv-wrap">
          <div className="csv-section-heading">
            <span className="csv-section-mark" aria-hidden="true">
              ✦
            </span>
            <h2>
              <RichContent
                content={content}
                field={`sections.${s.id}.heading`}
                text={s.heading}
              />
            </h2>
          </div>
          {!hasContent(s) && !children.length && preview && (
            <p className="csv-draft-note">
              Content for this section is awaiting generation or owner input.
            </p>
          )}
          {presentation.path === "/ai-automation-services" &&
            s.id === "section-1" && (
              <div className="automation-intro-visual" aria-hidden="true">
                <span className="automation-intro-orbit">✦</span>
                <div className="automation-intro-tags">
                  <span>Understand</span>
                  <span>Connect</span>
                  <span>Automate</span>
                </div>
              </div>
            )}
          <SectionBody
            content={content}
            s={s}
            variant={style}
            link={link}
            rich
          />
          {!!directoryItems(s).length && (
            <div className="csv-directory">
              {directoryItems(s).map((item) => {
                const href = link(item.path);
                return href ? (
                  <a
                    key={item.path}
                    href={href}
                    className={
                      /seo|google-ads/i.test(item.path)
                        ? "csv-directory-marketing"
                        : undefined
                    }
                  >
                    <span aria-hidden="true">↗</span>
                    <h3>{item.title}</h3>
                    <small>
                      {/seo|google-ads/i.test(item.path)
                        ? "Grow with us"
                        : "Build with us"}
                    </small>
                  </a>
                ) : null;
              })}
            </div>
          )}
          {!!children.length && (
            <div className="csv-capability-grid">
              {children.map((child, childIndex) => (
                <article
                  className="csv-capability"
                  id={child.id}
                  key={child.id}
                >
                  {presentation.path === "/ai-automation-services" ||
                  core ||
                  trust ||
                  marketing ||
                  location ||
                  solution ||
                  industry ||
                  technology ||
                  hire ||
                  specialist ||
                  cloud ||
                  mobile ||
                  ai ? (
                    <CapabilityArtwork index={childIndex} />
                  ) : (
                    <span className="csv-capability-icon" aria-hidden="true">
                      ◇
                    </span>
                  )}
                  <div className="csv-capability-copy">
                    <h3>
                      <RichContent
                        content={content}
                        field={`sections.${child.id}.heading`}
                        text={child.heading}
                      />
                    </h3>
                    <SectionBody
                      content={content}
                      s={child}
                      variant={variant(child.id)}
                      link={link}
                      rich
                    />
                    {!hasContent(child) && preview && (
                      <p className="csv-draft-note">Content awaiting review.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  });
  return (
    <div
      className={
        "csv-site " + (["software","mobile","ai","cloud","marketing","technology"].includes(presentation.family) ? "csv-service-family " : "") + "csv-family-" +
        presentation.family +
        (foundation ? " csv-foundation" : "") +
        (mobile ? " csv-mobile" : "") +
        (cloud ? " csv-cloud" : "") +
        (hire ? " csv-hire" : "") +
        (solution ? " csv-solution" : "") +
        (location ? " csv-location" : "") +
        (marketing ? " csv-marketing" : "") +
        (trust ? " csv-trust" : "") +
        (industry
          ? " csv-industry csv-industry-" + industryMode(presentation.path)
          : "") +
        (technology
          ? " csv-technology csv-technology-" +
            technologyMode(presentation.path)
          : "") +
        (specialist
          ? " csv-specialist csv-specialist-" +
            specialistMode(presentation.path)
          : "") +
        (ai ? " csv-ai csv-ai-" + aiVisualMode(presentation.path) : "") +
        (core
          ? " csv-core csv-core-" + coreServiceMode(presentation.path)
          : "") +
        (presentation.path === "/ai-automation-services"
          ? " csv-automation"
          : "")
      }
    >
      <section className="csv-hero">
        <div className="csv-wrap csv-hero-grid">
          <div className="csv-hero-copy">
            <span className="csv-eyebrow">
              NETOFFICIALS ·{" "}
              {(
                {
                  home: "BUILD. CONNECT. GROW.",
                  directory: "OUR SERVICES",
                  company: "OUR STUDIO",
                  contact: "LET’S TALK",
                  work: "SELECTED WORK",
                  hire: "DEDICATED DEVELOPERS",
                  location: "GLOBAL DELIVERY",
                } as Record<string, string>
              )[presentation.family] ??
                presentation.family.toUpperCase() + " SERVICES"}
            </span>
            <h1>
              <RichContent
                content={content}
                field="hero.heading"
                text={content.hero?.heading ?? content.title}
              />
            </h1>
            {content.hero?.body && (
              <RichContent
                content={content}
                field="hero.body"
                text={content.hero.body}
                block
              />
            )}
            <div className="csv-hero-actions">
              {contactHref && (
                <a className="csv-button" href={contactHref}>
                  <RichContent
                    content={content}
                    field="hero.ctaLabel"
                    text={content.hero?.ctaLabel || "Discuss your project"}
                  />
                  <span aria-hidden="true">↗</span>
                </a>
              )}
              <a className="csv-text-link" href="#page-content">
                Explore this page <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          {trust ? (
            <TrustArtwork
              careers={presentation.path === "/careers"}
              questions={presentation.path === "/faq"}
            />
          ) : marketing ? (
            <MarketingArtwork
              local={/local-seo/.test(presentation.path)}
              paid={/google-ads/.test(presentation.path)}
            />
          ) : location ? (
            <LocationArtwork />
          ) : solution ? (
            <SolutionArtwork
              advisory={/consulting|outsourcing|offshore|transformation/.test(
                presentation.path,
              )}
            />
          ) : industry ? (
            <IndustryArtwork mode={industryMode(presentation.path)} />
          ) : technology ? (
            <TechnologyArtwork
              heading={content.hero?.heading ?? content.title}
              mode={technologyMode(presentation.path)}
            />
          ) : hire ? (
            <HireArtwork
              team={/team|augmentation|hire-developers$/.test(
                presentation.path,
              )}
            />
          ) : specialist ? (
            <SpecialistArtwork mode={specialistMode(presentation.path)} />
          ) : cloud ? (
            <CloudArtwork
              pipeline={/devops|kubernetes/.test(presentation.path)}
            />
          ) : ai ? (
            <AIArtwork mode={aiVisualMode(presentation.path)} />
          ) : mobile ? (
            <MobileArtwork
              tablet={presentation.path === "/ipad-app-development"}
            />
          ) : core && presentation.family !== "marketing" ? (
            <CoreArtwork mode={coreServiceMode(presentation.path)} />
          ) : presentation.family === "work" ? (
            <WorkArtwork />
          ) : foundation ? (
            <FoundationArtwork family={presentation.family} />
          ) : presentation.path === "/ai-automation-services" ? (
            <AutomationArtwork />
          ) : (
            <WorkflowArtwork family={presentation.family} />
          )}
        </div>
      </section>
      <div className="csv-page-strip">
        <div className="csv-wrap">
          <span>Thoughtful development.</span>
          <span>Purposeful search marketing.</span>
          <a href="#page-content">Built around your next step ↓</a>
        </div>
      </div>
      <div id="page-content">
        {(presentation.family === "directory" ||
          presentation.path === "/faq") && (
          <nav
            className="foundation-jumps csv-wrap"
            aria-label={
              presentation.path === "/faq"
                ? "Question categories"
                : "Service categories"
            }
          >
            {roots.map((s) => (
              <a href={"#" + s.id} key={s.id}>
                {s.heading}
              </a>
            ))}
          </nav>
        )}
        {presentation.family === "work" ? (
          <WorkFilter
            sections={roots.map((s, i) => ({
              id: s.id,
              label: /mobile/i.test(s.heading)
                ? "Mobile"
                : /website/i.test(s.heading)
                  ? "Websites"
                  : /marketing/i.test(s.heading)
                    ? "Search marketing"
                    : "Software",
              node: pageSections[i],
            }))}
          />
        ) : (
          pageSections
        )}
      </div>
      {presentation.family === "contact" ? (
        <section className="csv-enquiry csv-wrap" id="project-enquiry">
          <div>
            <span className="csv-eyebrow">START A CONVERSATION</span>
            <h2>Tell us what you have in mind.</h2>
            <p>A new idea. An existing system. A clearer path to growth.</p>
          </div>
          <LeadForm preview={preview}>
            <label>
              Your name
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              Work email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Service
              <input
                name="service"
                defaultValue="Software development"
                required
                data-service-context="true"
              />
            </label>
            <label>
              Project brief
              <textarea
                name="goal"
                required
                minLength={10}
                placeholder="What would you like to build or improve?"
              />
            </label>
            <label>
              Budget (optional)
              <input name="budget" />
            </label>
            <div className="foundation-form-row">
              <label>
                Country (optional)
                <input name="country" autoComplete="country-name" />
              </label>
              <label>
                Timeline (optional)
                <input
                  name="timeline"
                  placeholder="When would you like to start?"
                />
              </label>
            </div>
            <button className="csv-button" type="submit">
              Discuss your project ↗
            </button>
          </LeadForm>
        </section>
      ) : (
        contactHref && (
          <section className="csv-closing">
            <div className="csv-wrap csv-closing-inner">
              <div>
                <span className="csv-eyebrow">START WHERE YOU ARE</span>
                <h2>
                  A new idea.
                  <br />
                  An existing system.
                  <br />
                  <em>Let’s find your next step.</em>
                </h2>
              </div>
              <div>
                <p>Tell us what you want to build, improve or grow.</p>
                <a className="csv-button" href={contactHref}>
                  <RichContent
                    content={content}
                    field="hero.ctaLabel"
                    text={content.hero?.ctaLabel || "Discuss your project"}
                  />{" "}
                  ↗
                </a>
              </div>
            </div>
          </section>
        )
      )}
    </div>
  );
}
