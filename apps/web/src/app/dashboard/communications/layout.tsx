"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rss, Megaphone, MessageSquare, Plus } from "lucide-react";

const TABS = [
  { label: "Feed",          href: "/dashboard/communications",              icon: Rss },
  { label: "Announcements", href: "/dashboard/communications/announcements", icon: Megaphone },
  { label: "Messages",      href: "/dashboard/communications/messages",      icon: MessageSquare },
];

export default function CommunicationsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Communications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Network announcements, location messaging, and bulletin board
          </p>
        </div>
        <Link
          href="/dashboard/communications/announcements/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus size={15} /> New Announcement
        </Link>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px">
          {TABS.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/dashboard/communications"
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
