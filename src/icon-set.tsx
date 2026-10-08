// One line-icon set for the whole site: 24px grid, 1.75 stroke, currentColor.
// Menus, homepage, generated pages and the admin all draw from here so every
// icon shares the same weight and style. iconFor() picks an icon from text.

const P: Record<string, string> = {
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14",
  mobile: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2",
  ai: "M8 8h8v8H8zM10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3M11 11h2v2h-2z",
  cloud: "M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.5 4.25 4.25 0 0 0 7 18z",
  settings: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1",
  layers: "M12 3l9 4.5-9 4.5-9-4.5zM3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5",
  shield: "M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6zM9 12l2 2 4-4",
  lock: "M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3M12 15v2",
  users: "M9 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 20v-1a5 5 0 0 1 10 0v1M16 5a3 3 0 0 1 0 6M18 14a4 4 0 0 1 3 4v2",
  rocket: "M9 15l-3-3c1.5-4 5-8 12-9-1 7-5 10.5-9 12zM5 15c-1 1-1.5 3.5-1.5 4.5 1 0 3.5-.5 4.5-1.5M14.5 8a1.5 1.5 0 1 0 0 .01",
  chart: "M3 21h18M6 17v-5M11 17V7M16 17v-3M21 17V9",
  document: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4",
  api: "M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5",
  database: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  search: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-4.5-4.5",
  cart: "M3 4h2l2.5 11h10.5l2-8H6.5M9 19.5a.5.5 0 1 0 0 .01M17 19.5a.5.5 0 1 0 0 .01",
  card: "M3 6h18v13H3zM3 10h18M7 15h4",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  bell: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
  chat: "M4 5h16v11H9l-5 4zM8 10h8M8 13h5",
  sync: "M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4",
  gauge: "M4 18a8 8 0 1 1 16 0M12 18l4-6M8 18h8",
  puzzle: "M4 7h4V5.5a2 2 0 1 1 4 0V7h4v4h1.5a2 2 0 1 1 0 4H16v4h-4v-1.5a2 2 0 1 0-4 0V19H4v-4h1.5a2 2 0 1 0 0-4H4z",
  workflow: "M3 3h6v6H3zM15 15h6v6h-6zM9 6h6a3 3 0 0 1 3 3v6",
  web: "M3 4h18v16H3zM3 9h18M6.5 6.5h.01M9 6.5h.01",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  wrench: "M15 4a4 4 0 0 0-4 5l-7 7v4h4l7-7a4 4 0 0 0 5-4l-2.5 2.5-3-3z",
  calendar: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  camera: "M4 8h3l2-3h6l2 3h3v11H4zM12 9.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
  iot: "M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0M2 9a14 14 0 0 1 20 0M12 19h.01",
  terminal: "M3 4h18v16H3zM7 9l3 3-3 3M12 15h5",
  palette: "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8zM7.5 11h.01M10 7.5h.01M14.5 7.5h.01",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  check: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6",
  target: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 11.5a.5.5 0 1 0 0 1",
  megaphone: "M3 10v4l13 5V5zM16 9a3 3 0 0 1 0 6M7 15l1 5h3l-1-4",
  link: "M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1",
  container: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5",
  beaker: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9",
  health: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6z",
  bank: "M3 10l9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 21h18",
  book: "M12 6c-2-1.5-5-2-8-1v14c3-1 6-.5 8 1 2-1.5 5-2 8-1V5c-3-1-6-.5-8 1zM12 6v14",
  building: "M5 21V4h10v17M15 9h4v12M3 21h18M8 8h4M8 12h4M8 16h4",
  truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7M7 18.5a1.5 1.5 0 1 0 0 .01M17 18.5a1.5 1.5 0 1 0 0 .01",
  bag: "M6 8h12l1 13H5zM9 8V6a3 3 0 0 1 6 0v2",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14",
  scale: "M12 4v16M7 20h10M4 8h16M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z",
  umbrella: "M3 12a9 9 0 0 1 18 0zM12 12v6a2 2 0 0 0 4 0",
  factory: "M3 21V11l5 3v-3l5 3V7l8 4v10zM3 21h18",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  git: "M6 3v12M18 6a3 3 0 1 0 0 .01M6 18a3 3 0 1 0 0 .01M18 9c0 5-6 4-12 7",
  image: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01",
  inbox: "M4 13h4l2 3h4l2-3h4M4 13l2-8h12l2 8v6H4z",
  home: "M4 11l8-7 8 7M6 9.5V20h12V9.5",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11",
  collapse: "M4 4h16v16H4zM9 4v16M15 9l-3 3 3 3",
};
export type SiteIconName = keyof typeof P;
export const siteIconNames = Object.keys(P) as SiteIconName[];

export function SiteIcon({ name, className, title }: { name: string; className?: string; title?: string }) {
  const d = P[name] ?? P.spark;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}

