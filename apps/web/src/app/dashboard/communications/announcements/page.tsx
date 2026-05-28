import Link from "next/link";
import { getAnnouncements } from "@/lib/communication/queries";
import { Megaphone, Pin, AlertTriangle, CheckCircle2, MapPin, Users, ArrowRight, Plus } from "lucide-react";
import type { AnnouncementWithDetails } from "@/types/communication";

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO: AnnouncementWithDetails[] = [
  { id: "an1", title: "New Summer Menu Launch — June 15", body: "All locations must update menu boards and POS by June 15. New items include the Peach Lemonade Freeze and the Summer BBQ Wrap. Training materials are in the SOP library.", author: "HQ", target_type: "all", target_location_id: null, priority: "urgent", is_pinned: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), locations: null, announcement_reads: [{ id: "r1", announcement_id: "an1", location_id: "a1", read_by: "Downtown Manager", read_at: "" }, { id: "r2", announcement_id: "an1", location_id: "a2", read_by: "Buckhead Manager", read_at: "" }] },
  { id: "an2", title: "Updated Food Safety Policy v2.3", body: "The revised Food Safety Policy (v2.3) is now live in the Documents library. All locations must complete acknowledgment by June 5.", author: "HQ", target_type: "all", target_location_id: null, priority: "urgent", is_pinned: false, created_at: new Date(Date.now() - 4 * 86400000).toISOString(), locations: null, announcement_reads: [{ id: "r3", announcement_id: "an2", location_id: "a1", read_by: "Downtown Manager", read_at: "" }, { id: "r4", announcement_id: "an2", location_id: "a3", read_by: "Midtown Manager", read_at: "" }] },
  { id: "an3", title: "Q2 Audit Schedule Released", body: "Q2 surprise audits will begin June 1. Locations will be notified 24 hours before. Review the inspection checklist in the SOP library to ensure readiness.", author: "HQ", target_type: "all", target_location_id: null, priority: "normal", is_pinned: false, created_at: new Date(Date.now() - 6 * 86400000).toISOString(), locations: null, announcement_reads: [] },
  { id: "an4", title: "Action Required: Decatur Compliance Issues", body: "Following the May 15 surprise audit at Decatur, immediate corrective action is required for 2 critical findings. Please review the Findings tab and submit resolution plans by May 30.", author: "HQ", target_type: "specific", target_location_id: "a4", priority: "urgent", is_pinned: false, created_at: new Date(Date.now() - 13 * 86400000).toISOString(), locations: { id: "a4", name: "Decatur" }, announcement_reads: [{ id: "r5", announcement_id: "an4", location_id: "a4", read_by: "Decatur Manager", read_at: "" }] },
] as unknown as AnnouncementWithDetails[];

const TOTAL_LOCATIONS = 6;

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
}

export default async function AnnouncementsPage() {
  let announcements: AnnouncementWithDetails[] = [];
  try { announcements = await getAnnouncements(); } catch { announcements = DEMO; }
  if (announcements.length === 0) announcements = DEMO;

  const pinned  = announcements.filter((a) => a.is_pinned);
  const unpinned = announcements.filter((a) => !a.is_pinned);
  const ordered = [...pinned, ...unpinned];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{announcements.length} announcement{announcements.length !== 1 ? "s" : ""}</p>
        <Link
          href="/dashboard/communications/announcements/new"
          className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg"
        >
          <Plus size={14} /> New
        </Link>
      </div>

      <div className="space-y-3">
        {ordered.map((ann) => {
          const readCount = ann.announcement_reads?.length ?? 0;
          const target = ann.target_type === "all" ? TOTAL_LOCATIONS : 1;

          return (
            <div
              key={ann.id}
              className={`bg-white border rounded-xl p-5 ${ann.is_pinned ? "border-brand-200 ring-1 ring-brand-100" : "border-gray-200"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${ann.priority === "urgent" ? "bg-red-50" : "bg-brand-50"}`}>
                  {ann.is_pinned
                    ? <Pin size={16} className="text-brand-600" />
                    : <Megaphone size={16} className={ann.priority === "urgent" ? "text-red-600" : "text-brand-600"} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {ann.is_pinned && (
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                        <Pin size={9} /> Pinned
                      </span>
                    )}
                    {ann.priority === "urgent" && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                        <AlertTriangle size={9} /> Urgent
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5 ${ann.target_type === "all" ? "bg-gray-100 text-gray-600" : "bg-purple-100 text-purple-700"}`}>
                      {ann.target_type === "all" ? <><Users size={9} /> All locations</> : <><MapPin size={9} /> {ann.locations?.name}</>}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">{timeAgo(ann.created_at)}</span>
                  </div>

                  <p className="font-semibold text-gray-900 text-sm mb-1">{ann.title}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{ann.body}</p>

                  {/* Read receipt */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${(readCount / target) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0 flex items-center gap-1">
                      {readCount === target
                        ? <><CheckCircle2 size={11} className="text-green-500" /> All read</>
                        : <>{readCount}/{target} locations read</>}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/dashboard/communications/announcements/${ann.id}`}
                  className="shrink-0 text-gray-300 hover:text-brand-500 transition-colors"
                >
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
