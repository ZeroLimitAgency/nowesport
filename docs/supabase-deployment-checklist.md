# Supabase deployment checklist

This checklist is the source of truth for connecting NOW eSport to a fresh Supabase project. It intentionally excludes Stripe live checkout work.

## 1. Fresh project and schema compatibility

1. Create a new Supabase project.
2. Open **SQL Editor** and run `supabase/schema.sql` once on the fresh project.
3. Confirm that the script ends with `commit;` and creates these required objects:
   - enums: `app_role`, `order_status`, `payment_status`, `product_type`, `cart_status`, `setting_value_type`;
   - tables: `profiles`, `games`, `rosters`, `roster_members`, `partners`, `events`, `products`, `product_variants`, `carts`, `cart_items`, `orders`, `order_items`, `order_status_events`, `inventory_movements`, `site_settings`;
   - functions/triggers: `set_updated_at`, `handle_new_user`, `is_admin`, `on_auth_user_created`, and all `*_set_updated_at` triggers;
   - RLS policies for public reads, owner reads, and admin writes.
4. Run `supabase/verify.sql` in SQL Editor. It should return the expected tables, policies, triggers, and settings without raising exceptions.

> `schema.sql` is designed for a fresh Supabase database. If you need repeatable migrations later, convert it into timestamped migrations before production data exists.

## 2. Environment variables

Add these variables to Vercel, local `.env.local`, and any preview environment that should use the same Supabase backend.

| Variable                               | Required                                    | Scope                 | Purpose                                                                                                             |
| -------------------------------------- | ------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | Yes                                         | browser/server        | Canonical site URL used by metadata, sitemap, and auth redirects.                                                   |
| `NEXT_PUBLIC_HERO_VIDEO_URL`           | No                                          | browser/server        | Optional hosted hero video override.                                                                                |
| `NEXT_PUBLIC_MAINTENANCE_MODE`         | Yes                                         | server/proxy fallback | Keep `on` until `site_settings.maintenance_mode` is verified; set `off` only for non-maintenance fallback behavior. |
| `PREVIEW_SECRET`                       | Optional                                    | server                | Emergency preview-token access to `/api/admin/preview?token=...&next=/`; normal preview uses Supabase admin role.   |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes                                         | browser/server/proxy  | Supabase project URL.                                                                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes                                         | browser/server/proxy  | Supabase publishable/anon key for browser auth, RLS reads, and server session clients.                              |
| `SUPABASE_SERVICE_ROLE_KEY`            | Yes for server-side writes outside user RLS | server only           | Supabase service-role key. Keep server-only. Required by existing server integrations that bypass user RLS.         |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`   | Placeholder only                            | browser               | Keep test placeholder until Stripe milestone.                                                                       |
| `STRIPE_SECRET_KEY`                    | Placeholder only                            | server                | Keep test placeholder until Stripe milestone.                                                                       |
| `STRIPE_WEBHOOK_SECRET`                | Placeholder only                            | server                | Keep test placeholder until Stripe milestone.                                                                       |

Supabase key naming source of truth: use only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the public browser/server/proxy key. Do not add duplicate aliases such as `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`, or `SUPABASE_PUBLISHABLE_KEY`; this codebase does not read them.

Removed: `ADMIN_PREVIEW_EMAILS`. Admin preview is now determined by `public.profiles.role = 'admin'`.

## 3. Supabase Auth end-to-end

1. In Supabase Auth settings, configure the production site URL and redirect URLs:
   - `https://<domain>/auth/callback`
   - `https://<domain>/auth/update-password`
   - local equivalents while testing.
2. Open `/login?next=/compte`.
3. Sign in with email/password.
4. Verify the `public.profiles` row exists for the authenticated `auth.users.id`.
5. Click “Mot de passe oublié ?”, submit the email, follow the email link, and confirm `/auth/update-password` updates the password.
6. Open `/compte` and `/profile`; both should read and update the real `profiles` row.

## 4. Admin role assignment flow

1. Let the target admin sign in once so `handle_new_user()` creates `public.profiles`.
2. In SQL Editor, assign the role:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('admin@example.com');
```

3. Ask the user to sign out/in or refresh the session.
4. Open `/admin` and `/api/admin/preview?next=/`.
5. Confirm non-admin accounts are redirected away from `/admin` and cannot activate preview.

## 5. CRUD persistence checks

Run these checks with an admin account after schema installation.

### Products

1. Open `/admin/products`.
2. Create a product with a unique `slug`, price in cents, and `is_public` checked.
3. Add at least one active variant.
4. Refresh `/admin/products`; the product and variant must still be present.
5. Open `/shop`; the product must be listed from Supabase.
6. Open `/shop/<slug>`; the detail page must load the Supabase product.
7. Edit, publish/unpublish, and delete the product; each action must persist after refresh.

### Events

1. Open `/admin/events`.
2. Create an event with `slug`, `title`, `event_date`, and `is_public` checked.
3. Refresh `/admin/events`; the row must still be present.
4. Open `/events`; the public timeline must show the Supabase event.
5. Edit and delete the event; each action must persist after refresh.

### Partners

1. Open `/admin/partners`.
2. Create a partner with `slug`, `name`, and `is_public` checked.
3. Refresh `/admin/partners`; the row must still be present.
4. Open `/partners`; the public page must show the Supabase partner.
5. Edit and delete the partner; each action must persist after refresh.

### Orders

Do not work on Stripe yet. For this milestone, verify table/RLS/admin persistence without enabling live checkout:

1. Create a test order in SQL Editor or with a controlled server-side script using `orders` and `order_items`.
2. Open `/admin/orders`; the order must appear.
3. Open `/admin/orders/<id>`; line items and status history must render.
4. Change status from `/admin/orders`; a row must be inserted into `order_status_events`.
5. Sign in as the customer email/user and open `/compte`; only that user’s orders should be visible.

## 6. Maintenance and preview

1. Keep `site_settings.maintenance_mode = true` until launch.
2. Public visitors should receive maintenance.
3. Admins with `profiles.role = 'admin'` should be able to activate `/api/admin/preview?next=/`.
4. `/api/admin/preview/clear` should remove the preview cookie.
5. Set `maintenance_mode` to `false` from `/admin/settings` only when the site is ready for public traffic.
