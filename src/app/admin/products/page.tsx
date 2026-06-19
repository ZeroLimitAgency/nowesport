import {
  deleteProduct,
  deleteProductVariant,
  saveProduct,
  saveProductVariant,
  toggleProductStatus,
} from "@/app/admin/actions";
import { AdminMediaField } from "@/components/admin-media-field";
import { AdminShell } from "@/components/admin-shell";
import { AdminActionButton, AdminAdvancedPanel, AdminEmptyState, AdminPageHeader, AdminSection, adminInputClass } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { listMediaOptions } from "@/lib/media-storage";
import { createClient } from "@/lib/supabase/server";

type AdminVariant = {
  id: string;
  sku: string | null;
  name: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  price_cents: number | null;
  stripe_price_id: string | null;
  is_active: boolean;
  sort_order: number;
};

type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  product_type: "physical" | "digital";
  short_description: string | null;
  description: string | null;
  price_cents: number;
  currency: string;
  hero_image_url: string | null;
  is_public: boolean;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  sort_order: number;
  product_variants: AdminVariant[] | null;
};

export const dynamic = "force-dynamic";

async function getAdminProducts() {
  if (!hasSupabaseEnv()) {
    return { products: [], isConfigured: false };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, category, product_type, short_description, description, price_cents, currency, hero_image_url, is_public, stripe_product_id, stripe_price_id, sort_order, product_variants(id, sku, name, size, color, stock_quantity, price_cents, stripe_price_id, is_active, sort_order)")
    .order("sort_order", { ascending: true });

  return { products: (data as AdminProduct[] | null) ?? [], isConfigured: true };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
      {label}
      {children}
    </label>
  );
}

const inputClass = adminInputClass;

function ProductForm({ product, mediaOptions }: { product?: AdminProduct; mediaOptions?: Awaited<ReturnType<typeof listMediaOptions>> }) {
  return (
    <form action={saveProduct} className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Nom"><input required name="name" defaultValue={product?.name ?? ""} className={inputClass} /></Field>
        <Field label="Catégorie"><input name="category" defaultValue={product?.category ?? ""} className={inputClass} /></Field>
        <Field label="Type">
          <select name="product_type" defaultValue={product?.product_type ?? "physical"} className={inputClass}>
            <option value="physical">Physique</option>
            <option value="digital">Numérique</option>
          </select>
        </Field>
        <Field label="Prix cents"><input required type="number" name="price_cents" defaultValue={product?.price_cents ?? 0} className={inputClass} /></Field>
        <Field label="Devise"><input name="currency" defaultValue={product?.currency ?? "EUR"} className={inputClass} /></Field>
        <AdminMediaField label="Image principale" name="hero_image_url" bucket="products" defaultValue={product?.hero_image_url} options={mediaOptions} />
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72 sm:pt-7">
          <input type="checkbox" name="is_public" defaultChecked={product?.is_public ?? true} className="h-5 w-5 accent-pink-500" />
          Actif / public
        </label>
      </div>
      <Field label="Résumé"><input name="short_description" defaultValue={product?.short_description ?? ""} className={inputClass} /></Field>
      <Field label="Description"><textarea name="description" defaultValue={product?.description ?? ""} className={`${inputClass} min-h-24 py-3`} /></Field>
      <AdminAdvancedPanel title="Options avancées : slug, Stripe et ordre"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Field label="Slug"><input required name="slug" defaultValue={product?.slug ?? ""} className={inputClass} /></Field><Field label="Stripe product"><input name="stripe_product_id" defaultValue={product?.stripe_product_id ?? ""} className={inputClass} /></Field><Field label="Stripe price"><input name="stripe_price_id" defaultValue={product?.stripe_price_id ?? ""} className={inputClass} /></Field><Field label="Ordre"><input type="number" name="sort_order" defaultValue={product?.sort_order ?? 0} className={inputClass} /></Field></div></AdminAdvancedPanel>
      <button type="submit" className="primary-cta w-fit">{product ? "Sauvegarder" : "Créer le produit"}</button>
    </form>
  );
}

