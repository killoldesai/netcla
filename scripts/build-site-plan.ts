import fs from "node:fs";
import { readSourceSitePlan } from "../src/site-plan";
const inventory = readSourceSitePlan();
fs.writeFileSync(
  "src/templates/site-plan.json",
  JSON.stringify(inventory, null, 2) + "\n",
);
fs.mkdirSync("docs/site-plan", { recursive: true });
fs.writeFileSync(
  "docs/site-plan/reconciliation.json",
  JSON.stringify(inventory.report, null, 2) + "\n",
);
const keys = [
  "url",
  "cluster",
  "phase",
  "priority",
  "pageType",
  "title",
  "h1",
  "keywords",
];
const quote = (v: unknown) => '"' + String(v).replaceAll('"', '""') + '"';
fs.writeFileSync(
  "docs/site-plan/reconciled-master.csv",
  [
    keys.join(","),
    ...inventory.entries.map((e) =>
      keys.map((k) => quote((e as any)[k])).join(","),
    ),
  ].join("\n"),
);
console.log(
  "Prepared " +
    inventory.entries.length +
    " planned pages; no database changes or AI calls.",
);
