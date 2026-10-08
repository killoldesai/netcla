# Service Hub Page — Content Structure

> Applies to any cluster hub: `/mobile-app-development`, `/ai-development-services`, `/cloud-devops`, `/custom-software-development`, etc.

---

## § 01 — Hero

- Breadcrumb: Services > [Cluster Name]
- H1: [Service Cluster Name] Services
- 2–3 sentence opening: what Netofficials builds in this category, who it's for, primary keyword in sentence one
- Two CTAs: "Start a Project" + "View Related Work"
- 3–4 trust micro-stats relevant to this cluster
  - Example for Mobile: `50+ apps shipped · iOS & Android · Flutter & React Native · 4–12 week delivery`
  - Example for AI: `15+ AI products shipped · LLM · ML · Automation · GPT-4 & Claude integrations`

---

## § 02 — Service Index

**Label:** Services in this category

- One sentence intro on how the sub-services connect
- Grid of sub-service cards — one card per child page in this cluster
- Each card contains:
  - Service name (links to child page)
  - 2-sentence description
  - Primary use case
  - "Learn more →" link

> This is the primary internal linking section. Every child page in the cluster gets a card here.

---

## § 03 — Who This Is For

- 3 buyer personas as short blocks
- Each persona:
  - Job title or situation
  - The specific problem they bring
  - What Netofficials delivers for them
- Example for AI cluster:
  - Founders automating a manual workflow
  - Product teams adding AI features to an existing app
  - Enterprises replacing rule-based systems with ML models

---

## § 04 — What We Deliver

**Label:** What you get

- 4–6 concrete deliverables relevant to this cluster
- Written as outcomes, not capability lists
- Example format: "A production-ready [X] with documentation, CI/CD pipeline and 30-day post-launch support"

---

## § 05 — Process

- 4–5 numbered steps scoped to this specific service category
- Not the generic homepage process — steps that reflect what actually happens in this cluster
- Example for Cloud & DevOps:
  1. Assessment — audit current infrastructure, identify bottlenecks and security gaps
  2. Architecture Design — propose cloud architecture, IaC approach, cost model
  3. Infrastructure as Code — Terraform or CDK build, peer-reviewed
  4. Migration or Build — zero-downtime migration or greenfield deployment
  5. Monitoring & Handover — alerting, dashboards, runbooks, team handover
- Each step: name + 2 sentences (what happens + what the client sees)

---

## § 06 — Technology Stack

**Label:** Technologies we use

- Technologies grouped by role
  - Example for Mobile: Frontend / Backend / Testing / DevOps
  - Example for AI: Models / Frameworks / Data / Infrastructure
- Listed as named items (logo chips or text — whichever is available)
- One sentence per group explaining why these choices fit this category

---

## § 07 — Engagement Models

**Label:** How to work with us

- 3 options presented for this cluster:
  - **Project-Based** — what it means for this specific service + "Best for:"
  - **Dedicated Team** — what it means for this specific service + "Best for:"
  - **Staff Augmentation** — what it means for this specific service + "Best for:"
- Link to `/engagement-models` for full detail

---

## § 08 — Industry Applications

**Label:** Industries where we apply this

- 4–6 industries relevant to this cluster (not all 12 — only genuine applications)
- Each entry:
  - Industry name
  - One sentence on the specific type of work done in this industry
  - Link to the corresponding industry vertical page

---

## § 09 — Related Case Studies

- 2–3 project cards
- Each card:
  - Service tag (this cluster)
  - Industry tag
  - Project outcome — 1 sentence
  - "View project →" link
- If no published case studies yet: use project type + outcome format without client names

---

## § 10 — FAQ

- 5–7 questions scoped to this cluster specifically
- Not generic — cluster-specific questions buyers actually search
  - Example for Mobile: "How long does a Flutter app take to build?" / "Do you build for iOS and Android in one project?" / "Can you take over an existing app codebase?"
  - Example for AI: "What is the difference between AI automation and RPA?" / "Do you use OpenAI or build custom models?" / "How long does an AI integration take?"
- FAQ schema markup on every Q+A — eligible for People Also Ask SERP features

---

## § 11 — Related Services

**Label:** Often combined with

- 3–4 links to related clusters or sub-services buyers typically need alongside this one
- Each entry: service name + one-line reason the pairing is common
- Example for Mobile:
  - UI/UX Design — mobile apps require mobile-native UX design before development starts
  - API Development — most mobile apps need a backend API to power data and authentication
  - Cloud & DevOps — mobile backends need scalable cloud infrastructure and CI/CD for app releases

---

## § 12 — CTA

- Heading specific to this cluster: "Ready to build your [mobile app / AI system / cloud infrastructure]?"
- Sub-line: "Free 30-minute discovery call. NDA on request."
- Two CTAs: "Start a Project" + "Talk to an Engineer"

---

## Page-Level SEO Notes

| Element | Rule |
|---|---|
| H1 | Must contain the primary cluster keyword |
| § 02 sub-service cards | Use each child page's H1 as the card heading |
| § 10 FAQ | Carries the AEO weight for this page — answers must be 1–3 sentences, direct |
| Internal links | Every child page linked from § 02, related clusters from § 11, contact from § 12 |
| Meta description | Primary keyword + cluster scope + India + CTA in under 155 characters |
| Schema | `Service` schema on the page, `FAQPage` schema on § 10 |
