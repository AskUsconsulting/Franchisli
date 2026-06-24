import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: "owner" | "manager" | "employee";
}

/** Returns the signed-in user + profile, or redirects to login/onboarding. */
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // --- DEVELOPER MOCK MODE ---
    // Change 'role' here to "owner", "manager", or "employee" to test different access levels locally.
    return {
      id:       "00000000-0000-0000-0000-000000000001",
      email:    "mockowner@franchisli.com",
      fullName: "Jane Smith (Mock Owner)",
      role:     "owner", 
    };
  }

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
    role:     (profile.role as "owner" | "manager" | "employee") ?? "owner",
  };
}

/** For owner-only pages — redirects employees back to their dashboard. */
export async function requireOwner(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (u.role !== "owner") redirect("/dashboard");
  return u;
}
