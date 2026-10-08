import fs from "node:fs";
import { load } from "cheerio";

// Retain the established enquiry schema and validation attributes.
const target = "homepage-concept/software-led.html";
const previous = load(fs.readFileSync(target, "utf8"));
const form = previous("form.form").first().toString();
const arrow = '<span aria-hidden="true">→</span>';
const link = (label: string, href: string, extra = "") =>
  `<a href="${href}" data-published-link="true" ${extra}>${label} ${arrow}</a>`;
const cta = (
  label = "Start a Project",
  service = "",
  hub = "general",
  style = "",
) =>
  `<a class="button ${style}" href="#contact" data-track="consultation_click" data-hub="${hub}" ${service ? `data-service="${service}"` : ""}>${label} ${arrow}</a>`;
const icons: Record<string, string> = {
  software:
    '<rect x="5" y="8" width="38" height="32" rx="3"/><path d="m18 20-7 5 7 5m12-10 7 5-7 5M27 17l-6 16"/>',
  mobile:
    '<rect x="13" y="3" width="22" height="42" rx="4"/><path d="M20 9h8m-6 29h4"/>',
  ai: '<circle cx="24" cy="24" r="8"/><circle cx="7" cy="9" r="3"/><circle cx="41" cy="9" r="3"/><circle cx="7" cy="39" r="3"/><circle cx="41" cy="39" r="3"/><path d="m10 12 8 7m12 0 8-7M10 36l8-7m12 0 8 7"/>',
  cloud:
    '<path d="M13 32a10 10 0 1 1 1-20 12 12 0 0 1 22 4 8 8 0 0 1-1 16H13Z"/><path d="M24 23v19m-6-6 6 6 6-6"/>',
  web: '<rect x="5" y="7" width="38" height="34" rx="3"/><path d="M5 16h38M13 25h22M13 32h14"/>',
  search:
    '<circle cx="21" cy="21" r="13"/><path d="m31 31 12 12M14 25l5-6 5 3 5-8"/>',
  design: '<path d="M7 9h27v30H7zM14 17h13M14 24h13M14 31h8M34 18h7v21h-7"/>',
  quality:
    '<path d="M24 4 40 10v12c0 10-8 18-16 22C16 40 8 32 8 22V10L24 4Z"/><path d="m16 23 6 6 11-13"/>',
  team: '<circle cx="17" cy="16" r="7"/><path d="M4 41v-7a13 13 0 0 1 26 0v7M32 10a7 7 0 0 1 0 14m4 5a11 11 0 0 1 8 12"/>',
  health: '<path d="M18 7h12v11h11v12H30v11H18V30H7V18h11V7Z"/>',
  finance:
    '<path d="m5 15 19-11 19 11H5Zm4 5v17m10-17v17m10-17v17m10-17v17M5 43h38M8 37h32"/>',
  education:
    '<path d="M24 12v30M24 12C18 7 9 6 4 9v29c6-3 14-2 20 4 6-6 14-7 20-4V9c-5-3-14-2-20 3Z"/>',
  building:
    '<path d="M9 43V7h24v36M33 23h8v20M4 43h40M16 15h10m-10 8h10m-10 8h10m-7 12V36h5"/>',
  logistics:
    '<path d="M4 12h25v24H4V12Zm25 10h9l6 9v5H29V22Z"/><circle cx="12" cy="37" r="5"/><circle cx="36" cy="37" r="5"/>',
  demand:
    '<circle cx="24" cy="24" r="19"/><path d="M24 11v14l10 7M5 24h5m28 0h5"/>',
  retail: '<path d="M8 16h32l3 27H5l3-27ZM16 16v-5a8 8 0 0 1 16 0v5"/>',
  travel:
    '<path d="m5 25 15 3 17 15 5-3-9-16 10-12-3-3-13 8L12 7 8 12l11 12-14 1Z"/>',
  legal:
    '<path d="M24 5v38M14 43h20M8 13h32M10 13 4 29h12l-6-16Zm28 0-6 16h12l-6-16Z"/>',
  insurance:
    '<path d="M5 24a19 19 0 0 1 38 0H5Zm19 0v13a6 6 0 0 0 12 0M24 5v-2"/>',
  factory:
    '<path d="M6 43V23l12-8v9l12-8v27H6ZM30 23h12v20M34 23V5h7v18M12 33h4m6 0h4m8 0h4"/>',
};
const icon = (name: string) =>
  `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? icons.software}</svg>`;
