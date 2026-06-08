export const dynamic = "force-dynamic";

import Link from "next/link";
import { getLocationProfiles } from "@/lib/locations/queries";
import { MapPin, Phone, User, ArrowRight, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { LocationWithRegion } from "@/types/locations";
import AddLocationModal from "./_components/AddLocationModal";

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_LOCATIONS: LocationWithRegion[] = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Downtown Atlanta", address: "245 Peachtree Center Ave, Atlanta, GA 30303", status: "active", region_id: "r1", phone: "(404) 555-0101", email: "downtown@franchisli.com", manager_name: "Marcus Williams", franchisee_name: "Sarah Chen", open_date: "2021-03-15", square_footage: 2800, seats: 48, created_at: "", regions: { id: "r1", name: "Metro Core", description: null, color: "#2c4fa3", created_at: "" } },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Buckhead", address: "3393 Peachtree Rd NE, Atlanta, GA 30326", status: "active", region_id: "r1", phone: "(404) 555-0202", email: "buckhead@franchisli.com", manager_name: "Priya Patel", franchisee_name: "James Okonkwo", open_date: "2021-09-01", square_footage: 3200, seats: 56, created_at: "", regions: { id: "r1", name: "Metro Core", description: null, color: "#2c4fa3", created_at: "" } },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Midtown", address: "860 Peachtree St NE, Atlanta, GA 30308", status: "active", region_id: "r1", phone: "(404) 555-0303", email: "midtown@franchisli.com", manager_name: "DeShawn Taylor", franchisee_name: "Maria Lopez", open_date: "2022-01-20", square_footage: 2400, seats: 40, created_at: "", regions: { id: "r1", name: "Metro Core", description: null, color: "#2c4fa3", created_at: "" } },
  { id: "a0000000-0000-0000-0000-000000000004", name: "Decatur", address: "300 E College Ave, Decatur, GA 30030", status: "active", region_id: "r1", phone: "(404) 555-0404", email: "decatur@franchisli.com", manager_name: "Kwame Asante", franchisee_name: "Robert Kim", open_date: "2022-06-10", square_footage: 2200, seats: 36, created_at: "", regions: { id: "r1", name: "Metro Core", description: null, color: "#2c4fa3", created_at: "" } },
  { id: "a0000000-0000-0000-0000-000000000005", name: "Marietta", address: "125 Church St, Marietta, GA 30060", status: "active", region_id: "r2", phone: "(770) 555-0505", email: "marietta@franchisli.com", manager_name: "Tanya Brooks", franchisee_name: "David Park", open_date: "2022-11-05", square_footage: 3000, seats: 52, created_at: "", regions: { id: "r2", name: "North Metro", description: null, color: "#16a34a", created_at: "" } },
  { id: "a0000000-0000-0000-0000-000000000006", name: "Smyrna", address: "2600 Cumberland Pkwy, Smyrna, GA 30080", status: "active", region_id: "r2", phone: "(770) 555-0606", email: "smyrna@franchisli.com", manager_name: "Carlos Rivera", franchisee_name: "Lisa Thompson", open_date: "2023-02-28", square_footage: 2600, seats: 44, created_at: "", regions: { id: "r2", name: "North Metro", description: null, color: "#16a34a", created_at: "" } },
] as unknown as LocationWithRegion[];

// Audit scores per location for display
const AUDIT_SCORES: Record<string, { score: number; grade: string; openFindings: number }> = {
  "a0000000-0000-0000-0000-000000000001": { score: 97, grade: "A", openFindings: 0 },
  "a0000000-0000-0000-0000-000000000002": { score: 91, grade: "A", openFindings: 1 },
  "a0000000-0000-0000-0000-000000000003": { score: 88, grade: "B", openFindings: 1 },
  "a0000000-0000-0000-0000-000000000004": { score: 74, grade: "C", openFindings: 3 },
  "a0000000-0000-0000-0000-000000000005": { score: 95, grade: "A", openFindings: 0 },
  "a0000000-0000-0000-0000-000000000006": { score: 82, grade: "B", openFindings: 1 },
};

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100",
  B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100",
  D: "text-orange-700 bg-orange-100",
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
  let locations: LocationWithRegion[] = [];
  let usingDemo = false;
  try { locations = await getLocationProfiles(); } catch { locations = DEMO_LOCATIONS; usingDemo = true; }
  if (locations.length === 0) { locations = DEMO_LOCATIONS; usingDemo = true; }

  const active  = locations.filter((l) => l.status === "active").length;
  const regions = new Set(locations.map((l) => l.region_id)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-500 mt-1">
            {usingDemo ? "Showing sample data — add your first real location below" : `${locations.length} location${locations.length !== 1 ? "s" : ""} in your network`}
          </p>
        </div>
        <AddLocationModal />
      </div>

      {usingDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          📋 <strong>Sample data</strong> — Click <strong>Add Location</strong> to start adding your real locations.
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><MapPin size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{locations.length}</p><p className="text-xs text-gray-500">Total locations</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{active}</p><p className="text-xs text-gray-500">Active</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><MapPin size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{regions}</p><p className="text-xs text-gray-500">Regions</p></div>
        </div>
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => {
          const audit = AUDIT_SCORES[loc.id] ?? { score: null, grade: null, openFindings: 0 };
          return (
            <Link
              key={loc.id}
              href={`/dashboard/locations/${loc.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-brand-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{loc.name}</h3>
                    {loc.regions && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                        style={{ backgroundColor: loc.regions.color }}
                      >
                        {loc.regions.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={10} /> {loc.address ?? "—"}
                  </p>
                </div>
                {audit.grade ? (
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold shrink-0 ${GRADE_COLORS[audit.grade] ?? "bg-gray-100 text-gray-600"}`}>
                    {audit.grade}
                  </span>
                ) : <span />}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
                <span className="flex items-center gap-1.5"><User size={11} /> {loc.manager_name ?? "—"}</span>
                <span className="flex items-center gap-1.5"><Phone size={11} /> {loc.phone ?? "—"}</span>
                <span className="flex items-center gap-1.5"><Clock size={11} /> Open {yearsOpen(loc.open_date) ?? "—"}</span>
                <span className="flex items-center gap-1.5">
                  {audit.openFindings > 0
                    ? <><AlertCircle size={11} className="text-red-500" /> {audit.openFindings} open finding{audit.openFindings !== 1 ? "s" : ""}</>
                    : <><CheckCircle2 size={11} className="text-green-500" /> No open findings</>}
                </span>
              </div>

              {audit.score !== null && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Last audit score</span>
                    <span className={`text-xs font-bold ${audit.score >= 90 ? "text-green-600" : audit.score >= 80 ? "text-blue-600" : audit.score >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                      {audit.score}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${audit.score >= 90 ? "bg-green-500" : audit.score >= 80 ? "bg-blue-500" : audit.score >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${audit.score}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end mt-3 text-xs text-brand-500 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                View profile <ArrowRight size={11} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
