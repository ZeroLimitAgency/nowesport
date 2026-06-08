import { PartnersShowcaseSection } from "@/components/content-sections";
import { PageIntro } from "@/components/sections";
import { getCurrentLocale, getSiteCmsContent } from "@/lib/cms";
import { getPublicPartners } from "@/lib/content";

export default async function PartnersPage() {
  const locale = await getCurrentLocale();
  const [partners, cms] = await Promise.all([getPublicPartners(), getSiteCmsContent(locale)]);
  const intro = cms.blocks["partners.intro"];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro kicker={intro.eyebrow ?? "Partners"} title={intro.title} description={intro.body} />
      <PartnersShowcaseSection partnersData={partners} />
    </main>
  );
}
