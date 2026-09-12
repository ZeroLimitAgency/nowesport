-- Fortnite analytics and scouting phase 2. Additive after 20260809_workspace_core_foundations.sql.
begin;

alter table public.scouting_prospects
  add column normalized_nickname text,
  add column platform text,
  add column provider text not null default 'manual',
  add column provider_player_id text,
  add column last_synced_at timestamptz,
  add column sync_status text not null default 'pending' check (sync_status in ('pending','syncing','successful','rate_limited','provider_unavailable','failed')),
  add column sync_error_code text;
update public.scouting_prospects set normalized_nickname=lower(trim(nickname)) where normalized_nickname is null;
alter table public.scouting_prospects alter column normalized_nickname set not null;
create index scouting_prospects_filters_idx on public.scouting_prospects(organization_id,status,region,created_at desc);
create index scouting_prospects_search_idx on public.scouting_prospects(organization_id,normalized_nickname);

alter table public.player_performance_snapshots alter column player_id drop not null;
alter table public.player_performance_snapshots add column prospect_id uuid references public.scouting_prospects on delete cascade;
alter table public.player_performance_snapshots add column currency char(3);
alter table public.player_performance_snapshots add constraint performance_snapshot_subject_check check ((player_id is not null)::integer + (prospect_id is not null)::integer = 1);
create index performance_prospect_timeline_idx on public.player_performance_snapshots(prospect_id,metric_key,recorded_at desc);
create unique index performance_snapshot_dedupe_idx on public.player_performance_snapshots(organization_id,coalesce(player_id,prospect_id),provider,metric_key,recorded_at,metric_value);

alter table public.scouting_score_profiles add column version integer not null default 1 check(version>0);
alter table public.scouting_score_profiles add column missing_metric_strategy text not null default 'renormalize' check(missing_metric_strategy in ('renormalize','incomplete','required'));
alter table public.scouting_score_profiles add column is_system boolean not null default false;
alter table public.scouting_score_criteria add column minimum numeric;
alter table public.scouting_score_criteria add column maximum numeric;
alter table public.scouting_score_criteria add column is_required boolean not null default false;
alter table public.scouting_score_criteria add column sort_order integer not null default 0;

create table public.fortnite_metric_definitions (
 id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations on delete cascade,
 metric_key text not null, label text not null, source text not null check(source in ('tracker','now','manual')),
 direction text not null check(direction in ('higher_is_better','lower_is_better','neutral')),
 format text not null check(format in ('integer','decimal','percentage','score','currency')), currency char(3),
 minimum numeric, maximum numeric, is_active boolean not null default true,
 created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()),
 unique nulls not distinct(organization_id,metric_key), check(format='currency' or currency is null)
);

create table public.fortnite_player_provider_links (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade,
 subject_type text not null check(subject_type in ('workspace_player','prospect')), workspace_player_id uuid references public.workspace_player_profiles on delete cascade,
 prospect_id uuid references public.scouting_prospects on delete cascade, provider text not null check(provider in ('manual','fortnite_tracker')),
 provider_player_id text not null, platform text, tracker_url text, last_synced_at timestamptz,
 sync_status text not null default 'pending' check(sync_status in ('pending','syncing','successful','rate_limited','provider_unavailable','failed')),
 next_sync_at timestamptz, created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()),
 check((subject_type='workspace_player' and workspace_player_id is not null and prospect_id is null) or (subject_type='prospect' and prospect_id is not null and workspace_player_id is null)),
 unique(organization_id,provider,provider_player_id)
);
create index provider_links_due_idx on public.fortnite_player_provider_links(organization_id,next_sync_at) where sync_status<>'syncing';

create table public.fortnite_sync_runs (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade,
 provider_link_id uuid references public.fortnite_player_provider_links on delete set null, operation text not null,
 status text not null check(status in ('running','successful','rate_limited','provider_unavailable','failed','skipped')),
 error_code text, metrics_written integer not null default 0, started_at timestamptz not null default timezone('utc',now()), completed_at timestamptz,
 duration_ms integer check(duration_ms is null or duration_ms>=0), metadata jsonb not null default '{}'
);
create index fortnite_sync_runs_recent_idx on public.fortnite_sync_runs(organization_id,started_at desc);

