export const dynamic = "force-dynamic";

import { getDocuments } from "@/lib/documents/queries";
import DocumentsClient from "./_components/DocumentsClient";
import type { DocumentWithDetails } from "@/types/documents";

// One starter example shown to new users
const EXAMPLE_DOC: DocumentWithDetails[] = [
  { id: "example-1", title: "Food Safety & Temperature Standards", description: "Example: HACCP-based food safety procedures including temperature monitoring and handling. Replace this with your own SOPs.", category_id: "c2", doc_type: "sop", content: null, file_url: null, version: "1.0", status: "active", requires_acknowledgment: false, created_by: "Franchisli", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), document_categories: { id: "c2", name: "Food Safety", slug: "food-safety", description: null }, policy_acknowledgments: [] },
] as unknown as DocumentWithDetails[];

export default async function DocumentsPage() {
  let docs: DocumentWithDetails[] = [];
  let usingExample = false;

  try {
    docs = await getDocuments();
    if (docs.length === 0) { docs = EXAMPLE_DOC; usingExample = true; }
  } catch {
    docs = EXAMPLE_DOC;
    usingExample = true;
  }

  return <DocumentsClient docs={docs} usingDemo={usingExample} />;
}
