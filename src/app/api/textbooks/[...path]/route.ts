import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ path: string[] }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers = { "Cache-Control": "private, no-store" };

export async function GET(_request: NextRequest, context: Context) {
  const { path } = await context.params;
  const book = path[0] === "books" && UUID.test(path[1] || "");
  const reader = book && path.length === 3 && path[2] === "reader";
  const page = book && path.length === 4 && path[2] === "pages" && /^[1-9]\d{0,5}$/.test(path[3]);
  if (!(path.length === 1 && path[0] === "books") && !reader && !page) {
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
    if (response.ok && page) {
      if (!response.headers.get("Content-Type")?.startsWith("image/webp")) throw new Error("Invalid page response");
      return new NextResponse(response.body, { headers: { ...headers, "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff", "Cross-Origin-Resource-Policy": "same-origin", "Content-Disposition": "inline" } });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers });
  } catch {
    return NextResponse.json({ success: false, message: "Textbooks are unavailable. Please try again later." }, { status: 502, headers });
  }
}
