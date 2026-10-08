// Builds src/brand-icons.generated.ts: official brand marks (Simple Icons, CC0)
// for every technology name used on the site, so pages ship only the logos they
// need. Run after generating new pages:  npm run icons:brands
import fs from "node:fs";
import path from "node:path";
import * as simpleIcons from "simple-icons";
import { serviceHubs } from "../src/service-hubs";
import { stack } from "../src/home/copy";
import { normalizeTech } from "../src/tech-name";

type SimpleIcon = { title: string; slug: string; hex: string; path: string };
const all = Object.values(simpleIcons as unknown as Record<string, SimpleIcon>).filter((i) => i && i.slug);
const bySlug = new Map(all.map((i) => [i.slug, i]));
const byTitle = new Map(all.map((i) => [normalizeTech(i.title), i]));

// Names that differ from the brand's own title, or tools that belong to a parent brand.
const aliases: Record<string, string> = {
  java: "openjdk",
  "android jetpack": "jetpackcompose",
  jetpack: "jetpackcompose",
  "jetpack compose": "jetpackcompose",
  viewmodel: "android",
  livedata: "android",
  room: "android",
  "android sdk": "android",
  "android studio": "androidstudio",
  "google maps": "googlemaps",
  "google maps sdk": "googlemaps",
  "google play": "googleplay",
  "google play console": "googleplay",
  "play console": "googleplay",
  "firebase authentication": "firebase",
  "firebase auth": "firebase",
  "firebase firestore": "firebase",
  firestore: "firebase",
  "firebase cloud messaging": "firebase",
  fcm: "firebase",
  "firebase analytics": "firebase",
  "firebase crashlytics": "firebase",
  crashlytics: "firebase",
  "material design": "materialdesign",
  "material design 3": "materialdesign",
  "material ui": "mui",
  "next.js": "nextdotjs",
  nextjs: "nextdotjs",
  "node.js": "nodedotjs",
  nodejs: "nodedotjs",
  node: "nodedotjs",
  "vue.js": "vuedotjs",
  vue: "vuedotjs",
  "nuxt.js": "nuxt",
  ".net": "dotnet",
  "asp.net": "dotnet",
  "asp.net core": "dotnet",
  "react native": "react",
  "react.js": "react",
  reactjs: "react",
  swiftui: "swift",
  "google cloud": "googlecloud",
  gcp: "googlecloud",
  "google cloud platform": "googlecloud",
  "amazon web services": "amazonwebservices",
  aws: "amazonwebservices",
  "aws lambda": "awslambda",
  lambda: "awslambda",
  "amazon s3": "amazons3",
  s3: "amazons3",
  "amazon ec2": "amazonec2",
  ec2: "amazonec2",
  "amazon rds": "amazonrds",
  rds: "amazonrds",
  dynamodb: "amazondynamodb",
  "amazon dynamodb": "amazondynamodb",
  cloudfront: "amazoncloudfront",
  azure: "microsoftazure",
  "microsoft azure": "microsoftazure",
  "azure devops": "azuredevops",
  "sql server": "microsoftsqlserver",
  "microsoft sql server": "microsoftsqlserver",
  mssql: "microsoftsqlserver",
  postgres: "postgresql",
  mongo: "mongodb",
  "tailwind css": "tailwindcss",
  tailwind: "tailwindcss",
  "github actions": "githubactions",
  "gitlab ci": "gitlab",
  "gitlab ci/cd": "gitlab",
  k8s: "kubernetes",
  "openai api": "openai",
  openai: "openai",
  "gpt-4": "openai",
  chatgpt: "openai",
  "hugging face": "huggingface",
  "scikit-learn": "scikitlearn",
  sklearn: "scikitlearn",
  "c#": "dotnet",
  csharp: "dotnet",
  "c++": "cplusplus",
  golang: "go",
  "ruby on rails": "rubyonrails",
  rails: "rubyonrails",
  "spring boot": "springboot",
  "power bi": "powerbi",
  "apple app store": "appstore",
  "app store": "appstore",
  "app store connect": "appstore",
  testflight: "appstore",
  ios: "ios",
  "core data": "apple",
  "apple pay": "applepay",
  "google pay": "googlepay",
  "stripe api": "stripe",
  "paypal sdk": "paypal",
  "google analytics": "googleanalytics",
  "google ads": "googleads",
  "google search console": "googlesearchconsole",
  "search console": "googlesearchconsole",
  "google tag manager": "googletagmanager",
  gtm: "googletagmanager",
  "meta ads": "meta",
  "facebook ads": "meta",
  "elastic search": "elasticsearch",
  "rabbit mq": "rabbitmq",
  "apache kafka": "apachekafka",
  kafka: "apachekafka",
  "apache spark": "apachespark",
  spark: "apachespark",
  airflow: "apacheairflow",
  "apache airflow": "apacheairflow",
  "visual studio code": "vscodium",
  "vs code": "vscodium",
  xcode: "xcode",
  "web3.js": "web3dotjs",
  "ethers.js": "ethers",
  "three.js": "threedotjs",
  "d3.js": "d3",
  "express.js": "express",
  expressjs: "express",
  "nest.js": "nestjs",
  "socket.io": "socketdotio",
};

