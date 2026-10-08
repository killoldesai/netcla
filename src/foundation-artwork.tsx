export function FoundationArtwork({ family }: { family: string }) {
  const conversation = family === "contact" || family === "company";
  return (
    <svg
      className="csv-art foundation-art"
      viewBox="0 0 650 550"
      role="img"
      aria-label={
        conversation
          ? "Project collaboration illustration"
          : "Software, mobile and search marketing illustration"
      }
    >
      <defs>
        <linearGradient id="foundationScreen" x2="1" y2="1">
          <stop stopColor="#777fcd" />
          <stop offset="1" stopColor="#454a93" />
        </linearGradient>
      </defs>
      <circle cx="320" cy="276" r="217" fill="#ffffff04" stroke="#ffffff15" />
      <circle cx="320" cy="276" r="163" fill="none" stroke="#ffffff0d" />
      <g transform="translate(62 98) rotate(-6 230 150)">
        <rect width="458" height="298" rx="27" fill="#f5f6ff" />
        <rect width="458" height="47" rx="27" fill="#dfe2f7" />
        <g fill="#939dd1">
          <circle cx="24" cy="24" r="5" />
          <circle cx="42" cy="24" r="5" />
          <circle cx="60" cy="24" r="5" />
        </g>
        <rect x="20" y="69" width="93" height="207" rx="13" fill="#eeeff9" />
        <path
          d="M36 89h60m-60 22h43m-43 22h55m-55 22h34"
          stroke="#bfc6e7"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <rect
          x="132"
          y="70"
          width="303"
          height="111"
          rx="16"
          fill="url(#foundationScreen)"
        />
        <text x="155" y="105" fill="#e9eeff" fontSize="11" letterSpacing="1">
          {conversation ? "A SHARED PROJECT VIEW" : "YOUR DIGITAL BUSINESS"}
        </text>
        <path
          d="M156 132h148m-148 18h100"
          stroke="#adb7ec"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="132" y="199" width="140" height="77" rx="12" fill="#e9efcf" />
        <rect x="286" y="199" width="149" height="77" rx="12" fill="#ebe8f7" />
        <path
          d="M150 221h103m-103 17h68m87-17h100m-100 17h77"
          stroke="#b1bd89"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      {conversation ? (
        <g transform="translate(345 321) rotate(5)">
          <rect
            width="256"
            height="136"
            rx="23"
            fill="#36304f"
            stroke="#827799"
          />
          <circle cx="35" cy="37" r="15" fill="#c5d878" />
          <text x="62" y="41" fill="#fff" fontSize="13">
            Project brief
          </text>
          <path
            d="M25 71h202m-202 18h154m-154 18h173"
            stroke="#a09ab2"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g transform="translate(390 232) rotate(8 85 130)">
          <rect
            width="170"
            height="285"
            rx="28"
            fill="#555fab"
            stroke="#9fa8ec"
            strokeWidth="2"
          />
          <rect x="8" y="9" width="154" height="266" rx="22" fill="#f8f9ff" />
          <rect x="51" y="12" width="67" height="15" rx="7" fill="#322c48" />
          <text x="24" y="65" fill="#4553b2" fontSize="12" fontWeight="600">
            MOBILE FIRST
          </text>
          <rect x="21" y="87" width="128" height="78" rx="13" fill="#dee7bb" />
          <path
            d="M35 130l22-20 21 11 21-20 34 18"
            stroke="#8ca449"
            strokeWidth="3"
            fill="none"
          />
          <rect x="21" y="187" width="128" height="43" rx="21" fill="#4553b2" />
          <path d="M39 209h89" stroke="#fff" strokeWidth="4" />
        </g>
      )}
      <g transform="translate(18 388) rotate(-4)">
        <rect width="272" height="79" rx="21" fill="#c4d971" />
        <circle
          cx="36"
          cy="38"
          r="13"
          fill="none"
          stroke="#4c602c"
          strokeWidth="3"
        />
        <path d="M45 48l9 9" stroke="#4c602c" strokeWidth="3" />
        <text x="70" y="34" fill="#3c4c26" fontSize="12" fontWeight="600">
          {conversation ? "START WITH YOUR GOAL" : "BUILT TO CONNECT"}
        </text>
        <text x="70" y="54" fill="#60763a" fontSize="10">
          {conversation
            ? "A new idea. An existing system."
            : "Software · Websites · Search"}
        </text>
      </g>
    </svg>
  );
}
