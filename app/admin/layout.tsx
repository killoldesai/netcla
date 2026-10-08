import type { Metadata } from "next";
export const metadata: Metadata = {
  title: { default: "Netofficials Admin", template: "%s | Netofficials Admin" },
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
