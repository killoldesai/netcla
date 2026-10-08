import { presentationFor } from "./presentation";
import { solutionPaths } from "./solution-services";
import { specialistPaths } from "./specialist-services";
const names: Record<string, string> = {
  "/": "Home",
  "/services": "All services",
  "/about": "About us",
  "/contact": "Contact",
  "/portfolio": "Portfolio",
  "/case-studies": "Case studies",
  "/blog": "Insights",
  "/how-we-work": "How we work",
  "/engagement-models": "Engagement models",
  "/why-choose-netofficials": "Why Netofficials",
  "/faq": "FAQs",
  "/careers": "Careers",
  "/custom-software-development": "Custom software",
  "/software-development-outsourcing": "Software outsourcing",
  "/web-application-development": "Web applications",
  "/web-development": "Website development",
  "/web-design": "Website design",
  "/ui-ux-design": "UI/UX design",
  "/ecommerce-development": "eCommerce development",
  "/website-redesign": "Website redesign",
  "/mobile-app-development": "Mobile apps",
  "/ai-development-services": "AI development",
  "/cloud-services": "Cloud services",
  "/hire-developers": "All developer roles",
  "/dedicated-development-team": "Dedicated teams",
  "/it-staff-augmentation": "Staff augmentation",
};
const words: Record<string, string> = {
  ai: "AI",
  ml: "ML",
  ui: "UI",
  ux: "UX",
  ios: "iOS",
  iphone: "iPhone",
  ipad: "iPad",
  nodejs: "Node.js",
  vuejs: "Vue.js",
  nextjs: "Next.js",
  react: "React",
  dotnet: ".NET",
  php: "PHP",
  aws: "AWS",
  gcp: "Google Cloud",
  usa: "USA",
  uk: "UK",
  seo: "SEO",
  ppc: "PPC",
  saas: "SaaS",
  mvp: "MVP",
  erp: "ERP",
  crm: "CRM",
  api: "API",
  iot: "IoT",
  ar: "AR",
  vr: "VR",
  llm: "LLM",
  nlp: "NLP",
  mlops: "MLOps",
  graphql: "GraphQL",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
  typescript: "TypeScript",
  woocommerce: "WooCommerce",
  wordpress: "WordPress",
  golang: "Go",
  edtech: "EdTech",
  fintech: "FinTech",
  hrtech: "HR Tech",
  legaltech: "LegalTech",
  insurtech: "InsurTech",
};
export function menuLabel(path: string, title: string) {
  if (names[path]) return names[path];
  const family = presentationFor(path)?.family;
  let text = path
    .slice(1)
    .replace(/^software-development-company-/, "")
    .replace(/^hire-/, "")
    .replace(/-services$/, "");
  if (family === "technology")
    text = text.replace(
      /-(development|app-development|api-development|containerisation|infrastructure)$/,
      "",
    );
  if (family === "industry") text = text.replace(/-software-development$/, "");
  if (path.startsWith("/blog/")) return title.split("|")[0].trim();
  return text
    .split("-")
    .map((w) => words[w] ?? w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
export function menuGroup(path: string) {
  if (
    [
      "/web-application-development",
      "/web-development",
      "/web-design",
      "/ui-ux-design",
      "/ecommerce-development",
      "/website-redesign",
    ].includes(path)
  )
    return "Web & design";
  if (solutionPaths.includes(path)) return "Software solutions";
  if (specialistPaths.includes(path)) return "Specialist software";
  return (
    (
      {
        software: "Software",
        mobile: "Mobile apps",
        ai: "AI & data",
        cloud: "Cloud & DevOps",
        hire: "Hire developers",
        technology: "Technologies",
        industry: "Industries",
        location: "Global delivery",
        marketing: "SEO & paid search",
        home: "Company",
        directory: "Company",
        company: "Company",
        contact: "Company",
        work: "Our work",
      } as Record<string, string>
    )[presentationFor(path)?.family ?? ""] ?? "Insights & resources"
  );
}
export const menuGroupOrder = [
  "Software",
  "Mobile apps",
  "AI & data",
  "Cloud & DevOps",
  "Specialist software",
  "Software solutions",
  "Web & design",
  "Hire developers",
  "Technologies",
  "Industries",
  "SEO & paid search",
  "Global delivery",
  "Our work",
  "Company",
  "Insights & resources",
];
export function menuScope(path: string) {
  const group = menuGroup(path);
  if (group === "Technologies") return "Technologies";
  if (group === "Hire developers") return "Hire Developers";
  if (group === "Industries") return "Industries";
  if (
    ["Company", "Our work", "Global delivery", "Insights & resources"].includes(
      group,
    )
  )
    return "Company";
  return "Services";
}
export const menuScopes = [
  "Services",
  "Technologies",
  "Hire Developers",
  "Industries",
  "Company",
];
