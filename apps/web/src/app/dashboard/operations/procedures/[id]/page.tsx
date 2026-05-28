"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, CheckCircle2, Circle, ChevronDown, ChevronUp, Pencil, Globe } from "lucide-react";

const DEMO_PROCEDURE = {
  id:    "p0000000-0000-0000-0000-000000000001",
  title: "Standard Opening Procedure",
  type:  "opening",
  version: 1,
  location_id: null,
  created_by: "Abiel",
  steps: [
    { order: 1, title: "Arrival & Security",    description: "Arrive at least 30 minutes before opening. Inspect the exterior for any damage or tampering. Deactivate the alarm — code is in your manager credentials. Unlock all entry doors in sequence: back entrance first, then front.", required: true },
    { order: 2, title: "Systems Check",         description: "Power on all equipment: POS terminals, printers, display screens, and any kitchen equipment. Run a test transaction on the POS to confirm payment processing is live. Check that Wi-Fi and internet are connected.", required: true },
    { order: 3, title: "Cash Management",       description: "Retrieve the opening cash float from the safe. Count each denomination and verify the total matches the expected opening amount ($300). Record the count in the daily log. Place the float in the assigned register.", required: true },
    { order: 4, title: "Inventory Spot Check",  description: "Walk the floor and back-of-house. Check that refrigeration units are at correct temps (35–38°F for refrigerators, 0°F for freezers). Flag any items below par levels. Note any spoilage.", required: true },
    { order: 5, title: "Facility Inspection",   description: "Inspect restrooms — restock paper towels, soap, and toilet paper as needed. Check that all customer-facing areas are clean. Inspect seating, tables, floors, and windows. Spot clean anything that needs attention.", required: true },
    { order: 6, title: "Staff Briefing",        description: "Gather opening staff for a 5-minute briefing. Cover: daily specials or promotions, any known maintenance issues, staffing for the day, and any action items from the previous closing team handover note.", required: true },
    { order: 7, title: "Open for Business",     description: "Unlock the front entrance at your scheduled opening time. Flip the sign to OPEN. Ensure a staff member is positioned at the front to greet customers. Start the day.", required: true },
  ],
};

export default function ProcedureViewPage() {
  const { id } = useParams<{ id: string }>();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const proc = DEMO_PROCEDURE; // TODO: fetch real procedure by id
  const total = proc.steps.length;
  const done  = completedSteps.size;
  const pct   = Math.round((done / total) * 100);

  function toggleStep(order: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(order) ? next.delete(order) : next.add(order);
      return next;
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/dashboard/operations/procedures" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
        <ChevronLeft size={15} /> Back to Procedures
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">{proc.type}</span>
              <span className="text-xs text-gray-400">v{proc.version}</span>
              {!proc.location_id && (
                <span className="flex items-center gap-1 text-xs text-gray-400"><Globe size={11} /> All locations</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900">{proc.title}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Created by {proc.created_by}</p>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            <Pencil size={13} /> Edit
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-600">{done} of {total} steps complete</span>
            <span className={`font-bold ${pct === 100 ? "text-green-600" : "text-brand-500"}`}>{pct}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${pct === 100 ? "bg-green-500" : "bg-brand-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {proc.steps.map((step) => {
          const isComplete = completedSteps.has(step.order);
          const isExpanded = expandedStep === step.order;
          return (
            <div
              key={step.order}
              className={`bg-white rounded-xl border transition-all ${
                isComplete ? "border-green-200 bg-green-50/30" : "border-gray-200"
              }`}
            >
              {/* Step header */}
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? null : step.order)}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleStep(step.order); }}
                  className="flex-shrink-0"
                >
                  {isComplete
                    ? <CheckCircle2 size={22} className="text-green-500" />
                    : <Circle size={22} className="text-gray-300 hover:text-gray-400" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">Step {step.order}</span>
                    {!step.required && <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Optional</span>}
                  </div>
                  <p className={`font-medium ${isComplete ? "text-gray-400 line-through" : "text-gray-800"}`}>{step.title}</p>
                </div>
                {isExpanded
                  ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                  : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                }
              </div>

              {/* Step description */}
              {isExpanded && (
                <div className="px-5 pb-5 pl-14">
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  <button
                    onClick={() => toggleStep(step.order)}
                    className={`mt-3 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                      isComplete
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "bg-brand-500 text-white hover:bg-brand-600"
                    }`}
                  >
                    {isComplete ? "Mark Incomplete" : "Mark Complete"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Done state */}
      {pct === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">All steps complete!</p>
          <p className="text-sm text-green-600 mt-1">Procedure finished. You can now start your shift.</p>
        </div>
      )}
    </div>
  );
}
