"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardCheck, BarChart2, AlertTriangle, Plus } from "lucide-react";

const TABS = [
  { label: "Overview",   href: "/dashboard/audits",           icon: LayoutGrid },
  { label: "Conduct",    href: "/dashboard/audits/conduct",   icon: ClipboardCheck },
  { label: "Scores",     href: "/dashboard/audits/scores",    icon: BarChart2 },
  { label: "Findings",   href: "/dashboard/audits/findings",  icon: AlertTriangle },
];

export default function AuditsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inspections & Audits</h1>
          <p className="text-sm text-gray-500 mt-0.5">Scheduled and surprise audits, scoring, and compliance tracking</p>
        </div>
        <Link
          href="/dashboard/audits/conduct"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={15} /> Start Audit
        </Link>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard/audits" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${active ? "border-brand-500 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                <Icon size={15} />{label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
