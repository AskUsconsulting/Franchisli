"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2, Circle, AlertTriangle, ChevronLeft,
  Flag, Send, Loader2, Tag,
} from "lucide-react";
import { toggleChecklistItem, submitChecklistRun } from "@/actions/operations";

// ─── Demo data (shown when DB not connected) ──────────────────
const DEMO_RUN = {
  id:           "demo-run-1",
  status:       "in_progress" as "in_progress" | "completed" | "flagged",
  shift:        "morning",
  submitted_by: "You",
  checklists: { title: "Daily Opening Checklist", type: "opening" },
  locations:  { name: "Downtown Atlanta" },
  checklist_run_items: [
    { id: "ri-1", completed: true,  completed_by: "You", notes: null, checklist_items: { id: "i-1", text: "Unlock all entry doors and deactivate alarm",        category: "Security",   item_order: 1, required: true  } },
    { id: "ri-2", completed: true,  completed_by: "You", notes: null, checklist_items: { id: "i-2", text: "Check overnight voicemails and emails",              category: "Admin",      item_order: 2, required: true  } },
    { id: "ri-3", completed: false, completed_by: null,  notes: null, checklist_items: { id: "i-3", text: "Inspect restrooms — restock supplies as needed",     category: "Facilities", item_order: 3, required: true  } },
    { id: "ri-4", completed: false, completed_by: null,  notes: null, checklist_items: { id: "i-4", text: "Check all equipment is operational (POS, printers)", category: "Equipment",  item_order: 4, required: true  } },
    { id: "ri-5", completed: false, completed_by: null,  notes: null, checklist_items: { id: "i-5", text: "Review daily specials and update menu boards",       category: "Operations", item_order: 5, required: true  } },
    { id: "ri-6", completed: false, completed_by: null,  notes: null, checklist_items: { id: "i-6", text: "Count opening cash drawer and verify amount",        category: "Finance",    item_order: 6, required: true  } },
    { id: "ri-7", completed: false, completed_by: null,  notes: null, checklist_items: { id: "i-7", text: "Brief opening staff on day priorities",              category: "Staff",      item_order: 7, required: true  } },
    { id: "ri-8", completed: false, completed_by: null,  notes: null, checklist_items: { id: "i-8", text: "Verify inventory levels — flag any shortages",       category: "Inventory",  item_order: 8, required: true  } },
    { id: "ri-9", completed: false, completed_by: null,  notes: null, checklist_items: { id: "i-9", text: "Inspect exterior — signage, parking, cleanliness",   category: "Facilities", item_order: 9, required: false } },
    { id: "ri-10",completed: false, completed_by: null,  notes: null, checklist_items: { id: "i-10",text: "Confirm all staff are clocked in and in position",   category: "Staff",      item_order: 10,required: true  } },
  ],
};

type RunItem = (typeof DEMO_RUN.checklist_run_items)[number];

export default function ChecklistRunPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [isPending, startTransition] = useTransition();

  const [run, setRun]       = useState(DEMO_RUN);
  const [items, setItems]   = useState<RunItem[]>(DEMO_RUN.checklist_run_items);
  const [notes, setNotes]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Group items by category
  const categories = [...new Set(items.map((i) => i.checklist_items.category))];
  const grouped = categories.map((cat) => ({
    category: cat,
    items: items.filter((i) => i.checklist_items.category === cat),
  }));

  const total    = items.length;
  const done     = items.filter((i) => i.completed).length;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const allRequired = items.filter((i) => i.checklist_items.required).every((i) => i.completed);

  async function handleToggle(runItemId: string, currentlyCompleted: boolean) {
    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === runItemId ? { ...i, completed: !currentlyCompleted, completed_by: !currentlyCompleted ? "You" : null } : i
      )
    );

    startTransition(async () => {
      const result = await toggleChecklistItem(runItemId, !currentlyCompleted, "You");
      if (result.error) {
        // Revert on error
        setItems((prev) =>
          prev.map((i) => (i.id === runItemId ? { ...i, completed: currentlyCompleted } : i))
        );
        setError(result.error);
      }
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitChecklistRun(id, notes || undefined);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard/operations/checklists"), 1500);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Checklist Submitted!</h2>
        <p className="text-gray-500 text-sm">Redirecting back to checklists…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back + header */}
      <div>
        <Link href="/dashboard/operations/checklists" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-3">
          <ChevronLeft size={15} /> Back to Checklists
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{run.checklists.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {run.locations.name} · {run.shift} shift · By {run.submitted_by}
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            run.status === "completed"   ? "bg-green-100 text-green-700" :
            run.status === "flagged"     ? "bg-red-100 text-red-700" :
            "bg-yellow-100 text-yellow-700"
          }`}>
            {run.status === "in_progress" ? "In Progress" : run.status.charAt(0).toUpperCase() + run.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">{done} of {total} completed</span>
          <span className={`font-bold ${pct === 100 ? "text-green-600" : "text-brand-500"}`}>{pct}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? "bg-green-500" : "bg-brand-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{items.filter((i) => i.checklist_items.required && !i.completed).length} required items remaining</span>
          {allRequired && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={11} /> All required done</span>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Checklist items grouped by category */}
      {grouped.map(({ category, items: catItems }) => (
        <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <Tag size={12} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{category}</span>
            <span className="ml-auto text-xs text-gray-400">
              {catItems.filter((i) => i.completed).length}/{catItems.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {catItems.map((item) => (
              <label
                key={item.id}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${
                  item.completed ? "bg-green-50/40" : "hover:bg-gray-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, item.completed)}
                  className="mt-0.5 flex-shrink-0 focus:outline-none"
                  disabled={isPending}
                >
                  {item.completed
                    ? <CheckCircle2 size={20} className="text-green-500" />
                    : <Circle size={20} className="text-gray-300 hover:text-gray-400" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${item.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {item.checklist_items.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {!item.checklist_items.required && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                    )}
                    {item.completed && item.completed_by && (
                      <span className="text-xs text-green-600">✓ {item.completed_by}</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any issues, observations, or follow-up items for this run..."
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pb-6">
        <button
          onClick={() => router.push("/dashboard/operations/checklists")}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          Save & Exit
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !allRequired}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {submitting ? (
            <><Loader2 size={15} className="animate-spin" /> Submitting…</>
          ) : (
            <><Send size={15} /> Submit Checklist</>
          )}
        </button>
        <button
          onClick={async () => {
            const n = prompt("Describe the issue that needs flagging:");
            if (!n) return;
            setError(null);
            const result = await submitChecklistRun(id, n);
            if (!result.error) setSubmitted(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm"
        >
          <Flag size={14} /> Flag
        </button>
      </div>
    </div>
  );
}
