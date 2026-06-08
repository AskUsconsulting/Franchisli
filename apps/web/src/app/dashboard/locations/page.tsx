export const dynamic = "force-dynamic";

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { MapPin, Phone, User, ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import AddLocationModal from "./_components/AddLocationModal";

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100", B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100", D: "text-orange-700 bg-orange-100",
  F: "text-red-700 bg-red-100",
};

function yearsOpen(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const years = diff / (365 * 86400000);
  if (years < 1) return `${Math.floor(years * 12)}mo`;
  return `${years.toFixed(1)}yr`;
}

export default async function LocationsPage() {
  const admin = createAdminClient();
  const { data: locations } = await admin
    .from("locations")
    .select("id, name, address, status, phone, manager_name, open_date")
    .order("name");

  const locs = locations ?? [];
  const active  = locs.filter(l => l.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-500 mt-1">
            {locs.length === 0 ? "Add your first location to get started" : `${locs.length} location${locs.length !== 1 ? "s" : ""} in your network`}
          </p>
        </div>
        <AddLocationModal />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><MapPin size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{locs.length}</p><p className="text-xs text-gray-500">Total locations</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{active}</p><p className="text-xs text-gray-500">Active</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><MapPin size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{locs.filter(l => l.status === "onboarding").length}</p><p className="text-xs text-gray-500">Onboarding</p></div>
        </div>
      </div>

      {/* Empty state */}
      {locs.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-500 mb-1">No locations yet</p>
          <p className="text-sm text-gray-400 mb-4">Click "Add Location" to add your first franchise location</p>
        </div>
      )}

      {/* Location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locs.map(loc => (
          <Link key={loc.id} href={`/dashboard/locations/${loc.id}`}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-brand-200 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{loc.name}</h3>
                {loc.address && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {loc.address}
                  </p>
                )}
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                loc.status === "active" ? "bg-green-100 text-green-700" :
                loc.status === "onboarding" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}>{loc.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              {loc.manager_name && <span className="flex items-center gap-1.5"><User size={11} /> {loc.manager_name}</span>}
              {loc.phone && <span className="flex items-center gap-1.5"><Phone size={11} /> {loc.phone}</span>}
              {loc.open_date && <span className="flex items-center gap-1.5"><Clock size={11} /> Open {yearsOpen(loc.open_date)}</span>}
            </div>

            <div className="flex items-center justify-end mt-3 text-xs text-brand-500 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              View profile <ArrowRight size={11} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
