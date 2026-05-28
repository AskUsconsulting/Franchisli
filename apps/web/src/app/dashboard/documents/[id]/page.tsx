import Link from "next/link";
import { getDocumentById } from "@/lib/documents/queries";
import { ArrowLeft, BookOpen, Clock, Tag, AlertCircle } from "lucide-react";
import type { DocumentWithDetails } from "@/types/documents";

// ── Demo doc (Food Safety & Temperature Standards) ────────────────────────────

const DEMO_DOC: DocumentWithDetails = {
  id: "d3",
  title: "Food Safety & Temperature Standards",
  description: "HACCP-based food safety procedures including temperature monitoring and safe handling.",
  category_id: "c2",
  doc_type: "sop",
  content: `## Food Safety Standards

**Last updated:** May 2026 — Key change: temperature logging frequency increased to every 2 hours.

### Temperature Requirements

| Item | Storage Temp | Action Threshold |
|------|-------------|-----------------|
| Raw meat | ≤41°F | Discard if >50°F |
| Cooked items | ≥165°F | Reheat if <135°F |
| Frozen items | ≤0°F | Discard if >10°F |
| Dairy | ≤41°F | Discard if >45°F |

### Temperature Logging

- Check and log every **2 hours** (updated May 2026)
- Use calibrated probe thermometer — calibrate at start of each shift
- Document in temperature log sheet (available in Operations tab)
- If a unit fails: remove product, contact manager, log incident

### Cross-Contamination Prevention

- Color-coded cutting boards: **red** = raw meat, **green** = produce, **yellow** = poultry, **blue** = seafood
- Separate storage zones for allergens — label clearly
- Always wash hands between handling different proteins
- Never store raw proteins above ready-to-eat foods in refrigerator

### Handwashing Standards

Wash hands for **20 seconds** with soap:
- After handling raw proteins
- After using the restroom
- After touching face, hair, or phone
- After removing gloves
- Before starting food prep

### Personal Hygiene

- No bare-hand contact with ready-to-eat foods (use gloves or utensils)
- Hair restraints required for all food handlers
- No jewelry except plain wedding band
- Clean and sanitized uniform required

### Illness Protocols

- Staff with vomiting, diarrhea, jaundice, or sore throat with fever must be **sent home immediately**
- Notify HQ if any foodborne illness is reported within 24 hours
- Document all incidents in the incident log

### Allergen Awareness

Top 9 allergens must be communicated to customers:
Milk · Eggs · Fish · Shellfish · Tree Nuts · Peanuts · Wheat · Soybeans · Sesame

When an allergen concern is raised, prepare the item in a designated clean area with clean utensils.`,
  file_url: null,
  version: "3.2",
  status: "active",
  requires_acknowledgment: true,
  created_by: "HQ",
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  document_categories: { id: "c2", name: "Food Safety", slug: "food-safety", description: null },
  policy_acknowledgments: [],
} as unknown as DocumentWithDetails;

// ── Minimal markdown renderer ─────────────────────────────────────────────────

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;

  const flush = (key: string) => {
    if (tableRows.length > 0) {
      const [header, , ...rows] = tableRows;
      elements.push(
        <div key={`table-${key}`} className="overflow-x-auto my-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>{header.map((h, i) => <th key={i} className="text-left px-3 py-2 bg-gray-100 border border-gray-200 font-semibold text-gray-700">{h.trim()}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {row.map((cell, j) => <td key={j} className="px-3 py-2 border border-gray-200 text-gray-700">{cell.trim()}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith("|")) {
      inTable = true;
      tableRows.push(line.split("|").slice(1, -1));
      return;
    }
    if (inTable) flush(String(i));

    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-bold text-gray-900 mt-6 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      const inner = line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      elements.push(<li key={i} className="text-sm text-gray-700 ml-4 list-disc mb-1" dangerouslySetInnerHTML={{ __html: inner }} />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      const inner = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      elements.push(<p key={i} className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: inner }} />);
    }
  });
  flush("end");
  return elements;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DocumentPage({ params }: { params: { id: string } }) {
  let doc: DocumentWithDetails | null = null;
  try { doc = await getDocumentById(params.id); } catch { doc = null; }
  if (!doc) doc = DEMO_DOC;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/documents" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to SOPs
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen size={18} className="text-brand-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-1">{doc.title}</h1>
              {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {doc.document_categories && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Tag size={9} /> {doc.document_categories.name}
                  </span>
                )}
                <span className="text-xs text-gray-400">Version {doc.version}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={10} /> Updated {formatDate(doc.updated_at)}
                </span>
                {doc.requires_acknowledgment && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <AlertCircle size={9} /> Requires acknowledgment
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {doc.content ? (
            <div className="prose-sm max-w-none">
              {renderContent(doc.content)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
              <p>This document is stored as a PDF file.</p>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
                  Open PDF
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
