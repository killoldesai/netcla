import { iconKeys, type PageSpecification, type SectionSpecification } from "../page-spec-schema";
import { pillarFor } from "../site-structure";
import type { LinkOption, PageBrief } from "./page-brief";
import { allowedHtml } from "./system";
import { familyOf, guideBodyTarget, pageBand, pageTypeFor, wordBands } from "./templates";

type Rule = { match: RegExp; rules: string[] };

// One rule set per section family. Rules state the SEO / AEO / GEO / lead
// purpose of each field so the model writes to a job, not to a word count.
// Word targets add up to the page band in templates.ts (wordBands).
const sectionRules: Rule[] = [
  {
    match: /^hero$/,
    rules: [
      "h1: 5-12 words. Put the primary keyword (or its natural phrasing) in the first half. State what is delivered, not a slogan.",
      "subheadline: 25-40 words that directly answer 'what is this and who is it for', including one secondary keyword naturally.",
      "tag_pill: 2-4 words naming the category, e.g. 'Cross-platform apps'.",
      "cta_primary_label: 2-5 words, low-friction and specific, e.g. 'Get a scoped estimate'. cta_primary_url: /contact.",
      "cta_secondary_label/url: a useful next step on the page or a related allowed link (process, engagement models, related service).",
    ],
  },
  {
    match: /^(?:service-overview|services-overview|editorial-overview|mission-values)$/,
    rules: [
      "heading: a question buyers search or a clear statement that contains the primary keyword.",
      "body_paragraph (HTML): exactly 4 <p> blocks and never more than 250 words in total. Paragraph 1 is 40-55 words and is the direct answer that stands alone as a featured snippet and AI citation: start with a definition ('X is...' or 'Netofficials builds...'), restate the brief's answerSummary in your own words, and name the key entities. Paragraphs 2, 3 and 4 are 50-65 words each. Paragraph 2: what is covered and which technologies are involved. Paragraph 3: who it is right for and when it is not. Paragraph 4: how delivery runs and what the client receives. Include 1-2 internal links from the allowed list in natural anchor text.",
      "On hub pages paragraph 1 defines the category and names each child service; paragraph 3 explains how to choose between them.",
      "outcome_N: 8-14 words each, a concrete result or deliverable, no invented numbers.",
    ],
  },
  {
    match: /^key-takeaways$/,
    rules: [
      "heading: 'Key takeaways' or a short variant.",
      "body_paragraph (HTML): a <ul> of 4-6 <li>, each one complete, self-contained sentence an AI assistant could quote verbatim. Cover the answer, the main decision factors and what to do next.",
    ],
  },
  {
    match: /^editorial-\d+$|^editorial-details$/,
    rules: [
      `heading: phrase as the question a reader is asking at this point in the guide; include a secondary keyword where natural.`,
      `body_paragraph (HTML): open with a 40-60 word <p> that answers the heading directly. Then explain with <h3> sub-points, a <ul> or <ol> where the reader compares options or follows steps, and a <table> (with <thead>) when comparing 3+ options across criteria. ${guideBodyTarget.min}-${guideBodyTarget.max} words. Define terms the first time they appear. State cost and timeline as factors, never as invented figures.`,
      "section_label: 1-3 words.",
    ],
  },
  {
    match: /^(?:what-we-deliver|differentiators)$/,
    rules: [
      "heading: names what the buyer gets, not a slogan.",
      "card_N_title: 2-6 words naming a concrete deliverable, capability, skill or solution (for hire pages: a skill or responsibility; for industry pages: a solution for that sector; for location pages: a service offered to that market).",
      "card_N_body: 35-48 words, never above 52, plain text. What it covers, which technologies or integrations are involved, and when a buyer needs it. Name entities (platforms, tools, standards) at first mention.",
      "card_N_icon_key: one value from approvedIconKeys or empty.",
    ],
  },
  {
    match: /^services-grid$/,
    rules: [
      "heading: names the child services the buyer can choose from, containing the hub keyword.",
      "svc_N_title: the child service name (2-6 words). svc_N_url: that child page from the allowed links, or an empty string if it is not listed.",
      "svc_N_body: 28-36 words, never above 42, plain text. What the service delivers and when a buyer picks it over the other child services.",
      "svc_N_icon_key: one value from approvedIconKeys or empty.",
      "On the industries hub the children are the eleven sector pages: svc_N_title is '<Sector> software development' (3-5 words), svc_N_body names one typical workflow or system in that sector, and every sector page in the allowed links gets exactly one entry.",
    ],
  },
  {
    match: /^why-netofficials$/,
    rules: [
      "heading: names a concrete reason to choose Netofficials for this category, not a slogan.",
      "body_paragraph (HTML): 80-100 words in 1-2 <p> (never above 110): how delivery is organised, who the client works with and what they receive. No invented years, team sizes or client names.",
      "adv_N: 18-28 words each, one concrete working practice (review cadence, code and IP handover, communication window, documentation). Plain text.",
    ],
  },
  {
    match: /^engagement-models$/,
    rules: [
      "heading: describes how the buyer can structure the work.",
      "model_N_name: 2-4 words (fixed-scope project, dedicated team, team extension).",
      "model_N_body: 35-55 words on how it runs and what the client controls. No prices.",
      "model_N_best_for: 12-20 words naming the buyer situation it suits.",
    ],
  },
  {
    match: /process/,
    rules: [
      "heading: describes how the engagement runs, e.g. 'How a Flutter project runs from scope to release'.",
      "step_N_title: 2-5 words (five steps, in order). On hire pages the steps cover vetting, matching, onboarding, delivery rhythm and replacement or scaling.",
      "step_N_body: 35-48 words, never above 52: what happens, who is involved from the client side, and what the client receives at the end of the step.",
    ],
  },
  {
    match: /technolog|tech-stack|tools-stack/,
    rules: [
      "group_N_name: a layer such as 'Front end', 'Back end & APIs', 'Data', 'Cloud & DevOps', 'Testing'. Four groups.",
      "group_N_items: 4-8 comma-separated real, current technology names relevant to this page (entities). No versions unless essential.",
    ],
  },
  {
    match: /who-its-for|persona/,
    rules: [
      "heading: names the buyer situations the page serves.",
      "persona_N_title: a buyer role or situation (e.g. 'Founders validating an MVP'). On technology pages each card is a scenario: when this technology is the right choice, when an alternative fits better (name the alternative and why). On hire pages each card is a hiring situation. On location pages each card is a buyer situation in that country.",
      "persona_N_problem: 20-35 words describing their situation in their words.",
      "persona_N_outcome: 20-35 words describing what they get, without invented results.",
    ],
  },
  {
    match: /^industry-applications$|industr/,
    rules: [
      "heading: names where the service is applied, containing the primary keyword.",
      "industry_N_name: the sector joined to the primary service keyword, 3-6 words, written the way buyers search it, for example 'Healthcare Mobile App Development' or 'Fintech Android App Development'. Never a bare sector name. industry_N_url: the matching industry page from the allowed links, or an empty string.",
      "industry_N_usecase: 25-38 words, a specific application of this service in that sector, naming one real workflow or integration. On hub pages there are six industries; on other pages four.",
    ],
  },
  {
    match: /^compliance-data$/,
    rules: [
      "heading: names the compliance, data and integration constraints of this sector.",
      "item_N_title: 2-5 words (for example 'Patient data handling', 'Payment security'). Four items.",
      "On the industries hub the four items are the regimes that recur across sectors (for example health data, payment security, personal data, accessibility), each naming which sectors they shape, not one sector.",
      "item_N_body: 25-45 words: the standard or constraint, how it shapes the build, and what Netofficials scopes up front. Name real regulations only when certain (HIPAA, PCI DSS, GDPR); never claim certification or legal advice.",
    ],
  },
  {
    match: /^cost-factors$/,
    rules: [
      "heading: 'What affects the cost and timeline of <topic>' or a close variant containing the primary keyword.",
      "subheadline: 40-55 words answering 'how much does this cost / how long does it take' directly: state that cost depends on the factors below and that Netofficials gives a scoped estimate after a short brief. No prices, ranges or durations.",
      "factor_N_title: 2-5 words naming a cost or timeline driver. Five factors.",
      "factor_N_body: 25-36 words, never above 42: why it changes cost or timeline and one way to reduce it.",
    ],
  },
  {
    match: /faq/,
    rules: [
      "heading: e.g. 'Questions about <primary keyword>'.",
      "qN: eight questions written the way buyers type them into search or ask an AI assistant. Use the brief's buyerQuestions first. Cover cost factors, timeline factors, technology choice, code and IP ownership, communication across time zones, security or compliance, and support after launch.",
      "aN (HTML allowed): 55-80 words, never above 90. The first sentence answers the question directly and completely. Then add the factors or conditions. Name entities precisely. No 'Great question', no hedging openers, no invented numbers.",
    ],
  },
  {
    match: /related/,
    rules: [
      "heading: names the related services or hubs.",
      "service_N_name / hub_N_name: the linked page's name. service_N_url / hub_N_url: only from the allowed links.",
      "service_N_reason / hub_N_body: 15-30 words on when a buyer of this page also needs that service.",
    ],
  },
  {
    match: /^cta-banner$/,
    rules: [
      "heading: 4-9 words inviting the next step for this specific topic.",
      "subheadline: 20-35 words explaining what happens after they enquire (reply with questions, scope, team) without offers, guarantees or prices.",
      "cta_primary_label: 2-5 words; cta_primary_url: /contact.",
      "cta_secondary_label/url: a lower-commitment option from the allowed links (process, engagement models, related guide).",
    ],
  },
];


