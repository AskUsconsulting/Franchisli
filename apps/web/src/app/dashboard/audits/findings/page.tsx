export const dynamic = "force-dynamic";

"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronRight, MessageSquare, XCircle, Zap, Calendar } from "lucide-react";
import { updateFindingStatus, addFindingComment } from "@/actions/audits";
import type { AuditFindingWithDetails, FindingStatus } from "@/types/audits";

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_FINDINGS: AuditFindingWithDetails[] = [
  {
    id: "f1", audit_id: "au3", item_id: "i1", location_id: "a4",
    description: "Failed: Food temperature log not maintained — items stored above safe temperature",
    severity: "critical", status: "open",
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    resolution: null, resolved_at: null,
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    locations: { id: "a4", name: "Decatur" },
    audits: { id: "au3", conducted_date: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0], audit_type: "surprise" },
    audit_items: { id: "i1", text: "Food temperature log maintained", is_critical: true },
    finding_updates: [],
  },
  {
    id: "f2", audit_id: "au3", item_id: "i2", location_id: "a4",
    description: "Failed: Handwashing station not stocked — soap and paper towels missing",
    severity: "critical", status: "in_review",
    due_date: new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0],
    resolution: null, resolved_at: null,
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    locations: { id: "a4", name: "Decatur" },
    audits: { id: "au3", conducted_date: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0], audit_type: "surprise" },
    audit_items: { id: "i2", text: "Handwashing stations stocked", is_critical: true },
    finding_updates: [
      { id: "u1", finding_id: "f2", author: "Third", note: "Restocked soap and paper towels, awaiting re-inspection.", status_change: "in_review", created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
    ],
  },
  {
    id: "f3", audit_id: "au3", item_id: "i3", location_id: "a4",
    description: "Failed: Visible grease buildup behind fryers and under prep tables",
    severity: "major", status: "open",
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    resolution: null, resolved_at: null,
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    locations: { id: "a4", name: "Decatur" },
    audits: { id: "au3", conducted_date: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0], audit_type: "surprise" },
    audit_items: { id: "i3", text: "Kitchen equipment cleaned properly", is_critical: false },
    finding_updates: [],
  },
  {
    id: "f4", audit_id: "au2", item_id: "i4", location_id: "a2",
    description: "Failed: Outdoor signage lighting out on east-facing unit",
    severity: "minor", status: "resolved",
    due_date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    resolution: "Replaced bulb and tested all exterior lighting.",
    resolved_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    locations: { id: "a2", name: "Buckhead" },
    audits: { id: "au2", conducted_date: new Date(Date.now() - 9 * 86400000).toISOString().split("T")[0], audit_type: "scheduled" },
    audit_items: { id: "i4", text: "Exterior signage illuminated", is_critical: false },
    finding_updates: [
      { id: "u2", finding_id: "f4", author: "Marki", note: "Replaced bulb and tested all exterior lighting.", status_change: "resolved", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
  },
  {
    id: "f5", audit_id: "au4", item_id: "i5", location_id: "a3",
    description: "Failed: Employee uniforms incomplete — two staff members without approved name tags",
    severity: "minor", status: "open",
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    resolution: null, resolved_at: null,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    locations: { id: "a3", name: "Midtown" },
    audits: { id: "au4", conducted_date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0], audit_type: "scheduled" },
    audit_items: { id: "i5", text: "Employee uniforms complete and correct", is_critical: false },
    finding_updates: [],
  },
] as unknown as AuditFindingWithDetails[];

// ── Helpers ───────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  major:    "bg-orange-100 text-orange-700",
  minor:    "bg-yellow-100 text-yellow-700",
};

const STATUS_STYLES: Record<string, string> = {
  open:      "bg-red-50 text-red-700 border border-red-200",
  in_review: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  resolved:  "bg-green-50 text-green-700 border border-green-200",
  escalated: "bg-purple-50 text-purple-700 border border-purple-200",
};

const STATUS_LABELS: Record<FindingStatus, string> = {
  open:      "Open",
  in_review: "In Review",
  resolved:  "Resolved",
  escalated: "Escalated",
};

function daysUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, red: true };
  if (days === 0) return { label: "Due today", red: true };
  return { label: `Due in ${days}d`, red: false };
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
}

// ── FindingCard ───────────────────────────────────────────────────────────────

