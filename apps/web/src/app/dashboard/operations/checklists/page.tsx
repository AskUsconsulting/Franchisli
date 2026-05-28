import Link from "next/link";
import { getChecklists, getTodayRuns } from "@/lib/operations/queries";
import { CheckCircle2, Clock, AlertTriangle, Circle, Plus, ChevronRight, Tag } from "lucide-react";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  opening: { label: "Opening", color: "bg-blue-100 text-blue-700" },
  closing: { label: "Closing", color: "bg-indigo-100 text-indigo-700" },
  daily:   { label: "Daily",   color: "bg-green-100 text-green-700" },
  custom:  { label: "Custom",  color: "bg-gray-100 text-gray-700" },
};

function StatusPill({ status }: { status?: string }) {
  if (!status) return <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Circle size={12} /> Not started</span>;
  if (status === "completed")   return <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle2 size={12} /> Completed</span>;
  if (status === "in_progress") return <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-medium"><Clock size={12} /> In progress</span>;
  if (status === "flagged")     return <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium"><AlertTriangle size={12} /> Flagged</span>;
  return null;
}

export default async function ChecklistsPage() {
  let checklists: Awaited<ReturnType<typeof getChecklists>> = [];
  let todayRuns: Awaited<ReturnType<typeof getTodayRuns>> = [];

  try {
    [checklists, todayRuns] = await Promise.all([getChecklists(), getTodayRuns()]);
  } catch {
    // DB not yet seeded — will show empty state with demo UI
  }

  // Demo checklists if none loaded
  if (checklists.length === 0) {
    checklists = [
      { id: "c0000000-0000-0000-0000-000000000001", title: "Daily Opening Checklist", type: "opening", location_id: null, is_active: true, created_by: "Abiel", created_at: "", updated_at: "", checklist_items: Array(10).fill(null).map((_, i) => ({ id: `item-${i}`, checklist_id: "c1", text: "", category: "", item_order: i, required: true, created_at: "" })) },
      { id: "c0000000-0000-0000-0000-000000000002", title: "Daily Closing Checklist", type: "closing", location_id: null, is_active: true, created_by: "Abiel", created_at: "", updated_at: "", checklist_items: Array(10).fill(null).map((_, i) => ({ id: `item-${i}`, checklist_id: "c2", text: "", category: "", item_order: i, required: true, created_at: "" })) },
      { id: "c0000000-0000-0000-0000-000000000003", title: "Daily Task Checklist",    type: "daily",   location_id: null, is_active: true, created_by: "Abiel", created_at: "", updated_at: "", checklist_items: Array(6).fill(null).map((_, i) => ({ id: `item-${i}`, checklist_id: "c3", text: "", category: "", item_order: i, required: i < 4, created_at: "" })) },
    ] as Awaited<ReturnType<typeof getChecklists>>;
  }

  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      {/* Today's runs banner */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-brand-700">Today — {todayDate}</p>
            <p className="text-sm text-brand-600 mt-0.5">
              {todayRuns.filter((r) => r.status === "completed").length} of {todayRuns.length} runs completed across all locations
            </p>
          </div>
          <Link
            href="/dashboard/operations/checklists/new"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={15} /> Start New Run
          </Link>
        </div>
      </div>

      {/* Today's active runs */}
      {todayRuns.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Active Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {todayRuns.map((run) => {
              const total = run.checklist_run_items?.length ?? 0;
              const done  = run.checklist_run_items?.filter((i) => i.completed).length ?? 0;
              const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <Link
                  key={run.id}
                  href={`/dashboard/operations/checklists/${run.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-800">{run.checklists?.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{run.locations?.name} · {run.shift}</p>
                    </div>
                    <StatusPill status={run.status} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{done}/{total} items</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${run.status === "flagged" ? "bg-red-400" : "bg-brand-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">By {run.submitted_by ?? "Unknown"}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Checklist templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Checklist Templates</h2>
          <button className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600">
            <Plus size={14} /> Create Template
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {checklists.map((cl) => {
            const { label, color } = TYPE_LABELS[cl.type] ?? { label: cl.type, color: "bg-gray-100 text-gray-600" };
            const total    = cl.checklist_items?.length ?? 0;
            const required = cl.checklist_items?.filter((i) => i.required).length ?? 0;
            return (
              <div key={cl.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                      <Tag size={10} /> {label}
                    </span>
                    <h3 className="font-semibold text-gray-800 mt-2">{cl.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {total} items · {required} required {cl.location_id ? "· This location" : "· All locations"}
                    </p>
                  </div>
                </div>

                {/* Category breakdown if items exist */}
                {cl.checklist_items && cl.checklist_items.length > 0 && cl.checklist_items[0].category && (
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(cl.checklist_items.map((i) => i.category).filter(Boolean))].slice(0, 4).map((cat) => (
                      <span key={cat} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{cat}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
                  <Link
                    href={`/dashboard/operations/checklists/${cl.id}?mode=run`}
                    className="flex-1 text-center bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Start Run
                  </Link>
                  <button className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
