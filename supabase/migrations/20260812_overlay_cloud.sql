-- Phase 4: portable Overlay Cloud, immutable versions, assignments, tokens, runtime state and campaigns.
begin;
create type public.overlay_project_status as enum('draft','active','archived');
create type public.overlay_scene_status as enum('draft','active','archived');
create type public.overlay_subject_type as enum('player','team','organization');
create type public.overlay_campaign_status as enum('draft','scheduled','active','ended','archived');

create table public.overlay_projects(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations on delete cascade,
 name text not null check(char_length(name) between 2 and 120),slug text not null,description text,status public.overlay_project_status not null default 'draft',
 is_template boolean not null default false,created_by uuid not null references public.workspace_members on delete restrict,
 created_at timestamptz not null default timezone('utc',now()),updated_at timestamptz not null default timezone('utc',now()),unique(organization_id,slug)
);
create table public.overlay_scenes(
 id uuid primary key default gen_random_uuid(),project_id uuid not null references public.overlay_projects on delete cascade,public_id uuid not null default gen_random_uuid() unique,
 name text not null check(char_length(name) between 2 and 120),key text not null,width integer not null default 1920 check(width between 320 and 7680),height integer not null default 1080 check(height between 240 and 4320),
 status public.overlay_scene_status not null default 'draft',active_version_id uuid,created_at timestamptz not null default timezone('utc',now()),updated_at timestamptz not null default timezone('utc',now()),unique(project_id,key)
);
create table public.overlay_versions(
 id uuid primary key default gen_random_uuid(),scene_id uuid not null references public.overlay_scenes on delete cascade,version_number integer not null check(version_number>0),
 config_json jsonb not null,created_by uuid not null references public.workspace_members on delete restrict,created_at timestamptz not null default timezone('utc',now()),published_at timestamptz,changelog text check(changelog is null or char_length(changelog)<=1000),restored_from_version_id uuid references public.overlay_versions on delete set null,unique(scene_id,version_number)
);
alter table public.overlay_scenes add constraint overlay_scenes_active_version_fk foreign key(active_version_id) references public.overlay_versions on delete set null;
create index overlay_versions_history_idx on public.overlay_versions(scene_id,version_number desc);

create table public.overlay_assignments(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations on delete cascade,scene_id uuid not null references public.overlay_scenes on delete cascade,
 subject_type public.overlay_subject_type not null,subject_id uuid not null,is_active boolean not null default true,last_heartbeat_at timestamptz,
 created_by uuid not null references public.workspace_members on delete restrict,created_at timestamptz not null default timezone('utc',now()),updated_at timestamptz not null default timezone('utc',now()),unique(scene_id,subject_type,subject_id)
);
create index overlay_assignments_subject_idx on public.overlay_assignments(organization_id,subject_type,subject_id) where is_active;

create table public.overlay_access_tokens(
 id uuid primary key default gen_random_uuid(),scene_id uuid not null references public.overlay_scenes on delete cascade,assignment_id uuid references public.overlay_assignments on delete cascade,
 token_hash char(64) not null unique,created_at timestamptz not null default timezone('utc',now()),last_used_at timestamptz,expires_at timestamptz,revoked_at timestamptz,
 created_by uuid not null references public.workspace_members on delete restrict,check(expires_at is null or expires_at>created_at)
);
create index overlay_tokens_active_idx on public.overlay_access_tokens(scene_id,assignment_id) where revoked_at is null;

create table public.overlay_runtime_state(
 scene_id uuid primary key references public.overlay_scenes on delete cascade,organization_id uuid not null references public.organizations on delete cascade,
 state_json jsonb not null default '{}',updated_by uuid references public.workspace_members on delete set null,updated_at timestamptz not null default timezone('utc',now())
);

create table public.overlay_asset_collections(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations on delete cascade,name text not null,description text,
 created_by uuid not null references public.workspace_members on delete restrict,created_at timestamptz not null default timezone('utc',now()),unique(organization_id,name)
);
create table public.overlay_assets(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations on delete cascade,collection_id uuid references public.overlay_asset_collections on delete set null,
 name text not null,storage_path text not null,mime_type text not null check(mime_type in('image/png','image/jpeg','image/webp','video/mp4','video/webm')),
 size_bytes bigint not null check(size_bytes between 1 and 52428800),created_by uuid not null references public.workspace_members on delete restrict,created_at timestamptz not null default timezone('utc',now()),unique(organization_id,storage_path)
);

