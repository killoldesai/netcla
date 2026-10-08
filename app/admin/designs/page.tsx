import { requireOwner } from "@/auth";
import { SupportPage } from "@/support-page";
import { query } from "@/db";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Screen library",
  robots: { index: false, follow: false },
};
export default async function Page() {
  try {
    await requireOwner();
  } catch {
    notFound();
  }
  const pages = await query("SELECT id,path FROM pages ORDER BY path");
  const linkMap = Object.fromEntries(
    pages.map((p) => [p.path, "/admin/preview/" + p.id]),
  );
  linkMap["/design-library"] = "/admin/designs";
  linkMap["/form-states"] = "/admin/form-states";
  return (
    <>
      <div className="preview-banner">
        <a href="/admin">Owner workspace</a> · Private approved design library
      </div>
      <SupportPage id="design-library" linkMap={linkMap} />
    </>
  );
}
