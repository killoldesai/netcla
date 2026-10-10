import designs from "./templates/designs.json";
import type { Design } from "./content";
import { homeDesign } from "./home/copy";
export const screenDesigns = designs as unknown as (Design & {
  brief: Record<string, string>;
})[];
export const allDesigns = screenDesigns.filter((d) => d.kind !== "support");
/** The imported design exactly as stored, without the homepage copy overrides (its enquiry form markup lives here). */
export function getDesignSource(id: string) {
  const d = screenDesigns.find((d) => d.id === id);
  if (!d) throw new Error("Unknown template");
  return d;
}
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
  // The homepage copy and editable sections live in src/home/copy.ts.
  return id === "software-led" ? homeDesign(d) : d;
}
export const pagePath = (slug: string[] | undefined) =>
  "/" + (slug ?? []).join("/");
