"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Layers } from "lucide-react";

const TABS = [
  { label: "All Locations", href: "/dashboard/locations",         icon: MapPin },
  { label: "Regions",       href: "/dashboard/locations/regions", icon: Layers },
];

export default function LocationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Location Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Location profiles, territories, and regional groupings
          </p>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard/locations"
                ? pathname === href || (pathname.startsWith("/dashboard/locations/") && !pathname.startsWith("/dashboard/locations/regions"))
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
