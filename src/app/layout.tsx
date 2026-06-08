import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { getCurrentLocale, getSiteCmsContent } from "@/lib/cms";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NOW eSport",
    template: "%s | NOW eSport",
  },
  description: "Site officiel NOW eSport : roster, boutique, événements, partenaires et espace client.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nowesport.org"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();
  const cms = await getSiteCmsContent(locale);

  return (
    <html lang={locale} data-theme="dark" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <SiteShell cms={cms}>{children}</SiteShell>
      </body>
    </html>
  );
}
