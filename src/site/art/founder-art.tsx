// Founder monogram: the initials KD on an indigo disc, used where a profile has no photo. Ported from html-prototype/founder.html (token classes only, see public/assets/nx/site.css).
export function FounderArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="Monogram with the initials KD for Killol Desai, Founder of Netofficials"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <circle className="f-lime" cx="430" cy="92" r="26" />
      <g className="float-a">
        <circle className="f-indigo" cx="280" cy="210" r="128" />
        <text className="f-on-indigo" x="280" y="246" textAnchor="middle" fontSize="112" fontWeight="600" letterSpacing="-4">
          KD
        </text>
      </g>
      <line className="s-line" x1="80" y1="372" x2="480" y2="372" />
      <circle className="f-lime pulse" cx="120" cy="330" r="10" />
    </svg>
  );
}
