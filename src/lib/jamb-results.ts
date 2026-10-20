import type { LandingContent, Testimonial } from "@/lib/landing-content";
import { section } from "@/lib/landing-content";

export function recordedUtmeScore(content: LandingContent): number | null {
  const metric = section(content, "home.statistics")?.items?.find(
    (item) => item.label.toLowerCase() === "highest utme score recorded",
  );
  const value = metric?.value.trim() ?? "";
  if (!/^\d{1,3}$/.test(value)) return null;
  const score = Number(value);
  return score > 0 && score <= 400 ? score : null;
}

export function featuredJambResult(content: LandingContent): Testimonial | null {
  return content.testimonials.find(
    (item) =>
      item.studentName.trim().toLowerCase() === "umukoro oghenevovwero" &&
      item.score?.trim() === "367/400" &&
      item.isVerified &&
      item.type === "video" &&
      Boolean(item.videoUrl),
  ) ?? null;
}
