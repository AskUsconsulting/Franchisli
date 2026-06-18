"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function computeHours(clockIn: string, clockOut: string): number | null {
  if (!clockIn || !clockOut) return null;
  const [ih, im] = clockIn.split(":").map(Number);
  const [oh, om] = clockOut.split(":").map(Number);
  if ([ih, im, oh, om].some(n => Number.isNaN(n))) return null;
  let mins = (oh * 60 + om) - (ih * 60 + im);
  if (mins < 0) mins += 24 * 60; // crossed midnight
  return Math.round((mins / 60) * 100) / 100;
}

export async function submitTimesheet(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const work_date = formData.get("work_date") as string;
  const clock_in  = formData.get("clock_in") as string;
  const clock_out = formData.get("clock_out") as string;
  const notes     = formData.get("notes") as string;

  const { error } = await admin.from("timesheets").insert({
    user_id:       user.id,
    employee_name: profile?.full_name ?? user.email,
    work_date,
    clock_in,
    clock_out,
    hours:         computeHours(clock_in, clock_out),
    notes:         notes || null,
    status:        "submitted",
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/timesheets");
  return { success: true };
}

export async function setTimesheetStatus(id: string, status: "approved" | "rejected") {
  const admin = createAdminClient();
  const { error } = await admin.from("timesheets").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/timesheets");
  return { success: true };
}
