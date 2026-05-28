"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Send, Plus, MapPin } from "lucide-react";
import { replyToThread } from "@/actions/communication";
import type { MessageThreadWithMessages } from "@/types/communication";

// ── Demo data ──────────────────────────────────────────────────────────────────

const DEMO_THREADS: MessageThreadWithMessages[] = [
  {
    id: "t1", subject: "Critical Findings — Immediate Action Required",
    location_id: "a4", last_message_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    locations: { id: "a4", name: "Decatur" },
    thread_messages: [
      { id: "m1", thread_id: "t1", sender: "HQ", body: "Hi Decatur team, we've reviewed the audit findings and need immediate corrective action on the two critical failures. Please submit your action plan by May 22.", is_hq: true, read_at: null, created_at: new Date(Date.now() - 13 * 86400000).toISOString() },
      { id: "m2", thread_id: "t1", sender: "Decatur Manager", body: "Understood. We've already restocked the handwashing stations and ordered new temperature log sheets. Will submit full plan tomorrow.", is_hq: false, read_at: null, created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
      { id: "m3", thread_id: "t1", sender: "HQ", body: "Thanks for the quick response. Please also schedule a deep clean for the kitchen equipment by end of week.", is_hq: true, read_at: null, created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
    ],
  },
  {
    id: "t2", subject: "Summer Menu Prep Questions",
    location_id: "a2", last_message_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    locations: { id: "a2", name: "Buckhead" },
    thread_messages: [
      { id: "m4", thread_id: "t2", sender: "HQ", body: "Hey Buckhead, wanted to check in on your summer menu prep. Do you have enough stock ordered for the new items?", is_hq: true, read_at: null, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: "m5", thread_id: "t2", sender: "Buckhead Manager", body: "We've got everything except the peach syrup — vendor says it's backordered until June 10. Can we substitute lemonade items until then?", is_hq: false, read_at: null, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
    ],
  },
  {
    id: "t3", subject: "Equipment Maintenance Request — Fryer",
    location_id: "a5", last_message_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    locations: { id: "a5", name: "Marietta" },
    thread_messages: [
      { id: "m6", thread_id: "t3", sender: "Marietta Manager", body: "Hi HQ, our #2 fryer has been running hot and we think it needs servicing before summer rush. Can we get a maintenance tech out this week?", is_hq: false, read_at: null, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: "m7", thread_id: "t3", sender: "HQ", body: "On it. I've contacted our service partner — they can be there Thursday morning. Please have the fryer cool and accessible by 9am.", is_hq: true, read_at: null, created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
  },
] as unknown as MessageThreadWithMessages[];

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) { const hrs = Math.floor(diff / 3600000); return hrs === 0 ? "Just now" : `${hrs}h ago`; }
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThreadWithMessages[]>(DEMO_THREADS);
  const [selected, setSelected] = useState<string>(DEMO_THREADS[0].id);
  const [reply, setReply]       = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = threads.find((t) => t.id === selected)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected, thread?.thread_messages.length]);

  function sendReply() {
    if (!reply.trim()) return;
    const msg = { id: `tmp-${Date.now()}`, thread_id: selected, sender: "HQ", body: reply, is_hq: true, read_at: null, created_at: new Date().toISOString() };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selected
          ? { ...t, thread_messages: [...t.thread_messages, msg], last_message_at: new Date().toISOString() }
          : t
      )
    );
    const text = reply;
    setReply("");
    startTransition(async () => {
      await replyToThread({ threadId: selected, sender: "HQ", body: text, isHq: true });
    });
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px]">
      {/* Thread list */}
      <div className="w-72 shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="font-semibold text-gray-800 text-sm">Threads</p>
          <Link
            href="/dashboard/communications/messages/new"
            className="w-7 h-7 bg-brand-50 hover:bg-brand-100 rounded-lg flex items-center justify-center text-brand-600"
          >
            <Plus size={14} />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {threads.map((t) => {
            const last = t.thread_messages[t.thread_messages.length - 1];
            const unread = t.thread_messages.filter((m) => !m.is_hq && !m.read_at).length;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected === t.id ? "bg-brand-50 border-r-2 border-brand-500" : ""}`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-gray-700 truncate flex-1 pr-2">{t.subject}</span>
                  {unread > 0 && (
                    <span className="shrink-0 bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{unread}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <MapPin size={9} /> {t.locations.name}
                </p>
                {last && <p className="text-xs text-gray-400 truncate">{last.body}</p>}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(t.last_message_at)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message panel */}
      {thread && (
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">{thread.subject}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {thread.locations.name} · {thread.thread_messages.length} messages
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {thread.thread_messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_hq ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.is_hq ? "bg-brand-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  <p className={`text-xs font-semibold mb-0.5 ${msg.is_hq ? "text-brand-100" : "text-gray-500"}`}>{msg.sender}</p>
                  <p className="text-sm leading-relaxed">{msg.body}</p>
                  <p className={`text-xs mt-1 ${msg.is_hq ? "text-brand-200" : "text-gray-400"}`}>{timeAgo(msg.created_at)}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          <div className="border-t border-gray-100 p-4 flex gap-3 items-end">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder="Reply as HQ… (Enter to send)"
              rows={2}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim() || isPending}
              className="w-10 h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {!thread && (
        <div className="flex-1 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
          <div className="text-center">
            <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
            <p>Select a thread to view messages</p>
          </div>
        </div>
      )}
    </div>
  );
}
