export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  MapPin, Users, ClipboardCheck, CheckSquare, AlertTriangle,
  ArrowRight, Clock, TrendingUp, TrendingDown, Plus,
} from "lucide-react";
import Link from "next/link";
import AuditChart from "./_components/AuditChart";
import QuickActions from "./_components/QuickActions";

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    active: "bg-green-100 text-green-700", warning: "bg-yellow-100 text-yellow-700",
    onboarding: "bg-blue-100 text-blue-700", Passed: "bg-green-100 text-green-700",
    Review: "bg-yellow-100 text-yellow-700", Scheduled: "bg-gray-100 text-gray-600",
    submitted: "bg-green-100 text-green-700", in_progress: "bg-blue-100 text-blue-700",
  };
  const label: Record<string, string> = {
    active: "Active", warning: "Warning", onboarding: "Onboarding",
    submitted: "Passed", in_progress: "In Progress",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s[status] ?? "bg-gray-100 text-gray-600"}`}>{label[status] ?? status}</span>;
}

function PriorityDot({ priority }: { priority: string }) {
  const c: Record<string, string> = { high: "bg-red-500", medium: "bg-yellow-400", low: "bg-gray-300" };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c[priority] ?? "bg-gray-300"}`} />;
}

export default async function DashboardPage() {
  const admin = createAdminClient();

  // Fetch all real data in parallel
  const [
    { data: locations },
    { data: tasks },
    { data: audits },
    { data: franchisees },
  ] = await Promise.all([
    admin.from("locations").select("id, name, status, address").order("name"),
    admin.from("tasks").select("id, title, priority, due_date, status, assignee").order("created_at", { ascending: false }).limit(5),
    admin.from("audits").select("id, location_id, conducted_date, score, grade, status, audit_type, locations(name)").order("conducted_date", { ascending: false }).limit(10),
    admin.from("franchisees").select("id").limit(1),
  ]).catch(() => [{ data: [] }, { data: [] }, { data: [] }, { data: [] }]);

  const locs       = locations ?? [];
  const taskList   = tasks ?? [];
  const auditList  = audits ?? [];

  const totalLocations  = locs.length;
  const activeLocations = locs.filter(l => l.status === "active").length;
  const openTasks       = taskList.filter(t => t.status === "open" || t.status === "overdue").length;
  const overdueTasks    = taskList.filter(t => {
    if (t.status === "completed") return false;
    return t.due_date && new Date(t.due_date) < new Date();
  }).length;
  const totalAudits     = auditList.length;
  const avgScore        = auditList.filter(a => a.score).length > 0
    ? Math.round(auditList.filter(a => a.score).reduce((s: number, a) => s + (a.score ?? 0), 0) / auditList.filter(a => a.score).length)
    : 0;

  // Chart data — audit scores over time
  const chartData = auditList
    .filter(a => a.score && a.conducted_date)
    .slice(0, 12)
    .reverse()
    .map(a => ({
      date:     new Date(a.conducted_date!).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score:    a.score as number,
      location: (a.locations as unknown as { name: string } | null)?.name ?? "Unknown",
    }));

  const KPI_CARDS = [
    { label: "Total Locations",  value: totalLocations,  change: activeLocations + " active",   up: true,  icon: MapPin,         color: "bg-blue-50 text-blue-600" },
    { label: "Open Tasks",       value: openTasks,       change: overdueTasks + " overdue",      up: overdueTasks === 0, icon: CheckSquare,    color: "bg-orange-50 text-orange-600" },
    { label: "Audits Conducted", value: totalAudits,     change: "All time",                    up: null,  icon: ClipboardCheck, color: "bg-yellow-50 text-yellow-600" },
    { label: "Avg Audit Score",  value: avgScore ? avgScore + "%" : "—", change: totalAudits > 0 ? "Based on " + totalAudits + " audits" : "No audits yet", up: avgScore >= 90, icon: TrendingUp, color: "bg-green-50 text-green-600" },
  ];

  const hasNoData = totalLocations === 0 && taskList.length === 0 && auditList.length === 0;

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalLocations > 0 ? `${totalLocations} location${totalLocations !== 1 ? "s" : ""} in your network` : "Welcome — let's get your network set up"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/reports" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 bg-white transition-colors">
            View Reports
          </Link>
          <Link href="/dashboard/audits/conduct" className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus size={15} /> New Audit
          </Link>
        </div>
      </div>

      {/* Empty state for brand new users */}
      {hasNoData && (
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <MapPin size={26} className="text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your dashboard is ready</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Start by adding your locations, then invite your team and conduct your first audit.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/dashboard/locations" className="bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
              Add Locations →
            </Link>
            <Link href="/dashboard/franchisees" className="border border-brand-300 text-brand-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-50 transition-colors">
              Add Franchisees →
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              {up === true  && <TrendingUp size={12} className="text-green-500" />}
              {up === false && <TrendingDown size={12} className="text-red-400" />}
              <span className={`text-xs ${up === true ? "text-green-600" : up === false ? "text-red-500" : "text-gray-400"}`}>{change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Score Chart + Locations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Audit Score Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-semibold text-gray-900">Audit Score Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Compliance scores across all locations over time</p>
            </div>
            <Link href="/dashboard/audits" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <AuditChart data={chartData} />
        </div>

        {/* Locations */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Locations</h2>
            <Link href="/dashboard/locations" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {locs.length === 0 ? (
            <div className="py-8 text-center">
              <MapPin size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No locations yet</p>
              <Link href="/dashboard/locations" className="mt-3 inline-block text-xs text-brand-500 font-semibold hover:text-brand-600">Add your first location →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {locs.slice(0, 6).map(loc => (
                <div key={loc.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <MapPin size={13} className="text-brand-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">{loc.name}</p>
                  </div>
                  <StatusBadge status={loc.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audits + Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recent Audits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Audits</h2>
            <Link href="/dashboard/audits/conduct" className="flex items-center gap-1 text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={12} /> Conduct Audit
            </Link>
          </div>
          {auditList.length === 0 ? (
            <div className="py-8 text-center">
              <ClipboardCheck size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400 mb-3">No audits conducted yet</p>
              <Link href="/dashboard/audits/conduct" className="text-xs text-brand-500 font-semibold hover:text-brand-600">Conduct your first audit →</Link>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left pb-2 font-medium">Location</th>
                    <th className="text-left pb-2 font-medium">Score</th>
                    <th className="text-left pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditList.slice(0, 5).map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800">{(a.locations as unknown as { name: string } | null)?.name ?? "—"}</td>
                      <td className="py-2.5">
                        {a.score ? (
                          <span className={`font-semibold ${a.score >= 90 ? "text-green-600" : a.score >= 80 ? "text-yellow-600" : "text-red-600"}`}>{a.score}%</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-2.5"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link href="/dashboard/audits" className="mt-3 w-full text-center text-xs text-brand-500 hover:text-brand-600 py-2 border-t border-gray-100 flex items-center justify-center gap-1">
                View all audits <ArrowRight size={12} />
              </Link>
            </>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Open Tasks</h2>
            <Link href="/dashboard/tasks" className="flex items-center gap-1 text-xs bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={12} /> Add Task
            </Link>
          </div>
          {taskList.filter(t => t.status !== "completed").length === 0 ? (
            <div className="py-8 text-center">
              <CheckSquare size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400 mb-3">No open tasks</p>
              <Link href="/dashboard/tasks" className="text-xs text-brand-500 font-semibold hover:text-brand-600">Create your first task →</Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {taskList.filter(t => t.status !== "completed").slice(0, 5).map(t => {
                  const isOverdue = t.due_date && new Date(t.due_date) < new Date();
                  return (
                    <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isOverdue ? "border-red-100 bg-red-50" : "border-gray-200 bg-white hover:border-brand-200"}`}>
                      <PriorityDot priority={t.priority} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{t.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {t.due_date && (
                            <span className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                              <Clock size={10} /> {isOverdue ? "Overdue" : new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          {t.assignee && <span className="text-xs text-gray-400">→ {t.assignee}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link href="/dashboard/tasks" className="mt-3 w-full text-center text-xs text-brand-500 hover:text-brand-600 py-2 border-t border-gray-100 flex items-center justify-center gap-1">
                View all tasks <ArrowRight size={12} />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
