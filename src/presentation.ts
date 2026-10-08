import registry from "./templates/presentations.json";
export type Presentation = {
  path: string;
  family: string;
  ready: boolean;
  sections: { id: string; variant: string; parent: string | null }[];
};
export function presentationFor(path: string): Presentation | undefined {
  return (registry as Record<string, Presentation>)[path];
}
export function designReady(page: {
  path: string;
  template: string;
  content?: { schemaVersion?: number };
}) {
  return page.content?.schemaVersion === 2 || page.template === "site-plan"
    ? !!presentationFor(page.path)?.ready
    : page.template !== "site-plan";
}
