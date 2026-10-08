import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { assertOrigin, hash } from "@/auth";
import { query } from "@/db";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    const jar = await cookies(),
      token = jar.get("netofficials_session")?.value;
    if (token)
      await query("DELETE FROM sessions WHERE token_hash=$1", [hash(token)]);
    jar.delete("netofficials_session");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 400 });
  }
}
