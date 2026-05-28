import Link from "next/link";
import { getLocationProfileById } from "@/lib/locations/queries";
import { MapPin, Phone, Mail, User, Users, Calendar, Square, ArrowLeft, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import type { LocationWithRegion } from "@/types/locations";

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_LOCATION: LocationWithRegion = {
  id: "a0000000-0000-0000-0000-000000000001",
  name: "Downtown Atlanta",
  address: "245 Peachtree Center Ave, Atlanta, GA 30303",
  status: "active",
  region_id: "r1",
  phone: "(404) 555-0101",
  email: "downtown@franchisli.com",
  manager_name: "Marcus Williams",
  franchisee_name: "Sarah Chen",
  open_date: "2021-03-15",
  square_footage: 2800,
  seats: 48,
  created_at: "2021-01-01",
  regions: { id: "r1", name: "Metro Core", description: null, color: "#2c4fa3", created_at: "" },
} as unknown as LocationWithRegion;

// Demo stats
const DEMO_STATS = {
  latestScore:   97,
  latestGrade:   "A",
  avgScore:      94,
  totalAudits:   5,
  openFindings:  0,
  trainingPct:   92,
};

// Demo recent audits
const RECENT_AUDITS = [
  { id: "au1", type: "scheduled", date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],  score: 97, grade: "A" },
  { id: "au2", type: "surprise",  date: new Date(Date.now() - 45 * 86400000).toISOString().split("T")[0], score: 94, grade: "A" },
  { id: "au3", type: "scheduled", date: new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0], score: 91, grade: "A" },
];

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100",
  B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100",
};

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function yearsOpen(d: string | null) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const years = diff / (365 * 86400000);
  return `${years.toFixed(1)} years`;
}

export default async function LocationProfilePage({ params }: { params: { id: string } }) {
  let loc: LocationWithRegion | null = null;
  try { loc = await getLocationProfileById(params.id); } catch { loc = null; }
  if (!loc) loc = DEMO_LOCATION;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/dashboard/locations" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to locations
      </Link>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{loc.name}</h1>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${loc.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {loc.status === "active" ? "Active" : loc.status}
              </span>
              {loc.regions && (
                <span className="text-xs px-2 py-1 rounded-full font-medium text-white" style={{ backgroundColor: loc.regions.color }}>
                  {loc.regions.name}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <MapPin size={13} /> {loc.address ?? "—"}
            </p>
          </div>
          <Link href="#" className="text-sm text-brand-600 hover:text-brand-700 font-medium bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg">
            Edit profile
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Phone,   label: "Phone",       value: loc.phone          ?? "—" },
            { icon: Mail,    label: "Email",        value: loc.email          ?? "—" },
            { icon: User,    label: "Manager",      value: loc.manager_name   ?? "—" },
            { icon: Users,   label: "Franchisee",   value: loc.franchisee_name ?? "—" },
            { icon: Calendar,label: "Open date",    value: formatDate(loc.open_date) },
            { icon: Calendar,label: "Time open",    value: yearsOpen(loc.open_date) },
            { icon: Square,  label: "Square footage", value: loc.square_footage ? `${loc.square_footage.toLocaleString()} sq ft` : "—" },
            { icon: Users,   label: "Seating",      value: loc.seats ? `${loc.seats} seats` : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Icon size={10} /> {label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl font-black mb-2 ${GRADE_COLORS[DEMO_STATS.latestGrade] ?? "bg-gray-100 text-gray-600"}`}>
            {DEMO_STATS.latestGrade}
          </span>
          <p className="text-2xl font-bold text-gray-900">{DEMO_STATS.latestScore}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Latest audit score</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-2">
            <Star size={24} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{DEMO_STATS.avgScore}%</p>
          <p className="text-xs text-gray-500 mt-0.5">Average score ({DEMO_STATS.totalAudits} audits)</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 ${DEMO_STATS.openFindings > 0 ? "bg-red-50" : "bg-green-50"}`}>
            {DEMO_STATS.openFindings > 0
              ? <AlertTriangle size={24} className="text-red-600" />
              : <CheckCircle2 size={24} className="text-green-600" />}
          </div>
          <p className="text-2xl font-bold text-gray-900">{DEMO_STATS.openFindings}</p>
          <p className="text-xs text-gray-500 mt-0.5">Open findings</p>
        </div>
      </div>

      {/* Training progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Training Completion</h2>
          <span className={`text-sm font-bold ${DEMO_STATS.trainingPct >= 90 ? "text-green-600" : DEMO_STATS.trainingPct >= 70 ? "text-yellow-600" : "text-red-600"}`}>
            {DEMO_STATS.trainingPct}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${DEMO_STATS.trainingPct}%` }} />
        </div>
        <p className="text-xs text-gray-400">Based on required training modules</p>
      </div>

      {/* Recent audits */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Audit History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-center px-4 py-3 font-medium">Score</th>
              <th className="text-center px-4 py-3 font-medium">Grade</th>
              <th className="text-right px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {RECENT_AUDITS.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-700">{formatDate(a.date)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.type === "surprise" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                    {a.type === "surprise" ? "Surprise" : "Scheduled"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-bold text-green-600">{a.score}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${GRADE_COLORS[a.grade] ?? "bg-gray-100 text-gray-600"}`}>
                    {a.grade}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/dashboard/audits/${a.id}`} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
