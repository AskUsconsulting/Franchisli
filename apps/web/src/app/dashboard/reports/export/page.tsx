"use client";

import { useState } from "react";
import { Download, FileText, Table, Printer, CheckCircle2 } from "lucide-react";

// ── Report definitions ─────────────────────────────────────────────────────────

const REPORT_TYPES = [
  {
    id: "audit_scores",
    name: "Audit Score Report",
    description: "All audit scores, grades, and trends per location for the selected period.",
    icon: "📊",
    fields: ["Location", "Date", "Type", "Score", "Grade", "Critical Failures", "Auditor"],
    sampleRows: [
      ["Downtown Atlanta", "May 21, 2026", "Scheduled", "97%", "A", "0", "Marki"],
      ["Buckhead",          "May 19, 2026", "Scheduled", "91%", "A", "0", "Marki"],
      ["Midtown",           "May 14, 2026", "Scheduled", "88%", "B", "0", "Marki"],
      ["Decatur",           "May 15, 2026", "Surprise",  "74%", "C", "2", "Third"],
      ["Marietta",          "May 8,  2026", "Scheduled", "95%", "A", "0", "Third"],
    ],
  },
  {
    id: "training_completion",
    name: "Training Completion Report",
    description: "Training module completion status and quiz scores per location.",
    icon: "🎓",
    fields: ["Module", "Location", "Employee", "Completed Date", "Score"],
    sampleRows: [
      ["Food Safety Certification", "Downtown Atlanta", "Marcus Williams", "Mar 28, 2026", "95%"],
      ["Food Safety Certification", "Buckhead",         "Priya Patel",     "Apr 13, 2026", "90%"],
      ["Brand Standards",          "Downtown Atlanta", "Jasmine Carter",  "Mar 31, 2026", "94%"],
      ["Emergency Response",       "Marietta",          "Tanya Brooks",    "Apr 12, 2026", "97%"],
    ],
  },
  {
    id: "findings_summary",
    name: "Findings & Compliance Report",
    description: "Open and resolved findings with severity, status, and resolution details.",
    icon: "⚠️",
    fields: ["Location", "Finding", "Severity", "Status", "Due Date", "Resolved Date"],
    sampleRows: [
      ["Decatur", "Food temp log not maintained", "Critical", "Open",      "May 30, 2026", "—"],
      ["Decatur", "Handwashing station unstocked", "Critical", "In Review", "May 30, 2026", "—"],
      ["Decatur", "Grease buildup under fryers",  "Major",    "Open",      "Jun 1, 2026",  "—"],
      ["Buckhead", "Exterior signage lighting out","Minor",   "Resolved",  "May 25, 2026", "May 22, 2026"],
    ],
  },
  {
    id: "location_summary",
    name: "Location Performance Summary",
    description: "High-level summary of each location including audit average, training completion, and open findings.",
    icon: "📍",
    fields: ["Location", "Region", "Manager", "Avg Audit Score", "Grade", "Training %", "Open Findings"],
    sampleRows: [
      ["Downtown Atlanta", "Metro Core",  "Marcus Williams",  "94%", "A", "92%", "0"],
      ["Marietta",         "North Metro", "Tanya Brooks",     "92%", "A", "100%","0"],
      ["Buckhead",         "Metro Core",  "Priya Patel",      "89%", "A", "83%", "1"],
      ["Smyrna",           "North Metro", "Carlos Rivera",    "83%", "B", "75%", "1"],
      ["Midtown",          "Metro Core",  "DeShawn Taylor",   "85%", "B", "67%", "1"],
      ["Decatur",          "Metro Core",  "Kwame Asante",     "79%", "C", "33%", "3"],
    ],
  },
];

const DATE_RANGES = ["Last 30 days", "Last 90 days", "Last 6 months", "This year", "All time"];

// ── CSV generator ─────────────────────────────────────────────────────────────

function downloadCSV(reportId: string) {
  const report = REPORT_TYPES.find((r) => r.id === reportId);
  if (!report) return;
  const rows = [report.fields, ...report.sampleRows];
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `franchisli_${reportId}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExportPage() {
  const [selected, setSelected]     = useState("audit_scores");
  const [dateRange, setDateRange]   = useState("Last 30 days");
  const [downloaded, setDownloaded] = useState<string | null>(null);

  const report = REPORT_TYPES.find((r) => r.id === selected)!;

  function handleCSV() {
    downloadCSV(selected);
    setDownloaded("csv");
    setTimeout(() => setDownloaded(null), 3000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Report selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`p-4 rounded-xl border text-left transition-all ${selected === r.id ? "border-brand-300 bg-brand-50 ring-1 ring-brand-300" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}`}
          >
            <div className="text-2xl mb-2">{r.icon}</div>
            <p className={`text-sm font-semibold leading-snug ${selected === r.id ? "text-brand-700" : "text-gray-800"}`}>{r.name}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Options panel */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm">Export Options</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Report</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {REPORT_TYPES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Date range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {DATE_RANGES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <button
                onClick={handleCSV}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {downloaded === "csv" ? (
                  <><CheckCircle2 size={15} /> Downloaded!</>
                ) : (
                  <><Table size={15} /> Download CSV</>
                )}
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Printer size={15} /> Print / Save PDF
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">About this report</p>
            <p>{report.description}</p>
            <p className="mt-2 text-gray-400">Contains {report.fields.length} columns across {report.sampleRows.length}+ rows.</p>
          </div>
        </div>

        {/* Preview panel */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">{report.icon} {report.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{dateRange} · Sample data preview</p>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400">CSV / PDF</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {report.fields.map((f) => (
                    <th key={f} className="text-left px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {report.sampleRows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Download size={11} />
              Preview shows sample rows. Full export includes all data for the selected date range.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
