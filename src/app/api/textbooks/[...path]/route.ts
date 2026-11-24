import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ path: string[] }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: NextRequest, context: Context) {
  const { path } = await context.params;
  const download = path.length === 3 && path[0] === "books" && UUID.test(path[1]) && path[2] === "download";
  if (!(path.length === 1 && path[0] === "books") && !download) {
    return NextResponse.json({ success: false, message: "Unknown textbook route" }, { status: 404, headers });
  }
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return NextResponse.json({ success: false, message: "Please sign in to access textbooks" }, { status: 401, headers });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ success: false, message: "Textbook service is not configured" }, { status: 503, headers });
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/textbooks/${path.join("/")}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    const data = await response.json();
    if (response.ok && download) {
      return NextResponse.redirect(data.url, { status: 302, headers: { ...headers, "Referrer-Policy": "no-referrer" } });
    }
    return NextResponse.json(data, { status: response.status, headers });
  } catch {
    return NextResponse.json({ success: false, message: "Textbooks are unavailable. Please try again later." }, { status: 502, headers });
  }
}
