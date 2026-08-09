-- NOW Workspace V1: portable organization, RBAC, Fortnite and operations foundations.
begin;

create type public.workspace_scope_type as enum ('organization','department','team','resource');
create type public.workspace_task_status as enum ('todo','in_progress','blocked','review','done','archived');
create type public.workspace_task_priority as enum ('low','normal','high','urgent');
create type public.scouting_status as enum ('new','watching','interesting','contacted','discussion','rejected','archived');

create table public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, logo_url text,
 created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now())
);
create table public.departments (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade,
 parent_department_id uuid references public.departments on delete set null, name text not null, slug text not null, description text, is_active boolean not null default true,
 created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()), unique(organization_id,slug)
);
create table public.workspace_roles (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, name text not null, slug text not null,
 description text, is_system boolean not null default false, created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()), unique(organization_id,slug)
);
create table public.permissions (id uuid primary key default gen_random_uuid(), key text not null unique, description text, created_at timestamptz not null default timezone('utc',now()));
create table public.workspace_role_permissions (role_id uuid not null references public.workspace_roles on delete cascade, permission_id uuid not null references public.permissions on delete cascade, primary key(role_id,permission_id));
create table public.workspace_members (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, user_id uuid not null references auth.users on delete cascade,
 display_name text not null, role_id uuid not null references public.workspace_roles, department_id uuid references public.departments on delete set null, is_active boolean not null default true,
 created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()), unique(organization_id,user_id)
);
create table public.workspace_member_scopes (
 id uuid primary key default gen_random_uuid(), member_id uuid not null references public.workspace_members on delete cascade, scope_type public.workspace_scope_type not null,
 scope_id uuid not null, created_at timestamptz not null default timezone('utc',now()), unique(member_id,scope_type,scope_id)
);
create table public.workspace_player_profiles (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, department_id uuid references public.departments on delete set null,
 roster_member_id uuid not null references public.roster_members on delete restrict, status text not null default 'active', epic_identifier text, tracker_url text, private_notes text,
 is_archived boolean not null default false, created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()), unique(organization_id,roster_member_id)
);
create table public.player_performance_snapshots (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, player_id uuid not null references public.workspace_player_profiles on delete cascade,
 provider text not null check(provider in ('manual','fortnite_tracker')), metric_key text not null, metric_value numeric not null, recorded_at timestamptz not null, metadata jsonb not null default '{}', created_at timestamptz not null default timezone('utc',now())
);
create index player_performance_timeline_idx on public.player_performance_snapshots(player_id,metric_key,recorded_at desc);
create table public.scouting_prospects (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, department_id uuid references public.departments on delete set null,
 nickname text not null, epic_identifier text, tracker_url text, twitch_url text, twitter_url text, current_team text, region text, player_role text, country text, birth_year integer,
 notes text, status public.scouting_status not null default 'new', assigned_scout_id uuid references public.workspace_members on delete set null,
 created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now())
);
create table public.scouting_score_profiles (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, department_id uuid references public.departments on delete set null, name text not null, description text, is_active boolean not null default true, created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()));
create table public.scouting_score_criteria (id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.scouting_score_profiles on delete cascade, metric_key text not null, weight numeric not null check(weight>=0), direction text not null check(direction in ('higher','lower')), threshold numeric, created_at timestamptz not null default timezone('utc',now()));
create table public.stream_accounts (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, player_id uuid not null references public.workspace_player_profiles on delete cascade, provider text not null default 'twitch', provider_account_id text not null, username text not null, is_active boolean not null default true, created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()), unique(provider,provider_account_id));
create table public.stream_sessions (id uuid primary key default gen_random_uuid(), account_id uuid not null references public.stream_accounts on delete cascade, provider_session_id text, title text, game_name text, started_at timestamptz not null, ended_at timestamptz, created_at timestamptz not null default timezone('utc',now()));
create table public.stream_snapshots (id uuid primary key default gen_random_uuid(), session_id uuid not null references public.stream_sessions on delete cascade, viewer_count integer not null check(viewer_count>=0), title text, thumbnail_url text, recorded_at timestamptz not null default timezone('utc',now()));
create table public.calendar_events (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, department_id uuid references public.departments on delete set null, team_id uuid, event_type text not null, title text not null, description text, visibility text not null default 'department', starts_at timestamptz not null, ends_at timestamptz, timezone text not null default 'UTC', location text, source text not null default 'workspace', external_id text, created_by uuid references public.workspace_members on delete set null, created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()));
create table public.calendar_event_participants (event_id uuid not null references public.calendar_events on delete cascade, member_id uuid not null references public.workspace_members on delete cascade, primary key(event_id,member_id));
create table public.workspace_tasks (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, department_id uuid references public.departments on delete set null, title text not null, description text, status public.workspace_task_status not null default 'todo', priority public.workspace_task_priority not null default 'normal', assignee_id uuid references public.workspace_members on delete set null, due_date timestamptz, created_by uuid not null references public.workspace_members on delete restrict, created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()));
create table public.workspace_task_collaborators (task_id uuid not null references public.workspace_tasks on delete cascade, member_id uuid not null references public.workspace_members on delete cascade, primary key(task_id,member_id));
create table public.meetings (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, department_id uuid references public.departments on delete set null, title text not null, agenda text, notes text, decisions text, starts_at timestamptz not null, created_by uuid not null references public.workspace_members on delete restrict, created_at timestamptz not null default timezone('utc',now()), updated_at timestamptz not null default timezone('utc',now()));
create table public.meeting_participants (meeting_id uuid not null references public.meetings on delete cascade, member_id uuid not null references public.workspace_members on delete cascade, primary key(meeting_id,member_id));
create table public.notifications (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, user_id uuid not null references auth.users on delete cascade, type text not null, title text not null, message text not null, data jsonb not null default '{}', read_at timestamptz, created_at timestamptz not null default timezone('utc',now()));
create table public.notification_preferences (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, user_id uuid not null references auth.users on delete cascade, event_type text not null, in_app boolean not null default true, push boolean not null default false, updated_at timestamptz not null default timezone('utc',now()), unique(organization_id,user_id,event_type));
create table public.notification_events (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, event_type text not null, actor_member_id uuid references public.workspace_members on delete set null, payload jsonb not null default '{}', created_at timestamptz not null default timezone('utc',now()));
create table public.push_subscriptions (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations on delete cascade, user_id uuid not null references auth.users on delete cascade, endpoint text not null, p256dh text not null, auth_key text not null, user_agent text, created_at timestamptz not null default timezone('utc',now()), unique(user_id,endpoint));
create table public.audit_logs (id uuid primary key default gen_random_uuid(), organization_id uuid references public.organizations on delete set null, actor_user_id uuid references auth.users on delete set null, action text not null, resource_type text not null, resource_id uuid, metadata jsonb not null default '{}', created_at timestamptz not null default timezone('utc',now()));