// The About page is a company profile with its own section jobs. Applied before the generic rules for /about only.
const noRanking = "Never call Netofficials top, leading, best, number one, award-winning or trusted by named clients; state what it does and how it delivers.";
const aboutRules: Rule[] = [
  {
    match: /^hero$/,
    rules: [
      "h1: 6-12 words. Name Netofficials and say what it is: an India-based software development company. A plain statement, not a slogan.",
      "subheadline: 35-55 words. A factual lede: what Netofficials builds (custom software, AI, cloud, mobile apps), where it is based (India) and who it works with (businesses in the US, UK and Australia). " + noRanking,
      "tag_pill: 2-4 words, 'About Netofficials'.",
      "cta_primary_label: 'Start a conversation'; cta_primary_url: /contact. cta_secondary_label: 'See our services'; cta_secondary_url: /services.",
    ],
  },
  {
    match: /^company-story$/,
    rules: [
      "heading: 4-10 word declarative statement about who Netofficials is, no mission-statement language.",
      "body_paragraph (HTML): exactly 3 <p>, about 200-250 words in total. Paragraph 1: what Netofficials is and does, in plain facts. Paragraph 2: how the work is organised (one engineering team across its practices, who the client deals with). Paragraph 3: who it works for and the kind of projects it takes on. Mention the founding year or home city only if approved evidence states them; otherwise leave them out entirely. Include 1-2 internal links from the allowed list. " + noRanking,
      "pull_statement: one sentence of 14-28 words stating how Netofficials works. Plain, specific, not a slogan.",
    ],
  },
  {
    match: /^company-glance$/,
    rules: [
      "heading: 2-5 words, e.g. 'Netofficials at a glance'.",
      "founded_year: a four-digit year, only if approved evidence states it; otherwise an empty string.",
      "base_city: the city, only if approved evidence states it; otherwise an empty string.",
      "delivery_window: working hours or time-zone overlap, only if approved evidence states it; otherwise an empty string.",
      "practices_note: 15-25 words naming the practices: custom software, AI and automation, cloud and DevOps, mobile apps, plus web, digital marketing and developer hiring. No counts of clients, staff or projects.",
    ],
  },
  {
    match: /^practice-index$/,
    rules: [
      "heading: 4-9 words naming what Netofficials builds.",
      "intro: 25-40 words explaining that the work is organised into practices, each with its own services and technologies.",
      "practice_1_summary: custom software development. practice_2_summary: AI and automation. practice_3_summary: cloud and DevOps. practice_4_summary: mobile app development. Each 22-32 words: what the practice delivers and the main technologies, named once. No invented numbers.",
    ],
  },
  {
    match: /^principles$/,
    rules: [
      "heading: 4-9 words about how Netofficials works.",
      "principle_N_title: 2-5 words. Four principles, in order: code and IP handover, honest scoping, senior technical review, documentation.",
      "principle_N_body: 30-45 words each: what the client sees in practice. Concrete (repositories, written estimates, review before release, handover documents). No invented figures or guarantees.",
    ],
  },
  {
    match: /^delivery-timeline$/,
    rules: [
      "heading: 4-9 words about how a project runs from first brief to handover.",
      "step_N_title: 2-4 words. Five steps, in order: discovery, scope and estimate, sprint delivery, testing and release, handover and support.",
      "step_N_body: 30-45 words each: what happens in this step and what the client receives. No durations or prices.",
    ],
  },
  {
    match: /^working-model$/,
    rules: [
      "heading: 4-9 words about how the India-based team works with international clients.",
      "body_paragraph (HTML): 1-2 <p>, 80-110 words: where the team is based, which regions it serves (US, UK, Australia), how communication runs (written updates, sprint demos, a shared board).",
      "tools: a comma-separated list of 3-6 working tools, limited to Jira, Slack, Git, GitHub, Bitbucket, Figma and Confluence.",
      "overlap_note: 15-30 words on time-zone overlap. State specific hours only if approved evidence gives them; otherwise say overlap hours are agreed per project during scoping.",
    ],
  },
  {
    match: /^industries-intro$/,
    rules: [
      "heading: 4-9 words about the sectors Netofficials builds for.",
      "intro: 25-40 words explaining that sector knowledge (regulation, data handling, integrations) shapes the scope. The sector links are added by the page layout; do not list them.",
    ],
  },
  {
    match: /^india-partner$/,
    rules: [
      "heading: 4-9 words, an honest framing of what an India-based partner changes.",
      "topic_N_title: 1-3 words. Three topics in order: Cost, Quality, Communication.",
      "topic_N_benefit: 28-42 words, the real advantage. topic_N_watch: 28-42 words, what a buyer should check or what can go wrong and how Netofficials handles it. Balanced and honest, no invented numbers or comparisons with named competitors.",
    ],
  },
  {
    match: /^proof-/,
    rules: [
      "Evidence-gated: the owner fills this section from approved facts (named people, clients, ratings, awards). It is never written by the model: every field stays an empty string, and the page hides the block until it has content.",
    ],
  },
  {
    match: /^faq$/,
    rules: [
      "heading: 'Questions about working with Netofficials'.",
      "qN: six questions a buyer asks when vetting a development company: what Netofficials builds, how a project starts, who the client works with, time zones and communication, who owns the code, how engagement models differ.",
      "aN (HTML allowed): 55-80 words, never above 90. The first sentence answers directly. No invented numbers, years, team sizes or client names.",
    ],
  },
];


