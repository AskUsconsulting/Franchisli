// ─── Database Row Types ───────────────────────────────────────

export type LocationStatus = "active" | "inactive" | "onboarding";
export type ChecklistType  = "opening" | "closing" | "daily" | "custom";
export type RunStatus      = "in_progress" | "completed" | "flagged";
export type Shift          = "morning" | "afternoon" | "evening" | "closing";
export type ProcedureType  = "opening" | "closing" | "emergency" | "general";
export type HandoverItemType = "issue" | "note" | "followup";

export interface Location {
  id:         string;
  name:       string;
  address:    string | null;
  region:     string | null;
  status:     LocationStatus;
  created_at: string;
}

export interface Checklist {
  id:          string;
  title:       string;
  type:        ChecklistType;
  location_id: string | null;
  is_active:   boolean;
  created_by:  string | null;
  created_at:  string;
  updated_at:  string;
}

export interface ChecklistItem {
  id:           string;
  checklist_id: string;
  text:         string;
  category:     string | null;
  item_order:   number;
  required:     boolean;
  created_at:   string;
}

export interface ChecklistRun {
  id:           string;
  checklist_id: string;
  location_id:  string;
  submitted_by: string | null;
  date:         string;
  shift:        Shift | null;
  status:       RunStatus;
  notes:        string | null;
  completed_at: string | null;
  created_at:   string;
}

export interface ChecklistRunItem {
  id:           string;
  run_id:       string;
  item_id:      string;
  completed:    boolean;
  completed_by: string | null;
  completed_at: string | null;
  notes:        string | null;
}

export interface ProcedureStep {
  order:       number;
  title:       string;
  description: string;
  required:    boolean;
}

export interface Procedure {
  id:          string;
  title:       string;
  type:        ProcedureType;
  location_id: string | null;
  steps:       ProcedureStep[];
  version:     number;
  is_active:   boolean;
  created_by:  string | null;
  updated_by:  string | null;
  created_at:  string;
  updated_at:  string;
}

export interface HandoverItem {
  type:     HandoverItemType;
  text:     string;
  resolved: boolean;
}

export interface ShiftHandoverNote {
  id:          string;
  location_id: string;
  written_by:  string;
  from_shift:  "morning" | "afternoon" | "evening";
  to_shift:    "morning" | "afternoon" | "evening";
  date:        string;
  summary:     string;
  items:       HandoverItem[];
  is_read:     boolean;
  read_at:     string | null;
  created_at:  string;
}

// ─── View / Aggregated Types ──────────────────────────────────

export interface ChecklistWithItems extends Checklist {
  checklist_items: ChecklistItem[];
}

export interface ChecklistRunWithDetails extends ChecklistRun {
  checklists:          Checklist;
  locations:           Location;
  checklist_run_items: (ChecklistRunItem & { checklist_items: ChecklistItem })[];
}

export interface LocationOperationsStatus {
  location:        Location;
  opening_run:     ChecklistRun | null;
  closing_run:     ChecklistRun | null;
  daily_run:       ChecklistRun | null;
  latest_handover: ShiftHandoverNote | null;
  unread_handover: boolean;
}

export interface OperationsOverview {
  locations:     LocationOperationsStatus[];
  total:         number;
  completed:     number;
  in_progress:   number;
  flagged:       number;
  not_started:   number;
}
