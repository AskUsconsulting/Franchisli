export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import FranchiseesClient from "./_components/FranchiseesClient";

const DEMO = [
  { id: "f1", full_name: "Marcus Williams",  email: "marcus@downtownatlanta.com",  phone: "+1 (404) 555-0101", join_date: "2022-01-01", status: "active",     compliance_score: 96 },
  { id: "f2", full_name: "Priya Sharma",     email: "priya@buckheadfranchise.com", phone: "+1 (404) 555-0182", join_date: "2022-03-01", status: "active",     compliance_score: 91 },
  { id: "f3", full_name: "Derek Johnson",    email: "derek@decaturgroup.com",      phone: "+1 (404) 555-0247", join_date: "2022-08-01", status: "attention",  compliance_score: 74 },
  { id: "f4", full_name: "Keisha Thompson",  email: "keisha@mariettaops.com",      phone: "+1 (404) 555-0319", join_date: "2021-11-01", status: "active",     compliance_score: 98 },
  { id: "f5", full_name: "James Park",       email: "james@alpharettafranchise.com",phone: "+1 (404) 555-0455",join_date: "2023-02-01", status: "active",     compliance_score: 88 },
  { id: "f6", full_name: "Amara Osei",       email: "amara@peachtreecity.com",     phone: "+1 (404) 555-0521", join_date: "2023-06-01", status: "onboarding", compliance_score: 83 },
];

export default async function FranchiseesPage() {
  let list = [];
  let usingDemo = false;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("franchisees")
      .select("id, full_name, email, phone, join_date, status, compliance_score")
      .order("created_at", { ascending: false });

    if (error || !data) throw error;
    list = data;
    if (list.length === 0) { list = DEMO as typeof data; usingDemo = true; }
  } catch {
    list = DEMO as never[];
    usingDemo = true;
  }

  return <FranchiseesClient initialList={list} usingDemo={usingDemo} />;
}
