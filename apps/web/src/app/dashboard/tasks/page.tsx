import { createAdminClient } from "@/lib/supabase/admin";
import TasksClient from "./_components/TasksClient";

const DEMO_TASKS = [
  { id: "t1", title: "Update food safety certification — Decatur",          due_date: "2026-06-05", priority: "high",   status: "open",        assignee: "Derek Johnson",   location: "Decatur",         category: "Compliance" },
  { id: "t2", title: "Complete Q2 audit corrective actions — Decatur",      due_date: "2026-06-07", priority: "high",   status: "open",        assignee: "Derek Johnson",   location: "Decatur",         category: "Audit" },
  { id: "t3", title: "Submit June staff schedule — Midtown",                due_date: "2026-06-03", priority: "medium", status: "open",        assignee: "Marcus Williams",  location: "Midtown",         category: "Operations" },
  { id: "t4", title: "Review and sign updated franchise agreement",          due_date: "2026-06-10", priority: "high",   status: "open",        assignee: "All Franchisees",  location: "All",             category: "Legal" },
  { id: "t5", title: "Install new POS software update — Buckhead",          due_date: "2026-06-08", priority: "medium", status: "in_progress", assignee: "Priya Sharma",    location: "Buckhead",        category: "Operations" },
  { id: "t6", title: "Submit monthly royalty report — Marietta",            due_date: "2026-06-01", priority: "high",   status: "completed",   assignee: "Keisha Thompson",  location: "Marietta",        category: "Reporting" },
  { id: "t7", title: "Replace broken freezer unit — Sandy Springs",         due_date: "2026-06-12", priority: "medium", status: "open",        assignee: "Priya Sharma",    location: "Sandy Springs",   category: "Maintenance" },
  { id: "t8", title: "Schedule surprise audit — Downtown Atlanta",          due_date: "2026-06-20", priority: "low",    status: "open",        assignee: "Marki",           location: "Downtown Atlanta", category: "Audit" },
];

export default async function TasksPage() {
  let tasks = [];
  let usingDemo = false;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("tasks")
      .select("id, title, assignee, location, due_date, priority, category, status")
      .order("created_at", { ascending: false });

    if (error || !data) throw error;
    tasks = data;
    if (tasks.length === 0) { tasks = DEMO_TASKS as typeof data; usingDemo = true; }
  } catch {
    tasks = DEMO_TASKS as never[];
    usingDemo = true;
  }

  return <TasksClient initialTasks={tasks} usingDemo={usingDemo} />;
}
