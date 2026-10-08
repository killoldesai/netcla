import { confirmSubscription, unsubscribe } from "@/ses-newsletter";
import { redirect, notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Newsletter preferences",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ action: string }>;
  searchParams: Promise<{ token?: string; result?: string }>;
}) {
  const action = (await params).action,
    value = (await searchParams).token ?? "";
  if (
    !["confirm", "unsubscribe"].includes(action) ||
    !/^[a-f0-9]{64}$/.test(value)
  )
    notFound();
  const result = (await searchParams).result;
  // GET never changes subscription state; mail scanners can safely visit these links.
  async function update(form: FormData) {
    "use server";
    const token = String(form.get("token") ?? "");
    let success = true;
    if (action === "confirm") success = await confirmSubscription(token);
    if (action === "unsubscribe") await unsubscribe(token);
    redirect(
      "/newsletter/" +
        action +
        "?token=" +
        encodeURIComponent(value) +
        "&result=" +
        (success ? "success" : "expired"),
    );
  }
  return (
    <main className="admin">
      <h1>
        {action === "confirm" ? "Confirm your subscription" : "Unsubscribe"}
      </h1>
      <p>
        {action === "confirm"
          ? "Use the button below to confirm your email. Confirmation links expire after 24 hours."
          : "Use the button below to stop receiving newsletter emails."}
      </p>
      <form action={update}>
        <input type="hidden" name="token" value={value} />
        <button type="submit">
          {action === "confirm" ? "Confirm" : "Unsubscribe"}
        </button>
      </form>
      {result && (
        <p role="status">
          {result === "success"
            ? action === "confirm"
              ? "Subscription confirmed."
              : "Your newsletter preference has been updated."
            : "This confirmation link has expired or has already been used."}
        </p>
      )}
      <a href="/">Return to Netofficials</a>
    </main>
  );
}
