import inventory from "./templates/site-plan.json";

export type DirectoryLink = {
  name: string;
  path: string;
  description?: string;
};
export type DirectoryService = DirectoryLink & {
  tag: string;
  icon: string;
  links: DirectoryLink[];
};
const link = (name: string, path: string): DirectoryLink => ({ name, path });
export const directoryMetadata = {
  title: "Software Development, Mobile, AI & Cloud Services | Netofficials",
  description:
    "Custom software, mobile apps, AI automation, cloud DevOps, eCommerce and SEO services from an India-based development team.",
};
export const buildServices: DirectoryService[] = [
  {
    name: "Custom Software Development",
    path: "/custom-software-development",
    tag: "Software & platforms",
    icon: "software",
    description:
      "Web applications, SaaS platforms and internal tools built around your business requirements.",
    links: [
      link("Web apps", "/web-application-development"),
      link("SaaS", "/saas-development-services"),
      link("MVP development", "/mvp-development-services"),
      link("Enterprise software", "/enterprise-software-development"),
      link("Digital transformation", "/digital-transformation-services"),
    ],
  },
  {
    name: "Mobile App Development",
    path: "/mobile-app-development",
    tag: "iOS, Android & cross-platform",
    icon: "mobile",
    description:
      "Native and cross-platform apps for customers, employees and the people using your product on the move.",
    links: [
      link("iOS", "/ios-app-development"),
      link("Android", "/android-app-development"),
      link("Flutter", "/flutter-app-development"),
      link("React Native", "/react-native-app-development"),
      link("On-demand apps", "/on-demand-app-development"),
    ],
  },
  {
    name: "AI & Machine Learning",
    path: "/ai-development-services",
    tag: "AI & business automation",
    icon: "ai",
    description:
      "AI integrations, chatbots and automation connected to your data, software and business workflows.",
    links: [
      link("AI chatbots", "/ai-chatbot-development"),
      link("LLM development", "/llm-development-services"),
      link("Process automation", "/ai-automation-services"),
      link("Computer vision", "/computer-vision-development"),
      link("Data science", "/data-science-services"),
    ],
  },
  {
    name: "Cloud & DevOps",
    path: "/cloud-services",
    tag: "Infrastructure & delivery",
    icon: "cloud",
    description:
      "Cloud infrastructure, migrations and deployment pipelines for software your team can operate and maintain.",
    links: [
      link("AWS", "/aws-services"),
      link("Azure", "/azure-services"),
      link("Google Cloud", "/google-cloud-services"),
      link("Kubernetes", "/kubernetes-services"),
      link("Terraform", "/terraform-infrastructure-services"),
      link("CI/CD", "/devops-services"),
    ],
  },
  {
    name: "UI / UX Design",
    path: "/ui-ux-design",
    tag: "Product design",
    icon: "design",
    description:
      "Research, wireframes, prototypes and interfaces for web and mobile products.",
    links: [
      link("UI / UX services", "/ui-ux-design"),
      link("Website design", "/web-design"),
    ],
  },
  {
    name: "Specialist Software",
    path: "/custom-software-development#hub-services",
    tag: "Specialist development",
    icon: "specialist",
    description:
      "Connected devices, immersive experiences and integrations for more specialised product requirements.",
    links: [
      link("Blockchain", "/blockchain-development-services"),
      link("IoT", "/iot-development-services"),
      link("AR / VR", "/ar-vr-development-services"),
      link("API development", "/api-development-services"),
    ],
  },
  {
    name: "Website Development",
    path: "/web-development",
    tag: "Websites",
    icon: "web",
    description:
      "Business websites, redesigns and content experiences with a clear path to enquiry.",
    links: [
      link("Website design", "/web-design"),
      link("Website redesign", "/website-redesign"),
    ],
  },
  {
    name: "eCommerce Development",
    path: "/ecommerce-development",
    tag: "Online stores",
    icon: "commerce",
    description:
      "Platform-based stores and custom eCommerce applications for your catalogue and operations.",
    links: [
      link("Shopify", "/shopify-development-services"),
      link("WooCommerce", "/woocommerce-development-services"),
      link("Magento", "/magento-development-services"),
    ],
  },
];
export const technologyGroups = [
  {
    name: "Frontend",
    links: [
      link("React.js", "/react-development-services"),
      link("Next.js", "/nextjs-development-services"),
      link("Angular", "/angular-development-services"),
      link("Vue.js", "/vuejs-development-services"),
      link("TypeScript", "/typescript-development-services"),
    ],
  },
  {
    name: "Backend",
    links: [
      link("Node.js", "/nodejs-development-services"),
      link("Python", "/python-development-services"),
      link("PHP", "/php-development-services"),
      link("Java", "/java-development-services"),
      link(".NET", "/dotnet-development-services"),
      link("Django", "/django-development-services"),
      link("Laravel", "/laravel-development-services"),
      link("Go", "/golang-development-services"),
    ],
  },
  {
    name: "Mobile",
    links: [
      link("Flutter", "/flutter-app-development"),
      link("React Native", "/react-native-app-development"),
      link("Swift", "/swift-app-development"),
      link("Kotlin", "/kotlin-app-development"),
    ],
  },
  {
    name: "eCommerce & CMS",
    links: [
      link("WordPress", "/wordpress-development-services"),
      link("Shopify", "/shopify-development-services"),
      link("Magento", "/magento-development-services"),
      link("WooCommerce", "/woocommerce-development-services"),
    ],
  },
  {
    name: "Data & infrastructure",
    links: [
      link("GraphQL", "/graphql-api-development"),
      link("MongoDB", "/mongodb-development-services"),
      link("PostgreSQL", "/postgresql-development-services"),
      link("Docker", "/docker-containerisation-services"),
      link("Terraform", "/terraform-infrastructure-services"),
    ],
  },
];
export const engagementModels = [
  {
    name: "Dedicated Development Team",
    path: "/dedicated-development-team",
    description:
      "A team assembled around your product, with agreed engineering, design and QA responsibilities.",
    fit: "A product with ongoing development needs",
    icon: "team",
  },
  {
    name: "Staff Augmentation",
    path: "/it-staff-augmentation",
    description:
      "Add specific engineering skills to your existing team and delivery process.",
    fit: "A skill gap in an established team",
    icon: "specialist",
  },
  {
    name: "Offshore Development Centre",
    path: "/offshore-software-development",
    description:
      "Plan an India-based development function around your roadmap and operating requirements.",
    fit: "A longer-term engineering operation",
    icon: "office",
  },
];
export const developerRoles: DirectoryLink[] = inventory.entries
  .filter(
    (e) =>
      e.cluster === "Hire Developers" &&
      e.url.startsWith("/hire-") &&
      e.url !== "/hire-developers",
  )
  .map((e) => ({ name: e.h1.replace(/^Hire /, ""), path: e.url }));
