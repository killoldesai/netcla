# Cursor Prompt — Main Services Page (`/services`)

This is the top-level services hub page that lists every service cluster and routes buyers to the right section. It sits one level above individual cluster hub pages.

---

```
Using the design tokens defined in stripe.md, build the main Services page at /services for Netofficials — an India-based software development and digital marketing company.

This page has one job: help buyers quickly identify which service cluster matches their need and route them to the right hub page. It is a navigation and SEO hub, not a sales page. Keep copy short and scannable.

---

BUILD THESE SECTIONS IN ORDER:

§ 01 — HERO
- Breadcrumb: Home > Services
- H1: "Software Development, Mobile, AI and Digital Marketing Services"
- Subheadline (22px): "Every service Netofficials offers — from custom software and mobile apps to AI automation, cloud infrastructure and SEO — in one place."
- No CTA buttons in the hero — the page itself is the navigation
- Below headline: 3 anchor jump links styled as pill tags linking to the three service groups on this page:
  - "Build & Engineer ↓" → jumps to §03
  - "Hire Developers ↓" → jumps to §05
  - "Grow & Market ↓" → jumps to §07

---

§ 02 — SERVICE GROUP INTRO STRIP
- Full-width strip, 3 equal columns, dividers between
- Each column: large number + label + 1-line description
  - Column 1: "10 clusters" / "Build & Engineer" / "Custom software, mobile, AI, cloud and specialist development services"
  - Column 2: "32 roles" / "Hire Developers" / "Dedicated engineers, designers and DevOps specialists placed in your team"
  - Column 3: "3 services" / "Grow & Market" / "SEO, Google Ads and eCommerce search marketing"

---

§ 03 — BUILD & ENGINEER (primary service clusters)
Section label: "Build & Engineer"
Section heading: "What we build"
Section body: "End-to-end software development across web, mobile, AI and cloud — from MVP to enterprise scale."

Below heading: a full-width grid of service cluster cards. Each card links to its hub page.

CARD 1 — Custom Software Development → /custom-software-development
- Tag: "Core"
- Heading: "Custom Software Development"
- Body: "Bespoke web applications, SaaS platforms, internal tools and enterprise software built to your exact requirements."
- Sub-links (text links, comma separated): Web Apps · SaaS · MVP Build · Enterprise Software · Digital Transformation
- CTA link: "Explore →"

CARD 2 — Mobile App Development → /mobile-app-development
- Tag: "Core"
- Heading: "Mobile App Development"
- Body: "Native iOS and Android apps plus Flutter and React Native cross-platform builds for consumer and enterprise products."
- Sub-links: iOS · Android · Flutter · React Native · On-Demand Apps
- CTA link: "Explore →"

CARD 3 — AI & Machine Learning → /ai-development-services
- Tag: "High demand"
- Heading: "AI & Machine Learning"
- Body: "LLM integrations, custom AI agents, ML model development, computer vision, NLP and process automation."
- Sub-links: AI Chatbots · LLM Integration · Process Automation · Computer Vision · Data Science
- CTA link: "Explore →"

CARD 4 — Cloud & DevOps → /cloud-devops-services
- Tag: "Core"
- Heading: "Cloud & DevOps Engineering"
- Body: "AWS, Azure and GCP infrastructure, Kubernetes, CI/CD pipelines, Terraform IaC and cloud migration services."
- Sub-links: AWS · Azure · GCP · Kubernetes · Terraform · CI/CD
- CTA link: "Explore →"

CARD 5 — UI / UX Design → /ui-ux-design-services
- Tag: "Design"
- Heading: "UI / UX Design"
- Body: "Figma-based design systems, UX research, wireframing, prototyping and interaction design for web and mobile products."
- Sub-links: Product Design · Design Systems · UX Research · Wireframing · Prototyping
- CTA link: "Explore →"

CARD 6 — eCommerce Development → /ecommerce-development
- Heading: "eCommerce Development"
- Body: "Shopify, WooCommerce and Magento stores plus custom eCommerce platforms for high-volume or complex catalogues."
- Sub-links: Shopify · WooCommerce · Magento · Custom eCommerce
- CTA link: "Explore →"

CARD 7 — Specialist Software → /specialist-software-development
- Heading: "Specialist Software"
- Body: "Blockchain, IoT, AR/VR, cybersecurity and API development for products that go beyond standard web and mobile."
- Sub-links: Blockchain · IoT · AR/VR · Cybersecurity · API Development
- CTA link: "Explore →"

---

§ 04 — TECHNOLOGY STACK INDEX
Section label: "Tech stack"
Section heading: "32 technologies. One team."
Section body: "We work across the full modern stack. Click any technology to see the dedicated service page."

Display all 24 tech stack pages as pill links grouped under 5 headings:

Frontend: React.js · Next.js · Angular · Vue.js · TypeScript
Backend: Node.js · Python · PHP · Java · .NET · Django · Laravel · Go
Mobile: Flutter · React Native · Swift · Kotlin
eCommerce & CMS: WordPress · Shopify · Magento · WooCommerce
Data & Infrastructure: GraphQL · MongoDB · PostgreSQL · Docker · Terraform

Each pill links to its tech stack page (e.g. React.js → /react-development-services).

---

§ 05 — HIRE DEVELOPERS
Section label: "Hire Developers"
Section heading: "Dedicated developers placed in your team."
Section body: "Engineers who work inside your sprint cycle, on your tools, under your direction. 32 roles available."

THREE ENGAGEMENT MODEL CARDS (equal columns):

Card 1 — Dedicated Development Team → /dedicated-development-team
- Heading: "Dedicated Development Team"
- Body: "A full team — developers, designer, QA — working exclusively for you. Same standups. Same Jira. Same Slack."
- Best for: "Product companies and startups building long-term"

Card 2 — Staff Augmentation → /it-staff-augmentation  
- Heading: "Staff Augmentation"
- Body: "Individual engineers placed inside your existing team. You manage them directly."
- Best for: "Teams with a specific skill gap to fill"

Card 3 — Offshore Development Centre → /offshore-software-development
- Heading: "Offshore Development Centre"
- Body: "Your India-based engineering office. Fully managed, fully yours."
- Best for: "Companies replacing expensive in-house headcount"

Below the 3 cards — ROLE GRID:
Label: "Browse roles"
5-column pill grid of all 32 hire pages — each pill links to its hire page:
React Developer · Node.js Developer · Python Developer · PHP Developer · Laravel Developer · Django Developer · Java Developer · .NET Developer · Go Developer · Flutter Developer · React Native Developer · iOS Developer · Android Developer · Mobile App Developer · Full Stack Developer · Frontend Developer · Backend Developer · WordPress Developer · Shopify Developer · WooCommerce Developer · Magento Developer · DevOps Engineer · AWS Developer · AI/ML Developer · Blockchain Developer · UI/UX Designer · Web Designer · Data Scientist · Angular Developer · Vue.js Developer · Next.js Developer · QA Engineer
"View all roles with details →" ghost button below grid

---

§ 06 — SOFTWARE SOLUTIONS INDEX
Section label: "Solutions"
Section heading: "By what you're trying to achieve."
Section body: "Not every buyer starts with a technology. These solution pages are organised by business goal."

Display as a 3-column list of linked items. Each item: name + 1-line description.

- SaaS Development → /saas-development-services — "Build a cloud SaaS product with multi-tenancy, billing and analytics"
- MVP Development → /mvp-development-services — "Validate your product idea in 4–8 weeks"
- Startup Software → /startup-software-development — "Engineering partner for pre-seed to Series A founders"
- Enterprise Software → /enterprise-software-development — "Large-scale custom software with SSO, RBAC and ERP integration"
- Digital Transformation → /digital-transformation-services — "Replace manual processes and legacy systems with modern software"
- Legacy Modernisation → /legacy-software-modernisation — "Rehost, replatform or rebuild outdated systems"
- Product Development → /product-development-services — "End-to-end product build from discovery to launch"
- Software Outsourcing → /software-outsourcing-services — "Offshore your software development to a senior India team"
- Software Consulting → /software-consulting-services — "Architecture review, code audit and CTO advisory"
- Proof of Concept → /proof-of-concept-development — "Technical feasibility validated in 2–4 weeks"
- White Label Software → /white-label-software-development — "Rebrandable software products you can resell"
- Offshore Development → /offshore-software-development — "60–75% cost saving vs US or UK in-house hiring"

---

§ 07 — GROW & MARKET
Section label: "Grow & Market"
Section heading: "SEO, paid search and eCommerce marketing."
Section body: "The same team that builds your website can also rank it and run your paid campaigns."

4 cards (equal grid):

Card 1 — SEO Services → /seo-services
- Heading: "SEO Services"
- Body: "Technical SEO, on-page, link building and content SEO to grow organic traffic."

Card 2 — Technical SEO → /technical-seo-services
- Heading: "Technical SEO"
- Body: "Core Web Vitals, crawlability, schema markup and site architecture — fixed by the same team that built the site."

Card 3 — Google Ads Management → /google-ads-management
- Heading: "Google Ads Management"
- Body: "Search, Performance Max, Display and Shopping campaign management with monthly ROAS reporting."

Card 4 — eCommerce SEO → /ecommerce-seo-services
- Heading: "eCommerce SEO"
- Body: "Product page SEO, category optimisation, schema markup and platform-specific Shopify and WooCommerce SEO."

---

§ 08 — INDUSTRY VERTICALS
Section label: "Industries"
Section heading: "Industry-specific experience across 12 verticals."
Section body: "Software built for your sector's compliance requirements, workflows and buyer expectations."

4×3 grid. Each cell: industry name + 1-line description + link to vertical page.

- Healthcare → /healthcare-software-development — "EHR, telemedicine, patient portals. HIPAA compliant."
- Fintech → /fintech-software-development — "Payment platforms, neobanking, KYC/AML. PCI DSS aware."
- EdTech → /edtech-software-development — "LMS, virtual classrooms, assessment tools. SCORM compliant."
- Real Estate → /real-estate-software-development — "Property portals, CRM, PMS. MLS/IDX integration."
- Logistics → /logistics-software-development — "Fleet management, route optimisation, last-mile tracking."
- On-Demand → /on-demand-app-development — "Ride hailing, food delivery, home services. 3-panel app architecture."
- Retail → /retail-software-development — "eCommerce, POS, inventory, omnichannel."
- Travel → /travel-software-development — "OTA platforms, hotel management, GDS integration."
- LegalTech → /legaltech-software-development — "Contract management, case management, e-signature."
- HR Tech → /hrtech-software-development — "HRMS, ATS, payroll, performance management."
- InsurTech → /insurtech-software-development — "Policy management, claims automation, telematics."
- Manufacturing → /manufacturing-software-development — "MES, QMS, ERP integration, Industrial IoT."

---

§ 09 — CTA
- Heading: "Not sure which service fits your project?"
- Sub: "Book a free 30-minute discovery call. We'll scope the right approach and give you an honest recommendation."
- Two CTAs: "Book a Discovery Call" + "See How We Work →" (links to /how-we-work)

---

GLOBAL RULES:
- Every service name, technology name and industry name must be a working href link to its page
- This is a navigation-first page — body copy is short (1–2 sentences per card), never long paragraphs
- No decorative content — every element either navigates, informs or converts
- Page schema: use WebPage + ItemList schema for the service index sections
- Meta title: "Software Development, Mobile, AI & Cloud Services | Netofficials"
- Meta description: "Custom software, mobile apps, AI automation, cloud DevOps, eCommerce and SEO services from an India-based senior engineering team."
```
