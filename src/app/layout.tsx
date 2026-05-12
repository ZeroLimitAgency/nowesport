import type { Metadata } from "next";
import { Space_Grotesk, Bebas_Neue } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "NOW eSport",
  description: "Open-source storefront rebuild for NOW eSport.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${grotesk.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
