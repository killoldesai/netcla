/** Facts about the company supplied by its owner, used for structured data and the author page. Add new profile URLs to `profiles`. */
export const company = {
  foundingYear: "2011",
  founder: {
    name: "Killol Desai",
    jobTitle: "Founder",
    path: "/about/killol-desai",
    knowsAbout: ["Search engine optimization", "Management"],
    sameAs: ["https://www.linkedin.com/in/killoldesai"],
    summary: "Founder of Netofficials, a software development company in India, and an SEO specialist.",
    /** Shown on the author page. Only add statements that can be backed up. */
    bio: [
      "Killol Desai founded Netofficials in 2011. Netofficials is a software development company in India that builds custom software, web and mobile applications, AI systems and cloud infrastructure for businesses in the US, UK, Australia and beyond.",
      "Killol is an SEO specialist and has strong management skills. He is the named author of the Netofficials guides on software development, project cost and planning, and search marketing.",
    ],
  },
  profiles: ["https://www.linkedin.com/company/netofficials/"],
};

/** Company profile URLs plus any extra ones from SITE_SAME_AS. */
export function companyProfiles(extra = process.env.SITE_SAME_AS) {
  const more = (extra ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return [...new Set([...company.profiles, ...more])];
}

/** The founder's public profile on LinkedIn. */
export const founderProfile = company.founder.sameAs[0];

/** The author page on this site, which every guide byline links to. */
export const founderPage = company.founder.path;
