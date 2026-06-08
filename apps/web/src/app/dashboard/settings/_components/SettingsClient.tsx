"use client";

import { useState, useEffect } from "react";
import {
  User, Building2, Bell, Shield, Users, ChevronRight,
  CheckCircle2, Plus, Eye, EyeOff, Loader2, Trash2,
} from "lucide-react";
import { updateProfile, resetPassword, inviteEmployee } from "@/app/actions/auth";

const TABS = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "organization",  label: "Organization",  icon: Building2 },
  { id: "team",          label: "Team & Access", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security",      label: "Security",      icon: Shield },
];

interface UserData {
  email: string;
  full_name: string;
  business_name: string;
  role: string;
}

/* ── Profile Tab ──────────────────────────────────────────────────────────── */
function ProfileTab({ user }: { user: UserData }) {
  const initials = user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold">{initials}</div>
        <div>
          <p className="text-sm font-semibold text-brand-600 hover:text-brand-700 cursor-pointer">Change photo</p>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>
      <form action={updateProfile} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input name="full_name" type="text" defaultValue={user.full_name}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
            <input name="email" type="email" defaultValue={user.email}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Business / Franchise Name</label>
            <input name="business_name" type="text" defaultValue={user.business_name}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>
        </div>
        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
          Save Changes
        </button>
      </form>
    </div>
  );
}

/* ── Organization Tab ─────────────────────────────────────────────────────── */
function OrganizationTab({ user }: { user: UserData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Organization</h2>
        <p className="text-sm text-gray-500 mt-1">Your franchise brand and business details</p>
      </div>
      <form action={updateProfile} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Franchise / Business Name</label>
          <input name="business_name" type="text" defaultValue={user.business_name} placeholder="Smith Franchise Group"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
        </div>
        <input type="hidden" name="full_name" value={user.full_name} />
        <input type="hidden" name="email" value={user.email} />
        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
          Save Changes
        </button>
      </form>
    </div>
  );
}

/* ── Team Tab ─────────────────────────────────────────────────────────────── */
function TeamTab() {
  const [showInvite, setShowInvite]   = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName,  setInviteName]  = useState("");
  const [sending,     setSending]     = useState(false);
  const [sentMsg,     setSentMsg]     = useState("");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const fd = new FormData();
    fd.append("email", inviteEmail);
    fd.append("full_name", inviteName);
    await inviteEmployee(fd);
    setSentMsg(`Invite sent to ${inviteEmail}`);
    setInviteEmail(""); setInviteName(""); setSending(false);
    setTimeout(() => setSentMsg(""), 4000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team & Access</h2>
          <p className="text-sm text-gray-500 mt-1">Invite employees to access their location dashboard</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
          <Plus size={15} /> Invite Employee
        </button>
      </div>

      {sentMsg && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
          <CheckCircle2 size={15} /> {sentMsg}
        </div>
      )}

      {showInvite && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-brand-900 mb-3">Invite a team member</p>
          <form onSubmit={handleInvite} className="space-y-3">
            <input type="text" required value={inviteName} onChange={e => setInviteName(e.target.value)}
              placeholder="Full name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            <div className="flex gap-3">
              <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="employee@yourfranchise.com"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <button type="submit" disabled={sending}
                className="bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-70">
                {sending ? <Loader2 size={14} className="animate-spin" /> : null} Send
              </button>
            </div>
          </form>
          <p className="text-xs text-brand-600 mt-2">They&apos;ll receive an email with a link to create their account.</p>
        </div>
      )}
    </div>
  );
}

/* ── Notifications Tab ────────────────────────────────────────────────────── */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    auditCompleted: true, auditFailed: true, taskOverdue: true,
    taskAssigned: false, weeklyReport: true, complianceAlert: true,
  });
  const NOTIFS = [
    { key: "auditCompleted",  label: "Audit Completed",       desc: "When a franchisee submits an audit report" },
    { key: "auditFailed",     label: "Audit Critical Failure", desc: "When an audit has critical failures or scores below 80%" },
    { key: "taskOverdue",     label: "Task Overdue",           desc: "When a task passes its due date without completion" },
    { key: "taskAssigned",    label: "Task Assigned to You",   desc: "When a task is assigned directly to you" },
    { key: "weeklyReport",    label: "Weekly Summary Report",  desc: "A weekly digest of network performance" },
    { key: "complianceAlert", label: "Compliance Alert",       desc: "When a location's compliance score drops significantly" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-1">Choose what you get notified about</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-50">
          {NOTIFS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button onClick={() => setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${prefs[key as keyof typeof prefs] ? "bg-brand-600" : "bg-gray-200"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[key as keyof typeof prefs] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Security Tab ─────────────────────────────────────────────────────────── */
function SecurityTab() {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your password and account security</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm">Change Password</h3>
        <form action={resetPassword} className="space-y-4">
          {["New Password", "Confirm New Password"].map(label => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
              <div className="relative">
                <input name="password" type={show ? "text" : "password"} required minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 pr-10" />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700">
            Update Password
          </button>
        </form>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-800 text-sm mb-1">Danger Zone</h3>
        <p className="text-xs text-red-600 mb-4">Permanently delete your account. This cannot be undone.</p>
        <button className="flex items-center gap-2 text-sm font-semibold text-red-600 border border-red-300 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors">
          <Trash2 size={15} /> Delete Account
        </button>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function SettingsClient({ user, savedToast }: { user: UserData; savedToast: boolean }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(savedToast);

  useEffect(() => {
    if (savedToast) { setToast(true); setTimeout(() => setToast(false), 3000); }
  }, [savedToast]);

  const TAB_CONTENT: Record<string, React.ReactNode> = {
    profile:       <ProfileTab user={user} />,
    organization:  <OrganizationTab user={user} />,
    team:          <TeamTab />,
    notifications: <NotificationsTab />,
    security:      <SecurityTab />,
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} /> Settings saved!
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and franchise preferences</p>
      </div>
      <div className="flex gap-6">
        <aside className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  activeTab === id ? "bg-brand-50 text-brand-700 font-semibold" : "text-gray-600 hover:bg-gray-100"
                }`}>
                <Icon size={16} className="flex-shrink-0" />
                {label}
                {activeTab === id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-6">
          {TAB_CONTENT[activeTab]}
        </div>
      </div>
    </div>
  );
}
