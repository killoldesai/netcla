import type { Design, DesignNode } from "../content";

// Slot keys reuse the previous homepage keys wherever the meaning is unchanged,
// so copy already saved in the admin keeps rendering after the redesign.
// Defaults follow html-prototype/index.html. Slots that the redesign no longer
// renders (hero practice list, practice explore links, stack group names, the
// closing band that the site footer now carries) stay here so saved copy is kept.
export const homeTexts: Record<string, string> = {
  t0: "India-based engineering team · Clients in the US, UK and Australia",
  t1: "Custom software, AI, DevOps, cloud and mobile apps,",
  t2: "built by one team.",
  t4: "We build custom software, AI features, delivery pipelines, cloud infrastructure and iOS and Android apps for growing businesses. One engineering team, one delivery process, from first brief to production.",
  "home-49": "Start a Project",
  "hero-secondary": "See our services",
  "hero-prac-software": "Web apps, SaaS platforms and APIs",
  "hero-prac-ai": "LLM apps, chatbots and automation",
  "hero-prac-cloud": "AWS, Azure, DevOps and migration",
  "hero-prac-mobile": "iOS, Android, Flutter and React Native",

  "brief-title": "What do you need built?",
  "brief-sub":
    "Pick the closest match. We pre-fill the form so your first conversation starts further along.",
  "brief-opt-1": "Software",
  "brief-opt-2": "AI and automation",
  "brief-opt-3": "Cloud and DevOps",
  "brief-opt-4": "Mobile app",
  "brief-opt-5": "Not sure yet",
  "brief-note":
    "A short brief is enough. We reply with questions, a proposed scope and the team you need.",
  "brief-go": "Start my brief",

  "assure-label": "How every project is run",
  "assure-1-title": "Scope agreed first",
  "assure-1-text":
    "A scope summary, open questions and an initial estimate before the build starts.",
  "assure-2-title": "Review milestones",
  "assure-2-text":
    "Staging builds, progress reviews and test results at agreed points.",
  "assure-3-title": "Your time zone",
  "assure-3-text":
    "Communication window, meetings and update cadence set before work begins.",
  "assure-4-title": "Full handover",
  "assure-4-text":
    "Documentation and deployment access handed over at release.",

  "stack-title": "Technologies we work with",
  "home-228": "Technologies by practice",
  "home-65": "Custom software",
  "home-53": "Mobile apps",
  "home-67": "Cloud & DevOps",
  "home-68": "AI & data",

  "home-138": "What we build",
  "services-title-1": "Five practices,",
  "services-title-2": "one delivery team.",
  "home-4":
    "Start with the practice that matches your project. Each one has its own specialists, technologies and service pages, and they share one delivery process.",
  "hub-software-tag": "Custom software",
  t21: "Software development",
  t23: "Web applications, SaaS platforms, ERP and CRM systems and APIs, built on React, Node.js, Python and .NET. We plan the build around your users, workflows and the systems it has to connect to.",
  "home-158": "Explore Custom Software",
  "svc-software-cta": "Discuss a software project",
  "hub-mobile-tag": "Mobile applications",
  t35: "Mobile app development",
  t37: "Native iOS and Android apps, plus cross-platform builds in Flutter and React Native, chosen around your users, device features, release plan and maintenance budget.",
  "home-198": "Explore Mobile Apps",
  "svc-mobile-cta": "Discuss a mobile app",
  "home-201": "AI and automation",
  "stripe-ai-title": "AI development",
  "stripe-ai-body":
    "LLM integrations, chatbots grounded in your own content, document processing and machine learning models. We start with one specific task, check the data you have and decide where a person reviews the output.",
  "home-212": "Explore AI & Automation",
  "svc-ai-cta": "Discuss an AI project",
  "svc-devops-tag": "DevOps",
  "svc-devops-title": "DevOps and CI/CD",
  "svc-devops-body":
    "CI/CD pipelines, containers and Infrastructure as Code with Terraform and Kubernetes, so every release follows the same tested path.",
  "svc-devops-cta": "Discuss a DevOps project",
  "home-22": "Cloud & DevOps",
  "svc-cloud-tag": "Cloud",
  "stripe-cloud-title": "Cloud services",
  "stripe-cloud-body":
    "AWS, Azure and Google Cloud architecture and migration, built around the application you need to run and the team that will operate it.",
  "home-225": "Explore Cloud & DevOps",
  "svc-cloud-cta": "Discuss a cloud project",

  "home-244": "More services",
  "home-245": "Design, web, QA and marketing",
  "home-246": "services when your project needs them.",
  "home-247": "UI / UX Design",
  "home-248":
    "Product interfaces, user journeys and prototypes that clarify what needs to be built.",
  "home-259": "Quality & Security Planning",
  "home-260":
    "Testing, access controls and the checks your application needs before release.",
  "home-263": "Digital Transformation",
  "home-264":
    "Review manual processes, existing systems and the integrations your next stage requires.",
  "home-267": "Hire Developers",
  "home-268":
    "Dedicated engineers matched to your stack, responsibilities and way of working.",
  t63: "eCommerce Development",
  t65: "Storefronts, product catalogs and integrations for your online sales workflow.",
  "home-254": "SEO & Paid Search",
  "home-255":
    "Organic and paid search services to support your website’s customer acquisition.",

  "home-287": "How we work",
  "home-288": "From brief to release,",
  "home-289": "with agreed review milestones.",
  "delivery-lead":
    "You know what you get at each stage before it starts, and you review it before the next one begins.",
  "home-290": "Discovery",
  "home-291":
    "Requirements, users, existing systems and constraints. We agree the initial scope and the questions that need further investigation.",
  "deliver-label": "You receive",
  "deliver-1": "Scope summary · Open questions · Initial estimate",
  "home-292": "Design & Architecture",
  "home-293":
    "User flows, interfaces, data structures and API requirements, reviewed with you before development begins.",
  "deliver-2": "User flows · Interface designs · Architecture notes",
  "home-294": "Development & Review",
  "home-295":
    "Work through agreed priorities with review milestones, an update cadence and acceptance criteria.",
  "deliver-3": "Staging builds · Progress reviews · Test results",
  "home-296": "Deploy & Support",
  "home-297":
    "Production release, handover and the ongoing support your application needs, agreed in the project scope.",
  "deliver-4": "Production release · Documentation · Access handover",

  "home-271": "Why Netofficials",
  "home-272": "An India-based team.",
  "home-273": "A project planned",
  "home-274": "around your business.",
  "home-275":
    "Agree delivery scope, communication and collaboration before choosing your development partner.",
  "home-278": "Scope",
  "home-279": "Compare the complete project",
  "home-280":
    "Review deliverables, responsibilities and ongoing costs when comparing proposals. A useful budget starts with a clear scope.",
  "home-281": "Overlap",
  "home-282": "Agree your communication window",
  "home-283":
    "Time zone, meeting schedule and update cadence are set before work begins, so collaboration expectations are clear.",
  "home-284": "Team",
  "home-285": "Match skills to the work",
  "home-286":
    "The stack, experience and roles your application requires, and how the team will work with your business.",

  "home-314": "Engagement models",
  "home-315": "Choose how we work together.",
  "home-316": "project requires.",
  "home-317":
    "Dedicated engineers who work with your tools, priorities and development process. Availability and engagement terms are confirmed during the enquiry.",
  "engage-1-title": "Project delivery",
  "engage-1-body": "A defined scope, review milestones and handover.",
  "engage-1-best": "Best for a new product or a clearly bounded build",
  "engage-2-title": "Dedicated team",
  "engage-2-body": "A team that works on your roadmap over time.",
  "engage-2-best": "Best for ongoing product development",
  "engage-3-title": "Team extension",
  "engage-3-body": "Individual developers who join your existing team.",
  "engage-3-best": "Best when you need specific skills quickly",
  "model-1-cta": "Scope my project",
  "model-2-cta": "Plan a team",
  "model-3-cta": "Discuss hiring",
  "model-compare": "Compare models",
  "home-348": "Discuss your hiring requirements",
  "home-350": "Explore developer roles",
  "roles-eyebrow": "Hire by role",
  "roles-title": "Find the developer your roadmap needs.",
  "roles-all": "See all developer roles",
  "role-group-1-sub": "Interfaces and client apps",
  "role-group-2-sub": "APIs, services and data",
  "role-group-3-sub": "iOS, Android and cross-platform",
  "role-group-4-sub": "Infrastructure, pipelines and models",
  "roles-note":
    "Availability and engagement terms are confirmed during the enquiry.",

  "home-298": "Industries",
  "home-299": "Start with your industry’s",
  "home-300": "workflows and constraints.",
  "home-301":
    "The users, data and operating requirements your application needs to support.",
  "home-302": "Healthcare & MedTech",
  "home-13": "Patient & care workflows",
  "home-303": "Fintech & Payments",
  "home-14": "Transactions & financial tools",
  "home-304": "EdTech & E-Learning",
  "home-15": "Learning & course platforms",
  "home-305": "Real Estate & PropTech",
  "home-16": "Property & sales workflows",
  "home-306": "Logistics & Supply Chain",
  "home-17": "Orders, routes & operations",
  "home-307": "On-Demand Platforms",
  "home-19": "Booking & service delivery",
  "home-308": "Retail & eCommerce",
  "home-20": "Catalogs & connected commerce",
  "home-309": "Travel & Hospitality",
  "home-21": "Reservations & guest experiences",
  "home-310": "LegalTech",
  "home-23": "Documents & matter management",
  "home-311": "HR Tech & Workforce",
  "home-24": "People & workforce tools",
  "home-312": "InsurTech",
  "home-25": "Policies & claims workflows",
  "home-313": "Manufacturing & IoT",
  "home-26": "Production & connected systems",

  "home-0": "Project work",
  "home-353": "Review the work.",
  "home-354": "Agree what success means.",
  "home-1": "Published case studies from completed projects.",

  "faq-eyebrow": "Questions",
  "faq-title":
    "Questions about our software, AI, DevOps, cloud and mobile work.",
  "faq-cta": "Ask us directly",
  "faq-1-q": "How does a software, AI, cloud or mobile project start?",
  "faq-1-a":
    "Send a short brief through the form. We follow up to discuss your users, existing systems and constraints, then agree an initial scope and the questions that need further investigation.",
  "faq-2-q": "Can you work alongside our existing team?",
  "faq-2-a":
    "Yes. Dedicated developers can work with your tools, priorities and development process. Roles, availability and engagement terms are confirmed during the enquiry.",
  "faq-3-q": "How do you handle time-zone differences?",
  "faq-3-a":
    "The team is based in India. Before work begins we agree a communication window, meeting schedule and update cadence that suits your time zone.",
  "faq-4-q": "What do we receive at handover?",
  "faq-4-a":
    "Handover is planned in the project scope. It covers documentation, deployment access and the ongoing responsibilities your team needs.",
  "faq-5-q": "Can you add AI features to software we already run?",
  "faq-5-a":
    "Yes. We start with one task, such as search over your documents, drafting replies or extracting data from forms, check what data exists and connect the feature to your product through its API. Where the output affects customers, a person reviews it before it is used.",
  "faq-6-q": "Which cloud platforms and mobile frameworks do you work with?",
  "faq-6-a":
    "AWS, Azure and Google Cloud for infrastructure, with Docker, Kubernetes and Terraform. For mobile we build native iOS apps in Swift, native Android apps in Kotlin, and cross-platform apps in Flutter or React Native.",

  "cta-title": "Ready to scope your project?",
  "cta-title-2": "Tell us what you need built.",
  "cta-body":
    "Share a short brief. We reply with questions, a proposed scope and the team your project needs.",
  "cta-primary": "Start a Project",
  "cta-secondary": "Explore services",

  "home-368": "Project enquiry",
  "contact-title-1": "Your project.",
  "contact-title-2": "Our next conversation.",
  "home-369":
    "Share your goal, your existing systems and any constraints. A short brief is enough to start the conversation.",
  "next-title": "What happens next",
  "next-1": "We read your brief and reply to arrange a conversation.",
  "next-2": "We discuss your users, systems and constraints.",
  "next-3": "You receive a proposed scope and next steps.",
  "home-370": "Required: name, email, service and project goal.",
  "home-371": "Country and timeline are optional.",
  "form-optional": "optional",
  "form-email-hint": "We only use it to reply to you.",
  t172: "Tell us about your project.",
  t173: "A short brief is a good place to start.",
  "home-164": "Your name",
  t175: "Work email",
  t176: "What do you need?",
  t177: "Choose a service",
  t13: "Custom software",
  "home-129": "Website design & development",
  t49: "Web application development",
  "home-130": "Mobile application development",
  t182: "SEO",
  t183: "SEM & PPC",
  t184: "Development + marketing",
  t185: "Help defining the scope",
  "home-48": "AI & business automation",
  "service-cloud": "Cloud & DevOps",
  t186: "Country",
  t187: "Timeline",
  t188: "Select a timeline",
  t189: "As soon as possible",
  t190: "Within 1 to 3 months",
  t191: "Exploring options",
  t192: "Your project or business goal",
  t193: "Discuss my project",
  t195: "Design preview: this form does not send enquiries.",
};

