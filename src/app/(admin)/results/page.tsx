"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MousePointerClick,
  ShieldCheck,
  Mail,
  AlertTriangle,
  TrendingUp,
  Users,
} from "lucide-react";

interface CampaignResult {
  email: string;
  name: string;
  token: string;
  trackingUrl: string;
  opened: boolean;
  clicked: boolean;
  reported: boolean;
}

interface Campaign {
  id: string;
  name: string;
  templateName: string;
  channel: string;
  status: string;
  created_at: string;
  results: CampaignResult[];
}

export default function ResultsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/campaigns");
        const json = await res.json();
        setCampaigns(json.data || []);
        if (json.data?.length > 0) {
          setSelectedId(json.data[0].id);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selected = campaigns.find((c) => c.id === selectedId);

  // Aggregate stats across all campaigns
  const totals = campaigns.reduce(
    (acc, c) => {
      const results = c.results || [];
      acc.sent += results.length;
      acc.clicked += results.filter((r) => r.clicked).length;
      acc.reported += results.filter((r) => r.reported).length;
      acc.opened += results.filter((r) => r.opened).length;
      return acc;
    },
    { sent: 0, opened: 0, clicked: 0, reported: 0 }
  );

  const clickRate =
    totals.sent > 0 ? Math.round((totals.clicked / totals.sent) * 100) : 0;
  const reportRate =
    totals.sent > 0 ? Math.round((totals.reported / totals.sent) * 100) : 0;

  if (loading) {
    return <p className="text-slate-500">Loading results...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Campaign Results</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          See how users interacted with your simulations
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Mail className="w-5 h-5" />}
          label="Total Sent"
          value={totals.sent}
          color="text-slate-900"
        />
        <StatCard
          icon={<MousePointerClick className="w-5 h-5" />}
          label="Clicked"
          value={`${totals.clicked} (${clickRate}%)`}
          color="text-amber-600"
        />
        <StatCard
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Reported"
          value={`${totals.reported} (${reportRate}%)`}
          color="text-green-600"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Campaigns"
          value={campaigns.length}
          color="text-brand-600"
        />
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No campaigns yet.</p>
          <p className="text-sm text-slate-400 mt-1">
            Create and launch a campaign to see results here.
          </p>
          <a href="/campaigns">
            <Button className="mt-4">Go to Campaigns</Button>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign list */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Campaigns
            </h2>
            {campaigns.map((c) => {
              const clicked = c.results?.filter((r) => r.clicked).length || 0;
              const total = c.results?.length || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedId === c.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="font-medium text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {c.templateName} · {clicked}/{total} clicked
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected campaign detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  {selected.name}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  {selected.templateName} · {selected.channel} ·{" "}
                  {new Date(selected.created_at).toLocaleString()}
                </p>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-slate-900">
                      {selected.results?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500">Sent</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-amber-600">
                      {selected.results?.filter((r) => r.clicked).length || 0}
                    </div>
                    <div className="text-xs text-slate-500">Clicked</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-600">
                      {selected.results?.filter((r) => r.reported).length || 0}
                    </div>
                    <div className="text-xs text-slate-500">Reported</div>
                  </div>
                </div>

                {/* Per-user results */}
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Individual Results
                </h3>
                <div className="space-y-2">
                  {(selected.results || []).map((r) => (
                    <div
                      key={r.token}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 text-sm">
                          {r.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {r.email}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge
                          active={r.clicked}
                          label="Clicked"
                          activeColor="bg-amber-100 text-amber-700"
                        />
                        <StatusBadge
                          active={r.reported}
                          label="Reported"
                          activeColor="bg-green-100 text-green-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insight */}
                <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-600">
                      {clickRate > 30 ? (
                        <>
                          <strong>High click rate ({clickRate}%)</strong> —
                          consider more training on this type of threat.
                        </>
                      ) : clickRate > 0 ? (
                        <>
                          <strong>Moderate click rate ({clickRate}%)</strong> —
                          keep running regular simulations.
                        </>
                      ) : (
                        <>
                          No clicks recorded yet. Share the tracking links or
                          launch the campaign to collect data.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                Select a campaign to view results
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function StatusBadge({
  active,
  label,
  activeColor,
}: {
  active: boolean;
  label: string;
  activeColor: string;
}) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        active ? activeColor : "bg-slate-100 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}
