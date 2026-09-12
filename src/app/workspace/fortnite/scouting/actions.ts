"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspacePermission } from "@/workspace/core/auth";
import { hasPermission } from "@/workspace/core/permissions";
import { parseTrackerProfileUrl, normalizeNickname } from "@/workspace/games/fortnite/tracker-link";
import { FortniteTrackerProvider } from "@/workspace/games/fortnite/fortnite-tracker-provider";
import { computeScoutingScore, type ScoreCriterion, type MissingMetricStrategy } from "@/workspace/games/fortnite/scoring";

const statuses = new Set(["new","watching","interesting","contacted","discussion","rejected","archived"]);
const noteVisibilities = new Set(["fortnite_staff","fortnite_directors","direction"]);

export type TrackerSearchState = { status: "idle"|"available"|"not_configured"|"not_supported"|"rate_limited"|"not_found"|"provider_error"; message?: string; results: Array<{providerPlayerId:string;nickname:string;platform?:string;region?:string}> };
export async function searchTrackerPlayer(_state:TrackerSearchState,formData:FormData):Promise<TrackerSearchState>{await requireWorkspacePermission("scouting.create");const query=String(formData.get("query")??"").trim();const platform=String(formData.get("platform")??"epic");if(query.length<2)return{status:"provider_error",message:"Saisissez au moins deux caractères.",results:[]};const result=await new FortniteTrackerProvider().searchPlayer(query,platform);if(result.status!=="available")return{status:result.status,message:result.message,results:[]};return{status:"available",results:result.data.map(item=>({providerPlayerId:item.providerPlayerId,nickname:item.nickname,platform:item.platform,region:item.region}))};}

export async function createProspectFromSearch(formData:FormData){const access=await requireWorkspacePermission("scouting.create");const nickname=String(formData.get("nickname")??"").trim();const providerPlayerId=String(formData.get("provider_player_id")??"").trim();const platform=String(formData.get("platform")??"epic");if(nickname.length<2||!providerPlayerId)throw new Error("Résultat Tracker invalide.");const supabase=await createClient();const{data:prospect,error}=await supabase.from("scouting_prospects").insert({organization_id:access.organizationId,department_id:access.departmentId,nickname,normalized_nickname:normalizeNickname(nickname),platform,provider:"fortnite_tracker",provider_player_id:providerPlayerId,region:String(formData.get("region")??"")||null,status:"new",assigned_scout_id:access.memberId}).select("id").single();if(error||!prospect)throw new Error("Le prospect n’a pas pu être créé.");const{error:linkError}=await supabase.from("fortnite_player_provider_links").insert({organization_id:access.organizationId,subject_type:"prospect",prospect_id:prospect.id,provider:"fortnite_tracker",provider_player_id:providerPlayerId,platform});if(linkError)throw new Error("Ce profil Tracker est déjà relié.");if(hasPermission(access,"scouting.refresh")){const refreshData=new FormData();refreshData.set("prospect_id",prospect.id);await refreshProspect(refreshData);}redirect(`/workspace/fortnite/scouting/${prospect.id}?created=pending`);}

