"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Shield, FileCheck, Plus } from "lucide-react";

const TABS = [
  { label: "SOPs",             href: "/dashboard/documents",                  icon: BookOpen },
  { label: "Brand Standards",  href: "/dashboard/documents/brand-standards",  icon: Shield },
  { label: "Policies",         href: "/dashboard/documents/policies",          icon: FileCheck },
];

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Documents & Knowledge</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            SOP library, brand standards, and policy acknowledgment tracking
          </p>
        </div>
        <Link
          href="#"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={15} /> Add Document
        </Link>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard/documents"
                ? pathname === href || (pathname.startsWith("/dashboard/documents/") && !pathname.startsWith("/dashboard/documents/brand") && !pathname.startsWith("/dashboard/documents/policies"))
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
