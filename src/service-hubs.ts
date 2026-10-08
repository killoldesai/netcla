import inventory from "./templates/site-plan.json";
import { pillarPages, pillars } from "./site-structure";

export type HubItem = {
  title: string;
  body: string;
  use: string;
  path?: string;
};
export type HubConfig = {
  path: string;
  name: string;
  cluster: string;
  service: string;
  intro: string;
  facts: string[];
  personas: HubItem[];
  deliverables: string[];
  process: [string, string][];
  technologies: [string, string, string[]][];
  faqs: [string, string][];
  children?: string[];
};
const mobile: HubConfig = {
  path: "/mobile-app-development",
  name: "Mobile App Development",
  cluster: "Mobile App Development",
  service: "Mobile applications",
  intro:
    "Netofficials provides mobile app development services from India for businesses building customer apps, field tools and new digital products. Plan the user experience, backend and release together, whether you need native iOS and Android or a shared codebase.",
  facts: [
    "iOS & Android",
    "Native & cross-platform",
    "API integration",
    "Release & handover",
  ],
  personas: [
    {
      title: "Founders launching an app",
      body: "You have a product idea, but the first release needs a clear scope.",
      use: "A defined MVP, prototype and staged development plan.",
    },
    {
      title: "Product teams extending a platform",
      body: "Your customers need a mobile experience connected to an existing product.",
      use: "An app that works with your APIs, accounts and data.",
    },
    {
      title: "Businesses improving field operations",
      body: "Your team needs access to tasks and records away from a desk.",
      use: "Mobile workflows planned around devices, connectivity and permissions.",
    },
  ],
  deliverables: [
    "An application built around agreed user journeys and acceptance criteria.",
    "Backend connections for authentication, records and business workflows.",
    "Device and platform testing with a documented issue review.",
    "Release preparation, source code and technical handover.",
    "A support scope agreed before launch, with clear responsibilities.",
  ],
  process: [
    [
      "Map the mobile workflow",
      "Review users, devices and the tasks the app needs to support. You receive a first-release scope and a list of open decisions.",
    ],
    [
      "Prototype the experience",
      "Design screens, navigation and important edge cases. You review a clickable prototype before development.",
    ],
    [
      "Build the app and APIs",
      "Develop the selected native or cross-platform application and its backend connections. You review working increments against the agreed scope.",
    ],
    [
      "Test on real devices",
      "Check device behaviour, permissions, network conditions and release requirements. You receive test findings and acceptance checkpoints.",
    ],
    [
      "Prepare release and handover",
      "Prepare store submissions, deployment notes and ownership access. You review the handover and agree any ongoing support.",
    ],
  ],
  technologies: [
    [
      "App interfaces",
      "Choose native platforms or a shared codebase around device features and maintenance.",
      ["Kotlin", "Swift", "Flutter", "React Native"],
    ],
    [
      "Backend & data",
      "Connect the app to your existing systems or plan a new API.",
      ["Node.js", "Python", "PostgreSQL"],
    ],
    [
      "Testing & delivery",
      "Agree device coverage, release automation and infrastructure with the project team.",
      ["Android", "iOS", "Docker", "AWS"],
    ],
  ],
  faqs: [
    [
      "Do you build iOS and Android in one project?",
      "Yes, both platforms can be scoped together. Native development uses separate platform codebases; Flutter or React Native can share much of the application code.",
    ],
    [
      "How long does a Flutter app take to build?",
      "The timeline depends on screens, backend work, device features and testing. A project estimate follows a review of the first-release scope and dependencies.",
    ],
    [
      "Can you take over an existing app codebase?",
      "An existing app can be reviewed before a takeover is agreed. The review covers code quality, build access, dependencies and the work required to maintain or extend it.",
    ],
    [
      "Will the app work without an internet connection?",
      "Offline behaviour must be designed for the specific workflow. Data storage, synchronisation and conflict handling are included in the scope when required.",
    ],
    [
      "Who handles app-store publication?",
      "Store preparation and submission responsibilities are agreed in the project scope. Your business should control its store accounts and production access.",
    ],
    [
      "What affects mobile app development cost?",
      "Platforms, screen complexity, integrations, device features and testing coverage affect the estimate. Ongoing maintenance is scoped separately.",
    ],
  ],
};
const ai: HubConfig = {
  path: "/ai-development-services",
  name: "AI Development",
  cluster: "AI & Machine Learning",
  service: "AI & business automation",
  intro:
    "Netofficials provides AI development services from India for businesses adding intelligent features and reducing manual work. Start with a specific workflow, the available data and a way to evaluate whether the system is useful.",
  facts: [
    "Workflow automation",
    "Model integration",
    "Evaluation & review",
    "Human oversight",
  ],
  personas: [
    {
      title: "Founders automating a workflow",
      body: "Repeated document or information handling is taking time away from the business.",
      use: "A focused automation with review points and measurable acceptance criteria.",
    },
    {
      title: "Product teams adding AI",
      body: "Your existing application needs search, assistance or content-processing features.",
      use: "An integrated feature with evaluation, access controls and fallback behaviour.",
    },
    {
      title: "Operations teams working with data",
      body: "Decisions depend on scattered records or difficult-to-review datasets.",
      use: "A scoped data pipeline, analysis workflow or predictive model.",
    },
  ],
  deliverables: [
    "A defined AI use case with evaluation criteria and documented limitations.",
    "A model integration or data workflow connected to your application.",
    "A review dataset and repeatable checks for output quality.",
    "Access controls, human review points and fallback behaviour.",
    "Deployment documentation and an agreed monitoring approach.",
  ],
  process: [
    [
      "Check the use case",
      "Review the workflow, data access and consequences of incorrect output. You receive a feasibility assessment and evaluation plan.",
    ],
    [
      "Test a focused prototype",
      "Build a small prototype using representative inputs. You review outputs against agreed examples before expanding scope.",
    ],
    [
      "Integrate the workflow",
      "Connect models, retrieval and application systems. You review the feature in its actual business context.",
    ],
    [
      "Evaluate and safeguard",
      "Test quality, edge cases, permissions and fallback behaviour. You receive findings and the remaining limitations.",
    ],
    [
      "Deploy and monitor",
      "Release the agreed workflow with monitoring and handover notes. You agree ownership for review, updates and model changes.",
    ],
  ],
  technologies: [
    [
      "Application integration",
      "Select the API and application stack around the existing product.",
      ["Python", "Node.js"],
    ],
    [
      "Data & retrieval",
      "Choose storage and retrieval based on data access and the task.",
      ["PostgreSQL", "MongoDB"],
    ],
    [
      "Model & infrastructure",
      "Evaluate hosted models or custom training against quality, privacy and operating cost.",
      ["TensorFlow", "AWS", "Azure", "Google Cloud"],
    ],
  ],
  faqs: [
    [
      "How is AI automation different from rule-based automation?",
      "Rule-based automation follows explicit conditions. AI can interpret less structured input, but its output needs evaluation and appropriate review controls.",
    ],
    [
      "Do you use hosted models or build custom models?",
      "The approach depends on the task and available data. Hosted model integrations, retrieval and custom model work are evaluated against the use case rather than assumed at the outset.",
    ],
    [
      "Can AI work with our internal documents?",
      "Document access, formats, permissions and data-handling requirements need review first. Retrieval can be scoped so the application uses an approved source set.",
    ],
    [
      "How do you check AI output quality?",
      "Representative examples and acceptance criteria are defined before release. Evaluation includes incorrect output, missing information and cases that require human review.",
    ],
    [
      "How long does an AI integration take?",
      "A timeline follows the feasibility review. Data preparation, application integration, evaluation and approval requirements all affect delivery.",
    ],
    [
      "How are model costs managed?",
      "Expected usage, model choice and processing volume are estimated during scoping. Monitoring and limits can be included to make operating costs easier to review.",
    ],
  ],
};
const cloud: HubConfig = {
  path: "/cloud-services",
  name: "Cloud & DevOps",
  cluster: "Cloud & DevOps",
  service: "Cloud & DevOps",
  intro:
    "Netofficials provides cloud and DevOps services from India for businesses migrating applications, improving deployment and planning infrastructure. Review reliability, access, operating cost and the delivery workflow before choosing a platform.",
  facts: [
    "AWS · Azure · Google Cloud",
    "Infrastructure as code",
    "CI/CD pipelines",
    "Monitoring & runbooks",
  ],
  personas: [
    {
      title: "Teams with manual releases",
      body: "Deployments rely on repeated tasks and knowledge held by a few people.",
      use: "A documented delivery pipeline with agreed checks and rollback steps.",
    },
    {
      title: "Businesses moving to the cloud",
      body: "Existing workloads need a migration plan that accounts for data and downtime.",
      use: "An architecture and staged migration with validation checkpoints.",
    },
    {
      title: "Product teams preparing to grow",
      body: "Traffic, availability or operating costs are becoming harder to manage.",
      use: "An infrastructure review and a plan for capacity, monitoring and cost.",
    },
  ],
  deliverables: [
    "A target architecture with access, network and cost assumptions.",
    "Version-controlled infrastructure configuration where appropriate.",
    "Build and deployment pipelines with agreed release checks.",
    "Monitoring, alerting and operational runbooks.",
    "A migration or deployment handover with ownership and access documented.",
  ],
  process: [
    [
      "Assess the environment",
      "Review workloads, dependencies, access and operating issues. You receive an inventory and a prioritised set of changes.",
    ],
    [
      "Design the architecture",
      "Plan network, identity, deployment and cost considerations. You review a target architecture and migration assumptions.",
    ],
    [
      "Build infrastructure and pipelines",
      "Implement the agreed configuration and release automation. You review version-controlled changes and test deployments.",
    ],
    [
      "Migrate and validate",
      "Move or deploy workloads in agreed stages with validation and rollback planning. You review service behaviour before the change is accepted.",
    ],
    [
      "Monitor and hand over",
      "Configure agreed alerts, dashboards and runbooks. Your team receives operational documentation and ownership access.",
    ],
  ],
  technologies: [
    [
      "Cloud platforms",
      "Choose a provider around workloads, existing skills and operating requirements.",
      ["AWS", "Azure", "Google Cloud"],
    ],
    [
      "Containers & delivery",
      "Plan repeatable builds, deployments and orchestration where needed.",
      ["Docker", "Kubernetes"],
    ],
    [
      "Application & data",
      "Account for runtime and database dependencies in the architecture.",
      ["Node.js", "Python", "PostgreSQL"],
    ],
  ],
  faqs: [
    [
      "Which cloud platform should we choose?",
      "AWS, Azure and Google Cloud should be compared against your workloads, existing systems, team skills and cost requirements. A provider recommendation follows the environment review.",
    ],
    [
      "Can you migrate our existing servers?",
      "Migration starts with an assessment of workloads, data and dependencies. The plan defines validation, rollback and any expected downtime.",
    ],
    [
      "Can a migration avoid downtime?",
      "Downtime requirements need to be reviewed for each workload. Replication and staged cutovers may reduce disruption, but zero downtime is not assumed or guaranteed.",
    ],
    [
      "Do you work with existing deployment pipelines?",
      "Existing pipelines can be reviewed and improved. Build access, release checks, secrets management and rollback behaviour form part of the scope.",
    ],
    [
      "How are cloud operating costs estimated?",
      "Compute, storage, traffic and managed service usage are modelled using expected workload patterns. Actual costs depend on usage and the selected provider.",
    ],
    [
      "Is ongoing cloud support included?",
      "Ongoing monitoring and operational support require an agreed engagement. Responsibilities, coverage and escalation are defined separately from implementation.",
    ],
  ],
};
const software: HubConfig = {
  ...mobile,
  path: "/custom-software-development",
  name: "Custom Software Development",
  cluster: "Specialist Software",
  service: "Custom software & web applications",
  intro:
    "Netofficials provides custom software development services from India for businesses whose workflows need more than an off-the-shelf tool. Build a web application, SaaS product or internal system around your users, data and existing operations.",
  facts: [
    "Web applications",
    "SaaS & internal tools",
    "API integrations",
    "Modernisation",
  ],
  children: [
    "/web-application-development",
    "/saas-development-services",
    "/mvp-development-services",
    "/erp-development-services",
    "/crm-development-services",
    "/api-development-services",
    "/legacy-software-modernisation",
  ],
  personas: [
    {
      title: "Founders building a product",
      body: "Your first release needs to prove a focused customer workflow.",
      use: "A scoped MVP with an architecture that supports the next release.",
    },
    {
      title: "Businesses outgrowing spreadsheets",
      body: "Manual records and disconnected tools make work hard to track.",
      use: "An application built around roles, approvals and operational data.",
    },
    {
      title: "Teams modernising a system",
      body: "An existing application is difficult to maintain or connect.",
      use: "A reviewed codebase and a staged improvement or replacement plan.",
    },
  ],
  deliverables: [
    "A working application aligned with agreed user journeys.",
    "Data models, permissions and integrations documented for the team.",
    "A test and acceptance record for the agreed scope.",
    "Deployment configuration, source code and handover documentation.",
    "An agreed maintenance plan and clear ownership responsibilities.",
  ],
  process: [
    [
      "Define the business workflow",
      "Review users, existing systems and the work the application must support. You receive a scope with priorities and dependencies.",
    ],
    [
      "Design the application",
      "Plan user flows, data models, permissions and architecture. You review prototypes and technical decisions before development.",
    ],
    [
      "Build and integrate",
      "Develop in reviewable increments and connect agreed systems. You see working software and can check progress against the scope.",
    ],
    [
      "Test and accept",
      "Check behaviour, integrations and agreed non-functional requirements. You receive findings and an acceptance review.",
    ],
    [
      "Deploy and hand over",
      "Deploy the application and document access and operations. Your team receives the code, documentation and agreed next steps.",
    ],
  ],
  technologies: [
    [
      "Application interfaces",
      "Match the frontend to the experience and maintainability requirements.",
      ["React", "Next.js"],
    ],
    [
      "Backend & data",
      "Choose runtime and storage around workflows, integrations and the existing team.",
      ["Node.js", "Python", "PostgreSQL", "MongoDB"],
    ],
    [
      "Infrastructure",
      "Plan deployment, environments and release ownership alongside the application.",
      ["AWS", "Azure", "Docker"],
    ],
  ],
  faqs: [
    [
      "When should we choose custom software?",
      "Custom development is useful when an important workflow does not fit existing tools or needs specific integrations. Discovery should compare a custom build with configuration and off-the-shelf alternatives.",
    ],
    [
      "Can you integrate with our existing systems?",
      "Integration depends on available APIs, data access and vendor constraints. These dependencies are reviewed before the implementation estimate.",
    ],
    [
      "Can we start with an MVP?",
      "Yes, a first release can focus on a small set of important workflows. Later features are planned separately so the initial scope remains clear.",
    ],
    [
      "Can you modernise an existing application?",
      "An existing system can be reviewed for maintainability, dependencies and business risk. The plan may use incremental changes, a partial replacement or a rebuild.",
    ],
    [
      "What affects custom software development cost?",
      "Workflow complexity, integrations, data migration, testing and delivery constraints affect the estimate. Discovery clarifies the scope and assumptions before a budget is proposed.",
    ],
    [
      "Who owns the source code and access?",
      "Ownership, licensing and handover terms are agreed in the contract. Repository access and production credentials should be documented before delivery.",
    ],
  ],
};
const websites: HubConfig = {
  path: "/web-development",
  name: "Website Development",
  cluster: "Websites & eCommerce",
  service: "Website design & development",
  intro:
    "Netofficials provides website development services from India for businesses creating a company website, redesigning an existing site or opening an online store. Plan the content, user journeys and publishing workflow alongside the design and implementation.",
  facts: [
    "Business websites",
    "eCommerce stores",
    "Design & redesign",
    "Content & integrations",
  ],
  children: [
    "/web-design",
    "/website-redesign",
    "/ecommerce-development",
    "/ui-ux-design",
  ],
  personas: [
    {
      title: "Businesses updating their website",
      body: "The current site no longer explains your offer or supports customer enquiries.",
      use: "A revised content structure, page design and publishing workflow.",
    },
    {
      title: "Retailers building an online store",
      body: "Products, orders and customer communication need a connected online workflow.",
      use: "A storefront with agreed catalogue, checkout and operational integrations.",
    },
    {
      title: "Teams preparing a redesign",
      body: "An existing site needs clearer navigation or easier content maintenance.",
      use: "A redesign plan that accounts for existing pages, URLs and content ownership.",
    },
  ],
  deliverables: [
    "A responsive website built around agreed page layouts and content.",
    "A content-management workflow with roles and editing instructions.",
    "Forms, store functions and integrations included in the agreed scope.",
    "Page, device and browser checks before release.",
    "Deployment notes, access records and handover documentation.",
  ],
  process: [
    [
      "Review the site and content",
      "Review the offer, audience and existing pages. You receive a proposed structure and a list of content requirements.",
    ],
    [
      "Design key page layouts",
      "Design navigation and representative page layouts. You review the visual direction and user journeys before implementation.",
    ],
    [
      "Build pages and integrations",
      "Implement the templates, content management and agreed connections. You review working pages and editing workflows.",
    ],
    [
      "Check content and behaviour",
      "Check forms, links, responsive layouts and release requirements. You review the content and outstanding issues before launch.",
    ],
    [
      "Launch and hand over",
      "Publish the agreed website and document access and editing tasks. Your team receives the handover and support responsibilities.",
    ],
  ],
  technologies: [
    [
      "Website interfaces",
      "Select the frontend around content, performance and maintenance requirements.",
      ["React", "Next.js"],
    ],
    [
      "Content & commerce",
      "Review the existing platform and editing needs before selecting the CMS or storefront.",
      ["Content management", "Storefront platforms"],
    ],
    [
      "Integrations & hosting",
      "Plan forms, application connections and deployment with the website.",
      ["Node.js", "AWS", "Azure"],
    ],
  ],
  faqs: [
    [
      "Can you redesign our existing website?",
      "Yes, an existing site can be reviewed before a redesign is scoped. Content, URLs, integrations and publishing access are included in the review.",
    ],
    [
      "Do you develop eCommerce websites?",
      "Online stores can include catalogue, checkout and operational integrations. The platform and delivery scope depend on products, markets and existing business systems.",
    ],
    [
      "Can our team edit the content?",
      "Editing requirements are reviewed when the content-management platform is selected. Roles, page templates and handover instructions are agreed in the scope.",
    ],
    [
      "Will the website work on mobile devices?",
      "Responsive layouts and agreed browser checks form part of website implementation. Device coverage and any specialised requirements are defined before testing.",
    ],
    [
      "What affects website development cost?",
      "Page templates, content preparation, store features and integrations affect the estimate. A review of the required structure provides the basis for a proposal.",
    ],
    [
      "Can you retain our existing URLs?",
      "Existing URLs should be reviewed before migration. Retained pages and redirects can be included in the release plan to account for navigation and existing links.",
    ],
  ],
};
const seo: HubConfig = {
  path: "/seo-services",
  name: "SEO",
  cluster: "Search optimisation",
  service: "SEO",
  intro:
    "Netofficials provides SEO services from India for businesses improving how their website is found in search. Review technical issues, page content and search intent before prioritising changes, using available site and search-performance data.",
  facts: [
    "Technical SEO",
    "Local search",
    "eCommerce SEO",
    "Content & measurement",
  ],
  children: [
    "/technical-seo-services",
    "/local-seo-services",
    "/ecommerce-seo-services",
  ],
  personas: [
    {
      title: "Businesses with low search visibility",
      body: "Important services or products are difficult to find through search.",
      use: "An audit and a prioritised plan for technical and content changes.",
    },
    {
      title: "Businesses serving local customers",
      body: "Location information and relevant local pages need attention.",
      use: "A local-search review covering business information, pages and measurement.",
    },
    {
      title: "Stores with large product catalogues",
      body: "Category, product and filtering pages create indexing and content challenges.",
      use: "A plan for crawl behaviour, catalogue structure and page relevance.",
    },
  ],
  deliverables: [
    "An audit with evidence, affected URLs and prioritised recommendations.",
    "A page and keyword-intent map based on the agreed business scope.",
    "Technical changes or implementation briefs with validation notes.",
    "Content recommendations for relevant service, category or location pages.",
    "A reporting baseline and agreed measures for ongoing review.",
  ],
  process: [
    [
      "Review access and baseline",
      "Review website access, Search Console and available analytics. You receive a baseline and a list of missing information.",
    ],
    [
      "Audit technical and content issues",
      "Check indexing, structure and the relevance of important pages. You receive findings with affected URLs and priorities.",
    ],
    [
      "Agree the change plan",
      "Prioritise changes around business goals and implementation effort. You review the scope, owners and reporting measures.",
    ],
    [
      "Implement and validate",
      "Make agreed changes or work with your development team. You receive validation notes and a record of what changed.",
    ],
    [
      "Review performance",
      "Monitor agreed search and site measures over time. You review progress and decide which changes need further work.",
    ],
  ],
  technologies: [
    [
      "Search performance",
      "Use available search data to review indexing, queries and page visibility.",
      ["Google Search Console"],
    ],
    [
      "Site measurement",
      "Agree the reporting setup and enquiry measures before evaluating changes.",
      ["Google Analytics", "Tag management"],
    ],
    [
      "Technical review",
      "Select crawling and page-checking tools around the site and access available.",
      ["Site crawling", "Page performance", "Structured data validation"],
    ],
  ],
  faqs: [
    [
      "How long does SEO take to show results?",
      "The timing depends on the site, competition, changes and how search engines process them. A reporting baseline and review cadence are agreed, without guaranteeing a ranking or deadline.",
    ],
    [
      "Can you guarantee first-page rankings?",
      "No ranking position can be guaranteed. SEO work focuses on technical access, page relevance and measurable changes within the agreed scope.",
    ],
    [
      "What does technical SEO cover?",
      "Technical SEO reviews issues such as crawling, indexing, URL structure and page behaviour. Recommendations are prioritised using evidence from the actual site.",
    ],
    [
      "Do you work on local SEO?",
      "Local SEO can cover business information, relevant location pages and local-search measurement. The work depends on your locations and existing presence.",
    ],
    [
      "Can you optimise an eCommerce website?",
      "An eCommerce review can cover product and category pages, filtering, indexing and internal links. Platform constraints are considered before implementation.",
    ],
    [
      "How do you measure SEO enquiries?",
      "Search data and website analytics are reviewed together. Enquiry events and attribution need an agreed tracking setup before lead changes can be assessed.",
    ],
  ],
};
const ppc: HubConfig = {
  path: "/ppc-services",
  name: "PPC & Paid Search",
  cluster: "Paid search",
  service: "SEM & PPC",
  intro:
    "Netofficials provides PPC and paid-search services from India for businesses planning or reviewing search advertising. Connect campaign structure, landing pages and enquiry tracking before deciding how the budget should be used.",
  facts: [
    "Google Ads",
    "Campaign structure",
    "Landing-page review",
    "Conversion tracking",
  ],
  children: ["/google-ads-management"],
  personas: [
    {
      title: "Businesses starting paid search",
      body: "You need a campaign plan based on your offer, market and available budget.",
      use: "An account structure, keyword plan and tracking requirements.",
    },
    {
      title: "Teams reviewing an existing account",
      body: "Spend and enquiry data do not make campaign performance easy to assess.",
      use: "An account review with priorities and agreed reporting measures.",
    },
    {
      title: "Businesses improving enquiry quality",
      body: "Campaign clicks are reaching pages or audiences that do not fit the offer.",
      use: "A review of intent, search terms, landing pages and conversion measurement.",
    },
  ],
  deliverables: [
    "A campaign plan with targeting, budget assumptions and responsibilities.",
    "An account structure and ad copy for review before launch.",
    "A landing-page and conversion-tracking checklist.",
    "A change record for agreed account adjustments.",
    "Reporting that separates campaign spend, conversions and available lead-quality data.",
  ],
  process: [
    [
      "Review the offer and account",
      "Review the market, service or product offer and existing campaign data. You receive findings and the access needed for the work.",
    ],
    [
      "Plan campaigns and measurement",
      "Define targeting, account structure and enquiry measures. You review the proposed budget assumptions and reporting setup.",
    ],
    [
      "Prepare ads and landing pages",
      "Prepare agreed ad copy and check the destination pages. You review the campaigns and any landing-page changes before launch.",
    ],
    [
      "Launch and check",
      "Launch approved campaigns and verify tracking and account behaviour. You receive a record of the launch and initial checks.",
    ],
    [
      "Review and adjust",
      "Review search terms, spend and available conversion data. You agree adjustments based on campaign and lead-quality findings.",
    ],
  ],
  technologies: [
    [
      "Advertising",
      "Review the account setup and campaign scope for the chosen market.",
      ["Google Ads"],
    ],
    [
      "Conversion measurement",
      "Check event definitions and tracking before comparing campaign results.",
      ["Google Analytics", "Tag management"],
    ],
    [
      "Reporting & destinations",
      "Review landing-page behaviour and reporting access alongside campaign changes.",
      ["Landing pages", "Campaign reporting"],
    ],
  ],
  faqs: [
    [
      "How much advertising budget do we need?",
      "Budget depends on the market, offer and campaign scope. Expected costs and limitations are discussed before launch; advertising spend is separate from the service engagement.",
    ],
    [
      "Can you review an existing Google Ads account?",
      "Yes, a review can cover structure, search terms, ads, destinations and tracking. Access and the review scope are agreed before changes are made.",
    ],
    [
      "Do you guarantee leads or a return on ad spend?",
      "No lead volume or return is guaranteed. Results depend on the market, offer, budget, landing pages and how enquiries are handled.",
    ],
    [
      "Will you improve our landing pages?",
      "Landing-page recommendations can be included in the campaign review. Design and development work needs an agreed implementation scope.",
    ],
    [
      "How do you track conversions?",
      "Conversion events are defined around meaningful actions such as enquiries. Tracking access, consent requirements and validation are reviewed before reporting is used.",
    ],
    [
      "Who owns the advertising account?",
      "Account ownership and access responsibilities are agreed at the outset. Your business should retain control of its advertising accounts and payment settings.",
    ],
  ],
};
export const serviceHubs = [software, mobile, ai, cloud, websites, seo, ppc];
export const hubFor = (path: string) =>
  serviceHubs.find((h) => h.path === path);
// Pillar hubs list their pillar's pages from site-structure, in menu order.
// Sub-hubs (SEO, PPC) keep their own cluster and explicit children.
export const hubChildren = (hub: HubConfig) => {
  const pillar = pillars.find((p) => p.hub === hub.path);
  if (pillar)
    return pillarPages(pillar.id).flatMap((page) =>
      inventory.entries.filter((e) => e.url === page.path),
    );
  return inventory.entries.filter(
    (e) =>
      e.url !== hub.path &&
      (e.cluster === hub.cluster || !!hub.children?.includes(e.url)),
  );
};
export const plannedPage = (path: string) =>
  inventory.entries.find((e) => e.url === path);
export const technologyAsset: Record<string, string> = {
  Android: "android",
  iOS: "apple",
  React: "react",
  "Next.js": "nextdotjs",
  "Node.js": "nodedotjs",
  Python: "python",
  PostgreSQL: "postgresql",
  MongoDB: "mongodb",
  Kotlin: "kotlin",
  Swift: "swift",
  Flutter: "flutter",
  "React Native": "react",
  AWS: "aws",
  Azure: "azure",
  "Google Cloud": "googlecloud",
  Docker: "docker",
  Kubernetes: "kubernetes",
  TensorFlow: "tensorflow",
};
