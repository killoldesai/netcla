import { mediaResponse } from "@/media-response";
export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  return mediaResponse((await params).id);
}
