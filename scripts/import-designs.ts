import fs from "node:fs";
import path from "node:path";
import { load } from "cheerio";
import { parse } from "csv-parse/sync";
const root = process.cwd();
const files: string[] = JSON.parse(
  fs.readFileSync("homepage-concept/design-pages.json", "utf8"),
);
const inventory = parse(
  fs.readFileSync(
    "research docs/revised-seo-plan/page-and-content-plan.csv",
    "utf8",
  ),
  { columns: true, bom: true },
);
const lookup = new Map<string, any>(
  inventory.map((r: any) => [
    (r.url === "/" ? "software-led" : r.url.slice(1).replaceAll("/", "-")) +
      ".html",
    r,
  ]),
);
const aliases: Record<string, string> = {
  "software-led.html": "/",
  "custom-software.html": "/custom-software-development",
  "website-development.html": "/web-development",
  "mobile-development.html": "/mobile-application-development",
  "web-application.html": "/web-application-development",
  "case-study-detail.html": "/case-studies/example",
  "thank-you.html": "/thank-you",
  "404.html": "/404",
  "form-states.html": "/form-states",
  "design-library.html": "/design-library",
};
const routes = Object.fromEntries(
  files.map((f) => [
    f,
    aliases[f] ??
      lookup.get(f)?.url ??
      "/" + f.replace(".html", "").replace(/^blog-/, "blog/"),
  ]),
);
const designs: any[] = [];
const previousDesigns = JSON.parse(
  fs.readFileSync("src/templates/designs.json", "utf8"),
);
for (const file of files) {
  const $ = load(fs.readFileSync(path.join("homepage-concept", file), "utf8"));
  const record =
    lookup.get(file) || inventory.find((r: any) => r.url === routes[file]);
  const kind = ["design-library.html", "form-states.html"].includes(file)
    ? "support"
    : routes[file].startsWith("/blog/")
      ? "article"
      : /software|development|design|seo-services|ppc-services|technical-seo|local-seo/.test(
            routes[file],
          ) && routes[file] !== "/"
        ? "service"
        : "manual";
  const texts: Record<string, string> = {};
  const previousTexts: Record<string, string> =
    file === "software-led.html"
      ? (previousDesigns.find((d: any) => d.id === "software-led")?.texts ?? {})
      : {};
  const usedSlots = new Set<string>();
  const explicitSlots = new Set(
    $("[data-copy-slot]")
      .toArray()
      .map((el) => $(el).attr("data-copy-slot")),
  );
  let count = 0;
  function node(n: any): any {
    if (n.type === "text") {
      if (!n.data.trim()) return { text: n.data };
      let slot: string;
      if (file === "software-led.html") {
        const explicit = n.parent?.attribs?.["data-copy-slot"];
        const matched = Object.keys(previousTexts).find(
          (k) =>
            previousTexts[k] === n.data &&
            !usedSlots.has(k) &&
            !explicitSlots.has(k),
        );
        slot = explicit ?? matched ?? "home-" + count++;
        while (
          !explicit &&
          !matched &&
          (usedSlots.has(slot) || slot in previousTexts)
        )
          slot = "home-" + count++;
      } else slot = "t" + count++;
      usedSlots.add(slot);
      texts[slot] = n.data;
      return { slot };
    }
    if (n.type !== "tag") return null;
    if (["script", "style", "header", "footer"].includes(n.name)) return null;
    const attrs = { ...n.attribs };
    for (const key of Object.keys(attrs))
      if (key.startsWith("on")) delete attrs[key];
    if (attrs.src && !attrs.src.startsWith("http") && !attrs.src.startsWith("/"))
      attrs.src = "/assets/" + attrs.src;
    if (
      attrs.href &&
      !attrs.href.startsWith("#") &&
      !attrs.href.startsWith("/") &&
      !attrs.href.startsWith("http")
    ) {
      const [f, anchor] = attrs.href.split("#");
      attrs.href = (routes[f] ?? "/") + (anchor ? "#" + anchor : "");
    }
    return {
      tag: n.name,
      attrs,
      children: (n.children || []).map(node).filter(Boolean),
    };
  }
  $("select[name=service]").each((_, select) => {
    const el = $(select);
    if (
      !el
        .find("option")
        .toArray()
        .some((x) => $(x).text().trim() === "Custom software")
    ) {
      el.contents()
        .filter(
          (_, n) => n.type === "text" && n.data.trim() === "Custom software",
        )
        .remove();
      el.find("option").first().after("<option>Custom software</option>");
    }
  });
  const main = $("main").first();
  const nodes = main.contents().toArray().map(node).filter(Boolean);
  const sectionNodes: any[] = [];
  const collectSections = (n: any) => {
    if (n.tag === "section") sectionNodes.push(n);
    else if (file === "software-led.html") n.children?.forEach(collectSections);
  };
  nodes.forEach(collectSections);
  let sectionIndex = 0;
  for (const n of sectionNodes) {
    if (n.tag === "section") {
      n.attrs ??= {};
      n.attrs["data-section"] =
        n.attrs["data-section"] ?? n.attrs.id ?? "section-" + sectionIndex++;
    }
  }
  const styles = $("link[rel=stylesheet]")
    .toArray()
    .map((n) => "/assets/" + $(n).attr("href"));
  const formFields: string[] = [];
  const preserveForm = (n: any, inForm = false) => {
    const locked = inForm || n.tag === "form";
    if (locked && n.slot) formFields.push(n.slot);
    n.children?.forEach((child: any) => preserveForm(child, locked));
  };
  nodes.forEach((n) => preserveForm(n));
  designs.push({
    id: file.replace(".html", ""),
    path: routes[file],
    kind,
    title: record?.proposed_title ?? $("title").text().split("|")[0].trim(),
    styles,
    nodes,
    texts,
    protectedFields: [
      ...new Set([
        ...formFields,
        ...Object.keys(texts).filter((k) =>
          /India-based|Global outlook|International outlook|US\$/.test(
            texts[k],
          ),
        ),
      ]),
    ],
    sections: sectionNodes
      .filter((n: any) => n.tag === "section")
      .map((n: any, i: number) => {
        const fields: string[] = [];
        const visit = (x: any) => {
          if (x.slot) fields.push(x.slot);
          x.children?.forEach(visit);
        };
        visit(n);
        const hasForm = (x: any): boolean =>
          x.tag === "form" || (x.children ?? []).some(hasForm);
        return {
          id: n.attrs["data-section"],
          required: i === 0 || hasForm(n),
          label: fields
            .slice(0, 3)
            .map((k) => texts[k])
            .join(" "),
          fields,
        };
      }),
    gate:
      record?.publish_gate ??
      "Verify company facts and remove all placeholders before publication.",
    brief: record ?? {},
  });
}
fs.writeFileSync(
  "src/templates/designs.json",
  JSON.stringify(designs, null, 2),
);
console.log(
  "Imported " +
    designs.length +
    " approved layouts into React-safe template data",
);
