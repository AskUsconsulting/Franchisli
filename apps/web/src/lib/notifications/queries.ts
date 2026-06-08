import { createAdminClient } from "@/lib/supabase/admin";

export interface Notification {
  id: string;
  text: string;
  time: string;
  type: "audit" | "task" | "franchisee" | "document";
  dot: string;
  unread: boolean;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export async function getNotifications(): Promise<Notification[]> {
  const admin = createAdminClient();
  const notifications: Notification[] = [];

  try {
    // Recent submitted audits
    const { data: audits } = await admin
      .from("audits")
      .select("id, score, grade, submitted_at, locations(name), auditor_name")
      .eq("status", "submitted")
      .order("submitted_at", { ascending: false })
      .limit(5);

    for (const audit of audits ?? []) {
      const loc = (audit.locations as unknown as { name: string } | null)?.name ?? "Unknown";
      const passed = (audit.score ?? 0) >= 80;
      notifications.push({
        id:     `audit-${audit.id}`,
        text:   `Audit ${passed ? "passed" : "failed"} — ${loc} (${audit.score ?? "—"}%)`,
        time:   timeAgo(audit.submitted_at ?? ""),
        type:   "audit",
        dot:    passed ? "bg-green-500" : "bg-red-500",
        unread: (Date.now() - new Date(audit.submitted_at ?? "").getTime()) < 86400000,
      });
    }

    // Overdue tasks
    const { data: tasks } = await admin
      .from("tasks")
      .select("id, title, due_date")
      .neq("status", "completed")
      .lt("due_date", new Date().toISOString().split("T")[0])
      .order("due_date", { ascending: true })
      .limit(3);

    for (const task of tasks ?? []) {
      notifications.push({
        id:     `task-${task.id}`,
        text:   `Overdue: ${task.title}`,
        time:   `Due ${task.due_date}`,
        type:   "task",
        dot:    "bg-orange-500",
        unread: true,
      });
    }

    // Recently added franchisees
    const { data: franchisees } = await admin
      .from("franchisees")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(2);

    for (const f of franchisees ?? []) {
      if ((Date.now() - new Date(f.created_at).getTime()) < 7 * 86400000) {
        notifications.push({
          id:     `franchisee-${f.id}`,
          text:   `New franchisee added: ${f.full_name}`,
          time:   timeAgo(f.created_at),
          type:   "franchisee",
          dot:    "bg-brand-500",
          unread: (Date.now() - new Date(f.created_at).getTime()) < 86400000,
        });
      }
    }
  } catch {
    // Return empty if DB not ready
  }

  // Sort by unread first
  return notifications.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0)).slice(0, 8);
}
