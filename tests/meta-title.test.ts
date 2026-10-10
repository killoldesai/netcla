import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { composeMetaTitle, isKeywordTitle, tidyMetaTitle } from "../src/prompts/meta-title";
import { parseBrief } from "../src/prompts/page-brief";

describe("composeMetaTitle", () => {
  it("builds a primary-only title with the brand suffix", () => {
    assert.equal(composeMetaTitle("web design services", []), "Web Design Services | Netofficials");
  });

  it("adds two secondaries and de-duplicates words already in the primary", () => {
    assert.equal(
      composeMetaTitle("mobile app development services", ["ios app development", "android app development"]),
      "Mobile App Development Services, iOS, Android | Netofficials",
    );
  });

  it("skips a secondary whose words are all already in the primary", () => {
    assert.equal(
      composeMetaTitle("mobile app development services", ["app development services"]),
      "Mobile App Development Services | Netofficials",
    );
  });

  it("drops the brand suffix when the title would exceed 60 characters", () => {
    const primary = "custom web application development for logistics companies";
    const title = composeMetaTitle(primary, []);
    assert.equal(title, "Custom Web Application Development for Logistics Companies");
    assert.ok(!title.includes("Netofficials"));
  });

  it("keeps acronyms and brand terms in their canonical casing", () => {
    assert.equal(
      composeMetaTitle("ai development services", ["saas platform development", "ios app development"]),
      // Candidates keep the model's order; filler like "platform" is stripped from the phrase.
      "AI Development Services, SaaS, iOS App | Netofficials",
    );
    assert.equal(composeMetaTitle("iphone app development", []), "iPhone App Development | Netofficials");
    assert.equal(composeMetaTitle("node.js development", []), "Node.js Development | Netofficials");
  });

  it("caps a long primary keyword at 60 characters on a word boundary", () => {
    const title = composeMetaTitle(
      "custom software development services for enterprise logistics and supply chain automation teams",
      [],
    );
    assert.ok(title.length <= 60, `length ${title.length}`);
    assert.ok(/[A-Za-z]$/.test(title), `ends badly: ${title}`);
    assert.ok(!title.includes("Netofficials"));
  });
});

describe("tidyMetaTitle", () => {
  it("restores acronym casing", () => {
    assert.equal(tidyMetaTitle("Hire Php Developer, Web, Backend | Netofficials"), "Hire PHP Developer, Backend | Netofficials");
    assert.equal(tidyMetaTitle("Hire Ai/ml Developer, Machine Learning, AI ML | Netofficials"), "Hire AI/ML Developer, Machine Learning | Netofficials");
    assert.equal(tidyMetaTitle("Software Development Company Uk, Businesses | Netofficials"), "Software Development Company UK, Businesses | Netofficials");
  });

  it("drops cut-off and repeated supporting keywords", () => {
    assert.equal(tidyMetaTitle("Hire DevOps Engineer, Consultant, As | Netofficials"), "Hire DevOps Engineer, Consultant | Netofficials");
    assert.equal(tidyMetaTitle("Hire Node.js Developer, Nodejs, Backend | Netofficials"), "Hire Node.js Developer, Backend | Netofficials");
  });

  it("never reduces a keyword list to a bare phrase", () => {
    assert.equal(tidyMetaTitle("Cloud Services, Web | Netofficials"), "Cloud Services, Web | Netofficials");
  });
});

describe("isKeywordTitle", () => {
  it("accepts a comma-separated keyword title of 30 to 60 characters", () => {
    assert.equal(isKeywordTitle("Mobile App Development Services, iOS, Android | Netofficials"), true);
    assert.equal(isKeywordTitle("Mobile App Development Services, iOS, Android"), true);
  });

  it("rejects titles without a keyword separator", () => {
    assert.equal(isKeywordTitle("Mobile App Development Services | Netofficials"), false);
  });

  it("rejects titles outside the 30 to 60 character range", () => {
    assert.equal(isKeywordTitle("Web Design, Hi | Netofficials"), false);
    assert.equal(
      isKeywordTitle("Custom Web Application Development, Logistics Companies, Enterprise Teams, Extra Words"),
      false,
    );
  });
});

describe("parseBrief title and description repair", () => {
  const raw = {
    audience: "Operations leads at mid-sized firms",
    primaryKeyword: "mobile app development services",
    secondaryKeywords: ["ios app development", "android app development"],
    entities: ["Swift", "Kotlin"],
    buyerQuestions: ["How long does a build take?"],
    angle: "Scoped builds with a named delivery lead.",
    metaTitle: "Mobile App Development Services | Netofficials",
    metaDescription: Array.from({ length: 34 }, () => "abcd").join(" "),
  };

  it("replaces a title that is not a keyword list", () => {
    const brief = parseBrief(raw, []);
    assert.equal(brief.metaTitle, "Mobile App Development Services, iOS, Android | Netofficials");
  });

  it("keeps a valid keyword title unchanged", () => {
    const brief = parseBrief(
      { ...raw, metaTitle: "Mobile App Development Services, iOS, Android | Netofficials" },
      [],
    );
    assert.equal(brief.metaTitle, "Mobile App Development Services, iOS, Android | Netofficials");
  });

  it("trims a 170-character description to 155 characters at a word boundary", () => {
    const desc = Array.from({ length: 34 }, () => "abcd").join(" ");
    assert.equal(desc.length, 169);
    const brief = parseBrief(raw, []);
    assert.ok(brief.metaDescription.length <= 155);
    assert.ok(brief.metaDescription.endsWith("abcd"));
    assert.ok(desc.startsWith(brief.metaDescription));
  });

  it("defaults the new SEO fields when the model omits them", () => {
    const brief = parseBrief(raw, []);
    assert.equal(brief.answerSummary, "");
    assert.deepEqual(brief.keyFacts, []);
    assert.deepEqual(brief.schemaAbout, []);
    assert.equal(brief.serviceType, "");
  });

  it("ranks real hub keywords and never trims an entity", () => {
    assert.equal(
      composeMetaTitle(
        "ai development services",
        ["artificial intelligence development company India", "AI software development services", "machine learning development services", "generative AI development services"],
        "Netofficials",
        ["Python", "TensorFlow"],
      ),
      "AI Development Services, Machine Learning | Netofficials",
    );
    // "Amazon Web Services" overlaps the primary, so it is skipped whole instead of becoming "Amazon Web".
    assert.equal(
      composeMetaTitle("cloud services", ["cloud solutions company India", "managed cloud services"], "Netofficials", ["Amazon Web Services", "Microsoft Azure", "Kubernetes"]),
      "Cloud Services, Microsoft Azure, Kubernetes | Netofficials",
    );
    // Two short keywords are preferred to one long phrase.
    assert.equal(
      composeMetaTitle("mobile app development services", ["ios app development company", "android app development", "cross-platform app development"]),
      "Mobile App Development Services, iOS, Android | Netofficials",
    );
    assert.equal(
      composeMetaTitle("hire dedicated developers", ["hire developers from India", "staff augmentation India"], "Netofficials", ["React"]),
      "Hire Dedicated Developers, Staff Augmentation | Netofficials",
    );
  });
});
