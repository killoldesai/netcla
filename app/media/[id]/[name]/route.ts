import { mediaResponse } from "@/media-response";
export const runtime = "nodejs";
// SEO-friendly alias: /media/<id>/<keyword-name>.webp serves the same image.
export async function GET(_: Request, { params }: { params: Promise<{ id: string; name: string }> }) {
  return mediaResponse((await params).id);
}
