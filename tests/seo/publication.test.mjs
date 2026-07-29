import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getSeoPriceCents,
  isSeoProductOutOfStock,
  isSeoPublishableProduct,
  isSeoPublishableRoster,
} from "../../src/lib/publication.ts";
import { absoluteUrl, breadcrumbJsonLd, jsonLd, productJsonLd, SITE_URL } from "../../src/lib/seo.ts";
import { resolveMaintenanceMode } from "../../src/lib/maintenance-policy.ts";

const completeProduct = {
  is_public: true,
  slug: "produit-test",
  name: "Produit de test",
  description: "Description vérifiable utilisée uniquement comme fixture.",
  price_cents: 4900,
  product_variants: [],
};

test("publication produit: complet, incomplet, privé et prix de variante", () => {
  assert.equal(isSeoPublishableProduct(completeProduct), true);
  assert.equal(isSeoPublishableProduct({ ...completeProduct, description: "", short_description: "" }), false);
  assert.equal(isSeoPublishableProduct({ ...completeProduct, is_public: false }), false);
  assert.equal(isSeoPublishableProduct({ ...completeProduct, slug: "Produit Technique" }), false);
  const variantOnly = {
    ...completeProduct,
    price_cents: 0,
    product_variants: [{ price_cents: 2500, stock_quantity: 2, is_active: true }],
  };
  assert.equal(isSeoPublishableProduct(variantOnly), true);
  assert.equal(getSeoPriceCents(variantOnly), 2500);
});

test("maintenance: Supabase est prioritaire sur le fallback environnement", () => {
  assert.equal(resolveMaintenanceMode(true, "off"), true);
  assert.equal(resolveMaintenanceMode(false, "on"), false);
  assert.equal(resolveMaintenanceMode(undefined, "off"), false);
  assert.equal(resolveMaintenanceMode(undefined, "on"), true);
});

test("publication produit: épuisé et sans image", () => {
  const soldOut = {
    ...completeProduct,
    hero_image_url: null,
    product_variants: [
      { price_cents: 4900, stock_quantity: 0, is_active: true },
      { price_cents: 5900, stock_quantity: 0, is_active: true },
    ],
  };
  assert.equal(isSeoPublishableProduct(soldOut), true);
  assert.equal(isSeoProductOutOfStock(soldOut), true);
  assert.equal(getSeoPriceCents(soldOut), 4900);
});

test("publication roster: public actif, incomplet et privé", () => {
  const team = { is_public: true, is_active: true, slug: "equipe-test", name: "Équipe test", description: "Description de fixture." };
  assert.equal(isSeoPublishableRoster(team), true);
  assert.equal(isSeoPublishableRoster({ ...team, description: "" }), false);
  assert.equal(isSeoPublishableRoster({ ...team, is_public: false }), false);
  assert.equal(isSeoPublishableRoster({ ...team, is_active: false }), false);
});

test("JSON-LD utilise le domaine officiel et échappe les balises", () => {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "<script>alert(1)</script>", path: "/shop/produit-test" },
  ]);
  const serialized = jsonLd(breadcrumb);
  assert.doesNotThrow(() => JSON.parse(serialized));
  assert.equal(serialized.includes("<script>"), false);
  assert.equal(serialized.includes("undefined"), false);
  assert.equal(absoluteUrl("/shop/produit-test"), `${SITE_URL}/shop/produit-test`);
  assert.deepEqual(breadcrumb.itemListElement.map((item) => item.item), [
    `${SITE_URL}/`, `${SITE_URL}/shop/produit-test`,
  ]);
});

test("Product et Offer ne sont produits que pour une fiche publiable avec prix", () => {
  const base = { publishable: true, name: "Produit fixture", description: "Description fixture", path: "/shop/produit-test", priceCents: 4900, currency: "EUR", image: null };
  const data = productJsonLd(base);
  assert.equal(data?.["@type"], "Product");
  assert.equal(data?.offers.price, "49.00");
  assert.equal(data?.offers.url, `${SITE_URL}/shop/produit-test`);
  assert.equal("image" in data, false);
  assert.equal(productJsonLd({ ...base, publishable: false }), null);
  assert.equal(productJsonLd({ ...base, priceCents: null }), null);
});

test("le schéma Supabase confirme les colonnes et les politiques publiques", async () => {
  const sql = await readFile(new URL("../../supabase/schema.sql", import.meta.url), "utf8");
  for (const fragment of [
    "create table if not exists public.products", "price_cents integer not null",
    "create table if not exists public.product_variants", "stock_quantity integer not null",
    "create table if not exists public.rosters", "is_active boolean not null",
    'using (is_public = true)', "updated_at timestamptz not null",
  ]) assert.match(sql, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("aucune origine temporaire ne pilote les surfaces SEO", async () => {
  const files = [
    "src/lib/seo.ts", "src/app/layout.tsx", "src/app/robots.ts",
    "src/app/sitemap.ts", "src/app/manifest.ts", "src/app/page.tsx",
  ];
  for (const file of files) {
    const source = await readFile(new URL(`../../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /vercel\.app|localhost|127\.0\.0\.1|NEXT_PUBLIC_SITE_URL|VERCEL_URL/);
  }
});

test("les lectures anonymes par slug filtrent réellement les contenus privés", async () => {
  const source = await readFile(new URL("../../src/lib/content.ts", import.meta.url), "utf8");
  assert.match(source, /\.from\("products"\)[\s\S]*?\.eq\("slug", slug\)[\s\S]*?\.eq\("is_public", true\)/);
  assert.match(source, /\.from\("rosters"\)[\s\S]*?\.eq\("is_public", true\)[\s\S]*?\.eq\("is_active", true\)/);
  assert.match(source, /\.from\("roster_members"\)[\s\S]*?\.eq\("is_public", true\)[\s\S]*?\.eq\("is_active", true\)/);
});
