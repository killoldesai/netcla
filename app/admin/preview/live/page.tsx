import { notFound } from "next/navigation";
import { requireOwner } from "@/auth";
import { LivePreview } from "@/admin/live-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live draft preview", robots: { index: false, follow: false } };

export default async function Page() {
  try {
    await requireOwner();
  } catch {
    notFound();
  }
  return <LivePreview />;
}
