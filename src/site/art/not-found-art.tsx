// 404 illustration: a browser window with a broken link between two pages, beside a signpost. Ported from html-prototype/404.html (token classes only, see public/assets/nx/site.css).
export function NotFoundArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A browser window with a broken link between two pages, beside a signpost pointing in two directions"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <g className="float-a">
        <rect className="f-surface" x="60" y="90" width="270" height="230" rx="18" />
        <rect className="s-line" x="60" y="90" width="270" height="230" rx="18" />
        <circle className="f-line" cx="84" cy="110" r="5" />
        <circle className="f-line" cx="102" cy="110" r="5" />
        <circle className="f-line" cx="120" cy="110" r="5" />
        <rect className="f-paper" x="140" y="100" width="170" height="20" rx="10" />
        <circle className="f-indigo" cx="110" cy="200" r="14" />
        <path className="s-indigo s-dash dash-move" d="M126 200 H184" />
        <circle className="f-lime pulse" cx="210" cy="200" r="12" />
        <path className="s-ink" d="M205 195 L215 205 M215 195 L205 205" />
        <circle className="f-paper s-line s-dash" cx="290" cy="200" r="14" />
        <rect className="f-line" x="90" y="250" width="200" height="10" rx="5" />
        <rect className="f-line" x="90" y="270" width="130" height="10" rx="5" />
      </g>
      <rect className="f-muted" x="420" y="120" width="8" height="226" rx="4" />
      <rect className="f-muted" x="398" y="340" width="52" height="8" rx="4" />
      <path className="f-indigo" d="M428 136 H492 L506 150 L492 164 H428 Z" />
      <path className="f-surface s-line" d="M412 180 H352 L338 194 L352 208 H412 Z" />
    </svg>
  );
}
