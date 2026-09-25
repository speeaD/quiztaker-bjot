import "server-only";

export type Cta = { label: string; href: string };
export type SectionContent = {
  eyebrow?: string;
  heading?: string;
  description?: string;
  text?: string;
  trustText?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  cta?: Cta;
  items?: { value: string; label: string }[];
  steps?: { title: string; description: string }[];
  metrics?: { value: string; label: string }[];
  gallery?: { label: string; caption: string; imageUrl?: string }[];
  highlights?: string[];
  categories?: { title: string; items: { question: string; answer: string }[] }[];
  brand?: string;
  tagline?: string;
  copyright?: string;
};

export type LandingSection = {
  key: string;
  page: string;
  displayOrder: number;
  content: SectionContent;
};
export type StaffMember = {
  id: string;
  name: string;
  role: string | null;
  course: string | null;
  bio: string | null;
  imageUrl: string | null;
};
export type Testimonial = {
  id: string;
  type: string;
  studentName: string;
  quote: string;
  score: string | null;
  course: string | null;
  school: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  videoDuration: string | null;
  isVerified: boolean;
};
export type Contact = {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  youtube: string | null;
  address: string | null;
};
export type LandingContent = {
  sections: LandingSection[];
  staff: StaffMember[];
  testimonials: Testimonial[];
  contact: Contact | null;
};

export async function getLandingContent(): Promise<LandingContent | null> {
  const base = process.env.BACKEND_URL;
  if (!base) {
    console.error("BACKEND_URL is required to load landing content");
    return null;
  }

  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/public/content`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error(`CMS request failed: ${response.status}`);
    const payload: unknown = await response.json();
    if (!isLandingResponse(payload)) throw new Error("Invalid CMS response");
    return payload.content;
  } catch (error) {
    console.error("Unable to load landing content", error);
    return null;
  }
}

function isLandingResponse(value: unknown): value is { success: true; content: LandingContent } {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  if (payload.success !== true || !payload.content || typeof payload.content !== "object") return false;
  const content = payload.content as Record<string, unknown>;
  return Array.isArray(content.sections) && content.sections.every((item: unknown) =>
      isRecord(item) && typeof item.key === "string" && isRecord(item.content)) &&
    Array.isArray(content.staff) && content.staff.every((item: unknown) =>
      isRecord(item) && typeof item.id === "string" && typeof item.name === "string") &&
    Array.isArray(content.testimonials) && content.testimonials.every((item: unknown) =>
      isRecord(item) && typeof item.id === "string" && typeof item.studentName === "string" &&
      typeof item.quote === "string" && typeof item.type === "string") &&
    (content.contact === null || isRecord(content.contact));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function section(content: LandingContent, key: string): SectionContent | null {
  return content.sections.find((entry) => entry.key === key)?.content ?? null;
}
