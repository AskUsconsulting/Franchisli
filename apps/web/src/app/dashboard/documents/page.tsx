export const dynamic = "force-dynamic";

import { getDocuments } from "@/lib/documents/queries";
import DocumentsClient from "./_components/DocumentsClient";
import type { DocumentWithDetails } from "@/types/documents";

const DEMO_DOCS: DocumentWithDetails[] = [
  { id: "d1", title: "Opening Procedures Checklist",     description: "Step-by-step opening procedures for all franchise locations.",            category_id: "c1", doc_type: "sop", content: "full content", file_url: null, version: "2.1", status: "active", requires_acknowledgment: false, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c1", name: "Operations",  slug: "operations",  description: null }, policy_acknowledgments: [] },
  { id: "d2", title: "Closing Procedures Checklist",     description: "Complete closing procedures including cleaning and cash reconciliation.",  category_id: "c1", doc_type: "sop", content: "full content", file_url: null, version: "2.0", status: "active", requires_acknowledgment: false, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c1", name: "Operations",  slug: "operations",  description: null }, policy_acknowledgments: [] },
  { id: "d3", title: "Food Safety & Temperature Standards", description: "HACCP-based food safety procedures including temperature monitoring.",  category_id: "c2", doc_type: "sop", content: "full content", file_url: null, version: "3.2", status: "active", requires_acknowledgment: true,  created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 4 * 86400000).toISOString(), document_categories: { id: "c2", name: "Food Safety", slug: "food-safety", description: null }, policy_acknowledgments: [] },
  { id: "d4", title: "Emergency Response Procedures",    description: "Fire, medical emergency, power outage, and active threat protocols.",     category_id: "c5", doc_type: "sop", content: null,         file_url: null, version: "1.2", status: "active", requires_acknowledgment: true,  created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c5", name: "Emergency",   slug: "emergency",   description: null }, policy_acknowledgments: [] },
] as unknown as DocumentWithDetails[];

export default async function DocumentsPage() {
  let docs: DocumentWithDetails[] = [];
  let usingDemo = false;

  try {
    docs = await getDocuments();
    if (docs.length === 0) { docs = DEMO_DOCS; usingDemo = true; }
  } catch {
    docs = DEMO_DOCS;
    usingDemo = true;
  }

  return <DocumentsClient docs={docs} usingDemo={usingDemo} />;
}
