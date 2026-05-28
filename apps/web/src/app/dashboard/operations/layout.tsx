"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, BookOpen, ArrowLeftRight } from "lucide-react";

const TABS = [
  { label: "Overview",    href: "/dashboard/operations",              icon: LayoutGrid },
  { label: "Checklists",  href: "/dashboard/operations/checklists",   icon: ClipboardList },
  { label: "Procedures",  href: "/dashboard/operations/procedures",   icon: BookOpen },
  { label: "Handover",    href: "/dashboard/operations/handover",     icon: ArrowLeftRight },
];

export default function OperationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Operations & Daily Execution</h1>
          <p className="text-sm text-gray-500 mt-0.5">Checklists, procedures, and shift coordination across all locations</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard/operations" && pathname.startsWith(href));
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
