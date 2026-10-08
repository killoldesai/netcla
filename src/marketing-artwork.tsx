export function MarketingArtwork({
  local = false,
  paid = false,
}: {
  local?: boolean;
  paid?: boolean;
}) {
  return (
    <svg
      className="csv-art marketing-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label="Illustration of search planning, relevant content and enquiry measurement"
    >
      <circle cx="310" cy="265" r="225" fill="#ffffff04" stroke="#ffffff12" />
      <g transform="translate(53 130) rotate(-5 250 145)">
        <rect
          width="501"
          height="291"
          rx="25"
          fill="#f7f8ff"
          stroke="#a8b7eb"
        />
        <rect width="501" height="44" rx="25" fill="#e0e6fa" />
        <text x="26" y="29" fontSize="11" fill="#4553b2">
          {paid ? "CAMPAIGN WORKSPACE" : "SEARCH WORKSPACE"}
        </text>
        <rect
          x="24"
          y="65"
          width="453"
          height="48"
          rx="24"
          fill="#fff"
          stroke="#d4dcee"
        />
        <circle
          cx="48"
          cy="89"
          r="8"
          fill="none"
          stroke="#4553b2"
          strokeWidth="2.5"
        />
        <path d="M54 95l6 6" stroke="#4553b2" strokeWidth="2.5" />
        <text x="79" y="94" fontSize="12" fill="#4553b2">
          CONNECT WITH RELEVANT BUYERS
        </text>
        <path
          d="M30 148h223m-223 23h181m-181 23h199M30 233h205m-205 23h158"
          stroke="#bec7e6"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect x="302" y="137" width="174" height="126" rx="17" fill="#e9efd7" />
        {local ? (
          <>
            <path
              d="M389 158c-22 0-33 18-33 35 0 26 33 50 33 50s33-24 33-50c0-17-11-35-33-35z"
              fill="#b4ca71"
            />
            <circle cx="389" cy="190" r="12" fill="#f7f8ff" />
          </>
        ) : (
          <>
            <rect
              x="322"
              y="177"
              width="31"
              height="63"
              rx="5"
              fill="#cad99e"
            />
            <rect
              x="369"
              y="161"
              width="31"
              height="79"
              rx="5"
              fill="#b8cc7a"
            />
            <rect
              x="416"
              y="187"
              width="31"
              height="53"
              rx="5"
              fill="#95af52"
            />
          </>
        )}
      </g>
      <g transform="translate(65 58)">
        <rect width="218" height="55" rx="18" fill="#37304f" stroke="#79698f" />
        <text x="109" y="33" textAnchor="middle" fontSize="11" fill="#d6e99e">
          INTENT · CONTENT · CONVERSION
        </text>
      </g>
      <g transform="translate(350 381)">
        <rect width="226" height="86" rx="22" fill="#37304f" stroke="#79698f" />
        <circle cx="28" cy="31" r="7" fill="#b9d470" />
        <text x="46" y="36" fontSize="10" fill="#eee8f8">
          MEASURE QUALIFIED ENQUIRIES
        </text>
        <path
          d="M26 61h173"
          stroke="#a59ab6"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
