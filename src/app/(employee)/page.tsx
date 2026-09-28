import Link from "next/link";
import DailyTip from "@/components/learning/DailyTip";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck, BookOpen, Trophy } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold mb-1">Stay Safe Today</h1>
            <p className="text-brand-100 text-sm leading-relaxed">
              Spot phishing and BEC attempts. Report anything suspicious in seconds and build your security skills.
            </p>
          </div>
        </div>

        <Link href="/report" className="relative block mt-5">
          <Button
            size="lg"
            className="w-full bg-white text-brand-700 hover:bg-brand-50 font-semibold shadow-md"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Report Suspicious Message
          </Button>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/learn"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all"
        >
          <BookOpen className="w-5 h-5 text-brand-600 mb-2" />
          <div className="font-medium text-slate-900 text-sm">Learn</div>
          <div className="text-xs text-slate-500">Security modules</div>
        </Link>
        <Link
          href="/leaderboard"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:shadow-sm transition-all"
        >
          <Trophy className="w-5 h-5 text-amber-500 mb-2" />
          <div className="font-medium text-slate-900 text-sm">Leaderboard</div>
          <div className="text-xs text-slate-500">Top reporters</div>
        </Link>
      </div>

      {/* Daily Tip */}
      <DailyTip />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">3</div>
          <div className="text-xs text-slate-500 mt-0.5">Reports this week</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">12</div>
          <div className="text-xs text-slate-500 mt-0.5">Tips completed</div>
        </div>
      </div>
    </div>
  );
}
