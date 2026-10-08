export function TrustArtwork({
  careers = false,
  questions = false,
}: {
  careers?: boolean;
  questions?: boolean;
}) {
  return (
    <svg
      className="csv-art trust-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label="Illustration of project expectations, communication and review"
    >
      <circle cx="310" cy="265" r="225" fill="#ffffff04" stroke="#ffffff12" />
      <g transform="translate(111 100) rotate(-6 150 175)">
        <rect
          width="301"
          height="350"
          rx="27"
          fill="#f7f8ff"
          stroke="#b3bfe8"
        />
        <rect x="27" y="28" width="247" height="63" rx="16" fill="#4553b2" />
        <text x="150" y="65" textAnchor="middle" fontSize="12" fill="#fff">
          {careers
            ? "WORKING TOGETHER"
            : questions
              ? "YOUR QUESTIONS, ANSWERED"
              : "CLEAR PROJECT EXPECTATIONS"}
        </text>
        {[123, 183, 243].map((y) => (
          <g key={y}>
            <rect x="27" y={y} width="35" height="35" rx="10" fill="#e4edcc" />
            <path
              d={`M37 ${y + 17}l6 6 10-14`}
              stroke="#7e983d"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d={`M80 ${y + 10}h190m-190 17h139`}
              stroke="#bac5e5"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </g>
        ))}
        <path
          d="M29 316h240"
          stroke="#d9def0"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(372 106) rotate(7)">
        <rect
          width="189"
          height="124"
          rx="23"
          fill="#37304f"
          stroke="#796a90"
        />
        <text x="25" y="33" fontSize="11" fill="#d5e99d">
          {careers ? "ROLES & RESPONSIBILITIES" : "SCOPE & COMMUNICATION"}
        </text>
        <path
          d="M25 60h139m-139 23h106"
          stroke="#a499b7"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(384 328)">
        <rect width="190" height="115" rx="23" fill="#edf3dc" />
        <circle cx="39" cy="36" r="12" fill="#b7cd79" />
        <path
          d="M65 35h100m-140 26h140"
          stroke="#b5c794"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="25" y="96" fontSize="10" fill="#647a34">
          REVIEW & NEXT STEPS
        </text>
      </g>
    </svg>
  );
}