export async function createProspect(formData: FormData) {
  const access = await requireWorkspacePermission("scouting.create");
  const suppliedNickname = String(formData.get("nickname") ?? "").trim();
  const trackerInput = String(formData.get("tracker_url") ?? "").trim();
  const parsed = trackerInput ? parseTrackerProfileUrl(trackerInput) : null;
  if (trackerInput && !parsed) throw new Error("Lien Tracker invalide ou domaine non autorisé.");
  const nickname = suppliedNickname || parsed?.username || "";
  if (nickname.length < 2 || nickname.length > 100) throw new Error("Pseudo invalide.");
  if (formData.get("identity_confirmed") !== "yes") throw new Error("Confirmez l’identité avant l’ajout.");
  const supabase = await createClient();
  const { data: prospect, error } = await supabase.from("scouting_prospects").insert({ organization_id: access.organizationId, department_id: access.departmentId, nickname, normalized_nickname: normalizeNickname(nickname), tracker_url: parsed?.normalizedUrl ?? null, platform: parsed?.platform ?? String(formData.get("platform") ?? "epic"), provider: parsed ? "fortnite_tracker" : "manual", provider_player_id: parsed?.accountIdentifier ?? null, region: String(formData.get("region") ?? "").trim() || null, current_team: String(formData.get("current_team") ?? "").trim() || null, status: "new", assigned_scout_id: access.memberId }).select("id").single();
  if (error || !prospect) throw new Error("Le prospect n’a pas pu être créé.");
  if (parsed) {
    const { error: linkError } = await supabase.from("fortnite_player_provider_links").insert({ organization_id: access.organizationId, subject_type: "prospect", prospect_id: prospect.id, provider: "fortnite_tracker", provider_player_id: parsed.accountIdentifier, platform: parsed.platform, tracker_url: parsed.normalizedUrl });
    if (linkError) throw new Error("Ce profil Tracker est déjà relié à un sujet de cette organisation.");
  }
  await supabase.from("audit_logs").insert({ organization_id: access.organizationId, actor_user_id: (await supabase.auth.getUser()).data.user?.id, action: "prospect.created", resource_type: "scouting_prospect", resource_id: prospect.id, metadata: { provider: parsed ? "fortnite_tracker" : "manual" } });
  if (parsed && hasPermission(access,"scouting.refresh")) { const refreshData=new FormData();refreshData.set("prospect_id",prospect.id);await refreshProspect(refreshData); }
  redirect(`/workspace/fortnite/scouting/${prospect.id}?created=pending`);
}

export async function updateProspectStatus(formData: FormData) {
  const access = await requireWorkspacePermission("scouting.edit");
  const id = String(formData.get("id") ?? ""); const status = String(formData.get("status") ?? "");
  if (!id || !statuses.has(status)) throw new Error("Statut invalide.");
  const supabase = await createClient();
  const { error } = await supabase.from("scouting_prospects").update({ status }).eq("id", id).eq("organization_id", access.organizationId);
  if (error) throw new Error("Le statut n’a pas pu être modifié.");
  await supabase.from("audit_logs").insert({ organization_id: access.organizationId, actor_user_id: (await supabase.auth.getUser()).data.user?.id, action: status === "archived" ? "prospect.archived" : "prospect.status_changed", resource_type: "scouting_prospect", resource_id: id, metadata: { status } });
  revalidatePath(`/workspace/fortnite/scouting/${id}`); revalidatePath("/workspace/fortnite/scouting");
}

export async function addScoutingNote(formData: FormData) {
  const access = await requireWorkspacePermission("scouting.notes.create");
  const prospectId = String(formData.get("prospect_id") ?? ""); const content = String(formData.get("content") ?? "").trim(); const visibility = String(formData.get("visibility") ?? "fortnite_staff");
  if (!prospectId || !content || content.length > 10_000 || !noteVisibilities.has(visibility)) throw new Error("Note invalide.");
  if (visibility !== "fortnite_staff") await requireWorkspacePermission("scouting.notes.direction_view");
  const supabase = await createClient();
  const { error } = await supabase.from("scouting_notes").insert({ organization_id: access.organizationId, prospect_id: prospectId, author_id: access.memberId, content, visibility });
  if (error) throw new Error("La note n’a pas pu être enregistrée.");
  await supabase.from("audit_logs").insert({ organization_id: access.organizationId, actor_user_id: (await supabase.auth.getUser()).data.user?.id, action: "scouting.note_created", resource_type: "scouting_prospect", resource_id: prospectId });
  revalidatePath(`/workspace/fortnite/scouting/${prospectId}`);
}

