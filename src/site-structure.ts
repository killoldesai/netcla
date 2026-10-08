// Single source of truth for the site's information architecture.
// Menus, footer, service hubs, breadcrumbs, internal-link suggestions,
// generation prompts and the admin site map all read from here.
// tests/site-structure.test.ts keeps it in sync with templates/site-plan.json.

export type PillarId =
  | "software"
  | "mobile"
  | "ai"
  | "cloud"
  | "web"
  | "marketing"
  | "hire"
  | "industries";

export type PageType =
  | "home"
  | "pillar"
  | "service"
  | "technology"
  | "hire"
  | "industry"
  | "location"
  | "company"
  | "directory"
  | "contact"
  | "work"
  | "guide";

export type Pillar = {
  id: PillarId;
  label: string;
  hub: string;
  blurb: string;
  icon: string;
  /** Lead-form service option preselected by CTAs on this pillar. */
  service: string;
  /** Shown in the Services mega menu (Hire and Industries get their own tabs). */
  inServicesMenu: boolean;
};

export const pillars: Pillar[] = [
  { id: "software", label: "Software Development", hub: "/custom-software-development", blurb: "Custom platforms, SaaS and business systems", icon: "software", service: "Custom software", inServicesMenu: true },
  { id: "mobile", label: "Mobile Apps", hub: "/mobile-app-development", blurb: "iOS, Android and cross-platform apps", icon: "mobile", service: "Mobile application development", inServicesMenu: true },
  { id: "ai", label: "AI & Machine Learning", hub: "/ai-development-services", blurb: "LLMs, automation and applied ML", icon: "ai", service: "AI & business automation", inServicesMenu: true },
  { id: "cloud", label: "Cloud & DevOps", hub: "/cloud-services", blurb: "AWS, Azure, GCP and delivery pipelines", icon: "cloud", service: "Cloud & DevOps", inServicesMenu: true },
  { id: "web", label: "Web & eCommerce", hub: "/web-development", blurb: "Websites, web apps and online stores", icon: "retail", service: "Website design & development", inServicesMenu: true },
  { id: "marketing", label: "Digital Marketing", hub: "/digital-marketing-services", blurb: "SEO, Google Ads and paid search", icon: "finance", service: "SEO", inServicesMenu: true },
  { id: "hire", label: "Hire Developers", hub: "/hire-developers", blurb: "Dedicated engineers for your stack", icon: "team", service: "Help defining the scope", inServicesMenu: false },
  { id: "industries", label: "Industries", hub: "/industries", blurb: "Software for your sector's workflows", icon: "building", service: "Custom software", inServicesMenu: false },
];

export type SitePage = {
  path: string;
  type: PageType;
  pillar?: PillarId;
  /** Short name used in menus and breadcrumbs. */
  label: string;
  /** One line (≤ 70 chars) used under menu items and in related-link cards. */
  blurb: string;
  /** Menu sub-group inside a pillar, e.g. "Platforms", "Technologies". */
  group?: string;
};

const p = (
  path: string,
  type: PageType,
  pillar: PillarId | undefined,
  label: string,
  blurb: string,
  group?: string,
): SitePage => ({ path, type, pillar, label, blurb, group });

