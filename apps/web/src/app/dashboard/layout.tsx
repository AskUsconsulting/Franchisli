import DashboardShell from "./_components/DashboardShell";
import { getNotifications } from "@/lib/notifications/queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Auth temporarily disabled — placeholder user
  let notifications: Awaited<ReturnType<typeof getNotifications>> = [];
  try { notifications = await getNotifications(); } catch { notifications = []; }

  return (
    <DashboardShell
      user={{ fullName: "Abiel Berhanu", email: "", role: "owner", initials: "AB" }}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
