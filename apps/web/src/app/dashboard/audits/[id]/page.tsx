import Link from "next/link";
import { getAuditById } from "@/lib/audits/queries";
import { CheckCircle2, XCircle, Minus, AlertTriangle, Calendar, Zap, ArrowLeft, User, MapPin, Star } from "lucide-react";
import type { AuditWithDetails } from "@/types/audits";

// ── Demo fallback ─────────────────────────────────────────────────────────────

const DEMO_AUDIT: AuditWithDetails = {
  id: "au3",
  template_id: "at1",
  location_id: "a4",
  auditor_name: "Third",
  audit_type: "surprise",
  status: "submitted",
  scheduled_date: null,
  conducted_date: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0],
  score: 74,
  grade: "C",
  critical_failures: 2,
  notes: "Multiple critical failures. Immediate action required.",
  submitted_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  audit_templates: { name: "Standard Franchise Inspection", category: "standard" },
  locations: { id: "a4", name: "Decatur" },
  audit_responses: [
    { id: "r1",  audit_id: "au3", item_id: "i1",  response: "fail", points_earned: 0,  notes: "Temperature log not updated for 3 days." },
    { id: "r2",  audit_id: "au3", item_id: "i2",  response: "fail", points_earned: 0,  notes: "Soap dispenser empty, no paper towels." },
    { id: "r3",  audit_id: "au3", item_id: "i3",  response: "fail", points_earned: 0,  notes: "Grease buildup under fryers." },
    { id: "r4",  audit_id: "au3", item_id: "i4",  response: "pass", points_earned: 5,  notes: "" },
    { id: "r5",  audit_id: "au3", item_id: "i5",  response: "pass", points_earned: 5,  notes: "" },
    { id: "r6",  audit_id: "au3", item_id: "i6",  response: "pass", points_earned: 5,  notes: "" },
    { id: "r7",  audit_id: "au3", item_id: "i7",  response: "pass", points_earned: 8,  notes: "" },
    { id: "r8",  audit_id: "au3", item_id: "i8",  response: "pass", points_earned: 8,  notes: "" },
    { id: "r9",  audit_id: "au3", item_id: "i9",  response: "pass", points_earned: 5,  notes: "" },
    { id: "r10", audit_id: "au3", item_id: "i10", response: "fail", points_earned: 0,  notes: "Outdoor signage light out." },
    { id: "r11", audit_id: "au3", item_id: "i11", response: "pass", points_earned: 5,  notes: "" },
    { id: "r12", audit_id: "au3", item_id: "i12", response: "pass", points_earned: 5,  notes: "" },
  ],
} as unknown as AuditWithDetails;

