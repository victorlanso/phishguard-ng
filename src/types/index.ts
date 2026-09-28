export type UserRole = "employee" | "champion" | "admin" | "super_admin";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  role: UserRole;
  points: number;
  org_id: string;
}

export interface Report {
  id: string;
  source: "email" | "whatsapp" | "sms" | "other";
  message_text: string;
  suspected_type: string;
  note?: string;
  screenshot_url?: string;
  status: "new" | "reviewing" | "resolved" | "false_positive";
  created_at: string;
  user_id: string;
}

export interface ContentItem {
  id: string;
  type: "tip" | "quiz";
  language: "en" | "pcm";
  title: string | null;
  body: string;
  options?: string[];
  correct_answer?: string;
  tags: string[];
}
