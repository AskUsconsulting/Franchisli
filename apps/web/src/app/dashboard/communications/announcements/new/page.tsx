"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, AlertTriangle, Users, MapPin } from "lucide-react";
import Link from "next/link";
import { createAnnouncement } from "@/actions/communication";

const LOCATIONS = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Downtown Atlanta" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Buckhead" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Midtown" },
  { id: "a0000000-0000-0000-0000-000000000004", name: "Decatur" },
  { id: "a0000000-0000-0000-0000-000000000005", name: "Marietta" },
  { id: "a0000000-0000-0000-0000-000000000006", name: "Smyrna" },
];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [title, setTitle]           = useState("");
  const [body, setBody]             = useState("");
  const [priority, setPriority]     = useState<"normal" | "urgent">("normal");
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [locationId, setLocationId] = useState("");
  const [isPinned, setIsPinned]     = useState(false);
  const [error, setError]           = useState("");
  const [isPending, startTransition] = useTransition();

  const valid = title.trim() && body.trim() && (targetType === "all" || locationId);

  function handleSubmit() {
    if (!valid) return;
    startTransition(async () => {
      const result = await createAnnouncement({
        title,
        body,
        author:           "HQ",
        targetType,
        targetLocationId: targetType === "specific" ? locationId : null,
        priority,
        isPinned,
      });
      if ("error" in result) { setError(result.error); return; }
      router.push("/dashboard/communications/announcements");
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/communications/announcements" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to announcements
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-bold text-gray-900">New Announcement</h2>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Priority</label>
          <div className="flex gap-3">
            {(["normal", "urgent"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                  priority === p
                    ? p === "urgent" ? "bg-red-50 border-red-300 text-red-700" : "bg-brand-50 border-brand-300 text-brand-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p === "urgent" && <AlertTriangle size={14} />}
                {p === "normal" ? "Normal" : "Urgent"}
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Send to</label>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setTargetType("all")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${targetType === "all" ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <Users size={14} /> All locations
            </button>
            <button
              onClick={() => setTargetType("specific")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${targetType === "specific" ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <MapPin size={14} /> Specific location
            </button>
          </div>
          {targetType === "specific" && (
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
            >
              <option value="">Select a location…</option>
              {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Updated Food Safety Policy"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement here…"
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {/* Options */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500"
          />
          <span className="text-sm text-gray-700">Pin this announcement to the top of the feed</span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/communications/announcements" className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={!valid || isPending}
            className="px-5 py-2 text-sm text-white bg-brand-500 hover:bg-brand-600 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={14} /> {isPending ? "Sending…" : "Send Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
}