// Grouped section view for demo (mirrors the template structure)
const DEMO_SECTIONS = [
  {
    name: "Food Safety & Temperature",
    items: [
      { id: "i1", text: "Food temperature log maintained", is_critical: true,  points: 10 },
      { id: "i2", text: "Handwashing stations stocked",   is_critical: true,  points: 10 },
      { id: "i3", text: "Food stored at correct temps",   is_critical: true,  points: 10 },
      { id: "i4", text: "FIFO rotation followed",         is_critical: false, points: 5  },
      { id: "i5", text: "Expiration dates checked",       is_critical: false, points: 5  },
    ],
  },
  {
    name: "Cleanliness & Sanitation",
    items: [
      { id: "i6",  text: "Kitchen equipment cleaned properly", is_critical: false, points: 8 },
      { id: "i7",  text: "Floors, walls, ceilings clean",      is_critical: false, points: 5 },
      { id: "i8",  text: "Restrooms clean and stocked",        is_critical: false, points: 5 },
      { id: "i9",  text: "Trash disposed of regularly",        is_critical: false, points: 5 },
      { id: "i10", text: "Pest control evidence",              is_critical: false, points: 5 },
    ],
  },
  {
    name: "Brand Standards",
    items: [
      { id: "i11", text: "Uniforms complete and correct",  is_critical: false, points: 5 },
      { id: "i12", text: "Exterior signage illuminated",   is_critical: false, points: 5 },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100",
  B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100",
  D: "text-orange-700 bg-orange-100",
  F: "text-red-700 bg-red-100",
};

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AuditDetailPage({ params }: { params: { id: string } }) {
  let audit: AuditWithDetails | null = null;
  try {
    audit = await getAuditById(params.id);
  } catch {
    audit = null;
  }
  if (!audit) audit = DEMO_AUDIT;

  const responseMap = new Map(
    (audit.audit_responses ?? []).map((r) => [r.item_id, r])
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Link href="/dashboard/audits" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to audits
      </Link>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
              {audit.audit_templates?.name ?? "Audit"}
            </p>
            <h1 className="text-xl font-bold text-gray-900">{audit.locations?.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {audit.locations?.name}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={13} /> {audit.auditor_name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> {formatDate(audit.conducted_date)}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${audit.audit_type === "surprise" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                {audit.audit_type === "surprise" ? <><Zap size={10} /> Surprise</> : <><Calendar size={10} /> Scheduled</>}
              </span>
            </div>
          </div>

          {/* Score / grade */}
          <div className="text-center shrink-0">
            {audit.grade && (
              <span className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl text-3xl font-bold ${GRADE_COLORS[audit.grade] ?? "bg-gray-100 text-gray-600"}`}>
                {audit.grade}
              </span>
            )}
            <p className="text-2xl font-bold text-gray-900 mt-1">{audit.score}%</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">{audit.score}%</p>
            <p className="text-xs text-gray-500">Score</p>
          </div>
          <div className="text-center">
            <p className={`text-xl font-bold ${audit.critical_failures > 0 ? "text-red-600" : "text-green-600"}`}>
              {audit.critical_failures}
            </p>
            <p className="text-xs text-gray-500">Critical Failures</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">
              {(audit.audit_responses ?? []).filter((r) => r.response === "fail").length}
            </p>
            <p className="text-xs text-gray-500">Failed Items</p>
          </div>
        </div>

        {audit.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
            <span className="font-semibold">Auditor notes: </span>{audit.notes}
          </div>
        )}
      </div>

      {/* Sections */}
      {DEMO_SECTIONS.map((section) => {
        const sectionItems = section.items;
        const passCount = sectionItems.filter((item) => responseMap.get(item.id)?.response === "pass").length;
        const totalCount = sectionItems.length;

        return (
          <div key={section.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 text-sm">{section.name}</h2>
              <span className="text-xs text-gray-500">{passCount}/{totalCount} passed</span>
            </div>

            <div className="divide-y divide-gray-50">
              {sectionItems.map((item) => {
                const resp = responseMap.get(item.id);
                const response = resp?.response ?? null;

                return (
                  <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                    {/* Status icon */}
                    <div className="mt-0.5 shrink-0">
                      {response === "pass" ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : response === "fail" ? (
                        <XCircle size={16} className="text-red-500" />
                      ) : response === "na" ? (
                        <Minus size={16} className="text-gray-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${response === "fail" ? "text-red-800" : "text-gray-800"}`}>
                          {item.text}
                        </p>
                        {item.is_critical && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium flex items-center gap-0.5">
                            <AlertTriangle size={9} /> Critical
                          </span>
                        )}
                      </div>
                      {resp?.notes && (
                        <p className="text-xs text-gray-500 mt-0.5 italic">"{resp.notes}"</p>
                      )}
                    </div>

                    {/* Points */}
                    <div className="shrink-0 text-right">
                      <p className={`text-xs font-medium ${response === "pass" ? "text-green-600" : response === "fail" ? "text-red-500" : "text-gray-400"}`}>
                        {response === "pass"
                          ? `+${resp?.points_earned ?? item.points}`
                          : response === "na"
                          ? "N/A"
                          : response === "fail"
                          ? `0/${item.points}`
                          : `—/${item.points}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pb-4">
        <span>Submitted {formatDate(audit.submitted_at)}</span>
        <span className="flex items-center gap-1"><Star size={11} /> {audit.audit_templates?.category} audit</span>
      </div>
    </div>
  );
}
