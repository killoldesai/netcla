import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { contentSchema } from "../src/content";
import {
  normalizeRichContent,
  richHTML,
  richPlainText,
  richParagraphs,
  sanitizeRichHTML,
} from "../src/rich-text";
import { RichContent } from "../src/rich-content";
import { PlannedContent } from "../src/planned-content";
import { publicContent } from "../src/public-content";
import { DesignPage } from "../src/render";
const draft = () =>
  contentSchema.parse({
    title: "Test page",
    description: "A useful description for this test page.",
    texts: { body: "Hello world", secret: "Private draft" },
    schemaVersion: 2,
    hero: {
      heading: "Page title",
      body: "Opening answer",
      ctaLabel: "Contact us",
      ctaPath: "/contact",
    },
    sections: [
      {
        id: "section-1",
        level: 2,
        heading: "Details",
        paragraphs: ["First paragraph", "Second paragraph"],
        items: [],
        cards: [],
        table: { columns: [], rows: [] },
        faqs: [{ question: "How?", answer: "Like this" }],
        links: [],
      },
    ],
    richText: {
      "texts.body": {
        text: "Hello world",
        html: "<p>Hello <strong>world</strong></p>",
      },
      "texts.secret": { text: "Private draft", html: "<b>Private draft</b>" },
      "sections.section-1.paragraphs": {
        text: "First paragraph\n\nSecond paragraph",
        html: "<p><strong>First paragraph</strong></p><p><em>Second paragraph</em></p>",
      },
      "sections.section-1.faqs.0.answer": {
        text: "Like this",
        html: "<p>Like <u>this</u></p>",
      },
    },
  });
test("Rich HTML keeps supported formatting and strips executable content and styles", () => {
  const clean = sanitizeRichHTML(
    '<p style="display:none" onclick="alert(1)">Safe <strong>copy</strong><script>alert(1)</script><img src=x onerror=alert(1)><a href="jav&#x61;script:alert(1)">link</a><iframe src="https://bad.test"></iframe></p>',
  );
  assert.equal(clean, "<p>Safe <strong>copy</strong><a>link</a></p>");
  assert.equal(
    richPlainText(sanitizeRichHTML("<p>One</p><p>Two</p>", true)),
    "One\nTwo",
  );
  assert.match(
    sanitizeRichHTML(
      '<table><tbody><tr><td colspan="2">Cell</td></tr></tbody></table>',
    ),
    /colspan="2"/,
  );
});
test("Long pasted lists preserve formatting without creating one schema paragraph per list item", () => {
  const html = `<ul>${Array.from({ length: 25 }, (_, i) => `<li><p>Item ${i}</p></li>`).join("")}</ul>`;
  const text = richPlainText(html);
  const paragraphs = richParagraphs(text);
  assert.equal(paragraphs.join("\n\n"), text);
  assert.equal(paragraphs.length, 1);
  const content = draft();
  content.sections![0].paragraphs = paragraphs;
  content.richText!["sections.section-1.paragraphs"] = { text, html };
  assert.ok(contentSchema.safeParse(content).success);
  assert.equal(
    normalizeRichContent(content).richText!["sections.section-1.paragraphs"]
      .html,
    html,
  );
});
test("Formatting cannot override plain text or follow stale regenerated fields", () => {
  const content = draft();
  content.richText!["unknown"] = { text: "Unknown", html: "<b>Unknown</b>" };
  content.richText!["hero.body"] = {
    text: "Opening answer",
    html: "<p>Different unvalidated copy</p>",
  };
  content.texts.body = "Regenerated content";
  const normalized = normalizeRichContent(content);
  assert.equal(normalized.richText!["texts.body"], undefined);
  assert.equal(normalized.richText!["unknown"], undefined);
  assert.equal(normalized.richText!["hero.body"], undefined);
  assert.ok(normalized.richText!["sections.section-1.faqs.0.answer"]);
  assert.equal(richHTML(content, "hero.body", "Opening answer"), undefined);
});
test("Saved formatting appears in previews and legacy public layouts", () => {
  const content = normalizeRichContent(draft());
  const preview = renderToStaticMarkup(<PlannedContent content={content} />);
  assert.match(preview, /<strong>First paragraph<\/strong>/);
  assert.match(preview, /<u>this<\/u>/);
  const design = {
    id: "test",
    path: "/test",
    kind: "service",
    title: "Test",
    styles: [],
    nodes: [{ tag: "p", children: [{ slot: "body" }] }],
    texts: { body: "Hello world" },
    gate: "",
  };
  const html = renderToStaticMarkup(
    <DesignPage design={design} content={content} />,
  );
  assert.match(html, /Hello <strong>world<\/strong>/);
  assert.doesNotMatch(html, /<p[^>]*><div/);
  assert.equal(
    renderToStaticMarkup(
      <RichContent
        content={{
          richText: {
            x: { text: "Safe", html: '<b onclick="bad()">Safe</b>' },
          },
        }}
        field="x"
        text="Safe"
      />,
    ),
    "<span><b>Safe</b></span>",
  );
});
test("Public payload removes hidden formatted content and unpublished internal links", () => {
  const content = draft();
  content.hiddenSections = ["section-1"];
  content.richText!["texts.body"].html =
    '<p>Hello <a href="/draft">world</a></p>';
  const visible = publicContent(
    {
      id: "test",
      path: "/test",
      kind: "service",
      title: "Test",
      styles: [],
      nodes: [{ tag: "p", children: [{ slot: "body" }] }],
      texts: {},
      gate: "",
    },
    content,
    ["/test"],
  );
  assert.deepEqual(Object.keys(visible.content.richText!), ["texts.body"]);
  assert.doesNotMatch(
    JSON.stringify(visible.content),
    /Private draft|First paragraph|href/,
  );
});
