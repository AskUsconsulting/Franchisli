"use client";

import { useState, useTransition } from "react";
import { FileCheck, CheckCircle2, AlertTriangle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { acknowledgePolicy } from "@/actions/documents";

// ── Demo data ──────────────────────────────────────────────────────────────────

const LOCATIONS = [
  { id: "a1", name: "Downtown Atlanta" },
  { id: "a2", name: "Buckhead" },
  { id: "a3", name: "Midtown" },
  { id: "a4", name: "Decatur" },
  { id: "a5", name: "Marietta" },
  { id: "a6", name: "Smyrna" },
];

interface PolicyDoc {
  id:       string;
  title:    string;
  version:  string;
  dueDate:  string;
  acknowledged: string[]; // location ids that have acknowledged
}

const POLICIES: PolicyDoc[] = [
  {
    id: "p1",
    title: "Food Safety Compliance Policy v2.3",
    version: "2.3",
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split("T")[0],
    acknowledged: ["a1", "a3"],
  },
  {
    id: "p2",
    title: "Employee Code of Conduct",
    version: "1.6",
    dueDate: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0], // past
    acknowledged: ["a1", "a2", "a3", "a5"],
  },
  {
    id: "p3",
    title: "Franchise Operations Agreement",
    version: "5.0",
    dueDate: new Date(Date.now() - 275 * 86400000).toISOString().split("T")[0],
    acknowledged: ["a1", "a2", "a3", "a4", "a5", "a6"],
  },
  {
    id: "p4",
    title: "Health & Safety Policy",
    version: "2.0",
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    acknowledged: ["a1", "a2", "a4", "a6"],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, red: true };
  if (days === 0) return { label: "Due today", red: true };
  if (days <= 7) return { label: `Due in ${days}d`, red: true };
  return { label: `Due in ${days}d`, red: false };
}

// ── PolicyRow ─────────────────────────────────────────────────────────────────

function PolicyRow({ policy }: { policy: PolicyDoc }) {
  const [acked, setAcked] = useState(new Set(policy.acknowledged));
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const due = daysUntil(policy.dueDate);
  const total = LOCATIONS.length;
  const ackedCount = acked.size;
  const pct = Math.round((ackedCount / total) * 100);
  const allDone = ackedCount === total;

  function handleAck(locationId: string) {
    setAcked((prev) => new Set([...prev, locationId]));
    startTransition(async () => {
      await acknowledgePolicy({ documentId: policy.id, locationId, acknowledgedBy: "Manager" });
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${allDone ? "bg-green-50" : "bg-yellow-50"}`}>
          <FileCheck size={17} className={allDone ? "text-green-600" : "text-yellow-600"} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="font-semibold text-gray-900 text-sm">{policy.title}</p>
            <span className="text-xs text-gray-400">v{policy.version}</span>
            <span className={`text-xs font-medium ${due.red ? "text-red-600" : "text-gray-500"}`}>{due.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-48">
              <div
                className={`h-full rounded-full transition-all ${allDone ? "bg-green-500" : due.red ? "bg-red-400" : "bg-brand-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 shrink-0">
              {allDone
                ? <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={11} /> All acknowledged</span>
                : `${ackedCount}/${total} locations`}
            </span>
          </div>
        </div>

        {expanded ? <ChevronDown size={16} className="text-gray-400 shrink-0" /> : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Location Status</p>
          <div className="grid grid-cols-2 gap-2">
            {LOCATIONS.map((loc) => {
              const done = acked.has(loc.id);
              return (
                <div key={loc.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${done ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                  <span className="text-sm text-gray-700">{loc.name}</span>
                  {done ? (
                    <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  ) : (
                    <button
                      onClick={() => handleAck(loc.id)}
                      disabled={isPending}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      <Clock size={10} /> Mark acked
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PoliciesPage() {
  const totalPolicies = POLICIES.length;
  const fullyAcked    = POLICIES.filter((p) => p.acknowledged.length === LOCATIONS.length).length;
  const overdue       = POLICIES.filter((p) => new Date(p.dueDate) < new Date() && p.acknowledged.length < LOCATIONS.length).length;
  const pending       = totalPolicies - fullyAcked;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{fullyAcked}</p><p className="text-xs text-gray-500">Fully acknowledged</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center"><Clock size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{pending}</p><p className="text-xs text-gray-500">Pending signatures</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{overdue}</p><p className="text-xs text-gray-500">Overdue</p></div>
        </div>
      </div>

      {/* Policy list */}
      <div className="space-y-3">
        {POLICIES.map((p) => <PolicyRow key={p.id} policy={p} />)}
      </div>
    </div>
  );
}