export const sitePages: SitePage[] = [
  // Company and cross-cutting
  p("/", "home", undefined, "Home", "Software, mobile, AI and cloud development"),
  p("/about", "company", undefined, "About", "Who we are and how the team is organised"),
  p("/services", "directory", undefined, "All services", "Every service we offer, in one place"),
  p("/contact", "contact", undefined, "Contact", "Tell us about your project"),
  p("/portfolio", "work", undefined, "Portfolio", "Selected projects and products"),
  p("/case-studies", "work", undefined, "Case studies", "How projects were scoped and delivered"),
  p("/how-we-work", "company", undefined, "How we work", "Discovery, delivery and review milestones"),
  p("/engagement-models", "company", undefined, "Engagement models", "Fixed scope, dedicated team or extension"),
  p("/why-choose-netofficials", "company", undefined, "Why Netofficials", "What to compare when choosing a partner"),
  p("/faq", "company", undefined, "FAQ", "Answers to common project questions"),
  p("/careers", "company", undefined, "Careers", "Open roles at Netofficials"),
  p("/blog", "guide", undefined, "Guides", "Practical guides on software, AI and cloud"),

  // Software Development
  p("/custom-software-development", "pillar", "software", "Custom software", "Software built around your workflows"),
  p("/web-application-development", "service", "software", "Web applications", "Browser-based apps for teams and customers", "Build"),
  p("/saas-development-services", "service", "software", "SaaS development", "Multi-tenant products with billing and roles", "Build"),
  p("/enterprise-software-development", "service", "software", "Enterprise software", "Systems for large teams and integrations", "Build"),
  p("/api-development-services", "service", "software", "API development", "REST and GraphQL APIs and integrations", "Build"),
  p("/erp-development-services", "service", "software", "ERP development", "Operations, inventory and finance systems", "Business systems"),
  p("/crm-development-services", "service", "software", "CRM development", "Sales and customer data in one place", "Business systems"),
  p("/legacy-software-modernisation", "service", "software", "Legacy modernisation", "Upgrade ageing systems without a big bang", "Business systems"),
  p("/digital-transformation-services", "service", "software", "Digital transformation", "Replace manual processes with software", "Business systems"),
  p("/blockchain-development-services", "service", "software", "Blockchain", "Smart contracts and ledger integrations", "Specialist"),
  p("/iot-development-services", "service", "software", "IoT development", "Connected devices, data and dashboards", "Specialist"),
  p("/ar-vr-development-services", "service", "software", "AR & VR", "Immersive apps for training and retail", "Specialist"),
  p("/mvp-development-services", "service", "software", "MVP development", "Launch a first version and learn fast", "Product stage"),
  p("/proof-of-concept-development", "service", "software", "Proof of concept", "Test technical feasibility before you build", "Product stage"),
  p("/startup-software-development", "service", "software", "Startups", "Product engineering for early-stage teams", "Product stage"),
  p("/product-development-services", "service", "software", "Product development", "From roadmap to release and iteration", "Product stage"),
  p("/white-label-software-development", "service", "software", "White-label software", "Products you can rebrand and resell", "Product stage"),
  p("/software-consulting-services", "service", "software", "Software consulting", "Architecture, scoping and technical advice", "Delivery models"),
  p("/software-development-outsourcing", "service", "software", "Outsourcing", "Hand a defined build to an external team", "Delivery models"),
  p("/software-outsourcing-services", "service", "software", "Outsourcing services", "Managed delivery for defined scopes", "Delivery models"),
  p("/offshore-software-development", "service", "software", "Offshore development", "An India-based team on your roadmap", "Delivery models"),
  p("/nodejs-development-services", "technology", "software", "Node.js", "Fast APIs and real-time backends", "Technologies"),
  p("/python-development-services", "technology", "software", "Python", "Backends, data pipelines and automation", "Technologies"),
  p("/java-development-services", "technology", "software", "Java", "Enterprise backends and integrations", "Technologies"),
  p("/dotnet-development-services", "technology", "software", ".NET", "Microsoft-stack applications and APIs", "Technologies"),
  p("/django-development-services", "technology", "software", "Django", "Python web apps with admin built in", "Technologies"),
  p("/golang-development-services", "technology", "software", "Go", "High-throughput services and tooling", "Technologies"),
  p("/graphql-api-development", "technology", "software", "GraphQL", "Typed APIs for web and mobile clients", "Technologies"),
  p("/mongodb-development-services", "technology", "software", "MongoDB", "Document databases and data modelling", "Technologies"),
  p("/postgresql-development-services", "technology", "software", "PostgreSQL", "Relational data design and tuning", "Technologies"),
  p("/typescript-development-services", "technology", "software", "TypeScript", "Typed JavaScript across front and back end", "Technologies"),

  // Mobile Apps
  p("/mobile-app-development", "pillar", "mobile", "Mobile apps", "Apps for customers and employees"),
  p("/ios-app-development", "service", "mobile", "iOS apps", "Native apps for iPhone and iPad", "Platforms"),
  p("/iphone-app-development", "service", "mobile", "iPhone apps", "Consumer and business iPhone apps", "Platforms"),
  p("/ipad-app-development", "service", "mobile", "iPad apps", "Tablet apps for field and retail teams", "Platforms"),
  p("/android-app-development", "service", "mobile", "Android apps", "Native apps for Android devices", "Platforms"),
  p("/cross-platform-app-development", "service", "mobile", "Cross-platform", "One codebase for iOS and Android", "Approaches"),
  p("/hybrid-app-development", "service", "mobile", "Hybrid apps", "Web technology packaged as an app", "Approaches"),
  p("/on-demand-app-development", "service", "mobile", "On-demand apps", "Booking, delivery and marketplace apps", "Approaches"),
  p("/flutter-app-development", "technology", "mobile", "Flutter", "Cross-platform apps from one Dart codebase", "Technologies"),
  p("/react-native-app-development", "technology", "mobile", "React Native", "Cross-platform apps with React", "Technologies"),
  p("/kotlin-app-development", "technology", "mobile", "Kotlin", "Modern native Android development", "Technologies"),
  p("/swift-app-development", "technology", "mobile", "Swift", "Modern native iOS development", "Technologies"),

  // AI & Machine Learning
  p("/ai-development-services", "pillar", "ai", "AI development", "Applied AI for real business tasks"),
  p("/generative-ai-development", "service", "ai", "Generative AI", "Content, search and assistant features", "Generative AI"),
  p("/llm-development-services", "service", "ai", "LLM development", "Custom LLM apps, RAG and fine-tuning", "Generative AI"),
  p("/ai-chatbot-development", "service", "ai", "AI chatbots", "Assistants grounded in your own content", "Generative AI"),
  p("/ai-integration-services", "service", "ai", "AI integration", "Add AI to the software you already run", "Generative AI"),
  p("/ai-automation-services", "service", "ai", "AI automation", "Automate document and workflow steps", "Automation"),
  p("/ai-consulting-services", "service", "ai", "AI consulting", "Find use cases worth building first", "Automation"),
  p("/machine-learning-development", "service", "ai", "Machine learning", "Models trained on your business data", "Machine learning"),
  p("/deep-learning-development", "service", "ai", "Deep learning", "Neural networks for complex data", "Machine learning"),
  p("/natural-language-processing", "service", "ai", "NLP", "Classify, extract and search text", "Machine learning"),
  p("/computer-vision-development", "service", "ai", "Computer vision", "Image and video recognition", "Machine learning"),
  p("/predictive-analytics-services", "service", "ai", "Predictive analytics", "Forecast demand, churn and risk", "Data"),
  p("/recommendation-engine-development", "service", "ai", "Recommendation engines", "Personalised products and content", "Data"),
  p("/data-science-services", "service", "ai", "Data science", "Analysis and models that inform decisions", "Data"),
  p("/mlops-services", "service", "ai", "MLOps", "Deploy, monitor and retrain models", "Data"),

  // Cloud & DevOps
  p("/cloud-services", "pillar", "cloud", "Cloud services", "Infrastructure your team can operate"),
  p("/aws-services", "service", "cloud", "AWS", "Architecture and operations on AWS", "Platforms"),
  p("/azure-services", "service", "cloud", "Azure", "Microsoft Azure builds and migrations", "Platforms"),
  p("/google-cloud-services", "service", "cloud", "Google Cloud", "Applications and data on GCP", "Platforms"),
  p("/cloud-migration-services", "service", "cloud", "Cloud migration", "Move workloads with a tested plan", "Services"),
  p("/cloud-consulting", "service", "cloud", "Cloud consulting", "Cost, security and architecture reviews", "Services"),
  p("/devops-services", "service", "cloud", "DevOps & CI/CD", "Automated build, test and release", "Services"),
  p("/kubernetes-services", "technology", "cloud", "Kubernetes", "Container orchestration in production", "Technologies"),
  p("/docker-containerisation-services", "technology", "cloud", "Docker", "Containerise apps for consistent deploys", "Technologies"),
  p("/terraform-infrastructure-services", "technology", "cloud", "Terraform", "Infrastructure as code you can review", "Technologies"),

  // Web & eCommerce
  p("/web-development", "pillar", "web", "Web development", "Websites and web platforms"),
  p("/web-design", "service", "web", "Web design", "Sites designed to convert visitors", "Websites"),
  p("/ui-ux-design", "service", "web", "UI/UX design", "Research, flows and interface design", "Websites"),
  p("/website-redesign", "service", "web", "Website redesign", "Rebuild without losing search traffic", "Websites"),
  p("/ecommerce-development", "service", "web", "eCommerce", "Online stores and checkout flows", "eCommerce"),
  p("/shopify-development-services", "technology", "web", "Shopify", "Shopify stores, themes and apps", "eCommerce"),
  p("/magento-development-services", "technology", "web", "Magento", "Adobe Commerce builds and upgrades", "eCommerce"),
  p("/woocommerce-development-services", "technology", "web", "WooCommerce", "WordPress-based online stores", "eCommerce"),
  p("/wordpress-development-services", "technology", "web", "WordPress", "Custom themes, plugins and sites", "Technologies"),
  p("/react-development-services", "technology", "web", "React", "Interactive front ends and SPAs", "Technologies"),
  p("/nextjs-development-services", "technology", "web", "Next.js", "Fast, search-friendly React sites", "Technologies"),
  p("/angular-development-services", "technology", "web", "Angular", "Enterprise front-end applications", "Technologies"),
  p("/vuejs-development-services", "technology", "web", "Vue.js", "Lightweight, maintainable front ends", "Technologies"),
  p("/php-development-services", "technology", "web", "PHP", "Web applications and CMS builds", "Technologies"),
  p("/laravel-development-services", "technology", "web", "Laravel", "PHP applications with a clean structure", "Technologies"),

  // Digital Marketing
  p("/digital-marketing-services", "pillar", "marketing", "Digital marketing", "Search visibility and paid acquisition"),
  p("/seo-services", "service", "marketing", "SEO services", "Rank for the searches buyers make", "Search"),
  p("/technical-seo-services", "service", "marketing", "Technical SEO", "Crawlability, speed and structured data", "Search"),
  p("/local-seo-services", "service", "marketing", "Local SEO", "Visibility in maps and local results", "Search"),
  p("/ecommerce-seo-services", "service", "marketing", "eCommerce SEO", "Category and product page search growth", "Search"),
  p("/ppc-services", "service", "marketing", "PPC management", "Paid search campaigns that track leads", "Paid"),
  p("/google-ads-management", "service", "marketing", "Google Ads", "Campaign setup, bidding and reporting", "Paid"),

  // Hire Developers
  p("/hire-developers", "pillar", "hire", "Hire developers", "Dedicated engineers matched to your stack"),
  p("/dedicated-development-team", "hire", "hire", "Dedicated team", "A long-term team on your roadmap", "Engagement"),
  p("/it-staff-augmentation", "hire", "hire", "Staff augmentation", "Add individual engineers to your team", "Engagement"),
  p("/hire-react-developer", "hire", "hire", "React developers", "Front-end engineers for React apps", "Front end"),
  p("/hire-angular-developer", "hire", "hire", "Angular developers", "Engineers for Angular applications", "Front end"),
  p("/hire-vuejs-developer", "hire", "hire", "Vue.js developers", "Engineers for Vue front ends", "Front end"),
  p("/hire-frontend-developer", "hire", "hire", "Front-end developers", "UI engineers across frameworks", "Front end"),
  p("/hire-ui-ux-designer", "hire", "hire", "UI/UX designers", "Product and interface designers", "Front end"),
  p("/hire-web-designer", "hire", "hire", "Web designers", "Designers for marketing sites", "Front end"),
  p("/hire-nodejs-developer", "hire", "hire", "Node.js developers", "Backend engineers for Node", "Back end"),
  p("/hire-python-developer", "hire", "hire", "Python developers", "Backend and data engineers", "Back end"),
  p("/hire-java-developer", "hire", "hire", "Java developers", "Enterprise backend engineers", "Back end"),
  p("/hire-dotnet-developer", "hire", "hire", ".NET developers", "Microsoft-stack engineers", "Back end"),
  p("/hire-php-developer", "hire", "hire", "PHP developers", "Web application engineers", "Back end"),
  p("/hire-laravel-developer", "hire", "hire", "Laravel developers", "PHP engineers for Laravel", "Back end"),
  p("/hire-django-developer", "hire", "hire", "Django developers", "Python web engineers", "Back end"),
  p("/hire-backend-developer", "hire", "hire", "Backend developers", "APIs, databases and services", "Back end"),
  p("/hire-full-stack-developer", "hire", "hire", "Full-stack developers", "Engineers across front and back end", "Back end"),
  p("/hire-mobile-app-developer", "hire", "hire", "Mobile developers", "Engineers for iOS and Android", "Mobile"),
  p("/hire-ios-developer", "hire", "hire", "iOS developers", "Native Swift engineers", "Mobile"),
  p("/hire-android-developer", "hire", "hire", "Android developers", "Native Kotlin engineers", "Mobile"),
  p("/hire-flutter-developer", "hire", "hire", "Flutter developers", "Cross-platform Dart engineers", "Mobile"),
  p("/hire-react-native-developer", "hire", "hire", "React Native developers", "Cross-platform React engineers", "Mobile"),
  p("/hire-ai-ml-developer", "hire", "hire", "AI/ML developers", "Engineers for models and LLM apps", "AI, data & cloud"),
  p("/hire-data-scientist", "hire", "hire", "Data scientists", "Analysis, modelling and experiments", "AI, data & cloud"),
  p("/hire-devops-engineer", "hire", "hire", "DevOps engineers", "CI/CD, infrastructure and reliability", "AI, data & cloud"),
  p("/hire-aws-developer", "hire", "hire", "AWS developers", "Engineers certified on AWS services", "AI, data & cloud"),
  p("/hire-blockchain-developer", "hire", "hire", "Blockchain developers", "Smart contract engineers", "AI, data & cloud"),
  p("/hire-wordpress-developer", "hire", "hire", "WordPress developers", "Theme and plugin engineers", "CMS & commerce"),
  p("/hire-shopify-developer", "hire", "hire", "Shopify developers", "Store, theme and app engineers", "CMS & commerce"),
  p("/hire-woocommerce-developer", "hire", "hire", "WooCommerce developers", "WordPress commerce engineers", "CMS & commerce"),
  p("/hire-magento-developer", "hire", "hire", "Magento developers", "Adobe Commerce engineers", "CMS & commerce"),

  // Industries
  p("/industries", "pillar", "industries", "Industries", "Software shaped by your sector"),
  p("/healthcare-software-development", "industry", "industries", "Healthcare", "Patient, clinical and care workflows"),
  p("/fintech-software-development", "industry", "industries", "Fintech", "Payments, lending and financial tools"),
  p("/insurtech-software-development", "industry", "industries", "Insurance", "Policy, claims and underwriting systems"),
  p("/edtech-software-development", "industry", "industries", "Education", "Learning platforms and course delivery"),
  p("/real-estate-software-development", "industry", "industries", "Real estate", "Listings, CRM and property management"),
  p("/logistics-software-development", "industry", "industries", "Logistics", "Orders, routes and warehouse operations"),
  p("/retail-software-development", "industry", "industries", "Retail", "Inventory, POS and omnichannel sales"),
  p("/travel-software-development", "industry", "industries", "Travel", "Booking engines and guest experience"),
  p("/legaltech-software-development", "industry", "industries", "Legal", "Matter, document and billing tools"),
  p("/hrtech-software-development", "industry", "industries", "HR", "Recruiting, payroll and people tools"),
  p("/manufacturing-software-development", "industry", "industries", "Manufacturing", "Production, quality and IoT systems"),

  // Locations
  p("/software-development-company-usa", "location", undefined, "USA", "Development for US businesses"),
  p("/software-development-company-new-york", "location", undefined, "New York", "Development for New York teams"),
  p("/software-development-company-uk", "location", undefined, "United Kingdom", "Development for UK businesses"),
  p("/software-development-company-london", "location", undefined, "London", "Development for London teams"),
  p("/software-development-company-canada", "location", undefined, "Canada", "Development for Canadian businesses"),
  p("/software-development-company-australia", "location", undefined, "Australia", "Development for Australian businesses"),
  p("/software-development-company-dubai", "location", undefined, "Dubai", "Development for UAE businesses"),
  p("/software-development-company-india", "location", undefined, "India", "Our home delivery base"),
];

