import { requireOwner } from "@/auth";
import { runBoard } from "@/run-board";

export const dynamic = "force-dynamic";

const POLL_MS = 1500;
const MAX_MS = 10 * 60 * 1000;

/** Server-Sent Events: pushes the generation board whenever it changes. */
export async function GET(request: Request) {
  try {
    await requireOwner();
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stream = new ReadableStream({
    async start(controller) {
      const started = Date.now();
      let last = "";
      const send = (event: string, data: string) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
      const tick = async () => {
        if (request.signal.aborted) return;
        try {
          const body = JSON.stringify(await runBoard());
          if (body !== last) send("board", (last = body));
          else controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          send("error", JSON.stringify({ message: "Progress temporarily unavailable" }));
        }
        // Browsers reconnect automatically after the stream ends.
        if (Date.now() - started > MAX_MS) return controller.close();
        timer = setTimeout(tick, POLL_MS);
      };
      request.signal.addEventListener("abort", () => {
        clearTimeout(timer);
        try {
          controller.close();
        } catch {}
      });
      await tick();
    },
    cancel() {
      clearTimeout(timer);
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
