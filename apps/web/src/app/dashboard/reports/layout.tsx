"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, GraduationCap, Download } from "lucide-react";

const TABS = [
  { label: "Rankings",  href: "/dashboard/reports",          icon: Trophy },
  { label: "Training",  href: "/dashboard/reports/training", icon: GraduationCap },
  { label: "Export",    href: "/dashboard/reports/export",   icon: Download },
];

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reporting & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Location rankings, training completion, and exportable reports
          </p>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard/reports"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
