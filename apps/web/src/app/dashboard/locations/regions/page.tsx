import Link from "next/link";
import { getRegionsWithLocations } from "@/lib/locations/queries";
import { MapPin, Users, Star, AlertTriangle, ArrowRight } from "lucide-react";
import type { RegionWithLocations } from "@/types/locations";

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_REGIONS: RegionWithLocations[] = [
  {
    id: "r1", name: "Metro Core", description: "Downtown, Buckhead, Midtown, and Decatur corridors", color: "#2c4fa3", created_at: "",
    locations: [
      { id: "a0000000-0000-0000-0000-000000000001", name: "Downtown Atlanta", address: "245 Peachtree Center Ave", status: "active", region_id: "r1", phone: "(404) 555-0101", email: "downtown@franchisli.com", manager_name: "Marcus Williams", franchisee_name: "Sarah Chen", open_date: "2021-03-15", square_footage: 2800, seats: 48, created_at: "" },
      { id: "a0000000-0000-0000-0000-000000000002", name: "Buckhead",          address: "3393 Peachtree Rd NE",   status: "active", region_id: "r1", phone: "(404) 555-0202", email: "buckhead@franchisli.com",  manager_name: "Priya Patel",    franchisee_name: "James Okonkwo", open_date: "2021-09-01", square_footage: 3200, seats: 56, created_at: "" },
      { id: "a0000000-0000-0000-0000-000000000003", name: "Midtown",           address: "860 Peachtree St NE",   status: "active", region_id: "r1", phone: "(404) 555-0303", email: "midtown@franchisli.com",   manager_name: "DeShawn Taylor", franchisee_name: "Maria Lopez",   open_date: "2022-01-20", square_footage: 2400, seats: 40, created_at: "" },
      { id: "a0000000-0000-0000-0000-000000000004", name: "Decatur",           address: "300 E College Ave",     status: "active", region_id: "r1", phone: "(404) 555-0404", email: "decatur@franchisli.com",   manager_name: "Kwame Asante",   franchisee_name: "Robert Kim",    open_date: "2022-06-10", square_footage: 2200, seats: 36, created_at: "" },
    ],
  },
  {
    id: "r2", name: "North Metro", description: "Marietta and Smyrna growth corridors", color: "#16a34a", created_at: "",
    locations: [
      { id: "a0000000-0000-0000-0000-000000000005", name: "Marietta", address: "125 Church St",         status: "active", region_id: "r2", phone: "(770) 555-0505", email: "marietta@franchisli.com", manager_name: "Tanya Brooks",  franchisee_name: "David Park",    open_date: "2022-11-05", square_footage: 3000, seats: 52, created_at: "" },
      { id: "a0000000-0000-0000-0000-000000000006", name: "Smyrna",   address: "2600 Cumberland Pkwy", status: "active", region_id: "r2", phone: "(770) 555-0606", email: "smyrna@franchisli.com",   manager_name: "Carlos Rivera", franchisee_name: "Lisa Thompson", open_date: "2023-02-28", square_footage: 2600, seats: 44, created_at: "" },
    ],
  },
] as unknown as RegionWithLocations[];

const AUDIT_SCORES: Record<string, { score: number; grade: string }> = {
  "a0000000-0000-0000-0000-000000000001": { score: 97, grade: "A" },
  "a0000000-0000-0000-0000-000000000002": { score: 91, grade: "A" },
  "a0000000-0000-0000-0000-000000000003": { score: 88, grade: "B" },
  "a0000000-0000-0000-0000-000000000004": { score: 74, grade: "C" },
  "a0000000-0000-0000-0000-000000000005": { score: 95, grade: "A" },
  "a0000000-0000-0000-0000-000000000006": { score: 82, grade: "B" },
};

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100",
  B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100",
};

export default async function RegionsPage() {
  let regions: RegionWithLocations[] = [];
  try { regions = await getRegionsWithLocations(); } catch { regions = DEMO_REGIONS; }
  if (regions.length === 0) regions = DEMO_REGIONS;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><MapPin size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{regions.length}</p><p className="text-xs text-gray-500">Regions</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><Users size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{regions.reduce((s, r) => s + r.locations.length, 0)}</p><p className="text-xs text-gray-500">Total locations</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center"><Star size={18} /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{(() => {
              const all = regions.flatMap((r) => r.locations.map((l) => AUDIT_SCORES[l.id]?.score ?? 0));
              return all.length ? Math.round(all.reduce((s, n) => s + n, 0) / all.length) : 0;
            })()}%</p>
            <p className="text-xs text-gray-500">Network average</p>
          </div>
        </div>
      </div>

      {/* Region sections */}
      {regions.map((region) => {
        const scores = region.locations.map((l) => AUDIT_SCORES[l.id]?.score ?? 0);
        const avg = scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0;

        return (
          <div key={region.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Region header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3" style={{ borderLeft: `4px solid ${region.color}` }}>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900">{region.name}</h2>
                  <span className="text-xs text-white px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: region.color }}>
                    {region.locations.length} locations
                  </span>
                </div>
                {region.description && <p className="text-xs text-gray-500 mt-0.5">{region.description}</p>}
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-bold text-gray-900">{avg}%</p>
                <p className="text-xs text-gray-400">Region avg</p>
              </div>
            </div>

            {/* Location rows */}
            <div className="divide-y divide-gray-50">
              {region.locations.map((loc) => {
                const audit = AUDIT_SCORES[loc.id];
                return (
                  <Link
                    key={loc.id}
                    href={`/dashboard/locations/${loc.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm group-hover:text-brand-600 transition-colors">{loc.name}</p>
                      <p className="text-xs text-gray-400 truncate">{loc.address}</p>
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">{loc.manager_name}</div>
                    {audit ? (
                      <>
                        <div className="flex items-center gap-2 w-28 shrink-0">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${audit.score >= 90 ? "bg-green-500" : audit.score >= 80 ? "bg-blue-500" : "bg-yellow-500"}`}
                              style={{ width: `${audit.score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold w-8 text-right ${audit.score >= 90 ? "text-green-600" : audit.score >= 80 ? "text-blue-600" : "text-yellow-600"}`}>
                            {audit.score}%
                          </span>
                        </div>
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${GRADE_COLORS[audit.grade] ?? ""}`}>
                          {audit.grade}
                        </span>
                      </>
                    ) : (
                      <AlertTriangle size={14} className="text-gray-300 shrink-0" />
                    )}
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
