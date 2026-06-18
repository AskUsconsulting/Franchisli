import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: "owner" | "employee";
}

/** Returns the signed-in user + profile, or redirects to login/onboarding. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return {
    id:       user.id,
    email:    user.email ?? "",
    fullName: profile.full_name ?? user.email?.split("@")[0] ?? "User",
    role:     (profile.role as "owner" | "employee") ?? "owner",
  };
}

/** For owner-only pages — redirects employees back to their dashboard. */
export async function requireOwner(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (u.role !== "owner") redirect("/dashboard");
  return u;
}
