import { createAdminClient } from "@/lib/supabase/admin";
import type { DocumentWithDetails, DocumentCategory, DocType } from "@/types/documents";

export async function getDocuments(type?: DocType): Promise<DocumentWithDetails[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("documents")
    .select("*, document_categories(*), policy_acknowledgments(*)")
    .eq("status", "active")
    .order("title");
  if (type) query = query.eq("doc_type", type);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DocumentWithDetails[];
}

export async function getDocumentById(id: string): Promise<DocumentWithDetails | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*, document_categories(*), policy_acknowledgments(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as DocumentWithDetails;
}

export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("document_categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as DocumentCategory[];
}