// Search title for the homepage; they lead with the four priority practices.
export const homeMeta = {
  title: "Software, AI, Cloud & Mobile App Development | Netofficials",
  description:
    "Custom software, AI, cloud and mobile app development from an India-based team serving businesses in the US, UK and Australia. Tell us what you need built.",
};

export const serviceOptions = [
  "t13",
  "home-129",
  "t49",
  "home-130",
  "t182",
  "t183",
  "t184",
  "t185",
  "home-48",
  "service-cloud",
];
export const timelineOptions = ["t189", "t190", "t191"];

const formFields = [
  "t172",
  "t173",
  "home-164",
  "t175",
  "t176",
  "t177",
  ...serviceOptions,
  "t186",
  "t187",
  "t188",
  ...timelineOptions,
  "t192",
  "t193",
  "t195",
  "form-optional",
  "form-email-hint",
];

export const blockFields = new Set([
  "t4",
  "home-4",
  "t23",
  "t37",
  "stripe-ai-body",
  "stripe-cloud-body",
  "home-248",
  "home-260",
  "home-264",
  "home-268",
  "t65",
  "home-255",
  "home-291",
  "home-293",
  "home-295",
  "home-297",
  "home-275",
  "home-280",
  "home-283",
  "home-286",
  "home-317",
  "engage-1-body",
  "engage-2-body",
  "engage-3-body",
  "home-301",
  "home-1",
  "faq-1-a",
  "faq-2-a",
  "faq-3-a",
  "faq-4-a",
  "faq-5-a",
  "faq-6-a",
  "home-369",
  "cta-body",
  "brief-note",
  "delivery-lead",
  "assure-1-text",
  "assure-2-text",
  "assure-3-text",
  "assure-4-text",
  "svc-devops-body",
  "roles-note",
]);