export const solutions: DirectoryLink[] = [
  {
    name: "SaaS Development",
    path: "/saas-development-services",
    description: "A subscription product with accounts, billing and reporting.",
  },
  {
    name: "MVP Development",
    path: "/mvp-development-services",
    description: "A focused first release to test your product idea.",
  },
  {
    name: "Startup Software",
    path: "/startup-software-development",
    description: "Engineering for an early-stage product and its next release.",
  },
  {
    name: "Enterprise Software",
    path: "/enterprise-software-development",
    description: "Applications for complex workflows, access and integrations.",
  },
  {
    name: "Digital Transformation",
    path: "/digital-transformation-services",
    description: "Replace manual workflows with connected software.",
  },
  {
    name: "Legacy Modernisation",
    path: "/legacy-software-modernisation",
    description: "Update software that is difficult to change or maintain.",
  },
  {
    name: "Product Development",
    path: "/product-development-services",
    description:
      "Take a product from discovery through development and release.",
  },
  {
    name: "Software Outsourcing",
    path: "/software-outsourcing-services",
    description: "Engage a development partner for a defined scope of work.",
  },
  {
    name: "Software Consulting",
    path: "/software-consulting-services",
    description: "Review architecture, code and technical decisions.",
  },
  {
    name: "Proof of Concept",
    path: "/proof-of-concept-development",
    description: "Test technical feasibility before a larger investment.",
  },
  {
    name: "White Label Software",
    path: "/white-label-software-development",
    description: "Build software that can be branded for different customers.",
  },
  {
    name: "Offshore Development",
    path: "/offshore-software-development",
    description: "Plan development delivery with an India-based team.",
  },
];
export const marketingServices: DirectoryLink[] = [
  {
    name: "SEO Services",
    path: "/seo-services",
    description: "Organic search strategy, content and on-page improvements.",
  },
  {
    name: "Technical SEO",
    path: "/technical-seo-services",
    description:
      "Crawlability, site structure, performance and structured data.",
  },
  {
    name: "Paid Search",
    path: "/ppc-services",
    description:
      "Paid campaigns with agreed goals, budgets and conversion tracking.",
  },
  {
    name: "Google Ads Management",
    path: "/google-ads-management",
    description: "Campaign setup, search terms, landing pages and reporting.",
  },
  {
    name: "eCommerce SEO",
    path: "/ecommerce-seo-services",
    description: "Search visibility for product pages, categories and stores.",
  },
  {
    name: "Local SEO",
    path: "/local-seo-services",
    description: "Search presence for businesses serving specific locations.",
  },
];
export const industries: DirectoryLink[] = [
  {
    name: "Healthcare",
    path: "/healthcare-software-development",
    description: "Patient portals, care workflows and telemedicine.",
  },
  {
    name: "Fintech",
    path: "/fintech-software-development",
    description: "Payment workflows and financial applications.",
  },
  {
    name: "EdTech",
    path: "/edtech-software-development",
    description: "Learning platforms, classrooms and assessments.",
  },
  {
    name: "Real Estate",
    path: "/real-estate-software-development",
    description: "Property portals, CRM and management systems.",
  },
  {
    name: "Logistics",
    path: "/logistics-software-development",
    description: "Fleet operations, delivery and shipment tracking.",
  },
  {
    name: "On-Demand",
    path: "/on-demand-app-development",
    description: "Bookings, dispatch and service delivery apps.",
  },
  {
    name: "Retail",
    path: "/retail-software-development",
    description: "Stores, inventory and connected sales channels.",
  },
  {
    name: "Travel",
    path: "/travel-software-development",
    description: "Booking platforms and travel operations.",
  },
  {
    name: "LegalTech",
    path: "/legaltech-software-development",
    description: "Contracts, case management and document workflows.",
  },
  {
    name: "HR Tech",
    path: "/hrtech-software-development",
    description: "Recruitment, employee records and HR operations.",
  },
  {
    name: "InsurTech",
    path: "/insurtech-software-development",
    description: "Policy workflows, claims and customer portals.",
  },
  {
    name: "Manufacturing",
    path: "/manufacturing-software-development",
    description: "Production, quality and operational systems.",
  },
];
export const serviceIndexSections = [
  { id: "build", name: "Build & Engineer", links: buildServices },
  {
    id: "technologies",
    name: "Technology services",
    links: technologyGroups.flatMap((group) => group.links),
  },
  {
    id: "hire",
    name: "Hire Developers",
    links: [...engagementModels, ...developerRoles],
  },
  { id: "solutions", name: "Software solutions", links: solutions },
  { id: "market", name: "Grow & Market", links: marketingServices },
  { id: "industries", name: "Industry applications", links: industries },
];
export function serviceDirectorySchema(base: string) {
  const url = new URL("/services", base).href;
  const lists = serviceIndexSections.map((section) => ({
    "@type": "ItemList",
    "@id": `${url}#${section.id}-index`,
    name: section.name,
    numberOfItems: section.links.length,
    itemListElement: section.links.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: new URL(item.path, base).href,
    })),
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: directoryMetadata.title,
        description: directoryMetadata.description,
        mainEntity: lists.map((list) => ({ "@id": list["@id"] })),
      },
      ...lists,
    ],
  };
}
