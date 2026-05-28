import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Location,
  Checklist,
  ChecklistWithItems,
  ChecklistRunWithDetails,
  ChecklistRun,
  Procedure,
  ShiftHandoverNote,
  OperationsOverview,
  LocationOperationsStatus,
} from "@/types/operations";

// ─── Locations ────────────────────────────────────────────────

export async function getLocations(): Promise<Location[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

// ─── Checklists ───────────────────────────────────────────────

export async function getChecklists(): Promise<ChecklistWithItems[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("checklists")
    .select("*, checklist_items(*)")
    .eq("is_active", true)
    .order("type");
  if (error) throw error;
  return (data ?? []) as ChecklistWithItems[];
}

export async function getChecklistById(id: string): Promise<ChecklistWithItems | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("checklists")
    .select("*, checklist_items(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  const result = data as ChecklistWithItems;
  result.checklist_items = result.checklist_items.sort((a, b) => a.item_order - b.item_order);
  return result;
}

// ─── Checklist Runs ───────────────────────────────────────────

export async function getTodayRuns(): Promise<ChecklistRunWithDetails[]> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("checklist_runs")
    .select("*, checklists(*), locations(*), checklist_run_items(*, checklist_items(*))")
    .eq("date", today)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChecklistRunWithDetails[];
}

export async function getRunById(id: string): Promise<ChecklistRunWithDetails | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("checklist_runs")
    .select("*, checklists(*), locations(*), checklist_run_items(*, checklist_items(*))")
    .eq("id", id)
    .single();
  if (error) return null;
  const run = data as ChecklistRunWithDetails;
  run.checklist_run_items = run.checklist_run_items.sort(
    (a, b) => a.checklist_items.item_order - b.checklist_items.item_order
  );
  return run;
}

// ─── Operations Overview ──────────────────────────────────────

export async function getOperationsOverview(): Promise<OperationsOverview> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ data: locations }, { data: runs }, { data: handovers }] = await Promise.all([
    supabase.from("locations").select("*").neq("status", "onboarding").order("name"),
    supabase.from("checklist_runs").select("*").eq("date", today),
    supabase.from("shift_handover_notes").select("*").eq("date", today).order("created_at", { ascending: false }),
  ]);

  const runsData  = (runs ?? []) as ChecklistRun[];
  const locsData  = (locations ?? []) as Location[];
  const notesData = (handovers ?? []) as ShiftHandoverNote[];

  const locationStatuses: LocationOperationsStatus[] = locsData.map((loc) => {
    const locRuns    = runsData.filter((r) => r.location_id === loc.id);
    const locNotes   = notesData.filter((n) => n.location_id === loc.id);
    return {
      location:        loc,
      opening_run:     locRuns.find((r) => {
        // Need checklist type — join not done here; use a simple heuristic
        return r.shift === "morning";
      }) ?? null,
      closing_run:     locRuns.find((r) => r.shift === "closing" || r.shift === "evening") ?? null,
      daily_run:       locRuns.find((r) => r.shift === "afternoon") ?? null,
      latest_handover: locNotes[0] ?? null,
      unread_handover: locNotes.some((n) => !n.is_read),
    };
  });

  const statusCounts = locationStatuses.reduce(
    (acc, ls) => {
      const statuses = [ls.opening_run?.status, ls.closing_run?.status, ls.daily_run?.status].filter(Boolean);
      if (statuses.includes("flagged"))       acc.flagged++;
      else if (statuses.includes("completed")) acc.completed++;
      else if (statuses.includes("in_progress")) acc.in_progress++;
      else acc.not_started++;
      return acc;
    },
    { completed: 0, in_progress: 0, flagged: 0, not_started: 0 }
  );

  return {
    locations:   locationStatuses,
    total:       locsData.length,
    ...statusCounts,
  };
}

// ─── Procedures ───────────────────────────────────────────────

export async function getProcedures(type?: string): Promise<Procedure[]> {
  const supabase = createAdminClient();
  let query = supabase.from("procedures").select("*").eq("is_active", true);
  if (type) query = query.eq("type", type);
  const { data, error } = await query.order("type").order("title");
  if (error) throw error;
  return (data ?? []) as Procedure[];
}

export async function getProcedureById(id: string): Promise<Procedure | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("procedures")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Procedure;
}

// ─── Handover Notes ───────────────────────────────────────────

export async function getHandoverNotes(limit = 20): Promise<(ShiftHandoverNote & { locations: Location })[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shift_handover_notes")
    .select("*, locations(*)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (ShiftHandoverNote & { locations: Location })[];
}

export async function getHandoverNoteById(id: string): Promise<(ShiftHandoverNote & { locations: Location }) | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shift_handover_notes")
    .select("*, locations(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as ShiftHandoverNote & { locations: Location };
}