create or replace function public.workspace_has_permission(required_permission text, requested_organization uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.workspace_members wm join public.workspace_role_permissions wrp on wrp.role_id=wm.role_id join public.permissions p on p.id=wrp.permission_id where wm.user_id=(select auth.uid()) and wm.organization_id=requested_organization and wm.is_active and p.key=required_permission)
$$;
revoke all on function public.workspace_has_permission(text,uuid) from public; grant execute on function public.workspace_has_permission(text,uuid) to authenticated;

-- All Workspace tables are private. Policies combine auth identity, explicit permission and organization isolation.
do $$ declare table_name text; begin foreach table_name in array array['organizations','departments','workspace_roles','permissions','workspace_role_permissions','workspace_members','workspace_member_scopes','workspace_player_profiles','player_performance_snapshots','scouting_prospects','scouting_score_profiles','scouting_score_criteria','stream_accounts','stream_sessions','stream_snapshots','calendar_events','calendar_event_participants','workspace_tasks','workspace_task_collaborators','meetings','meeting_participants','notifications','notification_preferences','notification_events','push_subscriptions','audit_logs'] loop execute format('alter table public.%I enable row level security',table_name); end loop; end $$;
create policy workspace_org_read on public.organizations for select to authenticated using(public.workspace_has_permission('workspace.access',id));
create policy workspace_departments_read on public.departments for select to authenticated using(public.workspace_has_permission('workspace.access',organization_id));
create policy workspace_roles_read on public.workspace_roles for select to authenticated using(public.workspace_has_permission('workspace.roles.view',organization_id));
create policy workspace_members_self_or_view on public.workspace_members for select to authenticated using(user_id=(select auth.uid()) or public.workspace_has_permission('workspace.users.view',organization_id));
create policy permissions_authenticated_read on public.permissions for select to authenticated using(true);
create policy role_permissions_member_read on public.workspace_role_permissions for select to authenticated using(exists(select 1 from public.workspace_members wm where wm.user_id=(select auth.uid()) and wm.role_id=workspace_role_permissions.role_id and wm.is_active));
create policy member_scopes_own_read on public.workspace_member_scopes for select to authenticated using(exists(select 1 from public.workspace_members wm where wm.id=workspace_member_scopes.member_id and wm.user_id=(select auth.uid()) and wm.is_active));
create policy workspace_members_manage on public.workspace_members for all to authenticated using(public.workspace_has_permission('workspace.users.manage',organization_id)) with check(public.workspace_has_permission('workspace.users.manage',organization_id));
create policy workspace_player_read on public.workspace_player_profiles for select to authenticated using(public.workspace_has_permission('players.view',organization_id));
create policy workspace_player_manage on public.workspace_player_profiles for all to authenticated using(public.workspace_has_permission('players.edit',organization_id)) with check(public.workspace_has_permission('players.edit',organization_id));
create policy performance_read on public.player_performance_snapshots for select to authenticated using(public.workspace_has_permission('players.view_performance',organization_id));
create policy scouting_read on public.scouting_prospects for select to authenticated using(public.workspace_has_permission('scouting.view',organization_id));
create policy tasks_read on public.workspace_tasks for select to authenticated using(public.workspace_has_permission('tasks.view',organization_id) and (department_id is null or department_id in (select wm.department_id from public.workspace_members wm where wm.user_id=(select auth.uid()) and wm.organization_id=workspace_tasks.organization_id) or exists(select 1 from public.workspace_member_scopes s join public.workspace_members wm on wm.id=s.member_id where wm.user_id=(select auth.uid()) and s.scope_type='organization' and s.scope_id=workspace_tasks.organization_id)));
create policy tasks_create on public.workspace_tasks for insert to authenticated with check(public.workspace_has_permission('tasks.create',organization_id));
create policy tasks_update on public.workspace_tasks for update to authenticated using(public.workspace_has_permission('tasks.edit',organization_id)) with check(public.workspace_has_permission('tasks.edit',organization_id));
create policy calendar_read on public.calendar_events for select to authenticated using(public.workspace_has_permission('calendar.view',organization_id));
create policy meetings_read on public.meetings for select to authenticated using(public.workspace_has_permission('meetings.view',organization_id));
create policy notification_own on public.notifications for select to authenticated using(user_id=(select auth.uid()) and public.workspace_has_permission('notifications.view',organization_id));
create policy notification_preferences_own on public.notification_preferences for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and public.workspace_has_permission('notifications.manage_preferences',organization_id));
create policy push_own on public.push_subscriptions for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and public.workspace_has_permission('notifications.manage_preferences',organization_id));
create policy audit_authorized_read on public.audit_logs for select to authenticated using(public.workspace_has_permission('workspace.roles.manage',organization_id));

