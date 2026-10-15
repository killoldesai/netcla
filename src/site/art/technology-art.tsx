// Technology hero illustration: browser window with components and the React atom. Ported from html-prototype/technology.html (token classes only, see public/assets/nx/site.css).
export function TechnologyArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A React interface: a browser window showing a navigation bar, cards and a list built from components, a component tree on the right and the React atom symbol"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <path className="s-indigo s-dash dash-move" d="M380 200 H412" />
      <g className="float-a">
        <rect className="f-surface" x="60" y="60" width="320" height="250" rx="16" />
        <rect className="s-line" x="60" y="60" width="320" height="250" rx="16" />
        <circle className="f-line" cx="82" cy="82" r="4.5" />
        <circle className="f-line" cx="97" cy="82" r="4.5" />
        <circle className="f-lime" cx="112" cy="82" r="4.5" />
        <line className="s-line" x1="60" y1="100" x2="380" y2="100" />
        <rect className="f-i50" x="76" y="116" width="288" height="28" rx="8" />
        <rect className="f-indigo" x="88" y="126" width="44" height="8" rx="4" />
        <rect className="f-i100" x="300" y="126" width="48" height="8" rx="4" />
        <rect className="f-l50" x="76" y="156" width="136" height="100" rx="10" />
        <rect className="f-i100" x="90" y="170" width="64" height="7" rx="3.5" />
        <rect className="f-indigo" x="90" y="188" width="44" height="12" rx="6" />
        <rect className="f-lime" x="90" y="218" width="108" height="14" rx="7" />
        <rect className="f-i50" x="228" y="156" width="136" height="100" rx="10" />
        <rect className="f-i100" x="242" y="170" width="60" height="7" rx="3.5" />
        <rect className="f-i100" x="242" y="204" width="14" height="40" rx="4" />
        <rect className="f-indigo" x="262" y="188" width="14" height="56" rx="4" />
        <rect className="f-i100" x="282" y="216" width="14" height="28" rx="4" />
        <rect className="f-i100" x="302" y="196" width="14" height="48" rx="4" />
        <rect className="f-indigo" x="322" y="208" width="14" height="36" rx="4" />
        <rect className="f-surface" x="76" y="268" width="288" height="32" rx="10" />
        <circle className="f-indigo" cx="92" cy="284" r="5" />
        <rect className="f-i100" x="106" y="281" width="120" height="7" rx="3.5" />
        <rect className="f-i100" x="250" y="281" width="80" height="7" rx="3.5" />
        <rect className="s-indigo s-dash" x="70" y="150" width="156" height="112" rx="14" />
      </g>
      <g className="float-c">
        <rect className="f-surface" x="404" y="60" width="100" height="84" rx="16" />
        <rect className="s-line" x="404" y="60" width="100" height="84" rx="16" />
        <ellipse className="s-indigo" cx="454" cy="102" rx="36" ry="13" />
        <ellipse className="s-indigo" cx="454" cy="102" rx="36" ry="13" transform="rotate(60 454 102)" />
        <ellipse className="s-indigo" cx="454" cy="102" rx="36" ry="13" transform="rotate(120 454 102)" />
        <circle className="f-lime pulse" cx="454" cy="102" r="6" />
        <circle className="f-lime" cx="454" cy="102" r="6" />
      </g>
      <g className="float-b">
        <rect className="f-indigo" x="412" y="160" width="84" height="30" rx="8" />
        <text x="454" y="180" textAnchor="middle" fontSize="12" className="f-on-indigo">
          App
        </text>
        <path className="s-line" d="M418 190 V308" />
        <path className="s-line" d="M418 224 H428M418 266 H428M418 308 H428" />
        <rect className="f-surface" x="428" y="210" width="76" height="28" rx="8" />
        <text x="466" y="228" textAnchor="middle" fontSize="12" className="f-ink">
          Nav
        </text>
        <rect className="f-surface" x="428" y="252" width="76" height="28" rx="8" />
        <text x="466" y="270" textAnchor="middle" fontSize="12" className="f-ink">
          Card
        </text>
        <rect className="f-surface" x="428" y="294" width="76" height="28" rx="8" />
        <text x="466" y="312" textAnchor="middle" fontSize="12" className="f-ink">
          List
        </text>
      </g>
      <g className="float-a">
        <rect className="f-indigo" x="60" y="336" width="84" height="32" rx="16" />
        <text x="102" y="357" textAnchor="middle" fontSize="12" className="f-on-indigo">
          props
        </text>
        <rect className="f-i50" x="156" y="336" width="84" height="32" rx="16" />
        <text x="198" y="357" textAnchor="middle" fontSize="12" className="f-ink">
          state
        </text>
        <rect className="f-i50" x="252" y="336" width="84" height="32" rx="16" />
        <text x="294" y="357" textAnchor="middle" fontSize="12" className="f-ink">
          hooks
        </text>
        <rect className="f-lime" x="384" y="336" width="120" height="32" rx="16" />
        <text x="444" y="357" textAnchor="middle" fontSize="12" className="f-ink">
          Rendered
        </text>
      </g>
    </svg>
  );
}
