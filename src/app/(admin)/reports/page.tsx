"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Report {
  id: string;
  source: string;
  message_text: string;
  suspected_type: string;
  note?: string;
  status: string;
  created_at: string;
  user_id: string;
}

const statusColors: Record<string, string> = {
  new: "bg-red-100 text-red-700",
  reviewing: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  false_positive: "bg-slate-100 text-slate-600",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchReports = async () => {
    try {
      const url =
        filter === "all" ? "/api/reports" : `/api/reports?status=${filter}`;
      const res = await fetch(url);
      const json = await res.json();
      setReports(json.data || []);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success("Status updated");
      fetchReports();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <div className="flex gap-2">
          {["all", "new", "reviewing", "resolved"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
                filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading reports...</p>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">No reports found.</p>
          <p className="text-sm text-slate-400 mt-1">
            Reports submitted by employees will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        statusColors[report.status] || statusColors.new
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      {report.source} · {report.suspected_type}
                    </span>
                  </div>
                  <p className="text-slate-800 text-sm line-clamp-2">
                    {report.message_text}
                  </p>
                  {report.note && (
                    <p className="text-xs text-slate-500 mt-1">
                      Note: {report.note}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  {report.status === "new" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(report.id, "reviewing")}
                    >
                      Review
                    </Button>
                  )}
                  {report.status !== "resolved" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(report.id, "resolved")}
                    >
                      Resolve
                    </Button>
                  )}
                  {report.status !== "false_positive" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateStatus(report.id, "false_positive")
                      }
                    >
                      False +
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
