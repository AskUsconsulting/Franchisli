"use client";

import { useState } from "react";
import {
  CheckSquare, Square, Plus, Clock, AlertTriangle, CheckCircle2,
  Filter, Search, MoreHorizontal, Calendar, MapPin, User, Flag,
} from "lucide-react";

const TASKS = [
  { id: "t1",  title: "Update food safety certification — Decatur",           due: "2026-06-05", priority: "high",   status: "open",        assignee: "Derek Johnson",  location: "Decatur",        category: "Compliance" },
  { id: "t2",  title: "Complete Q2 audit corrective actions — Decatur",       due: "2026-06-07", priority: "high",   status: "open",        assignee: "Derek Johnson",  location: "Decatur",        category: "Audit" },
  { id: "t3",  title: "Submit June staff schedule — Midtown",                 due: "2026-06-03", priority: "medium", status: "overdue",     assignee: "Marcus Williams", location: "Midtown",        category: "Operations" },
  { id: "t4",  title: "Review and sign updated franchise agreement",           due: "2026-06-10", priority: "high",   status: "open",        assignee: "All Franchisees", location: "All",            category: "Legal" },
  { id: "t5",  title: "Install new POS software update — Buckhead",           due: "2026-06-08", priority: "medium", status: "in_progress", assignee: "Priya Sharma",   location: "Buckhead",       category: "Operations" },
  { id: "t6",  title: "Complete onboarding training modules — Peachtree",     due: "2026-06-15", priority: "medium", status: "in_progress", assignee: "Amara Osei",     location: "Peachtree City", category: "Training" },
  { id: "t7",  title: "Submit monthly royalty report — Marietta",             due: "2026-06-01", priority: "high",   status: "completed",   assignee: "Keisha Thompson", location: "Marietta",       category: "Reporting" },
  { id: "t8",  title: "Replace broken freezer unit — Sandy Springs",          due: "2026-06-12", priority: "medium", status: "open",        assignee: "Priya Sharma",   location: "Sandy Springs",  category: "Maintenance" },
  { id: "t9",  title: "Conduct staff meeting re: new SOP rollout — Kennesaw", due: "2026-06-09", priority: "low",    status: "open",        assignee: "Keisha Thompson", location: "Kennesaw",       category: "Operations" },
  { id: "t10", title: "Upload Q1 training certificates — Alpharetta",         due: "2026-05-30", priority: "medium", status: "overdue",     assignee: "James Park",     location: "Alpharetta",     category: "Training" },
  { id: "t11", title: "Schedule surprise audit — Downtown Atlanta",           due: "2026-06-20", priority: "low",    status: "open",        assignee: "Marki",          location: "Downtown Atlanta", category: "Audit" },
  { id: "t12", title: "Renew business license — Johns Creek",                 due: "2026-06-30", priority: "medium", status: "open",        assignee: "James Park",     location: "Johns Creek",    category: "Compliance" },
];

const PRIORITY_STYLES: Record<string, string> = {
  high:   "text-red-600 bg-red-50",
  medium: "text-yellow-600 bg-yellow-50",
  low:    "text-gray-500 bg-gray-100",
};

const STATUS_STYLES: Record<string, string> = {
  open:        "text-blue-600 bg-blue-50",
  in_progress: "text-purple-600 bg-purple-50",
  overdue:     "text-red-600 bg-red-50",
  completed:   "text-green-600 bg-green-50",
};

const STATUS_LABELS: Record<string, string> = {
  open:        "Open",
  in_progress: "In Progress",
  overdue:     "Overdue",
  completed:   "Completed",
};

const FILTERS = ["All", "Open", "In Progress", "Overdue", "Completed"];
const CATEGORIES = ["All Categories", "Compliance", "Audit", "Operations", "Training", "Reporting", "Maintenance", "Legal"];

function isOverdue(due: string, status: string) {
  return status !== "completed" && new Date(due) < new Date();
}

export default function TasksPage() {
  const [filter,     setFilter]     = useState("All");
  const [category,   setCategory]   = useState("All Categories");
  const [search,     setSearch]     = useState("");
  const [completed,  setCompleted]  = useState<Set<string>>(new Set(["t7"]));

  function toggle(id: string) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const tasks = TASKS.map((t) => ({
    ...t,
    status: completed.has(t.id) ? "completed" : isOverdue(t.due, t.status) ? "overdue" : t.status,
  }));

  const filtered = tasks.filter((t) => {
    const matchFilter   = filter === "All" || STATUS_LABELS[t.status] === filter || (filter === "Overdue" && t.status === "overdue");
    const matchCategory = category === "All Categories" || t.category === category;
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchCategory && matchSearch;
  });

  const open        = tasks.filter((t) => t.status === "open").length;
  const inProgress  = tasks.filter((t) => t.status === "in_progress").length;
  const overdue     = tasks.filter((t) => t.status === "overdue").length;
  const done        = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage action items across your franchise network</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open",        value: open,       icon: Square,       color: "bg-blue-50 text-blue-600" },
          { label: "In Progress", value: inProgress, icon: Clock,        color: "bg-purple-50 text-purple-600" },
          { label: "Overdue",     value: overdue,    icon: AlertTriangle, color: "bg-red-50 text-red-600" },
          { label: "Completed",   value: done,       icon: CheckCircle2,  color: "bg-green-50 text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Overdue banner */}
      {overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-800">{overdue} overdue task{overdue > 1 ? "s" : ""} — immediate action required</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks or assignees..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-brand-500 text-gray-700"
        >
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Tab filters */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CheckSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks match your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((task) => {
              const done = task.status === "completed";
              return (
                <div key={task.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                  {/* Checkbox */}
                  <button onClick={() => toggle(task.id)} className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-brand-600 transition-colors">
                    {done
                      ? <CheckSquare size={20} className="text-green-500" />
                      : <Square size={20} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? "line-through text-gray-400" : "text-gray-900"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <User size={11} /> {task.assignee}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} /> {task.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={11} /> Due {task.due}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{task.category}</span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
                      <Flag size={10} className="inline mr-1" />{task.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[task.status]}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-all">
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
