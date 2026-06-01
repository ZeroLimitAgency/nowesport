import { CartClient } from "@/components/cart-client";
import { PageIntro } from "@/components/sections";
import { getCatalogProducts } from "@/lib/commerce";

export default async function CartPage() {
  const products = await getCatalogProducts();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageIntro
        kicker="Panier"
        title="Panier boutique"
        description="Un panier persistant côté client, prêt pour la synchronisation Supabase et le checkout Stripe multi-produits."
      />
      <section className="mx-auto w-full max-w-[92rem] px-5 pb-12 sm:px-8">
        <CartClient products={products} />
      </section>
    </main>
  );
}
