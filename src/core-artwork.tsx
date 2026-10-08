export function CoreArtwork({ mode }: { mode: string }) {
  const design = mode === "design";
  return (
    <svg
      className="csv-art core-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label={
        design
          ? "Responsive design workspace illustration"
          : "Connected application development workspace illustration"
      }
    >
      <defs>
        <pattern
          id="core-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path d="M32 0H0V32" fill="none" stroke="#ffffff09" />
        </pattern>
      </defs>
      <rect
        x="10"
        y="10"
        width="600"
        height="510"
        rx="35"
        fill="url(#core-grid)"
      />
      <path
        d="M102 101H500V424H104Z"
        fill="none"
        stroke="#b4cf5c"
        strokeWidth="2"
        strokeDasharray="5 8"
      />
      <g transform="translate(65 115) rotate(-4 240 140)">
        <rect
          width="481"
          height="295"
          rx="23"
          fill="#f5f6ff"
          stroke="#b5bfe9"
        />
        <rect width="481" height="42" rx="23" fill="#e2e6fa" />
        <circle cx="23" cy="21" r="4" fill="#8995d0" />
        <circle cx="39" cy="21" r="4" fill="#8995d0" />
        <text x="70" y="26" fontSize="11" fill="#4553b2">
          {design ? "DESIGN WORKSPACE" : "APPLICATION WORKSPACE"}
        </text>
        <rect x="20" y="65" width="115" height="207" rx="12" fill="#e8ebf8" />
        <path
          d="M38 87h76m-76 24h55m-55 24h68m-68 24h46"
          stroke="#a5aed5"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <rect x="155" y="65" width="302" height="112" rx="15" fill="#4553b2" />
        {design ? (
          <>
            <rect
              x="177"
              y="87"
              width="149"
              height="12"
              rx="6"
              fill="#b2bbf4"
            />
            <rect
              x="177"
              y="114"
              width="105"
              height="10"
              rx="5"
              fill="#b2bbf4"
            />
            <rect
              x="177"
              y="141"
              width="78"
              height="18"
              rx="9"
              fill="#bdd657"
            />
            <circle cx="397" cy="119" r="30" fill="#6473ce" />
          </>
        ) : (
          <>
            <text
              x="179"
              y="104"
              fontSize="16"
              fill="#c5d979"
              fontFamily="monospace"
            >
              {"{ your_business }"}
            </text>
            <path
              d="M180 125h205m-205 20h142"
              stroke="#8897e0"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </>
        )}
        <rect x="155" y="195" width="139" height="77" rx="13" fill="#e8efd3" />
        <rect x="312" y="195" width="145" height="77" rx="13" fill="#ece8f7" />
        <path
          d="M175 218h95m-95 22h64M332 218h99m-99 22h67"
          stroke="#b7bba6"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(402 324) rotate(9 70 80)">
        <rect
          width="150"
          height="148"
          rx="22"
          fill="#37304f"
          stroke="#71668d"
        />
        <circle cx="75" cy="54" r="25" fill="#afcc18" />
        <path
          d="M63 54l8 8 16-20"
          fill="none"
          stroke="#35304d"
          strokeWidth="4"
        />
        <text x="75" y="106" textAnchor="middle" fontSize="10" fill="#ede7fa">
          {mode === "commerce" ? "CONNECTED COMMERCE" : "READY FOR YOUR USERS"}
        </text>
      </g>
      <rect
        x="93"
        y="54"
        width="211"
        height="55"
        rx="18"
        fill="#37304f"
        stroke="#71668d"
      />
      <text x="199" y="87" textAnchor="middle" fontSize="11" fill="#d2e48b">
        {design ? "RESEARCH · DESIGN · HANDOVER" : "SCOPE · BUILD · HANDOVER"}
      </text>
    </svg>
  );
}
