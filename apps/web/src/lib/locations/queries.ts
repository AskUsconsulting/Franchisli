import { createAdminClient } from "@/lib/supabase/admin";
import type { LocationWithRegion, RegionWithLocations } from "@/types/locations";

export async function getLocationProfiles(): Promise<LocationWithRegion[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*, regions(*)")
    .order("name");
  if (error) throw error;
  return (data ?? []) as LocationWithRegion[];
}

export async function getLocationProfileById(id: string): Promise<LocationWithRegion | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*, regions(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as LocationWithRegion;
}

export async function getRegionsWithLocations(): Promise<RegionWithLocations[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("regions")
    .select("*, locations(*)")
    .order("name");
  if (error) throw error;
  return (data ?? []) as RegionWithLocations[];
}
