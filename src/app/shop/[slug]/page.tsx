import { notFound } from "next/navigation";
import { ProductCheckoutControls } from "@/components/product-checkout-controls";
import { productOptions } from "@/data/site";
import { getCurrentLocale } from "@/lib/cms";
import { getPublicProductBySlug } from "@/lib/content";

export function generateStaticParams() {
  return [];
}

const productCopy = {
  fr: {
    details: "Détails produit",
    options: "Options disponibles",
  },
  en: {
    details: "Product details",
    options: "Available options",
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

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(160deg,#faf7f9_0%,#eadbe4_28%,#18151a_29%,#09090a_100%)] p-4 sm:p-6">
            <div className="relative mx-auto flex min-h-[24rem] w-full max-w-[22rem] items-center justify-center overflow-hidden rounded-[1.8rem] sm:min-h-[34rem]">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="h-full min-h-[24rem] w-full object-cover sm:min-h-[34rem]" />
              ) : (
                <>
                  <div className="absolute inset-x-[12%] top-[5%] h-[78%] rounded-[2.4rem_2.4rem_2.8rem_2.8rem] bg-[linear-gradient(180deg,#17171b_0%,#060606_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]" />
                  <div className="absolute inset-x-[24%] top-[12%] h-5 rounded-full border-4 border-[var(--color-accent)]/80" />
                  <div className="absolute top-[30%] text-center text-5xl font-black uppercase italic tracking-[-0.08em] text-white sm:text-6xl">
                    NOW
                  </div>
                  <div className="absolute bottom-[18%] h-[2px] w-28 bg-[var(--color-accent)]" />
                </>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#171219_0%,#09090b_100%)] px-5 py-7 sm:px-8 sm:py-8">
            <p className="section-kicker">{product.category}</p>
            <h1 className="mt-4 text-4xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl">
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
                <p className="text-xs font-black uppercase tracking-[0.24em] text-white/38">{t.details}</p>
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

            <div className="mt-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/38">{t.options}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {productOptions.map((option) => (
                  <div
                    key={option.label}
                    className="rounded-[1.1rem] border border-white/8 bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-white">{option.label}</p>
                    <p className="mt-1 text-sm text-white/48">{option.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <ProductCheckoutControls product={product} />
          </div>
        </div>
      </section>
    </main>
  );
}
