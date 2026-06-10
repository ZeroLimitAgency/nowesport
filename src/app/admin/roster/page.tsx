import { deleteRosterMember, deleteRosterTeam, saveRosterMember, saveRosterTeam } from "@/app/admin/actions";
import { AdminMediaField } from "@/components/admin-media-field";
import { AdminShell } from "@/components/admin-shell";
import { listMediaOptions } from "@/lib/media-storage";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const inputClass = "min-h-12 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[var(--color-accent)]/60";
const roleTypes = ["Player", "Coach", "Manager", "Analyst", "Content Creator", "Staff", "Custom"];

type AdminGame = {
  id: string;
  name: string;
};

type AdminRosterTeam = {
  id: string;
  game_id: string | null;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_public: boolean;
  sort_order: number;
};

type AdminRosterMember = {
  id: string;
  roster_id: string;
  slug: string | null;
  first_name: string | null;
  last_name: string | null;
  pseudo: string | null;
  display_name: string;
  role_type: string | null;
  custom_role: string | null;
  role_label: string | null;
  nationality: string | null;
  country: string | null;
  bio: string | null;
  photo_url: string | null;
  avatar_url: string | null;
  social_links: Record<string, string> | null;
  social_url: string | null;
  is_public: boolean;
  sort_order: number;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{label}{children}</label>;
}

function TeamSelect({ games, defaultValue }: { games: AdminGame[]; defaultValue?: string | null }) {
  return (
    <Field label="Jeu associé">
      <select name="game_id" defaultValue={defaultValue ?? ""} className={inputClass}>
        <option value="">Aucun jeu</option>
        {games.map((game) => (
          <option key={game.id} value={game.id}>{game.name}</option>
        ))}
      </select>
    </Field>
  );
}

