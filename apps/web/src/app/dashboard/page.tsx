import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Users,
  DollarSign,
  ClipboardCheck,
  CheckSquare,
  AlertTriangle,
  Plus,
  ArrowRight,
  MoreHorizontal,
  Star,
  Clock,
  FileText,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const KPI_CARDS = [
  {
    label: "Total Locations",
    value: "12",
    change: "+2 this quarter",
    up: true,
    icon: MapPin,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Active Franchisees",
    value: "10",
    change: "2 onboarding",
    up: true,
    icon: Users,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Monthly Revenue",
    value: "$142K",
    change: "+8.2% vs last month",
    up: true,
    icon: DollarSign,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Compliance Score",
    value: "94%",
    change: "-1% this month",
    up: false,
    icon: ClipboardCheck,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    label: "Open Tasks",
    value: "7",
    change: "3 overdue",
    up: false,
    icon: CheckSquare,
    color: "bg-orange-50 text-orange-600",
  },
  {
    label: "Pending Audits",
    value: "3",
    change: "Next: Jun 2",
    up: null,
    icon: AlertTriangle,
    color: "bg-red-50 text-red-600",
  },
];

const REVENUE_BARS = [
  { month: "Jan", value: 78, amount: "$78K" },
  { month: "Feb", value: 85, amount: "$85K" },
  { month: "Mar", value: 91, amount: "$91K" },
  { month: "Apr", value: 88, amount: "$88K" },
  { month: "May", value: 105, amount: "$105K" },
  { month: "Jun", value: 99, amount: "$99K" },
  { month: "Jul", value: 118, amount: "$118K" },
  { month: "Aug", value: 125, amount: "$125K" },
  { month: "Sep", value: 131, amount: "$131K" },
  { month: "Oct", value: 127, amount: "$127K" },
  { month: "Nov", value: 138, amount: "$138K" },
  { month: "Dec", value: 142, amount: "$142K" },
];

const MAX_BAR = 142;

const LOCATIONS = [
  { name: "Downtown Atlanta",  status: "Active",    score: 97, revenue: "$18.2K", franchisee: "Marcus J." },
  { name: "Buckhead",          status: "Active",    score: 91, revenue: "$15.7K", franchisee: "Sandra K." },
  { name: "Midtown",           status: "Active",    score: 88, revenue: "$13.4K", franchisee: "Derek L." },
  { name: "Decatur",           status: "Warning",   score: 74, revenue: "$11.1K", franchisee: "Tanya R." },
  { name: "Marietta",          status: "Active",    score: 95, revenue: "$14.8K", franchisee: "James P." },
  { name: "Smyrna",            status: "Onboarding",score: null,revenue: "—",     franchisee: "Priya N." },
];

const AUDITS = [
  { location: "Downtown Atlanta", date: "May 20, 2026", score: 97,  status: "Passed",  auditor: "Third" },
  { location: "Buckhead",         date: "May 18, 2026", score: 91,  status: "Passed",  auditor: "Marki" },
  { location: "Decatur",          date: "May 15, 2026", score: 74,  status: "Review",  auditor: "Third" },
  { location: "Midtown",          date: "Jun 2, 2026",  score: null, status: "Scheduled",auditor: "Marki" },
  { location: "Marietta",         date: "Jun 5, 2026",  score: null, status: "Scheduled",auditor: "Third" },
];

const TASKS = [
  { text: "Review Decatur audit findings",     priority: "High",   due: "Jun 1",  assignee: "You",   done: false },
  { text: "Send Q2 compliance report to legal","priority": "High", due: "Jun 3",  assignee: "You",   done: false },
  { text: "Onboard Smyrna franchisee",         priority: "Medium", due: "Jun 7",  assignee: "Marki", done: false },
  { text: "Update operations manual v2.4",     priority: "Medium", due: "Jun 10", assignee: "Third", done: false },
  { text: "Approve Buckhead renovation plan",  priority: "Low",    due: "Jun 12", assignee: "You",   done: true  },
];

