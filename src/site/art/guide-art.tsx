// Guide hero illustration: estimate sheet, sliders and calendar. Ported from html-prototype/guide.html (token classes only, see public/assets/nx/site.css).
export function GuideArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 640 360"
      role="img"
      aria-label="An estimate sheet with rows of scope items and bars, two slider controls, and a calendar, drawn in flat shapes"
    >
      <path className="s-indigo s-dash dash-move" d="M356 176 C 372 176, 380 250, 402 250" />
      <g className="float-a">
        <rect className="f-surface" x="48" y="44" width="300" height="272" rx="16" />
        <rect className="s-line" x="48" y="44" width="300" height="272" rx="16" />
        <circle className="f-line" cx="70" cy="66" r="4.5" />
        <circle className="f-line" cx="85" cy="66" r="4.5" />
        <circle className="f-lime" cx="100" cy="66" r="4.5" />
        <line className="s-line" x1="48" y1="86" x2="348" y2="86" />
        <rect className="f-i100" x="72" y="108" width="110" height="12" rx="6" />
        <rect className="f-indigo" x="200" y="108" width="96" height="12" rx="6" />
        <rect className="f-i100" x="72" y="146" width="110" height="12" rx="6" />
        <rect className="f-indigo" x="200" y="146" width="60" height="12" rx="6" />
        <rect className="f-i100" x="72" y="184" width="110" height="12" rx="6" />
        <rect className="f-indigo" x="200" y="184" width="124" height="12" rx="6" />
        <rect className="f-i100" x="72" y="222" width="110" height="12" rx="6" />
        <rect className="f-indigo" x="200" y="222" width="72" height="12" rx="6" />
        <rect className="f-i100" x="72" y="260" width="110" height="12" rx="6" />
        <rect className="f-indigo" x="200" y="260" width="110" height="12" rx="6" />
      </g>
      <g className="float-b">
        <rect className="f-surface" x="402" y="44" width="190" height="124" rx="16" />
        <rect className="s-line" x="402" y="44" width="190" height="124" rx="16" />
        <line className="s-line" x1="424" y1="84" x2="570" y2="84" />
        <circle className="f-indigo" cx="478" cy="84" r="9" />
        <line className="s-line" x1="424" y1="130" x2="570" y2="130" />
        <circle className="f-lime" cx="536" cy="130" r="9" />
      </g>
      <g className="float-c">
        <rect className="f-surface" x="402" y="190" width="190" height="126" rx="16" />
        <rect className="s-line" x="402" y="190" width="190" height="126" rx="16" />
        <rect className="f-i100" x="424" y="212" width="30" height="20" rx="5" />
        <rect className="f-i100" x="470" y="212" width="30" height="20" rx="5" />
        <rect className="f-i100" x="516" y="212" width="30" height="20" rx="5" />
        <rect className="f-i100" x="424" y="242" width="30" height="20" rx="5" />
        <rect className="f-indigo" x="470" y="242" width="30" height="20" rx="5" />
        <rect className="f-i100" x="516" y="242" width="30" height="20" rx="5" />
        <rect className="f-i100" x="424" y="272" width="30" height="20" rx="5" />
        <rect className="f-i100" x="470" y="272" width="30" height="20" rx="5" />
        <rect className="f-lime" x="516" y="272" width="30" height="20" rx="5" />
      </g>
    </svg>
  );
}
