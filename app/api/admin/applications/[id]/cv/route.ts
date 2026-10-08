import { requireOwner } from "@/auth";
import { query } from "@/db";
import { readCV } from "@/careers";
export const runtime = "nodejs";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireOwner();
    const { id } = await params;
    if (!/^[a-f0-9-]{36}$/i.test(id))
      return new Response(null, { status: 404 });
    const [application] = await query(
      "SELECT cv_filename,cv_mime,cv_hash FROM career_applications WHERE id=$1 AND scan_result='clean'",
      [id],
    );
    if (!application) return new Response(null, { status: 404 });
    return new Response(
      new Uint8Array(
        await readCV(application.cv_filename, application.cv_hash),
      ),
      {
        headers: {
          "Content-Type": application.cv_mime,
          "Content-Disposition":
            'attachment; filename="cv' +
            (application.cv_mime === "application/pdf" ? ".pdf" : ".docx") +
            '"',
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return new Response(null, { status: 404 });
  }
}
