"use server";
import { revalidatePath } from "next/cache";
import { requireWorkspacePermission } from "@/workspace/core/auth";
import { createClient } from "@/lib/supabase/server";
import { parseTrackerProfileUrl } from "@/workspace/games/fortnite/tracker-link";

export async function connectPlayerTracker(formData: FormData) {
  const access=await requireWorkspacePermission("players.performance.refresh");const playerId=String(formData.get("player_id")??"");const parsed=parseTrackerProfileUrl(String(formData.get("tracker_url")??""));
  if(!playerId||!parsed)throw new Error("Lien Tracker invalide.");const supabase=await createClient();const {data:player}=await supabase.from("workspace_player_profiles").select("id").eq("id",playerId).eq("organization_id",access.organizationId).maybeSingle();if(!player)throw new Error("Joueur introuvable.");
  const {error}=await supabase.from("fortnite_player_provider_links").upsert({organization_id:access.organizationId,subject_type:"workspace_player",workspace_player_id:playerId,prospect_id:null,provider:"fortnite_tracker",provider_player_id:parsed.accountIdentifier,platform:parsed.platform,tracker_url:parsed.normalizedUrl},{onConflict:"organization_id,provider,provider_player_id"});if(error)throw new Error("Ce profil Tracker est déjà connecté.");revalidatePath(`/workspace/fortnite/players/${playerId}`);
}