const heading = (label: string, title: string, body = "") =>
  `<div class="section-head"><div class="eyebrow">${label}</div><h2>${title}</h2>${body ? `<p class="section-intro">${body}</p>` : ""}</div>`;
const hubs = [
  {
    id: "software",
    tag: "Custom Software",
    title: "Custom Software<br>Development",
    body: "Web applications, SaaS platforms and enterprise tools, built around your users, workflows and integration requirements.",
    service: "Custom software",
    parent: "/custom-software-development",
    label: "Explore Custom Software",
    slots: ["t21", "t23"],
    pills: [
      ["Web Apps", "/web-application-development"],
      ["SaaS Development", "/saas-development-services"],
      ["MVP Build", "/mvp-development-services"],
      ["Enterprise Software", "/enterprise-software-development"],
      ["API Development", "/api-development-services"],
    ],
  },
  {
    id: "mobile",
    tag: "Mobile Applications",
    title: "Mobile App<br>Development",
    body: "Native iOS and Android applications, plus Flutter and React Native builds. Choose the platform around your users, features and maintenance needs.",
    service: "Mobile application development",
    parent: "/mobile-app-development",
    label: "Explore Mobile Apps",
    slots: ["t35", "t37"],
    pills: [
      ["iOS Apps", "/ios-app-development"],
      ["Android Apps", "/android-app-development"],
      ["Flutter", "/flutter-app-development"],
      ["React Native", "/react-native-app-development"],
      ["On-Demand Apps", "/on-demand-app-development"],
    ],
  },
  {
    id: "ai",
    tag: "AI & Automation",
    title: "AI & Process<br>Automation",
    body: "LLM integrations, knowledge assistants and process automation. Start with a specific task, review the available data and define where human oversight belongs.",
    service: "AI & business automation",
    parent: "/ai-development-services",
    label: "Explore AI & Automation",
    slots: ["stripe-ai-title", "stripe-ai-body"],
    pills: [
      ["AI Chatbots", "/ai-chatbot-development"],
      ["LLM Integration", "/ai-integration-services"],
      ["Process Automation", "/ai-automation-services"],
      ["Computer Vision", "/computer-vision-services"],
      ["Data Science", "/data-science-services"],
    ],
  },
  {
    id: "cloud",
    tag: "Cloud & DevOps",
    title: "Cloud & DevOps<br>Engineering",
    body: "Cloud infrastructure, deployment pipelines and Infrastructure as Code. Plan AWS, Azure or Google Cloud around the application you need to run.",
    service: "Cloud & DevOps",
    parent: "/cloud-services",
    label: "Explore Cloud & DevOps",
    slots: ["stripe-cloud-title", "stripe-cloud-body"],
    pills: [
      ["AWS Services", "/aws-services"],
      ["Azure Services", "/azure-services"],
      ["Kubernetes", "/kubernetes-services"],
      ["CI/CD Pipelines", "/devops-services"],
      ["Terraform", "/infrastructure-as-code"],
    ],
  },
];
const hubHTML = hubs
  .map(
    (h, index) =>
      `<details class="hub-card service-disclosure" data-hub="${h.id}" id="${h.id === "mobile" ? "mobile-ai" : h.id === "cloud" ? "cloud-devops" : h.id}" ${index === 0 ? "open" : ""}><summary><div class="service-icon">${icon(h.id)}</div><h3 data-copy-slot="${h.slots[0]}">${h.title.replace("<br>", " ")}</h3><span class="disclosure-toggle" aria-hidden="true"></span></summary><div class="service-expanded"><p data-copy-slot="${h.slots[1]}">${h.body}</p><div class="hub-directory"><div class="pill-directory">${h.pills.map(([label, href]) => link(label, href, `data-unpublished-text="true" data-track="service_hub_click" data-hub="${h.id}"`)).join("")}</div><div class="hub-actions">${link(h.label, h.parent, `data-track="service_hub_click" data-hub="${h.id}"`)}${cta("Discuss your project", h.service, h.id, "text-button")}</div></div></div></details>`,
  )
  .join("");
