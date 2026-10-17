// Topic-specific hero scenes for v2 showcase pages. Each scene is a large animated product mock (from deliver-mocks)
// surrounded by floating cards that carry the page's own deliverables, the way monday.com builds a feature hero from
// that feature's content. Decorative only (aria-hidden); generic interface labels, no claims, numbers or client names.
// Motion is CSS (public/assets/v2/pages/showcase.css) and stops under prefers-reduced-motion.
import { DeliverMock, type Kind } from "./deliver-mocks";
import { V2Icon, v2img } from "./ui";

export type SceneKind = "saas" | "mobile" | "ai" | "devops" | "security" | "api" | "data" | "ecommerce" | "web" | "hire" | "industry" | "location" | "hub" | "crew" | "stages" | "plans" | "checklist" | "gallery" | "faq" | "board";

type SceneDef = {
  mock: Kind;
  char: string;
  tint: string;
  bubble: string;
  bar: string;
};

const SCENES: Record<Exclude<SceneKind, "board">, SceneDef> = {
  saas: { mock: "billing", char: "fullstack", tint: "var(--p-lavender)", bubble: "Checking plans and billing", bar: "Subscriptions" },
  mobile: { mock: "mobile", char: "mobile", tint: "var(--p-sky)", bubble: "Testing on real devices", bar: "App" },
  ai: { mock: "chat", char: "ai", tint: "var(--p-lime)", bubble: "Grounding answers in your content", bar: "Assistant" },
  devops: { mock: "pipeline", char: "devops", tint: "var(--p-peach)", bubble: "Shipping to staging", bar: "Pipeline" },
  security: { mock: "auth", char: "cloud", tint: "var(--p-pink)", bubble: "Reviewing access rules", bar: "Access" },
  api: { mock: "api", char: "node", tint: "var(--p-lavender)", bubble: "Documenting endpoints", bar: "Endpoints" },
  ecommerce: { mock: "shop", char: "react", tint: "var(--p-peach)", bubble: "Testing checkout", bar: "Store" },
  web: { mock: "site", char: "design", tint: "var(--p-sky)", bubble: "Checking every breakpoint", bar: "Site" },
  crew: { mock: "crew", char: "lead", tint: "var(--p-lavender)", bubble: "Working as one team", bar: "Team" },
  stages: { mock: "stages", char: "lead", tint: "var(--p-lime)", bubble: "Moving through the stages", bar: "Stages" },
  plans: { mock: "plans", char: "lead", tint: "var(--p-peach)", bubble: "Choosing the right model", bar: "Models" },
  checklist: { mock: "checklist", char: "lead", tint: "var(--p-sky)", bubble: "Weighing the options", bar: "Checklist" },
  gallery: { mock: "gallery", char: "design", tint: "var(--p-pink)", bubble: "Browsing the library", bar: "Library" },
  faq: { mock: "chat", char: "lead", tint: "var(--p-sky)", bubble: "Answers in plain language", bar: "Questions" },
  hub: { mock: "hub", char: "lead", tint: "var(--p-lavender)", bubble: "Choosing the right service", bar: "Services" },
  hire: { mock: "roster", char: "fullstack", tint: "var(--p-lime)", bubble: "Reviewing your brief", bar: "Developer" },
  industry: { mock: "sector", char: "data", tint: "var(--p-lavender)", bubble: "Mapping your workflows", bar: "Operations" },
  location: { mock: "zones", char: "lead", tint: "var(--p-sky)", bubble: "Planning shared hours", bar: "Working hours" },
  data: { mock: "dashboard", char: "data", tint: "var(--p-sky)", bubble: "Building the first dashboard", bar: "Reports" },
};

const RULES: [RegExp, SceneKind][] = [
  [/ecommerce|e-commerce|shopify|woocommerce|magento|online-store|marketplace/, "ecommerce"],
  [/saas|subscription|multi-tenant|web-app|web-application|portal/, "saas"],
  [/mobile|ios|android|flutter|react-native|app-development/, "mobile"],
  [/(^|[/-])ai([/-]|$)|machine-learning|deep-learning|mlops|llm|chatbot|generative|natural-language|computer-vision|recommendation|gpt/, "ai"],
  [/devops|cloud|aws|azure|kubernetes|docker|ci-cd|infrastructure/, "devops"],
  [/security|compliance|auth|identity|penetration/, "security"],
  [/api|integration|microservice/, "api"],
  [/data|analytics|dashboard|business-intelligence|\bbi\b|reporting|erp|crm|enterprise|ppc|google-ads/, "data"],
  [/website|web-design|wordpress|cms|landing|seo|ui-ux|redesign|front-?end/, "web"],
];

