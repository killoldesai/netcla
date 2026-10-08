import {
  buildServices,
  technologyGroups,
  developerRoles,
  industries,
  type DirectoryLink,
} from "./service-directory-data";
export type MegaGroup = {
  name: string;
  path?: string;
  description?: string;
  links: DirectoryLink[];
};
export const serviceMenu: MegaGroup[] = [
  ...buildServices.slice(0, 4),
  {
    name: "Websites & eCommerce",
    path: "/web-development",
    description: "Websites and online stores built around your customers.",
    links: [
      ...buildServices
        .filter((s) =>
          ["/web-development", "/ecommerce-development"].includes(s.path),
        )
        .flatMap((s) => [{ name: s.name, path: s.path }, ...s.links]),
    ],
  },
  {
    name: "SEO & paid search",
    path: "/seo-services",
    description: "Search visibility and paid campaigns for your business.",
    links: [
      { name: "SEO services", path: "/seo-services" },
      { name: "Technical SEO", path: "/technical-seo-services" },
      { name: "Local SEO", path: "/local-seo-services" },
      { name: "PPC management", path: "/ppc-services" },
      { name: "Google Ads", path: "/google-ads-management" },
    ],
  },
];
export const technologyMenu: MegaGroup[] = [
  ...technologyGroups.filter((g) => g.name !== "eCommerce & CMS"),
  { name: "Cloud & DevOps", links: buildServices[3].links },
  technologyGroups.find((g) => g.name === "eCommerce & CMS")!,
];
const mobileRole = /flutter|react-native|android|ios|swift|kotlin/i;
const specialistRole = /ai-|machine|devops|cloud|data/i;
export const hiringMenu: MegaGroup[] = [
  {
    name: "Software engineers",
    links: developerRoles.filter(
      (r) => !mobileRole.test(r.path) && !specialistRole.test(r.path),
    ),
  },
  {
    name: "Mobile developers",
    links: developerRoles.filter((r) => mobileRole.test(r.path)),
  },
  {
    name: "AI & cloud specialists",
    links: developerRoles.filter(
      (r) => !mobileRole.test(r.path) && specialistRole.test(r.path),
    ),
  },
];
export const industryMenu: MegaGroup[] = [
  { name: "Industries we work with", links: industries },
];
export const companyMenu: MegaGroup[] = [
  {
    name: "Meet Netofficials",
    links: [
      {
        name: "About us",
        path: "/about",
        description: "Our team and approach to delivery.",
      },
      {
        name: "How we work",
        path: "/how-we-work",
        description: "From requirements to release.",
      },
      {
        name: "Engagement models",
        path: "/engagement-models",
        description: "Choose how we work together.",
      },
    ],
  },
  {
    name: "Explore",
    links: [
      { name: "Our work", path: "/portfolio" },
      { name: "Insights", path: "/blog" },
      { name: "Careers", path: "/careers" },
      { name: "Contact", path: "/contact" },
    ],
  },
];

const linkDescriptions: Record<string, string> = {
  "/web-application-development":
    "Browser-based applications for your business.",
  "/saas-development-services": "Subscription products and customer platforms.",
  "/mvp-development-services": "A focused first release of your product.",
  "/enterprise-software-development":
    "Software for complex business workflows.",
  "/digital-transformation-services":
    "Connect and modernise your existing systems.",
  "/ios-app-development": "Applications for Apple devices.",
  "/android-app-development": "Applications for Android devices.",
  "/flutter-app-development": "Shared application code across platforms.",
  "/react-native-app-development": "Mobile applications built with React.",
  "/on-demand-app-development": "Bookings, dispatch and service delivery.",
  "/ai-chatbot-development":
    "Conversational interfaces connected to your data.",
  "/llm-development-services": "Language models within your application.",
  "/ai-automation-services": "Automate repetitive business workflows.",
  "/computer-vision-development": "Applications that work with visual data.",
  "/data-science-services": "Turn business data into useful analysis.",
  "/aws-services": "Infrastructure and applications on AWS.",
  "/azure-services": "Cloud services on Microsoft Azure.",
  "/google-cloud-services": "Applications and data on Google Cloud.",
  "/kubernetes-services": "Manage containerised applications.",
  "/terraform-infrastructure-services":
    "Infrastructure defined and managed as code.",
  "/devops-services": "Build, test and deployment pipelines.",
};
for (const group of serviceMenu)
  group.links = group.links.map((link) => ({
    ...link,
    description: link.description ?? linkDescriptions[link.path],
  }));
