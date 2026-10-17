// Picks a generated 3D spot icon (public/assets/v2/img/ic-*.webp) for a site page, from its type, pillar and name.
import { sitePage } from "../../site-structure";

const INDUSTRY_SPOTS: [RegExp, string][] = [
  [/health|clinic|medic|patient|care/i, "ic-healthcare"],
  [/fintech|financ|bank|payment|lend|invest/i, "ic-fintech"],
  [/edu|learn|school|course|student/i, "ic-edtech"],
  [/estate|propert/i, "ic-realestate"],
  [/logist|freight|shipping|supply|fleet|warehouse/i, "ic-logistics"],
  [/on.?demand|marketplace/i, "ic-ondemand"],
  [/retail|shop|store|commerce/i, "ic-retail"],
  [/travel|hotel|hospitality|tour/i, "ic-travel"],
  [/\blegal\b|\blaw\b/i, "ic-legal"],
  [/\bhr\b|hrtech|recruit|payroll|talent/i, "ic-hr"],
  [/insur/i, "ic-insurance"],
  [/manufact|factory|industrial/i, "ic-manufacturing"],
];
// Topic words that beat the pillar default, so neighbouring pages of one pillar do not all share one icon.
const TOPIC_SPOTS: [RegExp, string][] = [
  [/mvp|prototype|proof.of.concept|discovery/i, "ic-milestones"],
  [/offshore|outsourc|india|dedicated team|nearshore|time.?zone/i, "ic-timezone"],
  [/devops|ci.?cd|kubernetes|docker|infrastructure/i, "ic-devops"],
  [/cloud|aws|azure|serverless/i, "ic-cloud"],
  [/ai|machine learning|llm|chatbot|generative/i, "ic-ai"],
  [/mobile|ios|android|flutter|react native/i, "ic-mobile"],
  [/secur|compliance|penetration/i, "ic-security"],
  [/maintenance|support|managed|sla/i, "ic-support"],
  [/consult|strategy|audit|architecture|scoping/i, "ic-scope"],
  [/cost|pricing|budget|estimate/i, "ic-cost"],
];
const BY_PILLAR: Record<string, string> = { software: "ic-software", mobile: "ic-mobile", ai: "ic-ai", cloud: "ic-cloud", web: "ic-software", marketing: "ic-scope", hire: "ic-team", industries: "ic-healthcare" };
const FALLBACKS = ["ic-software", "ic-scope", "ic-milestones", "ic-team", "ic-security", "ic-cost"];

/** Short label for the kind of page a related link points to. */
export const PAGE_KIND: Record<string, string> = { service: "Service", technology: "Technology", hire: "Hire developers", industry: "Industry", location: "Location", pillar: "Hub", company: "Company", guide: "Guide", directory: "Directory", contact: "Contact" };

export function spotForPage(path: string, label = "", index = 0): string {
  const page = sitePage(path);
  const name = label || page?.label || "";
  if (page?.type === "industry") return INDUSTRY_SPOTS.find(([re]) => re.test(name))?.[1] ?? "ic-security";
  if (page?.type === "location") return "ic-timezone";
  if (page?.type === "hire") return "ic-team";
  if (page?.type === "guide") return "ic-scope";
  const topic = TOPIC_SPOTS.find(([re]) => re.test(name))?.[1];
  if (topic) return topic;
  if (page?.pillar && BY_PILLAR[page.pillar]) return BY_PILLAR[page.pillar];
  return INDUSTRY_SPOTS.find(([re]) => re.test(name))?.[1] ?? FALLBACKS[index % FALLBACKS.length];
}

/** Pastel tint class for the nth card in a grid. */
export const relTint = (i: number) => ["lavender", "sky", "lime", "peach"][i % 4];
