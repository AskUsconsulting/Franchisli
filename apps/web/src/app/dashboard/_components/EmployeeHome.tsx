import Link from "next/link";
import { Clock, CheckSquare, Workflow, FileText, ArrowRight } from "lucide-react";

interface Task {
  id: string; title: string; priority: string; due_date: string | null; status: string;
}

interface Props {
  fullName: string;
  tasks: Task[];
  hoursThisWeek: number;
  pendingTimesheets: number;
}

function PriorityDot({ priority }: { priority: string }) {
  const c: Record<string, string> = { high: "bg-red-500", medium: "bg-yellow-400", low: "bg-gray-300" };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c[priority] ?? "bg-gray-300"}`} />;
}

export default function EmployeeHome({ fullName, tasks, hoursThisWeek, pendingTimesheets }: Props) {
  const openTasks = tasks.filter(t => t.status !== "completed");

  return (
    <div className="space-y-6 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {fullName.split(" ")[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what&apos;s on your plate today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Open Tasks",          value: openTasks.length,   icon: CheckSquare, color: "bg-orange-50 text-orange-600" },
          { label: "Hours This Week",     value: hoursThisWeek.toFixed(1), icon: Clock, color: "bg-blue-50 text-blue-600" },
          { label: "Pending Timesheets",  value: pendingTimesheets,  icon: Clock,       color: "bg-yellow-50 text-yellow-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">My Tasks</h2>
            <Link href="/dashboard/tasks" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {openTasks.length === 0 ? (
            <div className="py-8 text-center">
              <CheckSquare size={28} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400">No open tasks — you&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openTasks.slice(0, 5).map(t => {
                const overdue = t.due_date && new Date(t.due_date) < new Date();
                return (
                  <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border ${overdue ? "border-red-100 bg-red-50" : "border-gray-200"}`}>
                    <PriorityDot priority={t.priority} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">{t.title}</p>
                      {t.due_date && (
                        <span className={`text-xs flex items-center gap-1 mt-0.5 ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                          <Clock size={10} /> {overdue ? "Overdue" : `Due ${new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[
              { label: "Log my hours",      desc: "Submit a timesheet", href: "/dashboard/timesheets", icon: Clock,    color: "bg-blue-50 text-blue-600" },
              { label: "Daily checklists",  desc: "Operations & tasks", href: "/dashboard/operations", icon: Workflow, color: "bg-purple-50 text-purple-600" },
              { label: "View documents",    desc: "SOPs & policies",    href: "/dashboard/documents",  icon: FileText, color: "bg-gray-100 text-gray-600" },
            ].map(({ label, desc, href, icon: Icon, color }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-brand-200 hover:bg-brand-50/40 transition-colors group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}><Icon size={17} /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
