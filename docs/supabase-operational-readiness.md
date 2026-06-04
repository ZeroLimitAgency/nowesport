# Supabase operational readiness report

## Scope

This report covers the milestone to connect the existing platform to a real Supabase backend. Stripe live checkout remains out of scope.

## What is now backed by Supabase

| Area | Runtime source | Admin persistence path | Verification |
| --- | --- | --- | --- |
| Auth/session | Supabase Auth via `@supabase/ssr` | `/login`, `/auth/callback`, `/auth/update-password` | Sign in, reset password, profile trigger creates `profiles`. |
| Admin role | `public.profiles.role = 'admin'` | SQL assignment after first login | `/admin` and `/api/admin/preview?next=/` allow only admins. |
| Products | `public.products` + `public.product_variants` | `/admin/products` server actions | Create/edit/publish/delete persist and public `/shop` reads Supabase. |
| Events | `public.events` | `/admin/events` server actions | Create/edit/delete persist and public `/events` reads Supabase. |
| Partners | `public.partners` | `/admin/partners` server actions | Create/edit/delete persist and public `/partners` reads Supabase. |
| Orders | `public.orders`, `public.order_items`, `public.order_status_events` | Existing admin status action and server-side order writers | Admin list/detail and customer `/compte` read persisted orders. |
| Maintenance | `public.site_settings` | `/admin/settings` | Proxy and admin setting read `maintenance_mode`. |

## Removed fallback/mock paths in this milestone

- Public products no longer fall back to `collectionItems` when Supabase is unavailable, empty, or errors.
- Product detail pages no longer fall back to local mock slugs.
- Cart/catalog data no longer falls back to local catalog products.
- Public games, partners, and events no longer silently replace missing Supabase data with local mock data.
- Sitemap product and roster dynamic routes are read from Supabase instead of local mock arrays.
- Admin preview no longer accepts `ADMIN_PREVIEW_EMAILS`; it uses `profiles.role = 'admin'` or the explicit preview token.
- The admin products empty-state no longer tells admins that public shop is using a local fallback.

## Remaining mock/static implementations

These are intentionally listed so they can be replaced or accepted before launch.

| Location | Remaining implementation | Impact | Recommendation |
| --- | --- | --- | --- |
| `src/data/site.ts` | Home editorial text, hero copy, sponsor labels, shop collection labels, product option labels, and static legacy arrays remain local. | Public pages may still show editorial/static labels that are not controlled by Supabase. | Move only the content that admins must edit into Supabase tables; keep pure design labels local if acceptable. |
| `src/components/sections.tsx` | Legacy/static sections still reference `collectionItems`, `games`, `partners`, and `events`. | Those sections are static components; current Supabase public pages use `content-sections` for live data. | Remove unused legacy sections or rewire them in a cleanup PR. |
| `src/data/commerce.ts` | `orderSteps` and `profileFields` are static UI helper labels. | No data persistence risk; they are not order/profile records. | Keep as UI copy or move to CMS/settings later. |
| `src/components/cart-client.tsx` | Cart state is browser-local and seeds itself from the first Supabase product for demo-like interaction. | Carts are not fully persisted to `carts`/`cart_items` from the UI yet. | Implement cart write/update/delete API calls after product persistence is validated. |
| `src/app/shop/[slug]/page.tsx` and `ShopGridSection` | Product imagery is CSS-generated, not media from `hero_image_url`. | Product records persist, but product media is not rendered from Supabase yet. | Wire `hero_image_url` into the existing cards/detail without redesign. |
| `src/proxy.ts` and `src/lib/settings.ts` | `NEXT_PUBLIC_MAINTENANCE_MODE` remains an environment fallback if Supabase settings cannot be read. | Safe fail-closed maintenance behavior remains. | Keep for safety until launch; remove only if operational policy requires hard Supabase dependency. |
| `src/app/api/stripe/webhook/route.ts` | Order persistence is wired to Stripe webhook events. | Full checkout order creation cannot be end-to-end verified until Stripe milestone. | For this milestone, verify order tables/admin/customer reads with controlled test rows. |

## Fresh Supabase compatibility notes

- `supabase/schema.sql` creates all tables, enums, triggers, RLS policies, and default `site_settings` needed by the current app.
- The schema expects a clean/fresh Supabase project because enum and policy names are created directly.
- Run `supabase/verify.sql` immediately after `schema.sql` to confirm required objects exist.
- RLS uses `public.is_admin()` to authorize admin CRUD from authenticated browser/server clients.
- The `handle_new_user()` trigger creates/updates `profiles` from `auth.users`, which is required before admin role assignment.

## End-to-end verification status

- Auth flow: documented in `docs/supabase-deployment-checklist.md`; requires real Supabase Auth SMTP/email settings to complete manually.
- Admin role flow: documented SQL update; app code now depends on `profiles.role = 'admin'` instead of email fallback.
- Products/events/partners CRUD: server actions write to Supabase tables and public reads no longer mask missing data with mocks.
- Orders persistence: schema and admin/customer reads are ready; live Stripe-backed creation remains deferred.
