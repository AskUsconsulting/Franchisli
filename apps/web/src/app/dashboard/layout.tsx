"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Users,
  ClipboardCheck,
  FileText,
  MessageSquare,
  CheckSquare,
  BarChart2,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Workflow,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard",    href: "/dashboard",            icon: LayoutDashboard },
  { label: "Operations",   href: "/dashboard/operations", icon: Workflow },
  { label: "Locations",    href: "/dashboard/locations",  icon: MapPin },
  { label: "Franchisees",  href: "/dashboard/franchisees",icon: Users },
  { label: "Audits",       href: "/dashboard/audits",     icon: ClipboardCheck },
  { label: "Documents",    href: "/dashboard/documents",  icon: FileText },
  { label: "Communications", href: "/dashboard/communications", icon: MessageSquare },
  { label: "Tasks",        href: "/dashboard/tasks",      icon: CheckSquare },
  { label: "Reports",      href: "/dashboard/reports",    icon: BarChart2 },
  { label: "Settings",     href: "/dashboard/settings",   icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-16"
        } flex-shrink-0 bg-brand-600 flex flex-col transition-all duration-200`}
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-brand-700">
          {sidebarOpen && (
            <span className="text-white font-bold text-lg tracking-tight">Franchisli</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-brand-200 hover:text-white p-1 rounded"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg mb-0.5 transition-colors ${
                  active
                    ? "bg-white/20 text-white font-medium"
                    : "text-brand-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-brand-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              AB
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">Abiel Berhanu</p>
                <p className="text-brand-200 text-xs truncate">Owner</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button className="mt-3 flex items-center gap-2 text-brand-200 hover:text-white text-xs w-full">
              <LogOut size={14} />
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          {/* Search */}
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations, franchisees..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm">Notifications</span>
                    <span className="text-xs text-brand-500 cursor-pointer">Mark all read</span>
                  </div>
                  {[
                    { msg: "Location #4 failed compliance audit", time: "5m ago", dot: "bg-red-500" },
                    { msg: "Marki submitted Q2 audit report", time: "1h ago", dot: "bg-green-500" },
                    { msg: "New franchisee application received", time: "3h ago", dot: "bg-brand-500" },
                    { msg: "Monthly report is ready to review", time: "1d ago", dot: "bg-gray-400" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
                      <div>
                        <p className="text-sm text-gray-800">{n.msg}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
                  AB
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium">Abiel Berhanu</p>
                    <p className="text-xs text-gray-400">Owner</p>
                  </div>
                  <div className="py-1">
                    {["Profile", "Account Settings", "Billing"].map((item) => (
                      <button key={item} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        {item}
                      </button>
                    ))}
                    <hr className="my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
