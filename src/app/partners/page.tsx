import { PartnersShowcaseSection } from "@/components/content-sections";
import { PageIntro } from "@/components/sections";
import { getPublicPartners } from "@/lib/content";

export default async function PartnersPage() {
  const partners = await getPublicPartners();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Partenaires"
        title="Blocs partenaires avec image, texte et lien"
        description="Chaque partenaire est pensé comme un bloc éditorial avec image, nom, description et lien de redirection configurable."
      />
      <PartnersShowcaseSection partnersData={partners} />
    </main>
  );
}
