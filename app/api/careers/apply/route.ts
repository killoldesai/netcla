import { assertOrigin, clientKey, limit } from "@/auth";
import { submitApplication } from "@/careers";
import { boundedBody } from '@/request-limits';
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const length = Number(request.headers.get("content-length") ?? 0);
    if (!length || length > 5 * 1024 * 1024 + 65536)
      return Response.json(
        { error: "Maximum CV size is 5 MB" },
        { status: 413 },
      );
    if (!(await limit("career:" + clientKey(request), 5, 3600)))
      return Response.json(
        { error: "Please try again later" },
        { status: 429 },
      );
    const bytes=await boundedBody(request,5*1024*1024+65536);
    const form = await new Response(bytes,{headers:{'Content-Type':request.headers.get('content-type')??''}}).formData();
    if (form.get("company_url"))
      return Response.json({ message: "Application received." });
    await submitApplication(form);
    return Response.json({ message: "Your application has been received." });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error &&
          !/database|decrypt|credential|secret|connect/i.test(error.message)
            ? error.message
            : "Applications are temporarily unavailable. Please try again later.",
      },
      { status: 400 },
    );
  }
}
