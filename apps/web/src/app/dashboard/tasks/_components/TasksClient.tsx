"use client";

import { useState, useTransition } from "react";
import {
  CheckSquare, Square, Plus, Clock, AlertTriangle, CheckCircle2,
  Search, MoreHorizontal, Calendar, MapPin, User, Flag,
} from "lucide-react";
import Modal from "@/components/Modal";
import { addTask, completeTask } from "@/app/actions/tasks";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  assignee: string | null;
  location: string | null;
  due_date: string | null;
  priority: string;
  category: string | null;
  status: string;
}

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

const FILTERS    = ["All", "Open", "In Progress", "Overdue", "Completed"];
const CATEGORIES = ["All Categories", "Compliance", "Audit", "Operations", "Training", "Reporting", "Maintenance", "Legal"];
const BLANK      = { title: "", assignee: "", location: "", due: "", priority: "medium", category: "Operations" };

function isOverdue(due: string | null, status: string) {
  if (!due || status === "completed") return false;
  return new Date(due) < new Date();
}

export default function TasksClient({ initialTasks, usingDemo, canAdd = true }: { initialTasks: Task[]; usingDemo: boolean; canAdd?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter,    setFilter]    = useState("All");
  const [category,  setCategory]  = useState("All Categories");
  const [search,    setSearch]    = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [newTask,   setNewTask]   = useState({ ...BLANK });
  const [optimisticDone, setOptimisticDone] = useState<Set<string>>(new Set());

  function setField(k: string, v: string) { setNewTask(p => ({ ...p, [k]: v })); }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    const result = await addTask(newTask);
    if (!result.error) {
      setSaved(true);
      router.refresh();
      setTimeout(() => { setSaved(false); setModalOpen(false); setNewTask({ ...BLANK }); }, 1200);
    }
  }

  function handleComplete(id: string) {
    setOptimisticDone(prev => new Set([...prev, id]));
    startTransition(async () => {
      await completeTask(id);
      router.refresh();
    });
  }

  const tasks = initialTasks.map(t => ({
    ...t,
    status: optimisticDone.has(t.id) ? "completed" : isOverdue(t.due_date, t.status) ? "overdue" : t.status,
  }));

  const filtered = tasks.filter(t => {
    const matchFilter   = filter === "All" || STATUS_LABELS[t.status] === filter;
    const matchCategory = category === "All Categories" || t.category === category;
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          (t.assignee ?? "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchCategory && matchSearch;
  });

  const openCount     = tasks.filter(t => t.status === "open" || t.status === "overdue").length;
  const inProgCount   = tasks.filter(t => t.status === "in_progress").length;
  const overdueCount  = tasks.filter(t => t.status === "overdue").length;
  const doneCount     = tasks.filter(t => t.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* New Task Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Task Title <span className="text-red-500">*</span></label>
            <input required type="text" placeholder="e.g. Update food safety certification" value={newTask.title}
              onChange={e => setField("title", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Assignee</label>
              <input type="text" placeholder="Marcus Williams" value={newTask.assignee}
                onChange={e => setField("assignee", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Location</label>
              <input type="text" placeholder="Downtown Atlanta" value={newTask.location}
                onChange={e => setField("location", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Due Date <span className="text-red-500">*</span></label>
              <input required type="date" value={newTask.due} onChange={e => setField("due", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Priority</label>
              <select value={newTask.priority} onChange={e => setField("priority", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 bg-white">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
            <select value={newTask.category} onChange={e => setField("category", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 bg-white">
              {["Compliance","Audit","Operations","Training","Reporting","Maintenance","Legal"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className={`w-full font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${saved ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700"}`}>
            {saved ? <><CheckCircle2 size={15} /> Task Added!</> : "Create Task"}
          </button>
        </form>
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {canAdd
              ? (usingDemo ? "Showing sample data — create your first task below" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} in your network`)
              : "Your assigned tasks — check them off as you complete them"}
          </p>
        </div>
        {canAdd && (
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {usingDemo && canAdd && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          📋 <strong>Sample data</strong> — Click <strong>New Task</strong> to create your first real task.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open",        value: openCount,    icon: Square,        color: "bg-blue-50 text-blue-600" },
          { label: "In Progress", value: inProgCount,  icon: Clock,         color: "bg-purple-50 text-purple-600" },
          { label: "Overdue",     value: overdueCount, icon: AlertTriangle,  color: "bg-red-50 text-red-600" },
          { label: "Completed",   value: doneCount,    icon: CheckCircle2,  color: "bg-green-50 text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {overdueCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-800">{overdueCount} overdue task{overdueCount > 1 ? "s" : ""} — immediate action required</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks or assignees..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:border-brand-500 text-gray-700">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
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
            {filtered.map(task => {
              const done = task.status === "completed";
              return (
                <div key={task.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                  <button onClick={() => !done && handleComplete(task.id)} className="mt-0.5 flex-shrink-0 text-gray-300 hover:text-brand-600 transition-colors">
                    {done ? <CheckSquare size={20} className="text-green-500" /> : <Square size={20} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? "line-through text-gray-400" : "text-gray-900"}`}>{task.title}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {task.assignee && <span className="flex items-center gap-1 text-xs text-gray-400"><User size={11} /> {task.assignee}</span>}
                      {task.location && <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} /> {task.location}</span>}
                      {task.due_date && <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar size={11} /> Due {task.due_date}</span>}
                      {task.category && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{task.category}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority] ?? ""}`}>
                      <Flag size={10} className="inline mr-1" />{task.priority}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[task.status] ?? ""}`}>
                      {STATUS_LABELS[task.status] ?? task.status}
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
