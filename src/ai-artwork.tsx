export function aiVisualMode(path: string) {
  return /chatbot|language|generative|llm/.test(path)
    ? "language"
    : /vision/.test(path)
      ? "vision"
      : /integration|mlops/.test(path)
        ? "integration"
        : "data";
}
export function AIArtwork({ mode }: { mode: string }) {
  return (
    <svg
      className="csv-art ai-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label={`${mode} AI workspace illustration`}
    >
      <circle cx="310" cy="265" r="220" fill="#ffffff04" stroke="#ffffff12" />
      <path
        d="M124 139H312V264H499M124 392H312V264"
        fill="none"
        stroke="#a7be60"
        strokeWidth="2"
        strokeDasharray="6 9"
      />
      <g transform="translate(43 86) rotate(-6 95 80)">
        <rect width="191" height="156" rx="24" fill="#f7f8ff" />
        <text x="22" y="32" fontSize="11" fill="#4553b2">
          {mode === "language" ? "YOUR KNOWLEDGE" : "YOUR BUSINESS DATA"}
        </text>
        <path
          d="M24 58h142m-142 22h117m-117 22h131"
          stroke="#c3cbea"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect x="23" y="121" width="83" height="15" rx="7" fill="#e0e9bd" />
      </g>
      <g transform="translate(243 190)">
        <rect
          width="155"
          height="151"
          rx="34"
          fill="#4553b2"
          stroke="#a6b2f7"
        />
        <path
          d="M58 35h39l20 34-20 34H58L38 69z"
          fill="none"
          stroke="#d2e69b"
          strokeWidth="3"
        />
        <circle cx="77" cy="69" r="13" fill="#d2e69b" />
        <text x="77" y="130" textAnchor="middle" fontSize="11" fill="#fff">
          AI APPLICATION
        </text>
      </g>
      <g transform="translate(427 99) rotate(6)">
        <rect
          width="148"
          height="111"
          rx="22"
          fill="#37304f"
          stroke="#75698e"
        />
        <circle cx="32" cy="33" r="11" fill="#afcc18" />
        <path
          d="M56 32h69m-101 27h101m-101 18h76"
          stroke="#a39ab7"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text x="24" y="98" fontSize="10" fill="#f0ebfa">
          HUMAN REVIEW
        </text>
      </g>
      <g transform="translate(396 327)">
        <rect width="189" height="144" rx="24" fill="#eef3dc" />
        {mode === "language" ? (
          <>
            <rect x="20" y="22" width="148" height="38" rx="13" fill="#fff" />
            <rect
              x="44"
              y="73"
              width="124"
              height="36"
              rx="13"
              fill="#d8e4b8"
            />
            <path
              d="M35 42h114m-55 50h57"
              stroke="#9eaf7c"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </>
        ) : mode === "vision" ? (
          <>
            <rect
              x="22"
              y="20"
              width="143"
              height="82"
              rx="12"
              fill="#d7e3b5"
            />
            <path
              d="M39 34h22m-22 0v22m108-22h-22m22 0v22M39 87h22m-22 0V65m108 22h-22m22 0V65"
              stroke="#708f35"
              strokeWidth="3"
              fill="none"
            />
            <circle cx="94" cy="61" r="21" fill="#afcc18" />
          </>
        ) : (
          <>
            <rect x="27" y="57" width="26" height="46" rx="5" fill="#c8d99a" />
            <rect x="66" y="31" width="26" height="72" rx="5" fill="#b1c976" />
            <rect x="105" y="46" width="26" height="57" rx="5" fill="#8fab4f" />
          </>
        )}
        <text x="23" y="129" fontSize="10" fill="#657a36">
          {mode === "integration" ? "CONNECTED SYSTEMS" : "REVIEWABLE OUTPUT"}
        </text>
      </g>
      <g transform="translate(63 343)">
        <rect
          width="165"
          height="100"
          rx="21"
          fill="#37304f"
          stroke="#75698e"
        />
        <path
          d="M23 28h119m-119 20h89m-89 20h105"
          stroke="#958ca8"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
