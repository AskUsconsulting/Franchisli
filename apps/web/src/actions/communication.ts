"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// ── Announcements ─────────────────────────────────────────────────────────────

export async function createAnnouncement(data: {
  title:            string;
  body:             string;
  author:           string;
  targetType:       "all" | "specific";
  targetLocationId: string | null;
  priority:         "normal" | "urgent";
  isPinned:         boolean;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("announcements")
    .insert({
      title:              data.title,
      body:               data.body,
      author:             data.author,
      target_type:        data.targetType,
      target_location_id: data.targetLocationId,
      priority:           data.priority,
      is_pinned:          data.isPinned,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard/communications");
  revalidatePath("/dashboard/communications/announcements");
  return { id: row.id };
}

export async function markAnnouncementRead(data: {
  announcementId: string;
  locationId:     string;
  readBy:         string;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("announcement_reads").upsert({
    announcement_id: data.announcementId,
    location_id:     data.locationId,
    read_by:         data.readBy,
    read_at:         new Date().toISOString(),
  }, { onConflict: "announcement_id,location_id" });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/communications/announcements");
  return {};
}

export async function togglePinAnnouncement(data: {
  announcementId: string;
  pinned:         boolean;
}): Promise<{ error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("announcements")
    .update({ is_pinned: data.pinned })
    .eq("id", data.announcementId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/communications/announcements");
  return {};
}

// ── Message Threads ───────────────────────────────────────────────────────────

export async function createThread(data: {
  subject:    string;
  locationId: string;
  body:       string;
  sender:     string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: thread, error: threadError } = await supabase
    .from("message_threads")
    .insert({ subject: data.subject, location_id: data.locationId })
    .select()
    .single();
  if (threadError) return { error: threadError.message };

  await supabase.from("thread_messages").insert({
    thread_id: thread.id,
    sender:    data.sender,
    body:      data.body,
    is_hq:     true,
  });

  revalidatePath("/dashboard/communications/messages");
  return { id: thread.id };
}

export async function replyToThread(data: {
  threadId: string;
  sender:   string;
  body:     string;
  isHq:     boolean;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: msg, error } = await supabase
    .from("thread_messages")
    .insert({
      thread_id: data.threadId,
      sender:    data.sender,
      body:      data.body,
      is_hq:     data.isHq,
    })
    .select()
    .single();
  if (error) return { error: error.message };

  await supabase
    .from("message_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", data.threadId);

  revalidatePath("/dashboard/communications/messages");
  return { id: msg.id };
}

// ── Bulletin posts ────────────────────────────────────────────────────────────

export async function createBulletinPost(data: {
  author:     string;
  title:      string | null;
  body:       string;
  postType:   "news" | "alert" | "celebration" | "reminder";
  locationId: string | null;
}): Promise<{ id: string } | { error: string }> {
  const supabase = createAdminClient();
  const { data: post, error } = await supabase
    .from("bulletin_posts")
    .insert({
      author:      data.author,
      title:       data.title,
      body:        data.body,
      post_type:   data.postType,
      location_id: data.locationId,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/dashboard/communications");
  return { id: post.id };
}
