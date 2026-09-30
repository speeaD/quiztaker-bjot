import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import StudentPortalHeader from "@/components/layout/StudentHeader";
import { siteDescription, siteUrl } from "@/lib/seo";

const poppins = Poppins({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "BJOT | Blast JAMB Online Tutorial", template: "%s | BJOT" },
  description: siteDescription,
  icons: {
    icon: { url: "/bjot-logo-cropped.png", type: "image/png" },
    apple: "/bjot-logo-cropped.png",
  },
  openGraph: {
    type: "website",
    siteName: "BJOT",
    images: [{ url: "/bjot-logo-cropped.png", width: 520, height: 520, alt: "BJOT logo" }],
  },
  twitter: {
    card: "summary",
    images: ["/bjot-logo-cropped.png"],
  },
  // Public editorial pages explicitly opt in to indexing.
  robots: { index: false, follow: true },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f3d2c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable}`}
      >
        <StudentPortalHeader />
        {children}
      </body>
    </html>
  );
}
