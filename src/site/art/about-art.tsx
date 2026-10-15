// About hero illustration: four locations (India delivery team, US, UK and Australia client teams) joined to one delivery process and shared working hours. Ported from html-prototype/about.html (token classes only, see public/assets/nx/site.css).
export function AboutArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 1120 630"
      role="img"
      aria-label="Four locations connected to one delivery process: a delivery team in India and client teams in the US, UK and Australia, sharing working hours across time zones while work moves through discovery, design, development and deployment."
    >
      <rect className="f-i50" width="1120" height="630" rx="28" />
      <g className="float-a">
        <rect className="f-surface s-line" x="80" y="90" width="210" height="104" rx="18" />
        <circle className="f-indigo pulse" cx="116" cy="140" r="16" />
        <circle className="f-indigo" cx="116" cy="140" r="16" />
        <text x="146" y="134" fontSize="28" fontWeight="600" className="f-ink">
          India
        </text>
        <text x="146" y="168" fontSize="22" className="f-muted about-sub">
          Delivery team
        </text>
      </g>
      <g className="float-b">
        <rect className="f-surface s-line" x="330" y="90" width="210" height="104" rx="18" />
        <circle className="f-lime" cx="366" cy="140" r="16" />
        <text x="396" y="134" fontSize="28" fontWeight="600" className="f-ink">
          US
        </text>
        <text x="396" y="168" fontSize="22" className="f-muted about-sub">
          Client team
        </text>
      </g>
      <g className="float-c">
        <rect className="f-surface s-line" x="580" y="90" width="210" height="104" rx="18" />
        <circle className="f-lime" cx="616" cy="140" r="16" />
        <text x="646" y="134" fontSize="28" fontWeight="600" className="f-ink">
          UK
        </text>
        <text x="646" y="168" fontSize="22" className="f-muted about-sub">
          Client team
        </text>
      </g>
      <g className="float-a">
        <rect className="f-surface s-line" x="830" y="90" width="210" height="104" rx="18" />
        <circle className="f-lime" cx="866" cy="140" r="16" />
        <text x="896" y="134" fontSize="28" fontWeight="600" className="f-ink">
          Australia
        </text>
        <text x="896" y="168" fontSize="22" className="f-muted about-sub">
          Client team
        </text>
      </g>
      <path className="s-indigo s-dash dash-move" d="M185 194 V288" />
      <path className="s-indigo s-dash dash-move" d="M435 194 V288" />
      <path className="s-indigo s-dash dash-move" d="M685 194 V288" />
      <path className="s-indigo s-dash dash-move" d="M935 194 V288" />
      <rect className="f-surface s-line" x="60" y="288" width="1000" height="90" rx="45" />
      <g className="float-b">
        <rect className="f-i100" x="96" y="311" width="208" height="44" rx="22" />
        <text x="200" y="341" textAnchor="middle" fontSize="24" fontWeight="600" className="f-ink">
          Discovery
        </text>
        <rect className="f-i100" x="316" y="311" width="208" height="44" rx="22" />
        <text x="420" y="341" textAnchor="middle" fontSize="24" fontWeight="600" className="f-ink">
          Design
        </text>
        <rect className="f-i100" x="536" y="311" width="208" height="44" rx="22" />
        <text x="640" y="341" textAnchor="middle" fontSize="24" fontWeight="600" className="f-ink">
          Development
        </text>
        <rect className="f-lime" x="756" y="311" width="208" height="44" rx="22" />
        <text x="860" y="341" textAnchor="middle" fontSize="24" fontWeight="600" className="f-ink">
          Deploy
        </text>
      </g>
      <rect className="f-l50" x="140" y="436" width="840" height="72" rx="36" />
      <circle className="f-indigo" cx="186" cy="472" r="12" />
      <circle className="f-indigo" cx="934" cy="472" r="12" />
      <text x="560" y="482" textAnchor="middle" fontSize="26" fontWeight="600" className="f-ink">
        Shared working hours
      </text>
    </svg>
  );
}
