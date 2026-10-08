import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { getDesign } from "../src/designs";
import { HomePage } from "../src/home/HomePage";
import { menuLabel, menuGroup } from "../src/menu-labels";
test("Homepage renders one h1 and a heading for every section", () => {
  const d = getDesign("software-led");
  const actual = load(
    renderToStaticMarkup(
      <HomePage
        content={{
          title: d.title,
          description: "",
          texts: d.texts,
          hiddenSections: [],
          claims: [],
          sources: [],
          unresolved: [],
        }}
        preview
      />,
    ),
  );
  assert.equal(actual("h1").length, 1);
  assert.equal(
    actual("h1").text(),
    `${d.texts.t1}${d.texts.t2}`,
  );
  actual("main section[aria-labelledby]").each((_, section) => {
    const id = actual(section).attr("aria-labelledby");
    assert.equal(actual(`#${id}`).length, 1, id);
  });
  assert.deepEqual(
    actual("link[rel=stylesheet]").map((_, l) => actual(l).attr("href")).get(),
    ["/assets/mega-navigation.css"],
  );
});
test("Legacy homepage stylesheets stay in sync with their concept copies", () => {
  for (const css of [
    "modern.css",
    "software-led.css",
    "refined.css",
    "capsule-hero.css",
    "connected-home.css",
    "stripe-home.css",
    "brand-home.css",
  ])
    assert.ok(
      fs
        .readFileSync("homepage-concept/" + css)
        .equals(fs.readFileSync("public/assets/" + css)),
    );
});
test("Menu labels are concise and clustered by buyer need", () => {
  assert.equal(
    menuLabel(
      "/react-development-services",
      "React Development Services | Netofficials",
    ),
    "React",
  );
  assert.equal(
    menuLabel(
      "/software-development-company-usa",
      "Software Development Company USA | Netofficials",
    ),
    "USA",
  );
  assert.equal(
    menuLabel(
      "/hire-nodejs-developer",
      "Hire Node.js Developer | Netofficials",
    ),
    "Node.js Developer",
  );
  assert.equal(menuGroup("/web-development"), "Web & design");
  assert.equal(menuGroup("/mvp-development-services"), "Software solutions");
  assert.equal(menuGroup("/api-development-services"), "Specialist software");
});
