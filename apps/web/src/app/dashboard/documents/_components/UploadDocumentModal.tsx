"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, Loader2, FileText, X } from "lucide-react";
import Modal from "@/components/Modal";
import { createClient } from "@/lib/supabase/client";
import { createDocument } from "@/actions/documents";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: null,  name: "Uncategorized" },
  { id: "ops", name: "Operations" },
  { id: "fs",  name: "Food Safety" },
  { id: "hr",  name: "HR & Staff" },
  { id: "br",  name: "Brand" },
  { id: "em",  name: "Emergency" },
];

const DOC_TYPES = ["sop", "policy", "guide", "form", "template"] as const;

export default function UploadDocumentModal() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open,      setOpen]      = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");
  const [file,      setFile]      = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", version: "1.0", docType: "sop", categoryId: "",
  });

  function setF(k: string, v: string) { setForm(p => ({ ...p, [k]: v })); }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!form.title) setF("title", f.name.replace(/\.[^.]+$/, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file to upload."); return; }
    setSaving(true); setError("");

    try {
      const supabase = createClient();
      const ext  = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) throw new Error(uploadErr.message);

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(path);

      // Save to DB
      const result = await createDocument({
        title:                  form.title,
        description:            form.description,
        categoryId:             form.categoryId || null,
        docType:                form.docType as never,
        content:                null,
        fileUrl:                publicUrl,
        version:                form.version,
        requiresAcknowledgment: false,
        createdBy:              "Owner",
      });

      if ("error" in result) throw new Error(result.error);

      setDone(true);
      router.refresh();
      setTimeout(() => { setDone(false); setOpen(false); setFile(null); setForm({ title: "", description: "", version: "1.0", docType: "sop", categoryId: "" }); }, 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors shadow-sm">
        <Upload size={16} /> Upload Document
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Upload Document">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-brand-400 hover:bg-gray-50"}`}
          >
            <input ref={fileRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.png,.jpg"
              onChange={handleFile} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={20} className="text-brand-600" />
                <span className="text-sm font-medium text-brand-700">{file.name}</span>
                <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                  className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">Click to upload <span className="text-brand-600 font-medium">PDF, Word, Excel</span></p>
                <p className="text-xs text-gray-400 mt-1">Max 50MB</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title <span className="text-red-500">*</span></label>
            <input required type="text" value={form.title} onChange={e => setF("title", e.target.value)}
              placeholder="e.g. Opening Procedures Checklist"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={e => setF("description", e.target.value)}
              placeholder="What is this document about?"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Type</label>
              <select value={form.docType} onChange={e => setF("docType", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 bg-white capitalize">
                {DOC_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category</label>
              <select value={form.categoryId} onChange={e => setF("categoryId", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 bg-white">
                {CATEGORIES.map(c => <option key={c.name} value={c.id ?? ""}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Version</label>
              <input type="text" value={form.version} onChange={e => setF("version", e.target.value)}
                placeholder="1.0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10" />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button type="submit" disabled={saving || done}
            className={`w-full font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${done ? "bg-green-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-70"}`}>
            {done ? <><CheckCircle2 size={15} /> Uploaded!</> : saving ? <><Loader2 size={15} className="animate-spin" /> Uploading...</> : <><Upload size={15} /> Upload Document</>}
          </button>
        </form>
      </Modal>
    </>
  );
}
