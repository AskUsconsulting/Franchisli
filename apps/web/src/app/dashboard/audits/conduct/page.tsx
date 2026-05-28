"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, XCircle, MinusCircle, Camera, X, ChevronDown, ChevronUp,
  AlertTriangle, Send, Loader2, Star, Flag, Image as ImageIcon,
} from "lucide-react";
import { createAudit, saveAuditResponse, submitAudit, uploadAuditPhoto } from "@/actions/audits";
import type { ItemResponse, ResponseDraft, LocalPhoto } from "@/types/audits";

// ─── Demo Template ─────────────────────────────────────────────
const TEMPLATE = {
  id: "at000000-0000-0000-0000-000000000001",
  name: "Standard Franchise Inspection",
  audit_sections: [
    {
      id: "as1", title: "Food Safety & Hygiene", description: "Temperature controls, handling, storage", weight: 25, section_order: 1,
      audit_items: [
        { id: "ai1",  text: "Refrigerator temps at or below 40°F — verified with thermometer", points: 10, is_critical: true,  photo_required: true,  item_order: 1 },
        { id: "ai2",  text: "Freezer temps at or below 0°F",                                   points: 10, is_critical: true,  photo_required: false, item_order: 2 },
        { id: "ai3",  text: "All food items correctly labeled and dated",                       points: 8,  is_critical: false, photo_required: false, item_order: 3 },
        { id: "ai4",  text: "No expired food items found on premises",                          points: 10, is_critical: true,  photo_required: true,  item_order: 4 },
        { id: "ai5",  text: "Staff following proper hand washing procedures",                   points: 8,  is_critical: true,  photo_required: false, item_order: 5 },
        { id: "ai6",  text: "Food stored properly — covered, off floor, separated",             points: 8,  is_critical: false, photo_required: true,  item_order: 6 },
      ],
    },
    {
      id: "as2", title: "Cleanliness & Sanitation", description: "All surfaces, equipment, and restrooms", weight: 20, section_order: 2,
      audit_items: [
        { id: "ai7",  text: "All customer-facing surfaces clean and sanitized",     points: 8,  is_critical: false, photo_required: true,  item_order: 1 },
        { id: "ai8",  text: "Restrooms clean, stocked, and no maintenance issues",  points: 8,  is_critical: false, photo_required: true,  item_order: 2 },
        { id: "ai9",  text: "Floors clean and free of debris or spills",            points: 6,  is_critical: false, photo_required: false, item_order: 3 },
        { id: "ai10", text: "Trash receptacles emptied and liners in place",        points: 5,  is_critical: false, photo_required: false, item_order: 4 },
        { id: "ai11", text: "Kitchen equipment sanitized per schedule",             points: 8,  is_critical: true,  photo_required: true,  item_order: 5 },
      ],
    },
    {
      id: "as3", title: "Brand Standards", description: "Signage, uniforms, marketing materials", weight: 15, section_order: 3,
      audit_items: [
        { id: "ai12", text: "Exterior signage clean, lit, and undamaged",       points: 6, is_critical: false, photo_required: true,  item_order: 1 },
        { id: "ai13", text: "All staff in correct uniform with name badges",    points: 6, is_critical: false, photo_required: false, item_order: 2 },
        { id: "ai14", text: "Menu boards current, correct pricing displayed",   points: 6, is_critical: false, photo_required: true,  item_order: 3 },
        { id: "ai15", text: "Marketing materials current — no outdated promos", points: 4, is_critical: false, photo_required: false, item_order: 4 },
      ],
    },
    {
      id: "as4", title: "Customer Experience", description: "Service quality and environment", weight: 20, section_order: 4,
      audit_items: [
        { id: "ai16", text: "Staff greeting customers within 30 seconds",        points: 8, is_critical: false, photo_required: false, item_order: 1 },
        { id: "ai17", text: "Wait times within acceptable range (< 5 min)",      points: 8, is_critical: false, photo_required: false, item_order: 2 },
        { id: "ai18", text: "Customer seating area clean and welcoming",         points: 6, is_critical: false, photo_required: true,  item_order: 3 },
        { id: "ai19", text: "No unresolved customer complaints on record",       points: 6, is_critical: false, photo_required: false, item_order: 4 },
      ],
    },
    {
      id: "as5", title: "Operations & Compliance", description: "Procedures, documentation, staff", weight: 20, section_order: 5,
      audit_items: [
        { id: "ai20", text: "Opening and closing checklists completed daily",    points: 8, is_critical: false, photo_required: false, item_order: 1 },
        { id: "ai21", text: "Temperature logs filled out and up to date",        points: 8, is_critical: true,  photo_required: true,  item_order: 2 },
        { id: "ai22", text: "Staff certifications current (food handler cards)", points: 8, is_critical: true,  photo_required: false, item_order: 3 },
        { id: "ai23", text: "Cash handling procedures followed correctly",       points: 6, is_critical: false, photo_required: false, item_order: 4 },
        { id: "ai24", text: "Incident log maintained and up to date",            points: 4, is_critical: false, photo_required: false, item_order: 5 },
      ],
    },
  ],
};

