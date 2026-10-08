import "./globals.css";
import "./service-family.css";
import "./public-theme.css";
import "./admin.css";
import "./admin-console.css";
import type { Metadata } from "next";
import { Analytics } from "@/analytics";
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  robots:
    process.env.STAGING !== "false"
      ? { index: false, follow: false }
      : undefined,
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics
          id={process.env.GA4_ID}
          enabled={process.env.STAGING === "false"}
        />
      </body>
    </html>
  );
}
