import Link from "next/link";
import { getRecentAudits } from "@/lib/audits/queries";
import { CheckCircle2, AlertTriangle, Clock, Calendar, Zap, ArrowRight, Star } from "lucide-react";
import type { AuditWithDetails } from "@/types/audits";

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100",
  B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100",
  D: "text-orange-700 bg-orange-100",
  F: "text-red-700 bg-red-100",
};

const DEMO_AUDITS: AuditWithDetails[] = [
  { id: "au1", template_id: "at1", location_id: "a1", auditor_name: "Marki", audit_type: "scheduled", status: "submitted", scheduled_date: null, conducted_date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],  score: 97, grade: "A", critical_failures: 0, notes: null, submitted_at: new Date(Date.now() - 7 * 86400000).toISOString(), created_at: "", audit_templates: { name: "Standard Franchise Inspection", category: "standard" }, locations: { id: "a1", name: "Downtown Atlanta" }, audit_responses: [] },
  { id: "au2", template_id: "at1", location_id: "a2", auditor_name: "Marki", audit_type: "scheduled", status: "submitted", scheduled_date: null, conducted_date: new Date(Date.now() - 9 * 86400000).toISOString().split("T")[0],  score: 91, grade: "A", critical_failures: 0, notes: null, submitted_at: new Date(Date.now() - 9 * 86400000).toISOString(), created_at: "", audit_templates: { name: "Standard Franchise Inspection", category: "standard" }, locations: { id: "a2", name: "Buckhead" }, audit_responses: [] },
  { id: "au3", template_id: "at1", location_id: "a4", auditor_name: "Third", audit_type: "surprise",  status: "submitted", scheduled_date: null, conducted_date: new Date(Date.now() - 13 * 86400000).toISOString().split("T")[0], score: 74, grade: "C", critical_failures: 2, notes: "Multiple critical failures. Immediate action required.", submitted_at: new Date(Date.now() - 13 * 86400000).toISOString(), created_at: "", audit_templates: { name: "Standard Franchise Inspection", category: "standard" }, locations: { id: "a4", name: "Decatur" }, audit_responses: [] },
  { id: "au4", template_id: "at1", location_id: "a3", auditor_name: "Marki", audit_type: "scheduled", status: "submitted", scheduled_date: null, conducted_date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0], score: 88, grade: "B", critical_failures: 0, notes: null, submitted_at: new Date(Date.now() - 14 * 86400000).toISOString(), created_at: "", audit_templates: { name: "Standard Franchise Inspection", category: "standard" }, locations: { id: "a3", name: "Midtown" }, audit_responses: [] },
  { id: "au5", template_id: "at1", location_id: "a5", auditor_name: "Third", audit_type: "scheduled", status: "submitted", scheduled_date: null, conducted_date: new Date(Date.now() - 20 * 86400000).toISOString().split("T")[0], score: 95, grade: "A", critical_failures: 0, notes: null, submitted_at: new Date(Date.now() - 20 * 86400000).toISOString(), created_at: "", audit_templates: { name: "Standard Franchise Inspection", category: "standard" }, locations: { id: "a5", name: "Marietta" }, audit_responses: [] },
] as unknown as AuditWithDetails[];

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
}

export default async function AuditsOverviewPage() {
  let audits: AuditWithDetails[] = [];
  try { audits = await getRecentAudits(); } catch { audits = DEMO_AUDITS; }
  if (audits.length === 0) audits = DEMO_AUDITS;

  const submitted   = audits.filter((a) => a.status === "submitted");
  const avgScore    = submitted.length > 0 ? Math.round(submitted.reduce((s, a) => s + (a.score ?? 0), 0) / submitted.length) : 0;
  const critical    = audits.filter((a) => a.critical_failures > 0).length;
  const thisMonth   = audits.filter((a) => { const d = new Date(a.conducted_date ?? a.created_at); return d.getMonth() === new Date().getMonth(); }).length;

  const stats = [
    { label: "Audits This Month", value: thisMonth,       icon: Calendar,      color: "bg-blue-50 text-blue-600" },
    { label: "Average Score",     value: `${avgScore}%`,  icon: Star,          color: "bg-green-50 text-green-600" },
    { label: "With Critical Issues", value: critical,     icon: AlertTriangle, color: "bg-red-50 text-red-600" },
    { label: "Total Completed",   value: submitted.length, icon: CheckCircle2,  color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming scheduled */}
      <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-brand-600" />
            <div>
              <p className="font-semibold text-brand-800">Upcoming Scheduled Audits</p>
              <p className="text-sm text-brand-600 mt-0.5">Midtown — Jun 2 · Marietta — Jun 5 · Buckhead — Jun 10</p>
            </div>
          </div>
          <Link href="/dashboard/audits/conduct" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            Start one now <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Recent audits table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Audits</h2>
          <Link href="/dashboard/audits/scores" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">View scores <ArrowRight size={12} /></Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
              <th className="text-left px-5 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Auditor</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-center px-4 py-3 font-medium">Score</th>
              <th className="text-center px-4 py-3 font-medium">Grade</th>
              <th className="text-center px-4 py-3 font-medium">Critical</th>
              <th className="text-right px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {audits.map((audit) => (
              <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 font-medium text-gray-800">{audit.locations?.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${audit.audit_type === "surprise" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                    {audit.audit_type === "surprise" ? <><Zap size={10} /> Surprise</> : <><Calendar size={10} /> Scheduled</>}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{audit.auditor_name}</td>
                <td className="px-4 py-3 text-gray-500">{timeAgo(audit.conducted_date ?? audit.created_at)}</td>
                <td className="px-4 py-3 text-center">
                  {audit.score !== null ? (
                    <span className={`font-bold ${audit.score >= 90 ? "text-green-600" : audit.score >= 80 ? "text-blue-600" : audit.score >= 70 ? "text-yellow-600" : "text-red-600"}`}>{audit.score}%</span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {audit.grade ? (
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${GRADE_COLORS[audit.grade] ?? "bg-gray-100 text-gray-600"}`}>{audit.grade}</span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {audit.critical_failures > 0
                    ? <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium"><AlertTriangle size={11} />{audit.critical_failures}</span>
                    : <CheckCircle2 size={15} className="text-green-400 mx-auto" />}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/dashboard/audits/${audit.id}`} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 justify-end">
                    View <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
