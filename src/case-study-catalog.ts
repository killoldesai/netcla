import { buildServices, marketingServices } from "./service-directory-data";
import { sitePage } from "./site-structure";

// The services a case study can be tagged with, each tied to the page that describes it. Picking one in the
// generator is what links the study to that service page, and that page back to the study.

export type ServiceOption = { name: string; path: string; group: string };

const names = new Set<string>();
const paths = new Set<string>();
export const serviceCatalog: ServiceOption[] = [];
const add = (name: string, path: string, group: string) => {
  // Anchors (#hub-services) are not pages; repeated names or pages are listed once.
  if (path.includes("#") || names.has(name) || paths.has(path)) return;
  names.add(name);
  paths.add(path);
  serviceCatalog.push({ name, path, group });
};
for (const s of buildServices) add(s.name, s.path, s.name);
for (const s of buildServices) for (const l of s.links) add(sitePage(l.path)?.label ?? l.name, l.path, s.name);
for (const m of marketingServices) add(m.name, m.path, "Marketing");

export const servicePathByName: Record<string, string> = Object.fromEntries(serviceCatalog.map((s) => [s.name, s.path]));

/** Options grouped under their parent service, parent first, for the picker. */
export const serviceGroups = [...new Set(serviceCatalog.map((s) => s.group))].map((group) => ({
  group,
  items: serviceCatalog.filter((s) => s.group === group).map((s) => s.name),
}));
