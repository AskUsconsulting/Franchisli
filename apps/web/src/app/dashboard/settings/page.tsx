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
    .select("full_name, role, business_name, franchise_id, location_id")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "owner";

  // The franchise id ties a team together:
  //  - owner  → their own user id
  //  - employee → their franchise_id (points to the owner)
  const franchiseId = role === "owner" ? user.id : profile?.franchise_id;
  const targetFranchiseId = franchiseId || "00000000-0000-0000-0000-000000000000";

  // Team members in this franchise/location:
  // Owners see everyone in their franchise (employees or themselves)
  // Employees see peers/owners in the same franchise or location
  let query = admin
    .from("profiles")
    .select("id, full_name, role");

  if (role === "owner") {
    query = query.or(`franchise_id.eq.${targetFranchiseId},id.eq.${targetFranchiseId}`);
  } else {
    const orConditions = [`franchise_id.eq.${targetFranchiseId}`, `id.eq.${targetFranchiseId}`];
    if (profile?.location_id) {
      orConditions.push(`location_id.eq.${profile.location_id}`);
    }
    query = query.or(orConditions.join(","));
  }

  const { data: team } = await query.order("full_name");

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
