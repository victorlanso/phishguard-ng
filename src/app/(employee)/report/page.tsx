import ReportForm from "@/components/report/ReportForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Report Suspicious</h1>
          <p className="text-sm text-slate-500">
            Help protect the organisation
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        Your report is confidential and only visible to the security team.
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <ReportForm />
      </div>
    </div>
  );
}
