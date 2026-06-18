"use client";

import { useState } from "react";

interface Point { date: string; score: number; location: string; }

export default function AuditChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No audit data yet — conduct your first audit to see scores here
      </div>
    );
  }

  const W = 600, H = 180, PAD = 30;
  const minY = 50, maxY = 100;
  const avg = Math.round(data.reduce((s, d) => s + d.score, 0) / data.length);

  // single point — just show it centered
  const xFor = (i: number) => data.length === 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (data.length - 1);
  const yFor = (v: number) => H - PAD - ((v - minY) / (maxY - minY)) * (H - PAD * 2);

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d.score)}`).join(" ");
  const areaPath = `${linePath} L ${xFor(data.length - 1)} ${H - PAD} L ${xFor(0)} ${H - PAD} Z`;
  const avgY = yFor(avg);

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand-500 inline-block rounded" /> Audit Score</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0 border-t border-dashed border-gray-400 inline-block" /> Avg {avg}%</span>
      </div>

      <div className="relative w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 190 }} preserveAspectRatio="xMidYMid meet">
          {/* gridlines */}
          {[50, 75, 100].map(v => (
            <g key={v}>
              <line x1={PAD} y1={yFor(v)} x2={W - PAD} y2={yFor(v)} stroke="#f1f5f9" strokeWidth={1} />
              <text x={8} y={yFor(v) + 4} fontSize={10} fill="#94a3b8">{v}</text>
            </g>
          ))}

          {/* avg line */}
          <line x1={PAD} y1={avgY} x2={W - PAD} y2={avgY} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />

          {/* area */}
          <path d={areaPath} fill="#2c4fa3" opacity={0.06} />
          {/* line */}
          <path d={linePath} fill="none" stroke="#2c4fa3" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={xFor(i)} cy={yFor(d.score)} r={hover === i ? 6 : 4}
                fill="#2c4fa3" stroke="#fff" strokeWidth={hover === i ? 2 : 0}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
              <text x={xFor(i)} y={H - 8} fontSize={10} fill="#94a3b8" textAnchor="middle">{d.date}</text>
            </g>
          ))}
        </svg>

        {/* tooltip */}
        {hover !== null && (
          <div
            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs pointer-events-none"
            style={{
              left: `${(xFor(hover) / W) * 100}%`,
              top: `${(yFor(data[hover].score) / H) * 100}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <p className="font-semibold text-gray-900">{data[hover].location}</p>
            <p className="text-brand-600 font-bold">{data[hover].score}%</p>
            <p className="text-gray-400">{data[hover].date}</p>
          </div>
        )}
      </div>
    </div>
  );
}
