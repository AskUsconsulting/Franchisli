"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/* ── Sign In ─────────────────────────────────────────────────────────────── */

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  redirect("/dashboard");
}

/* ── Google OAuth ─────────────────────────────────────────────────────────── */

export async function signInWithGoogle() {
  const supabase   = await createClient();
  const headerList = await headers();
  const origin     = headerList.get("origin") ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  if (data.url) redirect(data.url);
}

/* ── Owner Sign Up ───────────────────────────────────────────────────────── */

export async function signUpOwner(formData: FormData) {
  const fullName   = formData.get("full_name")    as string;
  const email      = formData.get("email")        as string;
  const password   = formData.get("password")     as string;
  const accessCode = (formData.get("access_code") as string).trim().toUpperCase();

  const admin   = createAdminClient();
  const supabase = await createClient();

  // 1. Validate access code
  const { data: code, error: codeErr } = await admin
    .from("access_codes")
    .select("id, used")
    .eq("code", accessCode)
    .single();

  if (codeErr || !code) {
    redirect(`/signup/owner?error=${encodeURIComponent("Invalid access code. Please contact Franchisli support.")}`);
  }
  if (code.used) {
    redirect(`/signup/owner?error=${encodeURIComponent("This access code has already been used.")}`);
  }

  // 2. Create auth user
  const headerList = await headers();
  const origin = headerList.get("origin") ?? "http://localhost:3000";

  const { data: authData, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: "owner" },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (signUpErr || !authData.user) {
    redirect(`/signup/owner?error=${encodeURIComponent(signUpErr?.message ?? "Signup failed.")}`);
  }

  // 3. Create profile
  await admin.from("profiles").insert({
    id:        authData.user.id,
    role:      "owner",
    full_name: fullName,
  });

  // 4. Mark access code as used
  await admin
    .from("access_codes")
    .update({ used: true, used_by: authData.user.id, used_at: new Date().toISOString() })
    .eq("id", code.id);

  redirect("/signup/owner?success=1");
}

/* ── Invite Employee (called from dashboard settings) ──────────────────── */

export async function inviteEmployee(formData: FormData) {
  const email      = formData.get("email")      as string;
  const employeeName = formData.get("full_name") as string;
  const admin      = createAdminClient();
  const supabase   = await createClient();
  const headerList = await headers();
  const origin     = headerList.get("origin") ?? "http://localhost:3000";

  // Get current owner
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await admin
    .from("profiles")
    .select("franchise_id")
    .eq("id", user.id)
    .single();

  // Create invite record
  const { data: invite } = await admin
    .from("employee_invites")
    .insert({
      email:       email.toLowerCase(),
      invited_by:  user.id,
      franchise_id: profile?.franchise_id,
      full_name:   employeeName,
    })
    .select("token")
    .single();

  // Send Supabase magic-link invite email
  await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback?type=invite&token=${invite?.token ?? ""}`,
    data: { full_name: employeeName, role: "employee" },
  });

  return { success: true };
}

/* ── Sign Out ─────────────────────────────────────────────────────────────── */

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
