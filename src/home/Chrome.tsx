"use client";
import { MegaNavigation } from "../mega-navigation";
import { groups } from "../stripe-home-chrome";
import { Cta, container, useDestination, useHome } from "./ui";

const fallback: Record<string, string> = {
  Services: "#services",
  "Hire Developers": "#hire",
  Industries: "#industries",
  Company: "#india",
};

function useGroups() {
  const destination = useDestination();
  return groups.map(([title, items]) => {
    const links = items.flatMap(([label, path]) => {
      const href = destination(path);
      return href ? [[label, href] as const] : [];
    });
    return {
      title,
      links: links.length
        ? links
        : [[`Explore ${title.toLowerCase()}`, fallback[title]] as const],
    };
  });
}

function Logo() {
  const { linkMap } = useHome();
  return (
    <a
      href={linkMap["/"] ?? "/"}
      aria-label="Netofficials home"
      className="shrink-0"
    >
      <img
        src="/assets/logo.png"
        alt="Netofficials"
        width={160}
        height={26}
        className="h-[26px] w-auto"
      />
    </a>
  );
}

export function HomeHeader() {
  const { paths, preview, linkMap } = useHome();
  return (
    <MegaNavigation
      paths={paths}
      preview={preview}
      linkMap={linkMap}
      homeHref={linkMap["/"] ?? "/"}
      contactHref="#contact"
    />
  );
}

export function HomeFooter() {
  const { preview } = useHome();
  const destination = useDestination();
  const columns = useGroups();
  const privacy = destination("/privacy-policy"),
    terms = destination("/terms-and-conditions");
  return (
    <footer className="border-t border-n-ink/[0.06] bg-white">
      <div className={`${container} py-16`}>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-[34ch] text-[15px] leading-[1.6] text-n-muted">
              India-based software development for business applications,
              mobile products, AI and cloud. Serving international project
              enquiries.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-n-mono text-[12px] tracking-[0.08em] text-n-muted uppercase">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {column.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-[14px] text-n-ink/80 transition-colors duration-150 hover:text-n-indigo"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-n-line pt-6 font-n-mono text-[12px] text-n-muted sm:flex-row">
          <span>© {new Date().getFullYear()} Netofficials · India</span>
          <span className="flex gap-4">
            {privacy && <a href={privacy}>Privacy Policy</a>}
            {terms && <a href={terms}>Terms</a>}
            {!privacy && !terms && (
              <span>
                {preview
                  ? "Design preview · Forms do not send enquiries"
                  : "Software · Mobile · AI · Cloud"}
              </span>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
