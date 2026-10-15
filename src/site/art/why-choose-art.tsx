// Why Choose hero illustration: two options side by side, a checklist with every item ticked on one side and the
// same items still open on the other. Ported from html-prototype/why-choose.html (token classes only, see public/assets/nx/site.css).
export function WhyChooseArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A balance with two options side by side. The Netofficials side shows a checklist with every item ticked, the other side shows the same items still open."
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <line className="s-ink" x1="120" y1="104" x2="440" y2="104" />
      <line className="s-ink" x1="280" y1="66" x2="280" y2="104" />
      <circle className="f-indigo" cx="280" cy="66" r="9" />
      <circle className="f-line" cx="120" cy="104" r="6" />
      <circle className="f-line" cx="440" cy="104" r="6" />
      <line className="s-line s-dash dash-move" x1="120" y1="110" x2="120" y2="142" />
      <line className="s-line s-dash dash-move" x1="440" y1="110" x2="440" y2="142" />
      <g className="float-a">
        <rect className="f-surface" x="40" y="142" width="230" height="236" rx="18" />
        <rect className="s-line" x="40" y="142" width="230" height="236" rx="18" />
        <rect className="f-indigo" x="64" y="168" width="84" height="10" rx="5" />
        <circle className="f-lime" cx="78" cy="212" r="11" />
        <path className="s-indigo" d="M72.5 212 l4 4 7-8" fill="none" />
        <rect className="f-i100" x="100" y="208" width="132" height="8" rx="4" />
        <circle className="f-lime" cx="78" cy="256" r="11" />
        <path className="s-indigo" d="M72.5 256 l4 4 7-8" fill="none" />
        <rect className="f-i100" x="100" y="252" width="110" height="8" rx="4" />
        <circle className="f-lime" cx="78" cy="300" r="11" />
        <path className="s-indigo" d="M72.5 300 l4 4 7-8" fill="none" />
        <rect className="f-i100" x="100" y="296" width="124" height="8" rx="4" />
        <rect className="f-indigo" x="64" y="336" width="170" height="20" rx="10" />
      </g>
      <g className="float-b">
        <rect className="f-surface" x="290" y="142" width="230" height="236" rx="18" />
        <rect className="s-line" x="290" y="142" width="230" height="236" rx="18" />
        <rect className="f-line" x="314" y="168" width="84" height="10" rx="5" />
        <circle className="f-i50" cx="328" cy="212" r="11" />
        <rect className="f-i100" x="350" y="208" width="132" height="8" rx="4" />
        <circle className="f-i50" cx="328" cy="256" r="11" />
        <rect className="f-i100" x="350" y="252" width="110" height="8" rx="4" />
        <circle className="f-i50" cx="328" cy="300" r="11" />
        <rect className="f-i100" x="350" y="296" width="124" height="8" rx="4" />
        <rect className="f-line" x="314" y="336" width="170" height="20" rx="10" />
      </g>
    </svg>
  );
}