type HomeSection = {
  id: string;
  label: string;
  fields: string[];
  required?: boolean;
};
const keys = (prefix: string) =>
  Object.keys(homeTexts).filter((k) => k.startsWith(prefix));
export const homeSections: HomeSection[] = [
  {
    id: "hero",
    label: "Hero",
    required: true,
    fields: [
      "t0",
      "t1",
      "t2",
      "t4",
      "home-49",
      "hero-secondary",
      ...keys("hero-prac-"),
    ],
  },
  {
    id: "brief",
    label: "What do you need built? (brief strip)",
    fields: [
      "brief-title",
      "brief-sub",
      ...keys("brief-opt-"),
      "brief-note",
      "brief-go",
    ],
  },
  { id: "assurance", label: "Assurance row", fields: keys("assure-") },
  {
    id: "section-1",
    label: "Technology strip",
    fields: [
      "home-228",
      "stack-title",
      "home-65",
      "home-53",
      "home-67",
      "home-68",
    ],
  },
  {
    id: "services",
    label: "Five practices",
    fields: [
      "home-138",
      "services-title-1",
      "services-title-2",
      "home-4",
      ...keys("svc-"),
      "hub-software-tag",
      "t21",
      "t23",
      "home-158",
      "hub-mobile-tag",
      "t35",
      "t37",
      "home-198",
      "home-201",
      "stripe-ai-title",
      "stripe-ai-body",
      "home-212",
      "home-22",
      "stripe-cloud-title",
      "stripe-cloud-body",
      "home-225",
    ],
  },
  {
    id: "supporting-services",
    label: "More services",
    fields: [
      "home-244",
      "home-245",
      "home-246",
      "home-247",
      "home-248",
      "home-259",
      "home-260",
      "home-263",
      "home-264",
      "home-267",
      "home-268",
      "t63",
      "t65",
      "home-254",
      "home-255",
    ],
  },
  {
    id: "delivery",
    label: "How we work",
    fields: [
      "home-287",
      "home-288",
      "home-289",
      "delivery-lead",
      "deliver-label",
      "home-290",
      "home-291",
      "deliver-1",
      "home-292",
      "home-293",
      "deliver-2",
      "home-294",
      "home-295",
      "deliver-3",
      "home-296",
      "home-297",
      "deliver-4",
    ],
  },
  {
    id: "india",
    label: "Why Netofficials",
    fields: [
      "home-271",
      "home-272",
      "home-273",
      "home-274",
      "home-275",
      "home-278",
      "home-279",
      "home-280",
      "home-281",
      "home-282",
      "home-283",
      "home-284",
      "home-285",
      "home-286",
    ],
  },
  {
    id: "hire",
    label: "Engagement models and developer roles",
    fields: [
      "home-314",
      "home-315",
      "home-316",
      "home-317",
      ...keys("engage-"),
      ...keys("model-"),
      "home-348",
      "home-350",
      ...keys("roles-"),
      ...keys("role-group-"),
    ],
  },
  {
    id: "industries",
    label: "Industries",
    fields: [
      "home-298",
      "home-299",
      "home-300",
      "home-301",
      "home-302",
      "home-13",
      "home-303",
      "home-14",
      "home-304",
      "home-15",
      "home-305",
      "home-16",
      "home-306",
      "home-17",
      "home-307",
      "home-19",
      "home-308",
      "home-20",
      "home-309",
      "home-21",
      "home-310",
      "home-23",
      "home-311",
      "home-24",
      "home-312",
      "home-25",
      "home-313",
      "home-26",
    ],
  },
  {
    id: "work",
    label: "Published case studies",
    fields: ["home-0", "home-353", "home-354", "home-1"],
  },
  { id: "faq", label: "Questions", fields: keys("faq-") },
  {
    id: "cta",
    label: "Closing call to action (site footer)",
    fields: keys("cta-"),
  },
  {
    id: "contact",
    label: "Project enquiry",
    required: true,
    fields: [
      "home-368",
      "contact-title-1",
      "contact-title-2",
      "home-369",
      ...keys("next-"),
      "home-370",
      "home-371",
      ...formFields,
    ],
  },
];

