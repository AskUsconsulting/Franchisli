"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Point { date: string; score: number; location: string; }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-900">{d.location}</p>
      <p className="text-brand-600 font-bold text-lg">{d.score}%</p>
      <p className="text-gray-400 text-xs mt-0.5">{d.date}</p>
    </div>
  );
}

export default function AuditChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No audit data yet — conduct your first audit to see scores here
      </div>
    );
  }

  const avg = Math.round(data.reduce((s, d) => s + d.score, 0) / data.length);

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-brand-500 inline-block rounded" /> Audit Score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-gray-300 inline-block rounded border-dashed" /> Avg {avg}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={avg} stroke="#cbd5e1" strokeDasharray="4 4" />
          <Line
            type="monotone" dataKey="score" stroke="#2c4fa3" strokeWidth={2.5}
            dot={{ fill: "#2c4fa3", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#2c4fa3" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
