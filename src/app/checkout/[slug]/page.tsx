import Link from "next/link";
import { notFound } from "next/navigation";
import { EmbeddedCheckoutExperience } from "@/components/embedded-checkout";
import { getPublicProductBySlug } from "@/lib/content";

export default async function CheckoutProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-8 flex flex-col gap-4">
          <p className="section-kicker">Checkout</p>
          <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-white sm:text-7xl">
            Paiement intégré
          </h1>
          <p className="max-w-3xl text-base leading-7 text-white/60 sm:text-lg">
            Tu paies ici directement sur le site pour le produit {product.name},
            avec Stripe Checkout embedded.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] px-6 py-8">
            <p className="section-kicker">{product.category}</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-[0.94] tracking-[-0.05em] text-white">
              {product.name}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/60">
              {product.description}
            </p>
            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/82">
              {product.price}
            </div>
            <div className="mt-8 grid gap-3">
              {product.details.map((detail) => (
                <div
                  key={detail}
                  className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-6 text-white/60"
                >
                  {detail}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href={`/shop/${product.slug}`} className="secondary-cta">
                Retour au produit
              </Link>
            </div>
          </aside>

          <section>
            {product.stripePriceId ? (
              <EmbeddedCheckoutExperience
                slug={product.slug}
                productName={product.name}
              />
            ) : (
              <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,#171219_0%,#09090b_100%)] p-6">
                <p className="section-kicker">Stripe manquant</p>
                <h2 className="mt-4 text-3xl font-black uppercase tracking-[-0.04em] text-white">
                  Produit pas encore relié
                </h2>
                <p className="mt-4 text-base leading-7 text-white/60">
                  Ce produit n&apos;a pas encore de `stripe_price_id` dans
                  Supabase. Ajoute d&apos;abord le prix Stripe, puis le checkout
                  intégré sera disponible ici.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