export const hubs = [
  {
    id: "software",
    anchor: "software",
    tag: "hub-software-tag",
    title: "t21",
    body: "t23",
    explore: "home-158",
    service: "Custom software",
    parent: "/custom-software-development",
    links: [
      ["Web Apps", "/web-application-development"],
      ["SaaS Development", "/saas-development-services"],
      ["MVP Build", "/mvp-development-services"],
      ["Enterprise Software", "/enterprise-software-development"],
      ["API Development", "/api-development-services"],
      ["ERP & CRM", "/erp-development-services"],
    ],
  },
  {
    id: "ai",
    anchor: "ai",
    tag: "home-201",
    title: "stripe-ai-title",
    body: "stripe-ai-body",
    explore: "home-212",
    service: "AI & business automation",
    parent: "/ai-development-services",
    links: [
      ["Generative AI", "/generative-ai-development"],
      ["LLM Development", "/llm-development-services"],
      ["AI Chatbots", "/ai-chatbot-development"],
      ["AI Integration", "/ai-integration-services"],
      ["Process Automation", "/ai-automation-services"],
      ["Machine Learning", "/machine-learning-development"],
    ],
  },
  {
    id: "cloud",
    anchor: "cloud-devops",
    tag: "home-22",
    title: "stripe-cloud-title",
    body: "stripe-cloud-body",
    explore: "home-225",
    service: "Cloud & DevOps",
    parent: "/cloud-services",
    links: [
      ["AWS Services", "/aws-services"],
      ["Azure Services", "/azure-services"],
      ["Google Cloud", "/google-cloud-services"],
      ["Cloud Migration", "/cloud-migration-services"],
      ["DevOps & CI/CD", "/devops-services"],
      ["Kubernetes", "/kubernetes-services"],
    ],
  },
  {
    id: "mobile",
    anchor: "mobile-ai",
    tag: "hub-mobile-tag",
    title: "t35",
    body: "t37",
    explore: "home-198",
    service: "Mobile application development",
    parent: "/mobile-app-development",
    links: [
      ["iOS Apps", "/ios-app-development"],
      ["Android Apps", "/android-app-development"],
      ["Flutter", "/flutter-app-development"],
      ["React Native", "/react-native-app-development"],
      ["Cross-platform", "/cross-platform-app-development"],
      ["On-Demand Apps", "/on-demand-app-development"],
    ],
  },
] as const;

