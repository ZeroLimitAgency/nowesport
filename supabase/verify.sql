-- NOW eSport Supabase verification script.
-- Run after supabase/schema.sql on a fresh Supabase project.

begin;


-- Required enum types.
select n.nspname as enum_schema, t.typname as enum_name
from pg_type t
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
  and t.typname in (
    'app_role', 'order_status', 'payment_status', 'product_type',
    'cart_status', 'setting_value_type'
  )
order by t.typname;

-- Required tables.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'games', 'rosters', 'roster_members', 'partners', 'events',
    'products', 'product_variants', 'carts', 'cart_items', 'orders',
    'order_items', 'order_status_events', 'inventory_movements', 'site_settings',
    'site_sections', 'site_content_blocks', 'site_navigation', 'site_social_links', 'site_media'
    )
order by table_name;

-- Required RLS policies.
select schemaname, tablename, policyname
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

-- Required media buckets.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('products', 'roster', 'partners', 'events', 'cms')
order by id;

-- Required roster columns used by the deployed code and production migration.
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'games' and column_name in ('id', 'slug', 'name', 'sort_order', 'is_public'))
    or (table_name = 'rosters' and column_name in ('id', 'game_id', 'slug', 'name', 'category', 'description', 'logo_url', 'banner_url', 'sort_order', 'display_order', 'is_public', 'is_active'))
    or (table_name = 'roster_members' and column_name in ('id', 'roster_id', 'slug', 'first_name', 'last_name', 'pseudo', 'display_name', 'role_type', 'custom_role', 'role_label', 'nationality', 'country', 'bio', 'photo_url', 'avatar_url', 'social_links', 'social_url', 'sort_order', 'display_order', 'is_public', 'is_active'))
  )
order by table_name, column_name;

-- Required triggers.
select event_object_table as table_name, trigger_name
from information_schema.triggers
where trigger_schema = 'public'
   or event_object_schema = 'auth'
order by table_name, trigger_name;

-- Required settings seed.
select key, value, value_type, is_public
from public.site_settings
where key in ('maintenance_mode', 'maintenance_message')
order by key;

do $$
declare
  missing_count integer;
begin
  select 6 - count(*) into missing_count
  from pg_type t
  join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public'
    and t.typname in (
      'app_role', 'order_status', 'payment_status', 'product_type',
      'cart_status', 'setting_value_type'
    );

  if missing_count <> 0 then
    raise exception 'Supabase schema verification failed: % required enum types are missing', missing_count;
  end if;

  select 20 - count(*) into missing_count
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (
      'profiles', 'games', 'rosters', 'roster_members', 'partners', 'events',
      'products', 'product_variants', 'carts', 'cart_items', 'orders',
      'order_items', 'order_status_events', 'inventory_movements', 'site_settings',
    'site_sections', 'site_content_blocks', 'site_navigation', 'site_social_links', 'site_media'
    );

  if missing_count <> 0 then
    raise exception 'Supabase schema verification failed: % required tables are missing', missing_count;
  end if;

  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'handle_new_user') then
    raise exception 'Supabase schema verification failed: public.handle_new_user() is missing';
  end if;

  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'is_admin') then
    raise exception 'Supabase schema verification failed: public.is_admin() is missing';
  end if;

  if not exists (select 1 from public.site_settings where key = 'maintenance_mode') then
    raise exception 'Supabase schema verification failed: maintenance_mode seed is missing';
  end if;

  select 38 - count(*) into missing_count
  from information_schema.columns
  where table_schema = 'public'
    and (
      (table_name = 'games' and column_name in ('id', 'slug', 'name', 'sort_order', 'is_public'))
      or (table_name = 'rosters' and column_name in ('id', 'game_id', 'slug', 'name', 'category', 'description', 'logo_url', 'banner_url', 'sort_order', 'display_order', 'is_public', 'is_active'))
      or (table_name = 'roster_members' and column_name in ('id', 'roster_id', 'slug', 'first_name', 'last_name', 'pseudo', 'display_name', 'role_type', 'custom_role', 'role_label', 'nationality', 'country', 'bio', 'photo_url', 'avatar_url', 'social_links', 'social_url', 'sort_order', 'display_order', 'is_public', 'is_active'))
    );

  if missing_count <> 0 then
    raise exception 'Supabase schema verification failed: % required roster columns are missing; run supabase/migrations/20260610_roster_existing_schema.sql on existing production databases', missing_count;
  end if;

  if not exists (
    select 1
    from storage.buckets
    where id in ('products', 'roster', 'partners', 'events', 'cms')
    group by public
    having count(*) = 5 and public = true
  ) then
    raise exception 'Supabase schema verification failed: media storage buckets are missing or not public';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in (
        'public_read_media_storage',
        'admins_upload_media_storage',
        'admins_update_media_storage',
        'admins_delete_media_storage'
      )
    having count(*) = 4
  ) then
    raise exception 'Supabase schema verification failed: media storage policies are missing';
  end if;


  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in ('site_sections', 'site_content_blocks', 'site_navigation', 'site_social_links', 'site_media')
      and policyname like 'public_read_site_%'
    group by schemaname
    having count(*) = 5
  ) then
    raise exception 'Supabase schema verification failed: CMS public read policies are missing';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in ('site_sections', 'site_content_blocks', 'site_navigation', 'site_social_links', 'site_media')
      and policyname like 'admins_manage_site_%'
    group by schemaname
    having count(*) = 5
  ) then
    raise exception 'Supabase schema verification failed: CMS admin write policies are missing';
  end if;
end $$;

rollback;
