// Practice illustrations for the homepage service cards, ported from html-prototype/index.html.
// Token classes only; the artwork is decorative.

export function SoftwareArt() {
  return (
    <svg className="il" aria-hidden="true" viewBox="0 0 400 220">
      <rect className="f-i50" width="400" height="220" rx="20" />
      <g className="float-a">
        <rect
          className="f-band"
          x="36"
          y="30"
          width="220"
          height="164"
          rx="14"
        />
        <circle className="f-i100" cx="54" cy="48" r="4" opacity=".5" />
        <circle className="f-i100" cx="67" cy="48" r="4" opacity=".5" />
        <circle className="f-lime" cx="80" cy="48" r="4" />
        <rect className="f-lime" x="54" y="70" width="54" height="7" rx="3.5" />
        <rect
          className="f-i100"
          x="114"
          y="70"
          width="80"
          height="7"
          rx="3.5"
          opacity=".5"
        />
        <rect
          className="f-i100"
          x="68"
          y="88"
          width="96"
          height="7"
          rx="3.5"
          opacity=".5"
        />
        <rect
          className="f-indigo"
          x="170"
          y="88"
          width="40"
          height="7"
          rx="3.5"
        />
        <rect
          className="f-i100"
          x="68"
          y="106"
          width="70"
          height="7"
          rx="3.5"
          opacity=".5"
        />
        <rect
          className="f-i100"
          x="82"
          y="124"
          width="110"
          height="7"
          rx="3.5"
          opacity=".5"
        />
        <rect
          className="f-lime"
          x="68"
          y="142"
          width="40"
          height="7"
          rx="3.5"
        />
        <rect
          className="f-i100"
          x="114"
          y="142"
          width="60"
          height="7"
          rx="3.5"
          opacity=".5"
        />
        <rect
          className="f-i100"
          x="54"
          y="160"
          width="20"
          height="7"
          rx="3.5"
          opacity=".5"
        />
      </g>
      <g className="float-b">
        <rect
          className="f-surface"
          x="216"
          y="88"
          width="148"
          height="108"
          rx="14"
        />
        <rect
          className="s-line"
          x="216"
          y="88"
          width="148"
          height="108"
          rx="14"
        />
        <rect
          className="f-ink"
          x="232"
          y="104"
          width="64"
          height="9"
          rx="4.5"
        />
        <rect className="f-i100" x="232" y="119" width="96" height="6" rx="3" />
        <rect
          className="f-indigo"
          x="232"
          y="136"
          width="36"
          height="20"
          rx="10"
        />
        <circle className="f-surface" cx="258" cy="146" r="7" />
        <rect className="f-i100" x="276" y="143" width="52" height="6" rx="3" />
        <rect
          className="f-lime"
          x="232"
          y="166"
          width="116"
          height="20"
          rx="10"
        />
      </g>
      <g className="float-c">
        <circle className="f-lime" cx="330" cy="52" r="26" />
        <path className="s-ink" d="M321 46l-7 6 7 6M339 46l7 6-7 6" />
      </g>
    </svg>
  );
}

export function AiArt() {
  return (
    <svg className="il" aria-hidden="true" viewBox="0 0 400 220">
      <rect className="f-sky" width="400" height="220" rx="20" />
      <g opacity=".7">
        <path
          className="s-indigo dash-move"
          d="M200 110L96 56M200 110L96 164M200 110L304 56M200 110L304 164M200 110L200 196"
        />
      </g>
      <g className="float-a">
        <circle className="f-surface" cx="96" cy="56" r="22" />
        <circle className="s-indigo" cx="96" cy="56" r="22" />
        <path className="s-ink" d="M88 49h16M88 56h16M88 63h10" />
      </g>
      <g className="float-b">
        <circle className="f-surface" cx="96" cy="164" r="22" />
        <circle className="s-indigo" cx="96" cy="164" r="22" />
        <path className="s-ink" d="M86 157h20v12h-12l-5 4v-4h-3z" />
      </g>
      <g className="float-c">
        <circle className="f-surface" cx="304" cy="56" r="22" />
        <circle className="s-indigo" cx="304" cy="56" r="22" />
        <ellipse className="s-ink" cx="304" cy="50" rx="9" ry="4" />
        <path className="s-ink" d="M295 50v12c0 2.2 4 4 9 4s9-1.8 9-4V50" />
      </g>
      <g className="float-a">
        <circle className="f-surface" cx="304" cy="164" r="22" />
        <circle className="s-indigo" cx="304" cy="164" r="22" />
        <path className="s-ink" d="M294 158h20v13h-20zM294 158l10 7 10-7" />
      </g>
      <g className="float-b">
        <circle className="f-surface" cx="200" cy="196" r="16" />
        <circle className="s-indigo" cx="200" cy="196" r="16" />
        <path className="s-ink" d="M194 196l4 4 8-8" />
      </g>
      <circle className="f-indigo pulse" cx="200" cy="110" r="38" />
      <circle className="f-indigo" cx="200" cy="110" r="38" />
      <path
        className="f-lime"
        d="M200 86l7 17 17 7-17 7-7 17-7-17-17-7 17-7z"
      />
    </svg>
  );
}