// The Contact page converts a visitor into an enquiry: short, reassuring copy around a fixed form.
const contactRules: Rule[] = [
  {
    match: /^hero$/,
    rules: [
      "h1: 5-10 words inviting a project enquiry, naming Netofficials. A plain statement, not a slogan.",
      "subheadline: 25-40 words: what to send (a short brief), who replies (the Netofficials team) and what comes back (questions, a scope outline). No response-time promises or numbers.",
      "tag_pill: 2-3 words, 'Contact us' or similar.",
      "trust_1 / trust_2 / trust_3: 6-12 words each, plain reassurances: no commitment at this stage, an NDA is available before details are shared, every enquiry is read by the team. No guarantees, no figures.",
    ],
  },
  {
    match: /^contact-form$/,
    rules: [
      "form_heading: 3-7 words above the form, e.g. 'Tell us about your project'.",
      "form_subheadline: 15-30 words on how little is needed to start: a goal and an email address.",
      "submit_label: 2-4 words, 'Send enquiry' style.",
      "privacy_note: 18-32 words: the details are used only to reply to the enquiry and are not shared; mention that an NDA can be agreed before sensitive details are sent.",
      "goal_hint: 12-24 words of helper text for the project-goal box, e.g. what the product does, who uses it and what is already in place.",
    ],
  },
  {
    match: /^next-steps$/,
    rules: [
      "heading: 4-9 words about what happens after the form is sent.",
      "step_N_title: 2-4 words. Three steps in order: the team reviews the brief, the team replies with questions and a scope outline, a scoping call is arranged if it fits.",
      "step_N_body: 22-38 words each: what happens and what the sender receives. No response times, durations or prices.",
    ],
  },
  {
    match: /^prepare$/,
    rules: [
      "heading: 4-9 words about what makes a useful brief.",
      "intro: 20-35 words saying a short brief is enough and the rest can be worked out together.",
      "item_N_title: 2-4 words. Four items in order: the goal, the users, existing systems or integrations, the timeline.",
      "item_N_body: 20-34 words each: what to say about it in a sentence or two and why it helps scoping.",
    ],
  },
  {
    match: /^assurances$/,
    rules: [
      "heading: 4-9 words about working terms before a project starts.",
      "item_N_title: 3-6 words. Three items in order: an NDA is available before details are shared, the discovery call carries no obligation, the engagement model is chosen to fit the project.",
      "item_N_body: 24-40 words each, plain and specific. No guarantees or figures. Include one internal link in the third item to the engagement models page if it is in the allowed list.",
    ],
  },
  {
    match: /^other-routes$/,
    rules: [
      "heading: 4-9 words offering other ways to learn before enquiring.",
      "route_N_name: 2-5 words naming the destination. route_N_url: only from the allowed links; choose engagement models, how we work and services (or the most relevant hub).",
      "route_N_body: 14-28 words on when a visitor should read that page first.",
    ],
  },
  {
    match: /^proof-/,
    rules: [
      "Evidence-gated: the owner fills this section from approved facts (a contact email, phone number, office cities and addresses). It is never written by the model: every field stays an empty string, and the page hides the block until it has content.",
    ],
  },
  {
    match: /^faq$/,
    rules: [
      "heading: 'Questions before you get in touch'.",
      "qN: five questions a visitor asks before sending an enquiry: how soon the team replies, whether an NDA is signed first, what to prepare, whether a call is required, how engagement and cost are decided.",
      "aN (HTML allowed): 40-70 words, never above 80. The first sentence answers directly. Never state a response time, price or figure.",
    ],
  },
];

