import type { Design, DesignNode } from "./content";
export function blockTextFields(design: Design): string[] {
  const fields: string[] = [];
  const visit = (n: DesignNode) => {
    if (
      ["p", "div"].includes(n.tag ?? "") &&
      n.children?.length === 1 &&
      n.children[0].slot
    )
      fields.push(n.children[0].slot);
    n.children?.forEach(visit);
  };
  design.nodes.forEach(visit);
  return fields;
}