const LOCATIONS = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Downtown Atlanta" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Buckhead" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Midtown" },
  { id: "a0000000-0000-0000-0000-000000000004", name: "Decatur" },
  { id: "a0000000-0000-0000-0000-000000000005", name: "Marietta" },
];

type Step = "setup" | "audit" | "review";

function calcLiveScore(drafts: Record<string, ResponseDraft>, template: typeof TEMPLATE) {
  const allItems = template.audit_sections.flatMap((s) => s.audit_items);
  const totalPts = allItems.reduce((s, i) => s + i.points, 0);
  const naPts    = allItems.filter((i) => drafts[i.id]?.response === "na").reduce((s, i) => s + i.points, 0);
  const earned   = allItems.reduce((s, i) => {
    const r = drafts[i.id]?.response;
    return s + (r === "pass" ? i.points : 0);
  }, 0);
  const adj = totalPts - naPts;
  return adj > 0 ? Math.round((earned / adj) * 100) : 0;
}

function grade(score: number) {
  if (score >= 90) return { g: "A", color: "text-green-600" };
  if (score >= 80) return { g: "B", color: "text-blue-600" };
  if (score >= 70) return { g: "C", color: "text-yellow-600" };
  if (score >= 60) return { g: "D", color: "text-orange-600" };
  return { g: "F", color: "text-red-600" };
}

