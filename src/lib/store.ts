// Simple in-memory store for demo mode
// In production this is replaced by Supabase

export interface CampaignResult {
  email: string;
  name: string;
  token: string;
  trackingUrl: string;
  opened: boolean;
  clicked: boolean;
  reported: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  channel: string;
  status: string;
  results: CampaignResult[];
  created_at: string;
}

// Global store (persists while the server is running)
const globalStore = globalThis as unknown as {
  __campaigns?: Campaign[];
};

if (!globalStore.__campaigns) {
  globalStore.__campaigns = [];
}

export const campaignStore = {
  getAll(): Campaign[] {
    return globalStore.__campaigns || [];
  },

  add(campaign: Campaign) {
    globalStore.__campaigns = [campaign, ...(globalStore.__campaigns || [])];
  },

  findById(id: string): Campaign | undefined {
    return (globalStore.__campaigns || []).find((c) => c.id === id);
  },

  markClicked(token: string): boolean {
    for (const campaign of globalStore.__campaigns || []) {
      const result = campaign.results.find((r) => r.token === token);
      if (result) {
        result.clicked = true;
        return true;
      }
    }
    return false;
  },

  markReported(token: string): boolean {
    for (const campaign of globalStore.__campaigns || []) {
      const result = campaign.results.find((r) => r.token === token);
      if (result) {
        result.reported = true;
        return true;
      }
    }
    return false;
  },
};
