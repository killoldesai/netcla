import { mediaPath } from "./media-path";
import type { Content, Design, DesignNode } from "./content";
import { breadcrumbs, pillarFor, sitePage } from "./site-structure";

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

export function pageGraph(input: {
  path: string;
  kind?: string;
  content: Content;
  site: string;
  published?: string | Date | null;
  modified?: string | Date | null;
  design?: Design;
}) {
  const { path, content } = input;
  const base = input.site.replace(/\/$/, "");
  const url = base + path;
  const organization = {
    "@type": "Organization",
    "@id": base + "/#organization",
    name: "Netofficials",
    url: base,
    logo: base + "/assets/logo.png",
    address: { "@type": "PostalAddress", addressCountry: "IN" },
    ...(process.env.SITE_SAME_AS
      ? { sameAs: process.env.SITE_SAME_AS.split(",").map((s) => s.trim()).filter(Boolean) }
      : {}),
  };
  const type = sitePage(path)?.type;
  const isArticle = input.kind === "article" || type === "guide" || path.startsWith("/blog/");
  const isService = !isArticle && (input.kind === "service" || (type ? serviceTypes.has(type) : false));
  const hero = content.pageSections?.find((s) => s.id === "hero");
  const image = content.pageSections?.find((s) => s.asset)?.asset;
  const main: Record<string, unknown> = {
    "@type": isArticle ? "Article" : isService ? "Service" : "WebPage",
    "@id": url + "#content",
    url,
    name: content.seo?.metaTitle || content.title,
    description: content.seo?.metaDescription || content.description,
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
  if (isService) {
    main.provider = { "@id": organization["@id"] };
    main.serviceType = sitePage(path)?.label ?? content.title;
    main.areaServed = ["United States", "United Kingdom", "Australia", "Canada"];
    const pillar = pillarFor(path);
    if (pillar) main.category = pillar.label;
  }
  if (isArticle) {
    main.headline = (hero?.fields.h1 || content.title).slice(0, 110);
    if (input.published) main.datePublished = input.published;
    if (input.modified) main.dateModified = input.modified;
    main.author = content.author ? { "@type": "Person", name: content.author } : { "@id": organization["@id"] };
    main.publisher = { "@id": organization["@id"] };
    if (content.seo?.entities.length) main.about = content.seo.entities.slice(0, 8).map((name) => ({ "@type": "Thing", name }));
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
  return { "@context": "https://schema.org", "@graph": graph };
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
