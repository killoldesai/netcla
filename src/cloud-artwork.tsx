export function CloudArtwork({ pipeline = false }: { pipeline?: boolean }) {
  return (
    <svg
      className="csv-art cloud-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label={
        pipeline
          ? "Application delivery pipeline illustration"
          : "Connected cloud infrastructure illustration"
      }
    >
      <circle cx="310" cy="260" r="220" fill="#ffffff04" stroke="#ffffff12" />
      <path
        d="M115 345V244H500V345M310 244V150"
        fill="none"
        stroke="#b4cd6a"
        strokeWidth="3"
        strokeDasharray="6 9"
      />
      <g transform="translate(196 67)">
        <path
          d="M43 112C-6 112-7 49 35 42 43-9 119-10 137 31 187 5 241 48 221 91 215 107 199 113 180 113Z"
          fill="#e8ecfd"
          stroke="#a9b6ec"
          strokeWidth="2"
        />
        <text x="115" y="78" textAnchor="middle" fontSize="13" fill="#4553b2">
          {pipeline ? "DELIVERY PLATFORM" : "CLOUD PLATFORM"}
        </text>
      </g>
      {[64, 238, 412].map((x, i) => (
        <g key={x} transform={`translate(${x} 303)`}>
          <rect
            width="144"
            height="137"
            rx="24"
            fill={i === 1 ? "#4553b2" : "#37304f"}
            stroke="#8e83ac"
          />
          <rect x="22" y="24" width="100" height="24" rx="7" fill="#ffffff13" />
          <rect x="22" y="60" width="100" height="24" rx="7" fill="#ffffff13" />
          <circle cx="37" cy="36" r="4" fill="#bfd96f" />
          <circle cx="37" cy="72" r="4" fill="#bfd96f" />
          <path
            d="M52 36h55m-55 36h55"
            stroke="#b1abd0"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <text x="72" y="115" textAnchor="middle" fontSize="10" fill="#ece8f8">
            {
              (pipeline
                ? ["BUILD", "REVIEW", "RELEASE"]
                : ["APPLICATIONS", "CONNECTED DATA", "OBSERVABILITY"])[i]
            }
          </text>
        </g>
      ))}
      <g transform="translate(39 103) rotate(-6)">
        <rect width="147" height="91" rx="20" fill="#eef3dc" />
        <path
          d="M21 26h103m-103 19h80"
          stroke="#b3c58c"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="21" y="73" fontSize="10" fill="#657a35">
          ARCHITECTURE PLAN
        </text>
      </g>
      <g transform="translate(446 134) rotate(7)">
        <rect width="136" height="82" rx="20" fill="#37304f" stroke="#706288" />
        <path
          d="M23 29l8 8 15-20"
          fill="none"
          stroke="#bfd96f"
          strokeWidth="3"
        />
        <text x="23" y="65" fontSize="10" fill="#eee9f8">
          REVIEW & SUPPORT
        </text>
      </g>
    </svg>
  );
}