function FindingCard({ finding }: { finding: AuditFindingWithDetails }) {
  const [expanded, setExpanded] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment]   = useState("");
  const [resolution, setResolution] = useState("");
  const [nextStatus, setNextStatus] = useState<FindingStatus | "">("");
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus]   = useState(finding.status);
  const [localUpdates, setLocalUpdates] = useState(finding.finding_updates ?? []);

  const due = finding.due_date ? daysUntil(finding.due_date) : null;

  function handleStatusUpdate(status: FindingStatus) {
    startTransition(async () => {
      await updateFindingStatus({
        findingId:  finding.id,
        status,
        author:     "Owner",
        note:       comment || `Status changed to ${STATUS_LABELS[status]}`,
        resolution: status === "resolved" ? resolution : undefined,
      });
      setLocalStatus(status);
      setLocalUpdates((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          finding_id: finding.id,
          author: "Owner",
          note: comment || `Status changed to ${STATUS_LABELS[status]}`,
          status_change: status,
          created_at: new Date().toISOString(),
        },
      ]);
      setComment("");
      setResolution("");
      setShowComment(false);
      setNextStatus("");
    });
  }

  function handleComment() {
    if (!comment.trim()) return;
    startTransition(async () => {
      await addFindingComment({ findingId: finding.id, author: "Owner", note: comment });
      setLocalUpdates((prev) => [
        ...prev,
        { id: `tmp-${Date.now()}`, finding_id: finding.id, author: "Owner", note: comment, status_change: null, created_at: new Date().toISOString() },
      ]);
      setComment("");
      setShowComment(false);
    });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header row */}
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="mt-0.5 shrink-0">
          {localStatus === "resolved" ? (
            <CheckCircle2 size={18} className="text-green-500" />
          ) : finding.severity === "critical" ? (
            <XCircle size={18} className="text-red-500" />
          ) : (
            <AlertTriangle size={18} className="text-orange-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${SEVERITY_STYLES[finding.severity] ?? "bg-gray-100 text-gray-600"}`}>
              {finding.severity}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[localStatus] ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[localStatus]}
            </span>
            <span className="text-xs text-gray-400">{finding.locations?.name}</span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              {finding.audits?.audit_type === "surprise" ? <Zap size={10} /> : <Calendar size={10} />}
              {timeAgo(finding.audits?.conducted_date ?? finding.created_at)}
            </span>
            {due && (
              <span className={`text-xs font-medium ${due.red ? "text-red-600" : "text-gray-500"}`}>
                {due.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800 font-medium leading-snug">{finding.description}</p>
          {localUpdates.length > 0 && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <MessageSquare size={10} /> {localUpdates.length} update{localUpdates.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="shrink-0 text-gray-400 mt-0.5">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Updates timeline */}
          {localUpdates.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity</p>
              {localUpdates.map((u) => (
                <div key={u.id} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gray-500">{u.author[0]}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{u.author}</span>
                      {u.status_change ? ` changed status to ${STATUS_LABELS[u.status_change as FindingStatus]}` : " added a comment"}
                      {" · "}{timeAgo(u.created_at)}
                    </p>
                    <p className="text-sm text-gray-700 mt-0.5">{u.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {finding.resolution && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-700 mb-1">Resolution</p>
              <p className="text-sm text-green-800">{finding.resolution}</p>
            </div>
          )}

          {/* Actions — only show if not resolved */}
          {localStatus !== "resolved" && (
            <div className="flex flex-wrap gap-2">
              {localStatus === "open" && (
                <button
                  disabled={isPending}
                  onClick={() => handleStatusUpdate("in_review")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 font-medium disabled:opacity-50"
                >
                  <Clock size={11} className="inline mr-1" /> Mark In Review
                </button>
              )}
              {(localStatus === "open" || localStatus === "in_review") && (
                <button
                  disabled={isPending}
                  onClick={() => { setNextStatus("resolved"); setShowComment(true); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-medium disabled:opacity-50"
                >
                  <CheckCircle2 size={11} className="inline mr-1" /> Mark Resolved
                </button>
              )}
              <button
                onClick={() => { setNextStatus(""); setShowComment((p) => !p); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 font-medium"
              >
                <MessageSquare size={11} className="inline mr-1" /> Add Comment
              </button>
            </div>
          )}

          {showComment && (
            <div className="space-y-2">
              {nextStatus === "resolved" && (
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how this was resolved…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
                  rows={2}
                />
              )}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a note…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  disabled={isPending}
                  onClick={() => {
                    if (nextStatus === "resolved") handleStatusUpdate("resolved");
                    else handleComment();
                  }}
                  className="text-xs px-4 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 font-medium disabled:opacity-50"
                >
                  {isPending ? "Saving…" : nextStatus === "resolved" ? "Confirm Resolved" : "Post Comment"}
                </button>
                <button
                  onClick={() => { setShowComment(false); setComment(""); setResolution(""); setNextStatus(""); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FindingsPage() {
  const [filter, setFilter] = useState<FindingStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const all = DEMO_FINDINGS;
  const visible = all.filter((f) => {
    if (filter !== "all" && f.status !== filter) return false;
    if (severityFilter !== "all" && f.severity !== severityFilter) return false;
    return true;
  });

  const open     = all.filter((f) => f.status === "open").length;
  const inReview = all.filter((f) => f.status === "in_review").length;
  const resolved = all.filter((f) => f.status === "resolved").length;
  const critical = all.filter((f) => f.severity === "critical" && f.status !== "resolved").length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open",       value: open,      color: "bg-red-50 text-red-600",    icon: XCircle },
          { label: "In Review",  value: inReview,  color: "bg-yellow-50 text-yellow-600", icon: Clock },
          { label: "Resolved",   value: resolved,  color: "bg-green-50 text-green-600",  icon: CheckCircle2 },
          { label: "Critical",   value: critical,  color: "bg-orange-50 text-orange-600", icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "open", "in_review", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filter === s ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
        <div className="ml-2 flex gap-2">
          {(["all", "critical", "major", "minor"] as const).map((sv) => (
            <button
              key={sv}
              onClick={() => setSeverityFilter(sv)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${severityFilter === sv ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              {sv === "all" ? "All severity" : sv}
            </button>
          ))}
        </div>
      </div>

      {/* Findings list */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">No findings match your filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((f) => (
            <FindingCard key={f.id} finding={f} />
          ))}
        </div>
      )}
    </div>
  );
}
