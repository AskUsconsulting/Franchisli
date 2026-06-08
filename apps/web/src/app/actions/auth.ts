"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

function getOrigin(headerList: Awaited<ReturnType<typeof headers>>) {
  return headerList.get("origin") ?? "https://franchisli-web.vercel.app";
}

/* ── Sign In ──────────────────────────────────────────────────────────────── */

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      redirect(`/login?error=${encodeURIComponent("Please confirm your email first. Check your inbox (and spam folder).")}&unconfirmed=${encodeURIComponent(email)}`);
    }
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

/* ── Google OAuth ─────────────────────────────────────────────────────────── */

export async function signInWithGoogle() {
  const supabase   = await createClient();
  const headerList = await headers();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${getOrigin(headerList)}/auth/callback` },
  });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  if (data.url) redirect(data.url);
}

/* ── Owner Sign Up ────────────────────────────────────────────────────────── */

export async function signUpOwner(formData: FormData) {
  const fullName   = formData.get("full_name")   as string;
  const email      = formData.get("email")       as string;
  const password   = formData.get("password")    as string;
  const accessCode = (formData.get("access_code") as string).trim().toUpperCase();

  const admin    = createAdminClient();
  const supabase = await createClient();
  const headerList = await headers();
  const origin   = getOrigin(headerList);

  // 1. Validate access code
  const { data: code, error: codeErr } = await admin
    .from("access_codes")
    .select("id, used")
    .eq("code", accessCode)
    .single();

  if (codeErr || !code) redirect(`/signup/owner?error=${encodeURIComponent("Invalid access code. Please contact Franchisli support.")}`);
  if (code.used)        redirect(`/signup/owner?error=${encodeURIComponent("This access code has already been used.")}`);

  // 2. Create auth user
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
  await admin.from("profiles").upsert({
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

/* ── Google Owner — set access code after Google OAuth ───────────────────── */

export async function claimGoogleOwnerCode(formData: FormData) {
  const accessCode = (formData.get("access_code") as string).trim().toUpperCase();
  const admin      = createAdminClient();
  const supabase   = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Validate code
  const { data: code, error: codeErr } = await admin
    .from("access_codes")
    .select("id, used")
    .eq("code", accessCode)
    .single();

  if (codeErr || !code) redirect(`/signup/google-owner?error=${encodeURIComponent("Invalid access code.")}`);
  if (code.used)        redirect(`/signup/google-owner?error=${encodeURIComponent("This access code has already been used.")}`);

  // Create profile
  await admin.from("profiles").upsert({
    id:        user.id,
    role:      "owner",
    full_name: user.user_metadata?.full_name ?? user.email?.split("@")[0],
  });

  // Mark code used
  await admin
    .from("access_codes")
    .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
    .eq("id", code.id);

  redirect("/onboarding");
}

/* ── Forgot Password ──────────────────────────────────────────────────────── */

export async function forgotPassword(formData: FormData) {
  const supabase   = await createClient();
  const email      = formData.get("email") as string;
  const headerList = await headers();
  const origin     = getOrigin(headerList);

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  // Always redirect to success regardless — don't leak whether email exists
  redirect("/forgot-password?sent=1");
}

/* ── Reset Password ───────────────────────────────────────────────────────── */

export async function resetPassword(formData: FormData) {
  const supabase   = await createClient();
  const password   = formData.get("password") as string;

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);

  redirect("/dashboard");
}

/* ── Resend Confirmation Email ────────────────────────────────────────────── */

export async function resendConfirmation(formData: FormData) {
  const supabase   = await createClient();
  const email      = formData.get("email") as string;
  const headerList = await headers();
  const origin     = getOrigin(headerList);

  await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  redirect(`/login?resent=1`);
}

/* ── Update Profile (Settings) ───────────────────────────────────────────── */

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const admin    = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName     = formData.get("full_name")     as string;
  const businessName = formData.get("business_name") as string;
  const email        = formData.get("email")         as string;

  // Update profile table
  await admin.from("profiles").update({
    full_name:     fullName,
    business_name: businessName,
  }).eq("id", user.id);

  // Update email in auth if changed
  if (email && email !== user.email) {
    await supabase.auth.updateUser({ email });
  }

  redirect("/dashboard/settings?saved=1");
}

/* ── Invite Employee ──────────────────────────────────────────────────────── */

export async function inviteEmployee(formData: FormData) {
  const email        = formData.get("email")     as string;
  const employeeName = formData.get("full_name") as string;
  const admin        = createAdminClient();
  const supabase     = await createClient();
  const headerList   = await headers();
  const origin       = getOrigin(headerList);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await admin
    .from("profiles")
    .select("franchise_id")
    .eq("id", user.id)
    .single();

  const { data: invite } = await admin
    .from("employee_invites")
    .insert({
      email:        email.toLowerCase(),
      invited_by:   user.id,
      franchise_id: profile?.franchise_id,
      full_name:    employeeName,
    })
    .select("token")
    .single();

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
