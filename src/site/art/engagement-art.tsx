// Engagement models hero illustration: a fixed-scope project box, a dedicated team ring and one developer
// joined to a team. Ported from html-prototype/engagement-models.html (token classes only, see public/assets/nx/site.css).
export function EngagementArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="Three ways to work: a project box with a fixed scope and milestones, a dedicated team ring of connected people, and one developer card joined by a dashed line to an existing team"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <g className="float-a">
        <rect className="f-surface s-line" x="40" y="110" width="170" height="190" rx="16" />
        <rect className="f-indigo" x="40" y="110" width="170" height="44" rx="16" />
        <rect className="f-indigo" x="40" y="136" width="170" height="18" />
        <text x="58" y="137" fontSize="13" fontWeight="600" className="f-on-indigo">
          Fixed scope
        </text>
        <circle className="f-lime" cx="62" cy="184" r="8" />
        <rect className="f-line" x="80" y="180" width="108" height="8" rx="4" />
        <circle className="f-lime" cx="62" cy="214" r="8" />
        <rect className="f-line" x="80" y="210" width="90" height="8" rx="4" />
        <circle className="f-i100" cx="62" cy="244" r="8" />
        <rect className="f-line" x="80" y="240" width="100" height="8" rx="4" />
        <rect className="f-i100" x="58" y="262" width="134" height="22" rx="11" />
        <text x="125" y="277" textAnchor="middle" fontSize="11" className="f-indigo">
          Milestone review
        </text>
      </g>
      <circle className="s-indigo s-dash dash-move" cx="300" cy="210" r="78" />
      <circle className="f-indigo" cx="300" cy="132" r="15" />
      <circle className="f-indigo" cx="374" cy="186" r="15" />
      <circle className="f-indigo" cx="346" cy="273" r="15" />
      <circle className="f-indigo" cx="254" cy="273" r="15" />
      <circle className="f-indigo" cx="226" cy="186" r="15" />
      <circle className="f-ink" cx="300" cy="210" r="30" />
      <text x="300" y="215" textAnchor="middle" fontSize="13" fontWeight="600" className="f-paper">
        Team
      </text>
      <path className="s-indigo s-dash dash-move" d="M390 186 L408 186" />
      <g className="float-b">
        <rect className="f-surface s-line" x="410" y="150" width="120" height="110" rx="14" />
        <circle className="f-lime" cx="446" cy="190" r="16" />
        <rect className="f-ink" x="470" y="182" width="48" height="8" rx="4" />
        <rect className="f-i100" x="470" y="198" width="34" height="7" rx="3.5" />
        <rect className="f-line" x="430" y="222" width="80" height="12" rx="6" />
      </g>
      <text x="120" y="340" textAnchor="middle" fontSize="14" fontWeight="600" className="f-ink">
        Project
      </text>
      <text x="300" y="340" textAnchor="middle" fontSize="14" fontWeight="600" className="f-ink">
        Dedicated team
      </text>
      <text x="470" y="340" textAnchor="middle" fontSize="14" fontWeight="600" className="f-ink">
        Extension
      </text>
      <text x="300" y="370" textAnchor="middle" fontSize="12" className="f-muted">
        Each one fits a different way of working
      </text>
    </svg>
  );
}
