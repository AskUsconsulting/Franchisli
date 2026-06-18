export const dynamic = "force-dynamic";

import { getCurrentUser } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import TimesheetsClient from "./_components/TimesheetsClient";

interface Timesheet {
  id: string;
  employee_name: string | null;
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  hours: number | null;
  notes: string | null;
  status: string;
}

export default async function TimesheetsPage() {
  const user  = await getCurrentUser();
  const admin = createAdminClient();

  // Owners see all timesheets; employees see only their own
  let query = admin
    .from("timesheets")
    .select("id, employee_name, work_date, clock_in, clock_out, hours, notes, status")
    .order("work_date", { ascending: false });

  if (user.role === "employee") {
    query = query.eq("user_id", user.id);
  }

  let sheets: Timesheet[] = [];
  try {
    const { data } = await query;
    sheets = (data as Timesheet[]) ?? [];
  } catch {
    sheets = [];
  }

  return <TimesheetsClient sheets={sheets} role={user.role} />;
}
