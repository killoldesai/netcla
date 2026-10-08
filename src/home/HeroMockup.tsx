"use client";

// Decorative product-style illustration for the hero: a delivery board the
// way a client sees it during a project. It is illustrative only, so it is
// exposed to assistive tech as a single labelled image.

type Card = {
  id: string;
  title: string;
  tag: string;
  tone: "indigo" | "lime" | "sky" | "sand";
  who: string;
  done?: boolean;
};

const tones = {
  indigo: "bg-n-indigo-100 text-n-indigo-dark",
  lime: "bg-n-lime-50 text-[#5b6a00]",
  sky: "bg-n-sky-50 text-[#1f5f86]",
  sand: "bg-n-sand-50 text-[#8a5a12]",
} as const;

const avatars: Record<string, string> = {
  AK: "bg-n-indigo text-white",
  RS: "bg-[#1f5f86] text-white",
  MP: "bg-n-lime text-n-ink",
  JD: "bg-n-ink text-white",
};

const columns: { title: string; count: number; cards: Card[] }[] = [
  {
    title: "Discovery",
    count: 3,
    cards: [
      { id: "NO-101", title: "Map order approval workflow", tag: "workshop", tone: "sand", who: "AK" },
      { id: "NO-104", title: "Audit existing ERP integrations", tag: "api", tone: "sky", who: "RS" },
    ],
  },
  {
    title: "Design",
    count: 2,
    cards: [
      { id: "NO-109", title: "Dashboard wireframes for ops team", tag: "ui-ux", tone: "indigo", who: "MP" },
      { id: "NO-112", title: "Mobile check-in flow prototype", tag: "mobile", tone: "lime", who: "AK" },
    ],
  },
  {
    title: "Build",
    count: 4,
    cards: [
      { id: "NO-118", title: "Inventory sync service on AWS", tag: "cloud", tone: "sky", who: "JD" },
      { id: "NO-121", title: "AI invoice extraction pipeline", tag: "ai", tone: "indigo", who: "RS" },
    ],
  },
  {
    title: "Shipped",
    count: 6,
    cards: [
      { id: "NO-096", title: "Customer portal v1.2 release", tag: "release", tone: "lime", who: "JD", done: true },
      { id: "NO-099", title: "SSO with Microsoft Entra ID", tag: "security", tone: "sand", who: "MP", done: true },
    ],
  },
];

function Avatar({ who, className = "" }: { who: string; className?: string }) {
  return (
    <span
      className={`inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-white ${avatars[who]} ${className}`}
    >
      {who}
    </span>
  );
}

function TaskCard({ card }: { card: Card }) {
  return (
    <div className="rounded-xl border border-n-line/80 bg-white p-3 shadow-[0_1px_2px_rgb(15_20_32/0.05)]">
      <p className={`text-[12.5px] leading-[1.35] font-medium ${card.done ? "text-n-muted line-through decoration-n-muted/40" : "text-n-ink"}`}>
        {card.title}
      </p>
      <span className={`mt-2 inline-block rounded-md px-1.5 py-0.5 font-n-mono text-[10px] ${tones[card.tone]}`}>
        {card.tag}
      </span>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-n-mono text-[10px] text-n-muted">
          <span
            className={`inline-flex size-3.5 items-center justify-center rounded-[4px] ${card.done ? "bg-n-lime" : "border border-n-indigo/50"}`}
          >
            {card.done && (
              <svg viewBox="0 0 10 10" className="size-2.5">
                <path d="m2 5 2 2 4-4" fill="none" stroke="#0f1420" strokeWidth="1.6" />
              </svg>
            )}
          </span>
          {card.id}
        </span>
        <Avatar who={card.who} className="size-5! text-[9px]!" />
      </div>
    </div>
  );
}

export function HeroMockup() {
  return (
    <div
      role="img"
      aria-label="Illustration of a shared project board with discovery, design, build and shipped stages"
      className="relative mx-auto w-full max-w-[1080px] text-left"
    >
      <div className="overflow-hidden rounded-[18px] border border-n-ink/10 bg-white shadow-n-float">
        <div className="flex items-center gap-2 border-b border-n-line/80 bg-[#fbfbfa] px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="mx-auto hidden rounded-md bg-white px-16 py-1 font-n-mono text-[11px] text-n-muted ring-1 ring-n-line sm:block">
            workspace.netofficials.com/project/ops-platform
          </span>
        </div>
        <div className="flex">
          <aside className="hidden w-[188px] shrink-0 border-r border-n-line/80 bg-[#fbfbfa] p-4 md:block">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-n-indigo text-[12px] font-semibold text-white">
                OP
              </span>
              <div>
                <p className="text-[12px] font-semibold">Ops Platform</p>
                <p className="text-[10px] text-n-muted">Client workspace</p>
              </div>
            </div>
            <ul className="mt-6 space-y-1 text-[12px]">
              {["Board", "Timeline", "Releases", "Documents", "Reviews"].map((item, i) => (
                <li
                  key={item}
                  className={`rounded-md px-2.5 py-1.5 ${i === 0 ? "bg-n-indigo-100 font-medium text-n-indigo-dark" : "text-n-muted"}`}
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-lg border border-n-line/80 bg-white p-3">
              <p className="text-[10px] font-medium text-n-muted uppercase tracking-[0.06em]">Milestone</p>
              <p className="mt-1 text-[12px] font-semibold">Beta release</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-n-line">
                <div className="h-full w-[72%] rounded-full bg-n-indigo" />
              </div>
              <p className="mt-1.5 font-n-mono text-[10px] text-n-muted">72% · 9 days left</p>
            </div>
          </aside>
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-[12px]">
                {["Board", "List", "Timeline"].map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-md px-2.5 py-1 ${i === 0 ? "bg-n-ink text-white" : "text-n-muted"}`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="flex items-center">
                {Object.keys(avatars).map((who, i) => (
                  <Avatar key={who} who={who} className={`size-7! ${i ? "-ml-1" : ""}`} />
                ))}
                <span className="ml-3 hidden rounded-md border border-n-line px-2 py-1 text-[11px] text-n-muted sm:inline">
                  Sprint 6 · Week 2
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {columns.map((column, i) => (
                <div
                  key={column.title}
                  className={`rounded-xl bg-[#f4f4f1] p-2.5 ${i > 1 ? "hidden lg:block" : ""}`}
                >
                  <p className="flex items-center justify-between px-1 pb-2.5 text-[11px] font-semibold tracking-[0.04em] text-n-muted uppercase">
                    {column.title}
                    <span className="rounded-full bg-white px-1.5 font-n-mono text-[10px]">{column.count}</span>
                  </p>
                  <div className="space-y-2">
                    {column.cards.map((card) => (
                      <TaskCard key={card.id} card={card} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
