"use client";
import type { ReactNode } from "react";

export function ServiceDirectoryLink({
  href,
  service,
  preview,
  className,
  label,
  children,
}: {
  href: string;
  service: string;
  preview: boolean;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      aria-label={label}
      data-track="service_hub_click"
      onClick={() => {
        if (preview) return;
        (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.(
          "event",
          "service_hub_click",
          {
            hub: service,
            destination: href,
            source: "services_directory",
          },
        );
      }}
    >
      {children}
    </a>
  );
}
