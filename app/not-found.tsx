import { getDesign } from "@/designs";
import { DesignPage, Navigation, Footer } from "@/render";
export default function NotFound() {
  const d = getDesign("404");
  return (
    <>
      {d.styles.map((s) => (
        <link rel="stylesheet" href={s} key={s} />
      ))}
      <Navigation paths={["/"]} />
      <main id="main">
        <DesignPage
          design={d}
          content={{
            title: "Page not found",
            description: "The requested page is unavailable.",
            texts: d.texts,
            hiddenSections: [],
            sources: [],
            claims: [],
            unresolved: [],
          }}
          allowedPaths={["/"]}
        />
      </main>
      <Footer paths={["/"]} />
    </>
  );
}
