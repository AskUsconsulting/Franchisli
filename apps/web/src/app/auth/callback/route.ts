import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get("code");
  const token = searchParams.get("token"); // employee invite token
  const type  = searchParams.get("type");  // "invite" | null

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const admin = createAdminClient();

      // If this is an employee invite, create their profile
      if (type === "invite" && token) {
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
          await admin
            .from("employee_invites")
            .update({ used: true })
            .eq("token", token);
        }
      } else {
        // Google OAuth — ensure profile exists
        const { data: existing } = await admin
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .single();

        if (!existing) {
          // New Google sign-in — we don't know their role yet, send to role selection
          return NextResponse.redirect(`${origin}/signup?google=1`);
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