export async function refreshProspect(formData: FormData) {
  const access = await requireWorkspacePermission("scouting.refresh");
  const prospectId = String(formData.get("prospect_id") ?? "");
  const supabase = await createClient();
  const { data: link } = await supabase.from("fortnite_player_provider_links").select("id,provider_player_id,platform").eq("organization_id", access.organizationId).eq("prospect_id", prospectId).eq("provider", "fortnite_tracker").maybeSingle();
  if (!link) throw new Error("Aucun profil Tracker connecté.");
  await supabase.from("fortnite_player_provider_links").update({ sync_status: "syncing" }).eq("id", link.id);
  const result = await new FortniteTrackerProvider().refreshPlayer(link.provider_player_id, link.platform ?? "epic");
  if (result.status !== "available") {
    const syncStatus = result.status === "rate_limited" ? "rate_limited" : result.status === "not_configured" || result.status === "not_supported" ? "provider_unavailable" : "failed";
    await supabase.from("fortnite_player_provider_links").update({ sync_status: syncStatus }).eq("id", link.id);
    await supabase.from("scouting_prospects").update({ sync_status: syncStatus, sync_error_code: result.status }).eq("id", prospectId);
    revalidatePath(`/workspace/fortnite/scouting/${prospectId}`); return;
  }
  const recordedAt = result.data.capturedAt; let written = 0;
  for (const metric of result.data.metrics) {
    const { data: latest } = await supabase.from("player_performance_snapshots").select("metric_value,recorded_at").eq("organization_id", access.organizationId).eq("prospect_id", prospectId).eq("metric_key", metric.key).order("recorded_at", { ascending: false }).limit(1).maybeSingle();
    if (latest && Number(latest.metric_value) === metric.value && new Date(recordedAt).getTime() - new Date(latest.recorded_at).getTime() < 300_000) continue;
    const { error } = await supabase.from("player_performance_snapshots").insert({ organization_id: access.organizationId, prospect_id: prospectId, provider: "fortnite_tracker", metric_key: metric.key, metric_value: metric.value, currency: metric.currency, recorded_at: recordedAt, metadata: { region: metric.region, season: metric.season } });
    if (!error) written += 1;
  }
  const {data:profiles}=await supabase.from("scouting_score_profiles").select("id,version,missing_metric_strategy,scouting_score_criteria(metric_key,weight,direction,minimum,maximum,is_required)").eq("organization_id",access.organizationId).eq("is_active",true);
  for(const profile of profiles??[]){const raw=profile.scouting_score_criteria as unknown as Array<{metric_key:string;weight:number;direction:"higher"|"lower";minimum:number|null;maximum:number|null;is_required:boolean}>;if(!raw.length||raw.some(item=>item.minimum===null||item.maximum===null))continue;const{data:valuesRows}=await supabase.from("player_performance_snapshots").select("metric_key,metric_value,recorded_at").eq("organization_id",access.organizationId).eq("prospect_id",prospectId).in("metric_key",raw.map(item=>item.metric_key)).order("recorded_at",{ascending:false}).limit(raw.length*10);const values:Record<string,number>={};for(const row of valuesRows??[])if(values[row.metric_key]===undefined)values[row.metric_key]=Number(row.metric_value);const criteria:ScoreCriterion[]=raw.map(item=>({metricKey:item.metric_key,weight:Number(item.weight),direction:item.direction==="higher"?"higher_is_better":"lower_is_better",minimum:Number(item.minimum),maximum:Number(item.maximum),required:item.is_required}));let score;try{score=computeScoutingScore(criteria,values,profile.missing_metric_strategy as MissingMetricStrategy);}catch{continue;}await supabase.from("scouting_score_snapshots").insert({organization_id:access.organizationId,prospect_id:prospectId,profile_id:profile.id,profile_version:profile.version,score:score.score,is_complete:score.complete,available_criteria:score.availableCriteria,total_criteria:score.totalCriteria,explanation:score.explanation,computed_at:recordedAt});if(score.score!==null)await supabase.from("player_performance_snapshots").insert({organization_id:access.organizationId,prospect_id:prospectId,provider:"manual",metric_key:"now.scouting_score",metric_value:score.score,recorded_at:recordedAt,metadata:{profile_id:profile.id,profile_version:profile.version}});}
  await supabase.from("fortnite_player_provider_links").update({ sync_status: "successful", last_synced_at: recordedAt }).eq("id", link.id);
  await supabase.from("scouting_prospects").update({ sync_status: "successful", sync_error_code: null, last_synced_at: recordedAt }).eq("id", prospectId);
  await supabase.from("audit_logs").insert({ organization_id: access.organizationId, actor_user_id: (await supabase.auth.getUser()).data.user?.id, action: "prospect.refreshed", resource_type: "scouting_prospect", resource_id: prospectId, metadata: { metrics_written: written } });
  revalidatePath(`/workspace/fortnite/scouting/${prospectId}`);
}
