import Link from "next/link";
import { getProcedures } from "@/lib/operations/queries";
import { BookOpen, Plus, ChevronRight, Sunrise, Sunset, AlertCircle, FileText } from "lucide-react";
import type { Procedure } from "@/types/operations";

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  opening:   { label: "Opening",   icon: Sunrise,      color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  closing:   { label: "Closing",   icon: Sunset,       color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
  emergency: { label: "Emergency", icon: AlertCircle,  color: "text-red-600",    bg: "bg-red-50 border-red-200" },
  general:   { label: "General",   icon: FileText,     color: "text-gray-600",   bg: "bg-gray-50 border-gray-200" },
};

const DEMO_PROCEDURES: Procedure[] = [
  {
    id: "p0000000-0000-0000-0000-000000000001",
    title: "Standard Opening Procedure",
    type: "opening",
    location_id: null,
    steps: Array(7).fill({ order: 1, title: "Step", description: "", required: true }),
    version: 1,
    is_active: true,
    created_by: "Abiel",
    updated_by: null,
    created_at: "",
    updated_at: "",
  },
  {
    id: "p0000000-0000-0000-0000-000000000002",
    title: "Standard Closing Procedure",
    type: "closing",
    location_id: null,
    steps: Array(7).fill({ order: 1, title: "Step", description: "", required: true }),
    version: 1,
    is_active: true,
    created_by: "Abiel",
    updated_by: null,
    created_at: "",
    updated_at: "",
  },
];

export default async function ProceduresPage() {
  let procedures: Procedure[] = [];
  try {
    procedures = await getProcedures();
  } catch {
    procedures = DEMO_PROCEDURES;
  }

  if (procedures.length === 0) procedures = DEMO_PROCEDURES;

  const grouped = Object.keys(TYPE_META).reduce<Record<string, Procedure[]>>((acc, type) => {
    acc[type] = procedures.filter((p) => p.type === type);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{procedures.length} procedure{procedures.length !== 1 ? "s" : ""} across all locations</p>
        <button className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={15} /> New Procedure
        </button>
      </div>

      {/* Sections by type */}
      {Object.entries(grouped).map(([type, procs]) => {
        const { label, icon: Icon, color, bg } = TYPE_META[type];
        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} className={color} />
              <h2 className="font-semibold text-gray-900">{label} Procedures</h2>
              <span className="text-xs text-gray-400">({procs.length})</span>
            </div>

            {procs.length === 0 ? (
              <div className={`border ${bg} rounded-xl p-6 text-center`}>
                <BookOpen size={24} className={`${color} mx-auto mb-2 opacity-40`} />
                <p className="text-sm text-gray-400">No {label.toLowerCase()} procedures yet.</p>
                <button className={`mt-2 text-sm ${color} hover:underline flex items-center gap-1 mx-auto`}>
                  <Plus size={13} /> Create one
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {procs.map((proc) => (
                  <Link
                    key={proc.id}
                    href={`/dashboard/operations/procedures/${proc.id}`}
                    className={`group bg-white border rounded-xl p-5 hover:shadow-sm transition-all ${bg}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center border`}>
                        <Icon size={18} className={color} />
                      </div>
                      <span className="text-xs text-gray-400">v{proc.version}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{proc.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">
                      {proc.steps.length} steps · {proc.location_id ? "This location" : "All locations"}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">By {proc.created_by}</span>
                      <span className={`text-xs font-medium flex items-center gap-1 ${color} group-hover:gap-2 transition-all`}>
                        View <ChevronRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
