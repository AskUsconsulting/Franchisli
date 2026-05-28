"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { createThread } from "@/actions/communication";

const LOCATIONS = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Downtown Atlanta" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Buckhead" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Midtown" },
  { id: "a0000000-0000-0000-0000-000000000004", name: "Decatur" },
  { id: "a0000000-0000-0000-0000-000000000005", name: "Marietta" },
  { id: "a0000000-0000-0000-0000-000000000006", name: "Smyrna" },
];

export default function NewMessagePage() {
  const router = useRouter();
  const [locationId, setLocationId] = useState("");
  const [subject, setSubject]       = useState("");
  const [body, setBody]             = useState("");
  const [error, setError]           = useState("");
  const [isPending, startTransition] = useTransition();

  const valid = locationId && subject.trim() && body.trim();

  function handleSubmit() {
    if (!valid) return;
    startTransition(async () => {
      const result = await createThread({ subject, locationId, body, sender: "HQ" });
      if ("error" in result) { setError(result.error); return; }
      router.push("/dashboard/communications/messages");
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/communications/messages" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to messages
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="font-bold text-gray-900">New Message Thread</h2>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Location</label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
          >
            <option value="">Select a location…</option>
            {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Equipment maintenance request"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message to the location manager…"
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/communications/messages" className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={!valid || isPending}
            className="px-5 py-2 text-sm text-white bg-brand-500 hover:bg-brand-600 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={14} /> {isPending ? "Sending…" : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}
