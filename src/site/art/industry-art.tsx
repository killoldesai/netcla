// Industry hero illustration: care workflow with record, calendar, shield and phone. Ported from html-prototype/industry.html (token classes only, see public/assets/nx/site.css).
export function IndustryArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A care workflow: a patient record card, an appointment calendar, a secure shield at the centre, a clinic building and a patient app on a phone, all connected"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <path className="s-indigo s-dash dash-move" d="M240 140 H258 V226" />
      <path className="s-indigo s-dash dash-move" d="M410 192 V212 H318 V236" />
      <path className="s-indigo s-dash dash-move" d="M190 336 H240 L262 300" />
      <path className="s-indigo s-dash dash-move" d="M390 300 H332 L300 290" />
      <g className="float-a">
        <rect className="f-surface s-line" x="40" y="52" width="200" height="170" rx="16" />
        <circle className="f-i100" cx="72" cy="84" r="14" />
        <rect className="f-ink" x="96" y="78" width="88" height="8" rx="4" />
        <rect className="f-i100" x="96" y="94" width="58" height="6" rx="3" />
        <line className="s-line" x1="56" y1="116" x2="224" y2="116" />
        <rect className="f-i50" x="56" y="128" width="168" height="34" rx="10" />
        <circle className="f-lime" cx="74" cy="145" r="6" />
        <rect className="f-i100" x="90" y="141" width="84" height="8" rx="4" />
        <rect className="f-indigo" x="184" y="140" width="28" height="10" rx="5" />
        <rect className="f-i50" x="56" y="170" width="168" height="34" rx="10" />
        <circle className="f-indigo" cx="74" cy="187" r="6" />
        <rect className="f-i100" x="90" y="183" width="70" height="8" rx="4" />
        <rect className="f-i100" x="184" y="182" width="28" height="10" rx="5" />
      </g>
      <g className="float-b">
        <rect className="f-surface s-line" x="300" y="52" width="220" height="140" rx="16" />
        <rect className="f-indigo" x="300" y="52" width="220" height="32" rx="16" />
        <rect className="f-on-indigo" x="318" y="64" width="64" height="8" rx="4" opacity=".8" />
        <rect className="f-i100" x="318" y="98" width="18" height="14" rx="4" />
        <rect className="f-i100" x="346" y="98" width="18" height="14" rx="4" />
        <rect className="f-lime" x="374" y="98" width="18" height="14" rx="4" />
        <rect className="f-i100" x="402" y="98" width="18" height="14" rx="4" />
        <rect className="f-i100" x="430" y="98" width="18" height="14" rx="4" />
        <rect className="f-i100" x="318" y="120" width="18" height="14" rx="4" />
        <rect className="f-indigo" x="346" y="120" width="18" height="14" rx="4" />
        <rect className="f-i100" x="374" y="120" width="18" height="14" rx="4" />
        <rect className="f-i100" x="402" y="120" width="18" height="14" rx="4" />
        <rect className="f-i100" x="430" y="120" width="18" height="14" rx="4" />
        <rect className="f-i100" x="318" y="142" width="18" height="14" rx="4" />
        <rect className="f-i100" x="346" y="142" width="18" height="14" rx="4" />
        <rect className="f-i100" x="374" y="142" width="18" height="14" rx="4" />
        <rect className="f-lime" x="402" y="142" width="18" height="14" rx="4" />
        <rect className="f-i100" x="430" y="142" width="18" height="14" rx="4" />
      </g>
      <g className="float-c">
        <circle className="f-i100 pulse" cx="280" cy="262" r="44" />
        <path
          className="f-indigo"
          d="M280 226 L312 238 V262 C312 284 298 300 280 308 C262 300 248 284 248 262 V238 Z"
        />
        <polygon className="f-on-indigo" points="266,262 271,257 279,265 291,251 296,256 279,274" />
      </g>
      <g className="float-a">
        <rect className="f-surface s-line" x="60" y="290" width="130" height="96" rx="16" />
        <rect className="f-indigo" x="105" y="312" width="40" height="10" rx="3" />
        <rect className="f-indigo" x="120" y="297" width="10" height="40" rx="3" />
        <rect className="f-i100" x="80" y="354" width="90" height="7" rx="3.5" />
        <rect className="f-i50" x="92" y="366" width="66" height="6" rx="3" />
      </g>
      <g className="float-b">
        <rect className="f-surface s-line" x="390" y="230" width="100" height="160" rx="18" />
        <rect className="f-line" x="430" y="240" width="20" height="5" rx="2.5" />
        <rect className="f-i50" x="402" y="256" width="76" height="120" rx="10" />
        <rect className="f-indigo" x="410" y="268" width="60" height="8" rx="4" />
        <rect className="f-i100" x="410" y="286" width="60" height="6" rx="3" />
        <rect className="f-i100" x="410" y="298" width="44" height="6" rx="3" />
        <rect className="f-surface" x="410" y="314" width="60" height="30" rx="8" />
        <rect className="f-lime" x="410" y="352" width="60" height="16" rx="8" />
      </g>
      <g className="float-c">
        <circle className="f-lime pulse" cx="258" cy="140" r="8" />
        <circle className="f-lime" cx="258" cy="140" r="8" />
      </g>
    </svg>
  );
}
