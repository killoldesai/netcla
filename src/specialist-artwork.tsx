export function SpecialistArtwork({ mode }: { mode: string }) {
  const labels =
    mode === "connected"
      ? ["YOUR SYSTEMS", "INTEGRATION LAYER", "CONNECTED EXPERIENCE"]
      : mode === "immersive"
        ? ["YOUR SCENARIO", "INTERACTIVE EXPERIENCE", "USER INTERACTION"]
        : mode === "modernisation"
          ? ["EXISTING SYSTEM", "MODERNISATION PLAN", "REVIEW & HANDOVER"]
          : ["YOUR WORKFLOWS", "BUSINESS PLATFORM", "CONNECTED MODULES"];
  return (
    <svg
      className="csv-art specialist-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label={`${mode} software architecture illustration`}
    >
      <circle cx="310" cy="265" r="225" fill="#ffffff04" stroke="#ffffff12" />
      <path
        d="M151 160H317V266H504M317 266V400H155"
        stroke="#b9cf75"
        strokeWidth="2"
        strokeDasharray="6 9"
        fill="none"
      />
      <g transform="translate(49 88) rotate(-6 100 70)">
        <rect width="201" height="146" rx="24" fill="#f7f8ff" />
        <rect x="22" y="25" width="157" height="27" rx="8" fill="#e2e7f8" />
        <path
          d="M25 73h151m-151 20h107"
          stroke="#bbc5e5"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="25" y="127" fontSize="11" fill="#4553b2">
          {labels[0]}
        </text>
      </g>
      <g transform="translate(233 209)">
        <rect
          width="181"
          height="139"
          rx="29"
          fill="#4553b2"
          stroke="#a7b5f4"
        />
        <path
          d="M43 29h36v36H43zm59 0h36v36h-36zM43 84h36v26H43zm59 0h36v26h-36z"
          fill="#a9b7ef"
        />
        <text x="90" y="127" textAnchor="middle" fontSize="10" fill="#f7f8ff">
          {labels[1]}
        </text>
      </g>
      <g transform="translate(437 100) rotate(7)">
        <rect
          width="134"
          height="113"
          rx="22"
          fill="#37304f"
          stroke="#74668d"
        />
        <circle cx="34" cy="36" r="12" fill="#b8d163" />
        <path
          d="M59 35h52m-87 26h87m-87 18h65"
          stroke="#a59ab8"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text x="24" y="99" fontSize="10" fill="#eee8f8">
          REVIEW POINTS
        </text>
      </g>
      <g transform="translate(401 367)">
        <rect width="190" height="97" rx="22" fill="#edf3dc" />
        <path
          d="M22 25h145m-145 21h100"
          stroke="#b8c996"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="22" y="79" fontSize="10" fill="#607634">
          {labels[2]}
        </text>
      </g>
      <g transform="translate(61 347)">
        <rect
          width="151"
          height="103"
          rx="22"
          fill="#37304f"
          stroke="#74668d"
        />
        <path
          d="M27 29h96m-96 22h72m-72 22h85"
          stroke="#a59ab8"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
