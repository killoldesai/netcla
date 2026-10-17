import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import type { Content } from "../src/content";
import { CareersSections, isCareersContent } from "../src/careers-page";
import { FaqSections, isFaqContent } from "../src/faq-page";

const section = (id: string, fields: Record<string, string>) => ({ id, order: 1, fields, evidenceIds: [], omitted: false });
const asContent = (pageSections: ReturnType<typeof section>[]) => ({ title: "Careers | Netofficials", pageSections }) as unknown as Content;

const CAREERS = asContent([
  section("hero", { h1: "Software Development Jobs India at Netofficials", subheadline: "Join the team.", culture_1: "Work on full product lifecycles", culture_2: "Write production code", culture_3: "Own your work" }),
  section("why-join", { section_label: "Why join", heading: "A different place", benefit_1_title: "Real products", benefit_1_body: "Live products.", benefit_2_title: "Modern stack", benefit_2_body: "Current tooling.", benefit_3_title: "Senior team", benefit_3_body: "Code review.", benefit_4_title: "Ownership", benefit_4_body: "End to end." }),
  section("open-roles", { section_label: "Open roles", heading: "Current openings" }),
  section("team-culture", { section_label: "Culture", heading: "Working here", value_1: "Technical excellence, code is reviewed on every pull request.", value_2: "Ownership, each person owns the deliverable.", value_3: "Curiosity, the stack changes.", culture_paragraph: "<p>First paragraph.</p><p>Second paragraph.</p>" }),
]);

test("careers renders the scene hero, four colour cards, an empty state and split culture values", () => {
  assert.ok(isCareersContent(CAREERS, "/careers"));
  assert.ok(!isCareersContent(CAREERS, "/about"));
  const $ = load(renderToStaticMarkup(<CareersSections content={CAREERS} path="/careers" paths={["/contact"]} />));
  assert.equal($("h1").length, 1);
  assert.ok($("#hero .hs--crew").length);
  assert.equal($("#hero .co-hero__ticks li").length, 3);
  assert.equal($("#why-join .kit-card").length, 4);
  assert.equal($("#open-roles .kit-panel h3").text(), "There are no open positions listed at the moment.");
  assert.deepEqual($("#team-culture .kit-card h3").map((_, el) => $(el).text()).get(), ["Technical excellence", "Ownership", "Curiosity"]);
  assert.equal($("#team-culture .kit-card p").first().text(), "Code is reviewed on every pull request.");
  assert.equal($("#team-culture .kit-text .prose").length, 2);
});

test("careers lists open roles as cards that link to the role page", () => {
  const vacancies = [{ id: "1", slug: "react-engineer", title: "React Engineer", department: "Engineering", location: "Rajkot", employment_type: "Full time" }];
  const $ = load(renderToStaticMarkup(<CareersSections content={CAREERS} path="/careers" paths={[]} vacancies={vacancies} />));
  assert.equal($("#open-roles .kit-panel").length, 0);
  assert.equal($("#open-roles a.kit-card").attr("href"), "/careers/react-engineer");
  assert.match($("#open-roles a.kit-card").text(), /React Engineer/);
});

const FAQ = asContent([
  section("hero", { h1: "Software Development Company FAQ", subheadline: "Answers." }),
  section("faq-categories", { cat_1_name: "General", cat_1_q1: "Where are you based?", cat_1_a1: "<p>In India.</p>", cat_1_q2: "Who works on it?", cat_1_a2: "A team.", cat_2_name: "Pricing", cat_2_q1: "What does it cost?", cat_2_a1: "It depends." }),
  section("still-have-questions", { heading: "Still have a question?", subheadline: "Ask.", option_1_label: "Discuss your project", option_1_cta: "Tell us", option_1_url: "/contact", option_2_label: "Our process", option_2_cta: "See it", option_2_url: "/how-we-work" }),
]);

test("the FAQ renders the explorer with a tab per topic, its questions, and the follow-up routes", () => {
  assert.ok(isFaqContent(FAQ, "/faq"));
  assert.ok(!isFaqContent(FAQ, "/contact"));
  const $ = load(renderToStaticMarkup(<FaqSections content={FAQ} path="/faq" paths={["/contact", "/how-we-work"]} />));
  assert.equal($("h1").length, 1);
  assert.ok($("#hero .hs--faq").length);
  assert.equal($("#questions [role=tab]").length, 2);
  assert.equal($("#questions input[type=search]").length, 1);
  // The first topic is open at first: both of its questions are on the page.
  assert.deepEqual($("#questions details summary").map((_, el) => $(el).text()).get(), ["Where are you based?", "Who works on it?"]);
  assert.equal($("#still-have-questions a.kit-card").length, 2);
  assert.equal($("#still-have-questions a.kit-card").first().attr("href"), "/contact");
});
