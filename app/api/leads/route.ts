import { pillarFor } from "@/site-structure";
import { NextResponse } from "next/server";
import { leadSchema } from "@/content";
import { query, transaction } from "@/db";
import { assertOrigin, clientKey, limit } from "@/auth";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    if (Number(req.headers.get("content-length") ?? 0) > 20000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const text = await req.text();
    if (text.length > 20000)
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const parsed = leadSchema.safeParse(JSON.parse(text));
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Check the highlighted information",
          fields: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    const data = parsed.data;
    if (data.company_url)
      return NextResponse.json(
        { error: "Submission rejected" },
        { status: 422 },
      );
    if (!(await limit("lead:" + clientKey(req), 5, 3600)))
      return NextResponse.json(
        { error: "Too many attempts. Please try later." },
        { status: 429 },
      );
    const result = await transaction(async (c) => {
      const inserted = await c.query(
        "INSERT INTO leads(request_id,data) VALUES($1,$2) ON CONFLICT(request_id) DO NOTHING RETURNING id",
        [
          data.requestId,
          // Record the pillar the enquiry came from for lead reporting.
          JSON.stringify({ ...data, pillar: pillarFor(data.landingPage.split(/[?#]/)[0])?.id ?? null }),
        ],
      );
      if (inserted.rows[0])
        return { id: inserted.rows[0].id, duplicate: false };
      const existing = await c.query(
        "SELECT id FROM leads WHERE request_id=$1",
        [data.requestId],
      );
      return { id: existing.rows[0].id, duplicate: true };
    });
    return NextResponse.json(
      { ok: true, ...result },
      { status: result.duplicate ? 200 : 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Your enquiry could not be saved. Please try again." },
      { status: 503 },
    );
  }
}
