"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowRight, Clock, Tag, CheckCircle2, ChevronDown, ExternalLink } from "lucide-react";
import type { DocumentWithDetails } from "@/types/documents";
import UploadDocumentModal from "./UploadDocumentModal";

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

export default function DocumentsClient({ docs, usingDemo, canUpload = true }: { docs: DocumentWithDetails[]; usingDemo: boolean; canUpload?: boolean }) {
  const [search,     setSearch]     = useState("");
  const [category,   setCategory]   = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(docs.map(d => d.document_categories?.name).filter(Boolean)))];

  const filtered = docs.filter((d) => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || (d.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All" || d.document_categories?.name === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents & SOPs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {canUpload
              ? (usingDemo ? "Showing sample data — upload your first document below" : `${docs.length} document${docs.length !== 1 ? "s" : ""}`)
              : "Reference your franchise's SOPs, policies, and standards"}
          </p>
        </div>
        {canUpload && <UploadDocumentModal />}
      </div>

      {usingDemo && canUpload && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          📋 <strong>Sample data</strong> — Click <strong>Upload Document</strong> to add your real SOPs and policies.
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat ?? "All")}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${category === (cat ?? "All") ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-800">{filtered.length}</span> document{filtered.length !== 1 ? "s" : ""}
        {search && <> matching &quot;<span className="font-semibold text-gray-800">{search}</span>&quot;</>}
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
              <button className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}>
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen size={16} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">{doc.title}</p>
                    {doc.requires_acknowledgment && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Requires acknowledgment</span>
                    )}
                    {doc.file_url && (
                      <span className="text-xs bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded font-medium">📎 File attached</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{doc.description}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {doc.document_categories && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[doc.document_categories.name] ?? "bg-gray-100 text-gray-600"}`}>
                        <Tag size={9} className="inline mr-0.5" />{doc.document_categories.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">v{doc.version}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <Clock size={9} /> Updated {timeAgo(doc.updated_at)}
                    </span>
                  </div>
                </div>
                <ChevronDown size={16} className={`shrink-0 text-gray-400 mt-1 transition-transform ${expandedId === doc.id ? "rotate-180" : ""}`} />
              </button>

              {expandedId === doc.id && (
                <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50">
                  <p className="text-sm text-gray-600">{doc.description}</p>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
                        <ExternalLink size={13} /> Open file
                      </a>
                    )}
                    {doc.content && (
                      <Link href={`/dashboard/documents/${doc.id}`}
                        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium">
                        View full doc <ArrowRight size={13} />
                      </Link>
                    )}
                    {!doc.file_url && !doc.content && (
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <CheckCircle2 size={13} /> No file attached
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
