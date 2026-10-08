export function MobileArtwork({ tablet = false }: { tablet?: boolean }) {
  return (
    <svg
      className="csv-art mobile-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label={
        tablet
          ? "Tablet application and connected services illustration"
          : "Mobile application design and connected services illustration"
      }
    >
      <circle cx="310" cy="265" r="225" fill="#ffffff04" stroke="#ffffff12" />
      <circle
        cx="310"
        cy="265"
        r="180"
        fill="none"
        stroke="#ffffff09"
        strokeDasharray="5 12"
      />
      <g
        transform={
          tablet
            ? "translate(80 110) rotate(-6 200 150)"
            : "translate(140 65) rotate(-7 105 195)"
        }
      >
        <rect
          width={tablet ? 375 : 225}
          height={tablet ? 305 : 400}
          rx="32"
          fill="#7c8ada"
          stroke="#b2bdf9"
          strokeWidth="2"
        />
        <rect
          x="10"
          y="12"
          width={tablet ? 355 : 205}
          height={tablet ? 281 : 376}
          rx="25"
          fill="#f8f9ff"
        />
        <rect x="80" y="17" width="64" height="11" rx="6" fill="#35304f" />
        <text x="29" y="70" fontSize="13" fontWeight="600" fill="#4553b2">
          YOUR APP EXPERIENCE
        </text>
        <path
          d="M29 94h158m-158 18h99"
          stroke="#d5daf0"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="28" y="136" width="169" height="108" rx="19" fill="#e8eed2" />
        <circle cx="112" cy="183" r="27" fill="#afcc18" />
        <path
          d="M99 182l10 11 18-24"
          stroke="#35304f"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M53 224h120"
          stroke="#b7c68b"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {!tablet && (
          <>
            <rect
              x="28"
              y="262"
              width="169"
              height="48"
              rx="14"
              fill="#e9ecfa"
            />
            <path
              d="M45 281h115m-115 14h75"
              stroke="#a8b2de"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <rect
              x="28"
              y="330"
              width="169"
              height="37"
              rx="19"
              fill="#4553b2"
            />
          </>
        )}
        {tablet && (
          <>
            <rect
              x="218"
              y="136"
              width="126"
              height="108"
              rx="19"
              fill="#e9ecfa"
            />
            <path
              d="M237 164h87m-87 24h65m-65 24h74"
              stroke="#a8b2de"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </>
        )}
      </g>
      <g transform="translate(374 118) rotate(8)">
        <rect
          width="173"
          height="119"
          rx="23"
          fill="#37304f"
          stroke="#70638e"
        />
        <circle cx="36" cy="37" r="12" fill="#afcc18" />
        <path
          d="M62 36h82m-120 27h120m-120 19h87"
          stroke="#a097b8"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text x="25" y="105" fontSize="10" fill="#eee9f8">
          CONNECTED SERVICES
        </text>
      </g>
      <g transform="translate(369 330)">
        <rect width="178" height="102" rx="23" fill="#eef2dc" />
        <path
          d="M26 28h124m-124 22h92"
          stroke="#becaa0"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="26" y="81" fontSize="11" fill="#647b2d">
          DESIGN · BUILD · RELEASE
        </text>
      </g>
      <circle cx="108" cy="331" r="24" fill="#37304f" stroke="#70638e" />
      <path d="M98 331h20m-10-10v20" stroke="#c4da7b" strokeWidth="2" />
    </svg>
  );
}
