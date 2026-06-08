"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function generateCode(formData: FormData) {
  const admin = createAdminClient();
  const label = formData.get("label") as string;
  const code  = "FRNCH-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  await admin.from("access_codes").insert({ code, label });
  revalidatePath("/admin");
}

export async function deleteCode(formData: FormData) {
  const admin = createAdminClient();
  const id = formData.get("id") as string;
  await admin.from("access_codes").delete().eq("id", id);
  revalidatePath("/admin");
}
