-- Migration corrective NOW eSport pour bases Supabase existantes.
-- À exécuter dans le SQL Editor de Supabase si la production a été créée
-- avant les champs roster utilisés par le code actuel.
-- Le script est idempotent et ne supprime aucune donnée.

begin;

-- Tables jeux : colonnes lues par les pages publiques et l'admin roster.
alter table if exists public.games
  add column if not exists subtitle text,
  add column if not exists description text,
  add column if not exists visual text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_public boolean not null default true,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- Tables rosters : colonnes médias + compatibilité sort/is_public et display/is_active.
alter table if exists public.rosters
  add column if not exists game_id uuid references public.games(id) on delete set null,
  add column if not exists category text,
  add column if not exists description text,
  add column if not exists logo_url text,
  add column if not exists banner_url text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists display_order integer not null default 0,
  add column if not exists is_public boolean not null default true,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

do $$
begin
  if to_regclass('public.rosters') is not null then
    update public.rosters
    set
      sort_order = coalesce(sort_order, display_order, 0),
      display_order = coalesce(display_order, sort_order, 0),
      is_public = coalesce(is_public, is_active, true),
      is_active = coalesce(is_active, is_public, true)
    where true;
  end if;
end $$;

-- Tables roster_members : tous les champs lus/écrits par /roster, /roster/[slug]
-- et /admin/roster, avec alias historiques conservés.
alter table if exists public.roster_members
  add column if not exists slug text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists pseudo text,
  add column if not exists display_name text not null default '',
  add column if not exists role_type text not null default 'Player',
  add column if not exists custom_role text,
  add column if not exists role_label text,
  add column if not exists nationality text,
  add column if not exists country text,
  add column if not exists bio text,
  add column if not exists photo_url text,
  add column if not exists avatar_url text,
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists social_url text,
  add column if not exists is_public boolean not null default true,
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 0,
  add column if not exists display_order integer not null default 0,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

do $$
begin
  if to_regclass('public.roster_members') is not null then
    update public.roster_members
    set
      display_name = coalesce(nullif(display_name, ''), pseudo, slug, 'Membre'),
      pseudo = coalesce(pseudo, nullif(display_name, '')),
      role_label = coalesce(role_label, custom_role, role_type, 'Player'),
      country = coalesce(country, nationality),
      avatar_url = coalesce(avatar_url, photo_url),
      social_links = coalesce(social_links, '{}'::jsonb),
      sort_order = coalesce(sort_order, display_order, 0),
      display_order = coalesce(display_order, sort_order, 0),
      is_public = coalesce(is_public, is_active, true),
      is_active = coalesce(is_active, is_public, true)
    where true;
  end if;
end $$;

commit;