// Engagement Models: a comparison-and-decision page. Terms, minimum periods and prices are never invented.
const noTerms = "Never state a sprint length, meeting frequency in days or weeks, contract jurisdiction, minimum term, notice period, onboarding time, rate or price, and never say that post-launch support or warranty is included, unless approved evidence supplies it; say it is agreed in the proposal.";
const engagementRules: Rule[] = [
  {
    match: /^hero$/,
    rules: [
      "h1: 6-12 words, containing 'engagement models' and naming the software development context.",
      "subheadline: 30-45 words defining the three models in one sentence each clause (project-based fixed price, dedicated development team, staff augmentation) and what the page helps the reader do: choose one.",
      "tag_pill: 2-4 words, e.g. 'Engagement models'.",
      "cta_primary_label: 'Discuss which model fits'; cta_primary_url: /contact. cta_secondary_label: 'See how we work'; cta_secondary_url: /how-we-work.",
    ],
  },
  {
    match: /^models-comparison$/,
    rules: [
      "heading: a plain description of the table, such as 'The three engagement models compared'. Never a slogan or a claim.",
      "model_1 is the project-based fixed-price model, model_2 the dedicated development team, model_3 staff augmentation. model_N_name uses exactly those names ('Fixed-Price Project', 'Dedicated Development Team', 'Staff Augmentation').",
      "model_N_tagline: 6-12 words, what the model is in a phrase.",
      "model_N_body: 38-55 words: how the model works, what is included and who carries delivery responsibility. Plain text.",
      "The next fields are the rows of a comparison table, read side by side across the three models, so write them as short, parallel facts, each 6-16 words, no full paragraphs:",
      "model_N_management: who manages the work day to day (the Netofficials project manager; the client's product or engineering lead; the client's engineering manager).",
      "model_N_team: who is on the team and how it is composed (a team Netofficials assembles for the scope; a named team dedicated to the client's product; one or a few engineers).",
      "model_N_pricing: how it is charged (a fixed fee for a defined scope; a monthly cost for the team; a monthly cost per engineer). No amounts. " + noTerms,
      "model_N_timeline: how duration works (set by the scope and milestone plan; ongoing and reviewed as the roadmap changes; flexible as capacity needs change). " + noTerms,
      "model_N_changes: how a change in requirements is handled (priced as a change request against the agreed scope; absorbed by re-prioritising the backlog; the client adjusts the engineer's tasks directly).",
      "model_N_best_for: the buyer situation this model suits best, 8-20 words.",
    ],
  },
  {
    match: /^decision-guide$/,
    rules: [
      "heading: 4-9 words about matching a situation to a model.",
      "situation_N_scenario: 10-20 words in the buyer's own voice, one situation per model, e.g. 'The scope is written down, the budget is fixed and the date is set.' Short enough to read as one option in a list. Never a list of technologies.",
      "situation_N_choice: the model name only, exactly one of 'Fixed-Price Project', 'Dedicated Development Team', 'Staff Augmentation'; one situation per model, in that order.",
      "situation_N_recommendation: 22-36 words explaining why that model fits this situation and which other model fits better if the situation changes.",
    ],
  },
  {
    match: /^pricing-factors$/,
    rules: [
      "heading: 'What affects the cost under each model' or a close variant.",
      "intro: 35-50 words explaining that each model is priced differently and that Netofficials gives a written proposal after a short discovery conversation. No amounts, ranges or percentages. " + noTerms,
      "factor_N_title: 2-5 words. Four factors in order: team composition and seniority, scope clarity and change requests, duration and ramp-up, compliance, tooling and integrations.",
      "factor_N_body: 26-40 words each: why it changes the cost under the models and one way to keep it predictable.",
    ],
  },
  {
    match: /^process$/,
    rules: [
      "heading: 4-9 words about how an engagement starts.",
      "step_N_title: 2-5 words. Four steps in order: discovery and scope alignment, proposal or team profile, engineer review and approval (dedicated team and staff augmentation) or milestone plan (fixed price), contracts, NDA and tooling.",
      "step_N_body: 30-45 words each: what happens and what the client receives. No durations. " + noTerms,
    ],
  },
  {
    match: /^faq$/,
    rules: [
      "heading: 'Questions about software development engagement models'.",
      "qN: six questions buyers ask when choosing a model: switching models mid-project, minimum commitment, interviewing or approving engineers, what happens if a team member leaves, what the monthly rate includes, who owns the code and what the contract covers.",
      "aN (HTML allowed): 50-80 words, never above 90. The first sentence answers directly. " + noTerms,
    ],
  },
];


