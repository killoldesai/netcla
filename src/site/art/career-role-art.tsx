// Role illustration: a brief card with a checklist, and a person connected to a project board. Ported from html-prototype/career-role.html (token classes only, see public/assets/nx/site.css).
export function CareerRoleArt() {
  return (
    <svg
      className="il"
      viewBox="0 0 560 420"
      role="img"
      aria-label="A role brief card with a checklist and a person connected to a project board"
    >
      <rect className="f-i50" width="560" height="420" rx="20" />
      <rect className="f-surface s-line float-a" x="90" y="70" width="300" height="270" rx="18" />
      <rect className="f-line" x="120" y="104" width="140" height="12" rx="6" />
      <rect className="f-line" x="120" y="132" width="220" height="8" rx="4" />
      <rect className="f-line" x="120" y="152" width="190" height="8" rx="4" />
      <circle className="f-indigo" cx="132" cy="206" r="10" />
      <path className="s-indigo" d="M127 206l3 3 6-6" />
      <rect className="f-line" x="152" y="202" width="170" height="8" rx="4" />
      <circle className="f-lime" cx="132" cy="240" r="10" />
      <path className="s-indigo" d="M127 240l3 3 6-6" />
      <rect className="f-line" x="152" y="236" width="140" height="8" rx="4" />
      <circle className="f-line" cx="132" cy="274" r="10" />
      <rect className="f-line" x="152" y="270" width="160" height="8" rx="4" />
      <rect className="f-indigo float-c" x="120" y="300" width="120" height="26" rx="13" />
      <rect className="f-surface s-line float-b" x="400" y="150" width="110" height="170" rx="18" />
      <circle className="f-i100 pulse" cx="455" cy="200" r="22" />
      <path className="f-indigo" d="M455 191a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm-10 17a10 10 0 0 1 20 0z" />
      <rect className="f-line" x="418" y="238" width="74" height="8" rx="4" />
      <rect className="f-line" x="428" y="256" width="54" height="8" rx="4" />
      <line className="s-indigo dash-move s-dash" x1="390" y1="200" x2="400" y2="200" />
    </svg>
  );
}
