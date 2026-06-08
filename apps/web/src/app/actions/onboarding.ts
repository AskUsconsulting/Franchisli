"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function completeOnboarding(data: {
  full_name: string;
  business_name: string;
  location_name?: string;
  location_address?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Update profile
  const { error: profErr } = await admin
    .from("profiles")
    .upsert({
      id:            user.id,
      role:          "owner",
      full_name:     data.full_name,
      business_name: data.business_name,
    });

  if (profErr) return { error: `Profile error: ${profErr.message}` };

  // Create first location if provided
  if (data.location_name) {
    const { error: locErr } = await admin
      .from("locations")
      .insert({
        name:    data.location_name,
        address: data.location_address || null,
        status:  "active",
      });

    if (locErr) return { error: `Location error: ${locErr.message}` };
  }

  return { success: true };
}
