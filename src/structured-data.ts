import { mediaPath } from "./media-path";
import type { Content, Design, DesignNode } from "./content";
import { breadcrumbs, pillarFor, pillars, sitePage } from "./site-structure";

const plain = (value: string) =>
  value.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&amp;/g, (m) => (m === "&amp;" ? "&" : " ")).replace(/\s+/g, " ").trim();

type Question = { name: string; answer: string };

/** FAQ pairs from whichever content version the page uses. */
export function pageQuestions(content: Content, design?: Design): Question[] {
  const questions: Question[] = [];
  if (content.schemaVersion === 3) {
    for (const s of content.pageSections ?? []) {
      if (s.omitted || !/faq/.test(s.id)) continue;
      for (const key of Object.keys(s.fields).filter((k) => /^(?:q\d+|cat_\d+_q\d+)$/.test(k))) {
        const answer = s.fields[key.replace(/q(\d+)$/, "a$1")];
        if (s.fields[key]?.trim() && answer?.trim()) questions.push({ name: s.fields[key], answer: plain(answer) });
      }
    }
  } else if (content.schemaVersion === 2) {
    for (const s of content.sections ?? []) {
      if (content.hiddenSections?.includes(s.id)) continue;
      for (const faq of s.faqs)
        if (faq.question.trim() && faq.answer.trim()) questions.push({ name: faq.question, answer: plain(faq.answer) });
    }
  } else if (design) {
    const text = (n: DesignNode): string =>
      n.slot ? (content.texts[n.slot] ?? "") : (n.text ?? n.children?.map(text).join("") ?? "");
    const visit = (n: DesignNode) => {
      if (content.hiddenSections?.includes(n.attrs?.["data-section"] ?? "")) return;
      if (n.tag === "details") {
        const summary = n.children?.find((c) => c.tag === "summary"),
          answer = n.children?.filter((c) => c.tag !== "summary");
        if (summary && answer?.length)
          questions.push({ name: text(summary).trim(), answer: answer.map(text).join(" ").trim() });
      } else n.children?.forEach(visit);
    };
    design.nodes.forEach(visit);
  }
  return questions;
}

const serviceTypes = new Set(["pillar", "service", "technology", "industry", "hire", "location"]);

/** Drops undefined, empty strings and empty arrays so no node carries an empty value. */
function prune<T>(value: T): T {
  if (Array.isArray(value)) return value.map(prune).filter((v) => v !== undefined && v !== "") as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      const cleaned = prune(v);
      if (cleaned === undefined || cleaned === "") continue;
      if (Array.isArray(cleaned) && cleaned.length === 0) continue;
      out[key] = cleaned;
    }
    return out as T;
  }
  return value;
}

/** Numbered `<prefix>_N_title` / `<prefix>_N_body` pairs (N=1..6) that have a title. */
function cards(fields: Record<string, string>, prefix: string) {
  const out: { title: string; body: string }[] = [];
  for (let n = 1; n <= 6; n++) {
    const title = plain(fields[`${prefix}_${n}_title`] ?? "");
    if (title) out.push({ title, body: plain(fields[`${prefix}_${n}_body`] ?? "") });
  }
  return out;
}

/** A non-omitted page section, looked up by id. */
const liveSection = (content: Content, id: string) =>
  content.pageSections?.find((s) => s.id === id && !s.omitted);