/** Technology pages: the scene that shows the kind of work that technology does (checked in order). */
const TECH_RULES: [RegExp, SceneKind][] = [
  [/shopify|magento|woocommerce/, "ecommerce"],
  [/flutter|react-native|kotlin|swift/, "mobile"],
  [/kubernetes|docker|terraform/, "devops"],
  [/mongodb|postgresql/, "data"],
  [/react|nextjs|angular|vuejs|typescript|wordpress/, "web"],
];

/** Developer character for a hire page, from the technology in its URL. */
const HIRE_CHARS: [RegExp, string][] = [
  [/react-native|flutter/, "flutter"],
  [/nextjs|next-js/, "nextjs"],
  [/react/, "react"],
  [/node/, "node"],
  [/python|django|fastapi/, "python"],
  [/laravel|php/, "laravel"],
  [/ios|swift/, "ios"],
  [/android|kotlin/, "android"],
  [/aws|azure|cloud/, "aws"],
  [/devops|kubernetes/, "devops"],
  [/(^|[/-])ai([/-]|$)|machine|llm|ml-/, "ai"],
  [/data/, "data"],
  [/qa|test/, "qa"],
];
export const hireChar = (path: string) => HIRE_CHARS.find(([re]) => re.test(path.toLowerCase()))?.[1] ?? "fullstack";

/** Short role name for the profile card: "/hire-react-developer" becomes "React developer"; other pages keep the fallback. */
export function hireRole(path: string, fallback: string) {
  const m = path.match(/^\/hire-(.+)$/);
  if (!m) return fallback;
  const words = m[1].split("-").map((w) => ({ nodejs: "Node.js", vuejs: "Vue.js", dotnet: ".NET", wordpress: "WordPress", woocommerce: "WooCommerce", ios: "iOS", aws: "AWS", ai: "AI", ml: "ML", ui: "UI", ux: "UX", php: "PHP", devops: "DevOps" } as Record<string, string>)[w] ?? w);
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Scene for a page: hire, industry and location pages have their own; services pick one from the topic, else `board` (the project board). */
export function sceneFor(path: string, family = "service"): SceneKind {
  if (family === "hire" || family === "industry" || family === "location" || family === "hub") return family;
  const p = path.toLowerCase();
  if (family === "technology") return TECH_RULES.find(([re]) => re.test(p))?.[1] ?? "api";
  return RULES.find(([re]) => re.test(p))?.[1] ?? "board";
}

export function HeroScene({ kind, title, items, stack = [], char, bubble }: { kind: Exclude<SceneKind, "board">; title: string; items: string[]; stack?: string[]; char?: string; bubble?: string }) {
  const def = SCENES[kind];
  const cards = items.slice(0, 3);
  return (
    <div className={`hs hs--${kind}`} aria-hidden="true" style={{ ["--hs-tint" as string]: def.tint }}>
      <div className="hs__glow" />
      <div className="hs__main">
        {kind === "saas" && (
          <div className="hs__tenants">
            {["Workspace A", "Workspace B", "Workspace C"].map((t, i) => (
              <span key={t} className={"hs__tenant" + (i === 0 ? " on" : "")} style={{ animationDelay: `${i * 1.6}s` }}>
                {t}
              </span>
            ))}
          </div>
        )}
        <DeliverMock kind={def.mock} title={title} stack={["hire", "hub", "stages", "plans", "checklist", "gallery"].includes(kind) ? stack : cards} />
      </div>
      <div className="hs__who">
        <img src={v2img(`char-${char ?? def.char}`)} alt="" />
        <span>{bubble ?? def.bubble}</span>
      </div>
      {cards.map((c, i) => (
        <div key={c} className={`hs__card hs__card--${i + 1}`} style={{ animationDelay: `${0.4 + i * 0.5}s` }}>
          <i>
            <V2Icon name="check" />
          </i>
          <span>{c}</span>
          <b>
            <u style={{ animationDelay: `${0.8 + i * 0.5}s` }} />
          </b>
        </div>
      ))}
    </div>
  );
}
