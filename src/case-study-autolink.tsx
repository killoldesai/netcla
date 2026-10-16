import type { ReactNode } from "react";
import { sitePages } from "./site-structure";

// Inline links inside case study text. Phrases come from the site structure, so a service, technology or industry
// page that is added later starts being linked from existing case studies without any edit.

export type LinkTarget = { phrase: string; path: string };
export type LinkState = { used: Set<string>; left: number };

const BLOCKED = new Set(["startups", "web", "mobile", "software", "cloud", "hire developers", "ai", "design"]);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Linkable phrases for live pages. Pages the study is about come first, then longer phrases before shorter ones. */
export function linkTargets(live: Set<string>, preferred: string[]): LinkTarget[] {
  const out: LinkTarget[] = [];
  for (const p of sitePages) {
    if (!live.has(p.path) || !["service", "technology", "industry", "pillar"].includes(p.type)) continue;
    const phrases = new Set([p.label, p.label.replace(/\s+(development|services|software)$/i, "")]);
    for (const phrase of phrases)
      if ((phrase.length >= 4 || /^[A-Z0-9]{3}$/.test(phrase)) && !BLOCKED.has(phrase.toLowerCase())) out.push({ phrase, path: p.path });
  }
  const rank = (t: LinkTarget) => {
    const i = preferred.indexOf(t.path);
    return i === -1 ? 1000 : i;
  };
  return out.sort((a, b) => rank(a) - rank(b) || b.phrase.length - a.phrase.length);
}

/** Links the first mention of each target page in `text`, sharing one budget across the whole article. */
export function autoLink(text: string, targets: LinkTarget[], state: LinkState): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (state.left > 0 && rest) {
    let best: { index: number; length: number; path: string } | null = null;
    for (const t of targets) {
      if (state.used.has(t.path)) continue;
      const m = new RegExp(`(?<![A-Za-z0-9])${escape(t.phrase)}(?![A-Za-z0-9])`, "i").exec(rest);
      if (m && (!best || m.index < best.index || (m.index === best.index && m[0].length > best.length))) best = { index: m.index, length: m[0].length, path: t.path };
    }
    if (!best) break;
    if (best.index) nodes.push(rest.slice(0, best.index));
    nodes.push(<a key={key++} href={best.path}>{rest.slice(best.index, best.index + best.length)}</a>);
    state.used.add(best.path);
    state.left--;
    rest = rest.slice(best.index + best.length);
  }
  if (rest) nodes.push(rest);
  return nodes;
}