const byPath = new Map(sitePages.map((page) => [page.path, page]));

export function sitePage(path: string): SitePage | undefined {
  return byPath.get(path);
}

export function pillar(id: PillarId): Pillar {
  return pillars.find((x) => x.id === id)!;
}

export function pillarFor(path: string): Pillar | undefined {
  const page = byPath.get(path);
  return page?.pillar ? pillar(page.pillar) : undefined;
}

export function pillarPages(id: PillarId): SitePage[] {
  return sitePages.filter((page) => page.pillar === id && page.type !== "pillar");
}

/** Pages of a pillar grouped by menu group, in declaration order. */
export function pillarGroups(id: PillarId): { group: string; pages: SitePage[] }[] {
  const groups: { group: string; pages: SitePage[] }[] = [];
  for (const page of pillarPages(id)) {
    const name = page.group ?? "More";
    let entry = groups.find((g) => g.group === name);
    if (!entry) groups.push((entry = { group: name, pages: [] }));
    entry.pages.push(page);
  }
  return groups;
}

export function breadcrumbs(path: string, title?: string): { label: string; path: string }[] {
  const trail = [{ label: "Home", path: "/" }];
  if (path === "/") return trail;
  const page = byPath.get(path);
  if (!page) {
    // Guides live under /blog and are not part of the static structure.
    if (path.startsWith("/blog/")) trail.push({ label: "Guides", path: "/blog" });
    if (title) trail.push({ label: title.replace(/\s*[|:–-].*$/, ""), path });
    return trail;
  }
  if (page.pillar && page.type !== "pillar") {
    const hub = pillar(page.pillar);
    trail.push({ label: hub.label, path: hub.hub });
  }
  trail.push({ label: page.label, path: page.path });
  return trail;
}

/** Sibling and hub links for internal-link suggestions, closest first. */
export function relatedPaths(path: string, limit = 6): string[] {
  const page = byPath.get(path);
  if (!page?.pillar) return [];
  const hub = pillar(page.pillar).hub;
  const siblings = pillarPages(page.pillar).filter((x) => x.path !== path);
  const sameGroup = siblings.filter((x) => x.group === page.group);
  const others = siblings.filter((x) => x.group !== page.group);
  return [...(path === hub ? [] : [hub]), ...sameGroup.map((x) => x.path), ...others.map((x) => x.path)].slice(0, limit);
}

/** Old or mistyped URLs that should resolve to their canonical page. */
export const structureRedirects: Record<string, string> = {
  "/hire-ai-developer": "/hire-ai-ml-developer",
  "/education-software-development": "/edtech-software-development",
};
