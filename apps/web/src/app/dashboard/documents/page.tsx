"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, BookOpen, ArrowRight, Clock, Tag, CheckCircle2, ChevronDown,
} from "lucide-react";
import type { DocumentWithDetails } from "@/types/documents";

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_DOCS: DocumentWithDetails[] = [
  { id: "d1", title: "Opening Procedures Checklist", description: "Step-by-step opening procedures for all franchise locations.", category_id: "c1", doc_type: "sop", content: "full content", file_url: null, version: "2.1", status: "active", requires_acknowledgment: false, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c1", name: "Operations", slug: "operations", description: null }, policy_acknowledgments: [] },
  { id: "d2", title: "Closing Procedures Checklist", description: "Complete closing procedures including cleaning, cash reconciliation, and security.", category_id: "c1", doc_type: "sop", content: "full content", file_url: null, version: "2.0", status: "active", requires_acknowledgment: false, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c1", name: "Operations", slug: "operations", description: null }, policy_acknowledgments: [] },
  { id: "d3", title: "Food Safety & Temperature Standards", description: "HACCP-based food safety procedures including temperature monitoring.", category_id: "c2", doc_type: "sop", content: "full content", file_url: null, version: "3.2", status: "active", requires_acknowledgment: true, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 4 * 86400000).toISOString(), document_categories: { id: "c2", name: "Food Safety", slug: "food-safety", description: null }, policy_acknowledgments: [] },
  { id: "d4", title: "Customer Service Standards", description: "Brand-approved service scripts, complaint handling, and experience guidelines.", category_id: "c3", doc_type: "sop", content: "full content", file_url: null, version: "1.5", status: "active", requires_acknowledgment: false, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c3", name: "Brand", slug: "brand", description: null }, policy_acknowledgments: [] },
  { id: "d5", title: "Cash Handling Procedures", description: "POS usage, cash drawer management, and end-of-day reconciliation.", category_id: "c1", doc_type: "sop", content: null, file_url: null, version: "1.8", status: "active", requires_acknowledgment: false, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c1", name: "Operations", slug: "operations", description: null }, policy_acknowledgments: [] },
  { id: "d6", title: "Inventory Management & Ordering", description: "Par levels, ordering schedule, and inventory count procedures.", category_id: "c1", doc_type: "sop", content: null, file_url: null, version: "2.3", status: "active", requires_acknowledgment: false, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c1", name: "Operations", slug: "operations", description: null }, policy_acknowledgments: [] },
  { id: "d7", title: "Emergency Response Procedures", description: "Fire, medical emergency, power outage, and active threat protocols.", category_id: "c5", doc_type: "sop", content: null, file_url: null, version: "1.2", status: "active", requires_acknowledgment: true, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c5", name: "Emergency", slug: "emergency", description: null }, policy_acknowledgments: [] },
  { id: "d8", title: "New Employee Onboarding Guide", description: "Complete onboarding checklist and training plan for new hires.", category_id: "c4", doc_type: "sop", content: null, file_url: null, version: "3.0", status: "active", requires_acknowledgment: false, created_by: "HQ", created_at: new Date(Date.now() - 30 * 86400000).toISOString(), updated_at: new Date(Date.now() - 5 * 86400000).toISOString(), document_categories: { id: "c4", name: "HR & Staff", slug: "hr", description: null }, policy_acknowledgments: [] },
] as unknown as DocumentWithDetails[];

const CATEGORIES = ["All", "Operations", "Food Safety", "Brand", "HR & Staff", "Emergency"];

const CATEGORY_COLORS: Record<string, string> = {
  Operations:  "bg-blue-50 text-blue-700",
  "Food Safety": "bg-green-50 text-green-700",
  Brand:       "bg-purple-50 text-purple-700",
  "HR & Staff": "bg-orange-50 text-orange-700",
  Emergency:   "bg-red-50 text-red-700",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days}d ago`;
}

export default function SOPsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = DEMO_DOCS.filter((d) => {
    const matchSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat =
      category === "All" || d.document_categories?.name === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search SOPs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${category === cat ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-800">{filtered.length}</span> SOPs
        {search && <> matching "<span className="font-semibold text-gray-800">{search}</span>"</>}
      </div>

      {/* Document list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
            <p>No documents found</p>
          </div>
        ) : (
          filtered.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
              >
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen size={16} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">{doc.title}</p>
                    {doc.requires_acknowledgment && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">
                        Requires acknowledgment
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{doc.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {doc.document_categories && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[doc.document_categories.name] ?? "bg-gray-100 text-gray-600"}`}>
                        <Tag size={9} className="inline mr-0.5" />
                        {doc.document_categories.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">v{doc.version}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <Clock size={9} /> Updated {timeAgo(doc.updated_at)}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-gray-400 mt-1 transition-transform ${expandedId === doc.id ? "rotate-180" : ""}`}
                />
              </button>

              {expandedId === doc.id && (
                <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50">
                  <p className="text-sm text-gray-600">{doc.description}</p>
                  {doc.content ? (
                    <Link
                      href={`/dashboard/documents/${doc.id}`}
                      className="shrink-0 ml-4 flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
                    >
                      View full doc <ArrowRight size={13} />
                    </Link>
                  ) : (
                    <span className="shrink-0 ml-4 flex items-center gap-1 text-sm text-gray-400">
                      <CheckCircle2 size={13} /> PDF on file
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
