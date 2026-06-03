import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardShell from "./_components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Auth temporarily disabled — use placeholder user
  const fullName = user?.user_metadata?.full_name ?? "Abiel Berhanu";
  const role     = "owner";
  const initials = "AB";

  return (
    <DashboardShell user={{ fullName, email: user.email ?? "", role, initials }}>
      {children}
    </DashboardShell>
  );
}
