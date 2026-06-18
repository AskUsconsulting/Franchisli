"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ClipboardCheck, FileText, DollarSign, CheckCircle2, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { addLocation } from "@/app/actions/locations";
import { addTask } from "@/app/actions/tasks";
import Link from "next/link";

export default function QuickActions() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleAddLocation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await addLocation(fd);
    setSaved(true);
    router.refresh();
    setTimeout(() => { setSaved(false); setSaving(false); setActiveModal(null); }, 1200);
  }

  async function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await addTask({
      title:    fd.get("title") as string,
      assignee: fd.get("assignee") as string,
      location: fd.get("location") as string,
      due:      fd.get("due") as string,
      priority: fd.get("priority") as string,
      category: fd.get("category") as string,
    });
    setSaved(true);
    router.refresh();
    setTimeout(() => { setSaved(false); setSaving(false); setActiveModal(null); }, 1200);
  }

  const ACTIONS = [
    { label: "Add Location",  icon: MapPin,         color: "border-blue-200 text-blue-600 hover:bg-blue-50",      modal: "location" },
    { label: "Conduct Audit", icon: ClipboardCheck, color: "border-yellow-200 text-yellow-700 hover:bg-yellow-50", href: "/dashboard/audits/conduct" },
    { label: "Add Task",      icon: FileText,        color: "border-gray-200 text-gray-600 hover:bg-gray-50",      modal: "task" },
    { label: "Reports",       icon: DollarSign,     color: "border-emerald-200 text-emerald-600 hover:bg-emerald-50", href: "/dashboard/reports" },
  ];

  return (
    <>
      {/* Add Location Modal */}
      <Modal open={activeModal === "location"} onClose={() => setActiveModal(null)} title="Add Location">
        <form onSubmit={handleAddLocation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Location Name *</label>
            <input name="name" required type="text" placeholder="e.g. Downtown Norman"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Address</label>
            <input name="address" type="text" placeholder="123 Main St, Norman, OK"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Manager</label>
              <input name="manager_name" type="text" placeholder="Jane Smith"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
              <select name="status" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 bg-white">
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <Btn saving={saving} saved={saved} label="Add Location" />
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal open={activeModal === "task"} onClose={() => setActiveModal(null)} title="New Task">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Task Title *</label>
            <input name="title" required type="text" placeholder="e.g. Complete food safety cert"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Assignee</label>
              <input name="assignee" type="text" placeholder="Name"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Location</label>
              <input name="location" type="text" placeholder="Location name"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Due Date *</label>
              <input name="due" required type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Priority</label>
              <select name="priority" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 bg-white">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
            <select name="category" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 bg-white">
              {["Operations","Compliance","Audit","Training","Maintenance","Legal","Reporting"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Btn saving={saving} saved={saved} label="Create Task" />
        </form>
      </Modal>

      {/* Quick actions bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {ACTIONS.map(({ label, icon: Icon, color, modal, href }) =>
            href ? (
              <Link key={label} href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${color}`}>
                <Icon size={15} /> {label}
              </Link>
            ) : (
              <button key={label} onClick={() => setActiveModal(modal ?? null)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${color}`}>
                <Icon size={15} /> {label}
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}

function Btn({ saving, saved, label }: { saving: boolean; saved: boolean; label: string }) {
  return (
    <button type="submit" disabled={saving || saved}
      className={`w-full font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${saved ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-70"}`}>
      {saved ? <><CheckCircle2 size={15} /> Done!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : label}
    </button>
  );
}
