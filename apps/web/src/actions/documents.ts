"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DocType, DocStatus } from "@/types/documents";

export async function createDocument(data: {
  title:                  string;
  description:            string;
  categoryId:             string | null;
  docType:                DocType;
  content:                string | null;
  fileUrl:                string | null;
  version:                string;
  requiresAcknowledgment: boolean;
  createdBy:              string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      title:                   data.title,
      description:             data.description || null,
      category_id:             data.categoryId,
      doc_type:                data.docType,
      content:                 data.content,
      file_url:                data.fileUrl,
      version:                 data.version,
      requires_acknowledgment: data.requiresAcknowledgment,
      created_by:              data.createdBy,
      status:                  "active",
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard/documents");
  return { id: doc.id };
}

export async function updateDocumentStatus(data: {
  documentId: string;
  status:     DocStatus;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("documents")
    .update({ status: data.status, updated_at: new Date().toISOString() })
    .eq("id", data.documentId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/documents");
  return {};
}

export async function acknowledgePolicy(data: {
  documentId:     string;
  locationId:     string;
  acknowledgedBy: string;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("policy_acknowledgments").upsert({
    document_id:     data.documentId,
    location_id:     data.locationId,
    acknowledged_by: data.acknowledgedBy,
    acknowledged_at: new Date().toISOString(),
  }, { onConflict: "document_id,location_id" });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/documents/policies");
  return {};
}
