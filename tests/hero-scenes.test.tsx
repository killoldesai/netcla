import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { HeroScene, hireChar, hireRole, sceneFor } from "../src/site/v2/hero-scenes";

test("scene is chosen from the page topic, with the board as the fallback", () => {
  assert.equal(sceneFor("/saas-development-services"), "saas");
  assert.equal(sceneFor("/mobile-app-development-services"), "mobile");
  assert.equal(sceneFor("/ai-development-services"), "ai");
  assert.equal(sceneFor("/devops-and-cloud-services"), "devops");
  assert.equal(sceneFor("/ai-chatbot-development"), "ai");
  assert.equal(sceneFor("/natural-language-processing"), "ai");
  assert.equal(sceneFor("/ecommerce-development"), "ecommerce");
  assert.equal(sceneFor("/website-redesign"), "web");
  assert.equal(sceneFor("/crm-development-services"), "data");
  assert.equal(sceneFor("/something-unmatched"), "board");
});

test("hero scene is decorative and carries the page's own deliverables", () => {
  const html = renderToStaticMarkup(<HeroScene kind="devops" title="DevOps" items={["CI/CD pipeline", "Monitoring", "Cloud setup", "Fourth"]} />);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /CI\/CD pipeline/);
  assert.doesNotMatch(html, /Fourth/);
});

test("hire, industry and location pages have their own scenes whatever the URL says", () => {
  assert.equal(sceneFor("/hire-ai-ml-developer", "hire"), "hire");
  assert.equal(sceneFor("/fintech-software-development", "industry"), "industry");
  assert.equal(sceneFor("/software-development-company-uk", "location"), "location");
});

test("hire pages show a short role and a developer character from the URL", () => {
  assert.equal(hireRole("/hire-react-developer", "fallback"), "React developer");
  assert.equal(hireRole("/hire-nodejs-developer", "fallback"), "Node.js developer");
  assert.equal(hireRole("/hire-ai-ml-developer", "fallback"), "AI ML developer");
  assert.equal(hireRole("/dedicated-development-team", "Dedicated team"), "Dedicated team");
  assert.equal(hireChar("/hire-flutter-developer"), "flutter");
  assert.equal(hireChar("/hire-react-native-developer"), "flutter");
  assert.equal(hireChar("/hire-java-developer"), "fullstack");
});