const technologies = [
  ["React", "react"],
  ["Next.js", "nextdotjs"],
  ["Node.js", "nodedotjs"],
  ["Python", "python"],
  ["Flutter", "flutter"],
  ["Swift", "swift"],
  ["Kotlin", "kotlin"],
  ["AWS", "aws"],
  ["Azure", "azure"],
  ["GCP", "googlecloud"],
  ["Kubernetes", "kubernetes"],
  ["Docker", "docker"],
  ["TensorFlow", "tensorflow"],
  ["PostgreSQL", "postgresql"],
  ["MongoDB", "mongodb"],
];
const secondary = [
  [
    "UI / UX Design",
    "Product interfaces, user journeys and prototypes that clarify what needs to be built.",
    "/ui-ux-design",
    "design",
    "",
    "",
  ],
  [
    "eCommerce Development",
    "Storefronts, product catalogs and integrations for your online sales workflow.",
    "/ecommerce-development",
    "web",
    "web",
    "Website design & development",
  ],
  [
    "SEO & Paid Search",
    "Organic and paid search services to support your website’s customer acquisition.",
    "/seo-services",
    "search",
    "search",
    "SEO",
  ],
  [
    "Quality & Security Planning",
    "Discuss testing, access controls and the checks your application needs before release.",
    "/software-testing-services",
    "quality",
    "",
    "",
  ],
  [
    "Digital Transformation",
    "Review manual processes, existing systems and the integrations your next stage requires.",
    "/digital-transformation-services",
    "ai",
    "",
    "",
  ],
  [
    "Hire Developers",
    "Discuss the role, stack, responsibilities and collaboration your project requires.",
    "/hire-developers",
    "team",
    "",
    "",
  ],
];
const secondaryHTML = [...secondary]
  .sort(
    (a, b) =>
      ["design", "quality", "ai", "team", "web", "search"].indexOf(a[3]) -
      ["design", "quality", "ai", "team", "web", "search"].indexOf(b[3]),
  )
  .map(
    ([title, body, path, ic, hub, service]) =>
      `<article class="secondary-card ${hub ? "hub-card hub-compact" : ""}" ${hub ? `data-hub="${hub}"` : ""}><div class="secondary-icon">${icon(ic)}</div><h3 ${hub === "web" ? 'data-copy-slot="t63"' : ""}>${title}</h3><p ${hub === "web" ? 'data-copy-slot="t65"' : ""}>${body}</p>${link("Learn more", path, `data-track="service_hub_click" data-hub="${hub || ic}"`)}${cta(service ? "Discuss your project" : "Talk about your requirements", service || "Help defining the scope", hub || ic, "text-button")}</article>`,
  )
  .join("");
