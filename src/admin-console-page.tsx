import { owner } from "./auth";
import { redirect } from "next/navigation";
import { AdminConsole } from "./admin-console";
export async function ConsolePage({
  section = "dashboard",
  id,
}: {
  section?: string;
  id?: string;
}) {
  if (!(await owner()))
    redirect(
      "/admin/login?next=" +
        encodeURIComponent(
          section === "dashboard"
            ? "/admin"
            : "/admin/" + section + (id ? "/" + id : ""),
        ),
    );
  return <AdminConsole section={section} id={id} />;
}
