import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  loadSpecifications,
  reconcileSpecifications,
} from "../src/page-spec-import";
import {
  validateSectionFields,
  validateBlueprint,
} from "../src/page-spec-schema";
import { constrainEvidence } from "../src/publishing-pipeline";
import { validateSprite } from "../src/production-assets";
import { validateCV, scanCV } from "../src/careers";
import { contentSchema, validateContent } from "../src/content";
import { getDesign } from "../src/designs";
import { verifiedV3Content, sectionNeedsEvidence } from "../src/v3-evidence";
test("CSV reconciliation preserves all 63 page identities with hub precedence", async () => {
  const input = await loadSpecifications();
  assert.equal(input.rawRows, 678);
  assert.equal(input.pages.length, 63);
  assert.equal(input.sectionCount, 571);
  assert.equal(input.heroes, 53);
  assert.equal(
    input.pages.find((p) => p.path === "/mobile-app-development")?.source,
    "hub-and-static-sections.csv",
  );
  assert.equal(
    input.pages
      .find((p) => p.path === "/flutter-app-development")
      ?.sections.find((s) => s.id === "hero")?.ratio,
    "4:3",
  );
  assert.deepEqual(input, await loadSpecifications());
});
test("import rejects duplicate section identifiers and invalid ordering", async () => {
  const input = await loadSpecifications(),
    rows = input.pages[0].originalRows;
  const csv = (rows: Record<string, string>[]) => {
    const keys = Object.keys(rows[0]);
    return (
      keys.join(",") +
      "\n" +
      rows
        .map((r) =>
          keys.map((k) => '"' + r[k].replaceAll('"', '""') + '"').join(","),
        )
        .join("\n")
    );
  };
  assert.throws(
    () =>
      reconcileSpecifications([
        { name: "bad.csv", text: csv([...rows, rows[1]]) },
      ]),
    /Duplicate/,
  );
  assert.throws(
    () =>
      reconcileSpecifications([
        {
          name: "bad.csv",
          text: csv(
            rows.map((r, i) => (i === 1 ? { ...r, section_order: "9" } : r)),
          ),
        },
      ]),
    /ordering/,
  );
});
test("exact field contracts and approved component registry reject executable output", async () => {
  const input = await loadSpecifications(),
    page = input.pages.find((p) => p.path === "/flutter-app-development")!,
    section = page.sections.find((s) => s.id === "what-we-deliver")!;
  const fields = Object.fromEntries(section.fields.map((k) => [k, ""]));
  validateSectionFields(section, fields, ["/contact"]);
  assert.throws(
    () => validateSectionFields(section, { ...fields, extra: "x" }, []),
    /exact fields/,
  );
  assert.throws(
    () =>
      validateSectionFields(
        section,
        { ...fields, card_1_icon_key: "bogus" },
        [],
      ),
    /icon/,
  );
  assert.throws(
    () =>
      validateSectionFields(
        section,
        { ...fields, card_1_body: "<script>alert(1)</script>" },
        [],
      ),
    /Markup/,
  );
  assert.throws(() =>
    validateBlueprint(page, {
      hero: {
        recommended_component: "eval()",
        spacing_above: 0,
        background: "#fff",
        max_width: "1320px",
        mobile_stack: "",
      },
    }),
  );
});
test("unsupported evidence and fictional vacancies are suppressed", () => {
  assert.deepEqual(
    constrainEvidence("hero", {
      h1: "Mobile apps",
      stat_1_number: "200+",
      stat_1_label: "Projects",
    }),
    { h1: "Mobile apps", stat_1_number: "", stat_1_label: "" },
  );
  assert.equal(
    constrainEvidence("testimonials", {
      quote_1: "Fictional quote",
      heading: "Our clients",
    }).quote_1,
    "",
  );
  assert.equal(
    constrainEvidence("open-roles", { role_1_title: "Imaginary vacancy" })
      .role_1_title,
    "",
  );
});
test("sprite contains exact keys and rejects executable SVG", async () => {
  const sprite = await readFile("public/assets/netofficials-icons.svg", "utf8");
  assert.ok(validateSprite(sprite));
  assert.throws(
    () =>
      validateSprite(
        sprite.replace("</svg>", "<script>alert(1)</script></svg>"),
      ),
    /Unsafe/,
  );
  assert.throws(
    () => validateSprite(sprite.replace("code-brackets", "unknown")),
    /twenty/,
  );
});
test("CV checks reject disguised or oversized files and scanner fails closed", async () => {
  await assert.rejects(validateCV(Buffer.from("This is not PDF"), "cv.pdf"));
  await assert.rejects(
    validateCV(Buffer.alloc(5 * 1024 * 1024 + 1), "cv.pdf"),
    /5 MB/,
  );
  assert.equal(
    await validateCV(Buffer.from("%PDF-1.7\nexample\n%%EOF"), "cv.pdf"),
    "application/pdf",
  );
  const previous = process.env.CLAMAV_HOST;
  delete process.env.CLAMAV_HOST;
  try {
    await assert.rejects(scanCV(Buffer.from("CV")), /unavailable/);
  } finally {
    if (previous) process.env.CLAMAV_HOST = previous;
  }
});
test("V3 content validates independently and legacy revisions remain readable", () => {
  const content = contentSchema.parse({
    title: "Mobile applications",
    description: "Plan and build mobile applications with Netofficials.",
    schemaVersion: 3,
    texts: {},
    pageBlueprint: {
      hero: {
        recommended_component: "HeroSplit",
        spacing_above: 0,
        background: "#ffffff",
        max_width: "1320px",
        mobile_stack: "Stack",
      },
    },
    pageSections: [
      { id: "hero", order: 1, fields: { h1: "Mobile applications" } },
    ],
    provenance: {
      specificationId: "11111111-1111-4111-8111-111111111111",
      specificationHash: "a".repeat(64),
      runId: "22222222-2222-4222-8222-222222222222",
      version: 1,
      validation: [],
      generatedAt: new Date().toISOString(),
    },
  });
  assert.deepEqual(
    validateContent(content, getDesign("software-led")).errors,
    [],
  );
  assert.equal(
    contentSchema.parse({
      title: "Legacy",
      description: "Legacy revision",
      texts: {},
      schemaVersion: 1,
    }).schemaVersion,
    1,
  );
});
test("public V3 proof requires approved evidence and disappears when approval is revoked", () => {
  const content = contentSchema.parse({
    title: "About Netofficials",
    description: "Company information and development capabilities.",
    schemaVersion: 3,
    texts: {},
    pageSections: [
      {
        id: "testimonials",
        order: 1,
        fields: { heading: "Client feedback", quote_1: "Approved quote" },
        evidenceIds: ["11111111-1111-4111-8111-111111111111"],
      },
    ],
  });
  assert.equal(sectionNeedsEvidence(content.pageSections![0]), true);
  assert.equal(
    verifiedV3Content(content, []).pageSections![0].fields.quote_1,
    "",
  );
  assert.equal(
    verifiedV3Content(content, ["11111111-1111-4111-8111-111111111111"])
      .pageSections![0].fields.quote_1,
    "Approved quote",
  );
});
