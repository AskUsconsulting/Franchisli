"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ItemResponse, FindingStatus } from "@/types/audits";

function calcGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// ─── Audit CRUD ───────────────────────────────────────────────

export async function createAudit(data: {
  templateId:    string;
  locationId:    string;
  auditorName:   string;
  auditType:     string;
  scheduledDate: string | null;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: audit, error } = await supabase
    .from("audits")
    .insert({
      template_id:    data.templateId,
      location_id:    data.locationId,
      auditor_name:   data.auditorName,
      audit_type:     data.auditType,
      scheduled_date: data.scheduledDate,
      status:         "in_progress",
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard/audits");
  return { id: audit.id };
}

export async function saveAuditResponse(data: {
  auditId:      string;
  itemId:       string;
  response:     ItemResponse | null;
  pointsEarned: number;
  notes:        string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();

  // Upsert — one response per item per audit
  const { data: existing } = await supabase
    .from("audit_responses")
    .select("id")
    .eq("audit_id", data.auditId)
    .eq("item_id",  data.itemId)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from("audit_responses")
      .update({ response: data.response, points_earned: data.pointsEarned, notes: data.notes, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("audit_responses")
      .insert({ audit_id: data.auditId, item_id: data.itemId, response: data.response, points_earned: data.pointsEarned, notes: data.notes })
      .select()
      .single();
  }

  if (result.error) return { error: result.error.message };
  return { id: result.data.id };
}

export async function uploadAuditPhoto(data: {
  auditId:    string;
  itemId:     string;
  responseId: string | null;
  storageUrl: string;
  caption:    string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: photo, error } = await supabase
    .from("audit_photos")
    .insert({
      audit_id:    data.auditId,
      item_id:     data.itemId,
      response_id: data.responseId,
      storage_url: data.storageUrl,
      caption:     data.caption,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  return { id: photo.id };
}

export async function submitAudit(data: {
  auditId:   string;
  responses: { itemId: string; response: ItemResponse | null; points: number; maxPoints: number; isCritical: boolean; notes: string }[];
  notes:     string;
}): Promise<{ score: number; grade: string; findings: string[] } | { error: string }> {
  const supabase = createAdminClient();

  const totalPoints   = data.responses.reduce((s, r) => s + r.maxPoints, 0);
  const earnedPoints  = data.responses.reduce((s, r) => s + (r.response === "fail" || r.response === null ? 0 : r.response === "na" ? 0 : r.points), 0);
  const naPoints      = data.responses.filter((r) => r.response === "na").reduce((s, r) => s + r.maxPoints, 0);
  const adjustedTotal = totalPoints - naPoints;
  const score         = adjustedTotal > 0 ? Math.round((earnedPoints / adjustedTotal) * 100) : 100;
  const grade         = calcGrade(score);
  const criticalFails = data.responses.filter((r) => r.isCritical && r.response === "fail").length;

  // Update audit record
  const { error: auditError } = await supabase
    .from("audits")
    .update({
      score,
      grade,
      critical_failures: criticalFails,
      status:       "submitted",
      submitted_at: new Date().toISOString(),
      notes:        data.notes || null,
    })
    .eq("id", data.auditId);

  if (auditError) return { error: auditError.message };

  // Create findings for failed items
  const { data: audit } = await supabase.from("audits").select("location_id").eq("id", data.auditId).single();
  const findings: string[] = [];

  const failedItems = data.responses.filter((r) => r.response === "fail");
  for (const item of failedItems) {
    const { data: auditItem } = await supabase.from("audit_items").select("text, is_critical").eq("id", item.itemId).single();
    const severity = item.isCritical ? "critical" : item.points >= 8 ? "major" : "minor";
    const { data: finding } = await supabase
      .from("audit_findings")
      .insert({
        audit_id:    data.auditId,
        item_id:     item.itemId,
        location_id: audit?.location_id,
        description: `Failed: ${auditItem?.text ?? "Unknown item"}`,
        severity,
        status:      "open",
        due_date:    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      })
      .select("id")
      .single();
    if (finding) findings.push(finding.id);
  }

  revalidatePath("/dashboard/audits");
  revalidatePath("/dashboard/audits/findings");
  return { score, grade, findings };
}

// ─── Findings ─────────────────────────────────────────────────

export async function updateFindingStatus(data: {
  findingId: string;
  status:    FindingStatus;
  author:    string;
  note:      string;
  resolution?: string;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {
    status:     data.status,
    updated_at: new Date().toISOString(),
  };
  if (data.status === "resolved") {
    updates.resolved_at = new Date().toISOString();
    updates.resolution  = data.resolution ?? null;
  }

  const { error } = await supabase.from("audit_findings").update(updates).eq("id", data.findingId);
  if (error) return { error: error.message };

  await supabase.from("finding_updates").insert({
    finding_id:    data.findingId,
    author:        data.author,
    note:          data.note,
    status_change: data.status,
  });

  revalidatePath("/dashboard/audits/findings");
  return {};
}

export async function addFindingComment(data: {
  findingId: string;
  author:    string;
  note:      string;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("finding_updates").insert({
    finding_id: data.findingId,
    author:     data.author,
    note:       data.note,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/audits/findings");
  return {};
}