// How We Work: the delivery method, stated as facts the team does. Cadence and durations are agreed per project.
const howWorkRules: Rule[] = [
  // Sprint length, meeting frequency and contract jurisdiction are agreed per project; never stated as fixed facts.
  // (Applied to every field of this page through the rules below.)
  {
    match: /^hero$/,
    rules: [
      "h1: 6-11 words naming Netofficials' delivery method, e.g. 'How Netofficials delivers software projects'. A plain statement.",
      "subheadline: 30-45 words: the path from scoping to handover, one clause on who the client works with and what they can see along the way. " + noTerms,
      "tag_pill: 2-3 words, 'How we work'.",
      "signal_1 / signal_2 / signal_3: 3-6 words each, plain facts about the method: a written scope before build, sprint reviews the client attends, one named delivery lead. No figures.",
      "cta_primary_label: 'Start a conversation'; cta_primary_url: /contact. cta_secondary_label: 'Compare engagement models'; cta_secondary_url: /engagement-models.",
    ],
  },
  {
    match: /^approach$/,
    rules: [
      "heading: 4-9 words stating how the work is organised.",
      "body_paragraph (HTML): exactly 2 <p>, 90-130 words in total. Paragraph 1: the method (discovery, scoped build in sprints, release, handover) in plain sentences. Paragraph 2: who is accountable at each step (the delivery lead, the technical architect, the client's product owner). No claims about past clients, awards or figures.",
    ],
  },
  {
    match: /^stages$/,
    rules: [
      "heading: 4-9 words about the path from brief to handover.",
      "intro: 20-35 words saying each stage ends with something the client can review before the next stage starts.",
      "stage_N_title: 2-4 words. Five stages in order: discovery, architecture and plan, sprint delivery, testing and release, handover and support.",
      "stage_N_body: 30-50 words: what the team does in this stage. " + noTerms,
      "stage_N_receives: 8-20 words: the artefact the client receives at the end of the stage (a written scope, an architecture note, a working build for review, a test report, a handover pack).",
    ],
  },
  {
    match: /^communication$/,
    rules: [
      "heading: 4-9 words about how the team and client stay in touch.",
      "intro: 20-35 words saying the cadence is set in the proposal to suit the client's time zone and team, and that the rows below are the standard meetings and updates.",
      "cadence_N_name: the meeting or update (Sprint planning; Sprint review; Daily written update; Steering review). Four rows.",
      "cadence_N_when: 4-14 words on when it happens relative to the work (at the start of each sprint; at the end of each sprint; each working day; at each milestone). No hours or times.",
      "cadence_N_who: 4-14 words naming the roles present (the delivery lead and the client's product owner; the whole team; the client's sponsor).",
      "cadence_N_purpose: 10-24 words on what the meeting decides or shows.",
    ],
  },
  {
    match: /^tools$/,
    rules: [
      "heading: 4-9 words about the tools the team uses.",
      "tool_N_name: one of Jira, Slack, Git, GitHub, Figma, Confluence. Four tools in that order.",
      "tool_N_use: 8-20 words on what the tool holds for the client (the backlog and sprint board; the daily channel for updates; the source repository the client can access; the design files and review links).",
    ],
  },
  {
    match: /^commitments$/,
    rules: [
      "heading: 4-9 words about what the client can rely on.",
      "commit_N_title: 2-5 words. Four commitments in order: code and IP handover, written scope before build, senior review before release, decisions recorded in writing.",
      "commit_N_body: 28-42 words each: what the client receives or can check. No guarantees of outcomes, timelines or prices.",
    ],
  },
  {
    match: /^faq$/,
    rules: [
      "heading: 'Questions about how we work'.",
      "qN: five questions a buyer asks about delivery: how requirements that change are handled, what QA covers, how communication works across time zones, who owns the code, what happens after launch.",
      "aN (HTML allowed): 45-70 words. The first sentence answers directly. " + noTerms,
    ],
  },
];


