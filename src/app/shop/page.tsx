import { ShopGridSection } from "@/components/content-sections";
import { PageIntro, ShopBanner } from "@/components/sections";
import { productOptions, shopCollections } from "@/data/site";
import { getPublicProducts } from "@/lib/content";

export default async function ShopPage() {
  const products = await getPublicProducts();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Boutique"
        title="Produits, collections et personnalisation"
        description="La boutique est pensée pour accueillir tes vraies collections, tes médias, tes options de personnalisation, les tailles, le flocage, les prix et les futurs moyens de paiement."
      />
      <ShopBanner />
      <ShopGridSection
        items={products}
        productOptions={productOptions}
        shopCollections={shopCollections}
      />
    </main>
  );
}
