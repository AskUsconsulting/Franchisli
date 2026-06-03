import {
  Users, MapPin, TrendingUp, TrendingDown, Star, AlertTriangle,
  CheckCircle2, Clock, MoreHorizontal, Plus, ArrowRight, Phone, Mail,
} from "lucide-react";
import Link from "next/link";

const FRANCHISEES = [
  {
    id: "f1",
    name: "Marcus Williams",
    email: "marcus@downtownatlanta.com",
    phone: "+1 (404) 555-0101",
    locations: ["Downtown Atlanta", "Midtown"],
    locationCount: 2,
    joinDate: "Jan 2022",
    complianceScore: 96,
    trend: "up",
    status: "active",
    lastAudit: "May 28",
    openTasks: 1,
    avatar: "MW",
    color: "bg-blue-500",
  },
  {
    id: "f2",
    name: "Priya Sharma",
    email: "priya@buckheadfranchise.com",
    phone: "+1 (404) 555-0182",
    locations: ["Buckhead", "Sandy Springs"],
    locationCount: 2,
    joinDate: "Mar 2022",
    complianceScore: 91,
    trend: "up",
    status: "active",
    lastAudit: "May 25",
    openTasks: 3,
    avatar: "PS",
    color: "bg-purple-500",
  },
  {
    id: "f3",
    name: "Derek Johnson",
    email: "derek@decaturgroup.com",
    phone: "+1 (404) 555-0247",
    locations: ["Decatur"],
    locationCount: 1,
    joinDate: "Aug 2022",
    complianceScore: 74,
    trend: "down",
    status: "attention",
    lastAudit: "May 20",
    openTasks: 8,
    avatar: "DJ",
    color: "bg-orange-500",
  },
  {
    id: "f4",
    name: "Keisha Thompson",
    email: "keisha@mariettaops.com",
    phone: "+1 (404) 555-0319",
    locations: ["Marietta", "Kennesaw", "Smyrna"],
    locationCount: 3,
    joinDate: "Nov 2021",
    complianceScore: 98,
    trend: "up",
    status: "active",
    lastAudit: "Jun 1",
    openTasks: 0,
    avatar: "KT",
    color: "bg-green-500",
  },
  {
    id: "f5",
    name: "James Park",
    email: "james@alpharettafranchise.com",
    phone: "+1 (404) 555-0455",
    locations: ["Alpharetta", "Johns Creek"],
    locationCount: 2,
    joinDate: "Feb 2023",
    complianceScore: 88,
    trend: "up",
    status: "active",
    lastAudit: "May 30",
    openTasks: 2,
    avatar: "JP",
    color: "bg-indigo-500",
  },
  {
    id: "f6",
    name: "Amara Osei",
    email: "amara@peachtreecity.com",
    phone: "+1 (404) 555-0521",
    locations: ["Peachtree City"],
    locationCount: 1,
    joinDate: "Jun 2023",
    complianceScore: 83,
    trend: "up",
    status: "onboarding",
    lastAudit: "Never",
    openTasks: 5,
    avatar: "AO",
    color: "bg-pink-500",
  },
];

const STATUS_STYLES: Record<string, string> = {
  active:     "bg-green-100 text-green-700",
  attention:  "bg-red-100 text-red-700",
  onboarding: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
  active:     "Active",
  attention:  "Needs Attention",
  onboarding: "Onboarding",
};

export default function FranchiseesPage() {
  const totalLocations  = FRANCHISEES.reduce((s, f) => s + f.locationCount, 0);
  const avgCompliance   = Math.round(FRANCHISEES.reduce((s, f) => s + f.complianceScore, 0) / FRANCHISEES.length);
  const needsAttention  = FRANCHISEES.filter((f) => f.status === "attention").length;
  const totalOpenTasks  = FRANCHISEES.reduce((s, f) => s + f.openTasks, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franchisees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your franchise network and operator relationships</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Franchisee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Franchisees", value: FRANCHISEES.length, icon: Users,         color: "bg-blue-50 text-blue-600" },
          { label: "Total Locations",   value: totalLocations,     icon: MapPin,         color: "bg-purple-50 text-purple-600" },
          { label: "Avg Compliance",    value: `${avgCompliance}%`,icon: Star,           color: "bg-green-50 text-green-600" },
          { label: "Needs Attention",   value: needsAttention,     icon: AlertTriangle,  color: "bg-red-50 text-red-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Attention banner */}
      {needsAttention > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">{needsAttention} franchisee{needsAttention > 1 ? "s" : ""} need{needsAttention === 1 ? "s" : ""} immediate attention</p>
            <p className="text-xs text-red-600 mt-0.5">Compliance scores below 80% — review audit findings and open tasks</p>
          </div>
        </div>
      )}

      {/* Franchisee cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FRANCHISEES.map((f) => (
          <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${f.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {f.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Since {f.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[f.status]}`}>
                  {STATUS_LABELS[f.status]}
                </span>
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Compliance score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500 font-medium">Compliance Score</span>
                <div className="flex items-center gap-1">
                  {f.trend === "up"
                    ? <TrendingUp size={12} className="text-green-500" />
                    : <TrendingDown size={12} className="text-red-500" />}
                  <span className={`text-sm font-bold ${f.complianceScore >= 90 ? "text-green-600" : f.complianceScore >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                    {f.complianceScore}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${f.complianceScore >= 90 ? "bg-green-500" : f.complianceScore >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${f.complianceScore}%` }}
                />
              </div>
            </div>

            {/* Locations */}
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              <MapPin size={13} className="text-gray-400 flex-shrink-0" />
              {f.locations.map((loc) => (
                <span key={loc} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{loc}</span>
              ))}
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 mb-4">
              <div>
                <p className="text-xs text-gray-400">Last Audit</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{f.lastAudit}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Open Tasks</p>
                <p className={`text-sm font-medium mt-0.5 ${f.openTasks > 0 ? "text-orange-600" : "text-gray-700"}`}>
                  {f.openTasks === 0 ? "None" : f.openTasks}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Locations</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{f.locationCount}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-3">
              <a href={`mailto:${f.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors">
                <Mail size={13} /> {f.email}
              </a>
              <a href={`tel:${f.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors ml-auto">
                <Phone size={13} /> {f.phone}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
