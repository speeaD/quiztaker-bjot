import type { Metadata } from "next";
import type { LandingContent, StaffMember } from "@/lib/landing-content";

// Set SITE_URL to the preferred public origin, never a preview deployment URL.
export const siteUrl = new URL(process.env.SITE_URL || "https://www.bjotofficial.com").origin;
export const siteName = "BJOT";
export const organizationName = "Blast JAMB Online Tutorial";
export const siteDescription = "Prepare for JAMB UTME with BJOT (Blast JAMB Online Tutorial): tutor-led lessons, CBT practice, mock exams and a practical UTME study guide.";
export const publicPages = ["/", "/about-us", "/utme-preparation-guide", "/testimonials", "/support"] as const;

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function publicMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
    openGraph: { type: "website", locale: "en_NG", siteName, title, description, url: absoluteUrl(path), images: [{ url: absoluteUrl("/group-bjot.png"), alt: "Blast JAMB Online Tutorial (BJOT)" }] },
    twitter: { card: "summary_large_image", title, description, images: [absoluteUrl("/group-bjot.png")] },
  };
}

export function tutorAnchor(id: string) {
  return `tutor-${encodeURIComponent(id)}`;
}

export function tutorSchema(member: StaffMember) {
  const url = absoluteUrl(`/about-us#${tutorAnchor(member.id)}`);
  return {
    "@type": "Person",
    "@id": url,
    url,
    name: member.name,
    jobTitle: member.role || undefined,
    description: member.bio || undefined,
    worksFor: { "@id": absoluteUrl("/#organization") },
  };
}

export function organizationSchema(content: LandingContent | null) {
  const contact = content?.contact;
  // The CMS also accepts channel names; only real profile URLs belong in sameAs.
  const youtube = typeof contact?.youtube === "string" && /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(contact.youtube)
    ? contact.youtube : undefined;
  return {
    "@type": "EducationalOrganization",
    "@id": absoluteUrl("/#organization"),
    name: organizationName,
    alternateName: siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/bjot-logo.png"),
    description: siteDescription,
    email: contact?.email || undefined,
    telephone: contact?.phone || undefined,
    address: contact?.address || undefined,
    sameAs: youtube ? [youtube] : undefined,
  };
}

export function websiteSchema() {
  return { "@type": "WebSite", "@id": absoluteUrl("/#website"), name: siteName, alternateName: organizationName, url: absoluteUrl("/"), publisher: { "@id": absoluteUrl("/#organization") } };
}
