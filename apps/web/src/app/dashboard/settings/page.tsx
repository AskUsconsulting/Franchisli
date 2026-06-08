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
    .select("full_name, role, business_name")
    .eq("id", user.id)
    .single();

  const { saved } = await searchParams;

  return (
    <SettingsClient
      user={{
        email:         user.email ?? "",
        full_name:     profile?.full_name ?? "",
        business_name: profile?.business_name ?? "",
        role:          profile?.role ?? "owner",
      }}
      savedToast={!!saved}
    />
  );
}
