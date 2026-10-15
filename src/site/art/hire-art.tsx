// Hire hero illustration: developer profile card with skill chips and a component window. Ported from html-prototype/hire.html (token classes only, see public/assets/nx/site.css).
export function HireArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A React developer profile card with skill chips for React, hooks, Redux, Next.js, GraphQL, Jest and TypeScript, a React component window with code lines, and a stack of team avatars"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <path className="s-indigo s-dash dash-move" d="M292 164 L308 164" />
      <path className="s-indigo s-dash dash-move" d="M412 304 L412 268" />
      <g className="float-a">
        <rect className="f-surface s-line" x="56" y="64" width="232" height="250" rx="16" />
        <circle className="f-indigo" cx="104" cy="120" r="26" />
        <text x="104" y="126" textAnchor="middle" fontSize="15" fontWeight="600" className="f-on-indigo">
          AB
        </text>
        <rect className="f-ink" x="144" y="106" width="100" height="9" rx="4.5" />
        <rect className="f-i100" x="144" y="124" width="72" height="7" rx="3.5" />
        <line className="s-line" x1="56" y1="164" x2="288" y2="164" />
        <text x="76" y="190" fontSize="11" className="f-muted">
          Skills
        </text>
        <rect className="f-indigo" x="76" y="198" width="60" height="24" rx="12" />
        <text x="106" y="214" textAnchor="middle" fontSize="12" className="f-on-indigo">
          React
        </text>
        <rect className="f-i50" x="144" y="198" width="72" height="24" rx="12" />
        <text x="180" y="214" textAnchor="middle" fontSize="12" className="f-ink">
          Hooks
        </text>
        <rect className="f-i50" x="224" y="198" width="56" height="24" rx="12" />
        <text x="252" y="214" textAnchor="middle" fontSize="12" className="f-ink">
          Redux
        </text>
        <rect className="f-i50" x="76" y="232" width="78" height="24" rx="12" />
        <text x="115" y="248" textAnchor="middle" fontSize="12" className="f-ink">
          Next.js
        </text>
        <rect className="f-l50" x="162" y="232" width="70" height="24" rx="12" />
        <text x="197" y="248" textAnchor="middle" fontSize="12" className="f-ink">
          GraphQL
        </text>
        <rect className="f-i50" x="240" y="232" width="40" height="24" rx="12" />
        <text x="260" y="248" textAnchor="middle" fontSize="12" className="f-ink">
          Jest
        </text>
        <rect className="f-lime" x="76" y="266" width="86" height="24" rx="12" />
        <text x="119" y="282" textAnchor="middle" fontSize="12" className="f-ink">
          Testing
        </text>
        <rect className="f-i50" x="170" y="266" width="92" height="24" rx="12" />
        <text x="216" y="282" textAnchor="middle" fontSize="12" className="f-ink">
          TypeScript
        </text>
      </g>
      <g className="float-b">
        <rect className="f-surface s-line" x="312" y="120" width="200" height="176" rx="16" />
        <rect className="f-i50" x="312" y="120" width="200" height="30" rx="16" />
        <circle className="f-line" cx="330" cy="135" r="4" />
        <circle className="f-line" cx="344" cy="135" r="4" />
        <circle className="f-lime" cx="358" cy="135" r="4" />
        <rect className="f-indigo" x="330" y="166" width="44" height="7" rx="3.5" />
        <rect className="f-i100" x="382" y="166" width="96" height="7" rx="3.5" />
        <rect className="f-indigo" x="346" y="182" width="30" height="7" rx="3.5" />
        <rect className="f-i100" x="384" y="182" width="72" height="7" rx="3.5" />
        <rect className="f-lime" x="346" y="198" width="38" height="7" rx="3.5" />
        <rect className="f-i100" x="392" y="198" width="82" height="7" rx="3.5" />
        <rect className="f-i100" x="346" y="214" width="110" height="7" rx="3.5" />
        <rect className="f-indigo" x="330" y="230" width="18" height="7" rx="3.5" />
        <rect className="f-indigo" x="330" y="258" width="92" height="22" rx="11" />
        <rect className="f-lime" x="430" y="258" width="66" height="22" rx="11" />
      </g>
      <g className="float-c">
        <circle className="f-indigo" cx="104" cy="352" r="24" />
        <text x="104" y="357" textAnchor="middle" fontSize="13" fontWeight="600" className="f-on-indigo">
          CD
        </text>
        <circle className="f-lime" cx="152" cy="352" r="24" />
        <text x="152" y="357" textAnchor="middle" fontSize="13" fontWeight="600" className="f-ink">
          EF
        </text>
        <circle className="f-sky" cx="200" cy="352" r="24" />
        <text x="200" y="357" textAnchor="middle" fontSize="13" fontWeight="600" className="f-ink">
          GH
        </text>
        <circle className="f-i100" cx="248" cy="352" r="24" />
        <text x="248" y="357" textAnchor="middle" fontSize="16" className="f-ink">
          +
        </text>
      </g>
      <g className="float-b">
        <circle className="f-indigo pulse" cx="500" cy="80" r="22" />
        <circle className="f-indigo" cx="500" cy="80" r="22" />
        <path className="s-ink" d="M491 80l6 6 12-13" />
      </g>
    </svg>
  );
}
