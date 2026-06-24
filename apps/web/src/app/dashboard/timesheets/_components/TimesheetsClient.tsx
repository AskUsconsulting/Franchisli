"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Plus, CheckCircle2, XCircle, Loader2, Calendar } from "lucide-react";
import Modal from "@/components/Modal";
import { submitTimesheet, setTimesheetStatus } from "@/app/actions/timesheets";

interface Timesheet {
  id: string;
  employee_name: string | null;
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  hours: number | null;
  notes: string | null;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-yellow-100 text-yellow-700",
  approved:  "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
};

export default function TimesheetsClient({ sheets, role }: { sheets: Timesheet[]; role: "owner" | "manager" | "employee" }) {
  const router = useRouter();
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);
  const [error,  setError]  = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError("");
    const result = await submitTimesheet(new FormData(e.currentTarget));
    if (result?.error) { setError(result.error); setSaving(false); return; }
    setDone(true);
    router.refresh();
    setTimeout(() => { setDone(false); setOpen(false); setSaving(false); }, 1300);
  }

  async function review(id: string, status: "approved" | "rejected") {
    await setTimesheetStatus(id, status);
    router.refresh();
  }

  const totalHours = sheets.reduce((s, t) => s + (t.hours ?? 0), 0);
  const pending    = sheets.filter(t => t.status === "submitted").length;
  const approved   = sheets.filter(t => t.status === "approved").length;
  const today      = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Submit modal (employee only) */}
      <Modal open={open} onClose={() => setOpen(false)} title="Log Hours">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Date <span className="text-red-500">*</span></label>
            <input name="work_date" type="date" required defaultValue={today}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Clock In <span className="text-red-500">*</span></label>
              <input name="clock_in" type="time" required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Clock Out <span className="text-red-500">*</span></label>
              <input name="clock_out" type="time" required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Notes</label>
            <input name="notes" type="text" placeholder="Optional"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving || done}
            className={`w-full font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${done ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-70"}`}>
            {done ? <><CheckCircle2 size={15} /> Submitted!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Submitting...</> : "Submit Timesheet"}
          </button>
        </form>
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-sm text-gray-500 mt-1">
            {role === "employee" ? "Log your hours and track your submissions" : "Review and approve employee hours"}
          </p>
        </div>
        {role === "employee" && (
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
            <Plus size={16} /> Log Hours
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Hours",   value: totalHours.toFixed(1), icon: Clock,        color: "bg-blue-50 text-blue-600" },
          { label: "Pending",       value: pending,               icon: Calendar,     color: "bg-yellow-50 text-yellow-600" },
          { label: "Approved",      value: approved,              icon: CheckCircle2, color: "bg-green-50 text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {sheets.length === 0 ? (
          <div className="py-16 text-center">
            <Clock size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-500 mb-1">No timesheets yet</p>
            <p className="text-sm text-gray-400">
              {role === "employee" ? "Click \"Log Hours\" to submit your first timesheet" : "Employee timesheets will appear here"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                {role === "owner" && <th className="text-left px-5 py-3 font-medium">Employee</th>}
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">In</th>
                <th className="text-left px-4 py-3 font-medium">Out</th>
                <th className="text-center px-4 py-3 font-medium">Hours</th>
                <th className="text-left px-4 py-3 font-medium">Notes</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                {role === "owner" && <th className="text-right px-5 py-3 font-medium">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sheets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  {role === "owner" && <td className="px-5 py-3 font-medium text-gray-800">{t.employee_name ?? "—"}</td>}
                  <td className="px-5 py-3 text-gray-700">{t.work_date}</td>
                  <td className="px-4 py-3 text-gray-500">{t.clock_in ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{t.clock_out ?? "—"}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">{t.hours ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">{t.notes ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[t.status] ?? "bg-gray-100 text-gray-600"}`}>{t.status}</span>
                  </td>
                  {role === "owner" && (
                    <td className="px-5 py-3 text-right">
                      {t.status === "submitted" ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => review(t.id, "approved")} className="text-green-600 hover:text-green-700" title="Approve"><CheckCircle2 size={17} /></button>
                          <button onClick={() => review(t.id, "rejected")} className="text-red-500 hover:text-red-600" title="Reject"><XCircle size={17} /></button>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
