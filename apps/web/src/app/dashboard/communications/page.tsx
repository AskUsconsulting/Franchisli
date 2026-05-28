"use client";

import { useState, useTransition } from "react";
import { Newspaper, Bell, Star, Clock, MapPin, Plus, Send, X } from "lucide-react";
import { createBulletinPost } from "@/actions/communication";
import type { BulletinPostWithLocation } from "@/types/communication";

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_POSTS: BulletinPostWithLocation[] = [
  { id: "bp1", author: "HQ", title: "June All-Hands Meeting — June 3 at 2pm", body: "All managers are invited to join the virtual all-hands on June 3 at 2:00pm ET. Agenda: Q2 results, summer prep, and team recognition. Zoom link emailed Monday.", post_type: "news", location_id: null, created_at: new Date(Date.now() - 1 * 86400000).toISOString(), locations: null },
  { id: "bp2", author: "HQ", title: "Urgent: Price Update Effective June 1", body: "Per the updated franchise pricing schedule, all combo prices increase by $0.25 starting June 1. Please update POS systems by May 31 EOD.", post_type: "alert", location_id: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString(), locations: null },
  { id: "bp3", author: "Marki", title: "🎉 Downtown Atlanta hits 97% — Outstanding!", body: "Congratulations to the Downtown Atlanta team for scoring 97% on their May audit — a new network high! Great work from the whole team.", post_type: "celebration", location_id: "a1", created_at: new Date(Date.now() - 7 * 86400000).toISOString(), locations: { id: "a1", name: "Downtown Atlanta" } },
  { id: "bp4", author: "HQ", title: "Reminder: Q1 Inventory Counts Due", body: "All locations must submit Q1 inventory count reports by May 31. Use the form in the Operations tab. Late submissions will affect your compliance score.", post_type: "reminder", location_id: null, created_at: new Date(Date.now() - 9 * 86400000).toISOString(), locations: null },
  { id: "bp5", author: "Third", title: "Marietta Expansion — Coming Fall 2026", body: "Excited to share that we are planning a second Marietta location for Fall 2026. More details at the June all-hands. Great things ahead!", post_type: "news", location_id: null, created_at: new Date(Date.now() - 11 * 86400000).toISOString(), locations: null },
  { id: "bp6", author: "HQ", title: "New Hire Orientation Materials Updated", body: "The new hire packet in the Documents library has been updated with the latest brand standards and safety protocols. Use for all new staff starting June 1.", post_type: "news", location_id: null, created_at: new Date(Date.now() - 14 * 86400000).toISOString(), locations: null },
] as unknown as BulletinPostWithLocation[];

// ── Helpers ───────────────────────────────────────────────────────────────────

const POST_TYPE_STYLES: Record<string, { icon: React.ElementType; bg: string; iconColor: string; border: string }> = {
  news:        { icon: Newspaper,  bg: "bg-blue-50",   iconColor: "text-blue-600",   border: "border-blue-100" },
  alert:       { icon: Bell,       bg: "bg-red-50",    iconColor: "text-red-600",    border: "border-red-100" },
  celebration: { icon: Star,       bg: "bg-yellow-50", iconColor: "text-yellow-600", border: "border-yellow-100" },
  reminder:    { icon: Clock,      bg: "bg-purple-50", iconColor: "text-purple-600", border: "border-purple-100" },
};

const POST_TYPE_LABELS: Record<string, string> = {
  news: "News", alert: "Alert", celebration: "Recognition", reminder: "Reminder",
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) {
    const hrs = Math.floor(diff / 3600000);
    if (hrs === 0) return "Just now";
    return `${hrs}h ago`;
  }
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

// ── Compose overlay ───────────────────────────────────────────────────────────

function ComposePost({ onClose, onPost }: { onClose: () => void; onPost: (p: BulletinPostWithLocation) => void }) {
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"news" | "alert" | "celebration" | "reminder">("news");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!body.trim()) return;
    startTransition(async () => {
      await createBulletinPost({ author: "HQ", title: title || null, body, postType: type, locationId: null });
      onPost({
        id: `tmp-${Date.now()}`, author: "HQ", title: title || null, body,
        post_type: type, location_id: null, created_at: new Date().toISOString(), locations: null,
      } as unknown as BulletinPostWithLocation);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">New Post</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>

        <div className="flex gap-2">
          {(["news", "alert", "celebration", "reminder"] as const).map((t) => {
            const style = POST_TYPE_STYLES[t];
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${type === t ? `${style.bg} ${style.iconColor} ring-1 ring-current` : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
              >
                {POST_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What would you like to share with the network?"
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
          <button
            onClick={submit}
            disabled={!body.trim() || isPending}
            className="px-4 py-2 text-sm text-white bg-brand-500 hover:bg-brand-600 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={14} /> {isPending ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommunicationsFeedPage() {
  const [posts, setPosts] = useState<BulletinPostWithLocation[]>(DEMO_POSTS);
  const [showCompose, setShowCompose] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const visible = filter === "all" ? posts : posts.filter((p) => p.post_type === filter);

  return (
    <>
      {showCompose && (
        <ComposePost
          onClose={() => setShowCompose(false)}
          onPost={(p) => setPosts((prev) => [p, ...prev])}
        />
      )}

      <div className="space-y-4">
        {/* Compose + filter bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["all", "news", "alert", "celebration", "reminder"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize transition-colors ${filter === f ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                {f === "all" ? "All" : POST_TYPE_LABELS[f]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg"
          >
            <Plus size={14} /> New Post
          </button>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {visible.map((post) => {
            const style = POST_TYPE_STYLES[post.post_type] ?? POST_TYPE_STYLES.news;
            const Icon = style.icon;
            return (
              <div key={post.id} className={`bg-white border ${style.border} rounded-xl p-5`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg}`}>
                    <Icon size={17} className={style.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.iconColor}`}>
                        {POST_TYPE_LABELS[post.post_type]}
                      </span>
                      <span className="text-xs font-medium text-gray-600">{post.author}</span>
                      {post.locations && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <MapPin size={10} /> {post.locations.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">{timeAgo(post.created_at)}</span>
                    </div>
                    {post.title && (
                      <p className="font-semibold text-gray-900 text-sm mb-1">{post.title}</p>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">{post.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Newspaper size={36} className="mx-auto mb-3 opacity-30" />
              <p>No posts match this filter</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
