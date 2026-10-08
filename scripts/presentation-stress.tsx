import fs from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { StructuredPage } from "../src/structured-page";
import { readSitePlan, emptyPlanContent } from "../src/site-plan";
import { contentSchema } from "../src/content";
import { presentationFor } from "../src/presentation";
const entry = readSitePlan().entries.find(
  (e) => e.url === "/ai-automation-services",
)!;
const content = contentSchema.parse(emptyPlanContent(entry));
content.hero!.heading =
  "AI Process Automation Services for Complex Operational Workflows and Connected Business Systems";
content.hero!.body =
  "A long opening answer used only to check layout behaviour. ".repeat(10);
for (const s of content.sections!) {
  s.paragraphs = [
    "A useful explanation needs room to breathe without making the page difficult to scan. ".repeat(
      12,
    ),
  ];
  s.items = [];
  s.cards = [];
  s.table = { columns: [], rows: [] };
  s.faqs = [];
}
content.sections![7].cards = Array.from({ length: 5 }, (_, i) => ({
  title: `A longer process-stage title for layout validation ${i + 1}`,
  body: "Review scope and delivery requirements. ".repeat(8),
}));
content.sections![6].table = {
  columns: ["Capability", "Approach A", "Approach B"],
  rows: [
    [
      "Handling a lengthy comparison label",
      "An explanation with additional detail.",
      "A different explanation with additional detail.",
    ],
  ],
};
content.sections!.at(-1)!.faqs = [
  {
    question:
      "How does a considerably longer question about complex integration requirements fit in the accordion?",
    answer:
      "A longer answer for checking responsive reading and wrapping. ".repeat(
        15,
      ),
  },
];
const html = renderToStaticMarkup(
  <div className="csv-frame">
    <StructuredPage
      content={content}
      presentation={presentationFor(entry.url)!}
      preview
      linkMap={{ "/contact": "/contact" }}
    />
  </div>,
);
fs.mkdirSync("test-results/presentations", { recursive: true });
fs.writeFileSync(
  "test-results/presentations/stress.html",
  `<!doctype html><html><head><style>@font-face{font-family:Poppins;src:url(/assets/poppins-regular.ttf)}body{margin:0}</style><link rel="stylesheet" href="/assets/structured-site.css"></head><body>${html}</body></html>`,
);
console.log(
  "Presentation stress fixture written; no database content modified.",
);
