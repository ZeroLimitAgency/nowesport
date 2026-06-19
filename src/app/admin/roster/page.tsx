import { deleteRosterMember, deleteRosterTeam, saveRosterMember, saveRosterTeam } from "@/app/admin/actions";
import { AdminMediaField } from "@/components/admin-media-field";
import { AdminShell } from "@/components/admin-shell";
import { AdminPageHeader, adminInputClass } from "@/components/admin-ui";
import { listMediaOptions } from "@/lib/media-storage";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const inputClass = adminInputClass;
const cardClass = "rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#131218_0%,#0b0b0d_100%)] p-5 shadow-2xl shadow-black/20 sm:p-6";
const roleTypes = ["Player", "Coach", "Manager", "Analyst", "Content Creator", "Staff", "Custom"];
const rosterCategories = ["Pro", "Académie", "Créateurs", "Staff", "Autre"];

type AdminGame = { id: string; name: string };

type AdminRosterTeam = {
  id: string;
  game_id: string | null;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  logo_url: string | null;
  game_icon_url?: string | null;
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
  ranking_points?: number | null;
  prize_earnings?: number | null;
  social_links: Record<string, string> | null;
  social_url: string | null;
  is_public: boolean;
  sort_order: number;
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
      {label}
      {children}
      {hint ? <span className="normal-case tracking-normal text-[0.68rem] leading-4 text-white/35">{hint}</span> : null}
    </label>
  );
}

function TeamSelect({ games, defaultValue }: { games: AdminGame[]; defaultValue?: string | null }) {
  return (
    <Field label="Jeu associé">
      <select name="game_id" defaultValue={defaultValue ?? ""} className={inputClass}>
        <option value="">Aucun jeu</option>
        {games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}
      </select>
    </Field>
  );
}

