import type { Content, Design, DesignNode } from "./content";
import { normalizeRichContent, sanitizeRichHTML } from "./rich-text";
// Only visible, published fields cross the server/client boundary.
export function publicContent(
  design: Design,
  content: Content,
  allowedPaths: string[] = [],
) {
  const fields = new Set<string>();
  const prune = (n: DesignNode): DesignNode | null => {
    if (
      n.tag === "a" &&
      n.attrs?.["data-published-link"] &&
      !allowedPaths.includes((n.attrs.href ?? "").split("#")[0])
    ) {
      if (n.attrs?.["data-enquiry-fallback"] === "true") {
        const { "data-published-link": _published, ...attrs } = n.attrs;
        n = {
          ...n,
          attrs: {
            ...attrs,
            href: allowedPaths.includes("/hire-developers")
              ? "/hire-developers"
              : "#contact",
            title: "Discuss this developer role and project requirements",
          },
        };
      } else if (n.attrs?.["data-unpublished-text"] === "true")
        n = { ...n, tag: "span", attrs: { class: "planned-topic" } };
      else return null;
    }
    if (["article-grid", "proof-grid"].includes(n.attrs?.class ?? ""))
      return { ...n, children: [] };
    if (
      n.tag === "a" &&
      ["directory-card", "article-card", "proof-card"].includes(
        n.attrs?.class ?? "",
      ) &&
      !allowedPaths.includes((n.attrs?.href ?? "").split("#")[0])
    )
      return null;
    if (n.attrs?.class?.split(" ").includes("draft-banner")) return null;
    if (content.hiddenSections?.includes(n.attrs?.["data-section"] ?? ""))
      return null;
    if (n.slot) fields.add(n.slot);
    return {
      ...n,
      ...(n.children
        ? {
            children: n.children.map(prune).filter((x): x is DesignNode => !!x),
          }
        : {}),
    };
  };
  const nodes = design.nodes.map(prune).filter((x): x is DesignNode => !!x);
  const safeDesign: Design = {
    id: design.id,
    path: design.path,
    kind: design.kind,
    title: content.title,
    styles: design.styles,
    nodes,
    texts: {},
    gate: "",
  };
  return {
    design: safeDesign,
    content: normalizeRichContent({
      ...content,
      ...(content.schemaVersion === 2
        ? {
            sections: content.sections
              ?.filter((s) => !content.hiddenSections?.includes(s.id))
              .map((s) => ({
                ...s,
                links: s.links.filter((l) => allowedPaths.includes(l.path)),
              })),
          }
        : {}),
      texts: Object.fromEntries(
        Object.entries(content.texts).filter(([k]) => fields.has(k)),
      ),
      claims: [],
      unresolved: [],
      ...(content.richText
        ? {
            richText: Object.fromEntries(
              Object.entries(content.richText).map(([key, entry]) => [
                key,
                {
                  ...entry,
                  html: sanitizeRichHTML(entry.html, false, allowedPaths),
                },
              ]),
            ),
          }
        : {}),
    }),
  };
}
