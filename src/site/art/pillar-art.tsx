// Hub hero illustration: code editor with component card. Ported from html-prototype/pillar.html (token classes only, see public/assets/nx/site.css).
export function PillarArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A code editor with a component card and a code chip, showing a software product being built and connected to its services"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <path className="s-indigo s-dash dash-move" d="M372 210 L332 230" />
      <path className="s-indigo s-dash dash-move" d="M440 150 L440 128" />
      <g className="float-a">
        <rect className="f-band" x="60" y="70" width="320" height="262" rx="16" />
        <circle className="f-i100" cx="84" cy="92" r="4.5" opacity=".5" />
        <circle className="f-i100" cx="99" cy="92" r="4.5" opacity=".5" />
        <circle className="f-lime" cx="114" cy="92" r="4.5" />
        <line className="s-line" x1="60" y1="110" x2="380" y2="110" opacity=".35" />
        <rect className="f-i100" x="82" y="130" width="18" height="7" rx="3.5" opacity=".4" />
        <rect className="f-lime" x="108" y="130" width="54" height="7" rx="3.5" />
        <rect className="f-i100" x="170" y="130" width="80" height="7" rx="3.5" opacity=".5" />
        <rect className="f-i100" x="96" y="150" width="96" height="7" rx="3.5" opacity=".5" />
        <rect className="f-indigo" x="200" y="150" width="40" height="7" rx="3.5" />
        <rect className="f-i100" x="96" y="170" width="70" height="7" rx="3.5" opacity=".5" />
        <rect className="f-i100" x="110" y="190" width="120" height="7" rx="3.5" opacity=".5" />
        <rect className="f-lime" x="96" y="210" width="44" height="7" rx="3.5" />
        <rect className="f-i100" x="148" y="210" width="66" height="7" rx="3.5" opacity=".5" />
        <rect className="f-i100" x="110" y="230" width="104" height="7" rx="3.5" opacity=".5" />
        <rect className="f-indigo" x="96" y="250" width="36" height="7" rx="3.5" />
        <rect className="f-i100" x="140" y="250" width="92" height="7" rx="3.5" opacity=".5" />
        <rect className="f-i100" x="82" y="270" width="22" height="7" rx="3.5" opacity=".5" />
        <rect className="f-lime" x="82" y="296" width="150" height="8" rx="4" opacity=".7" />
      </g>
      <g className="float-b">
        <rect className="f-surface s-line" x="332" y="150" width="172" height="150" rx="16" />
        <rect className="f-ink" x="350" y="168" width="70" height="9" rx="4.5" />
        <rect className="f-i100" x="350" y="186" width="136" height="7" rx="3.5" />
        <rect className="f-i50" x="350" y="204" width="136" height="36" rx="10" />
        <circle className="f-indigo" cx="368" cy="222" r="7" />
        <rect className="f-i100" x="384" y="219" width="78" height="6" rx="3" />
        <rect className="f-indigo" x="350" y="252" width="136" height="32" rx="16" />
        <rect className="f-on-indigo" x="390" y="263" width="56" height="8" rx="4" opacity=".85" />
      </g>
      <g className="float-c">
        <rect className="f-lime" x="402" y="62" width="100" height="44" rx="22" />
        <text x="452" y="89" textAnchor="middle" fontSize="16" fontWeight="600" className="f-ink">
          &lt;/&gt;
        </text>
      </g>
      <g className="float-a">
        <circle className="f-indigo" cx="420" cy="346" r="18" />
        <circle className="f-lime pulse" cx="484" cy="318" r="10" />
        <circle className="f-lime" cx="484" cy="318" r="10" />
        <circle className="f-i100" cx="484" cy="378" r="10" />
        <circle className="f-i100" cx="372" cy="378" r="10" />
        <path className="s-indigo dash-move" d="M438 346 L474 320" />
      </g>
      <g className="float-b">
        <circle className="f-indigo pulse" cx="110" cy="366" r="22" />
        <circle className="f-indigo" cx="110" cy="366" r="22" />
        <path className="s-ink" d="M101 366l6 6 12-12" />
      </g>
    </svg>
  );
}
