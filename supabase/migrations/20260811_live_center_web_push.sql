-- Phase 3: generic streaming core, Twitch EventSub and Workspace Web Push.
begin;

alter table public.stream_accounts
 add column provider_user_id text,
 add column display_name text,
 add column profile_image_url text,
 add column connected_at timestamptz not null default timezone('utc',now()),
 add column last_checked_at timestamptz,
 add column current_status text not null default 'offline' check(current_status in ('online','offline','unknown','provider_unavailable')),
 add column current_viewer_count integer check(current_viewer_count is null or current_viewer_count>=0),
 add column current_title text,
 add column current_game_name text,
 add column current_thumbnail_url text,
 add column current_started_at timestamptz,
 add column metadata jsonb not null default '{}';
update public.stream_accounts set provider_user_id=provider_account_id where provider_user_id is null;
alter table public.stream_accounts alter column provider_user_id set not null;
create index stream_accounts_provider_user_idx on public.stream_accounts(organization_id,provider,provider_user_id);
create index stream_accounts_live_idx on public.stream_accounts(organization_id,current_status) where is_active;

alter table public.stream_sessions add column ended_reason text;
create unique index stream_sessions_active_idx on public.stream_sessions(account_id) where ended_at is null;
create index stream_sessions_history_idx on public.stream_sessions(account_id,started_at desc);
alter table public.stream_snapshots add column game_id text;
alter table public.stream_snapshots add column game_name text;
create index stream_snapshots_timeline_idx on public.stream_snapshots(session_id,recorded_at);

create table public.integration_subscriptions(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations on delete cascade,
 stream_account_id uuid references public.stream_accounts on delete cascade,provider text not null,provider_subscription_id text not null,
 event_type text not null,status text not null,created_at timestamptz not null default timezone('utc',now()),revoked_at timestamptz,metadata jsonb not null default '{}',
 unique(provider,provider_subscription_id)
);
create index integration_subscriptions_account_idx on public.integration_subscriptions(organization_id,stream_account_id,status);

create table public.webhook_events(
 id uuid primary key default gen_random_uuid(),provider text not null,event_id text not null,event_type text not null,
 received_at timestamptz not null default timezone('utc',now()),processed_at timestamptz,status text not null check(status in ('received','processed','ignored','failed')),
 error_code text,unique(provider,event_id)
);
create index webhook_events_received_idx on public.webhook_events(received_at desc);

create table public.stream_goals(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations on delete cascade,
 player_id uuid not null references public.workspace_player_profiles on delete cascade,period text not null check(period in ('week','month','quarter','custom')),
 metric text not null check(metric in ('hours','streams')),target numeric not null check(target>0),starts_at timestamptz not null,ends_at timestamptz not null,
 contract_id uuid,visibility text not null default 'fortnite_staff' check(visibility in ('fortnite_staff','directors','direction')),
 is_active boolean not null default true,created_at timestamptz not null default timezone('utc',now()),updated_at timestamptz not null default timezone('utc',now()),check(ends_at>starts_at)
);
create index stream_goals_period_idx on public.stream_goals(organization_id,player_id,starts_at,ends_at) where is_active;

alter table public.push_subscriptions add column last_used_at timestamptz;
alter table public.push_subscriptions add column revoked_at timestamptz;
alter table public.push_subscriptions add column device_label text;
create index push_subscriptions_active_user_idx on public.push_subscriptions(organization_id,user_id) where revoked_at is null;
create table public.notification_deliveries(
 id uuid primary key default gen_random_uuid(),notification_id uuid references public.notifications on delete cascade,
 subscription_id uuid references public.push_subscriptions on delete set null,channel text not null check(channel in ('push','in_app')),
 status text not null check(status in ('pending','sent','failed','invalid_subscription','skipped')),endpoint_hash text,duration_ms integer,error_code text,
 created_at timestamptz not null default timezone('utc',now())
);
create index notification_deliveries_notification_idx on public.notification_deliveries(notification_id,created_at desc);

insert into public.permissions(key) values('streams.analytics.view'),('streams.goals.view'),('streams.goals.manage'),('streams.compare'),('notifications.push.manage'),('notifications.test') on conflict do nothing;
insert into public.workspace_role_permissions(role_id,permission_id)
select r.id,p.id from public.workspace_roles r join public.permissions p on p.key=any(array['streams.analytics.view','streams.goals.view','streams.compare','notifications.push.manage','notifications.test'])
where r.slug in ('ceo','general_director','fortnite_director','fortnite_manager') on conflict do nothing;
insert into public.workspace_role_permissions(role_id,permission_id) select r.id,p.id from public.workspace_roles r join public.permissions p on p.key=any(array['notifications.push.manage','notifications.test']) where r.slug='player' on conflict do nothing;
insert into public.workspace_role_permissions(role_id,permission_id)
select r.id,p.id from public.workspace_roles r join public.permissions p on p.key=any(array['streams.manage','streams.goals.manage'])
where r.slug in ('ceo','general_director','fortnite_director') on conflict do nothing;
delete from public.workspace_role_permissions rp using public.workspace_roles r,public.permissions p where rp.role_id=r.id and rp.permission_id=p.id and r.slug='fortnite_manager' and p.key='streams.manage';

alter table public.integration_subscriptions enable row level security;
alter table public.webhook_events enable row level security;
alter table public.stream_goals enable row level security;
alter table public.notification_deliveries enable row level security;
create policy stream_accounts_read on public.stream_accounts for select to authenticated using(public.workspace_has_permission('streams.view',organization_id));
create policy stream_accounts_manage on public.stream_accounts for all to authenticated using(public.workspace_has_permission('streams.manage',organization_id)) with check(public.workspace_has_permission('streams.manage',organization_id));
create policy stream_sessions_read on public.stream_sessions for select to authenticated using(exists(select 1 from public.stream_accounts a where a.id=account_id and public.workspace_has_permission('streams.analytics.view',a.organization_id)));
create policy stream_snapshots_read on public.stream_snapshots for select to authenticated using(exists(select 1 from public.stream_sessions s join public.stream_accounts a on a.id=s.account_id where s.id=session_id and public.workspace_has_permission('streams.analytics.view',a.organization_id)));
create policy integration_subscriptions_manage on public.integration_subscriptions for all to authenticated using(public.workspace_has_permission('streams.manage',organization_id)) with check(public.workspace_has_permission('streams.manage',organization_id));
create policy integration_subscriptions_read on public.integration_subscriptions for select to authenticated using(public.workspace_has_permission('streams.manage',organization_id));
create policy stream_goals_read on public.stream_goals for select to authenticated using(public.workspace_has_permission('streams.goals.view',organization_id) and (visibility='fortnite_staff' or public.workspace_has_permission('streams.goals.manage',organization_id)));
create policy stream_goals_manage on public.stream_goals for all to authenticated using(public.workspace_has_permission('streams.goals.manage',organization_id)) with check(public.workspace_has_permission('streams.goals.manage',organization_id));
create policy notifications_test_create on public.notifications for insert to authenticated with check(user_id=(select auth.uid()) and type='system.push_test' and public.workspace_has_permission('notifications.test',organization_id));
create policy notifications_mark_own on public.notifications for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy notification_deliveries_own_read on public.notification_deliveries for select to authenticated using(exists(select 1 from public.notifications n where n.id=notification_id and n.user_id=(select auth.uid())));

commit;