export function DevOpsArt() {
  return (
    <svg className="il" aria-hidden="true" viewBox="0 0 400 220">
      <rect className="f-l50" width="400" height="220" rx="20" />
      <path
        className="s-indigo"
        style={{ strokeWidth: "16" }}
        d="M200 112 C 230 62, 318 62, 318 112 C 318 162, 230 162, 200 112 C 170 62, 82 62, 82 112 C 82 162, 170 162, 200 112 Z"
      />
      <path
        className="s-on dash-move"
        d="M200 112 C 230 62, 318 62, 318 112 C 318 162, 230 162, 200 112 C 170 62, 82 62, 82 112 C 82 162, 170 162, 200 112 Z"
      />
      <circle
        className="f-lime travel"
        r="11"
        style={{
          offsetPath:
            "path('M200 112 C 230 62, 318 62, 318 112 C 318 162, 230 162, 200 112 C 170 62, 82 62, 82 112 C 82 162, 170 162, 200 112 Z')",
        }}
      />
      <g>
        <rect
          className="f-surface"
          x="44"
          y="22"
          width="76"
          height="28"
          rx="14"
        />
        <rect className="s-line" x="44" y="22" width="76" height="28" rx="14" />
        <text
          x="82"
          y="40"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          className="f-ink"
        >
          Build
        </text>
      </g>
      <g>
        <rect
          className="f-surface"
          x="44"
          y="172"
          width="76"
          height="28"
          rx="14"
        />
        <rect
          className="s-line"
          x="44"
          y="172"
          width="76"
          height="28"
          rx="14"
        />
        <text
          x="82"
          y="190"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          className="f-ink"
        >
          Test
        </text>
      </g>
      <g>
        <rect
          className="f-surface"
          x="280"
          y="22"
          width="76"
          height="28"
          rx="14"
        />
        <rect
          className="s-line"
          x="280"
          y="22"
          width="76"
          height="28"
          rx="14"
        />
        <text
          x="318"
          y="40"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          className="f-ink"
        >
          Deploy
        </text>
      </g>
      <g>
        <rect
          className="f-surface"
          x="280"
          y="172"
          width="76"
          height="28"
          rx="14"
        />
        <rect
          className="s-line"
          x="280"
          y="172"
          width="76"
          height="28"
          rx="14"
        />
        <text
          x="318"
          y="190"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          className="f-ink"
        >
          Monitor
        </text>
      </g>
    </svg>
  );
}