export const supporting = [
  { title: "home-247", body: "home-248", path: "/ui-ux-design", hub: "design" },
  {
    title: "home-259",
    body: "home-260",
    path: "/software-testing-services",
    hub: "quality",
  },
  {
    title: "home-263",
    body: "home-264",
    path: "/digital-transformation-services",
    hub: "transformation",
  },
  {
    title: "home-267",
    body: "home-268",
    path: "/hire-developers",
    hub: "team",
  },
  {
    title: "t63",
    body: "t65",
    path: "/ecommerce-development",
    hub: "web",
    service: "Website design & development",
  },
  {
    title: "home-254",
    body: "home-255",
    path: "/seo-services",
    hub: "search",
    service: "SEO",
  },
] as const satisfies readonly {
  title: string;
  body: string;
  path: string;
  hub: string;
  service?: string;
}[];

export const steps = [
  ["home-290", "home-291", "deliver-1"],
  ["home-292", "home-293", "deliver-2"],
  ["home-294", "home-295", "deliver-3"],
  ["home-296", "home-297", "deliver-4"],
] as const;

export const stack = [
  [
    "home-65",
    ["React", "Next.js", "Node.js", "Python", "TypeScript", "PostgreSQL"],
  ],
  ["home-68", ["LLM APIs", "TensorFlow", "MongoDB"]],
  [
    "home-67",
    ["AWS", "Azure", "Google Cloud", "Kubernetes", "Docker", "Terraform"],
  ],
  ["home-53", ["Flutter", "Swift", "Kotlin", "React Native"]],
] as const;

