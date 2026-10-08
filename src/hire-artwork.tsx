export function HireArtwork({ team }: { team: boolean }) {
  return (
    <svg
      className="csv-art hire-art"
      viewBox="0 0 620 530"
      role="img"
      aria-label="Illustration of a project brief, skills review and collaborative development workspace"
    >
      <circle cx="310" cy="265" r="225" fill="#ffffff04" stroke="#ffffff12" />
      <path
        d="M137 166H315V284H496M315 284V424H142"
        stroke="#b4ce6d"
        strokeWidth="2"
        strokeDasharray="6 9"
        fill="none"
      />
      <g transform="translate(44 89) rotate(-6 100 80)">
        <rect width="202" height="155" rx="24" fill="#f7f8ff" />
        <text x="24" y="33" fontSize="12" fill="#4553b2">
          YOUR PROJECT BRIEF
        </text>
        <path
          d="M25 62h150m-150 24h122m-122 24h137"
          stroke="#c3cbe9"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <rect x="24" y="131" width="94" height="12" rx="6" fill="#dfe9bd" />
      </g>
      <g transform="translate(238 204)">
        <rect
          width="179"
          height="155"
          rx="28"
          fill="#4553b2"
          stroke="#a6b4ee"
        />
        <rect x="22" y="24" width="135" height="73" rx="14" fill="#6977c8" />
        <text
          x="90"
          y="71"
          textAnchor="middle"
          fontSize="30"
          fontFamily="monospace"
          fill="#d5e798"
        >
          {"</>"}
        </text>
        <text x="90" y="128" textAnchor="middle" fontSize="10" fill="#fff">
          {team ? "YOUR DELIVERY TEAM" : "YOUR DEVELOPMENT ROLE"}
        </text>
      </g>
      <g transform="translate(434 101) rotate(7)">
        <rect
          width="143"
          height="119"
          rx="22"
          fill="#37304f"
          stroke="#78698f"
        />
        <path
          d="M25 34l8 8 18-23m-26 42l8 8 18-23"
          fill="none"
          stroke="#bdd575"
          strokeWidth="3"
        />
        <path
          d="M65 34h54m-54 27h54"
          stroke="#a69bb8"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text x="25" y="104" fontSize="10" fill="#eee8f8">
          SKILLS & SCOPE
        </text>
      </g>
      <g transform="translate(405 374)">
        <rect width="186" height="91" rx="22" fill="#edf3db" />
        <path
          d="M25 26h135m-135 21h96"
          stroke="#bacb97"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <text x="25" y="75" fontSize="10" fill="#657b34">
          REVIEW & COLLABORATE
        </text>
      </g>
      <g transform="translate(64 352)">
        <rect
          width="159"
          height="108"
          rx="22"
          fill="#37304f"
          stroke="#78698f"
        />
        <text x="23" y="31" fontSize="10" fill="#d6e99e">
          ENGAGEMENT PLAN
        </text>
        <path
          d="M25 55h110m-110 22h78"
          stroke="#a69bb8"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
