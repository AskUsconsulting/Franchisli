import DashboardShell from "./_components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Auth temporarily disabled — use placeholder user
  return (
    <DashboardShell user={{ fullName: "Abiel Berhanu", email: "", role: "owner", initials: "AB" }}>
      {children}
    </DashboardShell>
  );
}
