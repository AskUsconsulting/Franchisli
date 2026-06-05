"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function addTask(data: {
  title: string;
  assignee: string;
  location: string;
  due: string;
  priority: string;
  category: string;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("tasks").insert({
    title:    data.title,
    assignee: data.assignee,
    location: data.location,
    due_date: data.due,
    priority: data.priority,
    category: data.category,
    status:   "open",
  });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/tasks");
  return { success: true };
}

export async function completeTask(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("tasks").update({ status: "completed" }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/tasks");
  return { success: true };
}
