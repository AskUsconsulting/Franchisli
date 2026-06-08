import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardShell from "./_components/DashboardShell";
import { getNotifications } from "@/lib/notifications/queries";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, role, business_name")
    .eq("id", user.id)
    .single();

  // No profile yet → send to onboarding
  if (!profile) redirect("/onboarding");

  const fullName = profile.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
  const role     = profile.role ?? "owner";
  const initials = fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  try { notifications = await getNotifications(); } catch { notifications = []; }

  return (
    <DashboardShell
      user={{ fullName, email: user.email ?? "", role, initials }}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