create table public.scouting_score_snapshots (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade,
 prospect_id uuid not null references public.scouting_prospects on delete cascade, profile_id uuid not null references public.scouting_score_profiles on delete restrict,
 profile_version integer not null, score numeric(5,2), is_complete boolean not null, available_criteria integer not null, total_criteria integer not null,
 explanation jsonb not null, computed_at timestamptz not null default timezone('utc',now()),
 check(score is null or score between 0 and 100), check(available_criteria between 0 and total_criteria)
);
create index scouting_scores_latest_idx on public.scouting_score_snapshots(prospect_id,profile_id,computed_at desc);

create table public.scouting_notes (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade,
 prospect_id uuid not null references public.scouting_prospects on delete cascade, author_id uuid not null references public.workspace_members on delete restrict,
 content text not null check(char_length(content) between 1 and 10000), visibility text not null default 'fortnite_staff' check(visibility in ('fortnite_staff','fortnite_directors','direction')),
 created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now())
);
create index scouting_notes_prospect_idx on public.scouting_notes(prospect_id,created_at desc);

insert into public.permissions(key) values
 ('scouting.refresh'),('scouting.notes.view'),('scouting.notes.create'),('scouting.notes.direction_view'),('scouting.scores.manage'),
 ('players.performance.refresh'),('players.performance.compare'),('analytics.export') on conflict do nothing;

-- Manager operational access; directors inherit it. Score formula administration and confidential notes remain director-level.
insert into public.workspace_role_permissions(role_id,permission_id)
select r.id,p.id from public.workspace_roles r join public.permissions p on p.key=any(array['scouting.refresh','scouting.notes.view','scouting.notes.create','players.performance.refresh','players.performance.compare'])
where r.slug in ('ceo','general_director','fortnite_director','fortnite_manager') on conflict do nothing;
insert into public.workspace_role_permissions(role_id,permission_id)
select r.id,p.id from public.workspace_roles r join public.permissions p on p.key=any(array['scouting.notes.direction_view','scouting.scores.manage','analytics.export'])
where r.slug in ('ceo','general_director','fortnite_director') on conflict do nothing;

insert into public.fortnite_metric_definitions(metric_key,label,source,direction,format,currency,minimum,maximum) values
 ('fortnite.pr','Power Ranking','tracker','lower_is_better','integer',null,null,null),
 ('fortnite.ranking','Ranking','tracker','lower_is_better','integer',null,null,null),
 ('fortnite.earnings_usd','Earnings','tracker','higher_is_better','currency','USD',0,null),
 ('fortnite.events_played','Events played','tracker','neutral','integer',null,0,null),
 ('fortnite.average_placement','Average placement','tracker','lower_is_better','decimal',null,1,null),
 ('fortnite.best_placement','Best placement','tracker','lower_is_better','integer',null,1,null),
 ('fortnite.top_10','Top 10','tracker','higher_is_better','integer',null,0,null),
 ('fortnite.top_5','Top 5','tracker','higher_is_better','integer',null,0,null),
 ('fortnite.top_3','Top 3','tracker','higher_is_better','integer',null,0,null),
 ('fortnite.wins','Wins','tracker','higher_is_better','integer',null,0,null),
 ('fortnite.fncs_score','FNCS','tracker','higher_is_better','score',null,0,100),
 ('now.consistency','Consistency','now','higher_is_better','score',null,0,100),
 ('now.recent_performance','Recent performance','now','higher_is_better','score',null,0,100),
 ('now.progression','Progression','now','higher_is_better','percentage',null,null,null),
 ('now.activity','Activity','now','higher_is_better','score',null,0,100),
 ('now.scouting_score','NOW Score','now','higher_is_better','score',null,0,100)
on conflict do nothing;

alter table public.fortnite_metric_definitions enable row level security;
alter table public.fortnite_player_provider_links enable row level security;
alter table public.fortnite_sync_runs enable row level security;
alter table public.scouting_score_snapshots enable row level security;
alter table public.scouting_notes enable row level security;

