export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import TasksClient from "./_components/TasksClient";

interface Task {
  id: string;
  title: string;
  assignee: string | null;
  location: string | null;
  due_date: string | null;
  priority: string;
  category: string | null;
  status: string;
}

export default async function TasksPage() {
  let tasks: Task[] = [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("tasks")
      .select("id, title, assignee, location, due_date, priority, category, status")
      .order("created_at", { ascending: false });

    if (error || !data) throw error;
    tasks = data as Task[];
  } catch {
    tasks = [];
  }

  return <TasksClient initialTasks={tasks} usingDemo={false} />;
}