const industries = [
  ["Healthcare & MedTech", "Patient & care workflows", "health"],
  ["Fintech & Payments", "Transactions & financial tools", "finance"],
  ["EdTech & E-Learning", "Learning & course platforms", "education"],
  ["Real Estate & PropTech", "Property & sales workflows", "building"],
  ["Logistics & Supply Chain", "Orders, routes & operations", "logistics"],
  ["On-Demand Platforms", "Booking & service delivery", "demand"],
  ["Retail & eCommerce", "Catalogs & connected commerce", "retail"],
  ["Travel & Hospitality", "Reservations & guest experiences", "travel"],
  ["LegalTech", "Documents & matter management", "legal"],
  ["HR Tech & Workforce", "People & workforce tools", "team"],
  ["InsurTech", "Policies & claims workflows", "insurance"],
  ["Manufacturing & IoT", "Production & connected systems", "factory"],
];
const roles = [
  ["React Developer", "/hire-react-developer"],
  ["Node.js Developer", "/hire-nodejs-developer"],
  ["Python Developer", "/hire-python-developer"],
  ["Flutter Developer", "/hire-flutter-developer"],
  ["iOS Developer", "/hire-ios-developer"],
  ["Android Developer", "/hire-android-developer"],
  ["Next.js Developer", "/hire-nextjs-developer"],
  ["Laravel Developer", "/hire-laravel-developer"],
  ["Django Developer", "/hire-django-developer"],
  ["DevOps Engineer", "/hire-devops-engineer"],
  ["AWS Developer", "/hire-aws-developer"],
  ["AI/ML Developer", "/hire-ai-developer"],
  ["UI/UX Designer", "/hire-ui-ux-designer"],
  ["Full Stack Developer", "/hire-full-stack-developer"],
  ["Data Scientist", "/hire-data-scientist"],
];
const process = [
  [
    "01",
    "Discovery",
    "Discuss requirements, users, existing systems and constraints. Agree the initial scope and the questions that need further investigation.",
  ],
  [
    "02",
    "Design & Architecture",
    "Define user flows, interfaces, data structures and API requirements. Review the approach before development begins.",
  ],
  [
    "03",
    "Development & Review",
    "Work through agreed priorities with review milestones. Set the update cadence, testing responsibilities and acceptance criteria.",
  ],
  [
    "04",
    "Deploy & Support",
    "Plan the production release, handover and ongoing support requirements. Agree responsibilities and support terms in the project scope.",
  ],
];
const projectFinder = `<div class="project-finder"><div class="finder-controls"><div class="eyebrow">Your next step</div><div class="finder-sign" aria-hidden="true">↗</div><h2>A good build starts<br>with a conversation.</h2><div class="finder-tabs" role="tablist" aria-label="Choose your project starting point"><button type="button" role="tab" id="goal-product" aria-label="Build a product" data-project-goal="product" aria-controls="panel-product">Build a product</button><button type="button" role="tab" id="goal-modernize" aria-label="Improve a system" data-project-goal="modernize" aria-controls="panel-modernize">Improve a system</button><button type="button" role="tab" id="goal-team" aria-label="Add developers" data-project-goal="team" aria-controls="panel-team">Add developers</button></div></div><div class="finder-panel" role="tabpanel" id="panel-product" aria-labelledby="goal-product" data-project-panel="product"><div><h3>Turn your idea into a buildable product.</h3><p>Start with your users, essential features and the first version you need to launch. Discuss software, mobile or a combination of both.</p></div>${cta("Let’s plan your project", "Custom software", "project-finder-product", "finder-cta")}</div><div class="finder-panel" role="tabpanel" id="panel-modernize" aria-labelledby="goal-modernize" data-project-panel="modernize"><div><h3>Make your existing systems work better together.</h3><p>Review manual work, API integrations, aging applications and cloud requirements. Define what to improve before deciding what to replace.</p></div>${cta("Discuss your system", "Custom software", "project-finder-modernize", "finder-cta")}</div><div class="finder-panel" role="tabpanel" id="panel-team" aria-labelledby="goal-team" data-project-panel="team"><div><h3>Bring the right development skills into your project.</h3><p>Tell us about your stack, current team and responsibilities. Discuss the roles, collaboration and engagement your project requires.</p></div>${cta("Discuss your team", "Help defining the scope", "project-finder-team", "finder-cta")}</div></div>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Netofficials — Custom Software, Mobile Apps & AI Development</title><link rel="stylesheet" href="stripe-home.css"><link rel="stylesheet" href="brand-home.css"></head><body><main><div class="stripe-home connected-home">
<section class="stripe-hero" data-section="hero" aria-labelledby="hero-title"><div class="stripe-wrap"><div class="hero-grid"><div class="hero-copy"><div class="hero-pill" data-copy-slot="t0">YOUR DEVELOPMENT PARTNER · BASED IN INDIA</div><h1 id="hero-title"><span data-copy-slot="t1">Software built for</span><br><span data-copy-slot="t2">the way you work.</span><br><span class="accent" data-copy-slot="t3">Software · Mobile · AI · Cloud</span></h1><p class="hero-intro" data-copy-slot="t4">Build a custom application, launch a mobile product or connect the systems behind your business. Bring us the problem. We’ll help define the build.</p><div class="cta-row">${cta()}<a class="button outline" href="#work">See Our Work ${arrow}</a></div></div><figure class="hero-art product-art" aria-label="Conceptual illustration of a connected business application"><svg viewBox="0 0 640 560" fill="none" aria-hidden="true"><path d="M100 432H542V133" stroke="#dbe1ee" stroke-width="2"/><circle cx="542" cy="133" r="8" fill="#b5ce20"/><rect x="68" y="102" width="470" height="340" rx="12" fill="#182138"/><rect x="82" y="146" width="442" height="282" rx="4" fill="#fff"/><circle cx="89" cy="124" r="4" fill="#f18b72"/><circle cx="104" cy="124" r="4" fill="#cfdb77"/><circle cx="119" cy="124" r="4" fill="#8593d4"/><path d="M153 124H241" stroke="#78829b" stroke-width="4"/><rect x="82" y="146" width="86" height="282" fill="#f0f2f8"/><rect x="99" y="167" width="49" height="7" rx="3" fill="#4353b3"/><path d="M99 199H143M99 225H137M99 251H145M99 277H131" stroke="#bcc4d5" stroke-width="5"/><rect x="190" y="168" width="142" height="9" rx="4" fill="#182138"/><rect x="190" y="190" width="100" height="5" rx="2" fill="#adb7ca"/><rect x="190" y="222" width="306" height="126" rx="8" fill="#f0f2f8"/><path d="M211 321L252 293L284 306L321 266L353 280L399 246L471 239" stroke="#4353b3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="399" cy="246" r="6" fill="#b5ce20"/><path d="M190 374H283M190 391H258M355 374H448M355 391H422" stroke="#c5cddd" stroke-width="6" stroke-linecap="round"/><rect x="459" y="277" width="129" height="230" rx="19" fill="#4353b3"/><rect x="467" y="286" width="113" height="212" rx="13" fill="#fff"/><rect x="499" y="292" width="49" height="6" rx="3" fill="#182138"/><circle cx="523" cy="347" r="24" fill="#b5ce20"/><path d="M512 347L520 354L535 339" stroke="#182138" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="483" y="389" width="81" height="8" rx="4" fill="#dde2ee"/><rect x="483" y="410" width="66" height="6" rx="3" fill="#dde2ee"/><rect x="483" y="446" width="81" height="25" rx="5" fill="#4353b3"/><rect x="22" y="356" width="144" height="62" rx="10" fill="#b5ce20"/><path d="M40 387L50 397L68 377" stroke="#182138" stroke-width="3" stroke-linecap="round"/><path d="M84 380H144M84 394H124" stroke="#52630c" stroke-width="5" stroke-linecap="round"/><rect x="389" y="59" width="152" height="66" rx="10" fill="#f18b72"/><path d="M409 80H446M409 100H486" stroke="#8e4230" stroke-width="5" stroke-linecap="round"/><circle cx="514" cy="91" r="11" stroke="#8e4230" stroke-width="3"/></svg></figure></div></div></section>
<section class="stripe-section stripe-wrap" id="services"><div class="services-lead">${heading("What we build", "What does your<br>next build need?")}<div class="services-note"><p>Build a new product, connect your systems or improve the software you already run. Start with the part your business needs most.</p>${cta("Find the right service", "Help defining the scope", "service-directory", "text-button")}</div></div><div class="primary-grid">${hubHTML}</div>${projectFinder}</section>
<section class="technology-band"><div class="stripe-wrap"><div class="technology-heading"><div>${heading("Technologies we work with", "The right tools.<br>For the right reasons.")}</div><p>Choose the stack around your users, integrations and long-term maintenance. Bring your current technology or start with a new build.</p></div><div class="technology-groups">${[
  ["Web & backend", [0, 1, 2, 3]],
  ["Mobile", [4, 5, 6]],
  ["Cloud & infrastructure", [7, 8, 9, 10, 11]],
  ["Data & AI", [12, 13, 14]],
]
  .map(
    ([label, ids]) =>
      `<div class="technology-family"><h3>${label}</h3><div class="technology-logos">${(
        ids as number[]
      )
        .map((i) => {
          const [name, id] = technologies[i];
          return `<div class="technology-logo"><img src="/assets/technologies/${id}.svg" alt="" loading="lazy" width="36" height="36">${id === "aws" ? "" : `<span>${name}</span>`}</div>`;
        })
        .join("")}</div></div>`,
  )
  .join("")} </div></div></section>
<section class="stripe-section stripe-wrap" id="supporting-services">${heading("Also in our scope", "The work around<br>the product.")}<div class="secondary-grid">${secondaryHTML}</div></section>
<section class="india-band" id="india"><div class="stripe-wrap india-grid"><div>${heading("Why India. Why Netofficials.", "Different time zones.<br>A shared project plan.", "Work with an India-based development team. Agree the scope, communication window and responsibilities before the project begins.")}<div class="collaboration-track"><div>${icon("building")}<span>Your business</span></div><span class="track-line" aria-hidden="true"></span><div>${icon("software")}<span>Shared project plan</span></div><span class="track-line" aria-hidden="true"></span><div>${icon("team")}<span>India-based team</span></div></div><a class="button outline" href="#delivery">How we work ${arrow}</a></div><div class="india-stats"><article><strong>Scope</strong><div><h3>Compare the complete project</h3><p>Review deliverables, responsibilities and ongoing costs when comparing proposals. A useful budget starts with a clear scope.</p></div></article><article><strong>Overlap</strong><div><h3>Agree your communication window</h3><p>Discuss your time zone, meeting schedule and update cadence. Set practical expectations for collaboration before work begins.</p></div></article><article><strong>Team</strong><div><h3>Match skills to the work</h3><p>Discuss the stack, experience and roles your application requires. Agree how the team will work with your business.</p></div></article></div></div></section>
<section class="stripe-section stripe-wrap" id="delivery">${heading("How we work", "A process you can follow.<br>Progress you can review.")}<div class="delivery-map"><div class="process-nav" role="group" aria-label="Explore the delivery process">${process.map(([n, title], i) => `<button type="button" data-step="${["discover", "define", "develop", "launch"][i]}" id="process-button-${["discover", "define", "develop", "launch"][i]}" aria-controls="process-panel-${["discover", "define", "develop", "launch"][i]}"><span class="stage-circle">${icon(["search", "design", "software", "cloud"][i])}</span><span class="stage-title"><span class="stage-count">${n}</span>${title}</span></button>`).join("")}</div><div class="process-detail">${process.map(([n, title, body], i) => `<div class="process-panel" role="region" id="process-panel-${["discover", "define", "develop", "launch"][i]}" aria-labelledby="process-button-${["discover", "define", "develop", "launch"][i]}" data-process-panel="${["discover", "define", "develop", "launch"][i]}"><div><div class="eyebrow">${["Understand the problem", "Agree the direction", "Build and review", "Prepare the release"][i]}</div><h3>${title}</h3><p>${body}</p></div><div class="process-output"><span>Define together</span><strong>${["Users, priorities & project scope", "User flows, interfaces & architecture", "Review milestones & acceptance criteria", "Deployment, handover & support scope"][i]}</strong></div></div>`).join("")}</div><div class="review-loop"><span aria-hidden="true">↶</span> Review, test and refine throughout the build.</div></div></section>
<section class="stripe-section stripe-wrap" id="industries">${heading("Industries", "Built for the realities<br>of your industry.", "A booking platform, a patient workflow and a financial application have different demands. Start with your users, data and day-to-day operations.")}<div class="featured-industries">${[
  0, 1, 4,
]
  .map((i) => {
    const [name, detail, ic] = industries[i];
    return `<article class="industry-feature">${icon(ic)}<h3>${name}</h3><p>${detail}</p><span class="industry-use">${i === 0 ? "Appointments · Care teams · Patient journeys" : i === 1 ? "Transactions · Reporting · Financial workflows" : "Orders · Routes · Operational visibility"}</span></article>`;
  })
  .join("")}</div><div class="industry-grid">${industries
  .filter((_, i) => ![0, 1, 4].includes(i))
  .map(
    ([name, detail, ic]) =>
      `<div>${icon(ic)}<span>${name}<small>${detail}</small></span></div>`,
  )
  .join(
    "",
  )}</div><div class="industry-invitation"><p>Your industry has its own requirements. Start there.</p>${cta("Tell us about your industry", "Help defining the scope", "industries", "text-button")}</div></section>
<section class="hire-band" id="hire"><div class="stripe-wrap">${heading("Hire dedicated developers", "Your stack.<br>The right development skills.", "Bring development skills into your existing team or plan a dedicated project team. Tell us about your stack and responsibilities; we’ll discuss the right engagement.")}<div class="hiring-options"><article>${icon("team")}<div><h3>Extend your team</h3><p>Add specific development skills to your existing tools and process.</p></div></article><article>${icon("software")}<div><h3>Plan a dedicated team</h3><p>Define the roles, responsibilities and engagement around your roadmap.</p></div></article></div><div class="role-grid">${[
  ["Frontend & experience", [0, 6, 12]],
  ["Backend & applications", [1, 2, 7, 8, 13]],
  ["Mobile development", [3, 4, 5]],
  ["Cloud, data & AI", [9, 10, 11, 14]],
]
  .map(
    ([label, ids]) =>
      `<div class="role-family"><h3>${label}</h3>${(ids as number[])
        .map((i) => {
          const [name, path] = roles[i];
          return link(
            name,
            path,
            'data-unpublished-text="true" data-enquiry-fallback="true" data-service="Help defining the scope"',
          );
        })
        .join("")}</div>`,
  )
  .join(
    "",
  )}</div><div class="role-fallback">${cta("Discuss your hiring requirements", "Help defining the scope", "hire", "outline")}${link("Explore developer roles", "/hire-developers")}</div></div></section>
<section class="stripe-section stripe-wrap" id="work">${heading("Project work", "Look beyond the final screen.", "Review the problem, the decisions and the delivery behind a build. Discuss relevant examples during your project consultation.")}<div class="proof-grid"></div><div class="work-review"><div class="work-review-lead"><div class="work-document" aria-hidden="true">${icon("design")}</div><h3>What makes a<br>project worth reviewing?</h3><p>A useful example explains the original need, what was built and how the work was handed over.</p>${cta("Discuss a similar project", "Help defining the scope", "project-work", "text-button")}</div><div class="delivery-promises feedback-grid"><article><div class="review-icon">${icon("search")}</div><div><h3>The business problem</h3><p>Users, workflows and the constraints that shaped the scope.</p></div></article><article><div class="review-icon">${icon("software")}</div><div><h3>The technical decisions</h3><p>Platforms, integrations and the approach chosen for the application.</p></div></article><article><div class="review-icon">${icon("quality")}</div><div><h3>The delivery and handover</h3><p>Review milestones, acceptance criteria and ongoing responsibilities.</p></div></article></div></div></section>
<section id="contact" data-section="contact"><div class="stripe-wrap enquiry-grid stripe-section"><div>${heading("Project enquiry", "Start with<br>your project.", "Share your goal, your existing systems and any constraints. A short brief is enough to start the conversation.")}<p class="enquiry-note">Required: name, email, service and project goal.<br>Country and timeline are optional.</p></div>${form}</div></section>
</div></main></body></html>`;
fs.writeFileSync(target, html);
fs.copyFileSync(
  "public/assets/stripe-home.css",
  "homepage-concept/stripe-home.css",
);
fs.copyFileSync(
  "public/assets/brand-home.css",
  "homepage-concept/brand-home.css",
);
console.log(
  "Stripe-token homepage built with neutral claims and existing enquiry form.",
);




