"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, MapPin, TrendingUp, TrendingDown, Star, AlertTriangle,
  MoreHorizontal, Plus, Phone, Mail, CheckCircle2, Loader2,
} from "lucide-react";
import Modal from "@/components/Modal";
import { addFranchisee } from "@/app/actions/franchisees";

interface Franchisee {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  join_date: string | null;
  status: string;
  compliance_score: number;
}

const STATUS_STYLES: Record<string, string> = {
  active:     "bg-green-100 text-green-700",
  attention:  "bg-red-100 text-red-700",
  onboarding: "bg-blue-100 text-blue-700",
  inactive:   "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  active:     "Active",
  attention:  "Needs Attention",
  onboarding: "Onboarding",
  inactive:   "Inactive",
};

const AVATAR_COLORS = ["bg-blue-500","bg-purple-500","bg-green-500","bg-orange-500","bg-indigo-500","bg-pink-500","bg-teal-500","bg-red-500"];

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name: string) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

function formatJoin(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function FranchiseesClient({ initialList, usingDemo }: { initialList: Franchisee[]; usingDemo: boolean }) {
  const router = useRouter();
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);
  const [error,  setError]  = useState("");
  const [form,   setForm]   = useState({ name: "", email: "", phone: "", locations: "", joinDate: "" });

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const result = await addFranchisee(form);
    if (result?.error) { setError(result.error); setSaving(false); return; }
    setDone(true);
    router.refresh();
    setTimeout(() => { setDone(false); setOpen(false); setForm({ name: "", email: "", phone: "", locations: "", joinDate: "" }); }, 1400);
    setSaving(false);
  }

  const needsAttention = initialList.filter(f => f.status === "attention").length;
  const avgCompliance  = initialList.length
    ? Math.round(initialList.reduce((s, f) => s + f.compliance_score, 0) / initialList.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Add Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Franchisee">
        <form onSubmit={handleAdd} className="space-y-4">
          {[
            { label: "Full Name",   key: "name",      type: "text",  placeholder: "Jane Smith",              required: true },
            { label: "Email",       key: "email",     type: "email", placeholder: "jane@franchise.com",      required: false },
            { label: "Phone",       key: "phone",     type: "tel",   placeholder: "+1 (404) 555-0100",       required: false },
            { label: "Join Date",   key: "joinDate",  type: "date",  placeholder: "",                        required: false },
          ].map(({ label, key, type, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input type={type} required={required} placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={e => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
          ))}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={saving || done}
            className={`w-full font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${done ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-70"}`}>
            {done ? <><CheckCircle2 size={15} /> Added!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : "Add Franchisee"}
          </button>
        </form>
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franchisees</h1>
          <p className="text-sm text-gray-500 mt-1">
            {usingDemo ? "Showing sample data — add your first real franchisee below" : `${initialList.length} franchisee${initialList.length !== 1 ? "s" : ""} in your network`}
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Franchisee
        </button>
      </div>

      {usingDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          📋 <strong>Sample data</strong> — Click <strong>Add Franchisee</strong> to add your real franchisees.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Franchisees", value: initialList.length, icon: Users,        color: "bg-blue-50 text-blue-600" },
          { label: "Avg Compliance",    value: `${avgCompliance}%`, icon: Star,         color: "bg-green-50 text-green-600" },
          { label: "Needs Attention",   value: needsAttention,      icon: AlertTriangle, color: "bg-red-50 text-red-600" },
          { label: "Onboarding",        value: initialList.filter(f => f.status === "onboarding").length, icon: MapPin, color: "bg-purple-50 text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {needsAttention > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-800">{needsAttention} franchisee{needsAttention > 1 ? "s" : ""} need{needsAttention === 1 ? "s" : ""} immediate attention</p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {initialList.map(f => (
          <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${avatarColor(f.full_name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {initials(f.full_name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{f.full_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Since {formatJoin(f.join_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[f.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[f.status] ?? f.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            {/* Compliance */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500 font-medium">Compliance Score</span>
                <div className="flex items-center gap-1">
                  <TrendingUp size={12} className="text-green-500" />
                  <span className={`text-sm font-bold ${f.compliance_score >= 90 ? "text-green-600" : f.compliance_score >= 80 ? "text-yellow-600" : "text-red-600"}`}>
                    {f.compliance_score}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${f.compliance_score >= 90 ? "bg-green-500" : f.compliance_score >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${f.compliance_score}%` }} />
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              {f.email && (
                <a href={`mailto:${f.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors">
                  <Mail size={13} /> {f.email}
                </a>
              )}
              {f.phone && (
                <a href={`tel:${f.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 transition-colors ml-auto">
                  <Phone size={13} /> {f.phone}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
