import Link from "next/link";
import { getHandoverNotes } from "@/lib/operations/queries";
import { Plus, MapPin, AlertTriangle, StickyNote, CornerDownRight, CheckCircle2, Mail, MailOpen } from "lucide-react";
import { markHandoverNoteRead } from "@/actions/operations";
import type { ShiftHandoverNote } from "@/types/operations";

const ITEM_ICONS: Record<string, React.ElementType> = {
  issue:    AlertTriangle,
  note:     StickyNote,
  followup: CornerDownRight,
};
const ITEM_COLORS: Record<string, string> = {
  issue:    "text-red-500 bg-red-50",
  note:     "text-blue-500 bg-blue-50",
  followup: "text-yellow-600 bg-yellow-50",
};

type NoteWithLocation = Awaited<ReturnType<typeof getHandoverNotes>>[number];

const DEMO_NOTES: NoteWithLocation[] = [
  {
    id: "h1", location_id: "a1", written_by: "Marcus J.", from_shift: "evening", to_shift: "morning",
    date: new Date().toISOString().split("T")[0],
    summary: "Smooth close. POS Printer on register 2 is jamming intermittently — tech coming tomorrow. Cash reconciled, $2 overage documented.",
    items: [
      { type: "issue",    text: "POS Printer (Register 2) jamming — service call booked for tomorrow 10am", resolved: false },
      { type: "note",     text: "Customer group of 12 arriving 11am — confirm reservation setup", resolved: false },
      { type: "followup", text: "Reach out to beverage supplier re: delayed order", resolved: false },
    ],
    is_read: false, read_at: null, created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    locations: { id: "a1", name: "Downtown Atlanta", address: null, region: "Metro Atlanta", status: "active", created_at: "" },
  },
  {
    id: "h2", location_id: "a2", written_by: "Sandra K.", from_shift: "evening", to_shift: "morning",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    summary: "Great day — hit daily target. Restroom sink in unit 2 is draining slowly, submitted maintenance request.",
    items: [
      { type: "issue",    text: "Restroom sink draining slowly — maintenance request #2241 submitted", resolved: false },
      { type: "note",     text: "New staff member Maya starts Monday — paperwork in the manager folder", resolved: false },
    ],
    is_read: true, read_at: new Date(Date.now() - 7200000).toISOString(), created_at: new Date(Date.now() - 86400000 - 3600000).toISOString(),
    locations: { id: "a2", name: "Buckhead", address: null, region: "Metro Atlanta", status: "active", created_at: "" },
  },
  {
    id: "h3", location_id: "a4", written_by: "Tanya R.", from_shift: "afternoon", to_shift: "evening",
    date: new Date().toISOString().split("T")[0],
    summary: "Slow afternoon. Health inspector visited unannounced — passed but noted temperature log needs more detail.",
    items: [
      { type: "issue",    text: "Health inspector flagged temperature log detail — update format ASAP", resolved: false },
      { type: "followup", text: "Review and update temp logging procedure with all staff this week", resolved: false },
      { type: "note",     text: "Freezer unit running slightly warm (2°F above spec) — monitoring", resolved: false },
    ],
    is_read: false, read_at: null, created_at: new Date(Date.now() - 3600000).toISOString(),
    locations: { id: "a4", name: "Decatur", address: null, region: "Metro Atlanta", status: "active", created_at: "" },
  },
];

const SHIFT_LABELS: Record<string, string> = { morning: "Morning", afternoon: "Afternoon", evening: "Evening" };

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1)  return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function HandoverPage() {
  let notes: NoteWithLocation[] = [];
  try {
    notes = await getHandoverNotes();
  } catch {
    notes = DEMO_NOTES;
  }
  if (notes.length === 0) notes = DEMO_NOTES;

  const unreadCount = notes.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{notes.length} notes</p>
          {unreadCount > 0 && (
            <span className="bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">{unreadCount} unread</span>
          )}
        </div>
        <Link
          href="/dashboard/operations/handover/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={15} /> Write Handover Note
        </Link>
      </div>

      {/* Notes feed */}
      <div className="space-y-3">
        {notes.map((note) => {
          const issues    = note.items.filter((i) => i.type === "issue");
          const followups = note.items.filter((i) => i.type === "followup");
          const noteItems = note.items.filter((i) => i.type === "note");
          return (
            <div
              key={note.id}
              className={`bg-white rounded-xl border transition-colors ${note.is_read ? "border-gray-200" : "border-brand-300 shadow-sm"}`}
            >
              {/* Note header */}
              <div className="px-5 py-4 flex items-start justify-between border-b border-gray-50">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${note.is_read ? "bg-gray-400" : "bg-brand-500"}`}>
                    {note.written_by.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{note.written_by}</span>
                      <span className="text-xs text-gray-400">handed off</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {SHIFT_LABELS[note.from_shift]} → {SHIFT_LABELS[note.to_shift]}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={11} />
                        {note.locations?.name}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(note.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {note.is_read
                    ? <MailOpen size={15} className="text-gray-300" />
                    : <Mail size={15} className="text-brand-500" />
                  }
                  {!note.is_read && (
                    <form action={async () => { "use server"; await markHandoverNoteRead(note.id); }}>
                      <button type="submit" className="text-xs text-brand-500 hover:text-brand-600 border border-brand-200 px-2 py-1 rounded">
                        Mark read
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 leading-relaxed">{note.summary}</p>

                {/* Items */}
                {note.items.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {note.items.map((item, idx) => {
                      const Icon  = ITEM_ICONS[item.type] ?? StickyNote;
                      const color = ITEM_COLORS[item.type] ?? "text-gray-500 bg-gray-50";
                      return (
                        <div key={idx} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${color.split(" ")[1]}`}>
                          <Icon size={13} className={`${color.split(" ")[0]} flex-shrink-0 mt-0.5`} />
                          <p className={`text-xs leading-snug flex-1 ${item.resolved ? "line-through opacity-50" : ""}`}>{item.text}</p>
                          {item.resolved && <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Item type counts */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-400">
                  {issues.length > 0    && <span className="flex items-center gap-1 text-red-500"><AlertTriangle size={11} /> {issues.length} issue{issues.length > 1 ? "s" : ""}</span>}
                  {followups.length > 0 && <span className="flex items-center gap-1 text-yellow-600"><CornerDownRight size={11} /> {followups.length} follow-up{followups.length > 1 ? "s" : ""}</span>}
                  {noteItems.length > 0 && <span className="flex items-center gap-1 text-blue-500"><StickyNote size={11} /> {noteItems.length} note{noteItems.length > 1 ? "s" : ""}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