// Where a technology has its own service page, the chip links to it.
export const stackLinks: Record<string, string> = {
  React: "/react-development-services",
  "Next.js": "/nextjs-development-services",
  "Node.js": "/nodejs-development-services",
  Python: "/python-development-services",
  TypeScript: "/typescript-development-services",
  PostgreSQL: "/postgresql-development-services",
  "LLM APIs": "/llm-development-services",
  MongoDB: "/mongodb-development-services",
  AWS: "/aws-services",
  Azure: "/azure-services",
  "Google Cloud": "/google-cloud-services",
  Kubernetes: "/kubernetes-services",
  Docker: "/docker-containerisation-services",
  Terraform: "/terraform-infrastructure-services",
  Flutter: "/flutter-app-development",
  Swift: "/swift-app-development",
  Kotlin: "/kotlin-app-development",
  "React Native": "/react-native-app-development",
};

export const indiaPoints = [
  ["home-278", "home-279", "home-280"],
  ["home-281", "home-282", "home-283"],
  ["home-284", "home-285", "home-286"],
] as const;

export const roleGroups = [
  [
    "Frontend",
    [
      ["React Developer", "/hire-react-developer"],
      ["Next.js Developer", "/hire-nextjs-developer"],
      ["UI/UX Designer", "/hire-ui-ux-designer"],
    ],
  ],
  [
    "Backend",
    [
      ["Node.js Developer", "/hire-nodejs-developer"],
      ["Python Developer", "/hire-python-developer"],
      ["Laravel Developer", "/hire-laravel-developer"],
      ["Django Developer", "/hire-django-developer"],
      ["Full Stack Developer", "/hire-full-stack-developer"],
    ],
  ],
  [
    "Mobile",
    [
      ["Flutter Developer", "/hire-flutter-developer"],
      ["iOS Developer", "/hire-ios-developer"],
      ["Android Developer", "/hire-android-developer"],
    ],
  ],
  [
    "Cloud, data & AI",
    [
      ["DevOps Engineer", "/hire-devops-engineer"],
      ["AWS Developer", "/hire-aws-developer"],
      ["AI/ML Developer", "/hire-ai-ml-developer"],
      ["Data Scientist", "/hire-data-scientist"],
    ],
  ],
] as const;

