"use client";

import { useState, type ReactNode } from "react";

export function WorkFilter({
  sections,
}: {
  sections: { id: string; label: string; node: ReactNode }[];
}) {
  const [active, setActive] = useState("all");
  return (
    <>
      <div
        className="csv-wrap work-filters"
        role="group"
        aria-label="Filter work by service"
      >
        {[{ id: "all", label: "All work" }, ...sections].map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={active === s.id}
            onClick={() => setActive(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {sections.map((s) => (
        <div key={s.id} hidden={active !== "all" && active !== s.id}>
          {s.node}
        </div>
      ))}
    </>
  );
}
