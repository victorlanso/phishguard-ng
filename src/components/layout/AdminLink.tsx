"use client";

import Link from "next/link";
import { Settings } from "lucide-react";

/**
 * Admin gear icon – always visible in the header.
 * In production with Supabase you can later hide it for non-admins.
 * For now it always shows so you can access the admin panel easily.
 */
export default function AdminLink() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 p-1.5 rounded-lg hover:bg-brand-50"
      title="Admin Panel"
    >
      <Settings className="w-5 h-5" />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  );
}
