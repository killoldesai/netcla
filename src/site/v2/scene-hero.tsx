// Split hero with an animated scene, for the company, work and resource pages (same layout as the service showcase hero).
// Copy and links come from the page's own content; the scene is a HeroScene. The accent word is the last word of a
// heading with more than two words.
import type { ReactNode } from "react";
import { V2Crumbs, V2_VERSION } from "./ui";

export function SceneHero({
  id = "hero",
  labelId,
  trail,
  eyebrow,
  h1,
  sub,
  signals = [],
  actions,
  scene,
}: {
  id?: string;
  labelId: string;
  trail: { label: string; href?: string }[];
  eyebrow?: string;
  h1: string;
  sub?: string;
  signals?: string[];
  actions: ReactNode;
  scene: ReactNode;
}) {
  const parts = h1.trim().split(/\s+/);
  const accent = parts.length > 2 ? parts[parts.length - 1] : "";
  return (
    <>
      <link rel="stylesheet" href={`/assets/v2/home.css?v=${V2_VERSION}`} />
      <link rel="stylesheet" href={`/assets/v2/pages/showcase.css?v=${V2_VERSION}`} />
      <section id={id} className="hero sc-hero co-hero" aria-labelledby={labelId}>
        <div className="wrap hero__grid">
          <div className="hero__copy">
            {trail.length > 1 && <V2Crumbs trail={trail} />}
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 id={labelId}>
              {accent ? (
                <>
                  {parts.slice(0, -1).join(" ")} <span className="gword">{accent}</span>
                </>
              ) : (
                h1
              )}
            </h1>
            {sub && <p className="hero__sub">{sub}</p>}
            {signals.length > 0 && (
              <ul className="ticks co-hero__ticks">
                {signals.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <div className="hero__cta sc-hero__cta">{actions}</div>
          </div>
          {scene}
        </div>
      </section>
    </>
  );
}