// Why Choose Netofficials: an honest case. No rankings, no figures, no competitor names, and the alternatives get a fair hearing.
const noClaims = "Never state years of experience, team sizes, client counts, ratings, reviews, 'best', 'top', 'leading' or 'number one', and never name a competitor or another company. Describe what Netofficials does and how, not how good it is.";
const whyChooseRules: Rule[] = [
  {
    match: /^hero$/,
    rules: [
      "h1: 6-12 words stating why a buyer would choose Netofficials in plain terms, e.g. 'Why teams choose Netofficials for software projects'. No superlatives.",
      "subheadline: 30-45 words: what Netofficials is (an India-based software development company), the one working model the reasons below share, and that the page also says when it is not the right fit. " + noClaims,
      "tag_pill: 2-3 words, 'Why Netofficials'.",
      "cta_primary_label: 'Start a conversation'; cta_primary_url: /contact. cta_secondary_label: 'See how we work'; cta_secondary_url: /how-we-work.",
    ],
  },
  {
    match: /^reasons$/,
    rules: [
      "heading: 4-9 words, a plain description of the reasons (not a slogan, not a count).",
      "intro: 25-40 words saying each reason is a working practice a buyer can check, not a claim about quality. " + noClaims,
      "reason_N_title: 2-6 words. Six reasons in order: the engineers who scope the work build it; direct access to the technical lead; one team across web, mobile, AI and cloud; written scope and estimate before build; the client owns the code; communication built for time zones.",
      "reason_N_body: 28-44 words each, concrete: what happens and what the client can check. No averages, years or numbers.",
    ],
  },
  {
    match: /^comparison$/,
    rules: [
      "heading: a plain description such as 'Netofficials compared with large outsourcing firms and freelancers'.",
      "intro: 25-40 words saying the comparison describes typical models, that every company differs, and that the right choice depends on the project. " + noClaims,
      "row_N_attribute: 2-5 words. Five rows in order: who you talk to day to day; who does the work; breadth of skills; how scope and cost are set; continuity if someone is unavailable.",
      "row_N_us / row_N_firms / row_N_freelancers: 6-20 words each, parallel facts. Use 'typically' for the two alternatives. No numbers. Never disparage: describe the model.",
      "firms_better: 20-38 words: when a large outsourcing firm is the better choice (for example very large programmes, or a procurement process that requires a certified vendor panel).",
      "freelancers_better: 20-38 words: when a freelancer is the better choice (for example a small, bounded task with one skill and a short timeline).",
    ],
  },
  {
    match: /^not-a-fit$/,
    rules: [
      "heading: 'When Netofficials is not the right fit' or a close variant.",
      "intro: 20-35 words saying a clear no early saves both sides time.",
      "fit_N_title: 3-7 words. Three situations: work that requires an on-site team as the primary working mode; work outside software and digital marketing; a need for the lowest possible rate over everything else.",
      "fit_N_body: 24-40 words each, honest and specific about why and what to do instead. " + noClaims,
    ],
  },
  {
    match: /^proof-/,
    rules: [
      "Evidence-gated: the owner fills this section from approved client feedback (quote text, name, role). It is never written by the model: every field stays an empty string, and the page hides the block until it has content.",
    ],
  },
  {
    match: /^routes$/,
    rules: [
      "heading: 4-9 words offering where to read next.",
      "route_N_name: 2-5 words. route_N_url: only from the allowed links; choose how we work, engagement models and services.",
      "route_N_body: 14-28 words on when to read that page first.",
    ],
  },
  {
    match: /^faq$/,
    rules: [
      "heading: 'Questions about choosing Netofficials'.",
      "qN: five questions a buyer asks when comparing providers: how Netofficials differs from a large firm, from a freelancer, who does the work, what happens if someone is unavailable, how to check the claims.",
      "aN (HTML allowed): 45-70 words. The first sentence answers directly. " + noClaims + " " + noTerms,
    ],
  },
];


