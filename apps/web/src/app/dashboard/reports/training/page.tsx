import { getTrainingReport } from "@/lib/reports/queries";
import { GraduationCap, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { TrainingModuleReport } from "@/types/reports";

// ── Demo data ──────────────────────────────────────────────────────────────────

const LOCATIONS = [
  { id: "a1", name: "Downtown Atlanta", abbr: "DT" },
  { id: "a2", name: "Buckhead",          abbr: "BH" },
  { id: "a3", name: "Midtown",           abbr: "MT" },
  { id: "a4", name: "Decatur",           abbr: "DC" },
  { id: "a5", name: "Marietta",          abbr: "MR" },
  { id: "a6", name: "Smyrna",            abbr: "SM" },
];

const DEMO_MODULES: TrainingModuleReport[] = [
  {
    module: { id: "tm1", name: "Food Safety Certification", description: null, category: "food_safety", is_required: true, estimated_minutes: 60, created_at: "" },
    completions: [
      { id: "c1", module_id: "tm1", location_id: "a1", employee_name: "Marcus Williams", completed_at: new Date(Date.now() - 60 * 86400000).toISOString(), score: 95, locations: { id: "a1", name: "Downtown Atlanta" } },
      { id: "c2", module_id: "tm1", location_id: "a1", employee_name: "Jasmine Carter",  completed_at: new Date(Date.now() - 58 * 86400000).toISOString(), score: 92, locations: { id: "a1", name: "Downtown Atlanta" } },
      { id: "c3", module_id: "tm1", location_id: "a2", employee_name: "Priya Patel",     completed_at: new Date(Date.now() - 45 * 86400000).toISOString(), score: 90, locations: { id: "a2", name: "Buckhead" } },
      { id: "c4", module_id: "tm1", location_id: "a3", employee_name: "DeShawn Taylor",  completed_at: new Date(Date.now() - 40 * 86400000).toISOString(), score: 87, locations: { id: "a3", name: "Midtown" } },
      { id: "c5", module_id: "tm1", location_id: "a5", employee_name: "Tanya Brooks",    completed_at: new Date(Date.now() - 50 * 86400000).toISOString(), score: 94, locations: { id: "a5", name: "Marietta" } },
      { id: "c6", module_id: "tm1", location_id: "a6", employee_name: "Carlos Rivera",   completed_at: new Date(Date.now() - 35 * 86400000).toISOString(), score: 83, locations: { id: "a6", name: "Smyrna" } },
    ],
    location_count: 6, completed_count: 5, // Decatur missing
  },
  {
    module: { id: "tm2", name: "Brand Standards & Identity", description: null, category: "brand", is_required: true, estimated_minutes: 45, created_at: "" },
    completions: [
      { id: "c7",  module_id: "tm2", location_id: "a1", employee_name: "Marcus Williams", completed_at: new Date(Date.now() - 59 * 86400000).toISOString(), score: 97, locations: { id: "a1", name: "Downtown Atlanta" } },
      { id: "c8",  module_id: "tm2", location_id: "a1", employee_name: "Jasmine Carter",  completed_at: new Date(Date.now() - 57 * 86400000).toISOString(), score: 94, locations: { id: "a1", name: "Downtown Atlanta" } },
      { id: "c9",  module_id: "tm2", location_id: "a2", employee_name: "Priya Patel",     completed_at: new Date(Date.now() - 43 * 86400000).toISOString(), score: 93, locations: { id: "a2", name: "Buckhead" } },
      { id: "c10", module_id: "tm2", location_id: "a3", employee_name: "DeShawn Taylor",  completed_at: new Date(Date.now() - 39 * 86400000).toISOString(), score: 91, locations: { id: "a3", name: "Midtown" } },
      { id: "c11", module_id: "tm2", location_id: "a4", employee_name: "Kwame Asante",    completed_at: new Date(Date.now() - 30 * 86400000).toISOString(), score: 78, locations: { id: "a4", name: "Decatur" } },
      { id: "c12", module_id: "tm2", location_id: "a5", employee_name: "Tanya Brooks",    completed_at: new Date(Date.now() - 49 * 86400000).toISOString(), score: 96, locations: { id: "a5", name: "Marietta" } },
      { id: "c13", module_id: "tm2", location_id: "a6", employee_name: "Carlos Rivera",   completed_at: new Date(Date.now() - 33 * 86400000).toISOString(), score: 86, locations: { id: "a6", name: "Smyrna" } },
    ],
    location_count: 6, completed_count: 6,
  },
  {
    module: { id: "tm3", name: "Opening & Closing Procedures", description: null, category: "operations", is_required: true, estimated_minutes: 30, created_at: "" },
    completions: [
      { id: "c14", module_id: "tm3", location_id: "a1", employee_name: "Marcus Williams", completed_at: new Date(Date.now() - 57 * 86400000).toISOString(), score: 100, locations: { id: "a1", name: "Downtown Atlanta" } },
      { id: "c15", module_id: "tm3", location_id: "a2", employee_name: "Priya Patel",     completed_at: new Date(Date.now() - 42 * 86400000).toISOString(), score: 98,  locations: { id: "a2", name: "Buckhead" } },
      { id: "c16", module_id: "tm3", location_id: "a3", employee_name: "DeShawn Taylor",  completed_at: new Date(Date.now() - 38 * 86400000).toISOString(), score: 95,  locations: { id: "a3", name: "Midtown" } },
      { id: "c17", module_id: "tm3", location_id: "a4", employee_name: "Kwame Asante",    completed_at: new Date(Date.now() - 28 * 86400000).toISOString(), score: 82,  locations: { id: "a4", name: "Decatur" } },
      { id: "c18", module_id: "tm3", location_id: "a5", employee_name: "Tanya Brooks",    completed_at: new Date(Date.now() - 47 * 86400000).toISOString(), score: 99,  locations: { id: "a5", name: "Marietta" } },
      { id: "c19", module_id: "tm3", location_id: "a6", employee_name: "Carlos Rivera",   completed_at: new Date(Date.now() - 31 * 86400000).toISOString(), score: 88,  locations: { id: "a6", name: "Smyrna" } },
    ],
    location_count: 6, completed_count: 6,
  },
  {
    module: { id: "tm4", name: "Customer Service Excellence", description: null, category: "hr", is_required: true, estimated_minutes: 45, created_at: "" },
    completions: [
      { id: "c20", module_id: "tm4", location_id: "a1", employee_name: "Jasmine Carter", completed_at: new Date(Date.now() - 56 * 86400000).toISOString(), score: 91, locations: { id: "a1", name: "Downtown Atlanta" } },
      { id: "c21", module_id: "tm4", location_id: "a2", employee_name: "Priya Patel",    completed_at: new Date(Date.now() - 41 * 86400000).toISOString(), score: 89, locations: { id: "a2", name: "Buckhead" } },
      { id: "c22", module_id: "tm4", location_id: "a5", employee_name: "Tanya Brooks",   completed_at: new Date(Date.now() - 46 * 86400000).toISOString(), score: 93, locations: { id: "a5", name: "Marietta" } },
    ],
    location_count: 6, completed_count: 3, // Midtown, Decatur, Smyrna missing
  },
  {
    module: { id: "tm5", name: "Emergency Response Training", description: null, category: "emergency", is_required: true, estimated_minutes: 30, created_at: "" },
    completions: [
      { id: "c23", module_id: "tm5", location_id: "a1", employee_name: "Marcus Williams", completed_at: new Date(Date.now() - 54 * 86400000).toISOString(), score: 96, locations: { id: "a1", name: "Downtown Atlanta" } },
      { id: "c24", module_id: "tm5", location_id: "a3", employee_name: "DeShawn Taylor",  completed_at: new Date(Date.now() - 36 * 86400000).toISOString(), score: 90, locations: { id: "a3", name: "Midtown" } },
      { id: "c25", module_id: "tm5", location_id: "a5", employee_name: "Tanya Brooks",    completed_at: new Date(Date.now() - 45 * 86400000).toISOString(), score: 97, locations: { id: "a5", name: "Marietta" } },
    ],
    location_count: 6, completed_count: 3,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  food_safety: "bg-green-100 text-green-700",
  brand:       "bg-purple-100 text-purple-700",
  operations:  "bg-blue-100 text-blue-700",
  hr:          "bg-orange-100 text-orange-700",
  emergency:   "bg-red-100 text-red-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  food_safety: "Food Safety",
  brand:       "Brand",
  operations:  "Operations",
  hr:          "HR",
  emergency:   "Emergency",
};

export default async function TrainingPage() {
  let modules: TrainingModuleReport[] = [];
  try { modules = await getTrainingReport(); } catch { modules = DEMO_MODULES; }
  if (modules.length === 0) modules = DEMO_MODULES;

  const totalModules    = modules.length;
  const fullyComplete   = modules.filter((m) => m.completed_count === m.location_count).length;
  const networkAvgScore = (() => {
    const all = modules.flatMap((m) => m.completions.map((c) => c.score ?? 0).filter(Boolean));
    return all.length ? Math.round(all.reduce((s, n) => s + n, 0) / all.length) : 0;
  })();

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><GraduationCap size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{totalModules}</p><p className="text-xs text-gray-500">Required modules</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{fullyComplete}/{totalModules}</p><p className="text-xs text-gray-500">100% network completion</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><GraduationCap size={18} /></div>
          <div><p className="text-2xl font-bold text-gray-900">{networkAvgScore}%</p><p className="text-xs text-gray-500">Avg quiz score</p></div>
        </div>
      </div>

      {/* Matrix header */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Completion Matrix</h2>
          <p className="text-xs text-gray-500 mt-0.5">✓ = completed by at least one staff member · ✗ = not started</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide min-w-48">Module</th>
                {LOCATIONS.map((l) => (
                  <th key={l.id} className="text-center px-3 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide w-20">
                    <span className="hidden sm:inline">{l.abbr}</span>
                    <span className="sm:hidden">{l.abbr}</span>
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-medium text-xs text-gray-500 uppercase tracking-wide w-20">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {modules.map((report) => {
                const completedLocIds = new Set(report.completions.map((c) => c.location_id));
                const pct = Math.round((report.completed_count / report.location_count) * 100);

                return (
                  <tr key={report.module.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{report.module.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[report.module.category] ?? "bg-gray-100 text-gray-600"}`}>
                            {CATEGORY_LABELS[report.module.category]}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <Clock size={9} /> {report.module.estimated_minutes}min
                          </span>
                        </div>
                      </div>
                    </td>
                    {LOCATIONS.map((l) => {
                      const done = completedLocIds.has(l.id);
                      const completion = report.completions.find((c) => c.location_id === l.id);
                      return (
                        <td key={l.id} className="px-3 py-3 text-center">
                          {done ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <CheckCircle2 size={16} className="text-green-500" />
                              {completion?.score && (
                                <span className="text-xs text-gray-400">{completion.score}%</span>
                              )}
                            </div>
                          ) : (
                            <XCircle size={16} className="text-gray-200 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-bold ${pct === 100 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                          {pct}%
                        </span>
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Location legend */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-x-4 gap-y-1">
          {LOCATIONS.map((l) => (
            <span key={l.id} className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{l.abbr}</span> = {l.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
