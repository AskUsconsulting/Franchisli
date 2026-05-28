import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AuditTemplateWithSections,
  AuditWithDetails,
  AuditFindingWithDetails,
  LocationScorecard,
  Audit,
} from "@/types/audits";

export async function getAuditTemplates(): Promise<AuditTemplateWithSections[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audit_templates")
    .select("*, audit_sections(*, audit_items(*))")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  const results = (data ?? []) as AuditTemplateWithSections[];
  results.forEach((t) => {
    t.audit_sections.sort((a, b) => a.section_order - b.section_order);
    t.audit_sections.forEach((s) => s.audit_items?.sort((a, b) => a.item_order - b.item_order));
  });
  return results;
}

export async function getAuditTemplateById(id: string): Promise<AuditTemplateWithSections | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audit_templates")
    .select("*, audit_sections(*, audit_items(*))")
    .eq("id", id)
    .single();
  if (error) return null;
  const result = data as AuditTemplateWithSections;
  result.audit_sections.sort((a, b) => a.section_order - b.section_order);
  result.audit_sections.forEach((s) => s.audit_items?.sort((a, b) => a.item_order - b.item_order));
  return result;
}

export async function getRecentAudits(limit = 20): Promise<AuditWithDetails[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audits")
    .select("*, audit_templates(name, category), locations(id, name), audit_responses(*)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AuditWithDetails[];
}

export async function getAuditById(id: string): Promise<AuditWithDetails | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audits")
    .select("*, audit_templates(name, category), locations(id, name), audit_responses(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as AuditWithDetails;
}

export async function getFindings(): Promise<AuditFindingWithDetails[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audit_findings")
    .select("*, locations(id, name), audits(id, conducted_date, audit_type), audit_items(id, text, is_critical), finding_updates(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AuditFindingWithDetails[];
}

export async function getLocationScorecards(): Promise<LocationScorecard[]> {
  const supabase = createAdminClient();
  const [{ data: locations }, { data: audits }, { data: findings }] = await Promise.all([
    supabase.from("locations").select("id, name").eq("status", "active").order("name"),
    supabase.from("audits").select("*").eq("status", "submitted").order("conducted_date", { ascending: false }),
    supabase.from("audit_findings").select("location_id, status"),
  ]);

  return (locations ?? []).map((loc) => {
    const locAudits = ((audits ?? []) as Audit[]).filter((a) => a.location_id === loc.id);
    const latest    = locAudits[0] ?? null;
    const scores    = locAudits.filter((a) => a.score !== null).map((a) => a.score as number);
    const avg       = scores.length > 0 ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0;
    const trend     = scores.length >= 2 ? (scores[0] - scores[1]) : 0;
    const openFindings = (findings ?? []).filter((f) => f.location_id === loc.id && f.status !== "resolved").length;

    return {
      location:      loc,
      audits:        locAudits,
      latest_score:  latest?.score ?? null,
      latest_grade:  latest?.grade ?? null,
      avg_score:     avg,
      trend,
      open_findings: openFindings,
    };
  });
}
