import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { query } from "@/db";
import { assertOrigin, clientKey, limit, passwordMatches, hash } from "@/auth";
export async function POST(req: Request) {
  try {
    assertOrigin(req);
    if (!(await limit("login:" + clientKey(req), 10, 900)))
      return NextResponse.json({ error: "Try again later" }, { status: 429 });
    const raw = await req.text();
    if (raw.length > 5000)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    const body = JSON.parse(raw);
    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      body.password.length > 1024
    )
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    const [o] = await query("SELECT * FROM owners WHERE email=$1", [
      body.email.toLowerCase().trim(),
    ]);
    if (!o || !passwordMatches(body.password, o.password_hash))
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    const token = randomBytes(32).toString("hex");
    await query(
      "INSERT INTO sessions(token_hash,owner_id,expires_at) VALUES($1,$2,now()+interval '12 hours')",
      [hash(token), o.id],
    );
    (await cookies()).set("netofficials_session", token, {
      httpOnly: true,
      secure: process.env.SITE_URL?.startsWith("https:") ?? false,
      sameSite: "strict",
      path: "/",
      maxAge: 43200,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Login unavailable" }, { status: 503 });
  }
}
