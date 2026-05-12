-- NOW eSport - base schema
-- Run this file in the Supabase SQL editor.

begin;

create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'customer');
create type public.order_status as enum (
  'draft',
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'completed',
  'cancelled',
  'refunded'
);

create type public.payment_status as enum (
  'unpaid',
  'paid',
  'failed',
  'refunded',
  'partially_refunded'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  email text unique,
  full_name text,
  avatar_url text,
  phone text,
  country text,
  city text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.games (
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

create table public.rosters (
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

create table public.roster_members (
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

create table public.partners (
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

create table public.events (
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

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  tag text,
  image_url text,
  video_url text,
  external_url text,
  published_at timestamptz,
  is_public boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,
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
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.product_variants (
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

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  status public.order_status not null default 'pending_payment',
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

create table public.order_items (
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

create index idx_rosters_game_id on public.rosters(game_id);
create index idx_roster_members_roster_id on public.roster_members(roster_id);
create index idx_product_variants_product_id on public.product_variants(product_id);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger games_set_updated_at
before update on public.games
for each row execute function public.set_updated_at();

create trigger rosters_set_updated_at
before update on public.rosters
for each row execute function public.set_updated_at();

create trigger roster_members_set_updated_at
before update on public.roster_members
for each row execute function public.set_updated_at();

create trigger partners_set_updated_at
before update on public.partners
for each row execute function public.set_updated_at();

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger news_set_updated_at
before update on public.news
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger order_items_set_updated_at
before update on public.order_items
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
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
alter table public.news enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own_or_admin"
on public.profiles
for insert
with check (auth.uid() = id or public.is_admin());

create policy "admins_manage_games"
on public.games
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_games"
on public.games
for select
using (is_public = true);

create policy "admins_manage_rosters"
on public.rosters
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_rosters"
on public.rosters
for select
using (is_public = true);

create policy "admins_manage_roster_members"
on public.roster_members
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_roster_members"
on public.roster_members
for select
using (is_public = true);

create policy "admins_manage_partners"
on public.partners
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_partners"
on public.partners
for select
using (is_public = true);

create policy "admins_manage_events"
on public.events
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_events"
on public.events
for select
using (is_public = true);

create policy "admins_manage_news"
on public.news
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_news"
on public.news
for select
using (is_public = true);

create policy "admins_manage_products"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_products"
on public.products
for select
using (is_public = true);

create policy "admins_manage_product_variants"
on public.product_variants
for all
using (public.is_admin())
with check (public.is_admin());

create policy "public_read_product_variants"
on public.product_variants
for select
using (is_active = true);

create policy "admins_manage_orders"
on public.orders
for all
using (public.is_admin())
with check (public.is_admin());

create policy "users_read_own_orders"
on public.orders
for select
using (auth.uid() = user_id or lower(auth.email()) = lower(email));

create policy "users_create_own_orders"
on public.orders
for insert
with check (
  public.is_admin()
  or auth.uid() = user_id
  or lower(auth.email()) = lower(email)
);

create policy "admins_manage_order_items"
on public.order_items
for all
using (public.is_admin())
with check (public.is_admin());

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

commit;
