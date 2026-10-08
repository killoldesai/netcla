import designs from "./templates/designs.json";
import type { Design } from "./content";
export const screenDesigns = designs as unknown as (Design & {
  brief: Record<string, string>;
})[];
export const allDesigns = screenDesigns.filter((d) => d.kind !== "support");
export function getDesign(id: string) {
  if (id === "site-plan")
    return {
      id,
      path: "",
      title: "Site Plan content preview",
      kind: "service",
      styles: ["/assets/complete.css"],
      nodes: [],
      texts: {},
      gate: "Completed final template and reviewed factual evidence required",
      sections: [],
    } as Design;
  const d = screenDesigns.find((d) => d.id === id);
  if (!d) throw new Error("Unknown template");
  return d;
}
export const pagePath = (slug: string[] | undefined) =>
  "/" + (slug ?? []).join("/");
