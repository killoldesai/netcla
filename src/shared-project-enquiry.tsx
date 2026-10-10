import { getDesignSource } from "./designs";
import { DesignPage } from "./render";
import type { DesignNode } from "./content";

// Render the same imported enquiry template used by the homepage.
export function SharedProjectEnquiry({
  service,
  preview = false,
}: {
  service: string;
  preview?: boolean;
}) {
  const home = getDesignSource("software-led");
  const find = (nodes: DesignNode[]): DesignNode | undefined => {
    for (const node of nodes) {
      if (node.attrs?.id === "contact") return node;
      const child = find(node.children ?? []);
      if (child) return child;
    }
  };
  const source = find(home.nodes);
  if (!source) return null;
  const prepare = (node: DesignNode): DesignNode => {
    if (node.tag === "select" && node.attrs?.name === "service")
      return {
        ...node,
        attrs: { ...node.attrs, "data-service-context": "true" },
        children: [
          {
            tag: "option",
            attrs: { selected: "", value: service },
            children: [{ text: service }],
          },
          ...(node.children ?? []).map((c) => {
            const attrs = { ...c.attrs };
            delete attrs.selected;
            return { ...c, attrs };
          }),
        ],
      };
    return { ...node, children: node.children?.map(prepare) };
  };
  const design = { ...home, nodes: [prepare(source)] };
  return (
    <div className="stripe-home shared-project-enquiry">
      <DesignPage
        design={design}
        content={{
          title: home.title,
          description: "Project enquiry",
          texts: home.texts,
          sources: [],
          claims: [],
          hiddenSections: [],
          unresolved: [],
        }}
        preview={preview}
      />
    </div>
  );
}
