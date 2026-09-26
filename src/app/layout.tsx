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
