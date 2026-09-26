import type { MetadataRoute } from "next";
import { absoluteUrl, publicPages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  // No invented lastModified dates: CMS content has its own publishing cadence.
  return publicPages.map((path) => ({ url: absoluteUrl(path) }));
}
