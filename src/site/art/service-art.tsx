// SaaS-style service hero illustration: dashboard window, billing card, role chips. Ported from html-prototype/service.html (token classes only, see public/assets/nx/site.css).
export function ServiceArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A SaaS dashboard in a browser window with a tenant workspace, a subscription billing card, user roles for admin, member and viewer, and connected tenant services"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <path className="s-indigo s-dash dash-move" d="M404 352 L444 340" />
      <path className="s-indigo s-dash dash-move" d="M420 318 L420 296" />
      <g className="float-a">
        <rect className="f-surface" x="60" y="60" width="340" height="270" rx="16" />
        <rect className="s-line" x="60" y="60" width="340" height="270" rx="16" />
        <circle className="f-line" cx="82" cy="82" r="4.5" />
        <circle className="f-line" cx="97" cy="82" r="4.5" />
        <circle className="f-lime" cx="112" cy="82" r="4.5" />
        <line className="s-line" x1="60" y1="100" x2="400" y2="100" />
        <rect className="f-i50" x="76" y="118" width="56" height="200" rx="10" />
        <rect className="f-i100" x="88" y="134" width="32" height="7" rx="3.5" />
        <rect className="f-indigo" x="88" y="152" width="32" height="7" rx="3.5" />
        <rect className="f-i100" x="88" y="170" width="32" height="7" rx="3.5" />
        <rect className="f-i100" x="88" y="188" width="24" height="7" rx="3.5" />
        <rect className="f-i50" x="144" y="118" width="72" height="56" rx="10" />
        <rect className="f-i100" x="156" y="132" width="34" height="6" rx="3" />
        <rect className="f-indigo" x="156" y="146" width="44" height="10" rx="5" />
        <rect className="f-l50" x="228" y="118" width="72" height="56" rx="10" />
        <rect className="f-i100" x="240" y="132" width="34" height="6" rx="3" />
        <rect className="f-lime" x="240" y="146" width="40" height="10" rx="5" />
        <rect className="f-i50" x="312" y="118" width="72" height="56" rx="10" />
        <rect className="f-i100" x="324" y="132" width="34" height="6" rx="3" />
        <rect className="f-indigo" x="324" y="146" width="36" height="10" rx="5" />
        <rect className="f-surface s-line" x="144" y="188" width="240" height="130" rx="12" />
        <rect className="f-i100" x="162" y="264" width="18" height="44" rx="4" />
        <rect className="f-i100" x="190" y="246" width="18" height="62" rx="4" />
        <rect className="f-i100" x="218" y="256" width="18" height="52" rx="4" />
        <rect className="f-i100" x="246" y="230" width="18" height="78" rx="4" />
        <rect className="f-i100" x="274" y="240" width="18" height="68" rx="4" />
        <rect className="f-i100" x="302" y="218" width="18" height="90" rx="4" />
        <rect className="f-indigo" x="330" y="206" width="18" height="102" rx="4" />
      </g>
      <g className="float-b">
        <rect className="f-surface s-line" x="372" y="154" width="150" height="128" rx="16" />
        <rect className="f-ink" x="388" y="170" width="56" height="8" rx="4" />
        <rect className="f-i100" x="388" y="188" width="118" height="7" rx="3.5" />
        <rect className="f-indigo" x="388" y="206" width="118" height="30" rx="10" />
        <circle className="f-lime" cx="404" cy="221" r="6" />
        <rect className="f-on-indigo" x="418" y="217" width="60" height="7" rx="3.5" opacity=".8" />
        <rect className="f-lime" x="388" y="250" width="118" height="14" rx="7" />
      </g>
      <g className="float-c">
        <circle className="f-indigo" cx="420" cy="340" r="18" />
        <circle className="f-lime pulse" cx="482" cy="306" r="10" />
        <circle className="f-lime" cx="482" cy="306" r="10" />
        <circle className="f-i100" cx="482" cy="378" r="10" />
        <circle className="f-i100" cx="372" cy="378" r="10" />
      </g>
      <g className="float-a">
        <rect className="f-indigo" x="60" y="352" width="78" height="30" rx="15" />
        <text x="99" y="372" textAnchor="middle" fontSize="12" className="f-on-indigo">
          Admin
        </text>
        <rect className="f-i50" x="146" y="352" width="84" height="30" rx="15" />
        <text x="188" y="372" textAnchor="middle" fontSize="12" className="f-ink">
          Member
        </text>
        <rect className="f-i50" x="238" y="352" width="78" height="30" rx="15" />
        <text x="277" y="372" textAnchor="middle" fontSize="12" className="f-ink">
          Viewer
        </text>
      </g>
      <g className="float-b">
        <circle className="f-indigo pulse" cx="500" cy="88" r="26" />
        <circle className="f-indigo" cx="500" cy="88" r="26" />
        <path className="s-ink" d="M490 88l7 7 13-14" />
      </g>
    </svg>
  );
}
