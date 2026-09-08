import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ProductCheckoutControls } from "@/components/product-checkout-controls";
import { getCurrentLocale } from "@/lib/cms";
import { getPublicProductBySlug } from "@/lib/content";
import { breadcrumbJsonLd, privateRobots, productJsonLd, publicMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product?.seoPublishable) {
    return { title: "Produit indisponible", robots: privateRobots };
  }
  return publicMetadata({ title: product.name, description: product.description, path: `/shop/${product.slug}`, image: product.imageUrl });
}

const productCopy = {
  fr: {
    details: "Détails produit",
  },
  en: {
    details: "Product details",
  },
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, locale] = await Promise.all([params, getCurrentLocale()]);
  const product = await getPublicProductBySlug(slug);
  const t = productCopy[locale];

  if (!product) {
    notFound();
  }
  const productStructuredData = productJsonLd({
    publishable: product.seoPublishable, name: product.name, description: product.description,
    path: `/shop/${product.slug}`, priceCents: product.seoPriceCents ?? null,
    currency: product.currency || "EUR", image: product.imageUrl,
    sku: product.stripeProductId, outOfStock: product.outOfStock,
  });

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Boutique", path: "/shop" }, { name: product.name, path: `/shop/${product.slug}` }])} />
      {productStructuredData ? <JsonLd data={productStructuredData} /> : null}
      <section className="mx-auto w-full max-w-[92rem] px-4 pb-8 pt-7 sm:px-8 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[1.5rem] border border-white/8 bg-[linear-gradient(160deg,#faf7f9_0%,#eadbe4_28%,#18151a_29%,#09090a_100%)] p-3 sm:rounded-[2rem] sm:p-6">
            <div className="relative mx-auto flex min-h-[18rem] w-full max-w-[18rem] sm:min-h-[34rem] sm:max-w-[22rem] items-center justify-center overflow-hidden rounded-[1.8rem] sm:min-h-[34rem]">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="h-full min-h-[18rem] w-full object-cover sm:min-h-[34rem]" />
              ) : <p className="px-6 text-center text-xs font-bold uppercase tracking-[0.14em] text-white/65">{locale === "fr" ? "Image produit indisponible" : "Product image unavailable"}</p>}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,#171219_0%,#09090b_100%)] px-4 py-6 sm:rounded-[2rem] sm:px-8 sm:py-8">
            <p className="section-kicker">{product.category}</p>
            <h1 className="mt-4 text-[clamp(2rem,11vw,3.75rem)] font-black uppercase leading-none tracking-[-0.05em] text-white sm:text-6xl">
              {product.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">
              {product.intro}
            </p>

            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/82">
              {product.price}
            </div>

            {product.details.length ? (
              <div className="mt-8">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/65">{t.details}</p>
                <div className="mt-4 grid gap-3">
                  {product.details.map((detail) => (
                    <div
                      key={detail}
                      className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/60"
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <ProductCheckoutControls product={product} />
          </div>
        </div>
      </section>
    </main>
  );
}