export default function ConductAuditPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Setup state
  const [step, setStep]             = useState<Step>("setup");
  const [locationId, setLocationId] = useState("");
  const [auditorName, setAuditorName] = useState("");
  const [auditType, setAuditType]   = useState<"scheduled" | "surprise">("scheduled");
  const [auditId, setAuditId]       = useState<string | null>(null);

  // Audit state
  const [drafts, setDrafts]         = useState<Record<string, ResponseDraft>>({});
  const [activeSection, setActiveSection] = useState(0);
  const [auditNotes, setAuditNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState<{ score: number; grade: string } | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoTarget, setPhotoTarget] = useState<string | null>(null);

  const allItems   = TEMPLATE.audit_sections.flatMap((s) => s.audit_items);
  const answered   = allItems.filter((i) => drafts[i.id]?.response).length;
  const liveScore  = calcLiveScore(drafts, TEMPLATE);
  const { g, color } = grade(liveScore);

  function setResponse(itemId: string, response: ItemResponse) {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], itemId, response, notes: prev[itemId]?.notes ?? "", photos: prev[itemId]?.photos ?? [] },
    }));
    startTransition(async () => {
      if (auditId) {
        const item = allItems.find((i) => i.id === itemId)!;
        await saveAuditResponse({
          auditId, itemId, response,
          pointsEarned: response === "pass" ? item.points : 0,
          notes: drafts[itemId]?.notes ?? "",
        });
      }
    });
  }

  function setNotes(itemId: string, notes: string) {
    setDrafts((prev) => ({ ...prev, [itemId]: { ...prev[itemId], itemId, notes, response: prev[itemId]?.response ?? null, photos: prev[itemId]?.photos ?? [] } }));
  }

  function handlePhotoClick(itemId: string) {
    setPhotoTarget(itemId);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!photoTarget || files.length === 0) return;
    const newPhotos: LocalPhoto[] = files.map((file) => ({
      localUrl: URL.createObjectURL(file),
      file,
      caption: "",
      uploaded: false,
      remoteUrl: null,
    }));
    setDrafts((prev) => ({
      ...prev,
      [photoTarget]: {
        ...prev[photoTarget],
        itemId: photoTarget,
        response: prev[photoTarget]?.response ?? null,
        notes: prev[photoTarget]?.notes ?? "",
        photos: [...(prev[photoTarget]?.photos ?? []), ...newPhotos],
      },
    }));
    e.target.value = "";
    setPhotoTarget(null);
  }

  function removePhoto(itemId: string, idx: number) {
    setDrafts((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], photos: prev[itemId].photos.filter((_, i) => i !== idx) },
    }));
  }

  async function handleStart() {
    setSetupError(null);
    if (!locationId || !auditorName) { setSetupError("Please select a location and enter your name."); return; }
    const result = await createAudit({ templateId: TEMPLATE.id, locationId, auditorName, auditType, scheduledDate: null });
    if ("error" in result) { setSetupError(result.error); return; }
    setAuditId(result.id);
    setStep("audit");
  }

  async function handleSubmit() {
    setSubmitting(true);
    const responses = allItems.map((item) => ({
      itemId:      item.id,
      response:    drafts[item.id]?.response ?? null,
      points:      item.points,
      maxPoints:   item.points,
      isCritical:  item.is_critical,
      notes:       drafts[item.id]?.notes ?? "",
    }));
    const id = auditId ?? "demo-audit";
    const result = await submitAudit({ auditId: id, responses, notes: auditNotes });
    if ("error" in result) { setSubmitting(false); return; }
    setSubmitted({ score: result.score, grade: result.grade });
  }

  // ─── Submitted State ──────────────────────────────────────────
  if (submitted) {
    const { g: sg, color: sc } = grade(submitted.score);
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className={`text-7xl font-black ${sc}`}>{sg}</div>
        <p className="text-3xl font-bold text-gray-900">{submitted.score}%</p>
        <p className="text-gray-500">Audit submitted successfully. Any failed items have been logged as findings.</p>
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => router.push("/dashboard/audits/findings")} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">View Findings</button>
          <button onClick={() => router.push("/dashboard/audits")} className="px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600">Back to Audits</button>
        </div>
      </div>
    );
  }

  // ─── Setup Step ───────────────────────────────────────────────
  if (step === "setup") {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <h2 className="text-lg font-bold text-gray-900">Set Up Audit</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-red-500">*</span></label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">Select location…</option>
              {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Auditor Name <span className="text-red-500">*</span></label>
            <input type="text" value={auditorName} onChange={(e) => setAuditorName(e.target.value)} placeholder="e.g. Marki" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Audit Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(["scheduled", "surprise"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setAuditType(t)} className={`py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${auditType === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  {t === "surprise" ? "⚡ Surprise" : "📅 Scheduled"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Template</label>
            <div className="border border-brand-200 bg-brand-50 rounded-lg px-4 py-3">
              <p className="text-sm font-medium text-brand-800">{TEMPLATE.name}</p>
              <p className="text-xs text-brand-600 mt-0.5">{TEMPLATE.audit_sections.length} sections · {allItems.length} items</p>
            </div>
          </div>
          {setupError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{setupError}</p>}
          <button onClick={handleStart} disabled={isPending} className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            {isPending ? <><Loader2 size={15} className="animate-spin" /> Starting…</> : "Start Audit →"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Audit Step ───────────────────────────────────────────────
  const section   = TEMPLATE.audit_sections[activeSection];
  const isLastSec = activeSection === TEMPLATE.audit_sections.length - 1;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <input ref={fileInputRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={handleFileChange} />

      {/* Sticky progress header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-800 text-sm">{LOCATIONS.find((l) => l.id === locationId)?.name} · {auditorName}</p>
            <p className="text-xs text-gray-400">{answered}/{allItems.length} items answered</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${color}`}>{g}</p>
            <p className="text-xs text-gray-400">{liveScore}% live</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${(answered / allItems.length) * 100}%` }} />
        </div>
        {/* Section pills */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-0.5">
          {TEMPLATE.audit_sections.map((s, i) => {
            const secItems = s.audit_items;
            const secDone  = secItems.filter((item) => drafts[item.id]?.response).length;
            return (
              <button key={s.id} onClick={() => setActiveSection(i)} className={`flex-shrink-0 text-xs px-3 py-1 rounded-full font-medium transition-colors ${i === activeSection ? "bg-brand-500 text-white" : secDone === secItems.length ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {s.title.split(" ")[0]} {secDone}/{secItems.length}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{section.title}</h2>
          {section.description && <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>}
        </div>

        <div className="divide-y divide-gray-50">
          {section.audit_items.map((item) => {
            const draft    = drafts[item.id];
            const response = draft?.response ?? null;
            return (
              <div key={item.id} className={`p-5 space-y-3 ${response === "fail" ? "bg-red-50/30" : response === "pass" ? "bg-green-50/20" : ""}`}>
                {/* Item header */}
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.is_critical && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full font-medium">
                          <AlertTriangle size={10} /> Critical
                        </span>
                      )}
                      {item.photo_required && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          <Camera size={10} /> Photo required
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{item.points} pts</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1 leading-snug">{item.text}</p>
                  </div>
                </div>

                {/* Pass / Fail / N/A */}
                <div className="flex gap-2">
                  {(["pass", "fail", "na"] as const).map((r) => {
                    const active = response === r;
                    const styles = {
                      pass: active ? "bg-green-500 text-white border-green-500" : "border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600",
                      fail: active ? "bg-red-500 text-white border-red-500"   : "border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-600",
                      na:   active ? "bg-gray-400 text-white border-gray-400" : "border-gray-200 text-gray-400 hover:border-gray-400",
                    };
                    const icons = { pass: CheckCircle2, fail: XCircle, na: MinusCircle };
                    const Icon = icons[r];
                    return (
                      <button key={r} onClick={() => setResponse(item.id, r)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${styles[r]}`}>
                        <Icon size={15} /> {r.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                {/* Notes */}
                {response && (
                  <textarea
                    rows={2}
                    placeholder={response === "fail" ? "Describe the issue (required for fails)…" : "Optional notes…"}
                    value={draft?.notes ?? ""}
                    onChange={(e) => setNotes(item.id, e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  />
                )}

                {/* Photos */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(draft?.photos ?? []).map((photo, idx) => (
                    <div key={idx} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo.localUrl} alt="Evidence" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                      <button onClick={() => removePhoto(item.id, idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => handlePhotoClick(item.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${item.photo_required && !draft?.photos?.length ? "border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    {(draft?.photos ?? []).length > 0 ? <><ImageIcon size={13} /> Add more</> : <><Camera size={13} /> {item.photo_required ? "Add photo (required)" : "Add photo"}</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-3">
        {activeSection > 0 && (
          <button onClick={() => setActiveSection((p) => p - 1)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">
            <ChevronUp size={15} /> Previous
          </button>
        )}
        {!isLastSec ? (
          <button onClick={() => setActiveSection((p) => p + 1)} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
            Next Section <ChevronDown size={15} />
          </button>
        ) : (
          <button onClick={() => setStep("review")} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
            <Star size={15} /> Review & Submit
          </button>
        )}
      </div>

      {/* Review Step overlay */}
      {step === "review" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6 space-y-5">
              <div className="text-center">
                <p className={`text-6xl font-black ${color}`}>{g}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{liveScore}%</p>
                <p className="text-sm text-gray-400 mt-1">{answered}/{allItems.length} items answered</p>
              </div>

              {/* Section breakdown */}
              <div className="space-y-2">
                {TEMPLATE.audit_sections.map((s) => {
                  const items   = s.audit_items;
                  const passed  = items.filter((i) => drafts[i.id]?.response === "pass").length;
                  const failed  = items.filter((i) => drafts[i.id]?.response === "fail").length;
                  const skipped = items.filter((i) => !drafts[i.id]?.response).length;
                  return (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{s.title}</span>
                      <div className="flex items-center gap-3 text-xs">
                        {passed  > 0 && <span className="text-green-600">{passed} pass</span>}
                        {failed  > 0 && <span className="text-red-600 font-semibold">{failed} fail</span>}
                        {skipped > 0 && <span className="text-gray-400">{skipped} skip</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Critical failures warning */}
              {allItems.filter((i) => i.is_critical && drafts[i.id]?.response === "fail").length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <Flag size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">
                    {allItems.filter((i) => i.is_critical && drafts[i.id]?.response === "fail").length} critical item{allItems.filter((i) => i.is_critical && drafts[i.id]?.response === "fail").length > 1 ? "s" : ""} failed — findings will be created automatically.
                  </p>
                </div>
              )}

              <textarea rows={3} placeholder="Any overall notes for this audit…" value={auditNotes} onChange={(e) => setAuditNotes(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />

              <div className="flex gap-3">
                <button onClick={() => setStep("audit")} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">← Edit</button>
                <button onClick={handleSubmit} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold">
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : <><Send size={15} /> Submit Audit</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
