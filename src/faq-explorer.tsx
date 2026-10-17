"use client";
// FAQ explorer: category tabs, a search box, and two columns of native <details>. Answers arrive as sanitised HTML from
// the server. Searching looks across every category; clearing the box returns to the selected tab.
import { useMemo, useState } from "react";
import { V2Icon } from "./site/v2/ui";

export type FaqCategory = { name: string; items: { q: string; a: string }[] };

export function FaqExplorer({ categories }: { categories: FaqCategory[] }) {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = useMemo(() => {
    if (!q) return categories[tab]?.items.map((it) => ({ ...it, cat: "" })) ?? [];
    return categories.flatMap((c) => c.items.filter((it) => (it.q + " " + it.a.replace(/<[^>]+>/g, " ")).toLowerCase().includes(q)).map((it) => ({ ...it, cat: c.name })));
  }, [categories, tab, q]);
  const half = Math.ceil(shown.length / 2);
  const cols = [shown.slice(0, half), shown.slice(half)];
  const total = categories.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="faqx">
      <div className="faqx__bar">
        <label className="faqx__search">
          <V2Icon name="search" />
          <span className="sr-only">Search the questions</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${total} questions`} />
        </label>
        <div className="seg faqx__tabs" role="tablist" aria-label="Question topics">
          {categories.map((c, i) => (
            <button key={c.name} type="button" role="tab" aria-selected={!q && i === tab} tabIndex={!q && i === tab ? 0 : -1} onClick={() => { setTab(i); setQuery(""); }}>
              {c.name}
              <small>{c.items.length}</small>
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="faqx__empty">No question matches that search. Try a shorter word, or ask the team directly below.</p>
      ) : (
        <div className="faqx__cols" key={q ? "search" : tab}>
          {cols.map((col, c) => (
            <div className="acc" key={c}>
              {col.map((it) => (
                <details key={it.q}>
                  <summary>
                    <span>
                      {it.cat && <small className="faqx__cat">{it.cat}</small>}
                      {it.q}
                    </span>
                    <i aria-hidden="true">
                      <V2Icon name="plus" />
                    </i>
                  </summary>
                  <div className="prose" dangerouslySetInnerHTML={{ __html: it.a }} />
                </details>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
