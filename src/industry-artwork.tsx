export function industryMode(path: string) {
  return /healthcare/.test(path)
    ? "care"
    : /fintech|insurtech/.test(path)
      ? "finance"
      : /logistics|manufacturing/.test(path)
        ? "operations"
        : /edtech/.test(path)
          ? "learning"
          : /travel|retail|on-demand/.test(path)
            ? "commerce"
            : "business";
}
export function IndustryArtwork({ mode }: { mode: string }) {
  const symbols: Record<string, string> = {
    care: "M-15 0h30M0-15v30",
    finance: "M-18 16V-2h10v18m8 0V-16h10v32m8 0V-8h10v24",
    operations: "M-19-14h38v28h-38zM-19-4h38M-6-4v18",
    learning: "M0-16l24 12L0 8-24-12zm-15 18v15l15 7 15-7V2",
    commerce: "M-19-8h38l-4 26h-30zM-9-8v-9h18v9",
    business: "M-20-14h40v28h-40zM-20-4h40M-5-14v28",
  };
  return (
    <svg
      className="csv-art industry-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label={`${mode} business workflow illustration`}
    >
      <circle cx="310" cy="265" r="225" fill="#ffffff04" stroke="#ffffff12" />
      <g transform="translate(54 126) rotate(-5 250 145)">
        <rect
          width="499"
          height="291"
          rx="25"
          fill="#f7f8ff"
          stroke="#a9b7eb"
        />
        <rect width="499" height="44" rx="25" fill="#e0e6fa" />
        <text x="26" y="29" fontSize="12" fill="#4553b2">
          YOUR BUSINESS WORKSPACE
        </text>
        <rect x="22" y="64" width="114" height="201" rx="14" fill="#e9ecf8" />
        <path
          d="M42 86h74m-74 25h51m-51 25h64m-64 25h46"
          stroke="#a6b2d8"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="155" y="64" width="318" height="116" rx="16" fill="#4553b2" />
        <circle cx="220" cy="120" r="35" fill="#6777cd" />
        <path
          d={symbols[mode]}
          transform="translate(220 120)"
          fill="none"
          stroke="#d5e899"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M278 97h168m-168 25h130m-130 25h149"
          stroke="#9eaded"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect x="155" y="199" width="147" height="66" rx="14" fill="#e8efd2" />
        <rect x="321" y="199" width="152" height="66" rx="14" fill="#ece7f7" />
        <path
          d="M175 224h107m-107 21h75m84-21h109m-109 21h82"
          stroke="#b8bfaa"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(333 63)">
        <rect width="229" height="54" rx="18" fill="#37304f" stroke="#77688f" />
        <text x="115" y="33" textAnchor="middle" fontSize="11" fill="#d5e899">
          PEOPLE · WORKFLOWS · SYSTEMS
        </text>
      </g>
      <g transform="translate(354 382)">
        <rect width="222" height="86" rx="22" fill="#37304f" stroke="#77688f" />
        <circle cx="31" cy="30" r="7" fill="#bfd976" />
        <text x="51" y="35" fontSize="10" fill="#eee8f8">
          CONNECTED OPERATIONS
        </text>
        <path
          d="M26 61h169"
          stroke="#9b91af"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