export function MobileArt() {
  return (
    <svg className="il" aria-hidden="true" viewBox="0 0 400 220">
      <rect className="f-sand" width="400" height="220" rx="20" />
      <g transform="rotate(-10 150 130)">
        <rect
          className="f-i100"
          x="100"
          y="34"
          width="100"
          height="186"
          rx="18"
        />
        <rect
          className="f-surface"
          x="106"
          y="40"
          width="88"
          height="174"
          rx="14"
        />
        <rect className="f-i100" x="116" y="56" width="46" height="8" rx="4" />
        <rect className="f-i50" x="116" y="74" width="68" height="44" rx="10" />
        <rect className="f-i50" x="116" y="126" width="68" height="18" rx="6" />
      </g>
      <g className="float-a">
        <rect
          className="f-ink"
          x="186"
          y="18"
          width="110"
          height="200"
          rx="20"
        />
        <rect
          className="f-surface"
          x="193"
          y="25"
          width="96"
          height="186"
          rx="15"
        />
        <rect className="f-i100" x="203" y="39" width="40" height="6" rx="3" />
        <rect className="f-ink" x="203" y="51" width="62" height="10" rx="5" />
        <rect className="f-l50" x="203" y="70" width="76" height="50" rx="10" />
        <circle className="f-lime" cx="218" cy="86" r="7" />
        <rect className="f-i100" x="230" y="83" width="38" height="6" rx="3" />
        <rect className="f-i100" x="213" y="104" width="50" height="6" rx="3" />
        <rect className="f-i50" x="203" y="128" width="76" height="18" rx="6" />
        <rect className="f-i50" x="203" y="152" width="76" height="18" rx="6" />
        <circle className="f-indigo" cx="215" cy="192" r="5" />
        <circle className="f-i100" cx="241" cy="192" r="5" />
        <circle className="f-i100" cx="267" cy="192" r="5" />
      </g>
      <g className="float-b">
        <rect
          className="f-surface"
          x="262"
          y="56"
          width="120"
          height="46"
          rx="14"
        />
        <rect
          className="s-line"
          x="262"
          y="56"
          width="120"
          height="46"
          rx="14"
        />
        <circle className="f-indigo" cx="283" cy="79" r="9" />
        <rect className="f-ink" x="300" y="71" width="64" height="6" rx="3" />
        <rect className="f-i100" x="300" y="83" width="46" height="6" rx="3" />
      </g>
    </svg>
  );
}

export function CloudArt() {
  return (
    <svg className="il" aria-hidden="true" viewBox="0 0 400 220">
      <rect className="f-i100" width="400" height="220" rx="20" />
      <path
        className="s-indigo dash-move"
        d="M150 126V146M205 126V146M260 126V146"
      />
      <g className="float-c">
        <g transform="translate(31 40) scale(0.85)">
          <path
            className="f-surface"
            d="M128 102h150a38 38 0 0 0 2-76 54 54 0 0 0-102-12 42 42 0 0 0-50 88z"
          />
          <path
            className="s-line"
            d="M128 102h150a38 38 0 0 0 2-76 54 54 0 0 0-102-12 42 42 0 0 0-50 88z"
          />
          <rect
            className="f-i50"
            x="122"
            y="54"
            width="52"
            height="24"
            rx="12"
          />
          <text
            x="148"
            y="70"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            className="f-ink"
          >
            AWS
          </text>
          <rect
            className="f-i50"
            x="180"
            y="54"
            width="56"
            height="24"
            rx="12"
          />
          <text
            x="208"
            y="70"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            className="f-ink"
          >
            Azure
          </text>
          <rect
            className="f-i50"
            x="242"
            y="54"
            width="52"
            height="24"
            rx="12"
          />
          <text
            x="268"
            y="70"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            className="f-ink"
          >
            GCP
          </text>
        </g>
      </g>
      <g>
        <rect
          className="f-surface"
          x="126"
          y="146"
          width="48"
          height="20"
          rx="6"
        />
        <rect
          className="f-surface"
          x="126"
          y="170"
          width="48"
          height="20"
          rx="6"
        />
        <rect
          className="f-surface"
          x="126"
          y="194"
          width="48"
          height="16"
          rx="6"
        />
        <rect
          className="f-surface"
          x="181"
          y="146"
          width="48"
          height="20"
          rx="6"
        />
        <rect
          className="f-surface"
          x="181"
          y="170"
          width="48"
          height="20"
          rx="6"
        />
        <rect
          className="f-surface"
          x="181"
          y="194"
          width="48"
          height="16"
          rx="6"
        />
        <rect
          className="f-surface"
          x="236"
          y="146"
          width="48"
          height="20"
          rx="6"
        />
        <rect
          className="f-surface"
          x="236"
          y="170"
          width="48"
          height="20"
          rx="6"
        />
        <rect
          className="f-surface"
          x="236"
          y="194"
          width="48"
          height="16"
          rx="6"
        />
        <circle className="f-lime blink" cx="136" cy="156" r="3" />
        <circle className="f-lime" cx="136" cy="180" r="3" />
        <circle className="f-lime blink" cx="191" cy="180" r="3" />
        <circle className="f-lime" cx="191" cy="156" r="3" />
        <circle className="f-lime" cx="246" cy="156" r="3" />
        <circle className="f-lime blink" cx="246" cy="180" r="3" />
      </g>
    </svg>
  );
}
