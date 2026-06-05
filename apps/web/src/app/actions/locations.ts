"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addLocation(formData: FormData) {
  const admin = createAdminClient();
  const name    = formData.get("name") as string;
  const address = formData.get("address") as string;
  const status  = (formData.get("status") as string) || "active";

  const { error } = await admin.from("locations").insert({ name, address, status });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/locations");
  return { success: true };
}

export async function updateLocationStatus(id: string, status: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("locations").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/locations");
  return { success: true };
}
