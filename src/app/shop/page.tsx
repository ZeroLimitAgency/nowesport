import { ShopGridSection } from "@/components/content-sections";
import { PageIntro, ShopBanner } from "@/components/sections";
import { getCurrentLocale, getShopPresentation, getSiteCmsContent } from "@/lib/cms";
import { getPublicProducts } from "@/lib/content";

export default async function ShopPage() {
  const locale = await getCurrentLocale();
  const [products, cms] = await Promise.all([getPublicProducts(), getSiteCmsContent(locale)]);
  const intro = cms.blocks["shop.intro"];
  const banner = cms.blocks["shop.banner"];
  const { productOptions, shopCollections } = getShopPresentation();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro kicker={intro.eyebrow ?? "Shop"} title={intro.title} description={intro.body} />
      <ShopBanner
        eyebrow={banner.eyebrow}
        title={banner.title}
        description={banner.body}
        primaryCta={banner.ctaLabel}
        primaryHref={banner.ctaHref}
        secondaryCta={banner.secondaryCtaLabel}
        secondaryHref={banner.secondaryCtaHref}
      />
      <ShopGridSection
        items={products}
        productOptions={productOptions}
        shopCollections={shopCollections}
        locale={locale}
      />
    </main>
  );
}