function TeamForm({ team, games, mediaOptions }: { team?: AdminRosterTeam; games: AdminGame[]; mediaOptions: Awaited<ReturnType<typeof listMediaOptions>> }) {
  return (
    <form action={saveRosterTeam} className="grid gap-5 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <input type="hidden" name="id" value={team?.id ?? ""} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Nom du roster"><input required name="name" defaultValue={team?.name ?? ""} className={inputClass} placeholder="NOW Rocket League" /></Field>
        <TeamSelect games={games} defaultValue={team?.game_id} />
        <Field label="Catégorie">
          <select name="category" defaultValue={team?.category ?? "Pro"} className={inputClass}>
            {rosterCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </Field>

      </div>
      <Field label="Description"><textarea name="description" defaultValue={team?.description ?? ""} className={`${inputClass} min-h-24 py-3`} placeholder="Présente l’équipe en une ou deux phrases." /></Field>
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminMediaField label="Logo du jeu" name="game_icon_url" bucket="roster" folder="game-icons" defaultValue={team?.game_icon_url ?? team?.logo_url} options={mediaOptions} />
        <AdminMediaField label="Logo du roster" name="logo_url" bucket="roster" folder="logos" defaultValue={team?.logo_url} options={mediaOptions} />
        <AdminMediaField label="Bannière du roster" name="banner_url" bucket="roster" folder="banners" defaultValue={team?.banner_url} options={mediaOptions} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72">
          <input type="checkbox" name="is_public" defaultChecked={team?.is_public ?? true} className="h-5 w-5 accent-pink-500" />
          Actif / visible sur le site
        </label>
        <button type="submit" className="primary-cta w-fit">{team ? "Enregistrer le roster" : "Créer un roster"}</button>
      </div>
      <details className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-white/45">Options avancées</summary><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Slug personnalisé" hint="Laisse vide : il sera généré automatiquement depuis le nom."><input name="slug" defaultValue={team?.slug ?? ""} className={inputClass} placeholder="auto" /></Field><Field label="Ordre d’affichage"><input type="number" name="sort_order" defaultValue={team?.sort_order ?? 0} className={inputClass} /></Field></div></details>
    </form>
  );
}

function MemberForm({ member, teams, currentTeamId, mediaOptions }: { member?: AdminRosterMember; teams: AdminRosterTeam[]; currentTeamId?: string; mediaOptions: Awaited<ReturnType<typeof listMediaOptions>> }) {
  const socials = member?.social_links ?? {};
  const roleType = member?.role_type ?? (member?.role_label && roleTypes.includes(member.role_label) ? member.role_label : "Player");
  const customRole = member?.custom_role ?? (!roleTypes.includes(member?.role_label ?? "") ? member?.role_label : "");

  return (
    <form action={saveRosterMember} className="grid gap-5 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
      <input type="hidden" name="id" value={member?.id ?? ""} />
      <div className="grid gap-4 lg:grid-cols-4">
        <Field label="Roster">
          <select required name="roster_id" defaultValue={member?.roster_id ?? currentTeamId ?? ""} className={inputClass}>
            <option value="">Choisir un roster</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </Field>
        <Field label="Pseudo / nom affiché"><input required name="pseudo" defaultValue={member?.pseudo ?? member?.display_name ?? ""} className={inputClass} placeholder="Pseudo" /></Field>
        <Field label="Prénom"><input name="first_name" defaultValue={member?.first_name ?? ""} className={inputClass} /></Field>
        <Field label="Nom"><input name="last_name" defaultValue={member?.last_name ?? ""} className={inputClass} /></Field>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <AdminMediaField label="Photo de profil" name="photo_url" bucket="roster" folder="members" defaultValue={member?.photo_url ?? member?.avatar_url} options={mediaOptions} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rôle">
            <select name="role_type" defaultValue={roleType} className={inputClass}>
              {roleTypes.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </Field>
          <Field label="Rôle custom"><input name="custom_role" defaultValue={customRole ?? ""} className={inputClass} placeholder="IGL, Capitaine…" /></Field>
          <Field label="Jeu"><select name="game_hint" className={inputClass} defaultValue=""><option value="">Hérité du roster</option></select></Field>
          <Field label="Pays / origine"><input name="nationality" defaultValue={member?.nationality ?? member?.country ?? ""} className={inputClass} placeholder="France" /></Field>
          <Field label="Points / ranking"><input type="number" name="ranking_points" defaultValue={member?.ranking_points ?? 0} className={inputClass} /></Field>
          <Field label="Cash prize / gains"><input type="number" step="0.01" name="prize_earnings" defaultValue={member?.prize_earnings ?? ""} className={inputClass} placeholder="0" /></Field>
        </div>
      </div>
      <Field label="Bio courte"><textarea name="bio" defaultValue={member?.bio ?? ""} className={`${inputClass} min-h-24 py-3`} placeholder="Phrase courte affichée sur la carte joueur." /></Field>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="X / Twitter"><input name="social_x" defaultValue={socials.x ?? ""} className={inputClass} placeholder="https://x.com/..." /></Field>
        <Field label="Instagram"><input name="social_instagram" defaultValue={socials.instagram ?? ""} className={inputClass} /></Field>
        <Field label="TikTok"><input name="social_tiktok" defaultValue={socials.tiktok ?? ""} className={inputClass} /></Field>
        <Field label="Twitch"><input name="social_twitch" defaultValue={socials.twitch ?? ""} className={inputClass} /></Field>
        <Field label="YouTube"><input name="social_youtube" defaultValue={socials.youtube ?? ""} className={inputClass} /></Field>
        <Field label="Liquipedia / autre"><input name="social_liquipedia" defaultValue={socials.liquipedia ?? socials.website ?? member?.social_url ?? ""} className={inputClass} /></Field>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-sm font-semibold text-white/72">
          <input type="checkbox" name="is_public" defaultChecked={member?.is_public ?? true} className="h-5 w-5 accent-pink-500" />
          Actif / visible
        </label>

        <button type="submit" className="primary-cta w-fit">{member ? "Enregistrer le membre" : "Ajouter le membre"}</button>
      </div>
      <details className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-white/45">Options avancées membre</summary><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Slug"><input name="slug" defaultValue={member?.slug ?? ""} className={inputClass} placeholder="auto" /></Field><Field label="Ordre"><input type="number" name="sort_order" defaultValue={member?.sort_order ?? 0} className={inputClass} /></Field></div></details>
    </form>
  );
}

async function getRosterAdminData() {
  if (!hasSupabaseEnv()) return { games: [], teams: [], members: [], isConfigured: false };
  const supabase = await createClient();
  const [{ data: games }, { data: teams }, { data: members }] = await Promise.all([
    supabase.from("games").select("id, name").order("sort_order", { ascending: true }),
    supabase.from("rosters").select("id, game_id, slug, name, category, description, logo_url, game_icon_url, banner_url, is_public, sort_order").order("sort_order", { ascending: true }),
    supabase.from("roster_members").select("id, roster_id, slug, first_name, last_name, pseudo, display_name, role_type, custom_role, role_label, nationality, country, bio, photo_url, avatar_url, ranking_points, prize_earnings, social_links, social_url, is_public, sort_order").order("sort_order", { ascending: true }),
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
        <AdminPageHeader kicker="Roster" title="Gérer les équipes NOW" description="Un roster = un bloc équipe. Crée le roster avec nom, catégorie, jeu, bannière, logo et description ; les membres se gèrent ensuite dans des cartes dédiées." />

        <section className={cardClass}>
          <p className="section-kicker">Créer un roster</p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Nouveau bloc équipe</h2>
          <div className="mt-5">{isConfigured ? <TeamForm games={games} mediaOptions={mediaOptions} /> : <p className="text-sm text-white/58">Supabase doit être configuré pour gérer les rosters.</p>}</div>
        </section>

        {isConfigured ? (
          <section className={cardClass}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Rosters existants</p>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-white">Clique sur une équipe</h2>
              </div>
              <p className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/45">{teams.length} roster(s)</p>
            </div>
            <div className="mt-6 grid gap-5">
              {teams.length ? teams.map((team, index) => {
                const teamMembers = members.filter((member) => member.roster_id === team.id);
                const gameName = games.find((game) => game.id === team.game_id)?.name ?? "Sans jeu";
                return (
                  <details key={team.id} open={index === 0} className="overflow-hidden rounded-[1.6rem] border border-white/8 bg-white/[0.03]">
                    <summary className="cursor-pointer list-none p-5 marker:hidden">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black/30 text-lg font-black text-white">
                            {team.logo_url || team.game_icon_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={team.game_icon_url ?? team.logo_url ?? ""} alt="" className="h-full w-full object-cover" />
                            ) : team.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">{team.is_public ? "Actif" : "Inactif"} · {team.category ?? "Autre"} · {gameName}</p>
                            <h3 className="mt-2 text-2xl font-black text-white">{team.name}</h3>
                            <p className="mt-1 text-sm text-white/45">{teamMembers.length} membre(s) · ordre {team.sort_order}</p>
                          </div>
                        </div>
                        <span className="secondary-cta">Ouvrir l’équipe</span>
                      </div>
                    </summary>
                    <div className="grid gap-5 border-t border-white/8 p-5">
                      <div>
                        <p className="section-kicker">Modifier le roster</p>
                        <div className="mt-4"><TeamForm team={team} games={games} mediaOptions={mediaOptions} /></div>
                      </div>
                      <div>
                        <p className="section-kicker">Membres de ce roster</p>
                        <h4 className="mt-2 text-2xl font-black text-white">Ajouter un membre</h4>
                        <div className="mt-4"><MemberForm teams={teams} currentTeamId={team.id} mediaOptions={mediaOptions} /></div>
                      </div>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {teamMembers.length ? teamMembers.map((member) => (
                          <article key={member.id} className="grid gap-4 rounded-[1.4rem] border border-white/8 bg-black/20 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex gap-3">
                                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white/10 text-sm font-black text-white">
                                  {member.photo_url || member.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={member.photo_url ?? member.avatar_url ?? ""} alt="" className="h-full w-full object-cover" />
                                  ) : (member.pseudo ?? member.display_name).slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">{member.is_public ? "Actif" : "Inactif"} · {member.role_label ?? "Player"}</p>
                                  <h3 className="mt-2 text-xl font-black text-white">{member.pseudo ?? member.display_name}</h3>
                                </div>
                              </div>
                              <form action={deleteRosterMember}>
                                <input type="hidden" name="id" value={member.id} />
                                <button type="submit" className="rounded-full border border-red-400/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-red-100">Supprimer</button>
                              </form>
                            </div>
                            <MemberForm member={member} teams={teams} currentTeamId={team.id} mediaOptions={mediaOptions} />
                          </article>
                        )) : <p className="rounded-[1.4rem] border border-dashed border-white/12 p-5 text-sm text-white/45">Aucun membre dans ce roster. Utilise le formulaire “Ajouter un membre”.</p>}
                      </div>
                      <form action={deleteRosterTeam} className="border-t border-white/8 pt-5">
                        <input type="hidden" name="id" value={team.id} />
                        <button type="submit" className="secondary-cta border-red-400/30 text-red-100">Supprimer le roster</button>
                      </form>
                    </div>
                  </details>
                );
              }) : <p className="rounded-[1.4rem] border border-dashed border-white/12 p-5 text-sm text-white/45">Aucun roster pour le moment. Crée ton premier bloc équipe ci-dessus.</p>}
            </div>
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
