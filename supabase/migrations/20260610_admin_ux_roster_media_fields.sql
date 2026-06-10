-- Admin UX roster additions. Idempotent: safe to run multiple times.
alter table if exists public.rosters
  add column if not exists game_icon_url text;

alter table if exists public.roster_members
  add column if not exists ranking_points integer not null default 0,
  add column if not exists prize_earnings numeric(12,2);

do $$
begin
  if to_regclass('public.roster_members') is not null then
    update public.roster_members
    set ranking_points = 0
    where ranking_points is null;
  end if;
end $$;
