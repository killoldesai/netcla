// How We Work hero illustration: a delivery loop from brief to release. Ported from html-prototype/how-we-work.html
// (token classes only, see public/assets/nx/site.css). Shown when the page has no generated hero image.
export function HowWorkArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A delivery loop from brief to release: discovery, design, development and review, then deployment and support, with a release node closing the loop"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <ellipse className="s-indigo dash-move" cx="280" cy="210" rx="200" ry="130" />
      <rect className="f-surface s-line float-a" x="196" y="140" width="168" height="130" rx="14" />
      <rect className="f-i100" x="196" y="140" width="168" height="26" rx="14" />
      <rect className="f-line" x="214" y="184" width="84" height="8" rx="4" />
      <rect className="f-line" x="214" y="200" width="122" height="8" rx="4" />
      <rect className="f-line" x="214" y="216" width="100" height="8" rx="4" />
      <rect className="f-indigo" x="214" y="236" width="52" height="16" rx="8" />
      <g className="float-b">
        <circle className="f-surface s-indigo" cx="280" cy="80" r="26" />
        <path className="s-indigo" d="M272 80l6 6 10-11" fill="none" />
      </g>
      <g className="float-c">
        <circle className="f-surface s-indigo" cx="480" cy="210" r="26" />
        <rect className="f-indigo" x="470" y="202" width="20" height="16" rx="3" />
      </g>
      <g className="float-a">
        <circle className="f-surface s-indigo" cx="280" cy="340" r="26" />
        <path className="s-indigo" d="M268 340h24M280 328v24" fill="none" />
      </g>
      <g className="float-b">
        <circle className="f-surface s-indigo" cx="80" cy="210" r="26" />
        <rect className="f-muted" x="70" y="204" width="20" height="12" rx="2" />
      </g>
      <circle className="f-lime pulse" cx="480" cy="210" r="8" />
    </svg>
  );
}
