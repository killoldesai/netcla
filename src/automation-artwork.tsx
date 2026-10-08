export function AutomationArtwork() {
  return (
    <svg
      className="csv-art automation-art"
      viewBox="0 0 680 590"
      role="img"
      aria-label="Automation workspace connecting documents, AI processing, human review and business systems"
    >
      <defs>
        <linearGradient id="automationPanel" x2="1" y2="1">
          <stop stopColor="#484263" />
          <stop offset="1" stopColor="#2c2845" />
        </linearGradient>
        <linearGradient id="automationCore" x2=".8" y2="1">
          <stop stopColor="#94a1fc" />
          <stop offset="1" stopColor="#5865c7" />
        </linearGradient>
      </defs>
      <g transform="translate(55 66)">
        <rect
          width="565"
          height="446"
          rx="28"
          fill="url(#automationPanel)"
          stroke="#786f91"
        />
        <path d="M0 63h565" stroke="#655b7a" />
        <circle cx="28" cy="31" r="5" fill="#c0d55d" />
        <circle cx="46" cy="31" r="5" fill="#9690aa" />
        <circle cx="64" cy="31" r="5" fill="#9690aa" />
        <text x="101" y="36" fill="#e7e3f5" fontSize="12">
          Automation workspace
        </text>
        <rect x="427" y="18" width="111" height="28" rx="14" fill="#c5da71" />
        <text
          x="482"
          y="36"
          textAnchor="middle"
          fill="#293323"
          fontSize="9"
          fontWeight="600"
        >
          HUMAN IN CONTROL
        </text>
        <text x="28" y="99" fill="#bdb6ce" fontSize="9" letterSpacing="2">
          FROM INFORMATION TO ACTION
        </text>
        <path
          d="M111 208H242M325 208H463M282 251V324H155M282 324H465"
          fill="none"
          stroke="#aaa3d2"
          strokeWidth="2"
        />
        <circle cx="191" cy="208" r="5" fill="#c5da71" />
        <circle cx="386" cy="208" r="5" fill="#c5da71" />
        <g transform="translate(27 136)">
          <rect width="137" height="140" rx="18" fill="#f0f1fc" />
          <rect x="17" y="18" width="42" height="48" rx="8" fill="#dbe1f7" />
          <path
            d="M27 33h22m-22 10h15m-15 10h19"
            stroke="#6874bd"
            strokeWidth="3"
          />
          <path d="M74 26h42m-42 13h29" stroke="#b5bddb" strokeWidth="5" />
          <text x="18" y="96" fill="#383550" fontSize="12" fontWeight="600">
            Documents & data
          </text>
          <text x="18" y="118" fill="#78748d" fontSize="9">
            Emails · PDFs · Forms
          </text>
        </g>
        <g transform="translate(217 142)">
          <rect
            width="130"
            height="130"
            rx="28"
            fill="url(#automationCore)"
            stroke="#b9c2ff"
          />
          <path
            d="M47 31l-15 25 15 25h30l15-25-15-25z"
            fill="none"
            stroke="#ecf2cc"
            strokeWidth="2"
          />
          <circle cx="62" cy="56" r="9" fill="#cce47f" />
          <text
            x="65"
            y="107"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="600"
          >
            AI processing
          </text>
        </g>
        <g transform="translate(400 139)">
          <rect
            width="138"
            height="133"
            rx="18"
            fill="#34334d"
            stroke="#6b6386"
          />
          <circle cx="35" cy="40" r="19" fill="#c5da71" />
          <path
            d="M28 41l5 5 11-13"
            fill="none"
            stroke="#363c21"
            strokeWidth="3"
          />
          <path d="M67 33h52m-52 15h32" stroke="#aaa4c0" strokeWidth="5" />
          <text x="18" y="98" fill="#f0edf8" fontSize="12" fontWeight="600">
            Human review
          </text>
          <text x="18" y="118" fill="#aaa4bc" fontSize="9">
            Exceptions & approvals
          </text>
        </g>
        <g transform="translate(40 312)">
          <rect
            width="174"
            height="94"
            rx="17"
            fill="#38324f"
            stroke="#695d80"
          />
          <text x="18" y="29" fill="#e6e0f0" fontSize="11">
            Connected systems
          </text>
          <g fill="#8a87bc">
            <rect x="18" y="45" width="36" height="28" rx="7" />
            <rect x="66" y="45" width="36" height="28" rx="7" />
            <rect x="114" y="45" width="36" height="28" rx="7" />
          </g>
        </g>
        <g transform="translate(355 312)">
          <rect width="183" height="94" rx="17" fill="#e7efcf" />
          <text x="18" y="29" fill="#46512e" fontSize="11">
            Structured output
          </text>
          <path
            d="M18 48h139m-139 13h106m-106 13h124"
            stroke="#a8bb7f"
            strokeWidth="5"
          />
        </g>
      </g>
      <g transform="translate(8 14) rotate(-6 110 40)">
        <rect width="219" height="75" rx="19" fill="#f9faff" />
        <rect x="16" y="17" width="37" height="41" rx="8" fill="#e4e7f9" />
        <path d="M26 31h17m-17 9h12" stroke="#7280c9" strokeWidth="3" />
        <text x="67" y="32" fill="#4553b2" fontSize="10" fontWeight="600">
          UNDERSTAND THE INPUT
        </text>
        <text x="67" y="51" fill="#7a7892" fontSize="9">
          Extract. Classify. Route.
        </text>
      </g>
      <g transform="translate(385 477) rotate(4 135 37)">
        <rect width="265" height="77" rx="20" fill="#c3d96a" />
        <circle cx="34" cy="37" r="18" fill="#a7c34b" />
        <path
          d="M27 37l5 5 11-12"
          fill="none"
          stroke="#354422"
          strokeWidth="3"
        />
        <text x="66" y="33" fill="#344322" fontSize="10" fontWeight="600">
          DESIGNED AROUND YOUR WORKFLOW
        </text>
        <text x="66" y="53" fill="#576d36" fontSize="9">
          Your process. Your systems. Your control.
        </text>
      </g>
    </svg>
  );
}
export function CapabilityArtwork({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 280 105"
      className="automation-capability-art"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="264" height="89" rx="18" fill="#ffffff90" />
      {index === 2 ? (
        <>
          <path d="M34 78V26M34 78h207" stroke="#b6c596" strokeWidth="2" />
          {[29, 49, 36, 57].map((h, i) => (
            <rect
              key={i}
              x={55 + i * 49}
              y={78 - h}
              width="31"
              height={h}
              rx="5"
              fill={i === 3 ? "#4553b2" : "#b0c579"}
            />
          ))}
        </>
      ) : (
        <>
          <rect x="31" y="23" width="55" height="60" rx="10" fill="#d6def6" />
          <path
            d="M44 39h28m-28 13h20m-20 13h26"
            stroke="#6979bf"
            strokeWidth="3"
          />
          <path
            d="M100 53h53"
            stroke="#91a4ce"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <rect
            x="174"
            y="26"
            width="68"
            height="53"
            rx="12"
            fill={index === 3 ? "#a6bb69" : "#4553b2"}
          />
          {index === 3 ? (
            <path
              d="M193 52l10 10 19-24"
              stroke="#fff"
              strokeWidth="4"
              fill="none"
            />
          ) : (
            <path
              d="M186 42h42m-42 12h30m-30 11h37"
              stroke="#d9e1ff"
              strokeWidth="3"
            />
          )}
        </>
      )}
    </svg>
  );
}
