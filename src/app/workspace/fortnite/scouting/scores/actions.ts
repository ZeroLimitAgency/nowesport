"use server";
import { revalidatePath } from "next/cache";
import { requireWorkspacePermission } from "@/workspace/core/auth";
import { createClient } from "@/lib/supabase/server";
import { validateScoreCriteria, type ScoreCriterion } from "@/workspace/games/fortnite/scoring";
import { getMetricDefinition } from "@/workspace/games/fortnite/metric-registry";

export async function createScoreProfile(formData: FormData) {
  const access=await requireWorkspacePermission("scouting.scores.manage");const name=String(formData.get("name")??"").trim();const strategy=String(formData.get("strategy")??"renormalize");if(name.length<2||name.length>100||!["renormalize","incomplete","required"].includes(strategy))throw new Error("Profil invalide.");
  const criteria:ScoreCriterion[]=[];for(let index=1;index<=5;index+=1){const metricKey=String(formData.get(`metric_${index}`)??"");if(!metricKey)continue;const definition=getMetricDefinition(metricKey);criteria.push({metricKey,weight:Number(formData.get(`weight_${index}`)),direction:definition?.direction??"neutral",minimum:Number(formData.get(`minimum_${index}`)),maximum:Number(formData.get(`maximum_${index}`)),required:formData.get(`required_${index}`)==="yes"});}
  const validation=validateScoreCriteria(criteria);if(!validation.valid)throw new Error(`Critères invalides: ${validation.reason}.`);const supabase=await createClient();const{data:profile,error}=await supabase.from("scouting_score_profiles").insert({organization_id:access.organizationId,department_id:access.departmentId,name,missing_metric_strategy:strategy,is_active:true}).select("id").single();if(error||!profile)throw new Error("Le profil n’a pas pu être créé.");const{error:criteriaError}=await supabase.from("scouting_score_criteria").insert(criteria.map((criterion,index)=>({profile_id:profile.id,metric_key:criterion.metricKey,weight:criterion.weight,direction:criterion.direction==="higher_is_better"?"higher":"lower",minimum:criterion.minimum,maximum:criterion.maximum,is_required:criterion.required,sort_order:index})));if(criteriaError)throw new Error("Les critères n’ont pas pu être enregistrés.");revalidatePath("/workspace/fortnite/scouting/scores");
}
