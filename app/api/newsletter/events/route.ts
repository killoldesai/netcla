import { handleSesEvent } from "@/ses-newsletter";
import { boundedJSON } from '@/request-limits';
export async function POST(request: Request) {
  try {
    await handleSesEvent(await boundedJSON(request,120000));
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