// Popular technologies, so pages generated later are usually covered already.
const common = `React Next.js Node.js TypeScript JavaScript Python Django Flask FastAPI Laravel PHP Ruby on Rails Java Spring Boot Kotlin Swift SwiftUI Dart Flutter React Native Angular Vue.js Nuxt Svelte Go Rust .NET C# C++ GraphQL Apollo Redux Tailwind CSS Bootstrap Sass Vite Webpack Jest Cypress Playwright Selenium Postman Docker Kubernetes Terraform Ansible Jenkins GitHub GitHub Actions GitLab Bitbucket Jira Confluence Figma Sketch Adobe XD AWS Azure Google Cloud Firebase Supabase Vercel Netlify Heroku DigitalOcean Cloudflare Nginx Apache PostgreSQL MySQL MariaDB MongoDB Redis Elasticsearch SQLite Microsoft SQL Server Oracle Snowflake BigQuery Apache Kafka RabbitMQ Apache Spark Apache Airflow TensorFlow PyTorch Keras scikit-learn pandas NumPy Jupyter OpenAI Anthropic Hugging Face LangChain OpenCV Power BI Tableau Stripe PayPal Razorpay Shopify WooCommerce Magento WordPress Drupal Contentful Strapi Sanity Salesforce HubSpot Zapier Twilio SendGrid Mailchimp Slack Microsoft Teams Zoom Google Analytics Google Tag Manager Google Search Console Google Ads Semrush Ahrefs Android iOS Android Studio Xcode Gradle CocoaPods Expo Ionic Electron Unity Ethereum Solidity Polygon Web3.js Prometheus Grafana Datadog Sentry New Relic Linux Ubuntu Windows macOS Okta Auth0 Keycloak`;

type Mark = { id: string; t: string; v: string; c?: string; p?: string; m?: string };

// Devicon (MIT) covers brands Simple Icons no longer carries (AWS, Azure, Adobe).
const deviconDir = path.join("node_modules", "devicon", "icons");
const deviconNames = new Set(fs.readdirSync(deviconDir));
const deviconAliases: Record<string, string> = {
  amazonwebservices: "amazonwebservices",
  microsoftazure: "azure",
  adobexd: "xd",
  microsoftsqlserver: "microsoftsqlserver",
};
function devicon(slug: string): Mark | undefined {
  const name = deviconAliases[slug] ?? slug;
  if (!deviconNames.has(name)) return undefined;
  const files = fs.readdirSync(path.join(deviconDir, name));
  const file = ["-original.svg", "-plain.svg", "-original-wordmark.svg", "-plain-wordmark.svg"]
    .map((suffix) => files.find((f) => f === name + suffix))
    .find(Boolean);
  if (!file) return undefined;
  const svg = fs.readFileSync(path.join(deviconDir, name, file), "utf8");
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 128 128";
  const inner = svg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return { id: "dev-" + name, t: name, v: viewBox, m: inner };
}

// Product names that belong to a parent brand ("AWS Lambda" → AWS logo).
const families: [RegExp, string][] = [
  [/^(aws|amazon)\b/, "amazonwebservices"],
  [/^(azure|microsoft azure)\b/, "microsoftazure"],
  [/^(google cloud|gcp)\b/, "googlecloud"],
  [/^firebase\b/, "firebase"],
  [/^apollo\b/, "apollographql"],
  [/^(anthropic|claude)\b/, "anthropic"],
  [/^(openai|gpt)\b/, "openai"],
  [/^adobe xd\b/, "adobexd"],
  [/^adobe commerce\b/, "magento"],
  [/^(atlas|mongodb atlas)\b/, "mongodb"],
  [/^angular\b/, "angular"],
  [/^laravel\b/, "laravel"],
  [/^django\b/, "django"],
  [/^(\.net|asp\.net|blazor)\b/, "dotnet"],
  [/^android\b/, "android"],
  [/^apple\b/, "apple"],
  [/^google play\b/, "googleplay"],
  [/^stripe\b/, "stripe"],
  [/^shopify\b/, "shopify"],
  [/^github\b/, "github"],
  [/^gitlab\b/, "gitlab"],
  [/^bitbucket\b/, "bitbucket"],
  [/^kubernetes\b/, "kubernetes"],
  [/^docker\b/, "docker"],
  [/^terraform\b/, "terraform"],
  [/^redis\b/, "redis"],
  [/^postgres/, "postgresql"],
  [/^mysql\b/, "mysql"],
  [/^tensorflow\b/, "tensorflow"],
  [/^pytorch\b/, "pytorch"],
  [/^hugging ?face\b/, "huggingface"],
  [/^langchain\b/, "langchain"],
  [/^next\.?js\b/, "nextdotjs"],
  [/^react\b/, "react"],
  [/^vue\b/, "vuedotjs"],
  [/^node/, "nodedotjs"],
  [/^flutter\b/, "flutter"],
  [/^kotlin\b/, "kotlin"],
  [/^swift/, "swift"],
  [/^wordpress\b/, "wordpress"],
  [/^woocommerce\b/, "woocommerce"],
  [/^magento\b/, "magento"],
  [/^salesforce\b/, "salesforce"],
  [/^hubspot\b/, "hubspot"],
  [/^google analytics\b/, "googleanalytics"],
  [/^google ads\b/, "googleads"],
  [/^google maps\b/, "googlemaps"],
  [/^jira\b/, "jira"],
  [/^figma\b/, "figma"],
];