// The guides index: short, plain intro copy around a list that comes from the database.
const blogIndexRules: Rule[] = [
  {
    match: /^hero$/,
    rules: [
      "h1: 5-10 words naming what the guides are for, e.g. 'Guides for people buying software and digital services'. Plain, not a slogan.",
      "subheadline: 25-40 words: who the guides are written for (people commissioning software, websites and marketing), what they cover (cost, scope, choosing a provider) and that they describe factors rather than quote prices. " + noClaims,
      "tag_pill: 1-3 words, 'Guides'.",
    ],
  },
  {
    match: /^topics$/,
    rules: [
      "heading: 3-8 words offering the three topics the guides are grouped into, without stating a count.",
      "intro: 18-32 words: the guides are grouped by topic and each one is a self-contained answer to a buying question.",
      "topic_1_blurb: 12-28 words introducing the guides on search and paid marketing (SEO, PPC, Google Ads, choosing an agency). topic_2_blurb: 12-28 words introducing the guides on websites and eCommerce (cost, redesign, platform choice, conversion). topic_3_blurb: 12-28 words introducing the guides on software development (cost, scope, MVPs, timelines, build versus buy). Describe the subject, never list or count the guides.",
    ],
  },
  {
    match: /^newsletter$/,
    rules: [
      "heading: 3-7 words, a plain invitation to get new guides by email.",
      "subheadline: 15-28 words: what arrives (new guides when they are published) and that it is not a sales sequence. No frequency promises.",
      "privacy_note: 12-24 words: the address is used only to send the guides, a confirmation email comes first, and unsubscribing is one click.",
    ],
  },
  {
    match: /^cta-banner$/,
    rules: [
      "heading: 4-9 words inviting a reader with a live project to talk to Netofficials.",
      "subheadline: 20-32 words: what happens after they enquire (questions, a scope outline, the team it needs). No offers, guarantees or prices.",
      "cta_primary_label: 2-5 words; cta_primary_url: /contact. cta_secondary_label/url: 'See how we work' to /how-we-work.",
    ],
  },
];

