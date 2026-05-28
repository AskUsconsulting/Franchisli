export type AuditType     = "scheduled" | "surprise" | "self";
export type AuditStatus   = "in_progress" | "submitted" | "reviewed";
export type ItemResponse  = "pass" | "fail" | "na";
export type FindingStatus = "open" | "in_review" | "resolved" | "escalated";
export type Severity      = "critical" | "major" | "minor";

export interface AuditTemplate {
  id:          string;
  name:        string;
  description: string | null;
  category:    string;
  is_active:   boolean;
  version:     number;
  created_by:  string | null;
  created_at:  string;
  updated_at:  string;
}

export interface AuditSection {
  id:            string;
  template_id:   string;
  title:         string;
  description:   string | null;
  weight:        number;
  section_order: number;
  audit_items?:  AuditItem[];
}

export interface AuditItem {
  id:             string;
  section_id:     string;
  text:           string;
  description:    string | null;
  points:         number;
  is_critical:    boolean;
  photo_required: boolean;
  item_order:     number;
}

export interface Audit {
  id:               string;
  template_id:      string;
  location_id:      string;
  auditor_name:     string;
  audit_type:       AuditType;
  status:           AuditStatus;
  scheduled_date:   string | null;
  conducted_date:   string | null;
  score:            number | null;
  grade:            string | null;
  critical_failures: number;
  notes:            string | null;
  submitted_at:     string | null;
  created_at:       string;
}

export interface AuditResponse {
  id:            string;
  audit_id:      string;
  item_id:       string;
  response:      ItemResponse | null;
  points_earned: number;
  notes:         string | null;
  created_at:    string;
  updated_at:    string;
}

export interface AuditPhoto {
  id:          string;
  audit_id:    string;
  response_id: string | null;
  item_id:     string | null;
  storage_url: string;
  caption:     string | null;
  created_at:  string;
}

export interface AuditFinding {
  id:          string;
  audit_id:    string;
  item_id:     string | null;
  location_id: string;
  description: string;
  severity:    Severity;
  status:      FindingStatus;
  due_date:    string | null;
  assigned_to: string | null;
  resolution:  string | null;
  resolved_at: string | null;
  created_at:  string;
  updated_at:  string;
}

export interface FindingUpdate {
  id:            string;
  finding_id:    string;
  author:        string;
  note:          string;
  status_change: string | null;
  created_at:    string;
}

// ─── Enriched / View Types ─────────────────────────────────────

export interface AuditTemplateWithSections extends AuditTemplate {
  audit_sections: AuditSection[];
}

export interface AuditWithDetails extends Audit {
  audit_templates: AuditTemplate;
  locations:       { id: string; name: string };
  audit_responses: AuditResponse[];
}

export interface AuditFindingWithDetails extends AuditFinding {
  locations:  { id: string; name: string };
  audits:     { id: string; conducted_date: string | null; audit_type: AuditType };
  audit_items: { id: string; text: string; is_critical: boolean } | null;
  finding_updates: FindingUpdate[];
}

export interface LocationScorecard {
  location:      { id: string; name: string };
  audits:        Audit[];
  latest_score:  number | null;
  latest_grade:  string | null;
  avg_score:     number;
  trend:         number; // positive = improving
  open_findings: number;
}

// ─── Audit State (used in conduct page) ───────────────────────

export interface ResponseDraft {
  itemId:      string;
  response:    ItemResponse | null;
  notes:       string;
  photos:      LocalPhoto[];
}

export interface LocalPhoto {
  localUrl:  string;
  file:      File;
  caption:   string;
  uploaded:  boolean;
  remoteUrl: string | null;
}
