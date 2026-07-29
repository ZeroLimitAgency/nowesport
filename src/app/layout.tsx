import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getCurrentLocale, getSiteCmsContent } from "@/lib/cms";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { isMaintenanceEnabled } from "@/lib/maintenance";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: "/manifest.webmanifest",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website", url: SITE_URL, siteName: SITE_NAME, locale: "fr_FR",
    title: SITE_NAME, description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image", title: SITE_NAME, description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();
  const [cms, maintenance, cookieStore] = await Promise.all([
    getSiteCmsContent(locale), isMaintenanceEnabled(), cookies(),
  ]);
  const usePublicShell = !maintenance || cookieStore.get("now-preview")?.value === "1";

  return (
    <html lang={locale} data-theme="dark" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {usePublicShell ? <SiteShell cms={cms}>{children}</SiteShell> : children}
      </body>
    </html>
  );
}
