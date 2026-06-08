-- NOW eSport - base schema
-- Run this file in the Supabase SQL editor.

begin;

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'app_role'
  ) then
    create type public.app_role as enum ('admin', 'customer');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'order_status'
  ) then
    create type public.order_status as enum (
      'pending',
      'paid',
      'processing',
      'shipped',
      'completed',
      'refunded'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'payment_status'
  ) then
    create type public.payment_status as enum (
      'unpaid',
      'paid',
      'failed',
      'refunded',
      'partially_refunded'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'product_type'
  ) then
    create type public.product_type as enum ('physical', 'digital');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'cart_status'
  ) then
    create type public.cart_status as enum ('active', 'converted', 'abandoned');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'setting_value_type'
  ) then
    create type public.setting_value_type as enum ('boolean', 'string', 'json');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  email text unique,
  username text unique,
  full_name text,
  avatar_url text,
  phone text,
  birthdate date,
  country text,
  city text,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  subtitle text,
  description text,
  visual text,
  sort_order integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rosters (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references public.games(id) on delete cascade,
  slug text not null unique,
  name text not null,
  category text,
  description text,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roster_members (
  id uuid primary key default gen_random_uuid(),
  roster_id uuid not null references public.rosters(id) on delete cascade,
  slug text unique,
  display_name text not null,
  role_label text,
  country text,
  bio text,
  avatar_url text,
  social_url text,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role_label text,
  description text,
  image_url text,
  external_url text,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  event_date date not null,
  location text,
  description text,
  image_url text,
  external_url text,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,
  product_type public.product_type not null default 'physical',
  fulfillment_type text,
  requires_shipping boolean not null default true,
  description text,
  short_description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR',
  hero_image_url text,
  is_public boolean not null default true,
  allow_custom_name boolean not null default false,
  allow_custom_number boolean not null default false,
  allow_flocking boolean not null default false,
  stripe_product_id text unique,
  stripe_price_id text unique,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique,
  name text not null,
  size text,
  color text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  price_cents integer check (price_cents >= 0),
  stripe_price_id text unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  guest_token text,
  status public.cart_status not null default 'active',
  currency text not null default 'EUR',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint carts_owner_check check (user_id is not null or guest_token is not null)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  product_variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  custom_name text,
  custom_number text,
  flocking text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (cart_id, product_id, product_variant_id, custom_name, custom_number, flocking)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  currency text not null default 'EUR',
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  shipping_name text,
  shipping_phone text,
  shipping_line1 text,
  shipping_line2 text,
  shipping_postal_code text,
  shipping_city text,
  shipping_country text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  total_price_cents integer not null check (total_price_cents >= 0),
  custom_name text,
  custom_number text,
  flocking text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  message text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity_delta integer not null,
  reason text not null,
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  value_type public.setting_value_type not null default 'string',
  label text,
  is_public boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);


create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  area text not null unique,
  label text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_content_blocks (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('fr', 'en')),
  area text not null,
  block_key text not null,
  title text not null,
  body text,
  eyebrow text,
  cta_label text,
  cta_href text,
  secondary_cta_label text,
  secondary_cta_href text,
  media_url text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (locale, area, block_key)
);

create table if not exists public.site_navigation (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('fr', 'en')),
  placement text not null default 'header',
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (locale, placement, href)
);

create table if not exists public.site_social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (platform, href)
);

