import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const valid = request.method === "GET" && (
    path.length === 1 && ["plans", "subscription"].includes(path[0]) ||
    path.length === 2 && path[0] === "verify" && /^[a-zA-Z0-9_-]{1,100}$/.test(path[1])
  ) || request.method === "POST" && path.length === 1 && path[0] === "initialize";
  if (!valid) return NextResponse.json({ message: "Unknown payment route" }, { status: 404 });
  if (request.method === "POST" && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return NextResponse.json({ message: "Please sign in to continue" }, { status: 401 });
  const backend = process.env.BACKEND_URL;
  if (!backend) return NextResponse.json({ message: "Payments are temporarily unavailable" }, { status: 503 });
  try {
    const response = await fetch(`${backend.replace(/\/$/, "")}/payments/${path.join("/")}`, {
      method: request.method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: request.method === "POST" ? await request.text() : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    const result = NextResponse.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    });
    if (response.status === 401) {
      result.cookies.delete("auth-token");
      result.cookies.delete("quizTaker");
    }
    return result;
  } catch {
    return NextResponse.json({ message: "Unable to reach the payment service. Please try again." }, { status: 502 });
  }
}

export const GET = forward;
export const POST = forward;
