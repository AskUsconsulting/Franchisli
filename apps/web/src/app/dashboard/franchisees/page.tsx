export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import FranchiseesClient from "./_components/FranchiseesClient";

interface Franchisee {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  join_date: string | null;
  status: string;
  compliance_score: number;
}

export default async function FranchiseesPage() {
  let list: Franchisee[] = [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("franchisees")
      .select("id, full_name, email, phone, join_date, status, compliance_score")
      .order("created_at", { ascending: false });

    if (error || !data) throw error;
    list = data as Franchisee[];
  } catch {
    list = [];
  }

  return <FranchiseesClient initialList={list} usingDemo={false} />;
}