function markFor(slug: string): Mark | undefined {
  const icon = bySlug.get(slug);
  if (icon) return { id: icon.slug, t: icon.title, v: "0 0 24 24", c: icon.hex, p: icon.path };
  return devicon(slug);
}

function resolve(name: string): Mark | undefined {
  const key = normalizeTech(name);
  // Strip generic suffixes ("Google Maps SDK" → "google maps").
  const base = key.replace(/\b(sdk|sdks|api|apis|framework|library|services?|platform|cloud functions|console|cli)\b/g, "").replace(/\s+/g, " ").trim();
  for (const slug of [aliases[key], key.replace(/[^a-z0-9]/g, ""), aliases[base], base.replace(/[^a-z0-9]/g, "")]) {
    const mark = slug ? markFor(slug) : undefined;
    if (mark) return mark;
  }
  const titled = byTitle.get(key) ?? (base ? byTitle.get(base) : undefined);
  if (titled) return markFor(titled.slug);
  const family = families.find(([re]) => re.test(key));
  return family ? markFor(family[1]) : undefined;
}

async function siteNames() {
  const names = new Set<string>();
  for (const hub of serviceHubs) for (const [, , items] of hub.technologies) items.forEach((i) => names.add(i));
  for (const [, items] of stack) items.forEach((i) => names.add(i));
  common.split(/\s(?=[A-Z.])/).forEach((n) => names.add(n.trim()));
  if (process.env.DATABASE_URL) {
    const { query, pool } = await import("../src/db");
    const rows = await query(
      "SELECT DISTINCT r.content FROM pages p JOIN revisions r ON r.id IN (p.draft_revision_id, p.published_revision_id) WHERE p.archived_at IS NULL AND r.content->>'schemaVersion'='3'",
    );
    for (const { content } of rows)
      for (const s of content.pageSections ?? [])
        for (const [k, v] of Object.entries(s.fields as Record<string, string>))
          if (/(?:_items|tech_names)$/.test(k)) v.split(/[,|;]/).forEach((n) => n.trim() && names.add(n.trim()));
    await pool().end();
  }
  return [...names];
}

(async () => {
  const names = await siteNames();
  const index: Record<string, string> = {};
  const marks: Record<string, Omit<Mark, "id">> = {};
  const missing: string[] = [];
  for (const name of names) {
    const mark = resolve(name);
    if (!mark) {
      missing.push(name);
      continue;
    }
    const { id, ...rest } = mark;
    index[normalizeTech(name)] = id;
    marks[id] = rest;
  }
  const header =
    "// Generated by scripts/build-brand-icons.ts from Simple Icons (CC0) and Devicon (MIT). Do not edit.\n" +
    "// Brand names and marks are trademarks of their respective owners.\n";
  // Small name -> logo id index (bundled into pages); artwork is served by /brand/<id>.svg.
  fs.writeFileSync(
    "src/brand-icons.generated.ts",
    header +
      `export const brandIndex: Record<string, string> = ${JSON.stringify(index)};\n` +
      `export const brandTitles: Record<string, string> = ${JSON.stringify(Object.fromEntries(Object.entries(marks).map(([id, m]) => [id, m.t])))};\n`,
  );
  fs.writeFileSync(
    "src/brand-marks.generated.ts",
    header +
      "export type BrandMark = { t: string; v: string; c?: string; p?: string; m?: string };\n" +
      `export const brandMarks: Record<string, BrandMark> = ${JSON.stringify(marks)};\n`,
  );
  console.log(`brand icons: ${Object.keys(index).length} names -> ${Object.keys(marks).length} logos, ${missing.length} use line icons`);
  console.log("line-icon names:", missing.sort().join(" | "));
})();
