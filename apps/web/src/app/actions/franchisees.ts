"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addFranchisee(data: {
  name: string;
  email: string;
  phone: string;
  locations: string;
  joinDate: string;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("franchisees").insert({
    full_name:  data.name,
    email:      data.email,
    phone:      data.phone,
    join_date:  data.joinDate || new Date().toISOString().split("T")[0],
    status:     "onboarding",
    compliance_score: 100,
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/franchisees");
  return { success: true };
}
