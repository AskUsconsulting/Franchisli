"use client";

import { useState } from "react";
import {
  User, Building2, Bell, Shield, Users, Mail, Phone,
  Globe, Lock, Trash2, ChevronRight, CheckCircle2, Plus,
  Eye, EyeOff,
} from "lucide-react";

const TABS = [
  { id: "profile",       label: "Profile",        icon: User },
  { id: "organization",  label: "Organization",   icon: Building2 },
  { id: "team",          label: "Team & Access",  icon: Users },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "security",      label: "Security",       icon: Shield },
];

function ProfileTab() {
  const [saved, setSaved] = useState(false);
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Update your personal information</p>
      </div>
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold">AB</div>
        <div>
          <button className="text-sm font-semibold text-brand-600 hover:text-brand-700">Change photo</button>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "First Name",    name: "first",   defaultValue: "Abiel",                    type: "text" },
          { label: "Last Name",     name: "last",    defaultValue: "Berhanu",                  type: "text" },
          { label: "Email Address", name: "email",   defaultValue: "askusaiconsulting@gmail.com", type: "email" },
          { label: "Phone",         name: "phone",   defaultValue: "+1 (404) 555-0100",        type: "tel" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{field.label}</label>
            <input
              type={field.type}
              defaultValue={field.defaultValue}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all"
            />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Role / Title</label>
          <input type="text" defaultValue="Franchise Owner" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all" />
        </div>
      </div>
      <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700"}`}>
        {saved && <CheckCircle2 size={15} />} {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

function OrganizationTab() {
  const [saved, setSaved] = useState(false);
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Organization</h2>
        <p className="text-sm text-gray-500 mt-1">Your franchise brand and business details</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Franchise Name",   defaultValue: "Berhanu Franchise Group" },
          { label: "Brand",            defaultValue: "Golden Corral" },
          { label: "Headquarters",     defaultValue: "Atlanta, GA" },
          { label: "Tax ID / EIN",     defaultValue: "••-•••••••" },
          { label: "Total Locations",  defaultValue: "12" },
          { label: "Franchise Since",  defaultValue: "2021" },
        ].map((field) => (
          <div key={field.label}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{field.label}</label>
            <input type="text" defaultValue={field.defaultValue} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all" />
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Website</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10">
            <span className="px-3 py-2.5 bg-gray-50 text-sm text-gray-400 border-r border-gray-200">https://</span>
            <input type="text" defaultValue="berhanufg.com" className="flex-1 px-4 py-2.5 text-sm text-gray-900 outline-none" />
          </div>
        </div>
      </div>
      <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700"}`}>
        {saved && <CheckCircle2 size={15} />} {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

function TeamTab() {
  const TEAM = [
    { name: "Abiel Berhanu",   email: "askusaiconsulting@gmail.com", role: "Owner",   avatar: "AB", color: "bg-brand-600", status: "active" },
    { name: "Marcus Williams", email: "marcus@downtownatlanta.com",  role: "Manager", avatar: "MW", color: "bg-blue-500",  status: "active" },
    { name: "Priya Sharma",    email: "priya@buckheadfranchise.com", role: "Manager", avatar: "PS", color: "bg-purple-500",status: "active" },
    { name: "Keisha Thompson", email: "keisha@mariettaops.com",      role: "Manager", avatar: "KT", color: "bg-green-500", status: "active" },
    { name: "Derek Johnson",   email: "derek@decaturgroup.com",      role: "Manager", avatar: "DJ", color: "bg-orange-500",status: "active" },
  ];
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team & Access</h2>
          <p className="text-sm text-gray-500 mt-1">Manage who has access to your Franchisli account</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
          <Plus size={15} /> Invite Employee
        </button>
      </div>

      {showInvite && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-brand-900 mb-3">Invite a team member</p>
          <div className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="employee@yourfranchise.com"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            />
            <button className="bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
              Send Invite
            </button>
          </div>
          <p className="text-xs text-brand-600 mt-2">They&apos;ll receive an email with a link to create their account.</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{TEAM.length} members</p>
        </div>
        <div className="divide-y divide-gray-50">
          {TEAM.map((member) => (
            <div key={member.email} className="flex items-center gap-4 px-5 py-4">
              <div className={`w-9 h-9 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{member.role}</span>
              {member.role !== "Owner" && (
                <button className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">Remove</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    auditCompleted:    true,
    auditFailed:       true,
    taskOverdue:       true,
    taskAssigned:      false,
    newMessage:        true,
    weeklyReport:      true,
    complianceAlert:   true,
    employeeInvite:    false,
  });
  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const NOTIFS = [
    { key: "auditCompleted",  label: "Audit Completed",        desc: "When a franchisee submits an audit report" },
    { key: "auditFailed",     label: "Audit Critical Failure",  desc: "When an audit has critical failures or scores below 80%" },
    { key: "taskOverdue",     label: "Task Overdue",            desc: "When a task passes its due date without completion" },
    { key: "taskAssigned",    label: "Task Assigned to You",    desc: "When a task is assigned directly to you" },
    { key: "newMessage",      label: "New Message",             desc: "When a franchisee sends you a direct message" },
    { key: "weeklyReport",    label: "Weekly Summary Report",   desc: "A weekly digest of network performance" },
    { key: "complianceAlert", label: "Compliance Alert",        desc: "When a location's compliance score drops significantly" },
    { key: "employeeInvite",  label: "Employee Invite Accepted", desc: "When an invited employee creates their account" },
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
              <button
                onClick={() => toggle(key as keyof typeof prefs)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${prefs[key as keyof typeof prefs] ? "bg-brand-600" : "bg-gray-200"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${prefs[key as keyof typeof prefs] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [showPw, setShowPw] = useState(false);
  const [saved,  setSaved]  = useState(false);
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your password and account security</p>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm">Change Password</h3>
        {["Current Password", "New Password", "Confirm New Password"].map((label) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 pr-10"
              />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        ))}
        <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700"}`}>
          {saved && <CheckCircle2 size={15} />} {saved ? "Password Updated!" : "Update Password"}
        </button>
      </div>

      {/* 2FA */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Two-Factor Authentication</h3>
            <p className="text-xs text-gray-400 mt-1">Add an extra layer of security to your account</p>
          </div>
          <button className="text-sm font-semibold text-brand-600 hover:text-brand-700 px-4 py-2 rounded-xl border border-brand-200 hover:bg-brand-50 transition-colors">
            Enable 2FA
          </button>
        </div>
      </div>

      {/* Sessions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Active Sessions</h3>
        {[
          { device: "MacBook Pro — Chrome",  location: "Atlanta, GA",     time: "Now",       current: true },
          { device: "iPhone 15 — Safari",    location: "Atlanta, GA",     time: "2h ago",    current: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{s.device}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.location} · {s.time}</p>
            </div>
            {s.current
              ? <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Current</span>
              : <button className="text-xs text-red-500 hover:text-red-600 font-medium">Revoke</button>}
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-800 text-sm mb-1">Danger Zone</h3>
        <p className="text-xs text-red-600 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button className="flex items-center gap-2 text-sm font-semibold text-red-600 border border-red-300 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors">
          <Trash2 size={15} /> Delete Account
        </button>
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<string, React.ReactNode> = {
  profile:       <ProfileTab />,
  organization:  <OrganizationTab />,
  team:          <TeamTab />,
  notifications: <NotificationsTab />,
  security:      <SecurityTab />,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and franchise preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  activeTab === id
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={16} className="flex-shrink-0" />
                {label}
                {activeTab === id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-6">
          {TAB_CONTENT[activeTab]}
        </div>
      </div>
    </div>
  );
}