// Ordered rules: industries first, then capabilities, then technologies.
// Whole-word matching avoids accidental hits such as "ai" inside "retail".
const rules: [RegExp, SiteIconName][] = [
  [/\b(health|healthcare|medical|medtech|patient|clinic|clinical|hospital|pharma)/i, "health"],
  [/\b(insurtech|insurance|underwrit|claims?)\b/i, "umbrella"],
  [/\b(fintech|finance|financial|bank|banking|lending|wealth|trading)/i, "bank"],
  [/\b(edtech|education|learning|school|course|lms|student|e-learning)/i, "book"],
  [/\b(real estate|property|proptech|construction)/i, "building"],
  [/\b(logistics|supply chain|fleet|shipping|freight|delivery|field service|warehouse|route)/i, "truck"],
  [/\b(retail|e-?commerce|shop|store|catalogue|catalog|marketplace|pos)\b/i, "bag"],
  [/\b(travel|hospitality|tourism|hotel|booking|reservation)/i, "map"],
  [/\b(legal|legaltech|law|contract|matter)/i, "scale"],
  [/\b(hrtech|hr|recruit|recruitment|workforce|payroll|talent)\b/i, "users"],
  [/\b(manufactur|factory|industrial|production line)/i, "factory"],
  [/\b(on-demand|on demand|gig|dispatch)/i, "clock"],
  [/\b(ai|ml|llm|gpt|nlp|genai|generative|machine learning|deep learning|neural|tensorflow|pytorch|intelligen|chatbot|copilot|rag)\b/i, "ai"],
  [/\b(computer vision|vision|camera|scan|scanning|barcode|ocr|image recognition)/i, "camera"],
  [/\b(iot|device|sensor|bluetooth|ble|nfc|wearable|embedded)/i, "iot"],
  [/\b(security|secure|auth|authentication|authorisation|authorization|compliance|gdpr|hipaa|pci|soc ?2|encrypt|biometric|sso|identity)/i, "shield"],
  [/\b(test|testing|qa|quality|bug|automated tests|jest|cypress|selenium|espresso|xctest)/i, "beaker"],
  [/\b(deploy|deployment|release|launch|ci\/cd|ci|cd|pipeline|devops|go-live|store submission|play console|app store)/i, "rocket"],
  [/\b(docker|kubernetes|k8s|container|helm|terraform|infrastructure)/i, "container"],
  [/\b(database|data model|sql|postgres|postgresql|mysql|mongo|mongodb|firestore|room|redis|storage|data warehouse|etl)/i, "database"],
  [/\b(analytics|analytic|report|reporting|dashboard|metrics|insight|kpi|bi)\b/i, "chart"],
  [/\b(performance|speed|optimi[sz]|latency|scal(e|ing|ability))/i, "gauge"],
  [/\b(payment|checkout|billing|subscription|stripe|wallet|invoice)/i, "card"],
  [/\b(cart|commerce|shopify|magento|woocommerce)/i, "cart"],
  [/\b(map|maps|location|gps|geofenc|tracking)/i, "pin"],
  [/\b(notification|push|messaging|fcm|email|sms|alert)/i, "bell"],
  [/\b(api|apis|rest|graphql|integration|integrat|webhook|sdk|sdks|connector|third-party)/i, "api"],
  [/\b(chat|conversation|assistant|support desk|helpdesk)/i, "chat"],
  [/\b(cloud|aws|azure|gcp|google cloud|firebase|hosting|serverless|lambda|cdn)/i, "cloud"],
  [/\b(design|ui|ux|prototype|prototyping|wireframe|figma|material design|branding)/i, "palette"],
  [/\b(architecture|architect|component|module|modular|library|libraries|framework|jetpack|viewmodel|livedata|retrofit)/i, "layers"],
  [/\b(automation|automate|workflow|process|orchestrat)/i, "workflow"],
  [/\b(maintenance|maintain|support|update|upgrade|monitoring|sla)/i, "wrench"],
  [/\b(migration|migrate|legacy|moderni[sz]|refactor|sync|real-time|realtime|offline)/i, "sync"],
  [/\b(document|documentation|requirement|specification|spec|discovery|handover|brief|scope)/i, "document"],
  [/\b(consult|consulting|strategy|roadmap|planning|plan|audit|assessment)/i, "target"],
  [/\b(schedul|appointment|calendar|booking)/i, "calendar"],
  [/\b(seo|search|keyword|ranking)/i, "search"],
  [/\b(ads|ppc|campaign|marketing|advertis)/i, "megaphone"],
  [/\b(team|developer|developers|engineer|engineers|collaborat|hire|staff|dedicated)/i, "users"],
  [/\b(web|website|browser|frontend|front-end|react|next\.?js|angular|vue|html|css)/i, "web"],
  [/\b(mobile|android|ios|iphone|ipad|app|apps|flutter|react native|swiftui)\b/i, "mobile"],
  [/\b(git|github|gitlab|version control|bitbucket)/i, "git"],
  [/\b(studio|xcode|ide|gradle|cli|terminal|toolchain|vs code)/i, "terminal"],
  [/\b(code|coding|develop|development|build|kotlin|java|swift|dart|python|typescript|javascript|php|go|golang|\.net|c#|ruby|node)/i, "code"],
  [/\b(global|international|multi-region|localisation|localization)/i, "globe"],
  [/\b(link|connect|network)/i, "link"],
  [/\b(monitor|observability|logging|visibility)/i, "eye"],
];
const fallbacks: SiteIconName[] = ["layers", "spark", "target", "puzzle", "check"];

/** Pick an icon for a heading, card title or technology name. Never returns undefined. */
export function iconFor(text: string, context = ""): SiteIconName {
  const hit = rules.find(([re]) => re.test(text)) ?? (context ? rules.find(([re]) => re.test(context)) : undefined);
  if (hit) return hit[1];
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return fallbacks[h % fallbacks.length];
}

/** Map legacy sprite keys (from older drafts) onto the shared set. */
export const legacyIcon: Record<string, SiteIconName> = {
  "code-brackets": "code",
  "mobile-device": "mobile",
  "brain-circuit": "ai",
  "cloud-upload": "cloud",
  "settings-gear": "settings",
  "layers-stack": "layers",
  "shield-check": "shield",
  "users-group": "users",
  "rocket-launch": "rocket",
  "chart-bar": "chart",
  "document-text": "document",
  "api-plug": "api",
  "flutter-diamond": "mobile",
  "react-atom": "web",
  "nodejs-hexagon": "code",
  "python-snake": "code",
  "aws-cloud": "cloud",
  "kubernetes-wheel": "container",
  "docker-whale": "container",
  "terraform-blocks": "container",
};
