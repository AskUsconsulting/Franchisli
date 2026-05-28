"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateLocationProfile(data: {
  locationId:     string;
  phone:          string | null;
  email:          string | null;
  managerName:    string | null;
  franchiseeName: string | null;
  squareFootage:  number | null;
  seats:          number | null;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("locations")
    .update({
      phone:           data.phone,
      email:           data.email,
      manager_name:    data.managerName,
      franchisee_name: data.franchiseeName,
      square_footage:  data.squareFootage,
      seats:           data.seats,
    })
    .eq("id", data.locationId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/locations");
  revalidatePath(`/dashboard/locations/${data.locationId}`);
  return {};
}

export async function createRegion(data: {
  name:        string;
  description: string | null;
  color:       string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: region, error } = await supabase
    .from("regions")
    .insert({ name: data.name, description: data.description, color: data.color })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard/locations/regions");
  return { id: region.id };
}

export async function assignLocationToRegion(data: {
  locationId: string;
  regionId:   string | null;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("locations")
    .update({ region_id: data.regionId })
    .eq("id", data.locationId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/locations/regions");
  return {};
}
