"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Send, ExternalLink, Copy, RefreshCw } from "lucide-react";

const SAMPLE_TEMPLATES = [
  {
    id: "t1",
    name: "Fake FIRS Tax Demand",
    channel: "email",
    difficulty: "medium",
    subject: "Urgent: Outstanding Tax Liability – Action Required",
  },
  {
    id: "t2",
    name: "CEO Fraud / BEC Payment Request",
    channel: "email",
    difficulty: "hard",
    subject: "Urgent Payment Request – Confidential",
  },
  {
    id: "t3",
    name: "WhatsApp Boss Transfer Scam",
    channel: "whatsapp",
    difficulty: "easy",
    subject: null,
  },
  {
    id: "t4",
    name: "Fake Bank Account Restriction",
    channel: "sms",
    difficulty: "medium",
    subject: null,
  },
];

export default function CampaignsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns");
      if (!res.ok) {
        throw new Error(`Failed to load campaigns (${res.status})`);
      }
      const json = await res.json();
      setCampaigns(json.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateId) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const template = SAMPLE_TEMPLATES.find((t) => t.id === templateId);

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          templateId,
          templateName: template?.name,
          channel: template?.channel,
          subject: template?.subject,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create");

      toast.success("Campaign created!");
      setShowCreate(false);
      setName("");
      setTemplateId("");
      await fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (campaignId: string) => {
    setLaunchingId(campaignId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Launch failed");

      if (data.mode === "demo") {
        toast.success("Launched in DEMO mode – use the tracking links below");
      } else {
        toast.success(data.message || "Campaign launched!");
      }

      await fetchCampaigns();
    } catch (err: any) {
      toast.error(err.message || "Failed to launch");
    } finally {
      setLaunchingId(null);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Tracking link copied!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create and launch phishing simulations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCampaigns}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Campaign
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
          <button
            onClick={fetchCampaigns}
            className="ml-2 underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {showCreate && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Create Campaign</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="name">Campaign Name</Label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. September BEC Awareness"
                className="mt-1.5 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="template">Template</Label>
              <select
                id="template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="mt-1.5 w-full h-11 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              >
                <option value="">Select a template...</option>
                {SAMPLE_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.channel} · {t.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Campaign"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {fetching ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500">
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">
              No campaigns yet. Click <strong>New Campaign</strong> above to
              create your first simulation.
            </p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {campaign.templateName} · {campaign.channel} ·{" "}
                    {new Date(campaign.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleLaunch(campaign.id)}
                  disabled={launchingId === campaign.id}
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  {launchingId === campaign.id ? "Launching..." : "Launch"}
                </Button>
              </div>

              {campaign.results?.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Tracking Links (click to test):
                  </p>
                  <div className="space-y-1.5">
                    {campaign.results.map((r: any) => (
                      <div
                        key={r.token}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="text-slate-600 w-28 truncate shrink-0">
                          {r.name}
                        </span>
                        <code className="flex-1 text-xs bg-slate-50 px-2 py-1 rounded truncate">
                          {r.trackingUrl}
                        </code>
                        <button
                          onClick={() => copyLink(r.trackingUrl)}
                          className="p-1.5 hover:bg-slate-100 rounded"
                          title="Copy link"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                        <a
                          href={r.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 hover:bg-slate-100 rounded"
                          title="Open simulation page"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-lg mb-3">Template Library</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="font-medium text-slate-900">{t.name}</div>
              <div className="text-xs text-slate-500 mt-1 capitalize">
                {t.channel} · {t.difficulty}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
