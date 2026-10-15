// Location hero illustration: USA and India teams on a shared timeline. Ported from html-prototype/location.html (token classes only, see public/assets/nx/site.css).
export function LocationArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A map linking a team in the USA and an engineering team in India, with working hours on one shared timeline and an overlap window in the middle"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <g className="float-a">
        <rect className="f-surface s-line" x="60" y="60" width="440" height="250" rx="16" />
        <circle className="f-line" cx="82" cy="82" r="4.5" />
        <circle className="f-line" cx="97" cy="82" r="4.5" />
        <circle className="f-lime" cx="112" cy="82" r="4.5" />
        <line className="s-line" x1="60" y1="100" x2="500" y2="100" />
        <text x="84" y="134" fontSize="13" className="f-ink">
          Working hours in each country
        </text>
        <text x="84" y="174" fontSize="12" className="f-ink">
          USA
        </text>
        <rect className="f-i100" x="150" y="160" width="330" height="20" rx="10" />
        <rect className="f-indigo" x="180" y="160" width="220" height="20" rx="10" />
        <text x="84" y="244" fontSize="12" className="f-ink">
          India
        </text>
        <rect className="f-i100" x="150" y="230" width="330" height="20" rx="10" />
        <rect className="f-ink" x="300" y="230" width="180" height="20" rx="10" />
        <rect className="f-lime" x="300" y="150" width="100" height="120" rx="10" opacity=".55" />
        <text x="350" y="144" textAnchor="middle" fontSize="12" fontWeight="600" className="f-ink">
          Overlap
        </text>
      </g>
      <path className="s-indigo s-dash dash-move" d="M120 352 L440 352" />
      <g className="float-b">
        <circle className="f-indigo" cx="120" cy="352" r="9" />
        <text x="120" y="384" textAnchor="middle" fontSize="13" fontWeight="600" className="f-ink">
          USA
        </text>
        <circle className="f-lime pulse" cx="280" cy="352" r="12" />
        <circle className="f-lime" cx="280" cy="352" r="12" />
        <circle className="f-ink" cx="280" cy="352" r="4" />
        <circle className="f-indigo" cx="440" cy="352" r="9" />
        <text x="440" y="384" textAnchor="middle" fontSize="13" fontWeight="600" className="f-ink">
          India
        </text>
      </g>
    </svg>
  );
}