create policy metric_definitions_read on public.fortnite_metric_definitions for select to authenticated using(organization_id is null or public.workspace_has_permission('fortnite.access',organization_id));
create policy provider_links_read on public.fortnite_player_provider_links for select to authenticated using(public.workspace_has_permission(case when subject_type='prospect' then 'scouting.view' else 'players.view' end,organization_id));
create policy provider_links_manage on public.fortnite_player_provider_links for all to authenticated using(public.workspace_has_permission(case when subject_type='prospect' then 'scouting.refresh' else 'players.performance.refresh' end,organization_id)) with check(public.workspace_has_permission(case when subject_type='prospect' then 'scouting.refresh' else 'players.performance.refresh' end,organization_id));
create policy sync_runs_read on public.fortnite_sync_runs for select to authenticated using(public.workspace_has_permission('fortnite.dashboard.view',organization_id));
create policy score_snapshots_read on public.scouting_score_snapshots for select to authenticated using(public.workspace_has_permission('scouting.view',organization_id));
create policy scouting_notes_read on public.scouting_notes for select to authenticated using(public.workspace_has_permission('scouting.notes.view',organization_id) and (visibility='fortnite_staff' or public.workspace_has_permission('scouting.notes.direction_view',organization_id)));
create policy scouting_notes_create on public.scouting_notes for insert to authenticated with check(public.workspace_has_permission('scouting.notes.create',organization_id) and exists(select 1 from public.workspace_members wm where wm.id=author_id and wm.user_id=(select auth.uid()) and wm.organization_id=scouting_notes.organization_id));
create policy scouting_prospects_create on public.scouting_prospects for insert to authenticated with check(public.workspace_has_permission('scouting.create',organization_id));
create policy scouting_prospects_update on public.scouting_prospects for update to authenticated using(public.workspace_has_permission('scouting.edit',organization_id)) with check(public.workspace_has_permission('scouting.edit',organization_id));
create policy performance_insert on public.player_performance_snapshots for insert to authenticated with check((prospect_id is not null and public.workspace_has_permission('scouting.refresh',organization_id)) or (player_id is not null and public.workspace_has_permission('players.performance.refresh',organization_id)));
create policy score_profiles_read on public.scouting_score_profiles for select to authenticated using(public.workspace_has_permission('scouting.view',organization_id));
create policy score_criteria_read on public.scouting_score_criteria for select to authenticated using(exists(select 1 from public.scouting_score_profiles profile where profile.id=profile_id and public.workspace_has_permission('scouting.view',profile.organization_id)));
create policy score_snapshots_create on public.scouting_score_snapshots for insert to authenticated with check(public.workspace_has_permission('scouting.refresh',organization_id));
create policy sync_runs_create on public.fortnite_sync_runs for insert to authenticated with check(public.workspace_has_permission('scouting.refresh',organization_id) or public.workspace_has_permission('players.performance.refresh',organization_id));
create policy sync_runs_update on public.fortnite_sync_runs for update to authenticated using(public.workspace_has_permission('scouting.refresh',organization_id) or public.workspace_has_permission('players.performance.refresh',organization_id));
create policy scouting_audit_insert on public.audit_logs for insert to authenticated with check(actor_user_id=(select auth.uid()) and organization_id is not null and ((action like 'prospect.%' and public.workspace_has_permission('scouting.edit',organization_id)) or (action='scouting.note_created' and public.workspace_has_permission('scouting.notes.create',organization_id)) or (action='score_profile.changed' and public.workspace_has_permission('scouting.scores.manage',organization_id))));
create policy scouting_audit_read on public.audit_logs for select to authenticated using(resource_type='scouting_prospect' and public.workspace_has_permission('scouting.view',organization_id));
create policy score_profiles_manage on public.scouting_score_profiles for all to authenticated using(public.workspace_has_permission('scouting.scores.manage',organization_id)) with check(public.workspace_has_permission('scouting.scores.manage',organization_id));
create policy score_criteria_manage on public.scouting_score_criteria for all to authenticated using(exists(select 1 from public.scouting_score_profiles profile where profile.id=profile_id and public.workspace_has_permission('scouting.scores.manage',profile.organization_id))) with check(exists(select 1 from public.scouting_score_profiles profile where profile.id=profile_id and public.workspace_has_permission('scouting.scores.manage',profile.organization_id)));

commit;