/** Pages with their own section jobs; checked before the generic rules. */
const pageRules: Record<string, Rule[]> = { "/about": aboutRules, "/contact": contactRules, "/engagement-models": engagementRules, "/how-we-work": howWorkRules, "/why-choose-netofficials": whyChooseRules, "/blog": blogIndexRules };

export function rulesFor(sectionId: string, path?: string) {
  const own = path ? pageRules[path]?.find((r) => r.match.test(sectionId)) : undefined;
  return own?.rules ?? sectionRules.find((r) => r.match.test(sectionId))?.rules ?? [
    "heading: a clear statement or buyer question for this section's purpose.",
    "Every body-type field: specific, useful, 30-70 words, no filler.",
  ];
}

export function buildSectionPrompt(input: {
  spec: PageSpecification;
  section: SectionSpecification;
  brief: PageBrief;
  links: LinkOption[];
  facts: { id: string; statement: string }[];
  previous?: Record<string, string>;
  instruction?: string;
}) {
  const { spec, section, brief } = input;
  const outline = brief.outline.find((o) => o.sectionId === section.id);
  const otherSections = brief.outline.filter((o) => o.sectionId !== section.id).map((o) => `${o.sectionId}: ${o.purpose}`);
  return JSON.stringify({
    task: `Write the "${section.id}" section of ${spec.path}. Return one JSON object with exactly the fields listed.`,
    page: {
      path: spec.path,
      type: pageTypeFor(spec.path),
      family: familyOf(spec.path),
      pageWordTarget: pageBand(spec.path) ?? wordBands[familyOf(spec.path)],
      pillar: pillarFor(spec.path)?.label,
      title: brief.metaTitle || spec.title,
    },
    strategy: {
      searchIntent: brief.searchIntent,
      audience: brief.audience,
      primaryKeyword: brief.primaryKeyword,
      secondaryKeywords: brief.secondaryKeywords,
      entities: brief.entities,
      buyerQuestions: brief.buyerQuestions,
      angle: brief.angle,
      answerSummary: brief.answerSummary,
      keyFacts: brief.keyFacts,
      serviceType: brief.serviceType,
      thisSection: outline ?? { purpose: section.name },
      otherSectionsCover: otherSections,
      suggestedInternalLinks: brief.internalLinks,
    },
    exactFields: section.fields,
    fieldRules: rulesFor(section.id, spec.path),
    htmlAllowedIn: "body_paragraph, mission_body, culture_paragraph and FAQ answers only. Allowed tags: " + allowedHtml,
    approvedIconKeys: iconKeys,
    approvedEvidence: input.facts,
    allowedInternalLinks: input.links.map((l) => ({ path: l.path, label: l.label })),
    previousVersion: input.previous,
    ownerInstruction: input.instruction,
    regeneration: input.previous
      ? "Improve on previousVersion substantively (accuracy, specificity, structure). Do not just paraphrase it."
      : undefined,
  });
}
