import { getLocationScorecards } from "@/lib/audits/queries";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, BarChart2, Star } from "lucide-react";
import type { LocationScorecard } from "@/types/audits";

const DEMO_SCORECARDS: LocationScorecard[] = [
  { location: { id: "a1", name: "Downtown Atlanta" }, audits: [], latest_score: 97, latest_grade: "A", avg_score: 94, trend: 3,  open_findings: 0 },
  { location: { id: "a2", name: "Buckhead"          }, audits: [], latest_score: 91, latest_grade: "A", avg_score: 89, trend: 6,  open_findings: 1 },
  { location: { id: "a3", name: "Midtown"            }, audits: [], latest_score: 88, latest_grade: "B", avg_score: 85, trend: -2, open_findings: 1 },
  { location: { id: "a4", name: "Decatur"            }, audits: [], latest_score: 74, latest_grade: "C", avg_score: 79, trend: -5, open_findings: 3 },
  { location: { id: "a5", name: "Marietta"           }, audits: [], latest_score: 95, latest_grade: "A", avg_score: 92, trend: 1,  open_findings: 0 },
  { location: { id: "a6", name: "Smyrna"             }, audits: [], latest_score: 82, latest_grade: "B", avg_score: 83, trend: 0,  open_findings: 1 },
];

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-700 bg-green-100",
  B: "text-blue-700 bg-blue-100",
  C: "text-yellow-700 bg-yellow-100",
  D: "text-orange-700 bg-orange-100",
  F: "text-red-700 bg-red-100",
};

const SCORE_BAR_COLOR = (score: number) =>
  score >= 90 ? "bg-green-500" : score >= 80 ? "bg-blue-500" : score >= 70 ? "bg-yellow-500" : "bg-red-500";

function TrendBadge({ trend }: { trend: number }) {
  if (trend > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600">
        <TrendingUp size={12} /> +{trend}
      </span>
    );
  if (trend < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600">
        <TrendingDown size={12} /> {trend}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-400">
      <Minus size={12} /> 0
    </span>
  );
}

// Mock sparkline data (last 5 audits per location)
const SPARKLINES: Record<string, number[]> = {
  a1: [88, 91, 93, 94, 97],
  a2: [83, 85, 87, 85, 91],
  a3: [87, 90, 88, 90, 88],
  a4: [83, 80, 82, 79, 74],
  a5: [91, 93, 94, 94, 95],
  a6: [80, 81, 84, 82, 82],
};

function MiniChart({ values }: { values: number[] }) {
  if (!values.length) return null;
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const h = 32;
  const w = 80;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / (max - min)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="#2c4fa3" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / (max - min)) * h;
        return <circle key={i} cx={x} cy={y} r={i === values.length - 1 ? 3 : 2} fill="#2c4fa3" />;
      })}
    </svg>
  );
}

export default async function ScoresPage() {
  let cards: LocationScorecard[] = [];
  try {
    cards = await getLocationScorecards();
  } catch {
    cards = DEMO_SCORECARDS;
  }
  if (cards.length === 0) cards = DEMO_SCORECARDS;

  const sorted = [...cards].sort((a, b) => (b.latest_score ?? 0) - (a.latest_score ?? 0));
  const avgAll = sorted.length
    ? Math.round(sorted.reduce((s, c) => s + (c.avg_score ?? 0), 0) / sorted.length)
    : 0;
  const topLocation = sorted[0];
  const needsAttention = sorted.filter((c) => (c.latest_score ?? 100) < 80);

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <BarChart2 size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{avgAll}%</p>
            <p className="text-xs text-gray-500">Network average</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <Star size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{topLocation?.location.name ?? "—"}</p>
            <p className="text-xs text-gray-500">Top performer · {topLocation?.latest_score ?? 0}%</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{needsAttention.length}</p>
            <p className="text-xs text-gray-500">Locations below 80%</p>
          </div>
        </div>
      </div>

      {/* Score cards */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Location Scorecards</h2>
          <p className="text-xs text-gray-500 mt-0.5">Based on all submitted audits</p>
        </div>

        <div className="divide-y divide-gray-50">
          {sorted.map((card, rank) => {
            const sparkValues = SPARKLINES[card.location.id] ?? [];
            return (
              <div key={card.location.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                {/* Rank */}
                <span className="w-6 text-sm font-semibold text-gray-400 text-center shrink-0">
                  {rank + 1}
                </span>

                {/* Location name */}
                <div className="w-36 shrink-0">
                  <p className="font-medium text-gray-800 text-sm">{card.location.name}</p>
                  <p className="text-xs text-gray-400">{card.audits?.length ?? "—"} audits</p>
                </div>

                {/* Grade badge */}
                <div className="shrink-0">
                  {card.latest_grade ? (
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${GRADE_COLORS[card.latest_grade] ?? "bg-gray-100 text-gray-600"}`}>
                      {card.latest_grade}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </div>

                {/* Score bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">
                      {card.latest_score !== null ? `${card.latest_score}%` : "—"}
                    </span>
                    <span className="text-xs text-gray-400">avg {card.avg_score}%</span>
                    <TrendBadge trend={card.trend} />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${SCORE_BAR_COLOR(card.latest_score ?? 0)}`}
                      style={{ width: `${card.latest_score ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Sparkline */}
                <div className="shrink-0 hidden md:block">
                  <MiniChart values={sparkValues} />
                </div>

                {/* Open findings */}
                <div className="shrink-0 text-right w-20">
                  {card.open_findings > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                      <AlertTriangle size={11} /> {card.open_findings} open
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 size={11} /> Clean
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Score Distribution</h2>
        <div className="grid grid-cols-5 gap-3">
          {(["A", "B", "C", "D", "F"] as const).map((grade) => {
            const count = sorted.filter((c) => c.latest_grade === grade).length;
            const pct = sorted.length ? Math.round((count / sorted.length) * 100) : 0;
            const colors: Record<string, string> = {
              A: "bg-green-100 text-green-700",
              B: "bg-blue-100 text-blue-700",
              C: "bg-yellow-100 text-yellow-700",
              D: "bg-orange-100 text-orange-700",
              F: "bg-red-100 text-red-700",
            };
            return (
              <div key={grade} className={`rounded-xl p-4 text-center ${colors[grade]}`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs font-medium mt-0.5">Grade {grade}</p>
                <p className="text-xs mt-1 opacity-70">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
