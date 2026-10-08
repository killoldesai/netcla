"use client";
import { useState } from "react";
import { menuLabel, menuGroup, menuGroupOrder, menuScope } from "./menu-labels";
const labels: Record<string, string> = {
  software: "Software development",
  mobile: "Mobile applications",
  ai: "AI and machine learning",
  cloud: "Cloud and DevOps",
  hire: "Hire developers",
  technology: "Technologies",
  industry: "Industries",
  location: "Global delivery",
  marketing: "Search marketing",
  home: "Company",
  directory: "Company",
  company: "Company",
  contact: "Company",
  work: "Our work",
};
export function SiteMenu({
  items,
  close,
  scope,
}: {
  items: { path: string; title: string; href: string }[];
  close: () => void;
  scope: string;
}) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    if (menuScope(item.path) !== scope) continue;
    const title = menuLabel(item.path, item.title);
    if (
      !(title + " " + item.title).toLowerCase().includes(search.toLowerCase())
    )
      continue;
    const group = menuGroup(item.path);
    groups.set(group, [...(groups.get(group) ?? []), { ...item, title }]);
  }
  return (
    <div className="site-menu-panel">
      <label className="site-menu-search">
        {scope}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={"Search " + scope.toLowerCase()}
        />
      </label>
      <div className="site-menu-layout">
        {!search && (
          <div
            className="site-menu-clusters"
            role="group"
            aria-label="Browse service clusters"
          >
            {menuGroupOrder
              .filter((g) => groups.has(g))
              .map((g) => (
                <button
                  key={g}
                  aria-label={g}
                  type="button"
                  aria-pressed={
                    g ===
                    (groups.has(active)
                      ? active
                      : menuGroupOrder.find((x) => groups.has(x)))
                  }
                  onClick={() => setActive(g)}
                >
                  {g}
                  <span aria-hidden="true">›</span>
                </button>
              ))}
          </div>
        )}
        <div className="site-menu-groups">
          {menuGroupOrder
            .filter((g) => groups.has(g))
            .map((label) => {
              const links = groups.get(label)!;
              return (
                <section
                  key={label}
                  hidden={
                    !search &&
                    label !==
                      (groups.has(active)
                        ? active
                        : menuGroupOrder.find((x) => groups.has(x)))
                  }
                >
                  <h3>{label}</h3>
                  <ul>
                    {links.map((item) => (
                      <li key={item.path}>
                        <a href={item.href} onClick={close}>
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
        </div>
      </div>
      {!groups.size && <p role="status">No matching pages.</p>}
    </div>
  );
}
