import Link from "next/link";
import { getOperationsOverview } from "@/lib/operations/queries";
import {
  CheckCircle2, Clock, AlertTriangle, Circle,
  MapPin, ArrowRight, MessageSquare, Plus,
} from "lucide-react";

function RunStatusIcon({ status }: { status: string | null }) {
  if (!status)           return <Circle size={16} className="text-gray-300" />;
  if (status === "completed") return <CheckCircle2 size={16} className="text-green-500" />;
  if (status === "in_progress") return <Clock size={16} className="text-yellow-500" />;
  if (status === "flagged") return <AlertTriangle size={16} className="text-red-500" />;
  return <Circle size={16} className="text-gray-300" />;
}

function RunStatusBadge({ status }: { status: string | null }) {
  if (!status)           return <span className="text-xs text-gray-400">Not started</span>;
  if (status === "completed")  return <span className="text-xs text-green-600 font-medium">Done</span>;
  if (status === "in_progress") return <span className="text-xs text-yellow-600 font-medium">In progress</span>;
  if (status === "flagged")  return <span className="text-xs text-red-600 font-medium">Flagged</span>;
  return null;
}

export default async function OperationsOverviewPage() {
  let overview;
  try {
    overview = await getOperationsOverview();
  } catch {
    // Show demo state if DB not connected yet
    overview = null;
  }

  const statsCards = [
    { label: "Total Locations",  value: overview?.total ?? 5,          color: "bg-gray-50 text-gray-600",   border: "border-gray-200" },
    { label: "All Clear",        value: overview?.completed ?? 2,       color: "bg-green-50 text-green-700", border: "border-green-200" },
    { label: "In Progress",      value: overview?.in_progress ?? 2,     color: "bg-yellow-50 text-yellow-700", border: "border-yellow-200" },
    { label: "Flagged",          value: overview?.flagged ?? 1,         color: "bg-red-50 text-red-700",     border: "border-red-200" },
    { label: "Not Started",      value: overview?.not_started ?? 0,     color: "bg-gray-50 text-gray-500",   border: "border-gray-200" },
  ];

  // Demo location data for when DB isn't seeded yet
  const demoLocations = [
    { name: "Downtown Atlanta", opening: "completed",   closing: null,        daily: "completed",   handover: true,  unread: false },
    { name: "Buckhead",         opening: "completed",   closing: null,        daily: "in_progress", handover: true,  unread: false },
    { name: "Midtown",          opening: "in_progress", closing: null,        daily: null,          handover: false, unread: false },
    { name: "Decatur",          opening: "flagged",     closing: null,        daily: null,          handover: true,  unread: true  },
    { name: "Marietta",         opening: "completed",   closing: null,        daily: "completed",   handover: false, unread: false },
  ];

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statsCards.map(({ label, value, color, border }) => (
          <div key={label} className={`rounded-xl border ${border} p-4 ${color.split(" ")[0]}`}>
            <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</p>
            <p className="text-xs mt-0.5 text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Location grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Today&apos;s Location Status</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
            <Link href="/dashboard/operations/checklists" className="flex items-center gap-1 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg">
              <Plus size={12} /> Start Checklist
            </Link>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
              <th className="text-left px-5 py-3 font-medium">Location</th>
              <th className="text-center px-4 py-3 font-medium">Opening</th>
              <th className="text-center px-4 py-3 font-medium">Daily Tasks</th>
              <th className="text-center px-4 py-3 font-medium">Closing</th>
              <th className="text-center px-4 py-3 font-medium">Handover</th>
              <th className="text-right px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(overview?.locations ?? []).length > 0
              ? overview!.locations.map(({ location, opening_run, closing_run, daily_run, latest_handover, unread_handover }) => (
                <tr key={location.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                        <MapPin size={14} className="text-brand-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{location.name}</p>
                        <p className="text-xs text-gray-400">{location.region}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <RunStatusIcon status={opening_run?.status ?? null} />
                      <RunStatusBadge status={opening_run?.status ?? null} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <RunStatusIcon status={daily_run?.status ?? null} />
                      <RunStatusBadge status={daily_run?.status ?? null} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <RunStatusIcon status={closing_run?.status ?? null} />
                      <RunStatusBadge status={closing_run?.status ?? null} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {latest_handover ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <MessageSquare size={15} className={unread_handover ? "text-brand-500" : "text-gray-400"} />
                        <span className={`text-xs ${unread_handover ? "text-brand-600 font-medium" : "text-gray-400"}`}>
                          {unread_handover ? "Unread" : "Read"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/dashboard/operations/checklists`} className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 justify-end">
                      View <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))
              // Demo fallback
              : demoLocations.map((loc) => (
                <tr key={loc.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                        <MapPin size={14} className="text-brand-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{loc.name}</p>
                        <p className="text-xs text-gray-400">Metro Atlanta</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center"><div className="flex flex-col items-center gap-0.5"><RunStatusIcon status={loc.opening} /><RunStatusBadge status={loc.opening} /></div></td>
                  <td className="px-4 py-4 text-center"><div className="flex flex-col items-center gap-0.5"><RunStatusIcon status={loc.daily} /><RunStatusBadge status={loc.daily} /></div></td>
                  <td className="px-4 py-4 text-center"><div className="flex flex-col items-center gap-0.5"><RunStatusIcon status={loc.closing} /><RunStatusBadge status={loc.closing} /></div></td>
                  <td className="px-4 py-4 text-center">
                    {loc.handover ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <MessageSquare size={15} className={loc.unread ? "text-brand-500" : "text-gray-400"} />
                        <span className={`text-xs ${loc.unread ? "text-brand-600 font-medium" : "text-gray-400"}`}>{loc.unread ? "Unread" : "Read"}</span>
                      </div>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href="/dashboard/operations/checklists" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 justify-end">View <ArrowRight size={12} /></Link>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <span className="font-medium text-gray-600">Legend:</span>
        {[
          { icon: <CheckCircle2 size={13} className="text-green-500" />, label: "Completed" },
          { icon: <Clock size={13} className="text-yellow-500" />,       label: "In progress" },
          { icon: <AlertTriangle size={13} className="text-red-500" />,  label: "Flagged / issues" },
          { icon: <Circle size={13} className="text-gray-300" />,        label: "Not started" },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5">{icon}<span>{label}</span></div>
        ))}
      </div>
    </div>
  );
}