export function pageGraph(input: {
  path: string;
  kind?: string;
  content: Content;
  site: string;
  /** The guides listed on the /blog index. */
  listing?: { path: string; title: string }[];
  published?: string | Date | null;
  modified?: string | Date | null;
  design?: Design;
}) {
  const { path, content } = input;
  const base = input.site.replace(/\/$/, "");
  const url = base + path;
  // The About page may state a founding year and home city, but only when the generated value is backed by an approved fact
  // (constrainEvidence blanks anything unsupported), so an empty field means nothing is claimed.
  const glance = path === "/about" ? liveSection(content, "company-glance")?.fields : undefined;
  const foundedYear = /^\d{4}$/.test((glance?.founded_year ?? "").trim()) ? glance!.founded_year.trim() : "";
  const baseCity = plain(glance?.base_city ?? "");
  const organization = {
    "@type": "Organization",
    "@id": base + "/#organization",
    name: "Netofficials",
    url: base,
    logo: base + "/assets/logo.png",
    address: { "@type": "PostalAddress", addressCountry: "IN", ...(baseCity ? { addressLocality: baseCity } : {}) },
    ...(foundedYear ? { foundingDate: foundedYear } : {}),
    knowsAbout: pillars.map((p) => p.label),
    ...(process.env.SITE_SAME_AS
      ? { sameAs: process.env.SITE_SAME_AS.split(",").map((s) => s.trim()).filter(Boolean) }
      : {}),
  };
  const type = sitePage(path)?.type;
  const isArticle = input.kind === "article" || type === "guide" || path.startsWith("/blog/");
  const isService = !isArticle && (input.kind === "service" || (type ? serviceTypes.has(type) : false));
  const hero = content.pageSections?.find((s) => s.id === "hero");
  const image = content.pageSections?.find((s) => s.asset)?.asset;
  const websiteId = base + "/#website";
  const title = plain(hero?.fields.h1 || content.title);
  const serviceName = plain(content.seo?.serviceType ?? "");
  const main: Record<string, unknown> = {
    "@type": isArticle ? "Article" : isService ? "Service" : path === "/about" ? "AboutPage" : path === "/contact" ? "ContactPage" : "WebPage",
    "@id": url + "#content",
    url,
    name: content.seo?.metaTitle || content.title,
    description: content.seo?.metaDescription || content.description,
    inLanguage: "en",
    isPartOf: { "@id": websiteId },
    ...(input.published ? { datePublished: input.published } : {}),
    ...(input.modified ? { dateModified: input.modified } : {}),
    ...(image
      ? {
          image: {
            "@type": "ImageObject",
            contentUrl: base + mediaPath(image),
            url: base + mediaPath(image),
            width: image.width,
            height: image.height,
            caption: image.caption || image.alt,
            description: image.alt,
            encodingFormat: "image/webp",
            creator: { "@id": base + "/#organization" },
            creditText: "Netofficials",
            copyrightHolder: { "@id": base + "/#organization" },
          },
        }
      : {}),
    ...(content.seo?.primaryKeyword
      ? { keywords: [content.seo.primaryKeyword, ...content.seo.secondaryKeywords].join(", ") }
      : {}),
  };
  const servicesGrid = liveSection(content, "services-grid");
  const whatWeDeliver = liveSection(content, "what-we-deliver");
  const processSection = liveSection(content, "process");
  const overview = liveSection(content, "service-overview");
  const faq = liveSection(content, "faq");
  if (isService) {
    main.provider = { "@id": organization["@id"] };
    main.serviceType = serviceName || sitePage(path)?.label || content.title;
    main.areaServed = ["United States", "United Kingdom", "Australia", "Canada"];
    const pillar = pillarFor(path);
    if (pillar) main.category = pillar.label;
    const audience = plain(content.seo?.audience ?? "");
    if (audience) main.audience = { "@type": "Audience", audienceType: audience };
    const about = (content.seo?.schemaAbout ?? [])
      .map((a) => ({ "@type": "Thing", name: plain(a.name), ...(a.sameAs?.trim() ? { sameAs: a.sameAs.trim() } : {}) }))
      .filter((a) => a.name);
    if (about.length) main.about = about;
    if (!servicesGrid && whatWeDeliver) {
      const offers = cards(whatWeDeliver.fields, "card").map((card) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: card.title, description: card.body },
      }));
      if (offers.length)
        main.hasOfferCatalog = {
          "@type": "OfferCatalog",
          name: serviceName || title,
          itemListElement: offers,
        };
    }
  }
  if (isArticle) {
    main.headline = (hero?.fields.h1 || content.title).slice(0, 110);
    main.author = content.author ? { "@type": "Person", name: content.author } : { "@id": organization["@id"] };
    main.publisher = { "@id": organization["@id"] };
    if (content.seo?.entities.length) main.about = content.seo.entities.slice(0, 8).map((name) => ({ "@type": "Thing", name }));
  }
  if (path === "/about" || path === "/contact") main.mainEntity = { "@id": organization["@id"] };
  // Guides index: a CollectionPage whose ItemList is the guides the page actually lists.
  if (path === "/blog") {
    main["@type"] = "CollectionPage";
    if (input.listing?.length)
      main.mainEntity = {
        "@type": "ItemList",
        name: "Netofficials guides",
        itemListElement: input.listing.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: base + g.path, name: g.title })),
      };
  }
  // Why Choose: the reasons as an ItemList, so the claims are machine-readable and tied to the page.
  const reasonsSec = path === "/why-choose-netofficials" ? liveSection(content, "reasons") : undefined;
  if (reasonsSec) {
    const list = [1, 2, 3, 4, 5, 6]
      .map((n) => ({ name: plain(reasonsSec.fields[`reason_${n}_title`] ?? ""), description: plain(reasonsSec.fields[`reason_${n}_body`] ?? "") }))
      .filter((r) => r.name)
      .map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.name, ...(r.description ? { description: r.description } : {}) }));
    if (list.length) main.mainEntity = { "@type": "ItemList", name: "Reasons to choose Netofficials", itemListElement: list };
  }
  // How We Work: the five stages as a HowTo, the format answer engines quote for a process.
  const stages = path === "/how-we-work" ? liveSection(content, "stages") : undefined;
  if (stages) {
    const steps = [1, 2, 3, 4, 5]
      .map((n) => ({ name: plain(stages.fields[`stage_${n}_title`] ?? ""), text: plain(stages.fields[`stage_${n}_body`] ?? "") }))
      .filter((st) => st.name && st.text)
      .map((st, i) => ({ "@type": "HowToStep", position: i + 1, name: st.name, text: st.text }));
    if (steps.length) main.mainEntity = { "@type": "HowTo", name: "How a Netofficials software project runs", step: steps };
  }
  // Engagement Models: the three models as an ItemList, so the comparison is machine-readable.
  const models = path === "/engagement-models" ? liveSection(content, "models-comparison") : undefined;
  if (models) {
    const list = [1, 2, 3]
      .map((n) => ({ name: plain(models.fields[`model_${n}_name`] ?? ""), description: plain(models.fields[`model_${n}_body`] ?? "") }))
      .filter((m) => m.name)
      .map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.name, ...(m.description ? { description: m.description } : {}) }));
    if (list.length) main.mainEntity = { "@type": "ItemList", name: "Software development engagement models", itemListElement: list };
  }
  const speakable = [
    ...(overview ? ["#service-overview"] : []),
    ...(faq ? ["#faq"] : []),
  ];
  if (speakable.length) main.speakable = { "@type": "SpeakableSpecification", cssSelector: speakable };

  // Hub pages: list the child services they link to.
  let childList: Record<string, unknown> | undefined;
  if (servicesGrid) {
    const items: Record<string, unknown>[] = [];
    for (let n = 1; n <= 12; n++) {
      const name = plain(servicesGrid.fields[`svc_${n}_title`] ?? "");
      if (!name) continue;
      const svcUrl = (servicesGrid.fields[`svc_${n}_url`] ?? "").trim();
      items.push({ "@type": "ListItem", position: items.length + 1, name, ...(svcUrl ? { item: base + svcUrl } : {}) });
    }
    if (items.length) {
      childList = {
        "@type": "ItemList",
        "@id": url + "#child-services",
        name: `${title} child services`,
        itemListElement: items,
      };
      main.hasPart = { "@id": url + "#child-services" };
    }
  }

  const trail = breadcrumbs(path, hero?.fields.h1 || content.title);
  const graph: Record<string, unknown>[] = [
    organization,
    main,
    {
      "@type": "BreadcrumbList",
      itemListElement: trail.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.label,
        item: base + (crumb.path === "/" ? "" : crumb.path),
      })),
    },
  ];
  if (childList) graph.push(childList);

  // HowTo for service-style pages with a process section of at least three titled steps.
  if (!isArticle && processSection) {
    const steps = cards(processSection.fields, "step");
    if (steps.length >= 3) {
      const subject = serviceName || plain(content.title.split(/\s+\|\s+/)[0] ?? "");
      graph.push({
        "@type": "HowTo",
        "@id": url + "#how-it-works",
        name: `How ${subject} projects run`,
        step: steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: step.title,
          text: step.body,
        })),
      });
    }
  }

  const questions = pageQuestions(content, input.design);
  if (questions.length)
    graph.push({
      "@type": "FAQPage",
      mainEntity: questions.map((q) => ({
        "@type": "Question",
        name: q.name,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    });
  // Appended last so existing node positions (organization, main, breadcrumbs, FAQ) are unchanged.
  graph.push({
    "@type": "WebSite",
    "@id": websiteId,
    name: "Netofficials",
    url: base,
    inLanguage: "en",
    publisher: { "@id": organization["@id"] },
  });
  return { "@context": "https://schema.org", "@graph": prune(graph) };
}

/** Legacy signature used by v1/v2 pages. */
export function structuredData(
  page: {
    path: string;
    kind: string;
    content: Content;
    created_at: string | Date;
    first_published_at: string | Date;
  },
  design: Design,
  site: string,
) {
  return pageGraph({
    path: page.path,
    kind: page.kind,
    content: page.content,
    site,
    published: page.first_published_at,
    modified: page.created_at,
    design,
  });
}