-- Bootstrap identifiers are deterministic; a deployment operator links auth users through workspace_members.
insert into public.organizations(name,slug) values('NOW Esport','now-esport') on conflict(slug) do nothing;
insert into public.departments(organization_id,name,slug) select id,'Direction','direction' from public.organizations where slug='now-esport' on conflict do nothing;
insert into public.departments(organization_id,parent_department_id,name,slug) select o.id,d.id,'Esport','esport' from public.organizations o join public.departments d on d.organization_id=o.id and d.slug='direction' where o.slug='now-esport' on conflict do nothing;
insert into public.departments(organization_id,parent_department_id,name,slug) select o.id,d.id,'Fortnite','fortnite' from public.organizations o join public.departments d on d.organization_id=o.id and d.slug='esport' where o.slug='now-esport' on conflict do nothing;
insert into public.workspace_roles(organization_id,name,slug,is_system) select id,v.name,v.slug,true from public.organizations cross join (values('CEO','ceo'),('Directeur Général','general_director'),('Directeur Fortnite','fortnite_director'),('Manager Fortnite','fortnite_manager'),('Player','player')) v(name,slug) where organizations.slug='now-esport' on conflict do nothing;
insert into public.permissions(key) select unnest(array['workspace.access','workspace.dashboard.view','fortnite.access','fortnite.dashboard.view','players.view','players.create','players.edit','players.archive','players.view_performance','scouting.view','scouting.create','scouting.edit','scouting.archive','scouting.compare','streams.view','streams.manage','calendar.view','calendar.create','calendar.edit','calendar.delete','tasks.view','tasks.create','tasks.edit','tasks.assign','tasks.delete','meetings.view','meetings.create','meetings.edit','contracts.view','contracts.create','contracts.edit','contracts.view_financials','finance.view','notifications.view','notifications.manage_preferences','workspace.users.view','workspace.users.manage','workspace.roles.view','workspace.roles.manage','administration.access']) on conflict do nothing;
-- Default grants are reviewed and documented in docs/workspace/PERMISSIONS.md.
insert into public.workspace_role_permissions(role_id,permission_id) select r.id,p.id from public.workspace_roles r join public.permissions p on (r.slug='ceo') or (r.slug='fortnite_manager' and p.key=any(array['workspace.access','workspace.dashboard.view','fortnite.access','fortnite.dashboard.view','players.view','players.create','players.edit','players.archive','players.view_performance','scouting.view','scouting.create','scouting.edit','scouting.archive','scouting.compare','streams.view','streams.manage','calendar.view','calendar.create','calendar.edit','tasks.view','tasks.create','tasks.edit','tasks.assign','meetings.view','meetings.create','meetings.edit','contracts.view','notifications.view','notifications.manage_preferences'])) on conflict do nothing;
insert into public.workspace_role_permissions(role_id,permission_id)
select target.id, grants.permission_id from public.workspace_roles target
join public.workspace_roles manager on manager.organization_id=target.organization_id and manager.slug='fortnite_manager'
join public.workspace_role_permissions grants on grants.role_id=manager.id
where target.slug in ('general_director','fortnite_director') on conflict do nothing;
insert into public.workspace_role_permissions(role_id,permission_id)
select r.id,p.id from public.workspace_roles r join public.permissions p on
 (r.slug='fortnite_director' and p.key=any(array['contracts.create','contracts.edit','contracts.view_financials'])) or
 (r.slug='general_director' and p.key=any(array['contracts.create','contracts.edit','contracts.view_financials','finance.view','workspace.users.view'])) or
 (r.slug='player' and p.key=any(array['workspace.access','workspace.dashboard.view','fortnite.access','players.view','players.view_performance','calendar.view','tasks.view','notifications.view','notifications.manage_preferences']))
on conflict do nothing;

commit;
