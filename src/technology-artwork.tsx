export function TechnologyArtwork({
  heading,
  mode,
}: {
  heading: string;
  mode: string;
}) {
  return (
    <svg
      className="csv-art technology-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label={`${mode} development workspace illustration`}
    >
      <circle cx="310" cy="265" r="225" fill="#ffffff04" stroke="#ffffff12" />
      <g transform="translate(52 123) rotate(-5 250 145)">
        <rect
          width="501"
          height="298"
          rx="25"
          fill="#f7f8ff"
          stroke="#a8b7ec"
        />
        <rect width="501" height="44" rx="25" fill="#e0e6fa" />
        <circle cx="23" cy="22" r="4" fill="#8895cb" />
        <circle cx="40" cy="22" r="4" fill="#8895cb" />
        <text x="70" y="27" fontSize="11" fill="#4553b2">
          DEVELOPMENT WORKSPACE
        </text>
        <rect x="21" y="64" width="116" height="210" rx="13" fill="#e9ecf8" />
        <path
          d="M40 88h77m-77 25h57m-57 25h66m-66 25h49"
          stroke="#a7b2db"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="157" y="64" width="320" height="128" rx="15" fill="#4553b2" />
        <text
          x="180"
          y="102"
          fontSize="18"
          fontFamily="monospace"
          fill="#d6e99e"
        >
          {mode === "data"
            ? "data → application"
            : mode === "infrastructure"
              ? "build → deploy"
              : "</> your_next_build"}
        </text>
        <path
          d="M183 128h259m-259 24h183"
          stroke="#909fe0"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="157" y="211" width="147" height="63" rx="13" fill="#e8efd3" />
        <rect x="322" y="211" width="155" height="63" rx="13" fill="#ede8f7" />
        <path
          d="M178 235h104m-104 18h73m91-18h113m-113 18h75"
          stroke="#b7bead"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(323 57)">
        <rect width="239" height="53" rx="18" fill="#37304f" stroke="#75678e" />
        <text x="119" y="32" textAnchor="middle" fontSize="12" fill="#d6e99e">
          {heading
            .replace(
              / Development Services| App Development Services| API Development Services| Infrastructure Services| Containerisation Services/g,
              "",
            )
            .slice(0, 28)}
        </text>
      </g>
      <g transform="translate(357 382)">
        <rect width="219" height="82" rx="21" fill="#37304f" stroke="#75678e" />
        <path
          d="M23 30l8 8 15-20"
          fill="none"
          stroke="#bad570"
          strokeWidth="3"
        />
        <text x="61" y="35" fontSize="10" fill="#eee8f8">
          REVIEWABLE DELIVERY
        </text>
        <path
          d="M24 59h168"
          stroke="#958bab"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
export function technologyMode(path: string) {
  return /mongodb|postgresql/.test(path)
    ? "data"
    : /docker|terraform/.test(path)
      ? "infrastructure"
      : /shopify|woocommerce|magento/.test(path)
        ? "commerce"
        : "application";
}
