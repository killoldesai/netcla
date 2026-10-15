// Map illustration for the "Why Netofficials" block, ported from html-prototype/index.html. Token classes only.
export function HomeWhyArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 480 300"
      role="img"
      aria-label="Map showing the engineering team in India working with clients in the USA, UK and Australia"
    >
      <defs>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.6" className="f-line" />
        </pattern>
      </defs>
      <rect width="480" height="300" rx="16" fill="url(#dots)" />
      <path className="s-indigo dash-move" d="M330 160 Q 200 250 90 120" />
      <path className="s-indigo dash-move" d="M330 160 Q 280 70 220 86" />
      <path className="s-indigo dash-move" d="M330 160 Q 420 170 410 246" />
      <circle className="f-indigo" cx="90" cy="120" r="8" />
      <text
        x="90"
        y="146"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        className="f-ink"
      >
        USA
      </text>
      <circle className="f-indigo" cx="220" cy="86" r="8" />
      <text
        x="220"
        y="70"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        className="f-ink"
      >
        UK
      </text>
      <circle className="f-indigo" cx="410" cy="246" r="8" />
      <text
        x="410"
        y="276"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        className="f-ink"
      >
        Australia
      </text>
      <circle className="f-lime pulse" cx="330" cy="160" r="12" />
      <circle className="f-lime" cx="330" cy="160" r="12" />
      <circle className="f-ink" cx="330" cy="160" r="4" />
      <rect
        className="f-band"
        x="262"
        y="186"
        width="136"
        height="30"
        rx="15"
      />
      <text
        x="330"
        y="206"
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="var(--on-band)"
      >
        India · engineering
      </text>
    </svg>
  );
}
