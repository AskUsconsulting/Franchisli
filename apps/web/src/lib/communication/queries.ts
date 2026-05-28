import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AnnouncementWithDetails,
  MessageThreadWithMessages,
  BulletinPostWithLocation,
} from "@/types/communication";

export async function getAnnouncements(): Promise<AnnouncementWithDetails[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*, locations(id, name), announcement_reads(*)")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AnnouncementWithDetails[];
}

export async function getMessageThreads(): Promise<MessageThreadWithMessages[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("message_threads")
    .select("*, locations(id, name), thread_messages(*)")
    .order("last_message_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MessageThreadWithMessages[];
}

export async function getThreadById(id: string): Promise<MessageThreadWithMessages | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("message_threads")
    .select("*, locations(id, name), thread_messages(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as MessageThreadWithMessages;
}

export async function getBulletinPosts(): Promise<BulletinPostWithLocation[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bulletin_posts")
    .select("*, locations(id, name)")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as BulletinPostWithLocation[];
}
