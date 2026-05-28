"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HandoverItem, ProcedureStep } from "@/types/operations";

// ─── Checklist Runs ───────────────────────────────────────────

export async function startChecklistRun(
  checklistId: string,
  locationId: string,
  shift: string,
  submittedBy: string
): Promise<{ runId: string } | { error: string }> {
  const supabase = createAdminClient();

  // Create the run
  const { data: run, error: runError } = await supabase
    .from("checklist_runs")
    .insert({ checklist_id: checklistId, location_id: locationId, shift, submitted_by: submittedBy })
    .select()
    .single();

  if (runError) return { error: runError.message };

  // Fetch checklist items and create run items
  const { data: items, error: itemsError } = await supabase
    .from("checklist_items")
    .select("id")
    .eq("checklist_id", checklistId);

  if (itemsError) return { error: itemsError.message };

  const runItems = (items ?? []).map((item) => ({ run_id: run.id, item_id: item.id, completed: false }));
  if (runItems.length > 0) {
    const { error: insertError } = await supabase.from("checklist_run_items").insert(runItems);
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/dashboard/operations");
  return { runId: run.id };
}

export async function toggleChecklistItem(
  runItemId: string,
  completed: boolean,
  completedBy: string,
  notes?: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("checklist_run_items")
    .update({
      completed,
      completed_by:  completed ? completedBy : null,
      completed_at:  completed ? new Date().toISOString() : null,
      notes:         notes ?? null,
    })
    .eq("id", runItemId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/operations/checklists");
  return {};
}

export async function submitChecklistRun(
  runId: string,
  notes?: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();

  // Check if all required items are done
  const { data: runItems } = await supabase
    .from("checklist_run_items")
    .select("completed, checklist_items(required)")
    .eq("run_id", runId);

  const hasUnfinishedRequired = (runItems ?? []).some(
    (ri) => !ri.completed && (ri.checklist_items as unknown as { required: boolean })?.required
  );

  const status = hasUnfinishedRequired ? "flagged" : "completed";

  const { error } = await supabase
    .from("checklist_runs")
    .update({ status, notes: notes ?? null, completed_at: new Date().toISOString() })
    .eq("id", runId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/operations");
  return {};
}

export async function flagChecklistRun(
  runId: string,
  notes: string
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("checklist_runs")
    .update({ status: "flagged", notes })
    .eq("id", runId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/operations");
  return {};
}

// ─── Procedures ───────────────────────────────────────────────

export async function createProcedure(data: {
  title: string;
  type: string;
  locationId?: string;
  steps: ProcedureStep[];
  createdBy: string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: procedure, error } = await supabase
    .from("procedures")
    .insert({
      title:       data.title,
      type:        data.type,
      location_id: data.locationId ?? null,
      steps:       data.steps,
      created_by:  data.createdBy,
      updated_by:  data.createdBy,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard/operations/procedures");
  return { id: procedure.id };
}

export async function updateProcedure(
  id: string,
  data: { title?: string; steps?: ProcedureStep[]; updatedBy: string }
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("procedures")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/operations/procedures");
  return {};
}

// ─── Handover Notes ───────────────────────────────────────────

export async function createHandoverNote(data: {
  locationId: string;
  writtenBy:  string;
  fromShift:  string;
  toShift:    string;
  summary:    string;
  items:      HandoverItem[];
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: note, error } = await supabase
    .from("shift_handover_notes")
    .insert({
      location_id: data.locationId,
      written_by:  data.writtenBy,
      from_shift:  data.fromShift,
      to_shift:    data.toShift,
      summary:     data.summary,
      items:       data.items,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard/operations/handover");
  return { id: note.id };
}

export async function markHandoverNoteRead(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("shift_handover_notes")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/operations/handover");
  return {};
}

export async function resolveHandoverItem(
  noteId: string,
  itemIndex: number,
  allItems: HandoverItem[]
): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const updated = allItems.map((item, i) =>
    i === itemIndex ? { ...item, resolved: true } : item
  );
  const { error } = await supabase
    .from("shift_handover_notes")
    .update({ items: updated })
    .eq("id", noteId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/operations/handover");
  return {};
}
