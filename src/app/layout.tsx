import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "NOW eSport",
    template: "%s | NOW eSport",
  },
  description: "Site officiel NOW eSport : roster, boutique, événements, partenaires et espace client.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nowesport.org"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="dark" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
