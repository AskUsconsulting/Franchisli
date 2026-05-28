"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, X, AlertTriangle, StickyNote, CornerDownRight, Send, Loader2, CheckCircle2 } from "lucide-react";
import { createHandoverNote } from "@/actions/operations";
import type { HandoverItem, HandoverItemType } from "@/types/operations";

const LOCATIONS = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Downtown Atlanta" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Buckhead" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Midtown" },
  { id: "a0000000-0000-0000-0000-000000000004", name: "Decatur" },
  { id: "a0000000-0000-0000-0000-000000000005", name: "Marietta" },
];

const ITEM_TYPE_META: { type: HandoverItemType; label: string; icon: React.ElementType; color: string }[] = [
  { type: "issue",    label: "Issue",     icon: AlertTriangle,  color: "text-red-500 border-red-200 bg-red-50" },
  { type: "note",     label: "Note",      icon: StickyNote,     color: "text-blue-500 border-blue-200 bg-blue-50" },
  { type: "followup", label: "Follow-up", icon: CornerDownRight, color: "text-yellow-600 border-yellow-200 bg-yellow-50" },
];

export default function NewHandoverNotePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const [locationId, setLocationId] = useState("");
  const [writtenBy,  setWrittenBy]  = useState("");
  const [fromShift,  setFromShift]  = useState<string>("morning");
  const [toShift,    setToShift]    = useState<string>("afternoon");
  const [summary,    setSummary]    = useState("");
  const [items,      setItems]      = useState<HandoverItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [newItemType, setNewItemType] = useState<HandoverItemType>("note");
  const [error, setError] = useState<string | null>(null);

  function addItem() {
    if (!newItemText.trim()) return;
    setItems((prev) => [...prev, { type: newItemType, text: newItemText.trim(), resolved: false }]);
    setNewItemText("");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    setError(null);
    if (!locationId || !writtenBy || !summary) {
      setError("Please fill in location, your name, and a summary.");
      return;
    }
    startTransition(async () => {
      const result = await createHandoverNote({ locationId, writtenBy, fromShift, toShift, summary, items });
      if ("error" in result) {
        setError(result.error);
      } else {
        setSubmitted(true);
        setTimeout(() => router.push("/dashboard/operations/handover"), 1500);
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Handover Note Submitted!</h2>
        <p className="text-gray-500 text-sm">The incoming team has been notified. Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/dashboard/operations/handover" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
        <ChevronLeft size={15} /> Back to Handover Notes
      </Link>

      <h2 className="text-xl font-bold text-gray-900">Write Shift Handover Note</h2>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-red-500">*</span></label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="">Select a location…</option>
            {LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Written by */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={writtenBy}
            onChange={(e) => setWrittenBy(e.target.value)}
            placeholder="e.g. Marcus J."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Shift handoff */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Handing Off (From)</label>
            <select
              value={fromShift}
              onChange={(e) => setFromShift(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="morning">Morning Shift</option>
              <option value="afternoon">Afternoon Shift</option>
              <option value="evening">Evening Shift</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Handing To</label>
            <select
              value={toShift}
              onChange={(e) => setToShift(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="morning">Morning Shift</option>
              <option value="afternoon">Afternoon Shift</option>
              <option value="evening">Evening Shift</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Shift Summary <span className="text-red-500">*</span></label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="How did the shift go? Any highlights, issues, or things the next team needs to know..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
      </div>

      {/* Add items */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Action Items & Notes</h3>
        <p className="text-sm text-gray-400 -mt-2">Add specific issues, notes, or follow-ups for the incoming team.</p>

        {/* Existing items */}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item, idx) => {
              const meta  = ITEM_TYPE_META.find((m) => m.type === item.type)!;
              const Icon  = meta.icon;
              return (
                <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-lg border ${meta.color}`}>
                  <Icon size={14} className="flex-shrink-0 mt-0.5" />
                  <p className="text-sm flex-1 leading-snug">{item.text}</p>
                  <button onClick={() => removeItem(idx)} className="flex-shrink-0 opacity-50 hover:opacity-100">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new item row */}
        <div className="flex gap-2">
          <select
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value as HandoverItemType)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 flex-shrink-0"
          >
            {ITEM_TYPE_META.map((m) => (
              <option key={m.type} value={m.type}>{m.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Describe the item..."
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={addItem}
            disabled={!newItemText.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 rounded-lg text-sm text-gray-700"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pb-6">
        <Link
          href="/dashboard/operations/handover"
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium"
        >
          {isPending
            ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
            : <><Send size={15} /> Submit Handover Note</>
          }
        </button>
      </div>
    </div>
  );
}