create table public.overlay_campaigns(
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references public.organizations on delete cascade,name text not null,sponsor_name text not null,
 starts_at timestamptz,ends_at timestamptz,status public.overlay_campaign_status not null default 'draft',runtime_payload jsonb not null default '{}',created_by uuid not null references public.workspace_members on delete restrict,
 created_at timestamptz not null default timezone('utc',now()),updated_at timestamptz not null default timezone('utc',now()),check(ends_at is null or starts_at is not null and ends_at>starts_at)
);
create table public.overlay_campaign_targets(
 campaign_id uuid not null references public.overlay_campaigns on delete cascade,subject_type public.overlay_subject_type not null,subject_id uuid not null,scene_id uuid references public.overlay_scenes on delete cascade,slot_key text not null default 'default',primary key(campaign_id,subject_type,subject_id,slot_key)
);
create index overlay_campaign_schedule_idx on public.overlay_campaigns(organization_id,status,starts_at,ends_at);

create or replace function public.prevent_published_overlay_version_mutation()returns trigger language plpgsql set search_path='' as $$ begin if old.published_at is not null then raise exception 'published overlay versions are immutable';end if;return new;end;$$;
create trigger overlay_versions_immutable before update or delete on public.overlay_versions for each row execute function public.prevent_published_overlay_version_mutation();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)values('overlays','overlays',true,52428800,array['image/png','image/jpeg','image/webp','video/mp4','video/webm'])on conflict(id)do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

insert into public.permissions(key)values('overlays.view'),('overlays.create'),('overlays.edit'),('overlays.publish'),('overlays.assign'),('overlays.tokens.manage'),('overlays.campaigns.view'),('overlays.campaigns.manage')on conflict do nothing;
insert into public.workspace_role_permissions(role_id,permission_id)select r.id,p.id from public.workspace_roles r join public.permissions p on p.key=any(array['overlays.view','overlays.create','overlays.edit','overlays.publish','overlays.assign','overlays.tokens.manage','overlays.campaigns.view','overlays.campaigns.manage'])where r.slug in('ceo','general_director','fortnite_director')on conflict do nothing;
insert into public.workspace_role_permissions(role_id,permission_id)select r.id,p.id from public.workspace_roles r join public.permissions p on p.key=any(array['overlays.view','overlays.assign','overlays.tokens.manage','overlays.campaigns.view'])where r.slug='fortnite_manager'on conflict do nothing;

