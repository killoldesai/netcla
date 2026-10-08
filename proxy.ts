import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function proxy(req: NextRequest) {
  const r = NextResponse.next();
  if (
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/design-preview") ||
    process.env.STAGING !== "false"
  )
    r.headers.set("X-Robots-Tag", "noindex, nofollow");
  return r;
}
export const config = { matcher: ["/((?!_next/static|_next/image|assets).*)"] };
