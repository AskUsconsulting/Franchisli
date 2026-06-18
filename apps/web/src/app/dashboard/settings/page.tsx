export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import SettingsClient from "./_components/SettingsClient";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, role, business_name, franchise_id")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "owner";

  // The franchise id ties a team together:
  //  - owner  → their own user id
  //  - employee → their franchise_id (points to the owner)
  const franchiseId = role === "owner" ? user.id : profile?.franchise_id;

  // Team members in this franchise (employees)
  const { data: team } = await admin
    .from("profiles")
    .select("id, full_name, role")
    .eq("franchise_id", franchiseId ?? "00000000-0000-0000-0000-000000000000")
    .order("full_name");

  const teamMembers = (team ?? []).map(m => ({
    id:        m.id,
    full_name: m.full_name ?? "Unnamed",
    role:      m.role ?? "employee",
    isSelf:    m.id === user.id,
  }));

  const { saved } = await searchParams;

  return (
    <SettingsClient
      user={{
        email:         user.email ?? "",
        full_name:     profile?.full_name ?? "",
        business_name: profile?.business_name ?? "",
        role,
      }}
      teamMembers={teamMembers}
      savedToast={!!saved}
    />
  );
}