do $$ declare table_name text;begin foreach table_name in array array['overlay_projects','overlay_scenes','overlay_versions','overlay_assignments','overlay_access_tokens','overlay_runtime_state','overlay_asset_collections','overlay_assets','overlay_campaigns','overlay_campaign_targets']loop execute format('alter table public.%I enable row level security',table_name);end loop;end$$;
create policy overlay_projects_read on public.overlay_projects for select to authenticated using(public.workspace_has_permission('overlays.view',organization_id));
create policy overlay_projects_create on public.overlay_projects for insert to authenticated with check(public.workspace_has_permission('overlays.create',organization_id));
create policy overlay_projects_edit on public.overlay_projects for update to authenticated using(public.workspace_has_permission('overlays.edit',organization_id))with check(public.workspace_has_permission('overlays.edit',organization_id));
create policy overlay_scenes_read on public.overlay_scenes for select to authenticated using(exists(select 1 from public.overlay_projects p where p.id=project_id and public.workspace_has_permission('overlays.view',p.organization_id)));
create policy overlay_scenes_edit on public.overlay_scenes for all to authenticated using(exists(select 1 from public.overlay_projects p where p.id=project_id and public.workspace_has_permission('overlays.edit',p.organization_id)))with check(exists(select 1 from public.overlay_projects p where p.id=project_id and public.workspace_has_permission('overlays.edit',p.organization_id)));
create policy overlay_versions_read on public.overlay_versions for select to authenticated using(exists(select 1 from public.overlay_scenes s join public.overlay_projects p on p.id=s.project_id where s.id=scene_id and public.workspace_has_permission('overlays.view',p.organization_id)));
create policy overlay_versions_create on public.overlay_versions for insert to authenticated with check(exists(select 1 from public.overlay_scenes s join public.overlay_projects p on p.id=s.project_id where s.id=scene_id and public.workspace_has_permission('overlays.edit',p.organization_id)));
create policy overlay_assignments_read on public.overlay_assignments for select to authenticated using(public.workspace_has_permission('overlays.view',organization_id));
create policy overlay_assignments_manage on public.overlay_assignments for all to authenticated using(public.workspace_has_permission('overlays.assign',organization_id))with check(public.workspace_has_permission('overlays.assign',organization_id));
create policy overlay_tokens_read on public.overlay_access_tokens for select to authenticated using(exists(select 1 from public.overlay_scenes s join public.overlay_projects p on p.id=s.project_id where s.id=scene_id and public.workspace_has_permission('overlays.tokens.manage',p.organization_id)));
create policy overlay_tokens_manage on public.overlay_access_tokens for all to authenticated using(exists(select 1 from public.overlay_scenes s join public.overlay_projects p on p.id=s.project_id where s.id=scene_id and public.workspace_has_permission('overlays.tokens.manage',p.organization_id)))with check(exists(select 1 from public.overlay_scenes s join public.overlay_projects p on p.id=s.project_id where s.id=scene_id and public.workspace_has_permission('overlays.tokens.manage',p.organization_id)));
create policy overlay_runtime_read on public.overlay_runtime_state for select to authenticated using(public.workspace_has_permission('overlays.view',organization_id));
create policy overlay_runtime_manage on public.overlay_runtime_state for all to authenticated using(public.workspace_has_permission('overlays.edit',organization_id))with check(public.workspace_has_permission('overlays.edit',organization_id));
create policy overlay_assets_read on public.overlay_assets for select to authenticated using(public.workspace_has_permission('overlays.view',organization_id));
create policy overlay_assets_manage on public.overlay_assets for all to authenticated using(public.workspace_has_permission('overlays.edit',organization_id))with check(public.workspace_has_permission('overlays.edit',organization_id));
create policy overlay_collections_read on public.overlay_asset_collections for select to authenticated using(public.workspace_has_permission('overlays.view',organization_id));
create policy overlay_collections_manage on public.overlay_asset_collections for all to authenticated using(public.workspace_has_permission('overlays.edit',organization_id))with check(public.workspace_has_permission('overlays.edit',organization_id));
create policy overlay_campaigns_read on public.overlay_campaigns for select to authenticated using(public.workspace_has_permission('overlays.campaigns.view',organization_id));
create policy overlay_campaigns_manage on public.overlay_campaigns for all to authenticated using(public.workspace_has_permission('overlays.campaigns.manage',organization_id))with check(public.workspace_has_permission('overlays.campaigns.manage',organization_id));
create policy overlay_targets_read on public.overlay_campaign_targets for select to authenticated using(exists(select 1 from public.overlay_campaigns c where c.id=campaign_id and public.workspace_has_permission('overlays.campaigns.view',c.organization_id)));
create policy overlay_targets_manage on public.overlay_campaign_targets for all to authenticated using(exists(select 1 from public.overlay_campaigns c where c.id=campaign_id and public.workspace_has_permission('overlays.campaigns.manage',c.organization_id)))with check(exists(select 1 from public.overlay_campaigns c where c.id=campaign_id and public.workspace_has_permission('overlays.campaigns.manage',c.organization_id)));
create policy overlay_audit_insert on public.audit_logs for insert to authenticated with check(actor_user_id=(select auth.uid())and action like'overlay.%'and public.workspace_has_permission('overlays.view',organization_id));

create policy overlay_storage_read on storage.objects for select using(bucket_id='overlays');
create policy overlay_storage_insert on storage.objects for insert to authenticated with check(bucket_id='overlays'and (storage.foldername(name))[1]~'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'and public.workspace_has_permission('overlays.edit',((storage.foldername(name))[1])::uuid));
create policy overlay_storage_update on storage.objects for update to authenticated using(bucket_id='overlays'and (storage.foldername(name))[1]~'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'and public.workspace_has_permission('overlays.edit',((storage.foldername(name))[1])::uuid));
create policy overlay_storage_delete on storage.objects for delete to authenticated using(bucket_id='overlays'and (storage.foldername(name))[1]~'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'and public.workspace_has_permission('overlays.edit',((storage.foldername(name))[1])::uuid));
commit;
