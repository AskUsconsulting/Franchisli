export type DocType   = "sop" | "brand_standard" | "policy";
export type DocStatus = "active" | "draft" | "archived";

export interface DocumentCategory {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
}

export interface Document {
  id:                      string;
  title:                   string;
  description:             string | null;
  category_id:             string | null;
  doc_type:                DocType;
  content:                 string | null;
  file_url:                string | null;
  version:                 string;
  status:                  DocStatus;
  requires_acknowledgment: boolean;
  created_by:              string | null;
  created_at:              string;
  updated_at:              string;
}

export interface PolicyAcknowledgment {
  id:              string;
  document_id:     string;
  location_id:     string;
  acknowledged_by: string;
  acknowledged_at: string;
}

// ── Enriched types ────────────────────────────────────────────────────────────

export interface DocumentWithDetails extends Document {
  document_categories:    DocumentCategory | null;
  policy_acknowledgments: PolicyAcknowledgment[];
}
