-- NOW eSport Supabase verification script.
-- Run after supabase/schema.sql on a fresh Supabase project.

begin;

-- Required tables.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'games', 'rosters', 'roster_members', 'partners', 'events',
    'products', 'product_variants', 'carts', 'cart_items', 'orders',
    'order_items', 'order_status_events', 'inventory_movements', 'site_settings'
  )
order by table_name;

-- Required RLS policies.
select schemaname, tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

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
  select 15 - count(*) into missing_count
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (
      'profiles', 'games', 'rosters', 'roster_members', 'partners', 'events',
      'products', 'product_variants', 'carts', 'cart_items', 'orders',
      'order_items', 'order_status_events', 'inventory_movements', 'site_settings'
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
end $$;

rollback;