function VariantForm({ productId, variant }: { productId: string; variant?: AdminVariant }) {
  return (
    <form action={saveProductVariant} className="grid gap-3 rounded-[1.2rem] border border-white/8 bg-black/20 p-4">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="variant_id" value={variant?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <Field label="Nom"><input name="name" defaultValue={variant?.name ?? "Standard"} className={inputClass} /></Field>
        <Field label="SKU"><input name="sku" defaultValue={variant?.sku ?? ""} className={inputClass} /></Field>
        <Field label="Taille"><input name="size" defaultValue={variant?.size ?? ""} className={inputClass} /></Field>
        <Field label="Couleur"><input name="color" defaultValue={variant?.color ?? ""} className={inputClass} /></Field>
        <Field label="Stock"><input type="number" name="stock_quantity" defaultValue={variant?.stock_quantity ?? 0} className={inputClass} /></Field>
        <Field label="Prix cents"><input type="number" name="price_cents" defaultValue={variant?.price_cents ?? ""} className={inputClass} /></Field>
        <Field label="Ordre"><input type="number" name="sort_order" defaultValue={variant?.sort_order ?? 0} className={inputClass} /></Field>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Field label="Stripe price"><input name="stripe_price_id" defaultValue={variant?.stripe_price_id ?? ""} className={inputClass} /></Field>
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72">
          <input type="checkbox" name="is_active" defaultChecked={variant?.is_active ?? true} className="h-5 w-5 accent-pink-500" />
          Variante active
        </label>
        <button type="submit" className="secondary-cta">{variant ? "Sauver variante" : "Ajouter variante"}</button>
      </div>
    </form>
  );
}

export default async function AdminProductsPage() {
  await requireAdmin();
  const [{ products, isConfigured }, mediaOptions] = await Promise.all([getAdminProducts(), listMediaOptions("products")]);
  return (
    <AdminShell>
      <div className="grid gap-6">
        <AdminPageHeader kicker="Produits" title="Créer un produit comme une boutique" description="Infos principales, images, prix, variantes, stock, Stripe et publication sont séparés pour éviter l’effet table SQL." />
        <AdminSection kicker="Nouveau produit" title="Infos principales">{isConfigured ? <ProductForm mediaOptions={mediaOptions} /> : <AdminEmptyState title="Produits indisponibles" description="Supabase doit être configuré pour créer des produits." />}</AdminSection>

        {!products.length ? (
          <AdminEmptyState title="Aucun produit" description="Crée le premier produit ici pour alimenter la boutique publique." />
        ) : null}

        {products.map((product) => {
          const variants = product.product_variants ?? [];
          const stock = variants.reduce((sum, variant) => sum + variant.stock_quantity, 0);

          return (
            <article key={product.id} className="grid gap-4 rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#151218_0%,#09090b_100%)] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">{product.product_type} · stock {stock}</p>
                  <h2 className="mt-2 text-3xl font-black text-white">{product.name}</h2>
                  <p className="mt-2 text-sm text-white/50">{product.slug} · {product.is_public ? "Actif" : "Inactif"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={toggleProductStatus}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="is_public" value={String(product.is_public)} />
                    <button type="submit" className="secondary-cta">{product.is_public ? "Désactiver" : "Publier"}</button>
                  </form>
                  <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <AdminActionButton type="submit" tone="danger">Supprimer</AdminActionButton>
                  </form>
                </div>
              </div>

              <ProductForm product={product} mediaOptions={mediaOptions} />

              <div className="grid gap-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/48">Variantes</p>
                {variants.map((variant) => (
                  <div key={variant.id} className="grid gap-2">
                    <VariantForm productId={product.id} variant={variant} />
                    <form action={deleteProductVariant} className="justify-self-end">
                      <input type="hidden" name="variant_id" value={variant.id} />
                      <button type="submit" className="text-xs font-bold uppercase tracking-[0.16em] text-red-200/80">Supprimer la variante</button>
                    </form>
                  </div>
                ))}
                <VariantForm productId={product.id} />
              </div>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}