function TeamForm({ team, games, mediaOptions }: { team?: AdminRosterTeam; games: AdminGame[]; mediaOptions: Awaited<ReturnType<typeof listMediaOptions>> }) {
  return (
    <form action={saveRosterTeam} className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <input type="hidden" name="id" value={team?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Nom équipe"><input required name="name" defaultValue={team?.name ?? ""} className={inputClass} /></Field>
        <Field label="Slug"><input required name="slug" defaultValue={team?.slug ?? ""} className={inputClass} /></Field>
        <TeamSelect games={games} defaultValue={team?.game_id} />
        <Field label="Catégorie"><input name="category" defaultValue={team?.category ?? ""} className={inputClass} placeholder="Pro, Academy, Creators..." /></Field>
        <AdminMediaField label="Logo équipe" name="logo_url" bucket="roster" defaultValue={team?.logo_url} options={mediaOptions} />
        <AdminMediaField label="Bannière équipe" name="banner_url" bucket="roster" defaultValue={team?.banner_url} options={mediaOptions} />
        <Field label="Ordre"><input type="number" name="sort_order" defaultValue={team?.sort_order ?? 0} className={inputClass} /></Field>
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72 sm:pt-7">
          <input type="checkbox" name="is_public" defaultChecked={team?.is_public ?? true} className="h-5 w-5 accent-pink-500" />
          Actif
        </label>
      </div>
      <Field label="Description"><textarea name="description" defaultValue={team?.description ?? ""} className={`${inputClass} min-h-24 py-3`} /></Field>
      <button type="submit" className="primary-cta w-fit">{team ? "Enregistrer l'équipe" : "Créer l'équipe"}</button>
    </form>
  );
}

function MemberForm({ member, teams, mediaOptions }: { member?: AdminRosterMember; teams: AdminRosterTeam[]; mediaOptions: Awaited<ReturnType<typeof listMediaOptions>> }) {
  const socials = member?.social_links ?? {};
  const roleType = member?.role_type ?? (member?.role_label && roleTypes.includes(member.role_label) ? member.role_label : "Player");
  const customRole = member?.custom_role ?? (!roleTypes.includes(member?.role_label ?? "") ? member?.role_label : "");

  return (
    <form action={saveRosterMember} className="grid gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <input type="hidden" name="id" value={member?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Équipe">
          <select required name="roster_id" defaultValue={member?.roster_id ?? ""} className={inputClass}>
            <option value="">Choisir</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Prénom"><input name="first_name" defaultValue={member?.first_name ?? ""} className={inputClass} /></Field>
        <Field label="Nom"><input name="last_name" defaultValue={member?.last_name ?? ""} className={inputClass} /></Field>
        <Field label="Pseudo"><input required name="pseudo" defaultValue={member?.pseudo ?? member?.display_name ?? ""} className={inputClass} /></Field>
        <Field label="Slug"><input name="slug" defaultValue={member?.slug ?? ""} className={inputClass} /></Field>
        <Field label="Type de rôle">
          <select name="role_type" defaultValue={roleType} className={inputClass}>
            {roleTypes.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </Field>
        <Field label="Rôle custom"><input name="custom_role" defaultValue={customRole ?? ""} className={inputClass} placeholder="Si type Custom" /></Field>
        <Field label="Nationalité"><input name="nationality" defaultValue={member?.nationality ?? member?.country ?? ""} className={inputClass} /></Field>
        <AdminMediaField label="Photo" name="photo_url" bucket="roster" defaultValue={member?.photo_url ?? member?.avatar_url} options={mediaOptions} />
        <Field label="Ordre"><input type="number" name="sort_order" defaultValue={member?.sort_order ?? 0} className={inputClass} /></Field>
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72 sm:pt-7">
          <input type="checkbox" name="is_public" defaultChecked={member?.is_public ?? true} className="h-5 w-5 accent-pink-500" />
          Actif
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Field label="X / Twitter"><input name="social_x" defaultValue={socials.x ?? ""} className={inputClass} /></Field>
        <Field label="Instagram"><input name="social_instagram" defaultValue={socials.instagram ?? ""} className={inputClass} /></Field>
        <Field label="Twitch"><input name="social_twitch" defaultValue={socials.twitch ?? ""} className={inputClass} /></Field>
        <Field label="YouTube"><input name="social_youtube" defaultValue={socials.youtube ?? ""} className={inputClass} /></Field>
        <Field label="TikTok"><input name="social_tiktok" defaultValue={socials.tiktok ?? ""} className={inputClass} /></Field>
        <Field label="Site"><input name="social_website" defaultValue={socials.website ?? member?.social_url ?? ""} className={inputClass} /></Field>
      </div>
      <Field label="Bio"><textarea name="bio" defaultValue={member?.bio ?? ""} className={`${inputClass} min-h-24 py-3`} /></Field>
      <button type="submit" className="primary-cta w-fit">{member ? "Enregistrer le membre" : "Créer joueur / staff"}</button>
    </form>
  );
}

async function getRosterAdminData() {
  if (!hasSupabaseEnv()) return { games: [], teams: [], members: [], isConfigured: false };
  const supabase = await createClient();
  const [{ data: games }, { data: teams }, { data: members }] = await Promise.all([
    supabase.from("games").select("id, name").order("sort_order", { ascending: true }),
    supabase.from("rosters").select("id, game_id, slug, name, category, description, logo_url, banner_url, is_public, sort_order").order("sort_order", { ascending: true }),
    supabase.from("roster_members").select("id, roster_id, slug, first_name, last_name, pseudo, display_name, role_type, custom_role, role_label, nationality, country, bio, photo_url, avatar_url, social_links, social_url, is_public, sort_order").order("sort_order", { ascending: true }),
  ]);

  return {
    games: (games as AdminGame[] | null) ?? [],
    teams: (teams as AdminRosterTeam[] | null) ?? [],
    members: (members as AdminRosterMember[] | null) ?? [],
    isConfigured: true,
  };
}

export default async function AdminRosterPage() {
  await requireAdmin();
  const [{ games, teams, members, isConfigured }, mediaOptions] = await Promise.all([getRosterAdminData(), listMediaOptions("roster")]);

  return (
    <AdminShell>
      <div className="grid gap-6">
        <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
          <p className="section-kicker">Roster Manager</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Créer une équipe</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">Gère les équipes esport, leur jeu associé, leurs visuels et leur ordre d’affichage public.</p>
          <div className="mt-5">{isConfigured ? <TeamForm games={games} mediaOptions={mediaOptions} /> : <p className="text-sm text-white/58">Supabase doit être configuré pour gérer les rosters.</p>}</div>
        </section>

        {isConfigured ? (
          <section className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 sm:p-6">
            <p className="section-kicker">Joueurs & staff</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Créer un membre</h2>
            <div className="mt-5"><MemberForm teams={teams} mediaOptions={mediaOptions} /></div>
          </section>
        ) : null}

        <div className="grid gap-5">
          {teams.map((team) => {
            const teamMembers = members.filter((member) => member.roster_id === team.id);
            const gameName = games.find((game) => game.id === team.game_id)?.name ?? "Sans jeu";
            return (
              <article key={team.id} className="grid gap-5 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">{team.is_public ? "Actif" : "Inactif"} · {gameName}</p>
                    <h2 className="mt-2 text-2xl font-black text-white">{team.name}</h2>
                    <p className="mt-2 text-sm text-white/50">{teamMembers.length} membre(s) · ordre {team.sort_order}</p>
                  </div>
                  <form action={deleteRosterTeam}>
                    <input type="hidden" name="id" value={team.id} />
                    <button type="submit" className="secondary-cta border-red-400/30 text-red-100">Supprimer l’équipe</button>
                  </form>
                </div>
                <TeamForm team={team} games={games} mediaOptions={mediaOptions} />
                <div className="grid gap-4 lg:grid-cols-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="grid gap-4 rounded-[1.4rem] border border-white/8 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{member.is_public ? "Actif" : "Inactif"} · {member.role_label ?? "Player"}</p>
                          <h3 className="mt-2 text-xl font-black text-white">{member.pseudo ?? member.display_name}</h3>
                        </div>
                        <form action={deleteRosterMember}>
                          <input type="hidden" name="id" value={member.id} />
                          <button type="submit" className="rounded-full border border-red-400/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-red-100">Supprimer</button>
                        </form>
                      </div>
                      <MemberForm member={member} teams={teams} mediaOptions={mediaOptions} />
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