const ACTIVITY = [
  { icon: ClipboardCheck, color: "text-green-600 bg-green-50", text: "Audit passed — Downtown Atlanta (97%)", time: "2h ago" },
  { icon: Users,          color: "text-blue-600 bg-blue-50",   text: "New franchisee application: Smyrna location", time: "5h ago" },
  { icon: AlertTriangle,  color: "text-red-600 bg-red-50",     text: "Decatur scored below threshold (74%) — action required", time: "1d ago" },
  { icon: FileText,       color: "text-purple-600 bg-purple-50",text: "Operations manual updated to v2.3", time: "2d ago" },
  { icon: DollarSign,     color: "text-green-600 bg-green-50", text: "November royalty payments collected — all 10 locations", time: "3d ago" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active:      "bg-green-100 text-green-700",
    Warning:     "bg-yellow-100 text-yellow-700",
    Onboarding:  "bg-blue-100 text-blue-700",
    Passed:      "bg-green-100 text-green-700",
    Review:      "bg-yellow-100 text-yellow-700",
    Scheduled:   "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const color: Record<string, string> = {
    High:   "bg-red-500",
    Medium: "bg-yellow-400",
    Low:    "bg-gray-300",
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color[priority]}`} />;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-500" : score >= 80 ? "bg-yellow-400" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-600 w-8">{score}%</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OwnerDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, Abiel 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">Wednesday, May 28, 2026 · 12 locations across 3 regions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 bg-white">
            <FileText size={15} />
            Generate Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium">
            <Plus size={15} />
            New Audit
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map(({ label, value, change, up, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
            <div className="flex items-center gap-1">
              {up === true && <TrendingUp size={12} className="text-green-500" />}
              {up === false && <TrendingDown size={12} className="text-red-400" />}
              <span className={`text-xs ${up === true ? "text-green-600" : up === false ? "text-red-500" : "text-gray-400"}`}>
                {change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Location Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Revenue Bar Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">Monthly royalty revenue across all locations</p>
            </div>
            <div className="flex items-center gap-2">
              {["6M", "YTD", "1Y"].map((r) => (
                <button
                  key={r}
                  className={`px-3 py-1 rounded-md text-xs font-medium ${r === "1Y" ? "bg-brand-500 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-40">
            {REVENUE_BARS.map(({ month, value, amount }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{amount}</span>
                <div
                  className="w-full bg-brand-500 rounded-t-sm hover:bg-brand-600 transition-colors cursor-pointer"
                  style={{ height: `${(value / MAX_BAR) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Total 2026 YTD: <span className="font-semibold text-gray-800">$1.23M</span></span>
            <span>Avg/location: <span className="font-semibold text-gray-800">$10.2K/mo</span></span>
            <span>Target: <span className="font-semibold text-gray-800">$1.5M</span></span>
          </div>
        </div>

        {/* Location Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Locations</h2>
            <button className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {LOCATIONS.map(({ name, status, score, revenue, franchisee }) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={13} className="text-brand-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                    <p className="text-xs text-gray-400">{franchisee}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  <StatusBadge status={status} />
                  {score ? <ScoreBar score={score} /> : <span className="text-xs text-gray-400">In setup</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audits + Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recent Audits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Audits & Compliance</h2>
            <button className="flex items-center gap-1 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg">
              <Plus size={12} /> Schedule Audit
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="text-left pb-2 font-medium">Location</th>
                <th className="text-left pb-2 font-medium">Date</th>
                <th className="text-left pb-2 font-medium">Score</th>
                <th className="text-left pb-2 font-medium">Status</th>
                <th className="text-left pb-2 font-medium">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {AUDITS.map(({ location, date, score, status, auditor }) => (
                <tr key={location + date} className="hover:bg-gray-50 cursor-pointer">
                  <td className="py-2.5 font-medium text-gray-800">{location}</td>
                  <td className="py-2.5 text-gray-500">{date}</td>
                  <td className="py-2.5">
                    {score ? (
                      <span className={`font-semibold ${score >= 90 ? "text-green-600" : score >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                        {score}%
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-2.5"><StatusBadge status={status} /></td>
                  <td className="py-2.5 text-gray-500">{auditor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-3 w-full text-center text-xs text-brand-500 hover:text-brand-600 py-2 border-t border-gray-100 flex items-center justify-center gap-1">
            View all audits <ArrowRight size={12} />
          </button>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Tasks</h2>
            <button className="flex items-center gap-1 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg">
              <Plus size={12} /> Add Task
            </button>
          </div>
          <div className="space-y-2">
            {TASKS.map(({ text, priority, due, assignee, done }) => (
              <div key={text} className={`flex items-start gap-3 p-3 rounded-lg border ${done ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-200 bg-white hover:border-brand-200"} transition-colors`}>
                <input type="checkbox" defaultChecked={done} className="mt-0.5 accent-brand-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${done ? "line-through text-gray-400" : "text-gray-800"}`}>{text}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <PriorityDot priority={priority} />
                    <span className="text-xs text-gray-400">{priority}</span>
                    <Clock size={11} className="text-gray-300" />
                    <span className="text-xs text-gray-400">{due}</span>
                    <span className="text-xs text-gray-400">→ {assignee}</span>
                  </div>
                </div>
                <button className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                  <MoreHorizontal size={15} />
                </button>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full text-center text-xs text-brand-500 hover:text-brand-600 py-2 border-t border-gray-100 flex items-center justify-center gap-1">
            View all tasks <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-xs text-gray-400 hover:text-gray-600">View all</button>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            {ACTIVITY.map(({ icon: Icon, color, text, time }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-0 xl:pt-0 xl:border-l xl:border-gray-100 xl:pl-6">
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Top Performers</p>
            <div className="space-y-2">
              {[
                { name: "Marcus J. — Downtown Atlanta", score: 97 },
                { name: "James P. — Marietta",          score: 95 },
                { name: "Sandra K. — Buckhead",         score: 91 },
              ].map(({ name, score }) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-600">{name}</span>
                  </div>
                  <span className="text-xs font-semibold text-green-600">{score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add New Location",       icon: MapPin,         color: "border-blue-200 text-blue-600 hover:bg-blue-50" },
            { label: "Invite Franchisee",       icon: Users,          color: "border-purple-200 text-purple-600 hover:bg-purple-50" },
            { label: "Schedule Audit",          icon: ClipboardCheck, color: "border-yellow-200 text-yellow-700 hover:bg-yellow-50" },
            { label: "Upload Document",         icon: FileText,       color: "border-gray-200 text-gray-600 hover:bg-gray-50" },
            { label: "Generate Royalty Report", icon: DollarSign,     color: "border-emerald-200 text-emerald-600 hover:bg-emerald-50" },
          ].map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${color}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