export const industries = [
  ["home-302", "home-13", "shield-check"],
  ["home-303", "home-14", "chart-bar"],
  ["home-304", "home-15", "brain-circuit"],
  ["home-305", "home-16", "layers-stack"],
  ["home-306", "home-17", "cloud-upload"],
  ["home-307", "home-19", "mobile-device"],
  ["home-308", "home-20", "api-plug"],
  ["home-309", "home-21", "rocket-launch"],
  ["home-310", "home-23", "document-text"],
  ["home-311", "home-24", "users-group"],
  ["home-312", "home-25", "shield-check"],
  ["home-313", "home-26", "settings-gear"],
] as const;

export const faqs = [1, 2, 3, 4, 5, 6].map(
  (n) => [`faq-${n}-q`, `faq-${n}-a`] as const,
);

const slotNode = (slot: string): DesignNode =>
  blockFields.has(slot) ? { tag: "div", children: [{ slot }] } : { slot };

// Downstream tooling (public field filtering, rich-text block detection and
// FAQ structured data) walks design nodes, so the homepage exposes a flat
// node tree describing its slots even though React components render it.
function homeNodes(): DesignNode[] {
  return homeSections.map((section) => ({
    tag: "section",
    attrs: { "data-section": section.id },
    children:
      section.id === "faq"
        ? [
            slotNode("faq-eyebrow"),
            slotNode("faq-title"),
            ...faqs.map(([q, a]) => ({
              tag: "details",
              children: [
                { tag: "summary", children: [{ slot: q }] },
                slotNode(a),
              ],
            })),
          ]
        : section.fields.map(slotNode),
  }));
}

export function homeDesign(base: Design): Design {
  return {
    ...base,
    styles: [],
    nodes: homeNodes(),
    texts: homeTexts,
    sections: homeSections,
    protectedFields: [...formFields, "t0", "home-272"],
  };
}
