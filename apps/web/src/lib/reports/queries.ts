import { createAdminClient } from "@/lib/supabase/admin";
import type { TrainingModule, TrainingModuleReport, LocationRanking } from "@/types/reports";

export async function getTrainingModules(): Promise<TrainingModule[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("training_modules")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as TrainingModule[];
}

export async function getTrainingReport(): Promise<TrainingModuleReport[]> {
  const supabase = createAdminClient();
  const [{ data: modules }, { data: completions }, { data: locations }] = await Promise.all([
    supabase.from("training_modules").select("*").order("name"),
    supabase.from("training_completions").select("*, locations(id, name)"),
    supabase.from("locations").select("id, name").eq("status", "active"),
  ]);

  const locationCount = (locations ?? []).length;

  return (modules ?? []).map((mod) => {
    const modCompletions = (completions ?? []).filter((c) => c.module_id === mod.id);
    const completedLocationIds = new Set(modCompletions.map((c) => c.location_id));
    return {
      module:          mod as TrainingModule,
      completions:     modCompletions as TrainingModuleReport["completions"],
      location_count:  locationCount,
      completed_count: completedLocationIds.size,
    };
  });
}

export async function getLocationRankings(): Promise<LocationRanking[]> {
  const supabase = createAdminClient();
  const [{ data: locations }, { data: audits }, { data: findings }] = await Promise.all([
    supabase.from("locations").select("id, name").eq("status", "active").order("name"),
    supabase.from("audits").select("*").eq("status", "submitted").order("conducted_date", { ascending: false }),
    supabase.from("audit_findings").select("location_id, status"),
  ]);

  const ranked = (locations ?? []).map((loc) => {
    const locAudits = (audits ?? []).filter((a) => a.location_id === loc.id);
    const latest    = locAudits[0] ?? null;
    const scores    = locAudits.filter((a) => a.score !== null).map((a) => a.score as number);
    const avg       = scores.length > 0 ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0;
    const trend     = scores.length >= 2 ? (scores[0] - scores[1]) : 0;
    const openFindings = (findings ?? []).filter((f) => f.location_id === loc.id && f.status !== "resolved").length;
    return {
      rank:          0, // filled below
      location:      loc,
      latest_score:  latest?.score ?? null,
      avg_score:     avg,
      total_audits:  locAudits.length,
      trend,
      grade:         latest?.grade ?? null,
      open_findings: openFindings,
    };
  });

  ranked.sort((a, b) => (b.latest_score ?? 0) - (a.latest_score ?? 0));
  ranked.forEach((r, i) => (r.rank = i + 1));
  return ranked;
}
