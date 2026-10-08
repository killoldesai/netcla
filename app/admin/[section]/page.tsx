import { ConsolePage } from "@/admin-console-page";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (
    ![
      "sitemap",
      "generation",
      "pages",
      "production",
      "media",
      "leads",
      "newsletter",
      "careers",
      "settings",
    ].includes(section)
  )
    notFound();
  return ConsolePage({ section });
}
