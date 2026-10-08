export function SolutionArtwork({ advisory }: { advisory: boolean }) {
  return (
    <svg
      className="csv-art solution-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label="Illustration of product scope, delivery planning and a software interface"
    >
      <circle cx="310" cy="265" r="225" fill="#ffffff04" stroke="#ffffff12" />
      <g transform="translate(72 138) rotate(-5 220 140)">
        <rect
          width="450"
          height="280"
          rx="25"
          fill="#f7f8ff"
          stroke="#a8b7eb"
        />
        <rect width="450" height="44" rx="25" fill="#e1e6fa" />
        <text x="26" y="29" fontSize="11" fill="#4553b2">
          {advisory ? "DELIVERY ROADMAP" : "YOUR PRODUCT WORKSPACE"}
        </text>
        <rect x="22" y="65" width="104" height="190" rx="13" fill="#e9ecf8" />
        <path
          d="M42 88h63m-63 25h46m-46 25h54"
          stroke="#a7b3da"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="145" y="65" width="280" height="100" rx="15" fill="#4553b2" />
        <path
          d="M169 92h230m-230 25h181m-181 25h204"
          stroke="#a4b1ec"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect x="145" y="184" width="131" height="71" rx="14" fill="#e8efd2" />
        <rect x="294" y="184" width="131" height="71" rx="14" fill="#ece7f7" />
        <path
          d="M163 208h95m-95 22h64m87-22h90m-90 22h62"
          stroke="#b5beaa"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(43 57) rotate(-5)">
        <rect width="218" height="72" rx="20" fill="#37304f" stroke="#796a90" />
        <text x="25" y="29" fontSize="11" fill="#d5e899">
          SCOPE & PRIORITIES
        </text>
        <path
          d="M26 50h165"
          stroke="#a49ab6"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(378 70) rotate(7)">
        <rect width="173" height="95" rx="22" fill="#edf3dc" />
        <path
          d="M24 28l7 7 14-18"
          stroke="#7f9c3d"
          strokeWidth="3"
          fill="none"
        />
        <text x="24" y="66" fontSize="10" fill="#617733">
          REVIEWABLE MILESTONES
        </text>
      </g>
      <g transform="translate(352 384)">
        <rect width="225" height="84" rx="22" fill="#37304f" stroke="#796a90" />
        <text x="24" y="33" fontSize="11" fill="#eee8f8">
          BUILD · REVIEW · HANDOVER
        </text>
        <path
          d="M26 60h173"
          stroke="#a49ab6"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
