import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const token = searchParams.get("token");
  const type  = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const admin = createAdminClient();

      if (type === "invite" && token) {
        // Employee magic-link invite
        const { data: invite } = await admin
          .from("employee_invites")
          .select("franchise_id, full_name")
          .eq("token", token)
          .eq("used", false)
          .single();

        if (invite) {
          await admin.from("profiles").upsert({
            id:           data.user.id,
            role:         "employee",
            full_name:    invite.full_name ?? data.user.user_metadata?.full_name,
            franchise_id: invite.franchise_id,
          });
          await admin.from("employee_invites").update({ used: true }).eq("token", token);
        }

        return NextResponse.redirect(`${origin}/dashboard`);
      }

      if (type === "recovery") {
        // Password reset — send to reset-password page
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Email confirmation or Google OAuth — check if profile exists
      const { data: profile } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", data.user.id)
        .single();

      if (!profile) {
        // New Google sign-in — needs access code
        return NextResponse.redirect(`${origin}/signup/google-owner`);
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
