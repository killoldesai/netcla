import { getDesign } from "./designs";
import { DesignPage, Navigation, Footer } from "./render";
export function SupportPage({
  id,
  linkMap = {},
}: {
  id: string;
  linkMap?: Record<string, string>;
}) {
  const d = getDesign(id);
  return (
    <>
      {d.styles.map((s) => (
        <link rel="stylesheet" href={s} key={s} />
      ))}
      <Navigation paths={[]} preview linkMap={linkMap} />
      <main id="main">
        <DesignPage
          design={d}
          content={{
            title: d.title,
            description: "Private design support screen",
            texts: d.texts,
            hiddenSections: [],
            sources: [],
            claims: [],
            unresolved: [],
          }}
          preview
          linkMap={linkMap}
        />
      </main>
      <Footer paths={[]} preview linkMap={linkMap} />
    </>
  );
}
