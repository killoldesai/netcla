import { owner } from "@/auth";
import { redirect } from "next/navigation";
import { ConsolePage } from "@/admin-console-page";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};
export default async function Page() {
  if (!process.env.DATABASE_URL)
    return (
      <main className="admin">
        <h1>Configure Neon to initialize the owner workspace.</h1>
        <p>Run migrations, seed drafts and create the owner account.</p>
      </main>
    );
  if (!(await owner())) redirect("/admin/login");
  return ConsolePage({});
}
