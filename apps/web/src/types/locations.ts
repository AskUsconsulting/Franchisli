export interface Region {
  id:          string;
  name:        string;
  description: string | null;
  color:       string;
  created_at:  string;
}

export interface LocationProfile {
  id:               string;
  name:             string;
  address:          string | null;
  status:           string;
  region_id:        string | null;
  phone:            string | null;
  email:            string | null;
  manager_name:     string | null;
  franchisee_name:  string | null;
  open_date:        string | null;
  square_footage:   number | null;
  seats:            number | null;
  created_at:       string;
}

// ── Enriched types ────────────────────────────────────────────────────────────

export interface LocationWithRegion extends LocationProfile {
  regions: Region | null;
}

export interface RegionWithLocations extends Region {
  locations: LocationProfile[];
}
