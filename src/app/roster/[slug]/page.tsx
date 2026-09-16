import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { RosterDetail } from "@/components/roster-sections";
import { getCurrentLocale } from "@/lib/cms";
import { getPublicRosterTeamBySlug } from "@/lib/content";
import { breadcrumbJsonLd, privateRobots, publicMetadata } from "@/lib/seo";
import { isSeoPublishableRoster } from "@/lib/publication";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = await getPublicRosterTeamBySlug(slug);
  if (!team || !isSeoPublishableRoster({ ...team, is_public: true, is_active: true })) {
    return { title: "Équipe indisponible", robots: privateRobots };
  }
  const description = [team.description, team.game, team.category].filter(Boolean).join(" · ");
  return publicMetadata({ title: team.name, description, path: `/roster/${team.slug}`, image: team.bannerUrl || team.logoUrl });
}

export default async function RosterTeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [team, locale] = await Promise.all([getPublicRosterTeamBySlug(slug), getCurrentLocale()]);
  if (!team) notFound();
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <JsonLd data={breadcrumbJsonLd([{ name: locale === "fr" ? "Accueil" : "Home", path: "/" }, { name: "Rosters", path: "/roster" }, { name: team.name, path: `/roster/${team.slug}` }])} />
      <RosterDetail team={team} locale={locale} />
    </main>
  );
}
