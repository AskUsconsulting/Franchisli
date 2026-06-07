"use client";

import { useState, useRef } from "react";
import { Plus, CheckCircle2, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import { addLocation } from "@/app/actions/locations";
import { useRouter } from "next/navigation";

const STATUSES = ["active", "onboarding", "inactive"];

export default function AddLocationModal() {
  const router = useRouter();
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);
  const [error,  setError]  = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await addLocation(fd);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    } else {
      setDone(true);
      router.refresh();
      setTimeout(() => { setDone(false); setOpen(false); formRef.current?.reset(); }, 1400);
    }
    setSaving(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
      >
        <Plus size={16} /> Add Location
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Location">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Location Name <span className="text-red-500">*</span></label>
            <input name="name" required type="text" placeholder="e.g. Downtown Atlanta"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Address</label>
            <input name="address" type="text" placeholder="123 Main St, Atlanta, GA 30303"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Manager Name</label>
              <input name="manager_name" type="text" placeholder="Jane Smith"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
              <input name="phone" type="tel" placeholder="(404) 555-0100"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
            <select name="status" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 bg-white capitalize">
              {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving || done}
            className={`w-full font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${done ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-70"}`}>
            {done ? <><CheckCircle2 size={15} /> Added!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : "Add Location"}
          </button>
        </form>
      </Modal>
    </>
  );
}
