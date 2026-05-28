export type AnnouncementPriority  = "normal" | "urgent";
export type AnnouncementTargetType = "all" | "specific";
export type PostType               = "news" | "alert" | "celebration" | "reminder";

export interface Announcement {
  id:                 string;
  title:              string;
  body:               string;
  author:             string;
  target_type:        AnnouncementTargetType;
  target_location_id: string | null;
  priority:           AnnouncementPriority;
  is_pinned:          boolean;
  created_at:         string;
}

export interface AnnouncementRead {
  id:              string;
  announcement_id: string;
  location_id:     string;
  read_by:         string;
  read_at:         string;
}

export interface MessageThread {
  id:              string;
  subject:         string;
  location_id:     string;
  last_message_at: string;
  created_at:      string;
}

export interface ThreadMessage {
  id:         string;
  thread_id:  string;
  sender:     string;
  body:       string;
  is_hq:      boolean;
  read_at:    string | null;
  created_at: string;
}

export interface BulletinPost {
  id:          string;
  author:      string;
  title:       string | null;
  body:        string;
  post_type:   PostType;
  location_id: string | null;
  created_at:  string;
}

// ── Enriched types ────────────────────────────────────────────────────────────

export interface AnnouncementWithDetails extends Announcement {
  locations?:           { id: string; name: string } | null;
  announcement_reads:   AnnouncementRead[];
}

export interface MessageThreadWithMessages extends MessageThread {
  locations:       { id: string; name: string };
  thread_messages: ThreadMessage[];
}

export interface BulletinPostWithLocation extends BulletinPost {
  locations?: { id: string; name: string } | null;
}