create table if not exists public.site_media (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  media_type text not null check (media_type in ('image', 'video', 'embed', 'file')),
  url text not null,
  alt_text text,
  locale text check (locale in ('fr', 'en')),
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.site_settings (key, value, value_type, label, is_public)
values
  ('maintenance_mode', 'true'::jsonb, 'boolean', 'Maintenance publique', true),
  ('maintenance_message', '"Nous préparons la nouvelle version du site."'::jsonb, 'string', 'Message maintenance', true)
on conflict (key) do nothing;



insert into public.site_sections (area, label, description, sort_order)
values
  ('home', 'Home', 'Hero, sponsors et blocs de la page d’accueil', 10),
  ('shop', 'Boutique', 'Textes éditoriaux globaux de la boutique', 20),
  ('roster', 'Roster', 'Textes éditoriaux globaux du roster', 30),
  ('events', 'Événements', 'Textes éditoriaux globaux des événements', 40),
  ('partners', 'Partenaires', 'Textes éditoriaux globaux des partenaires', 50),
  ('maintenance', 'Maintenance', 'Texte de la page maintenance', 60),
  ('legal', 'Pages légales', 'Mentions légales, confidentialité et CGV', 70),
  ('footer', 'Footer', 'Texte global du footer', 80)
on conflict (area) do nothing;

insert into public.site_content_blocks (locale, area, block_key, eyebrow, title, body, cta_label, cta_href, secondary_cta_label, secondary_cta_href, media_url, metadata, sort_order)
values
  ('fr', 'home', 'hero', 'Accueil', 'NOW eSport', 'Une entrée plein écran avec vidéo, sponsors et accès rapide aux modules publics.', 'Découvrir la boutique', '/shop', 'Voir les rosters', '/roster', '/media/now-academy.mp4', '{"poster":"/media/jersey.jpeg","videoHref":"https://youtu.be/F7VLXWSbRoE?si=vzBYyV9froSyNNC7","sponsors":["GENESIS","leo express","tp-link"]}'::jsonb, 10),
  ('en', 'home', 'hero', 'Home', 'NOW eSport', 'A full-screen entry with video, sponsors and quick access to public modules.', 'Discover the shop', '/shop', 'View rosters', '/roster', '/media/now-academy.mp4', '{"poster":"/media/jersey.jpeg","videoHref":"https://youtu.be/F7VLXWSbRoE?si=vzBYyV9froSyNNC7","sponsors":["GENESIS","leo express","tp-link"]}'::jsonb, 10),
  ('fr', 'shop', 'intro', 'Boutique', 'Produits, collections et personnalisation', 'La boutique est pensée pour accueillir tes vraies collections, tes médias, tes options de personnalisation, les tailles, le flocage, les prix et les futurs moyens de paiement.', null, null, null, null, null, '{}'::jsonb, 20),
  ('en', 'shop', 'intro', 'Shop', 'Products, collections and customization', 'The shop is ready for real collections, media, customization options, sizes, flocking, prices and future payment methods.', null, null, null, null, null, '{}'::jsonb, 20),
  ('fr', 'shop', 'banner', 'Boutique', 'Découvrir notre maillot 2026', 'Une promesse nette, un call to action clair et une entrée rapide vers les produits.', 'Acheter maintenant', '/shop', 'Voir la collection Crystal', '/shop', null, '{}'::jsonb, 21),
  ('en', 'shop', 'banner', 'Shop', 'Discover our 2026 jersey', 'A clear promise, a direct call to action and a fast entry point to products.', 'Shop now', '/shop', 'View Crystal collection', '/shop', null, '{}'::jsonb, 21),
  ('fr', 'roster', 'intro', 'Roster', 'Équipes, joueurs et créateurs NOW', 'Les rosters publics restent gérés dans le module métier roster, tandis que ce texte éditorial est pilotable depuis le CMS.', null, null, null, null, null, '{}'::jsonb, 30),
  ('en', 'roster', 'intro', 'Roster', 'NOW teams, players and creators', 'Public rosters remain in the roster business module, while this editorial copy is managed in the CMS.', null, null, null, null, null, '{}'::jsonb, 30),
  ('fr', 'events', 'intro', 'Événements', 'Timeline d''événements et d''activations', 'La page événements reprend la logique timeline avec points reliés, image, titre, date et description.', null, null, null, null, null, '{}'::jsonb, 40),
  ('en', 'events', 'intro', 'Events', 'Events and activation timeline', 'The events page uses a connected timeline with images, title, date and description.', null, null, null, null, null, '{}'::jsonb, 40),
  ('fr', 'partners', 'intro', 'Partenaires', 'Blocs partenaires avec image, texte et lien', 'Chaque partenaire est pensé comme un bloc éditorial avec image, nom, description et lien configurable.', null, null, null, null, null, '{}'::jsonb, 50),
  ('en', 'partners', 'intro', 'Partners', 'Partner blocks with image, text and link', 'Each partner is displayed as an editorial block with configurable image, name, description and redirect link.', null, null, null, null, null, '{}'::jsonb, 50),
  ('fr', 'maintenance', 'main', 'NOW eSport', 'Site en maintenance', 'Nous préparons la nouvelle version du site. Les administrateurs peuvent se connecter pour prévisualiser le site.', 'Nous contacter', 'https://discord.gg/K5AxWfD7tc', 'Connexion admin', '/login?next=/', null, '{}'::jsonb, 60),
  ('en', 'maintenance', 'main', 'NOW eSport', 'Site under maintenance', 'We are preparing the new site. Administrators can sign in to preview the website.', 'Contact us', 'https://discord.gg/K5AxWfD7tc', 'Admin login', '/login?next=/', null, '{}'::jsonb, 60),
  ('fr', 'legal', 'mentions-legales', 'Légal', 'Mentions légales', 'Éditeur, hébergement, propriété intellectuelle et contact légal NOW eSport.', null, null, null, null, null, '{"sections":["NOW eSport édite ce site pour présenter sa structure, ses équipes, ses partenaires et sa boutique.","Les informations d’hébergement, de contact et de responsabilité peuvent être complétées depuis le dashboard admin."]}'::jsonb, 70),
  ('en', 'legal', 'mentions-legales', 'Legal', 'Legal notice', 'Publisher, hosting, intellectual property and NOW eSport legal contact.', null, null, null, null, null, '{"sections":["NOW eSport publishes this website to present its structure, teams, partners and shop."]}'::jsonb, 70),
  ('fr', 'legal', 'confidentialite', 'Légal', 'Politique de confidentialité', 'Collecte, usage et protection des données personnelles des utilisateurs.', null, null, null, null, null, '{"sections":["Les données de compte, commande et contact sont utilisées pour fournir les services du site."]}'::jsonb, 71),
  ('en', 'legal', 'confidentialite', 'Legal', 'Privacy policy', 'Collection, use and protection of users personal data.', null, null, null, null, null, '{"sections":["Account, order and contact data are used to provide the site services."]}'::jsonb, 71),
  ('fr', 'legal', 'cgv', 'Légal', 'Conditions générales de vente', 'Conditions applicables aux commandes passées sur la boutique NOW eSport.', null, null, null, null, null, '{"sections":["Les prix, moyens de paiement, livraisons et retours sont à compléter depuis le CMS."]}'::jsonb, 72),
  ('en', 'legal', 'cgv', 'Legal', 'Terms of sale', 'Terms applicable to orders placed on the NOW eSport shop.', null, null, null, null, null, '{"sections":["Prices, payment methods, delivery and returns can be completed from the CMS."]}'::jsonb, 72),
  ('fr', 'footer', 'main', null, 'NOW eSport', 'Boutique, roster et événements.', null, null, null, null, null, '{}'::jsonb, 80),
  ('en', 'footer', 'main', null, 'NOW eSport', 'Shop, roster and events.', null, null, null, null, null, '{}'::jsonb, 80)
on conflict (locale, area, block_key) do nothing;

insert into public.site_navigation (locale, placement, label, href, sort_order)
values
  ('fr', 'header', 'Accueil', '/', 10),
  ('fr', 'header', 'Boutique', '/shop', 20),
  ('fr', 'header', 'Roster', '/roster', 30),
  ('fr', 'header', 'Partenaires', '/partners', 40),
  ('fr', 'header', 'Événements', '/events', 50),
  ('fr', 'header', 'Panier', '/cart', 60),
  ('fr', 'header', 'Compte', '/compte', 70),
  ('en', 'header', 'Home', '/', 10),
  ('en', 'header', 'Shop', '/shop', 20),
  ('en', 'header', 'Roster', '/roster', 30),
  ('en', 'header', 'Partners', '/partners', 40),
  ('en', 'header', 'Events', '/events', 50),
  ('en', 'header', 'Cart', '/cart', 60),
  ('en', 'header', 'Account', '/compte', 70),
  ('fr', 'footer_legal', 'Mentions légales', '/legal/mentions-legales', 10),
  ('fr', 'footer_legal', 'Confidentialité', '/legal/confidentialite', 20),
  ('fr', 'footer_legal', 'CGV', '/legal/cgv', 30),
  ('en', 'footer_legal', 'Legal notice', '/legal/mentions-legales', 10),
  ('en', 'footer_legal', 'Privacy', '/legal/confidentialite', 20),
  ('en', 'footer_legal', 'Terms', '/legal/cgv', 30)
on conflict (locale, placement, href) do nothing;

insert into public.site_social_links (platform, label, href, sort_order)
values
  ('discord', 'Discord', 'https://discord.gg/K5AxWfD7tc', 10),
  ('x', 'X', 'https://x.com', 20),
  ('instagram', 'Instagram', 'https://instagram.com', 30)
on conflict (platform, href) do nothing;

create index if not exists idx_site_content_blocks_locale_area on public.site_content_blocks(locale, area, sort_order);
create index if not exists idx_site_navigation_locale_placement on public.site_navigation(locale, placement, sort_order);
create index if not exists idx_site_social_links_sort_order on public.site_social_links(sort_order);
create index if not exists idx_site_media_locale_type on public.site_media(locale, media_type, sort_order);
create index if not exists idx_rosters_game_id on public.rosters(game_id);
create index if not exists idx_roster_members_roster_id on public.roster_members(roster_id);
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_carts_user_id on public.carts(user_id);
create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_status_events_order_id on public.order_status_events(order_id);
create index if not exists idx_inventory_movements_variant_id on public.inventory_movements(product_variant_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
before update on public.games
for each row execute function public.set_updated_at();

drop trigger if exists rosters_set_updated_at on public.rosters;
create trigger rosters_set_updated_at
before update on public.rosters
for each row execute function public.set_updated_at();

drop trigger if exists roster_members_set_updated_at on public.roster_members;
create trigger roster_members_set_updated_at
before update on public.roster_members
for each row execute function public.set_updated_at();

drop trigger if exists partners_set_updated_at on public.partners;
create trigger partners_set_updated_at
before update on public.partners
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();


drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists product_variants_set_updated_at on public.product_variants;
create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists order_items_set_updated_at on public.order_items;
create trigger order_items_set_updated_at
before update on public.order_items
for each row execute function public.set_updated_at();


drop trigger if exists site_sections_set_updated_at on public.site_sections;
create trigger site_sections_set_updated_at
before update on public.site_sections
for each row execute function public.set_updated_at();

drop trigger if exists site_content_blocks_set_updated_at on public.site_content_blocks;
create trigger site_content_blocks_set_updated_at
before update on public.site_content_blocks
for each row execute function public.set_updated_at();

drop trigger if exists site_navigation_set_updated_at on public.site_navigation;
create trigger site_navigation_set_updated_at
before update on public.site_navigation
for each row execute function public.set_updated_at();

drop trigger if exists site_social_links_set_updated_at on public.site_social_links;
create trigger site_social_links_set_updated_at
before update on public.site_social_links
for each row execute function public.set_updated_at();

drop trigger if exists site_media_set_updated_at on public.site_media;
create trigger site_media_set_updated_at
before update on public.site_media
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id,
    new.email,
    case
      when nullif(new.raw_user_meta_data ->> 'username', '') is not null
        and not exists (
          select 1
          from public.profiles
          where username = nullif(new.raw_user_meta_data ->> 'username', '')
            and id <> new.id
        )
      then nullif(new.raw_user_meta_data ->> 'username', '')
      else null
    end,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = coalesce(excluded.username, public.profiles.username),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.rosters enable row level security;
alter table public.roster_members enable row level security;
alter table public.partners enable row level security;
alter table public.events enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_events enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.site_settings enable row level security;

alter table public.site_sections enable row level security;
alter table public.site_content_blocks enable row level security;
alter table public.site_navigation enable row level security;
alter table public.site_social_links enable row level security;
alter table public.site_media enable row level security;



drop policy if exists "admins_manage_site_sections" on public.site_sections;
create policy "admins_manage_site_sections"
on public.site_sections
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_site_sections" on public.site_sections;
create policy "public_read_site_sections"
on public.site_sections
for select
using (is_active = true);

drop policy if exists "admins_manage_site_content_blocks" on public.site_content_blocks;
create policy "admins_manage_site_content_blocks"
on public.site_content_blocks
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_site_content_blocks" on public.site_content_blocks;
create policy "public_read_site_content_blocks"
on public.site_content_blocks
for select
using (is_active = true);

drop policy if exists "admins_manage_site_navigation" on public.site_navigation;
create policy "admins_manage_site_navigation"
on public.site_navigation
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_site_navigation" on public.site_navigation;
create policy "public_read_site_navigation"
on public.site_navigation
for select
using (is_active = true);

drop policy if exists "admins_manage_site_social_links" on public.site_social_links;
create policy "admins_manage_site_social_links"
on public.site_social_links
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_site_social_links" on public.site_social_links;
create policy "public_read_site_social_links"
on public.site_social_links
for select
using (is_active = true);

drop policy if exists "admins_manage_site_media" on public.site_media;
create policy "admins_manage_site_media"
on public.site_media
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_site_media" on public.site_media;
create policy "public_read_site_media"
on public.site_media
for select
using (is_active = true);

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_own_or_admin" on public.profiles;
create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
with check (auth.uid() = id or public.is_admin());

drop policy if exists "admins_manage_games" on public.games;
create policy "admins_manage_games"
on public.games
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_games" on public.games;
create policy "public_read_games"
on public.games
for select
using (is_public = true);

drop policy if exists "admins_manage_rosters" on public.rosters;
create policy "admins_manage_rosters"
on public.rosters
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_rosters" on public.rosters;
create policy "public_read_rosters"
on public.rosters
for select
using (is_public = true);

drop policy if exists "admins_manage_roster_members" on public.roster_members;
create policy "admins_manage_roster_members"
on public.roster_members
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_roster_members" on public.roster_members;
create policy "public_read_roster_members"
on public.roster_members
for select
using (is_public = true);

drop policy if exists "admins_manage_partners" on public.partners;
create policy "admins_manage_partners"
on public.partners
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_partners" on public.partners;
create policy "public_read_partners"
on public.partners
for select
using (is_public = true);

drop policy if exists "admins_manage_events" on public.events;
create policy "admins_manage_events"
on public.events
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_events" on public.events;
create policy "public_read_events"
on public.events
for select
using (is_public = true);


drop policy if exists "admins_manage_products" on public.products;
create policy "admins_manage_products"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_products" on public.products;
create policy "public_read_products"
on public.products
for select
using (is_public = true);

drop policy if exists "admins_manage_product_variants" on public.product_variants;
create policy "admins_manage_product_variants"
on public.product_variants
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_product_variants" on public.product_variants;
create policy "public_read_product_variants"
on public.product_variants
for select
using (
  is_active = true
  and exists (
    select 1
    from public.products
    where public.products.id = product_variants.product_id
      and public.products.is_public = true
  )
);

drop policy if exists "admins_manage_carts" on public.carts;
create policy "admins_manage_carts"
on public.carts
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_manage_own_carts" on public.carts;
create policy "users_manage_own_carts"
on public.carts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "admins_manage_cart_items" on public.cart_items;
create policy "admins_manage_cart_items"
on public.cart_items
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_manage_own_cart_items" on public.cart_items;
create policy "users_manage_own_cart_items"
on public.cart_items
for all
using (
  exists (
    select 1 from public.carts
    where public.carts.id = cart_items.cart_id
      and public.carts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.carts
    where public.carts.id = cart_items.cart_id
      and public.carts.user_id = auth.uid()
  )
);

drop policy if exists "admins_manage_orders" on public.orders;
create policy "admins_manage_orders"
on public.orders
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_read_own_orders" on public.orders;
create policy "users_read_own_orders"
on public.orders
for select
using (auth.uid() = user_id or lower(auth.email()) = lower(email));

drop policy if exists "users_create_own_orders" on public.orders;
create policy "users_create_own_orders"
on public.orders
for insert
with check (
  public.is_admin()
  or auth.uid() = user_id
  or lower(auth.email()) = lower(email)
);

drop policy if exists "admins_manage_order_items" on public.order_items;
create policy "admins_manage_order_items"
on public.order_items
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_read_own_order_items" on public.order_items;
create policy "users_read_own_order_items"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders
    where public.orders.id = order_items.order_id
      and (
        public.orders.user_id = auth.uid()
        or lower(public.orders.email) = lower(auth.email())
      )
  )
);

drop policy if exists "users_create_own_order_items" on public.order_items;
create policy "users_create_own_order_items"
on public.order_items
for insert
with check (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    where public.orders.id = order_items.order_id
      and (
        public.orders.user_id = auth.uid()
        or lower(public.orders.email) = lower(auth.email())
      )
  )
);

drop policy if exists "admins_manage_order_status_events" on public.order_status_events;
create policy "admins_manage_order_status_events"
on public.order_status_events
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users_read_own_order_status_events" on public.order_status_events;
create policy "users_read_own_order_status_events"
on public.order_status_events
for select
using (
  exists (
    select 1
    from public.orders
    where public.orders.id = order_status_events.order_id
      and (
        public.orders.user_id = auth.uid()
        or lower(public.orders.email) = lower(auth.email())
      )
  )
);

drop policy if exists "admins_manage_inventory_movements" on public.inventory_movements;
create policy "admins_manage_inventory_movements"
on public.inventory_movements
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins_manage_site_settings" on public.site_settings;
create policy "admins_manage_site_settings"
on public.site_settings
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public_read_public_site_settings" on public.site_settings;
create policy "public_read_public_site_settings"
on public.site_settings
for select
using (is_public = true);

commit;
