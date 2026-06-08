export const dynamic = "force-dynamic";

import { getLocationRankings } from "@/lib/reports/queries";
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { LocationRanking } from "@/types/reports";

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_RANKINGS: LocationRanking[] = [
  { rank: 1, location: { id: "a1", name: "Downtown Atlanta" }, latest_score: 97, avg_score: 94, total_audits: 5, trend: 3,  grade: "A", open_findings: 0 },
  { rank: 2, location: { id: "a5", name: "Marietta"          }, latest_score: 95, avg_score: 92, total_audits: 4, trend: 1,  grade: "A", open_findings: 0 },
  { rank: 3, location: { id: "a2", name: "Buckhead"          }, latest_score: 91, avg_score: 89, total_audits: 4, trend: 6,  grade: "A", open_findings: 1 },
  { rank: 4, location: { id: "a6", name: "Smyrna"            }, latest_score: 82, avg_score: 83, total_audits: 3, trend: 0,  grade: "B", open_findings: 1 },
  { rank: 5, location: { id: "a3", name: "Midtown"           }, latest_score: 88, avg_score: 85, total_audits: 4, trend: -2, grade: "B", open_findings: 1 },
  { rank: 6, location: { id: "a4", name: "Decatur"           }, latest_score: 74, avg_score: 79, total_audits: 3, trend: -5, grade: "C", open_findings: 3 },
];

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100",
  B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100",
  D: "text-orange-700 bg-orange-100",
  F: "text-red-700 bg-red-100",
};

const SCORE_BAR = (score: number) =>
  score >= 90 ? "bg-green-500" : score >= 80 ? "bg-blue-500" : score >= 70 ? "bg-yellow-500" : "bg-red-500";

const MEDAL_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];

function TrendBadge({ trend }: { trend: number }) {
  if (trend > 0) return <span className="flex items-center gap-0.5 text-xs font-medium text-green-600"><TrendingUp size={11} /> +{trend}</span>;
  if (trend < 0) return <span className="flex items-center gap-0.5 text-xs font-medium text-red-600"><TrendingDown size={11} /> {trend}</span>;
  return <span className="flex items-center gap-0.5 text-xs font-medium text-gray-400"><Minus size={11} /> 0</span>;
}

export default async function RankingsPage() {
  let rankings: LocationRanking[] = [];
  try { rankings = await getLocationRankings(); } catch { rankings = DEMO_RANKINGS; }
  if (rankings.length === 0) rankings = DEMO_RANKINGS;

  const networkAvg = rankings.length
    ? Math.round(rankings.reduce((s, r) => s + (r.latest_score ?? 0), 0) / rankings.length)
    : 0;
  const mostImproved = [...rankings].sort((a, b) => b.trend - a.trend)[0];
  const atRisk = rankings.filter((r) => (r.latest_score ?? 100) < 80).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Trophy size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{networkAvg}%</p><p className="text-xs text-gray-500">Network average</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><TrendingUp size={18} /></div>
          <div>
            <p className="text-lg font-bold text-gray-900 leading-tight">{mostImproved?.location.name ?? "—"}</p>
            <p className="text-xs text-gray-500">Most improved</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{atRisk}</p><p className="text-xs text-gray-500">Below 80%</p></div>
        </div>
      </div>

      {/* Podium — top 3 */}
      <div className="grid grid-cols-3 gap-4">
        {rankings.slice(0, 3).map((r, i) => (
          <div key={r.location.id} className={`bg-white border rounded-xl p-5 text-center ${i === 0 ? "border-yellow-200 ring-1 ring-yellow-200" : "border-gray-200"}`}>
            <Medal size={24} className={`mx-auto mb-2 ${MEDAL_COLORS[i]}`} />
            <p className="font-bold text-gray-900">{r.location.name}</p>
            <p className={`text-3xl font-black mt-1 ${r.latest_score! >= 90 ? "text-green-600" : r.latest_score! >= 80 ? "text-blue-600" : "text-yellow-600"}`}>
              {r.latest_score}%
            </p>
            {r.grade && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${GRADE_COLORS[r.grade] ?? ""}`}>{r.grade}</span>
            )}
          </div>
        ))}
      </div>

      {/* Full rankings table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Full Rankings</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
              <th className="text-left px-5 py-3 font-medium w-10">#</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-center px-4 py-3 font-medium">Grade</th>
              <th className="text-left px-4 py-3 font-medium">Score</th>
              <th className="text-center px-4 py-3 font-medium">Trend</th>
              <th className="text-center px-4 py-3 font-medium">Audits</th>
              <th className="text-center px-4 py-3 font-medium">Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rankings.map((r) => (
              <tr key={r.location.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  {r.rank <= 3 ? (
                    <Medal size={15} className={MEDAL_COLORS[r.rank - 1]} />
                  ) : (
                    <span className="text-gray-400 font-medium">{r.rank}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{r.location.name}</td>
                <td className="px-4 py-3 text-center">
                  {r.grade ? (
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${GRADE_COLORS[r.grade] ?? ""}`}>
                      {r.grade}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 w-40">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold w-10 ${r.latest_score! >= 90 ? "text-green-600" : r.latest_score! >= 80 ? "text-blue-600" : r.latest_score! >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                      {r.latest_score ?? "—"}%
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${SCORE_BAR(r.latest_score ?? 0)}`} style={{ width: `${r.latest_score ?? 0}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center"><TrendBadge trend={r.trend} /></td>
                <td className="px-4 py-3 text-center text-gray-500">{r.total_audits}</td>
                <td className="px-4 py-3 text-center">
                  {r.open_findings > 0
                    ? <span className="text-xs text-red-600 font-medium flex items-center justify-center gap-1"><AlertTriangle size={11} /> {r.open_findings}</span>
                    : <CheckCircle2 size={15} className="text-green-400 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
