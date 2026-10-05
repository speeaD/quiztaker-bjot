import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { legacyScoreMemes, scoreMemeRange } from "@/lib/score-memes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const imageExtensions = /\.(?:avif|gif|jpe?g|png|webp)$/i;

export async function GET(request: NextRequest) {
  const rawPercentage = request.nextUrl.searchParams.get("percentage");
  const percentage = rawPercentage === null ? NaN : Number(rawPercentage);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    return NextResponse.json({ error: "A percentage from 0 to 100 is required." }, { status: 400 });
  }

  const range = scoreMemeRange(percentage);
  let sources: string[] = [];
  try {
    const files = await readdir(path.join(process.cwd(), "public", "memes", range), { withFileTypes: true });
    sources = files
      .filter((file) => file.isFile() && imageExtensions.test(file.name))
      .map((file) => `/memes/${range}/${encodeURIComponent(file.name)}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  if (sources.length === 0) sources = legacyScoreMemes(percentage);
  const src = sources[Math.floor(Math.random() * sources.length)];
  return NextResponse.json({ src }, { headers: { "Cache-Control": "no-store" } });
}
