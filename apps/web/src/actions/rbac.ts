"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/auth/guards";

/**
 * Server action to toggle feature access for a specific role within the owner's franchise.
 * 
 * @param roleId - The ID of the role (e.g. manager, employee)
 * @param featureName - The feature name (e.g. timesheets, tasks)
 * @param enabledStatus - Whether the feature is enabled
 */
export async function updateFeatureAccess(
  roleId: string,
  featureName: string,
  enabledStatus: boolean
): Promise<{ success?: boolean; error?: string }> {
  try {
    // 1. Authenticate and enforce that the current user is an owner
    const owner = await requireOwner();
    const franchiseId = owner.id; // Owner's user ID is the franchise ID

    const supabase = createAdminClient();

    // 2. Fetch the permission record for the feature
    const { data: permission, error: permError } = await supabase
      .from("permissions")
      .select("id")
      .eq("feature_name", featureName)
      .single();

    if (permError || !permission) {
      return { error: `Permission not found for feature name: ${featureName}` };
    }

    // 3. Perform UPSERT on role_permissions table
    const { error: upsertError } = await supabase
      .from("role_permissions")
      .upsert(
        {
          role_id:       roleId,
          permission_id: permission.id,
          franchise_id:  franchiseId,
          is_enabled:    enabledStatus,
        },
        {
          onConflict: "role_id,permission_id,franchise_id",
        }
      );

    if (upsertError) {
      return { error: upsertError.message };
    }

    // 4. Revalidate dashboard settings layout to refresh permission UI state
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "An unexpected error occurred." };
  }
}
