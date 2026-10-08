import fs from "node:fs";
import { readSitePlan } from "../src/site-plan";
const entries = readSitePlan().entries;
const registry = Object.fromEntries(
  entries.map((e) => {
    const file = e.provenance[0].file;
    const family =
      e.url === "/"
        ? "home"
        : /^\/(?:seo|ppc|sem|technical-seo|local-seo|ecommerce-seo|google-ads)/.test(
              e.url,
            )
          ? "marketing"
          : e.url === "/contact"
            ? "contact"
            : /portfolio|case-studies/.test(e.url)
              ? "work"
              : e.url === "/services"
                ? "directory"
                : /Foundation|Engagement_Trust/.test(file)
                  ? "company"
                  : /Mobile/.test(file)
                    ? "mobile"
                    : /AI_Machine/.test(file)
                      ? "ai"
                      : /Cloud/.test(file)
                        ? "cloud"
                        : /Hire/.test(file)
                          ? "hire"
                          : /Tech_Stack/.test(file)
                            ? "technology"
                            : /Industry/.test(file)
                              ? "industry"
                              : /Location/.test(file)
                                ? "location"
                                : /SEO_Paid/.test(file)
                                  ? "marketing"
                                  : "software";
    let parent: string | null = null;
    const sections = e.headings.map((h) => {
      const variant = /frequently asked|\bfaq\b/i.test(h.heading)
        ? "faq"
        : /\bvs\b|versus|comparison/i.test(h.heading)
          ? "comparison"
          : /process|approach|how we|steps|lifecycle/i.test(h.heading)
            ? "process"
            : /technolog|stack|tools|framework/i.test(h.heading)
              ? "technology"
              : /recent work|projects|case stud|team/i.test(h.heading)
                ? "evidence"
                : /services|solutions|what we|capabilit|features|benefits/i.test(
                      h.heading,
                    )
                  ? "capabilities"
                  : "editorial";
      const result = {
        id: h.id,
        variant,
        parent: h.level === 3 ? parent : null,
      };
      if (h.level === 2) parent = h.id;
      return result;
    });
    return [e.url, { path: e.url, family, ready: true, sections }];
  }),
);
fs.writeFileSync(
  "src/templates/presentations.json",
  JSON.stringify(registry, null, 2) + "\n",
);
console.log(
  `${entries.length} page presentations mapped without content or research inputs.`,
);
