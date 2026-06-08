export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin, Phone, User, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function FranchiseesPage() {
  const admin = createAdminClient();
  const { data: locations } = await admin
    .from("locations")
    .select("id, name, address, status, phone, manager_name, franchisee_name, open_date, compliance_score")
    .order("name");

  const locs = locations ?? [];
  const active      = locs.filter(l => l.status === "active").length;
  const onboarding  = locs.filter(l => l.status === "onboarding").length;
  const avgScore    = locs.filter((l: { compliance_score?: number }) => l.compliance_score).length > 0
    ? Math.round(locs.filter((l: { compliance_score?: number }) => l.compliance_score).reduce((s: number, l: { compliance_score?: number }) => s + (l.compliance_score ?? 0), 0) / locs.filter((l: { compliance_score?: number }) => l.compliance_score).length)
    : null;

  function initials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }

  const COLORS = ["bg-blue-500","bg-purple-500","bg-green-500","bg-orange-500","bg-indigo-500","bg-pink-500"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Franchisees</h1>
        <p className="text-sm text-gray-500 mt-1">
          {locs.length === 0 ? "Add locations to see your franchisees here" : `${locs.length} location${locs.length !== 1 ? "s" : ""} in your network`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Locations",  value: locs.length,  icon: MapPin,        color: "bg-blue-50 text-blue-600" },
          { label: "Active",           value: active,       icon: CheckCircle2,  color: "bg-green-50 text-green-600" },
          { label: "Needs Attention",  value: locs.filter(l => l.status === "attention").length, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
          { label: "Avg Compliance",   value: avgScore ? `${avgScore}%` : "—", icon: Star, color: "bg-yellow-50 text-yellow-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {locs.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-500 mb-1">No locations yet</p>
          <p className="text-sm text-gray-400 mb-4">Add locations to manage your franchisees</p>
          <Link href="/dashboard/locations" className="text-sm font-semibold text-brand-500 hover:text-brand-600">
            Go to Locations →
          </Link>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {locs.map((loc, i) => (
          <Link key={loc.id} href={`/dashboard/locations/${loc.id}`}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-brand-200 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {initials(loc.franchisee_name || loc.manager_name || loc.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{loc.franchisee_name || loc.manager_name || loc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {loc.name}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                loc.status === "active" ? "bg-green-100 text-green-700" :
                loc.status === "onboarding" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}>{loc.status}</span>
            </div>

            {loc.compliance_score && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 font-medium">Compliance Score</span>
                  <span className={`text-sm font-bold ${loc.compliance_score >= 90 ? "text-green-600" : loc.compliance_score >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                    {loc.compliance_score}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${loc.compliance_score >= 90 ? "bg-green-500" : loc.compliance_score >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${loc.compliance_score}%` }} />
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
              {loc.address && <span className="flex items-center gap-1"><MapPin size={11} /> {loc.address}</span>}
              {loc.phone && <span className="flex items-center gap-1 ml-auto"><Phone size={11} /> {loc.phone}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
