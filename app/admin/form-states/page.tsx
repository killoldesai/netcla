import { requireOwner } from "@/auth";
import { SupportPage } from "@/support-page";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Form states",
  robots: { index: false, follow: false },
};
export default async function Page() {
  try {
    await requireOwner();
  } catch {
    notFound();
  }
  return <SupportPage id="form-states" />;
}
