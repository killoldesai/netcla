import { assertOrigin, clientKey, limit } from "@/auth";
import { subscribe } from "@/ses-newsletter";
import { boundedJSON } from '@/request-limits';
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    if (Number(request.headers.get("content-length") ?? 0) > 2048)
      return Response.json({ error: "Request too large" }, { status: 413 });
    if (!(await limit("newsletter:" + clientKey(request), 5, 3600)))
      return Response.json(
        { error: "Please try again later" },
        { status: 429 },
      );
    const body = await boundedJSON(request,2048);
    await subscribe(body.email);
    return Response.json({
      message:
        "If eligible, you will receive a confirmation email. Check your inbox.",
    });
  } catch {
    return Response.json(
      { error: "Newsletter signup is unavailable. Please try again later." },
      { status: 400 },
    );
  }
}
